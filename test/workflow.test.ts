import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { createApproval, ApprovalError } from "../src/engine/approvals.js";
import { buildPrBody } from "../src/engine/pr/body.js";
import { routeRequest } from "../src/engine/route/classify.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { buildVTG } from "../src/engine/graph/build.js";

function tempProject(): { dir: string; journal: Journal; store: TaskStore } {
  const dir = mkdtempSync(join(tmpdir(), "rivet-wf-"));
  const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
  return { dir, journal, store: new TaskStore(journal) };
}

describe("recorded approval", () => {
  it("refuses to approve a task that is not DONE", () => {
    const { dir, journal, store } = tempProject();
    store.create("T1", "t", ["c1"]);
    expect(() =>
      createApproval({ projectDir: dir, taskIds: ["T1"], store, journal, approver: "Pratiyush" }),
    ).toThrowError(ApprovalError);
  });

  it("writes a signed artifact with evidence and journals the gate", () => {
    const { dir, journal, store } = tempProject();
    store.create("T1", "Greeting API", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-11T10:00:00Z", sha: "abc12345" });
    store.markDone("T1");
    const { path, markdown } = createApproval({
      projectDir: dir,
      taskIds: ["T1"],
      store,
      journal,
      approver: "Pratiyush",
      note: "ship it",
    });
    expect(markdown).toContain("Approved by:** Pratiyush");
    expect(markdown).toContain("✅ `c1` @ abc12345");
    expect(markdown).toContain("ship it");
    expect(readFileSync(path, "utf8")).toContain("# Approval — T1");
    expect(journal.read().some((e) => e.type === "approval.recorded")).toBe(true);
  });
});

describe("graph-derived PR body", () => {
  it("reports binding coverage, traffic lights, and drift warnings from the graph", () => {
    const spec = `## Requirement R-1 — a\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n\n## Requirement R-2 — b\nWHEN p THEN the system SHALL q.\n@check kind=unit ref=B#b\n`;
    const requirements = parseSpec(spec);
    const graph = buildVTG({
      requirements,
      currentSha: "HEAD",
      tasks: [
        {
          id: "R-1",
          title: "a",
          status: "done",
          boundChecks: ["A#a"],
          results: { "A#a": { ref: "A#a", passed: true, at: "t", sha: "HEAD" } },
        },
        {
          id: "R-2",
          title: "b",
          status: "in_progress",
          boundChecks: ["B#b"],
          results: { "B#b": { ref: "B#b", passed: true, at: "t", sha: "OLD" } }, // stale
        },
      ],
    });
    const body = buildPrBody({
      title: "Greeting",
      requirements,
      graph,
      tasks: [],
      approvals: ["2026-06-11-T1.md"],
      headSha: "HEAD",
    });
    expect(body).toContain("1/2 acceptance criteria proven green (50%)");
    expect(body).toContain("🟢 green `A#a`");
    expect(body).toContain("🟣 stale `B#b`");
    expect(body).toContain("should not merge until re-verified");
    expect(body).toContain("2026-06-11-T1.md");
  });
});

describe("mode routing (the front door)", () => {
  it("routes investigation to research", () => {
    expect(routeRequest("investigate why the login is slow").mode).toBe("research");
  });
  it("routes small localized changes to quick", () => {
    expect(routeRequest("fix typo in the README").mode).toBe("quick");
    expect(routeRequest("change button color to green").mode).toBe("quick");
  });
  it("routes feature-scope to full-spec", () => {
    expect(routeRequest("build a new payment integration feature with webhooks").mode).toBe("full-spec");
  });
  it("want-signals veto research routing", () => {
    // Regression for the first dogfood lesson: a feature ask containing a research-y word
    // ("compare") was misrouted to research. Build-intent must veto investigation keywords.
    const featureAsk =
      "basically i want, you know, a portfolio page which shows all my holdings and graphs over time and compare with index etc";
    expect(routeRequest(featureAsk).mode).toBe("full-spec");
    // ...while genuine investigation (no build intent) still routes to research.
    expect(routeRequest("compare backtrader vs vectorbt for our backtesting").mode).toBe("research");
  });

  it("short ambiguous requests default to quick; longer ambiguous to full-spec", () => {
    expect(routeRequest("update the greeting").mode).toBe("quick");
    const long =
      "we need the service to handle the new account flows and also reconcile the records with the partner data when things change in either side over time somehow";
    expect(routeRequest(long).mode).toBe("full-spec");
  });
});
