import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Task } from "../engine/state/tasks.js";
import type { JournalEvent } from "../engine/state/journal.js";
import type { RequirementRollup } from "../engine/graph/build.js";
import type { ProofState } from "../engine/graph/types.js";
import { renderLog } from "./log.js";
import { renderTaskReport } from "./task-report.js";
import { gitTreeHash } from "../engine/git.js";

/**
 * BOARDS-01 — LEDGER.md and TRACKING.md are GENERATED views over the journal and the graph.
 * Hand-maintained boards drift ("DONE but columns empty" — the founding pain point); these cannot,
 * because they are rebuilt from ground truth on every `rivet board` / `rivet graph build`.
 */

const STATUS_EMOJI: Record<Task["status"], string> = {
  done: "✅",
  in_progress: "🔨",
  blocked: "🚧",
  pending: "⬜",
};
const LIGHT: Record<ProofState, string> = { green: "🟢", red: "🔴", stale: "🟣", unproven: "⚪" };

export function renderLedger(tasks: Task[], events: JournalEvent[], currentTree?: string): string {
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
  const lines: string[] = [
    "# LEDGER — generated from the journal; do not edit",
    "",
    "> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven",
    "",
    "## Progress board",
    "",
    `**${done}/${tasks.length} done (${pct}%)**`,
    "",
  ];
  for (const t of tasks) {
    const lights = t.boundChecks.map((ref) => (!t.results[ref] ? "⚪" : t.results[ref]!.passed ? "🟢" : "🔴")).join("");
    lines.push(`- ${STATUS_EMOJI[t.status]} **${t.id}** ${t.title} ${lights}`);
    // FEAT-REPORT-01: the per-task evidence table is the permanent tabular record.
    if (Object.keys(t.results).length > 0) {
      lines.push(renderTaskReport(t, currentTree, "  "), "");
    }
  }

  lines.push("", "## Approvals & governance", "");
  const gates = events.filter((e) => e.type === "approval.recorded" || e.type === "governance");
  if (gates.length === 0) lines.push("- _none recorded yet_");
  for (const e of gates) {
    const d = e.data as Record<string, unknown>;
    lines.push(
      e.type === "approval.recorded"
        ? `- 🔏 ${e.at} — ${String(d.approver)} approved ${((d.taskIds as string[]) ?? []).join(", ")}`
        : `- 🛡️ ${e.at} — ${String(d.kind)}`,
    );
  }

  lines.push("", "## Recent activity", "");
  for (const line of renderLog(events.slice(-10))) lines.push(`- ${line}`);
  lines.push("");
  return lines.join("\n");
}

export function renderTracking(rollups: RequirementRollup[], tasks: Task[], events: JournalEvent[]): string {
  const approvedIds = new Set(
    events
      .filter((e) => e.type === "approval.recorded")
      .flatMap((e) => ((e.data as { taskIds?: string[] }).taskIds ?? []) as string[]),
  );
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const lines: string[] = [
    "# TRACKING — per-requirement Definition of Done (generated; do not edit)",
    "",
    "| Requirement | Title | Criteria | Proof | Task | Approved |",
    "|---|---|---|---|---|---|",
  ];
  for (const r of rollups) {
    const lights = r.criteria.map((c) => LIGHT[c.proof]).join("");
    const task = byId.get(r.id);
    lines.push(
      `| ${r.id} | ${r.title} | ${r.criteria.length} | ${lights || "—"} | ${task?.status ?? "—"} | ${approvedIds.has(r.id) ? "✅" : "—"} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

export function writeBoards(
  cwd: string,
  tasks: Task[],
  events: JournalEvent[],
  rollups: RequirementRollup[],
): void {
  writeFileSync(join(cwd, ".rivet", "LEDGER.md"), renderLedger(tasks, events, gitTreeHash(cwd)));
  writeFileSync(join(cwd, ".rivet", "TRACKING.md"), renderTracking(rollups, tasks, events));
}
