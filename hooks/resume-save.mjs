#!/usr/bin/env node
/**
 * Rivet PreCompact hook (COMPACT-01) — before the conversation is compacted, write the state-only
 * handoff so the post-compact context rehydrates from ground truth: `.rivet/RESUME.md`, generated
 * from the journal (never hand-written). Self-contained mirror of src/engine/phase.ts renderResume —
 * keep in sync. Always exits 0: a failed save must never block compaction.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  /* fine */
}

let dir = payload.cwd || process.cwd();
let root = null;
for (let i = 0; i < 10; i++) {
  if (existsSync(join(dir, ".rivet"))) {
    root = dir;
    break;
  }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!root) process.exit(0);

const tasks = new Map();
try {
  const lines = readFileSync(join(root, ".rivet", "journal.jsonl"), "utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    const d = e?.data ?? {};
    if (e.type === "task.created" && d.id && !tasks.has(d.id)) {
      tasks.set(d.id, { id: d.id, title: d.title ?? d.id, status: "pending", boundChecks: d.boundChecks ?? [], proven: new Set() });
    } else if (e.type === "task.bindings" && tasks.has(d.id)) {
      tasks.get(d.id).boundChecks = d.boundChecks ?? tasks.get(d.id).boundChecks;
    } else if (e.type === "task.status" && tasks.has(d.id)) {
      tasks.get(d.id).status = d.status ?? tasks.get(d.id).status;
    } else if (e.type === "check.run" && tasks.has(d.taskId) && d.result?.passed && d.result?.ref) {
      tasks.get(d.taskId).proven.add(d.result.ref);
    }
  }
} catch {
  /* empty journal is a valid state */
}

const all = [...tasks.values()];
const done = all.filter((t) => t.status === "done").length;
const open = all.find((t) => t.status === "in_progress") ?? all.find((t) => t.status !== "done");

const lines = [
  "# RESUME — state-only handoff (generated from the journal; do not edit)",
  "",
  `Board: ${done}/${all.length} task(s) done.`,
  "",
];
if (!open) {
  lines.push("✅ all task(s) done — nothing open. Next: `rivet graph build` → `rivet pr`.");
} else {
  lines.push("## THE ONE OPEN ACTION", "", `→ **${open.id}** — ${open.title} (${open.status})`);
  for (const ref of open.boundChecks.filter((r) => !open.proven.has(r))) lines.push(`  ○ unproven: \`${ref}\``);
  lines.push("");
}
lines.push("## Rebuild truth", "", "`rivet status` · `rivet graph build` · `rivet log -n 10`", "");

try {
  writeFileSync(join(root, ".rivet", "RESUME.md"), lines.join("\n"));
} catch {
  /* never block compaction */
}
process.exit(0);
