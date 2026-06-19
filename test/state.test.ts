import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore, EvidenceError } from "../src/engine/state/tasks.js";

function tempJournal(): Journal {
  return new Journal(join(mkdtempSync(join(tmpdir(), "dev-spec-kit-test-")), "journal.jsonl"));
}

describe("Journal", () => {
  it("returns empty for a missing file and appends/reads in order", () => {
    const j = tempJournal();
    expect(j.read()).toEqual([]);
    j.append("note", { msg: "one" });
    j.append("note", { msg: "two" });
    const events = j.read();
    expect(events.map((e) => (e.data as { msg: string }).msg)).toEqual(["one", "two"]);
    expect(events.every((e) => typeof e.at === "string")).toBe(true);
  });

  it("folds events into state", () => {
    const j = tempJournal();
    j.append("note", { n: 1 });
    j.append("note", { n: 2 });
    const sum = j.fold(0, (acc, e) => acc + (e.data as { n: number }).n);
    expect(sum).toBe(3);
  });
});

describe("TaskStore — evidence-bound done", () => {
  it("refuses done when a bound check never ran", () => {
    const store = new TaskStore(tempJournal());
    store.create("T1", "Idle session expiry", ["tests/session::idle_timeout"]);
    expect(() => store.markDone("T1")).toThrowError(EvidenceError);
    try {
      store.markDone("T1");
    } catch (e) {
      expect((e as EvidenceError).missing).toEqual(["tests/session::idle_timeout"]);
    }
  });

  it("refuses done while a bound check is failing", () => {
    const store = new TaskStore(tempJournal());
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: false, at: new Date().toISOString() });
    expect(() => store.markDone("T1")).toThrowError(/failing/);
  });

  it("allows done once every bound check has a passing run, and survives a reload (fold)", () => {
    const journal = tempJournal();
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1", "c2"]);
    store.setStatus("T1", "in_progress");
    store.recordCheck("T1", { ref: "c1", passed: true, at: new Date().toISOString() });
    store.recordCheck("T1", { ref: "c2", passed: true, at: new Date().toISOString() });
    expect(store.markDone("T1").status).toBe("done");

    // A brand-new store over the same journal (fresh session / new machine) sees identical state.
    const rehydrated = new TaskStore(journal).get("T1");
    expect(rehydrated?.status).toBe("done");
    expect(Object.keys(rehydrated?.results ?? {}).sort()).toEqual(["c1", "c2"]);
  });

  it("a later failing run flips the evidence and blocks done again", () => {
    const store = new TaskStore(tempJournal());
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: new Date().toISOString() });
    store.recordCheck("T1", { ref: "c1", passed: false, at: new Date().toISOString() });
    expect(() => store.markDone("T1")).toThrowError(EvidenceError);
  });
});
