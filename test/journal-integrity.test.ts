import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";

/**
 * The review flagged the fold-time `if (t && …)` guards (tasks.ts) as "silently dropping evidence
 * for an unknown task". They never fire in practice — because EVERY writer validates the task first
 * via requireTask(). This locks that invariant: orphan evidence cannot be written, so it can never
 * need silent dropping on read. (The guards stay as defence against a hand-edited journal.)
 */
function store(): { store: TaskStore; journalPath: string } {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-integrity-"));
  const journalPath = join(dir, ".dev-spec-kit", "journal.jsonl");
  return { store: new TaskStore(new Journal(journalPath)), journalPath };
}

describe("write boundary rejects orphan evidence (no silent loss)", () => {
  it("recordCheck on an unknown task throws — a proof cannot be journaled against a ghost", () => {
    const { store: s } = store();
    expect(() =>
      s.recordCheck("GHOST", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: "T" }),
    ).toThrow(/unknown task: GHOST/);
  });

  it("setStatus on an unknown task throws", () => {
    const { store: s } = store();
    expect(() => s.setStatus("GHOST", "in_progress")).toThrow(/unknown task: GHOST/);
  });

  it("markDone on an unknown task throws", () => {
    const { store: s } = store();
    expect(() => s.markDone("GHOST")).toThrow(/unknown task: GHOST/);
  });

  it("syncBindings on an unknown task throws", () => {
    const { store: s } = store();
    expect(() => s.syncBindings("GHOST", ["c1"])).toThrow(/unknown task: GHOST/);
  });

  it("a rejected write leaves NO orphan event in the journal (nothing for the fold to drop)", () => {
    const { store: s, journalPath } = store();
    try {
      s.recordCheck("GHOST", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: "T" });
    } catch {
      /* expected */
    }
    const lines = existsSync(journalPath) ? readFileSync(journalPath, "utf8") : "";
    expect(lines).not.toContain("GHOST");
    expect(lines).not.toContain("check.run");
  });

  it("a valid task's evidence round-trips through the fold (the guard passes when the task exists)", () => {
    const { store: s } = store();
    s.create("T1", "t", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: "T" });
    expect(s.get("T1")!.results["c1"]!.passed).toBe(true);
  });
});
