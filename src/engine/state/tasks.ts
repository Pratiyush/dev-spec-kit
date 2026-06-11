import { Journal } from "./journal.js";
import type { CheckResult } from "../graph/types.js";

/**
 * Evidence-bound task state — the moat made mechanical.
 *
 * A task binds to acceptance-criterion checks. `markDone` REFUSES to set status=done unless every
 * bound check has a recorded passing run — "done means done", enforced in code, not prose.
 */

export type TaskStatus = "pending" | "in_progress" | "blocked" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  /** Check refs (e.g. "tests/auth_test.py::test_idle") this task must prove before it can be done. */
  boundChecks: string[];
  /** Latest recorded result per check ref. */
  results: Record<string, CheckResult>;
}

export class EvidenceError extends Error {
  constructor(
    message: string,
    readonly missing: string[],
    readonly failing: string[],
  ) {
    super(message);
    this.name = "EvidenceError";
  }
}

interface TaskCreatedData {
  id: string;
  title: string;
  boundChecks: string[];
}
interface TaskStatusData {
  id: string;
  status: TaskStatus;
}
interface CheckRunData {
  taskId: string;
  result: CheckResult;
}

export class TaskStore {
  constructor(private readonly journal: Journal) {}

  /** Rebuild all task state by folding the journal (ground truth; nothing is cached mutably). */
  all(): Map<string, Task> {
    return this.journal.fold(new Map<string, Task>(), (tasks, e) => {
      if (e.type === "task.created") {
        const d = e.data as TaskCreatedData;
        tasks.set(d.id, { id: d.id, title: d.title, status: "pending", boundChecks: d.boundChecks, results: {} });
      } else if (e.type === "task.status") {
        const d = e.data as TaskStatusData;
        const t = tasks.get(d.id);
        if (t) t.status = d.status;
      } else if (e.type === "check.run") {
        const d = e.data as CheckRunData;
        const t = tasks.get(d.taskId);
        if (t) t.results[d.result.ref] = d.result;
      }
      return tasks;
    });
  }

  get(id: string): Task | undefined {
    return this.all().get(id);
  }

  create(id: string, title: string, boundChecks: string[]): Task {
    this.journal.append("task.created", { id, title, boundChecks } satisfies TaskCreatedData);
    const task = this.get(id);
    if (!task) throw new Error(`task ${id} not found after create`);
    return task;
  }

  setStatus(id: string, status: Exclude<TaskStatus, "done">): void {
    this.requireTask(id);
    this.journal.append("task.status", { id, status } satisfies TaskStatusData);
  }

  /** Record an executed check result against a task (the proof). */
  recordCheck(taskId: string, result: CheckResult): void {
    this.requireTask(taskId);
    this.journal.append("check.run", { taskId, result } satisfies CheckRunData);
  }

  /**
   * The done-gate. Throws EvidenceError unless EVERY bound check has a recorded PASSING result.
   * This is the one transition that cannot be talked into existence.
   */
  markDone(id: string): Task {
    const task = this.requireTask(id);
    const missing = task.boundChecks.filter((ref) => !task.results[ref]);
    const failing = task.boundChecks.filter((ref) => task.results[ref] && !task.results[ref]!.passed);
    if (missing.length > 0 || failing.length > 0) {
      throw new EvidenceError(
        `Task "${id}" cannot be done: ` +
          (missing.length ? `${missing.length} check(s) never ran (${missing.join(", ")})` : "") +
          (missing.length && failing.length ? "; " : "") +
          (failing.length ? `${failing.length} check(s) failing (${failing.join(", ")})` : ""),
        missing,
        failing,
      );
    }
    this.journal.append("task.status", { id, status: "done" } satisfies TaskStatusData);
    return this.get(id)!;
  }

  private requireTask(id: string): Task {
    const t = this.get(id);
    if (!t) throw new Error(`unknown task: ${id}`);
    return t;
  }
}
