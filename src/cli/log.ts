import pc from "picocolors";
import type { JournalEvent } from "../engine/state/journal.js";
import { journalFor } from "./materialize.js";
import type { CheckResult } from "../engine/graph/types.js";

/**
 * `rivet log` (R-AUDIT-02) — the audit trail, readable. One line per journal event, chronological,
 * per-type emoji; `--json` emits the raw JSONL for machines.
 */

export function renderLog(events: JournalEvent[]): string[] {
  return events.map((e) => {
    const ts = e.at.replace("T", " ").slice(0, 19);
    const meta =
      e.meta && (e.meta.actor || e.meta.model)
        ? `  [${[e.meta.actor, e.meta.model].filter(Boolean).join(" · ")}]`
        : "";
    return `${pc.dim(ts)}  ${describeEvent(e)}${meta}`;
  });
}

// Plain text by design: ANSI codes would break substring greps over the audit trail (and tests).
function describeEvent(e: JournalEvent): string {
  const d = e.data as Record<string, unknown>;
  switch (e.type) {
    case "cli.run":
      return `🧾 ${String(d.command)} ${((d.args as string[]) ?? []).join(" ")}`.trimEnd();
    case "check.run": {
      const r = d.result as CheckResult;
      const mark = r.passed ? "✅" : "❌";
      const flaky = r.flaky ? " (flaky)" : "";
      return `${mark} check ${r.ref}${flaky}${r.sha ? ` @ ${r.sha.slice(0, 8)}` : ""} → ${String(d.taskId)}`;
    }
    case "task.created":
      return `📋 task ${String(d.id)} created — ${String(d.title)}`;
    case "task.status":
      return `${d.status === "done" ? "🏁" : "🔁"} task ${String(d.id)} → ${String(d.status)}`;
    case "approval.recorded":
      return `🔏 approval by ${String(d.approver)} — ${((d.taskIds as string[]) ?? []).join(", ")}`;
    case "task.bindings":
      return `🔗 task ${String(d.id)} bindings → [${((d.boundChecks as string[]) ?? []).join(", ")}]`;
    case "governance":
      return `🛡️ ${String(d.kind ?? "governance")} ${JSON.stringify({ ...d, kind: undefined })}`;
    case "note":
      return `📝 ${JSON.stringify(d)}`;
    default:
      return `❓ ${e.type} ${JSON.stringify(d)}`;
  }
}

/** FIX-PARSE-01: `-n` is validated — default 25, NaN→25, negatives clamp to 0 (0 shows nothing). */
export function parseCount(n?: string): number {
  if (n === undefined) return 25;
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 25;
}

export function logCmd(opts: { json?: boolean; n?: string }): void {
  const events = journalFor(process.cwd()).read();
  const n = parseCount(opts.n);
  const slice = n === 0 ? [] : events.slice(-n);
  if (events.length === 0) {
    console.log(pc.dim("journal is empty — no actions recorded yet"));
    return;
  }
  if (opts.json) {
    for (const e of slice) console.log(JSON.stringify(e));
    return;
  }
  console.log(pc.bold(`\nRivet audit log — last ${slice.length} of ${events.length} event(s)\n`));
  for (const line of renderLog(slice)) console.log("  " + line);
  console.log("");
}
