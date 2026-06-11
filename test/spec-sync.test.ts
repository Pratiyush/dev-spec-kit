import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore, EvidenceError } from "../src/engine/state/tasks.js";

/** FIX-SPECSYNC-01: the spec→gate link must never freeze or clobber. */

function fresh(): { journal: Journal; store: TaskStore } {
  const journal = new Journal(join(mkdtempSync(join(tmpdir(), "rivet-sync-")), "j.jsonl"));
  return { journal, store: new TaskStore(journal) };
}

describe("evidence is unclobberable", () => {
  it("create() throws on an existing id instead of resetting it", () => {
    const { store } = fresh();
    store.create("T1", "t", ["c1"]);
    expect(() => store.create("T1", "again", ["c9"])).toThrowError(/exists/);
  });

  it("a duplicate task.created event in the journal folds as create-if-absent (no clobber)", () => {
    const { journal, store } = fresh();
    store.create("T1", "original", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "t" });
    store.markDone("T1");
    // Simulate a legacy/hostile duplicate event written directly to the journal.
    journal.append("task.created", { id: "T1", title: "imposter", boundChecks: [] });
    const t = store.get("T1")!;
    expect(t.status).toBe("done");
    expect(t.title).toBe("original");
    expect(Object.keys(t.results)).toEqual(["c1"]);
  });
});

describe("bindings stay in sync with the spec", () => {
  it("syncBindings adds new obligations and the done-gate enforces them", () => {
    const { store } = fresh();
    store.create("R-1", "r", ["c1"]);
    store.recordCheck("R-1", { ref: "c1", passed: true, at: "t" });
    store.markDone("R-1");

    // Spec gains a second @check; re-derive syncs it in — done state must now be re-earned.
    store.syncBindings("R-1", ["c1", "c2"]);
    const t = store.get("R-1")!;
    expect(t.boundChecks).toEqual(["c1", "c2"]);
    expect(t.status).not.toBe("done"); // new unproven obligation reopens the task
    expect(() => store.markDone("R-1")).toThrowError(EvidenceError);

    store.recordCheck("R-1", { ref: "c2", passed: true, at: "t2" });
    expect(store.markDone("R-1").status).toBe("done");
  });

  it("syncBindings can also narrow obligations (removed criteria stop blocking)", () => {
    const { store } = fresh();
    store.create("R-2", "r", ["c1", "c2"]);
    store.recordCheck("R-2", { ref: "c1", passed: true, at: "t" });
    store.syncBindings("R-2", ["c1"]);
    expect(store.markDone("R-2").status).toBe("done");
  });

  it("syncBindings with identical refs is a no-op (no event spam)", () => {
    const { journal, store } = fresh();
    store.create("R-3", "r", ["c1"]);
    const before = journal.read().length;
    store.syncBindings("R-3", ["c1"]);
    expect(journal.read().length).toBe(before);
  });
});
