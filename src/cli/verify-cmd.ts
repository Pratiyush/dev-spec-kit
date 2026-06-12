import { join } from "node:path";
import pc from "picocolors";
import { Journal } from "../engine/state/journal.js";
import { runVerify } from "../engine/verify/verify-all.js";
import { identityLabel } from "../engine/verify/stamp.js";
import { loadConfig } from "./config-io.js";
import { label } from "./emoji.js";

/**
 * `rivet verify` — FEAT-VERIFY-01: Build ALL + run EVERY configured kind's full suite, sequential,
 * report-all, 📋 summary with ⏱️ durations, journaled as a `verify.run` event carrying the code
 * tree. The PR gate (hook, `rivet guard pr`, `rivet pr`) requires the last one green AND fresh.
 */
export function verifyCmd(): void {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  console.log(pc.bold(`\n${label("build")} rivet verify — build ALL + run ALL kinds (full suites)\n`));
  const run = runVerify(cwd, config);
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
  const stamp = identityLabel(run);
  console.log(`\n${label("report")} verify summary`);
  console.log(`| Step | Result | ${label("duration")} |`);
  console.log("|---|---|---|");
  for (const s of run.steps) console.log(`| ${s.name} | ${s.ok ? "✅ green" : "❌ red"} | ${s.ms}ms |`);
  console.log(
    (run.passed ? pc.green(`\n✅ verify GREEN`) : pc.red(`\n❌ verify RED`)) +
      pc.dim(`${stamp ? ` @ ${stamp}` : ""} — journaled`),
  );
  new Journal(join(cwd, ".rivet", "journal.jsonl")).append("verify.run", {
    passed: run.passed,
    steps: run.steps,
    ...(run.tree ? { tree: run.tree } : {}),
    ...(run.dirty !== undefined ? { dirty: run.dirty } : {}),
    ...(run.sha ? { sha: run.sha } : {}),
  });
  if (!run.passed) process.exitCode = 1;
}
