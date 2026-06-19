#!/usr/bin/env node
/**
 * dev-spec-kit PreToolUse guard — gate protection (GATE-PROTECT-01).
 *
 * While a task is in flight, the agent must not edit the things that judge it: spec files, the gate
 * config, and any bound test file whose ref has already gone GREEN (pre-green edits are normal TDD).
 * Fix the code, don't weaken the gate. Escape hatch: a human-issued, time-boxed
 * `dev-spec-kit unlock <path> --minutes N` (journaled). Self-contained mirror of src/engine/protect.ts —
 * keep in sync. Exit 2 blocks the tool call.
 */
import { readFileSync, existsSync } from "node:fs";
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
  process.exit(0);
}

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
const toolName = payload.tool_name ?? payload.toolName;
if (!EDIT_TOOLS.has(toolName)) process.exit(0);
const filePath = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path;
if (!filePath) process.exit(0);

// Find the dev-spec-kit project root upward from cwd.
let dir = payload.cwd || process.cwd();
let root = null;
for (let i = 0; i < 10; i++) {
  if (existsSync(join(dir, ".dev-spec-kit"))) {
    root = dir;
    break;
  }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!root) process.exit(0);

// Fold the journal minimally: in-flight tasks + which refs have a passing run.
let events = [];
try {
  events = readFileSync(join(root, ".dev-spec-kit", "journal.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter((e) => e && typeof e.type === "string");
} catch {
  process.exit(0);
}

const tasks = new Map();
for (const e of events) {
  const d = e.data ?? {};
  if (e.type === "task.created" && d.id && !tasks.has(d.id)) {
    tasks.set(d.id, { boundChecks: d.boundChecks ?? [], status: "pending", proven: new Set() });
  } else if (e.type === "task.bindings" && tasks.has(d.id)) {
    tasks.get(d.id).boundChecks = d.boundChecks ?? tasks.get(d.id).boundChecks;
  } else if (e.type === "task.status" && tasks.has(d.id)) {
    tasks.get(d.id).status = d.status ?? tasks.get(d.id).status;
  } else if (e.type === "check.run" && tasks.has(d.taskId) && d.result?.passed && d.result?.ref) {
    tasks.get(d.taskId).proven.add(d.result.ref);
  }
}
const inFlight = [...tasks.entries()].filter(([, t]) => t.status !== "done");
if (inFlight.length === 0) process.exit(0);

const rootSlash = root.endsWith("/") ? root : root + "/";
const rel = String(filePath).startsWith(rootSlash) ? String(filePath).slice(rootSlash.length) : String(filePath);

// Human-issued unlock?
try {
  const unlock = JSON.parse(readFileSync(join(root, ".dev-spec-kit", "unlock.json"), "utf8"));
  if (Date.parse(unlock.until) > Date.now() && (unlock.paths ?? []).some((p) => rel === p || String(filePath).endsWith("/" + p))) {
    process.exit(0);
  }
} catch {
  /* no unlock */
}

const block = (what, ids) => {
  console.error(
    `dev-spec-kit guard: ${what} is protected while task(s) ${ids.join(", ")} are in flight — fix the code, don't weaken the gate.\n` +
      `If this edit is legitimate, ask the human to run: dev-spec-kit unlock ${rel} --minutes 30`,
  );
  process.exit(2);
};

const ids = inFlight.map(([id]) => id);
if (rel.startsWith(".dev-spec-kit/specs/") || rel === ".dev-spec-kit/config.json") block(rel, ids);

for (const [id, t] of inFlight) {
  for (const ref of t.proven) {
    if (!t.boundChecks.includes(ref)) continue;
    const file = ref.includes("::") ? ref.split("::")[0] : undefined;
    if (file && (rel === file || String(filePath).endsWith("/" + file))) block(rel, [id]);
    const maven = ref.match(/^([A-Za-z_][A-Za-z0-9_]*)#/);
    if (maven && (rel === `${maven[1]}.java` || String(filePath).endsWith(`/${maven[1]}.java`))) block(rel, [id]);
  }
}
process.exit(0);
