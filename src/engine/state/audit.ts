import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { Journal, type EventMeta } from "./journal.js";

/**
 * CLI audit trail (R-AUDIT-01 + AUDIT-META-01): every dev-spec-kit invocation inside a dev-spec-kit project is
 * journaled as a `cli.run` event stamped with WHO acted (git user.name / DEV_SPEC_KIT_ACTOR) and WHICH
 * model drove it when known. Outside a dev-spec-kit project (no .dev-spec-kit/) this is a no-op.
 */
/** Read-only commands — skipped in `memory.journal: "milestones"` mode (SCALE-01 noise gating). */
const READ_ONLY = new Set(["status", "log", "trace", "affected", "route", "doctor", "resume", "guard"]);

export function auditCliRun(cwd: string, commandPath: string[], args: string[]): void {
  if (!existsSync(join(cwd, ".dev-spec-kit"))) return;
  if (journalMode(cwd) === "milestones" && READ_ONLY.has(commandPath[0] ?? "")) return;
  const meta: EventMeta = {};
  const actor = process.env.DEV_SPEC_KIT_ACTOR ?? gitUserName(cwd);
  if (actor) meta.actor = actor;
  const model = process.env.DEV_SPEC_KIT_MODEL ?? process.env.CLAUDE_MODEL ?? process.env.ANTHROPIC_MODEL;
  if (model) meta.model = model;
  new Journal(join(cwd, ".dev-spec-kit", "journal.jsonl")).append(
    "cli.run",
    { command: commandPath.join(" "), args },
    Object.keys(meta).length > 0 ? { meta } : undefined,
  );
}

function gitUserName(cwd: string): string | undefined {
  const res = spawnSync("git", ["config", "user.name"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() || undefined : undefined;
}

/** Raw, dependency-light config peek (audit must never crash or import the CLI layer). */
function journalMode(cwd: string): string {
  try {
    const raw = JSON.parse(readFileSync(join(cwd, ".dev-spec-kit", "config.json"), "utf8")) as {
      memory?: { journal?: string };
    };
    return raw.memory?.journal ?? "full";
  } catch {
    return "full";
  }
}
