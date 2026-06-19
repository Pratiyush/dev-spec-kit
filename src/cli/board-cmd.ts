import pc from "picocolors";
import { materialize, journalFor } from "./materialize.js";
import { rollupRequirements } from "../engine/graph/build.js";
import { writeBoards } from "./boards.js";

/** `dev-spec-kit board` — regenerate the boards from ground truth. */
export function boardCmd(): void {
  const cwd = process.cwd();
  const m = materialize(cwd, { refresh: false, write: false });
  writeBoards(cwd, m.tasks, journalFor(cwd).read(), rollupRequirements(m.requirements, m.vtg));
  console.log(
    pc.green("✓ boards regenerated") + pc.dim(" → .dev-spec-kit/LEDGER.md · .dev-spec-kit/TRACKING.md"),
  );
}
