import { describe, expect, it } from "vitest";
import { renderTaskReport } from "../src/cli/task-report.js";
import { renderLedger } from "../src/cli/boards.js";
import type { Task } from "../src/engine/state/tasks.js";

/**
 * FEAT-REPORT-01 — the moment of "done" is when evidence must be shown: a 📋 table of every bound
 * check (kind, state, proof identity, when) in the terminal AND persisted per-task in LEDGER.md.
 */

const TREE = "2b626e9957e01816103d7dc0a87d93a7523d297f";
const OLD_TREE = "fade1234567890fade1234567890fade12345678";

const task: Task = {
  id: "FEAT-X-01",
  title: "does the thing",
  status: "done",
  boundChecks: [
    "test/a.test.ts::happy",
    "test/a.test.ts::sad",
    "test/a.test.ts::stale",
    "test/a.test.ts::unrun",
  ],
  results: {
    "test/a.test.ts::happy": {
      ref: "test/a.test.ts::happy",
      passed: true,
      at: "2026-06-12T01:00:00Z",
      tree: TREE,
      kind: "unit",
    },
    "test/a.test.ts::sad": {
      ref: "test/a.test.ts::sad",
      passed: false,
      at: "2026-06-12T01:01:00Z",
      tree: TREE,
      kind: "e2e",
    },
    "test/a.test.ts::stale": {
      ref: "test/a.test.ts::stale",
      passed: true,
      at: "2026-06-12T00:00:00Z",
      tree: OLD_TREE,
    },
  },
};

describe("FEAT-REPORT-01 — 📋 per-task evidence table", () => {
  const report = renderTaskReport(task, TREE);

  it("is a markdown table headed 📋 with the five columns", () => {
    expect(report).toContain("📋");
    expect(report).toContain("| Check | Kind | State | Proof | Proven at |");
  });

  it("renders green, red, stale, and unproven rows with worst-case honesty", () => {
    expect(report).toMatch(/happy.*✅/);
    expect(report).toMatch(/sad.*❌/);
    expect(report).toMatch(/stale.*🟣/); // passed on an OLD tree = stale, not green
    expect(report).toMatch(/unrun.*⚪/);
  });

  it("stamps the tree identity, never a bare sha", () => {
    expect(report).toContain(`tree ${TREE.slice(0, 8)}`);
    expect(report).toContain(`tree ${OLD_TREE.slice(0, 8)}`);
  });

  it("shows the check kind when recorded and an em-dash when legacy results lack it", () => {
    expect(report).toMatch(/happy.*unit/);
    expect(report).toMatch(/sad.*e2e/);
    expect(report).toMatch(/stale[^|]*\|[^|]*—/); // kind column falls back
  });

  it("LEDGER.md persists the table under the task entry", () => {
    const ledger = renderLedger([task], [], TREE);
    expect(ledger).toContain("**FEAT-X-01**");
    expect(ledger).toContain("| Check | Kind | State | Proof | Proven at |");
    expect(ledger).toContain(`tree ${TREE.slice(0, 8)}`);
  });
});
