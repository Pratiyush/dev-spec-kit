import type { JournalEvent } from "./state/journal.js";

/**
 * TRAIL-01 — the per-task gate trail: every gate a task crossed, minute-level, with BLOCKED
 * done-attempts INFERRED from the journal (a `task done` cli.run with no status flip right after
 * means the gate refused). Done/blocked/skipped/pending for every gate — nothing hand-claimed.
 */

export interface TrailEvent {
  at: string;
  gate: "binding" | "start" | "proof" | "done-gate" | "approval";
  outcome: string;
  detail?: string;
}

export interface GateSummary {
  binding: "done" | "reopened" | "pending";
  tddRed: "done" | "skipped";
  proof: "green" | "red" | "pending";
  doneGate: string; // "passed" | "passed (n blocked)" | "blocked (n)" | "pending"
  approval: "recorded" | "pending";
}

export interface TaskTrail {
  timeline: TrailEvent[];
  summary: GateSummary;
}

export function deriveTrail(events: JournalEvent[], taskId: string): TaskTrail {
  const timeline: TrailEvent[] = [];
  let exists = false;
  let sawRed = false;
  let reopened = false;
  let done = false;
  let blocked = 0;
  let approval: "recorded" | "pending" = "pending";
  const latest = new Map<string, boolean>();
  let bound: string[] = [];
  let pendingDoneAt: string | null = null;

  const flushBlocked = () => {
    if (pendingDoneAt !== null) {
      blocked++;
      timeline.push({ at: pendingDoneAt, gate: "done-gate", outcome: "blocked" });
      pendingDoneAt = null;
    }
  };

  for (const e of events) {
    const d = (e.data ?? {}) as Record<string, unknown>;
    if (e.type === "task.created" && d.id === taskId) {
      exists = true;
      bound = (d.boundChecks as string[]) ?? [];
      timeline.push({ at: e.at, gate: "binding", outcome: "bound", detail: `${bound.length} check(s)` });
    } else if (e.type === "task.bindings" && d.id === taskId) {
      flushBlocked();
      bound = (d.boundChecks as string[]) ?? bound;
      reopened = true;
      timeline.push({ at: e.at, gate: "binding", outcome: "synced", detail: `${bound.length} check(s)` });
    } else if (e.type === "task.status" && d.id === taskId) {
      const status = String(d.status);
      if (status === "done") {
        // The pending attempt (if any) is the one that PASSED.
        pendingDoneAt = null;
        done = true;
        timeline.push({ at: e.at, gate: "done-gate", outcome: "passed" });
      } else {
        flushBlocked();
        if (status === "in_progress") timeline.push({ at: e.at, gate: "start", outcome: "started" });
      }
    } else if (e.type === "check.run" && d.taskId === taskId) {
      flushBlocked();
      const r = d.result as { ref?: string; passed?: boolean; flaky?: boolean } | undefined;
      if (r?.ref) {
        latest.set(r.ref, !!r.passed);
        if (!r.passed) sawRed = true;
        timeline.push({
          at: e.at,
          gate: "proof",
          outcome: r.passed ? "green" : "red",
          detail: r.ref + (r.flaky ? " (flaky)" : ""),
        });
      }
    } else if (e.type === "cli.run" && String(d.command) === "task done" && ((d.args as string[]) ?? [])[0] === taskId) {
      flushBlocked(); // a previous attempt that never resolved is blocked
      pendingDoneAt = e.at;
    } else if (e.type === "approval.recorded" && ((d.taskIds as string[]) ?? []).includes(taskId)) {
      flushBlocked();
      approval = "recorded";
      timeline.push({ at: e.at, gate: "approval", outcome: "recorded", detail: String(d.approver ?? "") });
    } else if (e.type !== "cli.run") {
      // Any other domain event resolves a dangling done attempt as blocked.
      flushBlocked();
    }
  }
  flushBlocked();

  const proof: GateSummary["proof"] =
    bound.length > 0 && bound.every((r) => latest.get(r) === true)
      ? "green"
      : [...latest.values()].some((p) => p === false) && !bound.every((r) => latest.get(r) === true)
        ? bound.some((r) => latest.get(r) === false)
          ? "red"
          : "pending"
        : "pending";

  const doneGate = done
    ? blocked > 0
      ? `passed (${blocked} blocked)`
      : "passed"
    : blocked > 0
      ? `blocked (${blocked})`
      : "pending";

  return {
    timeline,
    summary: {
      binding: exists ? (reopened ? "reopened" : "done") : "pending",
      tddRed: sawRed ? "done" : "skipped",
      proof,
      doneGate,
      approval,
    },
  };
}
