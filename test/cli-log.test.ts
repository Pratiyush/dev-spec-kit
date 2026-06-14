import { describe, it, expect } from "vitest";
import { renderLog, parseCount, logCmd } from "../src/cli/log.js";
import type { JournalEvent } from "../src/engine/state/journal.js";
import { Journal } from "../src/engine/state/journal.js";
import { join } from "node:path";
import { tmpProject, run } from "./helpers/cli-harness.js";

const ev = (type: string, data: unknown, meta?: Record<string, string>): JournalEvent =>
  ({ at: "2026-06-12T01:02:03Z", type, data, ...(meta ? { meta } : {}) }) as JournalEvent;

describe("parseCount — -n validation (FIX-PARSE-01)", () => {
  it("defaults to 25, truncates, clamps negatives to 0, and rejects NaN", () => {
    expect(parseCount(undefined)).toBe(25);
    expect(parseCount("10")).toBe(10);
    expect(parseCount("3.9")).toBe(3);
    expect(parseCount("-5")).toBe(0);
    expect(parseCount("abc")).toBe(25);
  });
});

describe("renderLog — one readable line per event type", () => {
  it("describes every event kind with its emoji, plain-text (greppable)", () => {
    const lines = renderLog([
      ev("cli.run", { command: "verify", args: ["--stamp"] }),
      ev("check.run", { taskId: "T1", result: { ref: "c1", passed: true, at: "x", tree: "deadbeef00" } }),
      ev("check.run", { taskId: "T2", result: { ref: "c2", passed: false, flaky: true, at: "x" } }),
      ev("task.created", { id: "T1", title: "do it" }),
      ev("task.status", { id: "T1", status: "done" }),
      ev("task.status", { id: "T1", status: "in_progress" }),
      ev("approval.recorded", { approver: "P", taskIds: ["T1"] }),
      ev("task.bindings", { id: "T1", boundChecks: ["c1", "c2"] }),
      ev("verify.run", { passed: true, steps: [{}, {}], tree: "abcdef0123" }),
      ev("governance", { kind: "unlock" }),
      ev("note", { kind: "x" }),
      ev("mystery", { foo: 1 }),
    ]);
    const text = lines.join("\n");
    expect(text).toContain("🧾 verify --stamp");
    expect(text).toContain("✅ check c1");
    expect(text).toContain("(flaky)");
    expect(text).toContain("📋 task T1 created");
    expect(text).toContain("🏁 task T1 → done");
    expect(text).toContain("🔁 task T1 → in_progress");
    expect(text).toContain("🔏 approval by P");
    expect(text).toContain("🔗 task T1 bindings");
    expect(text).toContain("✅ verify 2 step(s)");
    expect(text).toContain("🛡️");
    expect(text).toContain("📝");
    expect(text).toContain("❓ mystery");
  });

  it("appends actor/model metadata when present", () => {
    const [line] = renderLog([ev("note", { x: 1 }, { actor: "claude", model: "opus" })]);
    expect(line).toContain("[claude · opus]");
  });
});

describe("rivet log — the command", () => {
  it("notes an empty journal", () => {
    const empty = tmpProject();
    const { text } = run(empty, () => logCmd({}));
    expect(text).toContain("journal is empty");
  });

  it("prints a human audit log by default", () => {
    const dir = tmpProject();
    const j = new Journal(join(dir, ".rivet", "journal.jsonl"));
    j.append("task.created", { id: "T1", title: "x" });
    const { text } = run(dir, () => logCmd({}));
    expect(text).toContain("Rivet audit log");
    expect(text).toContain("task T1 created");
  });

  it("emits raw JSONL under --json", () => {
    const dir = tmpProject();
    const j = new Journal(join(dir, ".rivet", "journal.jsonl"));
    j.append("task.created", { id: "T1", title: "x" });
    const { text } = run(dir, () => logCmd({ json: true }));
    expect(text).toContain('"type":"task.created"');
  });

  it("shows nothing when -n is 0 (but still reports the total)", () => {
    const dir = tmpProject();
    const j = new Journal(join(dir, ".rivet", "journal.jsonl"));
    j.append("task.created", { id: "T1", title: "x" });
    const { text } = run(dir, () => logCmd({ n: "0" }));
    expect(text).toContain("last 0 of 1");
  });
});
