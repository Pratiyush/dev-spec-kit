import { describe, it, expect } from "vitest";
import { renderLedger, renderTracking } from "../src/cli/boards.js";
import { buildVTG, rollupRequirements } from "../src/engine/graph/build.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import type { JournalEvent } from "../src/engine/state/journal.js";
import type { Task } from "../src/engine/state/tasks.js";

/** BOARDS-01: LEDGER and TRACKING are GENERATED views — boards that cannot lie. */

const task = (id: string, status: Task["status"], passed?: boolean): Task => ({
  id,
  title: `title-${id}`,
  status,
  boundChecks: ["c1"],
  results: passed === undefined ? {} : { c1: { ref: "c1", passed, at: "t", sha: "S", tree: "T" } },
});

const events: JournalEvent[] = [
  { at: "2026-06-12T09:00:00Z", type: "approval.recorded", data: { taskIds: ["R-1"], approver: "Pratiyush" } },
  { at: "2026-06-12T09:01:00Z", type: "governance", data: { kind: "unlock", paths: ["x"], until: "u" } },
  { at: "2026-06-12T09:02:00Z", type: "cli.run", data: { command: "task done", args: ["R-1"] } },
];

describe("renderLedger — progress + approvals/governance + activity, from ground truth", () => {
  it("contains the three sections with real content", () => {
    const out = renderLedger([task("R-1", "done", true), task("R-2", "in_progress", false)], events);
    expect(out).toContain("generated from the journal");
    expect(out).toMatch(/Progress/i);
    expect(out).toContain("1/2"); // board math
    expect(out).toMatch(/Approvals/i);
    expect(out).toContain("Pratiyush");
    expect(out).toContain("🛡️"); // governance surfaces in the ledger
    expect(out).toMatch(/Activity/i);
    expect(out).toContain("task done R-1");
  });
});

describe("renderTracking — per-requirement DoD table", () => {
  it("rows carry proof lights, task status, and approval state", () => {
    const spec = `## Requirement R-1 — login\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=c1\n\n## Requirement R-2 — logout\nWHEN p THEN the system SHALL q.\n@check kind=unit ref=c2\n`;
    const requirements = parseSpec(spec);
    const tasks: Task[] = [
      { id: "R-1", title: "login", status: "done", boundChecks: ["c1"], results: { c1: { ref: "c1", passed: true, at: "t", sha: "S", tree: "T" } } },
      { id: "R-2", title: "logout", status: "in_progress", boundChecks: ["c2"], results: {} },
    ];
    const vtg = buildVTG({ requirements, tasks, currentSha: "S", currentTree: "T" });
    const out = renderTracking(rollupRequirements(requirements, vtg), tasks, events);
    expect(out).toContain("generated");
    expect(out).toMatch(/R-1.*🟢.*done.*✅/); // proven + approved row
    expect(out).toMatch(/R-2.*⚪.*in_progress.*—/); // unproven + unapproved row
  });
});
