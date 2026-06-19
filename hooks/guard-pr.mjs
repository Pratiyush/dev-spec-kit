#!/usr/bin/env node
/**
 * dev-spec-kit PreToolUse guard — PR creation (FIX-GATE-01 hardened).
 *
 * Self-contained mirror of src/engine/gate.ts gateVerdict (keep in sync): in a dev-spec-kit project,
 * "anything not green blocks" — and a MISSING or unreadable graph blocks too (state absence is not
 * permission). Matcher is quote-stripped and also catches the REST route (`gh api …/pulls`).
 * Known limit: shell variable indirection ($GH pr create) cannot be resolved here; GATE-PROTECT
 * and CI-side checks are the backstop. Exit 2 blocks the tool call.
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

const toolName = payload.tool_name ?? payload.toolName;
const rawCommand = payload.tool_input?.command ?? "";
if (toolName !== "Bash") process.exit(0);

// Strip quotes so `gh "pr" create` can't slip past; collapse whitespace.
const command = String(rawCommand).replace(/["']/g, "").replace(/\s+/g, " ");
const PR_RE = /\bgh\s+pr\s+create\b|\bglab\s+mr\s+create\b|\bgh\s+api\s+\S*\/pulls\b/i;
if (!PR_RE.test(command)) process.exit(0);

// Find the dev-spec-kit project root (the .dev-spec-kit DIR — not the graph) upward from cwd.
let dir = payload.cwd || process.cwd();
let rivetRoot = null;
for (let i = 0; i < 10; i++) {
  if (existsSync(join(dir, ".dev-spec-kit"))) {
    rivetRoot = dir;
    break;
  }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!rivetRoot) process.exit(0); // not a dev-spec-kit project — do not interfere

const block = (msg) => {
  console.error(`dev-spec-kit guard: blocking PR creation — ${msg}`);
  process.exit(2);
};

const graphPath = join(rivetRoot, ".dev-spec-kit", "graph.json");
if (!existsSync(graphPath)) block("no .dev-spec-kit/graph.json. Run `dev-spec-kit graph build` first (state absence is not permission).");

let graph;
try {
  graph = JSON.parse(readFileSync(graphPath, "utf8"));
} catch {
  block("unreadable .dev-spec-kit/graph.json. Rebuild it with `dev-spec-kit graph build`.");
}

const validates = (graph.edges ?? []).filter((e) => e.kind === "validates");
if (validates.length === 0) process.exit(0); // nothing bound — nothing to enforce
const bad = validates.filter((e) => e.proof !== "green");
if (bad.length === 0) {
  // FEAT-VERIFY-01 fast veto: the LAST verify.run must exist and be green. (Tree-freshness is
  // enforced strictly by `dev-spec-kit guard pr` / `dev-spec-kit pr`; the hook stays git-free and cheap.)
  let lastVerify = null;
  try {
    const lines = readFileSync(join(rivetRoot, ".dev-spec-kit", "journal.jsonl"), "utf8").split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line);
        if (ev.type === "verify.run") lastVerify = ev;
      } catch {}
    }
  } catch {}
  if (!lastVerify) block("no `dev-spec-kit verify` recorded — run it (build ALL + every kind) before a PR.");
  if (!lastVerify.data?.passed) block("last `dev-spec-kit verify` was RED — fix and re-run it before a PR.");
  process.exit(0);
}

block(
  `${bad.length}/${validates.length} proof(s) not green:\n` +
    bad.map((e) => `  ${String(e.proof).toUpperCase()} ${e.lastCheck?.ref ?? e.from}`).join("\n") +
    `\nRe-verify (dev-spec-kit drift / dev-spec-kit check run …) and rebuild (dev-spec-kit graph build) first.`,
);
