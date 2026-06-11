#!/usr/bin/env node
/**
 * Rivet PreToolUse guard — the hard gate no SDD tool ships.
 *
 * Self-contained (no deps, no build) so it works straight from a plugin install. Reads the hook
 * payload on stdin; when the Bash command is about to create a PR (`gh pr create` / `glab mr create`)
 * in a Rivet project whose Verified Traceability Graph has non-green proofs, it exits 2 — which
 * blocks the tool call and feeds the reason back to the agent. Everything else passes through.
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
  process.exit(0); // malformed payload — never break unrelated tool calls
}

const toolName = payload.tool_name ?? payload.toolName;
const command = payload.tool_input?.command ?? "";
if (toolName !== "Bash" || !/\b(gh\s+pr\s+create|glab\s+mr\s+create)\b/.test(command)) {
  process.exit(0);
}

// Find the Rivet graph upward from the hook's cwd (worktrees, monorepos).
let dir = payload.cwd || process.cwd();
let graphPath = null;
for (let i = 0; i < 10; i++) {
  const candidate = join(dir, ".rivet", "graph.json");
  if (existsSync(candidate)) {
    graphPath = candidate;
    break;
  }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!graphPath) process.exit(0); // not a Rivet project — do not interfere

let graph;
try {
  graph = JSON.parse(readFileSync(graphPath, "utf8"));
} catch {
  process.exit(0);
}

const validates = (graph.edges ?? []).filter((e) => e.kind === "validates");
const bad = validates.filter((e) => e.proof !== "green");
if (bad.length === 0) process.exit(0);

console.error(
  `rivet guard: blocking PR creation — ${bad.length}/${validates.length} proof(s) not green:\n` +
    bad.map((e) => `  ${String(e.proof).toUpperCase()} ${e.lastCheck?.ref ?? e.from}`).join("\n") +
    `\nRe-run the checks (rivet check run …) and rebuild the graph (rivet graph build) first.`,
);
process.exit(2);
