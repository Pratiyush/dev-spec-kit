import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { defaultConfig, PLATFORM_VALUES } from "../config/schema.js";
import { seedPractices } from "../engine/practices.js";
import { label } from "./emoji.js";

const LAWS_TEMPLATE = `# Project Laws

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
  platforms?: string;
}

/** Parse + validate the --platforms comma list against the schema vocabulary. */
function parsePlatforms(raw: string): string[] {
  const platforms = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const bad = platforms.filter((p) => !(PLATFORM_VALUES as readonly string[]).includes(p));
  if (bad.length > 0) {
    throw new Error(`unknown platform(s): ${bad.join(", ")} — allowed: ${PLATFORM_VALUES.join(", ")}`);
  }
  return platforms;
}

/**
 * `rivet init` — initialize Rivet in the current project. Creates the committed `.rivet/` durable
 * state (config, laws, specs, journal), seeds per-platform best-practice law packs
 * (FEAT-INITPACKS-01), and ensures graphify's derived output is gitignored.
 */
export function runInit(opts: InitOptions): void {
  const cwd = process.cwd();
  const rivetDir = join(cwd, ".rivet");
  const configPath = join(rivetDir, "config.json");
  const lawsPath = join(rivetDir, "laws.md");
  const journalPath = join(rivetDir, "journal.jsonl");
  const platforms = opts.platforms ? parsePlatforms(opts.platforms) : [];

  if (existsSync(configPath) && !opts.force) {
    if (platforms.length === 0) {
      console.log(pc.yellow("Rivet is already initialized here. Use --force to overwrite the config."));
      return;
    }
    // Re-run with --platforms: update ONLY project.platforms (never clobber a tuned config).
    const existing = JSON.parse(readFileSync(configPath, "utf8")) as { project?: Record<string, unknown> };
    existing.project = { ...(existing.project ?? {}), platforms };
    writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n");
    const packs = seedPractices(cwd, platforms, false);
    printSeeded(platforms, packs);
    return;
  }

  mkdirSync(join(rivetDir, "specs"), { recursive: true });
  mkdirSync(join(rivetDir, "intake"), { recursive: true });
  mkdirSync(join(rivetDir, "cache"), { recursive: true });

  const config = defaultConfig();
  if (platforms.length > 0) config.project.platforms = platforms as never;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  if (!existsSync(lawsPath) || opts.force) writeFileSync(lawsPath, LAWS_TEMPLATE);
  if (!existsSync(journalPath)) writeFileSync(journalPath, "");

  // graphify's output is a derived index; keep it out of git (it is regenerated from code).
  ensureGitignore(cwd, ["graphify-out/", ".graphify/", ".rivet/cache/", ".rivet/tmp/"]);

  console.log(pc.green("✓ Initialized Rivet in ") + pc.bold(".rivet/"));
  console.log(pc.dim("  config.json · laws.md · specs/ · journal.jsonl"));
  if (platforms.length > 0) printSeeded(platforms, seedPractices(cwd, platforms, opts.force ?? false));
  console.log("\nNext: " + pc.bold("rivet doctor") + pc.dim("  (check prerequisites, including graphify)"));
}

function printSeeded(platforms: string[], packs: { seeded: string[]; skipped: string[] }): void {
  console.log(`${label("scaffold")} platforms: ${platforms.join(", ")}`);
  for (const f of packs.seeded) console.log(pc.green(`  + .rivet/laws/${f}`));
  for (const f of packs.skipped) console.log(pc.dim(`  = .rivet/laws/${f} (exists — kept; --force re-seeds)`));
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
