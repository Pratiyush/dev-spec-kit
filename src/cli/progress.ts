import pc from "picocolors";
import type { Task } from "../engine/state/tasks.js";

/**
 * Progress view (R-PROG-01) — shown after every completed task: what's done, what remains, the
 * proof lights per task, an overall bar, and the suggested next task. Generated from the journal
 * fold, never hand-claimed.
 */

const STATUS_EMOJI: Record<Task["status"], string> = {
  done: "✅",
  in_progress: "🔨",
  blocked: "🚧",
  pending: "⬜",
};

export function renderProgress(tasks: Task[]): string {
  if (tasks.length === 0) return pc.dim("no tasks yet");
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = Math.round((done / tasks.length) * 100);
  const filled = Math.round((done / tasks.length) * 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);

  const lines: string[] = [];
  lines.push(`📊 ${bar} ${done}/${tasks.length} done (${pct}%)`);
  for (const t of tasks) {
    const lights = t.boundChecks
      .map((ref) => {
        const r = t.results[ref];
        return !r ? "⚪" : r.passed ? "🟢" : "🔴";
      })
      .join("");
    lines.push(`  ${STATUS_EMOJI[t.status]} ${pc.bold(t.id)} ${t.title} ${lights}`);
  }
  if (done === tasks.length) {
    lines.push(`🎉 all ${tasks.length} task(s) done (100%) — run \`rivet graph build\` then \`rivet pr\``);
    lines.push(
      `💾 natural checkpoint — commit/push now; compaction is safe (.rivet/RESUME.md carries the handoff)`,
    );
  } else {
    const next = tasks.find((t) => t.status === "in_progress") ?? tasks.find((t) => t.status === "pending");
    if (next) lines.push(`🎯 next: ${pc.bold(next.id)} — ${next.title}`);
  }
  return lines.join("\n");
}
