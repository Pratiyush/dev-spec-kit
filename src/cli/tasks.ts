import { join } from "node:path";
import pc from "picocolors";
import { Journal } from "../engine/state/journal.js";
import { TaskStore, EvidenceError } from "../engine/state/tasks.js";
import { runCheck, BUILTIN_STACKS, type RunnerOverride } from "../engine/verify/runner.js";
import { runWithRetry } from "../engine/verify/retry.js";
import { loadConfig } from "./config-io.js";
import { renderProgress } from "./progress.js";

/**
 * CLI surface for the evidence-bound task flow:
 *   rivet task create <id> <title> --check <ref> [--check <ref> ...]
 *   rivet task start <id>
 *   rivet task done <id>      <- THE GATE: refuses without green proofs (exit 1)
 *   rivet check run <taskId> <ref> --stack <stack>
 *   rivet status              <- board generated from the journal, never hand-claimed
 */

function store(cwd: string): TaskStore {
  return new TaskStore(new Journal(join(cwd, ".rivet", "journal.jsonl")));
}

export function taskCreate(id: string, title: string, checks: string[]): void {
  const t = store(process.cwd()).create(id, title, checks);
  console.log(pc.green(`✓ Task ${t.id} created`) + pc.dim(` — ${t.title}`));
  if (checks.length === 0) {
    console.log(pc.yellow("  ⚠ no bound checks — this task can never be proven done; bind with --check"));
  } else {
    for (const c of checks) console.log(pc.dim(`  bound: ${c}`));
  }
}

export function taskStart(id: string): void {
  store(process.cwd()).setStatus(id, "in_progress");
  console.log(pc.green(`▶ Task ${id} in progress`));
}

export function taskDone(id: string): void {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  try {
    const t = store(cwd).markDone(id);
    console.log(pc.green(`✓ Task ${t.id} DONE`) + pc.dim(" — every bound check has a passing run"));
    console.log("\n" + renderProgress([...store(cwd).all().values()]) + "\n");
  } catch (e) {
    if (e instanceof EvidenceError) {
      // Config knob verify.blockDoneOnFail=false -> done-with-warnings, journaled forever.
      if (!config.verify.blockDoneOnFail) {
        store(cwd).markDone(id, { force: true });
        console.log(pc.yellow(`⚠ Task ${id} DONE-WITH-WARNINGS`) + pc.dim(` — ${e.message} [verify.blockDoneOnFail=false]`));
        console.log("\n" + renderProgress([...store(cwd).all().values()]) + "\n");
        return;
      }
      console.error(pc.red(`✗ BLOCKED: ${e.message}`));
      console.error(pc.dim("  done is evidence-bound — run the checks: rivet check run <task> <ref> --stack <stack>"));
      process.exitCode = 1;
      return;
    }
    throw e;
  }
}

export function checkRun(taskId: string, ref: string, stackName: string, opts?: { expectRed?: boolean }): void {
  const cwd = process.cwd();
  // Custom stacks come from config (verify.runners) — the tool's code never changes, only input.
  const config = loadConfig(cwd);
  const override: RunnerOverride | undefined = config.verify.runners[stackName];
  if (!override && !BUILTIN_STACKS.includes(stackName as (typeof BUILTIN_STACKS)[number])) {
    console.error(
      pc.red(`unknown --stack '${stackName}'`) +
        pc.dim(` — built-ins: ${BUILTIN_STACKS.join(", ")}; or define it in .rivet/config.json verify.runners`),
    );
    process.exitCode = 2;
    return;
  }
  const expectRed = opts?.expectRed ?? false;
  console.log(
    pc.dim(`running ${ref} via ${stackName}${override ? " (config runner)" : ""}${expectRed ? " (expect-red: no retries)" : ""} …`),
  );
  // Flaky policy from config: retry-flag retries up to build.retryLimit and records the flakiness.
  // FIX-QUERY-01: TDD's expected red must not burn the retry budget on a deterministic failure.
  const retries = expectRed ? 0 : config.verify.flaky === "retry-flag" ? config.build.retryLimit : 0;
  const { result, attempts } = runWithRetry(
    () => ({ ...runCheck({ kind: "unit", ref }, stackName, { cwd }, override), stack: stackName }),
    retries,
  );
  store(cwd).recordCheck(taskId, result);
  if (result.passed) {
    const flaky = result.flaky ? pc.yellow(` (flaky — passed on attempt ${attempts})`) : "";
    console.log(pc.green(`✓ PASS ${ref}`) + flaky + pc.dim(result.sha ? ` @ ${result.sha.slice(0, 8)}` : ""));
  } else {
    console.log(
      pc.red(`✗ FAIL ${ref}`) +
        pc.dim((attempts > 1 ? ` after ${attempts} attempts` : "") + (result.sha ? ` @ ${result.sha.slice(0, 8)}` : "")),
    );
    process.exitCode = 1;
  }
}

export function status(): void {
  const tasks = [...store(process.cwd()).all().values()];
  if (tasks.length === 0) {
    console.log(pc.dim("no tasks yet — rivet task create <id> <title> --check <ref>"));
    return;
  }
  console.log(pc.bold("\nRivet status — generated from the journal (ground truth)\n"));
  for (const t of tasks) {
    const badge =
      t.status === "done"
        ? pc.green("DONE ")
        : t.status === "in_progress"
          ? pc.cyan("WORK ")
          : t.status === "blocked"
            ? pc.red("BLOCK")
            : pc.yellow("TODO ");
    console.log(`  ${badge} ${pc.bold(t.id)} ${t.title}`);
    for (const ref of t.boundChecks) {
      const r = t.results[ref];
      const light = !r ? pc.yellow("○ unproven") : r.passed ? pc.green("● green") : pc.red("● red");
      console.log(`        ${light} ${pc.dim(ref)}`);
    }
  }
  console.log("");
}
