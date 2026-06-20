import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DevSpecKitConfig } from "../../config/schema.js";
import { resolveStack, type RunnerOverride } from "./runner.js";
import { reportArgs, type Reporter } from "./report.js";
import { gitHead, gitTreeHash, isDirty } from "../git.js";

/**
 * FEAT-VERIFY-01 — "Build ALL. Run All Type Test." in one command.
 *
 * planVerify derives the step list from config alone (testable, no execution):
 *   build: verify.buildAll, falling back to package.json build/typecheck scripts for node-ish
 *   platforms; tests: EVERY configured kind (verify.kinds ∪ kindRunners keys — lint/audit custom
 *   kinds included), full suites (placeholder args stripped), deduped so kinds that resolve to the
 *   same command run ONCE.
 * runVerify executes sequentially, report-all: a red step never prevents later steps — the summary
 * must show the whole picture. The result carries the code-tree identity the PR gate compares.
 */

export interface VerifyStep {
  name: string;
  cmd: string;
  args: string[];
  kinds?: string[];
}

export interface VerifyStepResult {
  name: string;
  cmd: string;
  ok: boolean;
  ms: number;
}

/** A JSON report a JS test step left behind, so `verify --stamp` can attribute it to criteria. */
export interface StampSource {
  reporter: Reporter;
  path: string;
}

export interface VerifyRun {
  passed: boolean;
  steps: VerifyStepResult[];
  /** present only when runVerify is asked to emit reports (verify --stamp). */
  reports?: StampSource[];
  tree?: string;
  dirty?: boolean;
  sha?: string;
}

const NODE_PLATFORMS = ["typescript", "node", "react", "next", "angular", "electron"];

const BUILTIN_FULL_SUITE: Record<string, { cmd: string; args: string[] }> = {
  "java-maven": { cmd: "mvn", args: ["-B", "test"] },
  "node-vitest": { cmd: "npx", args: ["vitest", "run"] },
  "node-jest": { cmd: "npx", args: ["jest"] },
  "python-pytest": { cmd: "python3", args: ["-m", "pytest"] },
};

/** Full-suite form of a configured runner: args carrying {ref}/{file}/{name} filters are dropped. */
function fullSuite(override: RunnerOverride): { cmd: string; args: string[] } {
  return { cmd: override.cmd, args: override.args.filter((a) => !/\{(ref|file|name)\}/.test(a)) };
}

export function planVerify(cwd: string, config: DevSpecKitConfig): VerifyStep[] {
  const steps: VerifyStep[] = [];

  // Build ALL.
  if (config.verify.buildAll.length > 0) {
    config.verify.buildAll.forEach((b, i) =>
      steps.push({
        name: config.verify.buildAll.length > 1 ? `build#${i + 1}` : "build",
        cmd: b.cmd,
        args: b.args,
      }),
    );
  } else if (config.project.platforms.some((p) => NODE_PLATFORMS.includes(p))) {
    const pkgPath = join(cwd, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string> };
        for (const script of ["build", "typecheck"]) {
          if (pkg.scripts?.[script])
            steps.push({ name: `build:${script}`, cmd: "npm", args: ["run", "-s", script] });
        }
      } catch {
        /* unreadable package.json — no fallback steps */
      }
    }
  }

  // Run ALL kinds — everything configured, each distinct command once.
  const kinds = [...new Set([...config.verify.kinds, ...Object.keys(config.verify.kindRunners)])];
  let stackCache: string | null | undefined;
  const stackFor = (): string | null => {
    if (stackCache !== undefined) return stackCache;
    try {
      stackCache = resolveStack(undefined, config, cwd).stack;
    } catch {
      stackCache = null;
    }
    return stackCache;
  };
  const grouped = new Map<string, { cmd: string; args: string[]; kinds: string[] }>();
  for (const kind of kinds) {
    const byKind = config.verify.kindRunners[kind];
    let resolved: { cmd: string; args: string[] } | null = null;
    if (byKind) {
      resolved = fullSuite(byKind);
    } else {
      const stack = stackFor();
      const byStack = stack ? config.verify.runners[stack] : undefined;
      resolved = byStack ? fullSuite(byStack) : stack ? (BUILTIN_FULL_SUITE[stack] ?? null) : null;
    }
    if (!resolved) continue; // no runner resolvable for this kind — nothing to execute
    const key = JSON.stringify([resolved.cmd, resolved.args]);
    const entry = grouped.get(key);
    if (entry) entry.kinds.push(kind);
    else grouped.set(key, { ...resolved, kinds: [kind] });
  }
  for (const g of grouped.values()) {
    steps.push({ name: `tests:${g.kinds.join("+")}`, cmd: g.cmd, args: g.args, kinds: g.kinds });
  }
  return steps;
}

/** vitest/jest steps can emit a JSON report; build/lint/maven/pytest steps cannot. */
function stepReporter(s: VerifyStep): Reporter | undefined {
  if (s.args.includes("vitest")) return "vitest";
  if (s.args.includes("jest")) return "jest";
  return undefined;
}

export function runVerify(cwd: string, config: DevSpecKitConfig, opts?: { reportDir?: string }): VerifyRun {
  const steps = planVerify(cwd, config);
  const results: VerifyStepResult[] = [];
  const reports: StampSource[] = [];
  steps.forEach((s, i) => {
    // For a JS test step under --stamp, emit a JSON report alongside the normal run so one suite
    // execution can be attributed back to every bound criterion (FEAT-STAMP-01).
    const reporter = opts?.reportDir ? stepReporter(s) : undefined;
    let args = s.args;
    let reportPath: string | undefined;
    if (reporter && opts?.reportDir) {
      reportPath = join(opts.reportDir, `step-${i}.json`);
      args = [...s.args, ...reportArgs(reporter, reportPath)];
    }
    const t0 = Date.now();
    const res = spawnSync(s.cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    results.push({
      name: s.name,
      cmd: `${s.cmd} ${s.args.join(" ")}`.trim(),
      ok: res.status === 0,
      ms: Date.now() - t0,
    });
    if (reporter && reportPath) reports.push({ reporter, path: reportPath });
  });
  const tree = gitTreeHash(cwd);
  const sha = gitHead(cwd);
  return {
    passed: results.length > 0 && results.every((r) => r.ok),
    steps: results,
    ...(reports.length ? { reports } : {}),
    ...(tree ? { tree, dirty: isDirty(cwd) } : {}),
    ...(sha ? { sha } : {}),
  };
}
