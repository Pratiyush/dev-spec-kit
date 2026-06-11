import { existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import type { Task } from "../engine/state/tasks.js";
import type { JournalEvent } from "../engine/state/journal.js";
import type { ProofState, CheckResult } from "../engine/graph/types.js";
import { materialize, journalFor } from "./materialize.js";
import { rollupRequirements, summarize } from "../engine/graph/build.js";
import { deriveTrail, type TaskTrail } from "../engine/trail.js";

/**
 * DASH-02 — Pratiyush's design.html IS the dashboard. The template (src/cli/dashboard-template.html,
 * shipped beside the build) renders entirely from a DATA object; renderDashboard injects the real,
 * sanitized DATA into that block and touches nothing else. TRAIL-01 rides along: every task carries
 * its gate trail (minute-level, blocked attempts inferred from the journal).
 */

export interface RivetFile {
  name: string;
  content: string;
}

export interface DesignTask {
  id: string;
  title: string;
  status: Task["status"];
  boundChecks: string[];
  results: Record<string, CheckResult>;
  trail?: TaskTrail;
}

export interface DesignData {
  project: string;
  generatedAt: string;
  completion: { done: number; total: number };
  validates: Record<ProofState, number>;
  tasks: DesignTask[];
  requirements: Array<{ id: string; title: string; proven: boolean; criteria: Array<{ id: string; proof: ProofState }> }>;
  approvals: Array<{ at: string; approver: string; taskIds: string[] }>;
  governance: Array<{ at: string; kind: string; detail?: string }>;
  activity: Array<{ at: string; icon: string; text: string; meta?: string }>;
  graphHtml: string | null;
  drift: number;
  files: RivetFile[];
}

const TEMPLATE_URL = new URL("./dashboard-template.html", import.meta.url);

export function renderDashboard(data: DesignData): string {
  const template = readFileSync(TEMPLATE_URL, "utf8");
  // `<` is escaped so no value (titles, tails) can close the script tag or open one.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return template.replace(/const DATA = \{[\s\S]*?\n\};/, () => `const DATA = ${json};`);
}

const FILE_CAP = 50_000;

/** FILES-01: every human-readable .rivet markdown artifact, in stable reading order. */
export function collectRivetFiles(cwd: string): RivetFile[] {
  const base = join(cwd, ".rivet");
  const out: RivetFile[] = [];
  const add = (rel: string) => {
    const p = join(base, rel);
    if (!existsSync(p)) return;
    let content = readFileSync(p, "utf8");
    if (content.length > FILE_CAP) content = content.slice(0, FILE_CAP) + "\n…(truncated)";
    out.push({ name: rel, content });
  };
  const dir = (rel: string) => {
    const p = join(base, rel);
    if (!existsSync(p)) return [] as string[];
    return readdirSync(p).filter((f) => f.endsWith(".md")).sort().map((f) => `${rel}/${f}`);
  };
  add("laws.md");
  for (const f of dir("laws")) add(f);
  add("learnings.md");
  add("DEFER.md");
  for (const f of dir("specs")) add(f);
  add("LEDGER.md");
  add("TRACKING.md");
  add("RESUME.md");
  for (const f of dir("approvals")) add(f);
  return out;
}

const escMd = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Minimal markdown → HTML (kept for boards/exports; the template ships its own renderer too). */
export function mdToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let listOpen = false;
  let codeBuf: string[] | null = null;
  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };
  const inline = (escaped: string) =>
    escaped
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.trim().startsWith("```")) {
      closeList();
      if (codeBuf === null) codeBuf = [];
      else {
        out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
        codeBuf = null;
      }
      continue;
    }
    if (codeBuf !== null) {
      codeBuf.push(escMd(raw));
      continue;
    }
    if (raw.trim().startsWith("|") && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? "")) {
      closeList();
      const cells = (l: string) => escMd(l).trim().split("|").map((c) => c.trim()).filter((c) => c.length > 0);
      out.push("<table><thead><tr>" + cells(raw).map((h) => `<th>${inline(h)}</th>`).join("") + "</tr></thead><tbody>");
      i += 2;
      while (i < lines.length && lines[i]!.trim().startsWith("|")) {
        out.push("<tr>" + cells(lines[i]!).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
        i++;
      }
      i--;
      out.push("</tbody></table>");
      continue;
    }
    const h = raw.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      out.push(`<h${h[1]!.length}>${inline(escMd(h[2]!))}</h${h[1]!.length}>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(raw)) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${inline(escMd(raw.replace(/^\s*[-*]\s+/, "")))}</li>`);
      continue;
    }
    if (raw.trim().startsWith(">")) {
      closeList();
      out.push(`<blockquote>${inline(escMd(raw.replace(/^\s*>\s?/, "")))}</blockquote>`);
      continue;
    }
    if (raw.trim() === "") {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p>${inline(escMd(raw))}</p>`);
  }
  if (codeBuf !== null) out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
  closeList();
  return out.join("\n");
}

function activityEntry(e: JournalEvent): { at: string; icon: string; text: string; meta?: string } {
  const d = (e.data ?? {}) as Record<string, unknown>;
  const meta =
    e.meta && (e.meta.actor || e.meta.model) ? [e.meta.actor, e.meta.model].filter(Boolean).join(" · ") : undefined;
  let icon = "📝";
  let text = JSON.stringify(d);
  switch (e.type) {
    case "cli.run":
      icon = "🧾";
      text = `${String(d.command)} ${((d.args as string[]) ?? []).join(" ")}`.trim();
      break;
    case "check.run": {
      const r = d.result as CheckResult | undefined;
      icon = r?.passed ? "✅" : "❌";
      text = `check ${r?.ref ?? "?"} → ${String(d.taskId)}${r?.flaky ? " (flaky)" : ""}`;
      break;
    }
    case "task.created":
      icon = "📋";
      text = `task ${String(d.id)} created — ${String(d.title)}`;
      break;
    case "task.bindings":
      icon = "🔗";
      text = `task ${String(d.id)} bindings synced`;
      break;
    case "task.status":
      icon = d.status === "done" ? "🏁" : "🔁";
      text = `task ${String(d.id)} → ${String(d.status)}`;
      break;
    case "approval.recorded":
      icon = "🔏";
      text = `${String(d.approver)} approved ${((d.taskIds as string[]) ?? []).join(", ")}`;
      break;
    case "governance":
      icon = "🛡️";
      text = String(d.kind ?? "governance");
      break;
  }
  return { at: e.at, icon, text, ...(meta ? { meta } : {}) };
}

export function dashboardCmd(opts: { open?: boolean }): void {
  const cwd = process.cwd();
  const m = materialize(cwd, { refresh: false, write: false });
  const events = journalFor(cwd).read();
  const rollups = rollupRequirements(m.requirements, m.vtg);
  const v = summarize(m.vtg).validates;
  const graphHtmlAbs = join(cwd, m.config.graphify.outDir, "graph.html");

  const data: DesignData = {
    project: m.config.project.name,
    generatedAt: new Date().toISOString(),
    completion: { done: m.tasks.filter((t) => t.status === "done").length, total: m.tasks.length },
    validates: v,
    tasks: m.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      boundChecks: t.boundChecks,
      results: t.results,
      trail: deriveTrail(events, t.id),
    })),
    requirements: rollups.map((r) => ({
      id: r.id,
      title: r.title,
      proven: r.proven,
      criteria: r.criteria.map((c) => ({ id: c.id, proof: c.proof })),
    })),
    approvals: events
      .filter((e) => e.type === "approval.recorded")
      .map((e) => {
        const d = e.data as { approver?: string; taskIds?: string[] };
        return { at: e.at, approver: String(d.approver ?? ""), taskIds: d.taskIds ?? [] };
      }),
    governance: events
      .filter((e) => e.type === "governance")
      .map((e) => {
        const d = e.data as { kind?: string; paths?: string[]; id?: string };
        return {
          at: e.at,
          kind: String(d.kind ?? "governance"),
          ...(d.paths ? { detail: d.paths.join(", ") } : d.id ? { detail: String(d.id) } : {}),
        };
      }),
    activity: events.slice(-40).map(activityEntry),
    graphHtml: existsSync(graphHtmlAbs) ? `../${m.config.graphify.outDir}/graph.html` : null,
    drift: v.red + v.stale,
    files: collectRivetFiles(cwd),
  };

  const out = join(cwd, ".rivet", "dashboard.html");
  writeFileSync(out, renderDashboard(data));
  console.log(pc.green("✓ dashboard generated") + pc.dim(" → .rivet/dashboard.html (Pratiyush design · gate trails included)"));
  if (opts.open) spawnSync("open", [out], { stdio: "ignore" });
}
