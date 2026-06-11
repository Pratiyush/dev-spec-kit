import { describe, it, expect } from "vitest";
import { deriveTrail } from "../src/engine/trail.js";
import type { JournalEvent } from "../src/engine/state/journal.js";

/** TRAIL-01: every gate a task crossed — minute-level, with blocked attempts INFERRED from the
 *  journal (a `task done` cli.run with no matching status flip = the gate said no). */

const ev = (at: string, type: JournalEvent["type"], data: unknown): JournalEvent => ({ at, type, data });

const EVENTS: JournalEvent[] = [
  ev("2026-06-12T10:00:00Z", "task.created", { id: "T1", title: "t", boundChecks: ["a.test.ts::x"] }),
  ev("2026-06-12T10:01:00Z", "task.status", { id: "T1", status: "in_progress" }),
  ev("2026-06-12T10:02:00Z", "cli.run", { command: "task done", args: ["T1"] }), // premature → BLOCKED
  ev("2026-06-12T10:05:00Z", "check.run", { taskId: "T1", result: { ref: "a.test.ts::x", passed: false, at: "2026-06-12T10:05:00Z" } }),
  ev("2026-06-12T10:09:00Z", "check.run", { taskId: "T1", result: { ref: "a.test.ts::x", passed: true, at: "2026-06-12T10:09:00Z" } }),
  ev("2026-06-12T10:10:00Z", "cli.run", { command: "task done", args: ["T1"] }),
  ev("2026-06-12T10:10:01Z", "task.status", { id: "T1", status: "done" }),
  ev("2026-06-12T10:15:00Z", "approval.recorded", { taskIds: ["T1"], approver: "Pratiyush" }),
  // unrelated noise that must not leak into T1's trail
  ev("2026-06-12T10:16:00Z", "task.created", { id: "T2", title: "other", boundChecks: [] }),
];

describe("deriveTrail — full lifecycle", () => {
  const { timeline, summary } = deriveTrail(EVENTS, "T1");

  it("orders the gates and infers the blocked done attempt", () => {
    const gates = timeline.map((e) => `${e.gate}:${e.outcome}`);
    expect(gates).toEqual([
      "binding:bound",
      "start:started",
      "done-gate:blocked",
      "proof:red",
      "proof:green",
      "done-gate:passed",
      "approval:recorded",
    ]);
    expect(timeline[2]!.at).toBe("2026-06-12T10:02:00Z"); // minute-level timestamps preserved
  });

  it("summarizes every gate: done/blocked counts/skipped/pending", () => {
    expect(summary.binding).toBe("done");
    expect(summary.tddRed).toBe("done"); // a red run was journaled
    expect(summary.proof).toBe("green");
    expect(summary.doneGate).toBe("passed (1 blocked)");
    expect(summary.approval).toBe("recorded");
  });
});

describe("deriveTrail — skipped and pending states", () => {
  it("no red run = tddRed skipped; no approval = pending; never-done with attempts = blocked(n)", () => {
    const events: JournalEvent[] = [
      ev("2026-06-12T11:00:00Z", "task.created", { id: "T3", title: "t", boundChecks: ["b.test.ts::y"] }),
      ev("2026-06-12T11:01:00Z", "check.run", { taskId: "T3", result: { ref: "b.test.ts::y", passed: true, at: "t" } }),
      ev("2026-06-12T11:02:00Z", "cli.run", { command: "task done", args: ["T3"] }), // blocked (hypothetically)
    ];
    const { summary } = deriveTrail(events, "T3");
    expect(summary.tddRed).toBe("skipped");
    expect(summary.approval).toBe("pending");
    expect(summary.doneGate).toBe("blocked (1)");
  });

  it("unknown task yields an empty trail with pending gates", () => {
    const { timeline, summary } = deriveTrail([], "NOPE");
    expect(timeline).toEqual([]);
    expect(summary.doneGate).toBe("pending");
  });
});
