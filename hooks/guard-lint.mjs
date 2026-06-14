#!/usr/bin/env node
/**
 * Rivet Stop guard — surface spec drift before the agent declares done (FEAT-LINT-01, Stop half).
 *
 * Self-contained mirror of `rivet spec lint`'s dangling-ref check (keep in sync with
 * src/engine/spec/lint.ts): resolve every @check ref — from .rivet/specs/*.md AND from task
 * bindings in the journal — against the test files; a missing file or a vanished test name is
 * ORPHANED. On drift, exit 2 to block the stop ONCE so it can't persist unnoticed; `stop_hook_active`
 * guards against a loop (a second stop is allowed through). Pure file reads — no spawn, cheap.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
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

// Already inside a stop-hook retry — never loop; let the agent stop.
if (payload.stop_hook_active) process.exit(0);

// Find the Rivet project root (the .rivet dir) upward from cwd.
let dir = payload.cwd || process.cwd();
let root = null;
for (let i = 0; i < 12; i++) {
  if (existsSync(join(dir, ".rivet"))) {
    root = dir;
    break;
  }
  const parent = dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!root) process.exit(0); // not a Rivet project — do not interfere

const refs = new Map(); // ref -> owner

// @check refs declared in the specs.
const specsDir = join(root, ".rivet", "specs");
if (existsSync(specsDir)) {
  for (const f of readdirSync(specsDir)) {
    if (!f.endsWith(".md")) continue;
    let text = "";
    try {
      text = readFileSync(join(specsDir, f), "utf8");
    } catch {
      continue;
    }
    for (const m of text.matchAll(/@check[^\n]*\bref=(.+)/g)) {
      const ref = m[1].trim();
      if (ref && !refs.has(ref)) refs.set(ref, f);
    }
  }
}

// Task boundChecks from the journal (last write wins; catches tasks whose ref left the spec).
try {
  const lines = readFileSync(join(root, ".rivet", "journal.jsonl"), "utf8").split("\n");
  const bound = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }
    if (
      (ev.type === "task.created" || ev.type === "task.bindings") &&
      ev.data?.id &&
      Array.isArray(ev.data.boundChecks)
    ) {
      bound.set(ev.data.id, ev.data.boundChecks);
    }
  }
  for (const [id, checks] of bound) for (const ref of checks) if (!refs.has(ref)) refs.set(ref, `task ${id}`);
} catch {
  /* no journal — specs alone are enough */
}

// Resolve each ref against the working tree; collect orphans.
const orphans = [];
for (const [ref, owner] of refs) {
  const idx = ref.indexOf("::");
  const file = idx === -1 ? ref : ref.slice(0, idx);
  const name = idx === -1 ? undefined : ref.slice(idx + 2);
  if (!/[./]/.test(file)) continue; // selector-only (e.g. maven Class#method) — not statically resolvable
  let text;
  try {
    text = readFileSync(join(root, file), "utf8");
  } catch {
    orphans.push(`${ref}  (file not found; ${owner})`);
    continue;
  }
  if (name !== undefined && !text.includes(name)) orphans.push(`${ref}  (test renamed?; ${owner})`);
}

if (orphans.length === 0) process.exit(0);
console.error(
  `rivet guard: ${orphans.length} orphaned @check ref(s) — the spec has drifted. Fix before finishing:\n` +
    orphans.map((o) => `  ✗ ${o}`).join("\n") +
    `\nRun \`rivet spec lint\`, then re-sync with \`rivet spec tasks\`.`,
);
process.exit(2);
