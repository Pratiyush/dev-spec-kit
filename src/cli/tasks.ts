import { join } from "node:path";
import pc from "picocolors";
import { Journal } from "../engine/state/journal.js";
import { TaskStore, EvidenceError } from "../engine/state/tasks.js";
import { runCheck, type Stack } from "../engine/verify/runner.js";

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
  try {
    const t = store(process.cwd()).markDone(id);
    console.log(pc.green(`✓ Task ${t.id} DONE`) + pc.dim(" — every bound check has a passing run"));
  } catch (e) {
    if (e instanceof EvidenceError) {
      console.error(pc.red(`✗ BLOCKED: ${e.message}`));
      console.error(pc.dim("  done is evidence-bound — run the checks: rivet check run <task> <ref> --stack <stack>"));
      process.exitCode = 1;
      return;
    }
    throw e;
  }
}

export function checkRun(taskId: string, ref: string, stackName: string): void {
  const stacks: Stack[] = ["java-maven", "node-vitest", "node-jest", "python-pytest"];
  if (!stacks.includes(stackName as Stack)) {
    console.error(pc.red(`unknown --stack '${stackName}' (expected: ${stacks.join(", ")})`));
    process.exitCode = 2;
    return;
  }
  const cwd = process.cwd();
  console.log(pc.dim(`running ${ref} via ${stackName} …`));
  const result = runCheck({ kind: "unit", ref }, stackName as Stack, { cwd });
  store(cwd).recordCheck(taskId, result);
  if (result.passed) {
    console.log(pc.green(`✓ PASS ${ref}`) + pc.dim(result.sha ? ` @ ${result.sha.slice(0, 8)}` : ""));
  } else {
    console.log(pc.red(`✗ FAIL ${ref}`) + pc.dim(result.sha ? ` @ ${result.sha.slice(0, 8)}` : ""));
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
