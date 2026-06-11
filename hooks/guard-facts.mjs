#!/usr/bin/env node
/**
 * Rivet PreToolUse guard — investigative gate (GATE-FACTS-01, opt-in via config gates.facts="on").
 *
 * DENY the first edit to a file with a demand for named facts; ALLOW the retry within 30 minutes.
 * The denial is the feature: forcing the agent to gather importers/criteria/instructions creates
 * the context that changes the output (ECC GateGuard, A/B-evidenced). Self-contained mirror of
 * src/engine/facts.ts — keep in sync. Bounded state in .rivet/cache/gateguard.json. Exit 2 = deny.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const WINDOW_MS = 30 * 60_000;
const CAP = 500;

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
if (!EDIT_TOOLS.has(payload.tool_name ?? payload.toolName)) process.exit(0);
const filePath = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path;
if (!filePath) process.exit(0);

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

// Opt-in only — ceremony stays proportional.
let config = {};
try {
  config = JSON.parse(readFileSync(join(root, ".rivet", "config.json"), "utf8"));
} catch {
  process.exit(0);
}
if (config?.gates?.facts !== "on") process.exit(0);

const statePath = join(root, ".rivet", "cache", "gateguard.json");
let state = { entries: {} };
try {
  state = JSON.parse(readFileSync(statePath, "utf8"));
  if (!state || typeof state !== "object" || !state.entries) state = { entries: {} };
} catch {
  /* fresh state */
}

const rootSlash = root.endsWith("/") ? root : root + "/";
const rel = String(filePath).startsWith(rootSlash) ? String(filePath).slice(rootSlash.length) : String(filePath);
const now = Date.now();
const entry = state.entries[rel];
if (entry && entry.allowedUntil > now) process.exit(0); // facts were demanded — retry allowed

state.entries[rel] = { allowedUntil: now + WINDOW_MS };
const keys = Object.keys(state.entries);
if (keys.length > CAP) {
  keys
    .sort((a, b) => state.entries[a].allowedUntil - state.entries[b].allowedUntil)
    .slice(0, keys.length - CAP)
    .forEach((k) => delete state.entries[k]);
}
try {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state));
} catch {
  /* state write failure must not crash the gate */
}

console.error(
  `rivet facts-gate: first edit to ${rel} DENIED — investigate before changing it:\n` +
    `  1. list every importer/usage of ${rel} (grep it, or: rivet affected <symbol>)\n` +
    `  2. name the requirement id + criterion this edit serves (quote the EARS sentence)\n` +
    `  3. quote the user's current instruction verbatim\n` +
    `Present those facts, then retry — the edit will be allowed for 30 minutes.`,
);
process.exit(2);
