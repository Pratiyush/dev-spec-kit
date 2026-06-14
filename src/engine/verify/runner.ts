import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CheckBinding } from "../spec/ears.js";
import type { CheckResult } from "../graph/types.js";
import { gitHead, gitTreeHash, isDirty } from "../git.js";
import {
  escapeTestNamePattern,
  interpretCheckRun,
  parseTestReport,
  reportArgs,
  type Reporter,
} from "./report.js";

/**
 * The verification runner — executes bound checks and captures REAL exit codes.
 *
 * This is the half of the moat that makes proof states trustworthy: a check result comes from a
 * process exit code, never from a model's claim. Polyglot by shelling out to the stack's own runner.
 */

export type Stack = "java-maven" | "node-vitest" | "node-jest" | "python-pytest";
export const BUILTIN_STACKS: readonly Stack[] = ["java-maven", "node-vitest", "node-jest", "python-pytest"];

export interface ResolvedCommand {
  cmd: string;
  args: string[];
  env?: Record<string, string>;
  /**
   * When set, this is a JS test runner that emits a jest-shaped JSON report. `execute` adds the
   * report flags, then derives the verdict from the report (so a zero-match is a FAILURE, never the
   * exit-0 silent pass). Unset for maven/pytest/custom overrides, which keep exit-code semantics.
   */
  reporter?: Reporter;
}

/** A config-supplied runner: new stacks are pure input, never code changes. */
export interface RunnerOverride {
  cmd: string;
  args: string[];
}

/**
 * FEAT-STACK-01 — `--stack` is optional; this is the resolution chain. Inference maps the
 * project's declared platforms to a builtin stack (node-ish platforms check package.json to pick
 * vitest vs jest). Pure + testable; the CLI prints a 🧭 notice for anything not explicit.
 */
export interface StackResolution {
  stack: string;
  source: "flag" | "config" | "inferred";
  reason?: string;
}

const NODE_PLATFORMS = ["typescript", "node", "react", "next", "angular", "electron"];
const MAVEN_PLATFORMS = ["java-maven", "spring", "quarkus"];

export function resolveStack(
  explicit: string | undefined,
  config: { verify: { defaultStack?: string | undefined }; project: { platforms: string[] } },
  cwd: string,
): StackResolution {
  if (explicit) return { stack: explicit, source: "flag" };
  if (config.verify.defaultStack) return { stack: config.verify.defaultStack, source: "config" };
  const platforms = config.project.platforms;
  const reason = `from platforms: ${platforms.join(", ")}`;
  if (platforms.some((p) => NODE_PLATFORMS.includes(p))) {
    const stack = hasDep(cwd, "jest") && !hasDep(cwd, "vitest") ? "node-jest" : "node-vitest";
    return { stack, source: "inferred", reason };
  }
  if (platforms.includes("python")) return { stack: "python-pytest", source: "inferred", reason };
  if (platforms.some((p) => MAVEN_PLATFORMS.includes(p)))
    return { stack: "java-maven", source: "inferred", reason };
  throw new Error(
    "no stack resolved — pass --stack <stack>, set verify.defaultStack in .rivet/config.json, or declare project.platforms so it can be inferred",
  );
}

function hasDep(cwd: string, name: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  } catch {
    return false;
  }
}

/**
 * RUNNERS-01 precedence: a kind-level template (visual/parity/...) beats the stack template,
 * which beats the builtin mapping. Pure selection — testable, and the CLI just applies it.
 */
export function pickRunner(
  config: {
    verify: { kindRunners: Record<string, RunnerOverride>; runners: Record<string, RunnerOverride> };
  },
  kind: string,
  stack: string,
): { override?: RunnerOverride; source: "kind" | "stack" | "builtin" } {
  const byKind = config.verify.kindRunners[kind];
  if (byKind) return { override: byKind, source: "kind" };
  const byStack = config.verify.runners[stack];
  if (byStack) return { override: byStack, source: "stack" };
  return { source: "builtin" };
}

/**
 * Map a check binding to the concrete test-runner invocation for a stack.
 * Refs use the runner's own selector syntax:
 *  - java-maven:    "ClassName#method"  -> mvn -B test -Dtest=ClassName#method
 *  - node-vitest:   "file::name"        -> vitest run file --testNamePattern=<escaped name>
 *  - node-jest:     "file::name"        -> jest file --testNamePattern=<escaped name>
 *  - python-pytest: "file::test"        -> python3 -m pytest file::test
 * The name goes through `--testNamePattern=<value>` (equals form, never `-t <value>`): the equals
 * form stops the CLI parser reading a leading `-` as an option (the old CACError), and the value is
 * regex-escaped so metacharacters match literally. node runners also carry `reporter` so `execute`
 * can reject a zero-match instead of trusting the exit code.
 * An override (from `.rivet/config.json` verify.runners) replaces or defines a stack; its args may
 * use {ref}, {file}, {name} placeholders — args referencing {name} are dropped when the ref has no
 * `::name` part.
 */
export function resolveCommand(
  binding: CheckBinding,
  stack: string,
  override?: RunnerOverride,
): ResolvedCommand {
  if (override) {
    const [file, name] = splitRef(binding.ref);
    const args = override.args
      .filter((a) => !(a.includes("{name}") && name === undefined))
      .map((a) =>
        a
          .replaceAll("{ref}", binding.ref)
          .replaceAll("{file}", file)
          .replaceAll("{name}", name ?? ""),
      );
    return { cmd: override.cmd, args };
  }
  if (!BUILTIN_STACKS.includes(stack as Stack)) {
    throw new Error(
      `unknown stack '${stack}' — built-ins: ${BUILTIN_STACKS.join(", ")}; or define it in config verify.runners`,
    );
  }
  switch (stack as Stack) {
    case "java-maven": {
      const env: Record<string, string> = {};
      // macOS Homebrew installs OpenJDK keg-only; honor an explicit JAVA_HOME, else use the keg path.
      if (!process.env.JAVA_HOME) env.JAVA_HOME = "/opt/homebrew/opt/openjdk";
      return { cmd: "mvn", args: ["-B", "test", `-Dtest=${binding.ref}`], env };
    }
    case "node-vitest": {
      const [file, name] = splitRef(binding.ref);
      const sel = name ? [`--testNamePattern=${escapeTestNamePattern(name)}`] : [];
      return { cmd: "npx", args: ["vitest", "run", file, ...sel], reporter: "vitest" };
    }
    case "node-jest": {
      const [file, name] = splitRef(binding.ref);
      const sel = name ? [`--testNamePattern=${escapeTestNamePattern(name)}`] : [];
      return { cmd: "npx", args: ["jest", file, ...sel], reporter: "jest" };
    }
    case "python-pytest":
      return { cmd: "python3", args: ["-m", "pytest", binding.ref, "-q"] };
  }
}

function splitRef(ref: string): [string, string | undefined] {
  const idx = ref.indexOf("::");
  if (idx === -1) return [ref, undefined];
  return [ref.slice(0, idx), ref.slice(idx + 2)];
}

export interface RunOptions {
  cwd: string;
  /** Hard timeout per check; a hung test is a failing test. */
  timeoutMs?: number;
  /** Commit SHA to stamp the proof with (defaults to `git rev-parse HEAD` of cwd). */
  sha?: string;
}

/** A runner that could not execute at all — a tooling problem, NEVER recorded as a proof. */
export class RunnerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunnerUnavailableError";
  }
}

/** Execute a resolved command and convert its result into a CheckResult (the proof). */
export function execute(binding: CheckBinding, resolved: ResolvedCommand, opts: RunOptions): CheckResult {
  // FIX-TRUST-01: a JS runner gets a JSON report so the verdict comes from what actually executed,
  // not the exit code (vitest/jest exit 0 on a zero-match `--testNamePattern`). The report lands in
  // a throwaway temp dir, removed in `finally` so it never touches the working tree / proof hash.
  let reportDir: string | undefined;
  let reportPath: string | undefined;
  let args = resolved.args;
  if (resolved.reporter) {
    reportDir = mkdtempSync(join(tmpdir(), "rivet-check-"));
    reportPath = join(reportDir, "report.json");
    args = [...resolved.args, ...reportArgs(resolved.reporter, reportPath)];
  }
  try {
    const res = spawnSync(resolved.cmd, args, {
      cwd: opts.cwd,
      timeout: opts.timeoutMs ?? 10 * 60 * 1000,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...resolved.env },
    });
    // FIX-ROBUST-01: a missing/unspawnable runner is an infra error, not a red proof. A TIMEOUT,
    // by contrast, means the test ran and hung — a hung test IS a failing test.
    const timedOut = (res.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT";
    if (!timedOut && (res.error || res.status === null)) {
      throw new RunnerUnavailableError(
        `cannot execute '${resolved.cmd}': ${res.error?.message ?? `terminated by ${res.signal ?? "unknown signal"}`} — fix the tooling; nothing was recorded`,
      );
    }
    const exit = res.status ?? 1;
    let passed = exit === 0;
    let reason: string | undefined;
    if (resolved.reporter) {
      // The report is the source of truth for a JS runner. If it's unreadable we CANNOT confirm a
      // green (an exit 0 might be a zero-match); refuse rather than mint a vacuous proof.
      let raw: string;
      try {
        raw = readFileSync(reportPath as string, "utf8");
        /* c8 ignore start -- guards a MISBEHAVING JS runner (exits 0 but writes no JSON report);
           needs a real vitest/jest that lies, so not reproducible in a unit test. */
      } catch {
        if (passed)
          throw new RunnerUnavailableError(
            `'${resolved.cmd}' wrote no JSON report — cannot confirm what ran; nothing was recorded`,
          );
        raw = "";
      }
      /* c8 ignore stop */
      if (raw) {
        const verdict = interpretCheckRun(parseTestReport(raw), exit);
        passed = verdict.passed;
        reason = verdict.reason;
      }
    }
    // SCALE-01: a red proof carries its own diagnostic — the reason plus the truncated output tail.
    let tail: string | undefined;
    if (!passed) {
      const combined = `${res.stdout?.toString() ?? ""}\n${res.stderr?.toString() ?? ""}`.trim();
      tail = [reason, combined].filter(Boolean).join("\n").slice(-1500) || undefined;
    }
    // Proof identity = the content actually tested (tree hash), not just whatever HEAD was.
    const tree = gitTreeHash(opts.cwd);
    return {
      ref: binding.ref,
      passed,
      at: new Date().toISOString(),
      sha: opts.sha ?? gitHead(opts.cwd),
      ...(tree ? { tree } : {}),
      dirty: isDirty(opts.cwd),
      // FIX-KIND-01: the proof self-describes its kind, so an executed proof is never confused with a
      // judge verdict downstream (judge always sets kind="judge"; executed checks must too).
      ...(binding.kind ? { kind: binding.kind } : {}),
      ...(tail ? { tail } : {}),
    };
  } finally {
    if (reportDir) rmSync(reportDir, { recursive: true, force: true });
  }
}

/** Resolve + execute in one step. */
export function runCheck(
  binding: CheckBinding,
  stack: string,
  opts: RunOptions,
  override?: RunnerOverride,
): CheckResult {
  return execute(binding, resolveCommand(binding, stack, override), opts);
}
