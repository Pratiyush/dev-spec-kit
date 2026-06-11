import { describe, it, expect } from "vitest";
import { renderDashboard } from "../src/cli/dashboard.js";
import type { Task } from "../src/engine/state/tasks.js";
import type { JournalEvent } from "../src/engine/state/journal.js";
import type { RequirementRollup } from "../src/engine/graph/build.js";

/** DASH-01 v1: a self-contained HTML dashboard — emoji language, completion %, traffic lights,
 *  drift banner, graphify embed — generated on demand from ground truth (his config: refresh-on-demand). */

const tasks: Task[] = [
  { id: "R-1", title: "login", status: "done", boundChecks: ["c1"], results: { c1: { ref: "c1", passed: true, at: "t" } } },
  { id: "R-2", title: "<script>alert(1)</script>", status: "in_progress", boundChecks: ["c2"], results: {} },
];
const rollups: RequirementRollup[] = [
  { id: "R-1", title: "login", criteria: [{ id: "R-1-AC1", bound: true, proof: "green" }], proven: true },
  { id: "R-2", title: "logout", criteria: [{ id: "R-2-AC1", bound: true, proof: "stale" }], proven: false },
];
const events: JournalEvent[] = [
  { at: "2026-06-12T10:00:00Z", type: "approval.recorded", data: { taskIds: ["R-1"], approver: "Pratiyush" } },
];

describe("renderDashboard", () => {
  const html = renderDashboard({
    project: "demo",
    tasks,
    rollups,
    events,
    validates: { green: 1, red: 0, stale: 1, unproven: 0 },
    graphHtml: "../graphify-out/graph.html",
    generatedAt: "2026-06-12T10:05:00Z",
  });

  it("shows completion percentage and the emoji language", () => {
    expect(html).toContain("50%"); // 1/2 done
    expect(html).toContain("✅");
    expect(html).toContain("🔨");
    expect(html).toContain("🟢");
    expect(html).toContain("🟣");
  });

  it("warns on drift (stale/red present) and links the code graph", () => {
    expect(html).toMatch(/drift|re-verify/i);
    expect(html).toContain("../graphify-out/graph.html");
  });

  it("escapes HTML in user content (titles can't inject script)", () => {
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("names the approver and the generation time (on-demand refresh model)", () => {
    expect(html).toContain("Pratiyush");
    expect(html).toContain("2026-06-12T10:05:00Z");
    expect(html).toMatch(/rivet dashboard/); // tells the user how to refresh
  });

  it("omits the graph section gracefully when graphify output is absent", () => {
    const none = renderDashboard({
      project: "demo",
      tasks,
      rollups,
      events,
      validates: { green: 2, red: 0, stale: 0, unproven: 0 },
      graphHtml: null,
      generatedAt: "t",
    });
    expect(none).not.toContain("graphify-out");
    expect(none).not.toMatch(/drift detected/i); // all green = no banner (the CSS class may exist)
  });
});
