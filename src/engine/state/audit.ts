import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { Journal, type EventMeta } from "./journal.js";

/**
 * CLI audit trail (R-AUDIT-01 + AUDIT-META-01): every rivet invocation inside a Rivet project is
 * journaled as a `cli.run` event stamped with WHO acted (git user.name / RIVET_ACTOR) and WHICH
 * model drove it when known. Outside a Rivet project (no .rivet/) this is a no-op.
 */
export function auditCliRun(cwd: string, commandPath: string[], args: string[]): void {
  if (!existsSync(join(cwd, ".rivet"))) return;
  const meta: EventMeta = {};
  const actor = process.env.RIVET_ACTOR ?? gitUserName(cwd);
  if (actor) meta.actor = actor;
  const model = process.env.RIVET_MODEL ?? process.env.CLAUDE_MODEL ?? process.env.ANTHROPIC_MODEL;
  if (model) meta.model = model;
  new Journal(join(cwd, ".rivet", "journal.jsonl")).append(
    "cli.run",
    { command: commandPath.join(" "), args },
    Object.keys(meta).length > 0 ? { meta } : undefined,
  );
}

function gitUserName(cwd: string): string | undefined {
  const res = spawnSync("git", ["config", "user.name"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() || undefined : undefined;
}
