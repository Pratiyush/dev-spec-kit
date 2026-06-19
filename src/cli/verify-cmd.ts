import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";
import type { RivetConfig } from "../config/schema.js";
import { Journal } from "../engine/state/journal.js";
import { runVerify, type VerifyRun } from "../engine/verify/verify-all.js";
import { identityLabel } from "../engine/verify/stamp.js";
import { parseTestReport, type TestReport } from "../engine/verify/report.js";
import { matchProofs, type BatchBinding } from "../engine/verify/stamp-batch.js";
import { TaskStore, provableTaskIds } from "../engine/state/tasks.js";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { kindForRef } from "../engine/spec/ears.js";
import { refreshDocs } from "./refresh-docs.js";
import { loadConfig } from "./config-io.js";
import { label } from "./emoji.js";

/**
 * `dev-spec-kit verify` — FEAT-VERIFY-01: Build ALL + run EVERY configured kind's full suite, sequential,
 * report-all, 📋 summary with ⏱️ durations, journaled as a `verify.run` event carrying the code
 * tree. The PR gate (hook, `dev-spec-kit guard pr`, `dev-spec-kit pr`) requires the last one green AND fresh.
 *
 * FEAT-STAMP-01: `--stamp` additionally maps the single suite run back onto every bound criterion
 * (one `vitest run` stamps N proofs) — the fast path that finally satisfies `trace`, instead of N
 * cold `check run`s. The verify step still runs once; the report is the only extra cost.
 */
export function verifyCmd(opts?: { stamp?: boolean; advance?: boolean }): void {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  // --advance reconciles the two surfaces (#7): it needs fresh proofs, so it implies --stamp.
  const advance = opts?.advance ?? false;
  const stamp = (opts?.stamp ?? false) || advance;
  console.log(
    pc.bold(
      `\n${label("build")} dev-spec-kit verify — build ALL + run ALL kinds (full suites)` +
        (stamp ? " + stamp proofs" : "") +
        "\n",
    ),
  );
  const reportDir = stamp ? mkdtempSync(join(tmpdir(), "dev-spec-kit-stamp-")) : undefined;
  try {
    const run = runVerify(cwd, config, reportDir ? { reportDir } : undefined);
    if (run.steps.length === 0) {
      console.log(
        pc.yellow("nothing to verify — configure verify.buildAll / verify.kinds / verify.kindRunners"),
      );
      process.exitCode = 1;
      return;
    }
    for (const s of run.steps) {
      const mark = s.ok ? pc.green("✅") : pc.red("❌");
      console.log(`  ${mark} ${s.name.padEnd(24)} ${pc.dim(`${s.cmd}  ${label("duration")} ${s.ms}ms`)}`);
    }
    const idStamp = identityLabel(run);
    console.log(`\n${label("report")} verify summary`);
    console.log(`| Step | Result | ${label("duration")} |`);
    console.log("|---|---|---|");
    for (const s of run.steps) console.log(`| ${s.name} | ${s.ok ? "✅ green" : "❌ red"} | ${s.ms}ms |`);
    console.log(
      (run.passed ? pc.green(`\n✅ verify GREEN`) : pc.red(`\n❌ verify RED`)) +
        pc.dim(`${idStamp ? ` @ ${idStamp}` : ""} — journaled`),
    );
    const journal = new Journal(join(cwd, ".dev-spec-kit", "journal.jsonl"));
    journal.append("verify.run", {
      passed: run.passed,
      steps: run.steps,
      ...(run.tree ? { tree: run.tree } : {}),
      ...(run.dirty !== undefined ? { dirty: run.dirty } : {}),
      ...(run.sha ? { sha: run.sha } : {}),
    });
    if (stamp) stampProofs(cwd, config, journal, run);
    if (advance) advanceTasks(cwd, config, journal, run);
    if (!run.passed) process.exitCode = 1;
  } finally {
    if (reportDir) rmSync(reportDir, { recursive: true, force: true });
  }
}

/**
 * Attribute the suite's JSON report(s) back to every bound criterion and record a `check.run` proof
 * for each — stamped with the SAME tree the verify ran on, so `trace` reads them green immediately.
 * A ref not present in the report (a pytest/maven check, or a test not run) is left untouched.
 */
export function stampProofs(cwd: string, config: RivetConfig, journal: Journal, run: VerifyRun): void {
  const sources = run.reports ?? [];
  const reports = sources
    .map((s) => {
      try {
        return parseTestReport(readFileSync(s.path, "utf8"));
      } catch {
        return undefined;
      }
    })
    .filter((r): r is TestReport => r !== undefined);
  if (reports.length === 0) {
    console.log(pc.yellow(`${label("checkRun")} nothing to stamp — --stamp needs a vitest/jest test kind`));
    return;
  }
  const store = new TaskStore(journal);
  const specs = parseSpecsDir(cwd);
  const bindings: BatchBinding[] = [];
  for (const t of store.all().values()) {
    for (const ref of t.boundChecks) bindings.push({ taskId: t.id, ref, kind: kindForRef(specs, ref) });
  }
  const stack = sources[0]?.reporter === "jest" ? "node-jest" : "node-vitest";
  const proofs = matchProofs(bindings, reports, {
    at: new Date().toISOString(),
    ...(run.sha ? { sha: run.sha } : {}),
    ...(run.tree ? { tree: run.tree } : {}),
    stack,
  });
  for (const p of proofs) store.recordCheck(p.taskId, p.result);
  refreshDocs(cwd, config);
  const green = proofs.filter((p) => p.result.passed).length;
  const red = proofs.length - green;
  const unstamped = bindings.length - proofs.length;
  console.log(
    `\n${label("checkRun")} stamped ${proofs.length} proof(s) from 1 run — ` +
      `${pc.green(`${green} green`)}${red ? `, ${pc.red(`${red} red`)}` : ""}` +
      (unstamped > 0 ? pc.dim(`; ${unstamped} ref(s) not in the JS suite (unchanged)`) : ""),
  );
}

/**
 * FIX-RECONCILE-01 — auto-advance every task whose bound checks are now all freshly green, so `trace`
 * (criteria) and `status` (tasks) stop disagreeing. Reuses the done-gate's own evidence rule, so it
 * only advances what `task done` would have accepted anyway — the human approval step still follows.
 */
export function advanceTasks(cwd: string, config: RivetConfig, journal: Journal, run: VerifyRun): void {
  const store = new TaskStore(journal);
  const ids = provableTaskIds([...store.all().values()], run.tree);
  if (ids.length === 0) return;
  for (const id of ids) store.markDone(id);
  refreshDocs(cwd, config);
  console.log(
    `${label("checkRun")} advanced ${ids.length} fully-proven task(s) to done — ${pc.dim(ids.join(", "))}`,
  );
}
