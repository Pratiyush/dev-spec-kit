import { spawnSync } from "node:child_process";
import type { CheckBinding } from "../spec/ears.js";
import type { CheckResult } from "../graph/types.js";
import { gitHead, gitTreeHash, isDirty } from "../git.js";

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
}

/** A config-supplied runner: new stacks are pure input, never code changes. */
export interface RunnerOverride {
  cmd: string;
  args: string[];
}

/**
 * Map a check binding to the concrete test-runner invocation for a stack.
 * Refs use the runner's own selector syntax:
 *  - java-maven:    "ClassName#method"  -> mvn -B test -Dtest=ClassName#method
 *  - node-vitest:   "file::name"        -> vitest run file -t name
 *  - node-jest:     "file::name"        -> jest file -t name
 *  - python-pytest: "file::test"        -> python3 -m pytest file::test
 * An override (from `.rivet/config.json` verify.runners) replaces or defines a stack; its args may
 * use {ref}, {file}, {name} placeholders — args referencing {name} are dropped when the ref has no
 * `::name` part.
 */
export function resolveCommand(binding: CheckBinding, stack: string, override?: RunnerOverride): ResolvedCommand {
  if (override) {
    const [file, name] = splitRef(binding.ref);
    const args = override.args
      .filter((a) => !(a.includes("{name}") && name === undefined))
      .map((a) => a.replaceAll("{ref}", binding.ref).replaceAll("{file}", file).replaceAll("{name}", name ?? ""));
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
      return { cmd: "npx", args: ["vitest", "run", file, ...(name ? ["-t", name] : [])] };
    }
    case "node-jest": {
      const [file, name] = splitRef(binding.ref);
      return { cmd: "npx", args: ["jest", file, ...(name ? ["-t", name] : [])] };
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

/** Execute a resolved command and convert its exit code into a CheckResult (the proof). */
export function execute(binding: CheckBinding, resolved: ResolvedCommand, opts: RunOptions): CheckResult {
  const res = spawnSync(resolved.cmd, resolved.args, {
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
  const passed = res.status === 0;
  // SCALE-01: a red proof carries its own diagnostic — the truncated output tail.
  let tail: string | undefined;
  if (!passed) {
    const combined = `${res.stdout?.toString() ?? ""}\n${res.stderr?.toString() ?? ""}`.trim();
    if (combined) tail = combined.slice(-1500);
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
    ...(tail ? { tail } : {}),
  };
}

/** Resolve + execute in one step. */
export function runCheck(binding: CheckBinding, stack: string, opts: RunOptions, override?: RunnerOverride): CheckResult {
  return execute(binding, resolveCommand(binding, stack, override), opts);
}
