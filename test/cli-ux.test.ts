import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { auditCliRun } from "../src/engine/state/audit.js";
import { renderLog } from "../src/cli/log.js";
import { renderProgress } from "../src/cli/progress.js";
import type { Task } from "../src/engine/state/tasks.js";

function tempProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "rivet-ux-"));
  mkdirSync(join(dir, ".rivet"), { recursive: true });
  return dir;
}

describe("R-AUDIT-01 — cli audit events", () => {
  it("audits cli invocations into the journal", () => {
    const dir = tempProject();
    auditCliRun(dir, ["task", "done"], ["T1"]);
    const events = new Journal(join(dir, ".rivet", "journal.jsonl")).read();
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe("cli.run");
    expect(events[0]!.data).toEqual({ command: "task done", args: ["T1"] });
    expect(typeof events[0]!.at).toBe("string");
  });

  it("does not create journals outside Rivet projects", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-ux-bare-"));
    auditCliRun(dir, ["status"], []);
    expect(new Journal(join(dir, ".rivet", "journal.jsonl")).read()).toEqual([]);
  });
});

describe("R-AUDIT-02 — readable audit trail", () => {
  it("renders the audit trail with per-type emoji", () => {
    const lines = renderLog([
      { at: "2026-06-11T10:00:00Z", type: "cli.run", data: { command: "task done", args: ["T1"] } },
      { at: "2026-06-11T10:01:00Z", type: "check.run", data: { taskId: "T1", result: { ref: "A#a", passed: true, at: "t" } } },
      { at: "2026-06-11T10:02:00Z", type: "check.run", data: { taskId: "T1", result: { ref: "A#b", passed: false, at: "t" } } },
      { at: "2026-06-11T10:03:00Z", type: "task.created", data: { id: "T2", title: "t", boundChecks: [] } },
      { at: "2026-06-11T10:04:00Z", type: "approval.recorded", data: { taskIds: ["T1"], approver: "P" } },
    ]);
    expect(lines).toHaveLength(5);
    expect(lines[0]).toContain("🧾");
    expect(lines[0]).toContain("task done T1");
    expect(lines[1]).toContain("✅");
    expect(lines[2]).toContain("❌");
    expect(lines[3]).toContain("📋");
    expect(lines[4]).toContain("🔏");
    expect(lines[0]).toContain("2026-06-11");
  });
});

describe("R-PROG-01 — progress with emoji after done", () => {
  const t = (id: string, status: Task["status"], passed?: boolean): Task => ({
    id,
    title: `title-${id}`,
    status,
    boundChecks: ["c1"],
    results: passed === undefined ? {} : { c1: { ref: "c1", passed, at: "t" } },
  });

  it("renders progress with emoji, bar, and next-up", () => {
    const out = renderProgress([t("A", "done", true), t("B", "in_progress", false), t("C", "pending")]);
    expect(out).toContain("✅"); // done task emoji
    expect(out).toContain("🔨"); // in-progress emoji
    expect(out).toContain("⬜"); // pending emoji
    expect(out).toContain("1/3"); // progress count
    expect(out).toContain("33%"); // percentage
    expect(out).toContain("🔴"); // failing check light on B
    expect(out).toContain("⚪"); // unproven light on C
    expect(out).toMatch(/next.*B/i); // next-up suggests the in-progress task
  });

  it("celebrates when everything is done", () => {
    const out = renderProgress([t("A", "done", true)]);
    expect(out).toContain("100%");
    expect(out).toContain("🎉");
  });
});
