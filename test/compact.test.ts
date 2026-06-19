import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { phaseBoundary, renderResume } from "../src/engine/phase.js";
import type { JournalEvent } from "../src/engine/state/journal.js";
import type { Task } from "../src/engine/state/tasks.js";

/** COMPACT-01: the journal knows where the phase boundaries are — checkpoint there, and survive
 *  compaction via a generated state-only RESUME (never hand-written, never stale). */

const ev = (type: JournalEvent["type"], data: unknown): JournalEvent => ({ at: "t", type, data });
const task = (id: string, status: Task["status"], unproven = false): Task => ({
  id,
  title: `title-${id}`,
  status,
  boundChecks: ["c1"],
  results: unproven ? {} : { c1: { ref: "c1", passed: true, at: "t" } },
});

describe("phaseBoundary", () => {
  it("a done transition is a task-complete boundary; all-done is feature-complete", () => {
    const base = [ev("task.status", { id: "A", status: "done" })];
    expect(phaseBoundary(base, [task("A", "done"), task("B", "pending")])).toEqual({ kind: "task-complete" });
    expect(phaseBoundary(base, [task("A", "done"), task("B", "done")])).toEqual({ kind: "feature-complete" });
  });

  it("non-boundary events yield null", () => {
    expect(phaseBoundary([ev("check.run", { taskId: "A" })], [task("A", "in_progress")])).toBeNull();
    expect(phaseBoundary([], [])).toBeNull();
  });
});

describe("renderResume — state-only handoff, generated from ground truth", () => {
  it("names THE ONE OPEN ACTION with its unproven obligations", () => {
    const out = renderResume([task("A", "done"), task("B", "in_progress", true), task("C", "pending", true)]);
    expect(out).toContain("ONE OPEN ACTION");
    expect(out).toContain("B"); // first in-flight task is the open action
    expect(out).toContain("c1"); // its unproven ref is listed
    expect(out).toMatch(/1\/3/); // board summary
    expect(out).toMatch(/dev-spec-kit status/); // rebuild-truth instructions
  });

  it("celebrates a clean state when everything is done", () => {
    expect(renderResume([task("A", "done")])).toMatch(/all .*done|nothing open/i);
  });
});

describe("resume-save hook (PreCompact, process-level)", () => {
  it("writes .dev-spec-kit/RESUME.md from the journal", () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-resume-"));
    mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
    writeFileSync(
      join(dir, ".dev-spec-kit", "journal.jsonl"),
      JSON.stringify({
        at: "t",
        type: "task.created",
        data: { id: "T1", title: "open work", boundChecks: ["x::y"] },
      }) +
        "\n" +
        JSON.stringify({ at: "t", type: "task.status", data: { id: "T1", status: "in_progress" } }) +
        "\n",
    );
    const hook = join(process.cwd(), "hooks", "resume-save.mjs");
    const r = spawnSync("node", [hook], {
      input: JSON.stringify({ cwd: dir }),
      stdio: ["pipe", "pipe", "pipe"],
    });
    expect(r.status).toBe(0);
    const resume = join(dir, ".dev-spec-kit", "RESUME.md");
    expect(existsSync(resume)).toBe(true);
    const text = readFileSync(resume, "utf8");
    expect(text).toContain("T1");
    expect(text).toContain("ONE OPEN ACTION");
  });
});
