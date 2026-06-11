import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { defaultConfig } from "../config/schema.js";

const CONSTITUTION_TEMPLATE = `# Project Constitution

> The rules Rivet must always obey for this project. Three scopes are supported (Kiro-style steering):
> always-on (this file), file-match, and on-summon. A personal default can be inherited and overridden here.

## Standards
- (add your do's and don'ts here)

## Tech & conventions
- (stacks, libraries, naming, structure, folder layout)

## Hard rules (never violate)
- Commits are authored by the human, never co-authored by the AI.
- A task is not "done" until its bound checks pass (evidence-bound completion).
- Reuse existing code before writing new; follow the surrounding patterns.
`;

interface InitOptions {
  force?: boolean;
}

/**
 * `rivet init` — initialize Rivet in the current project. Creates the committed `.rivet/` durable
 * state (config, constitution, specs, journal) and ensures graphify's derived output is gitignored.
 */
export function runInit(opts: InitOptions): void {
  const cwd = process.cwd();
  const rivetDir = join(cwd, ".rivet");
  const configPath = join(rivetDir, "config.json");
  const constitutionPath = join(rivetDir, "constitution.md");
  const journalPath = join(rivetDir, "journal.jsonl");

  if (existsSync(configPath) && !opts.force) {
    console.log(pc.yellow("Rivet is already initialized here. Use --force to overwrite the config."));
    return;
  }

  mkdirSync(join(rivetDir, "specs"), { recursive: true });
  mkdirSync(join(rivetDir, "intake"), { recursive: true });
  mkdirSync(join(rivetDir, "cache"), { recursive: true });

  writeFileSync(configPath, JSON.stringify(defaultConfig(), null, 2) + "\n");
  if (!existsSync(constitutionPath) || opts.force) writeFileSync(constitutionPath, CONSTITUTION_TEMPLATE);
  if (!existsSync(journalPath)) writeFileSync(journalPath, "");

  // graphify's output is a derived index; keep it out of git (it is regenerated from code).
  ensureGitignore(cwd, ["graphify-out/", ".graphify/", ".rivet/cache/", ".rivet/tmp/"]);

  console.log(pc.green("✓ Initialized Rivet in ") + pc.bold(".rivet/"));
  console.log(pc.dim("  config.json · constitution.md · specs/ · journal.jsonl"));
  console.log("\nNext: " + pc.bold("rivet doctor") + pc.dim("  (check prerequisites, including graphify)"));
}

/** Append any missing entries to the project's .gitignore (idempotent). */
function ensureGitignore(cwd: string, entries: string[]): void {
  const path = join(cwd, ".gitignore");
  const content = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = content.split(/\r?\n/);
  const missing = entries.filter((e) => !lines.includes(e));
  if (missing.length === 0) return;
  const prefix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
  appendFileSync(path, `${prefix}\n# Rivet / graphify (derived, regenerated)\n${missing.join("\n")}\n`);
}
