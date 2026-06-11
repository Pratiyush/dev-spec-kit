import { writeFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { TaskStore } from "../engine/state/tasks.js";
import { renderResume } from "../engine/phase.js";
import { journalFor } from "./materialize.js";

/** `rivet resume` — write + print the state-only handoff, generated from the journal. */
export function resumeCmd(): void {
  const cwd = process.cwd();
  const tasks = [...new TaskStore(journalFor(cwd)).all().values()];
  const text = renderResume(tasks);
  writeFileSync(join(cwd, ".rivet", "RESUME.md"), text);
  console.log(text);
  console.log(pc.dim("→ saved to .rivet/RESUME.md (also auto-saved by the PreCompact hook)"));
}
