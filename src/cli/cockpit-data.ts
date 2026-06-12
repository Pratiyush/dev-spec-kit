import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { materialize, journalFor } from "./materialize.js";
import { collectRivetFiles } from "./dashboard.js";
import { rollupRequirements } from "../engine/graph/build.js";
import { requirementKind } from "../engine/spec/ears.js";
import { gitTreeHash } from "../engine/git.js";
import { generateManifest, SECTIONS, type Knob, type SectionMeta } from "../engine/config-manifest.js";
import type { JournalEvent } from "../engine/state/journal.js";

/**
 * REQUIREMENT_COCKPIT-02 — the `window.RIVET` sidecar: ONE machine-written object carrying every
 * truth the cockpit renders (the design's exact contract, .design/rivet-cockpit/rivet.data.js).
 * The shell is static; this file is what the CLI keeps rewriting. Truths that hurt stay in:
 * stale evidence is marked stale, failures carry their captured tails.
 */

export interface CockpitResult {
  passed: boolean;
  at: string;
  kind?: string;
  tail?: string;
  flaky?: boolean;
  /** FIX-PROOF doctrine: a pass recorded on an older code tree renders 🟣, never 🟢. */
  stale?: boolean;
}

export interface CockpitTask {
  id: string;
  title: string;
  status: string;
  boundChecks: string[];
  results: Record<string, CockpitResult>;
}

export interface RivetCockpitData {
  meta: {
    project: string;
    tagline: string;
    configPath: string;
    generatedAt: string;
    serverMode: boolean;
    refreshSeconds: number;
    inFlightTasks: string[];
  };
  nav: Array<{
    group: string;
    mode: string;
    items: Array<{ id: string; label: string; icon: string }> | "@sections";
  }>;
  dashboard: {
    completion: { done: number; total: number };
    validates: { green: number; red: number; stale: number; unproven: number };
    drift: number;
    graphHtml: string | null;
    tasks: CockpitTask[];
    requirements: Array<{
      id: string;
      title: string;
      proven: boolean;
      criteria: Array<{ id: string; proof: string }>;
    }>;
    approvals: Array<{ at: string; approver: string; taskIds: string[]; commit?: string }>;
    governance: Array<{ at: string; kind: string; detail: string; who?: string }>;
    activity: Array<{ at: string; icon: string; text: string; meta?: string }>;
    files: Array<{ name: string; content: string }>;
  };
  config: { sections: SectionMeta[]; manifest: Knob[] };
}

const ACTIVITY_LIMIT = 30;

const EVENT_ICON: Record<string, (d: Record<string, unknown>) => string> = {
  "cli.run": () => "🧾",
  "check.run": (d) => ((d.result as { passed?: boolean })?.passed ? "✅" : "❌"),
  "verify.run": (d) => (d.passed ? "✅" : "❌"),
  "task.created": () => "📋",
  "task.status": (d) => (d.status === "done" ? "🏁" : "🔁"),
  "task.bindings": () => "🔗",
  "approval.recorded": () => "🔏",
  governance: () => "🛡️",
  note: () => "📝",
};

function eventLine(e: JournalEvent): { icon: string; text: string } {
  const d = (e.data ?? {}) as Record<string, unknown>;
  const icon = (EVENT_ICON[e.type] ?? (() => "❓"))(d);
  switch (e.type) {
    case "cli.run":
      return { icon, text: `${String(d.command)} ${((d.args as string[]) ?? []).join(" ")}`.trim() };
    case "check.run": {
      const r = d.result as { ref?: string };
      return { icon, text: `check ${r?.ref ?? "?"} → ${String(d.taskId)}` };
    }
    case "verify.run":
      return { icon, text: `verify ${((d.steps as unknown[]) ?? []).length} step(s)` };
    case "task.created":
      return { icon, text: `task ${String(d.id)} created — ${String(d.title)}` };
    case "task.status":
      return { icon, text: `task ${String(d.id)} → ${String(d.status)}` };
    case "task.bindings":
      return { icon, text: `task ${String(d.id)} bindings synced` };
    case "approval.recorded":
      return { icon, text: `approve ${((d.taskIds as string[]) ?? []).join(" · ")}` };
    case "governance":
      return { icon, text: `${String(d.kind ?? "governance")}` };
    default:
      return { icon, text: e.type };
  }
}

export function buildRivet(cwd: string, opts: { serverMode?: boolean } = {}): RivetCockpitData {
  const m = materialize(cwd, { refresh: false, write: false });
  const events = journalFor(cwd).read();
  const tree = gitTreeHash(cwd);

  const tasks: CockpitTask[] = m.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    boundChecks: t.boundChecks,
    results: Object.fromEntries(
      Object.entries(t.results).map(([ref, r]) => [
        ref,
        {
          passed: r.passed,
          at: r.at,
          ...(r.kind ? { kind: r.kind } : {}),
          ...(r.tail ? { tail: r.tail } : {}),
          ...(r.flaky ? { flaky: true } : {}),
          ...(r.passed && r.tree && tree && r.tree !== tree ? { stale: true } : {}),
        },
      ]),
    ),
  }));

  const validates = { green: 0, red: 0, stale: 0, unproven: 0 };
  for (const e of m.vtg.edges) if (e.kind === "validates") validates[e.proof]++;

  const obligated = m.requirements.filter((r) => requirementKind(r.id) !== "adr");
  const requirements = rollupRequirements(obligated, m.vtg).map((r) => ({
    id: r.id,
    title: r.title,
    proven: r.proven,
    criteria: r.criteria.map((c) => ({ id: c.id.replace(`${r.id}-`, ""), proof: c.proof })),
  }));

  const approvals = events
    .filter((e) => e.type === "approval.recorded")
    .map((e) => {
      const d = e.data as { approver?: string; taskIds?: string[]; sha?: string };
      return {
        at: e.at,
        approver: String(d.approver ?? "unknown"),
        taskIds: d.taskIds ?? [],
        ...(d.sha ? { commit: d.sha.slice(0, 8) } : {}),
      };
    })
    .reverse();

  const governance = events
    .filter((e) => e.type === "governance")
    .map((e) => {
      const d = e.data as Record<string, unknown>;
      const detail = Object.entries(d)
        .filter(([k, v]) => k !== "kind" && v !== undefined)
        .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(",") : String(v)}`)
        .join(" · ");
      return {
        at: e.at,
        kind: String(d.kind ?? "governance"),
        detail,
        ...(e.meta?.actor ? { who: e.meta.actor } : {}),
      };
    })
    .reverse();

  const activity = events
    .slice(-ACTIVITY_LIMIT)
    .map((e) => {
      const { icon, text } = eventLine(e);
      const meta = [e.meta?.actor, e.meta?.model].filter(Boolean).join(" · ");
      return { at: e.at, icon, text, ...(meta ? { meta } : {}) };
    })
    .reverse();

  const graphHtmlPath = join(cwd, m.config.graphify.outDir, "graph.html");
  const done = m.tasks.filter((t) => t.status === "done").length;

  return {
    meta: {
      project: m.config.project.name === "untitled" ? "rivet" : m.config.project.name,
      tagline: "evidence-bound delivery",
      configPath: ".rivet/config.json",
      generatedAt: new Date().toISOString(),
      serverMode: opts.serverMode ?? false,
      refreshSeconds: m.config.dashboard.refreshSeconds,
      inFlightTasks: m.tasks.filter((t) => t.status === "in_progress").map((t) => t.id),
    },
    nav: [
      {
        group: "Dashboard",
        mode: "dashboard",
        items: [
          { id: "overview", label: "Overview", icon: "◎" },
          { id: "tasks", label: "Tasks", icon: "✅" },
          { id: "requirements", label: "Requirements", icon: "📐" },
          { id: "graph", label: "Graph", icon: "🕸️" },
          { id: "activity", label: "Activity", icon: "🧾" },
          { id: "files", label: "Artifacts", icon: "📁" },
        ],
      },
      { group: "Config", mode: "config", items: "@sections" },
    ],
    dashboard: {
      completion: { done, total: m.tasks.length },
      validates,
      drift: validates.red + validates.stale,
      // served/opened from .rivet/cockpit/ — the graph lives two levels up
      graphHtml: existsSync(graphHtmlPath) ? `../../${m.config.graphify.outDir}/graph.html` : null,
      tasks,
      requirements,
      approvals,
      governance,
      activity,
      files: collectRivetFiles(cwd),
    },
    config: { sections: SECTIONS, manifest: generateManifest(m.config) },
  };
}

/**
 * The sidecar source. `<` is escaped so no value can close/open a script tag (defense-in-depth:
 * the sidecar is loaded as an EXTERNAL <script src>, where it can't break out anyway); U+2028 and
 * U+2029 are escaped because JSON.stringify emits them raw and they are JS line terminators that
 * break a parser if the bytes are ever inlined (finding #11).
 */
export function sidecarJs(data: RivetCockpitData): string {
  const body = JSON.stringify(data, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `window.RIVET = ${body};\n`;
}

export function writeSidecar(cwd: string, data: RivetCockpitData): string {
  const dir = join(cwd, ".rivet", "cockpit");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "rivet.data.js");
  writeFileSync(path, sidecarJs(data));
  return path;
}
