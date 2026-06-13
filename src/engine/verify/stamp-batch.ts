import type { CheckResult } from "../graph/types.js";
import { splitRef, type AssertionResult, type TestReport } from "./report.js";

/**
 * FEAT-STAMP-01 — batch proof stamping. The 20× depth tax was: proving N criteria meant N cold
 * `check run`s (a fresh node+vitest start each). `verify --stamp` runs the suite ONCE and maps every
 * test back to the criterion that bound it, so one `vitest run` stamps N proofs.
 *
 * `matchProofs` is the pure core (no journal/FS) so the mapping rules are unit-testable:
 *  - a `file::name` ref matches the test whose file ends at `file` and whose title === `name`;
 *  - a file-only ref matches every test in the file, green only if ALL of them passed;
 *  - a ref absent from the report is left untouched (another runner / not in this run);
 *  - a ref whose matches all SKIPPED yields NO proof — skipped is not evidence (FIX-TRUST-01 spirit).
 */

export interface BatchBinding {
  taskId: string;
  ref: string;
  /** check kind from the spec, recorded onto the proof (defaults applied by the caller). */
  kind?: string;
}

export interface StampMeta {
  at: string;
  sha?: string;
  tree?: string;
  stack?: string;
}

export interface ProofToStamp {
  taskId: string;
  result: CheckResult;
}

/** An absolute report path matches a (relative) ref file when it ends at that path. */
function fileMatches(reportFile: string, refFile: string): boolean {
  const norm = reportFile.replaceAll("\\", "/");
  return norm === refFile || norm.endsWith(`/${refFile}`);
}

export function matchProofs(
  bindings: BatchBinding[],
  reports: TestReport[],
  meta: StampMeta,
): ProofToStamp[] {
  const all: AssertionResult[] = reports.flatMap((r) => r.assertions);
  const out: ProofToStamp[] = [];
  for (const b of bindings) {
    const [file, name] = splitRef(b.ref);
    const matches = all.filter(
      (a) => a.file !== undefined && fileMatches(a.file, file) && (name === undefined || a.title === name),
    );
    const ran = matches.filter((a) => a.status === "passed" || a.status === "failed");
    if (ran.length === 0) continue; // not in this run, or only skipped — no evidence to stamp
    const passed = ran.every((a) => a.status === "passed");
    const tail = passed
      ? undefined
      : ran
          .flatMap((a) => a.failureMessages ?? [])
          .join("\n")
          .slice(-1500) || undefined;
    out.push({
      taskId: b.taskId,
      result: {
        ref: b.ref,
        passed,
        at: meta.at,
        ...(meta.sha ? { sha: meta.sha } : {}),
        ...(meta.tree ? { tree: meta.tree } : {}),
        ...(meta.stack ? { stack: meta.stack } : {}),
        ...(b.kind ? { kind: b.kind } : {}),
        ...(tail ? { tail } : {}),
      },
    });
  }
  return out;
}
