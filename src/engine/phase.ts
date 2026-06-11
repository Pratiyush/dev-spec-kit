import type { JournalEvent } from "./state/journal.js";
import type { Task } from "./state/tasks.js";

/**
 * COMPACT-01 — the journal knows where the phase boundaries are. A boundary is the right moment to
 * commit, checkpoint, or compact the conversation; RESUME.md is the state-only handoff that makes
 * compaction safe (generated from ground truth, never hand-written, so it can't drift).
 */

export interface Boundary {
  kind: "task-complete" | "feature-complete";
}

export function phaseBoundary(events: JournalEvent[], tasks: Task[]): Boundary | null {
  const last = events[events.length - 1];
  if (!last || last.type !== "task.status") return null;
  const d = last.data as { status?: string };
  if (d.status !== "done") return null;
  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "done");
  return { kind: allDone ? "feature-complete" : "task-complete" };
}

/** State-only handoff: where we are, THE ONE OPEN ACTION, and how to rebuild truth. */
export function renderResume(tasks: Task[]): string {
  const done = tasks.filter((t) => t.status === "done").length;
  const lines: string[] = [
    "# RESUME — state-only handoff (generated from the journal; do not edit)",
    "",
    `Board: ${done}/${tasks.length} task(s) done.`,
    "",
  ];
  const open = tasks.find((t) => t.status === "in_progress") ?? tasks.find((t) => t.status !== "done");
  if (!open) {
    lines.push("✅ all task(s) done — nothing open. Next: `rivet graph build` → `rivet pr`.");
  } else {
    lines.push("## THE ONE OPEN ACTION", "", `→ **${open.id}** — ${open.title} (${open.status})`);
    const unproven = open.boundChecks.filter((ref) => !open.results[ref]?.passed);
    for (const ref of unproven) lines.push(`  ○ unproven: \`${ref}\``);
    lines.push("");
  }
  lines.push("## Rebuild truth", "", "`rivet status` · `rivet graph build` · `rivet log -n 10`", "");
  return lines.join("\n");
}
