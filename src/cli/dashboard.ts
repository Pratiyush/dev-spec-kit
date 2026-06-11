import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import type { Task } from "../engine/state/tasks.js";
import type { JournalEvent } from "../engine/state/journal.js";
import type { RequirementRollup } from "../engine/graph/build.js";
import type { ProofState } from "../engine/graph/types.js";
import { materialize, journalFor } from "./materialize.js";
import { rollupRequirements, summarize } from "../engine/graph/build.js";

/**
 * DASH-01 v1 — `rivet dashboard`: a self-contained HTML dashboard generated ON DEMAND (his config:
 * dashboard.updates = "on-demand") from ground truth. Emoji language, completion %, traffic lights,
 * drift banner, approvals feed, and the graphify code graph embedded when present. Zero deps.
 */

const STATUS_EMOJI: Record<Task["status"], string> = {
  done: "✅",
  in_progress: "🔨",
  blocked: "🚧",
  pending: "⬜",
};
const LIGHT: Record<ProofState, string> = { green: "🟢", red: "🔴", stale: "🟣", unproven: "⚪" };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export interface DashboardInput {
  project: string;
  tasks: Task[];
  rollups: RequirementRollup[];
  events: JournalEvent[];
  validates: Record<ProofState, number>;
  graphHtml: string | null;
  generatedAt: string;
}

export function renderDashboard(input: DashboardInput): string {
  const done = input.tasks.filter((t) => t.status === "done").length;
  const total = input.tasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const drifted = input.validates.red + input.validates.stale;

  const taskRows = input.tasks
    .map((t) => {
      const lights = t.boundChecks.map((r) => (!t.results[r] ? "⚪" : t.results[r]!.passed ? "🟢" : "🔴")).join("");
      return `<tr><td>${STATUS_EMOJI[t.status]}</td><td><b>${esc(t.id)}</b></td><td>${esc(t.title)}</td><td class="lights">${lights}</td><td>${esc(t.status)}</td></tr>`;
    })
    .join("\n");

  const reqRows = input.rollups
    .map(
      (r) =>
        `<tr><td>${r.proven ? "✅" : "⏳"}</td><td><b>${esc(r.id)}</b></td><td>${esc(r.title)}</td><td class="lights">${r.criteria.map((c) => LIGHT[c.proof]).join("")}</td></tr>`,
    )
    .join("\n");

  const approvals = input.events
    .filter((e) => e.type === "approval.recorded" || e.type === "governance")
    .slice(-8)
    .map((e) => {
      const d = e.data as Record<string, unknown>;
      return e.type === "approval.recorded"
        ? `<li>🔏 <b>${esc(String(d.approver))}</b> approved ${esc(((d.taskIds as string[]) ?? []).join(", "))} <span class="dim">${esc(e.at)}</span></li>`
        : `<li>🛡️ ${esc(String(d.kind))} <span class="dim">${esc(e.at)}</span></li>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet — ${esc(input.project)}</title>
<style>
  :root{--bg:#0d1117;--card:#161b22;--text:#e6edf3;--dim:#8b949e;--accent:#e8590c;--green:#3fb950}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,system-ui,sans-serif;padding:32px}
  h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;color:var(--dim);margin:28px 0 10px;text-transform:uppercase;letter-spacing:.08em}
  .card{background:var(--card);border:1px solid #21262d;border-radius:10px;padding:18px 20px;margin-top:10px}
  .bar{height:14px;background:#21262d;border-radius:7px;overflow:hidden;margin:10px 0}
  .bar>div{height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:7px;transition:width .6s}
  .pct{font-size:34px;font-weight:700}.dim{color:var(--dim);font-size:12px}
  table{width:100%;border-collapse:collapse}td{padding:6px 8px;border-top:1px solid #21262d}tr:first-child td{border-top:0}
  .lights{font-size:16px;letter-spacing:2px}.drift{background:#3d1d29;border:1px solid #f85149;color:#ffa198;border-radius:10px;padding:12px 16px;margin-top:14px}
  .pill{display:inline-block;margin-right:14px}iframe{width:100%;height:520px;border:1px solid #21262d;border-radius:10px;background:#fff}
  ul{margin:0;padding-left:18px}
</style></head><body>
<h1>📊 Rivet — ${esc(input.project)}</h1>
<div class="dim">generated ${esc(input.generatedAt)} · refresh with <code>rivet dashboard</code></div>

<div class="card">
  <span class="pct">${pct}%</span> <span class="dim">complete — ${done}/${total} task(s) done</span>
  <div class="bar"><div></div></div>
  <span class="pill">🟢 ${input.validates.green}</span><span class="pill">🔴 ${input.validates.red}</span>
  <span class="pill">🟣 ${input.validates.stale}</span><span class="pill">⚪ ${input.validates.unproven}</span>
</div>
${drifted > 0 ? `<div class="drift">🟣 <b>${drifted} proof(s) red/stale — drift detected.</b> Re-verify: <code>rivet drift</code></div>` : ""}

<h2>Tasks</h2><div class="card"><table>${taskRows || "<tr><td class='dim'>no tasks yet</td></tr>"}</table></div>
<h2>Requirements</h2><div class="card"><table>${reqRows || "<tr><td class='dim'>no specs yet</td></tr>"}</table></div>
<h2>Approvals &amp; governance</h2><div class="card"><ul>${approvals || "<li class='dim'>none recorded yet</li>"}</ul></div>
${input.graphHtml ? `<h2>Code graph (graphify)</h2><div class="card"><iframe src="${esc(input.graphHtml)}" title="code graph"></iframe></div>` : ""}
</body></html>`;
}

export function dashboardCmd(opts: { open?: boolean }): void {
  const cwd = process.cwd();
  const m = materialize(cwd, { refresh: false, write: false });
  const graphHtmlAbs = join(cwd, m.config.graphify.outDir, "graph.html");
  const html = renderDashboard({
    project: m.config.project.name,
    tasks: m.tasks,
    rollups: rollupRequirements(m.requirements, m.vtg),
    events: journalFor(cwd).read(),
    validates: summarize(m.vtg).validates,
    graphHtml: existsSync(graphHtmlAbs) ? `../${m.config.graphify.outDir}/graph.html` : null,
    generatedAt: new Date().toISOString(),
  });
  const out = join(cwd, ".rivet", "dashboard.html");
  writeFileSync(out, html);
  console.log(pc.green("✓ dashboard generated") + pc.dim(" → .rivet/dashboard.html (open in a browser)"));
  if (opts.open) spawnSync("open", [out], { stdio: "ignore" });
}
