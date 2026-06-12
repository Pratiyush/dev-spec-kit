import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { materialize, journalFor, type Materialized } from "./materialize.js";
import { writeBoards } from "./boards.js";
import { renderResume } from "../engine/phase.js";
import { rollupRequirements } from "../engine/graph/build.js";
import { requirementKind } from "../engine/spec/ears.js";
import { buildRivet, writeSidecar } from "./cockpit-data.js";
import type { RivetConfig } from "../config/schema.js";

/**
 * REQUIREMENT_DOCS-01 — "every time we change anything, it should update the documents."
 * BOARDS-01 made LEDGER/TRACKING regenerate from truth; this extends the cannot-lie guarantee to
 * EVERY generated document: boards, RESUME.md, .rivet/graph.json, and the cockpit sidecar — called
 * by every MUTATING command (read-only queries stay read-only, FIX-QUERY-01).
 * dashboard.updates="on-demand" opts only the sidecar out. Best-effort by design: refreshing
 * documents must never break the command that did the real work.
 */
export function refreshDocs(cwd: string, config: RivetConfig, pre?: Materialized): void {
  try {
    const m = pre ?? materialize(cwd, { refresh: false }); // writes .rivet/graph.json
    const events = journalFor(cwd).read();
    const obligated = m.requirements.filter((r) => requirementKind(r.id) !== "adr");
    writeBoards(cwd, m.tasks, events, rollupRequirements(obligated, m.vtg));
    writeFileSync(join(cwd, ".rivet", "RESUME.md"), renderResume(m.tasks));
    if (config.dashboard.updates !== "on-demand") writeSidecar(cwd, buildRivet(cwd));
  } catch {
    /* the documents are derived; the journal already holds the truth */
  }
}
