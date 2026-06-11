import type { Task } from "../engine/state/tasks.js";
import { identityLabel } from "../engine/verify/stamp.js";

/**
 * FEAT-REPORT-01 — the 📋 per-task evidence table, shown the moment a task completes and persisted
 * under the task's LEDGER entry. Tables scan; journal events don't. State follows the same honesty
 * rules as the graph: a pass on an old tree is 🟣 stale, never ✅ green.
 */

export function renderTaskReport(task: Task, currentTree?: string, indent = ""): string {
  const lines: string[] = [
    `${indent}📋 Evidence — ${task.id}`,
    `${indent}| Check | Kind | State | Proof | Proven at |`,
    `${indent}|---|---|---|---|---|`,
  ];
  for (const ref of task.boundChecks) {
    const r = task.results[ref];
    const state = !r
      ? "⚪ unproven"
      : !r.passed
        ? "❌ red"
        : currentTree && r.tree && r.tree !== currentTree
          ? "🟣 stale"
          : "✅ green";
    const proof = r ? identityLabel(r) || "—" : "—";
    lines.push(`${indent}| \`${ref}\` | ${r?.kind ?? "—"} | ${state} | ${proof} | ${r?.at ?? "—"} |`);
  }
  return lines.join("\n");
}
