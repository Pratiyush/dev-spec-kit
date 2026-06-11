import type { JournalEvent } from "./state/journal.js";

/**
 * GATE-PROTECT-01: while a task is in flight, the agent must not be able to turn red green by
 * editing the proof itself. Protected while any task is in flight: the project's spec files and
 * gate config; plus each in-flight task's bound test files — but only AFTER that ref has a
 * recorded PASSING run (pre-green iteration is the normal TDD flow and stays free).
 * Escape hatch: a human-issued, time-boxed unlock (`rivet unlock`), journaled as governance.
 * hooks/guard-protect.mjs mirrors this logic self-contained; keep in sync.
 */

export interface InFlightTask {
  id: string;
  boundChecks: string[];
  /** Refs with at least one recorded passing result — these are the tamper-protected ones. */
  provenRefs: string[];
}

export function inFlightTasks(events: JournalEvent[]): InFlightTask[] {
  const tasks = new Map<string, { boundChecks: string[]; status: string; proven: Set<string> }>();
  for (const e of events) {
    const d = (e.data ?? {}) as Record<string, unknown>;
    if (e.type === "task.created") {
      const id = String(d.id ?? "");
      if (id && !tasks.has(id)) {
        tasks.set(id, { boundChecks: (d.boundChecks as string[]) ?? [], status: "pending", proven: new Set() });
      }
    } else if (e.type === "task.bindings") {
      const t = tasks.get(String(d.id ?? ""));
      if (t) t.boundChecks = (d.boundChecks as string[]) ?? t.boundChecks;
    } else if (e.type === "task.status") {
      const t = tasks.get(String(d.id ?? ""));
      if (t) t.status = String(d.status ?? t.status);
    } else if (e.type === "check.run") {
      const t = tasks.get(String(d.taskId ?? ""));
      const r = d.result as { ref?: string; passed?: boolean } | undefined;
      if (t && r?.ref && r.passed) t.proven.add(r.ref);
    }
  }
  return [...tasks.entries()]
    .filter(([, t]) => t.status !== "done")
    .map(([id, t]) => ({ id, boundChecks: t.boundChecks, provenRefs: [...t.proven] }));
}

export interface Unlock {
  paths: string[];
  until: string;
}

function relativeTo(filePath: string, projectDir: string): string {
  const norm = projectDir.endsWith("/") ? projectDir : projectDir + "/";
  return filePath.startsWith(norm) ? filePath.slice(norm.length) : filePath;
}

export function isProtectedPath(
  filePath: string,
  tasks: InFlightTask[],
  projectDir: string,
  unlock?: Unlock,
  now: number = Date.now(),
): boolean {
  if (tasks.length === 0) return false;
  const rel = relativeTo(filePath, projectDir);

  if (unlock && Date.parse(unlock.until) > now) {
    if (unlock.paths.some((p) => rel === p || filePath.endsWith("/" + p))) return false;
  }

  // The spec and the gate config are the law — immutable while work is in flight.
  if (rel.startsWith(".rivet/specs/") || rel === ".rivet/config.json") return true;

  // Bound test files: protected once their ref has gone green (post-green tampering is the attack).
  for (const t of tasks) {
    for (const ref of t.provenRefs) {
      const file = ref.includes("::") ? ref.split("::")[0]! : undefined;
      if (file && (rel === file || filePath.endsWith("/" + file))) return true;
      const maven = ref.match(/^([A-Za-z_][A-Za-z0-9_]*)#/);
      if (maven && (rel === `${maven[1]}.java` || filePath.endsWith(`/${maven[1]}.java`))) return true;
    }
  }
  return false;
}
