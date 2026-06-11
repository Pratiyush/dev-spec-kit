import { describe, it, expect } from "vitest";
import { renderDashboard, type DesignData } from "../src/cli/dashboard.js";

/** DASH-02: Pratiyush's design.html is THE template — renderDashboard injects real data into its
 *  DATA block (sanitized), leaving his tabs/renderers untouched. */

const data: DesignData = {
  project: "demo",
  generatedAt: "2026-06-12T10:05:00Z",
  completion: { done: 1, total: 2 },
  validates: { green: 1, red: 0, stale: 1, unproven: 0 },
  tasks: [
    {
      id: "R-1",
      title: "login",
      status: "done",
      boundChecks: ["c1"],
      results: { c1: { ref: "c1", passed: true, at: "t" } },
      trail: {
        summary: { binding: "done", tddRed: "done", proof: "green", doneGate: "passed (1 blocked)", approval: "recorded" },
        timeline: [{ at: "2026-06-12T10:02:00Z", gate: "done-gate", outcome: "blocked" }],
      },
    },
    {
      id: "R-2",
      title: "<script>alert(1)</script>",
      status: "in_progress",
      boundChecks: ["c2"],
      results: {},
      trail: { summary: { binding: "done", tddRed: "skipped", proof: "pending", doneGate: "pending", approval: "pending" }, timeline: [] },
    },
  ],
  requirements: [{ id: "R-1", title: "login", proven: true, criteria: [{ id: "AC1", proof: "green" }] }],
  approvals: [{ at: "t", approver: "Pratiyush", taskIds: ["R-1"] }],
  governance: [],
  activity: [{ at: "2026-06-12T10:10:01Z", icon: "🏁", text: "task R-1 → done" }],
  graphHtml: null,
  drift: 1,
  files: [{ name: "laws.md", content: "# Laws" }],
};

describe("renderDashboard (template injection)", () => {
  const html = renderDashboard(data);

  it("uses the design template (his tabs and views are present)", () => {
    for (const id of ["view-overview", "view-tasks", "view-requirements", "view-graph", "view-activity", "view-files"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("injects the real DATA (sample block fully replaced)", () => {
    expect(html).toContain('"project":"demo"');
    expect(html).toContain('"completion":{"done":1,"total":2}');
    expect(html).not.toContain("DASH-01"); // sample data gone
    expect(html).toContain('"trail"'); // gate trails ride along
  });

  it("sanitizes injected JSON — a title cannot break out of the script tag", () => {
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("\\u003cscript"); // < escaped inside the JSON string
  });

  it("renders gate-trail UI hooks in the template", () => {
    expect(html).toContain("trail"); // taskCard consumes t.trail
    expect(html).toMatch(/done-gate|gate-chip|trail-row/);
  });
});
