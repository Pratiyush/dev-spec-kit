import { existsSync } from "node:fs";
import { join } from "node:path";
import { Journal } from "./journal.js";

/**
 * CLI audit trail (R-AUDIT-01): every rivet invocation inside a Rivet project is journaled as a
 * `cli.run` event — the answer to "what all was done here?" is always one `rivet log` away.
 * Outside a Rivet project (no .rivet/) this is a no-op: auditing must never scatter journals.
 */
export function auditCliRun(cwd: string, commandPath: string[], args: string[]): void {
  if (!existsSync(join(cwd, ".rivet"))) return;
  new Journal(join(cwd, ".rivet", "journal.jsonl")).append("cli.run", {
    command: commandPath.join(" "),
    args,
  });
}
