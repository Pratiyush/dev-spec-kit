import { describe, it, expect } from "vitest";
import { bindingsOutOfSync, provableTaskIds } from "../src/engine/state/tasks.js";
import type { Task } from "../src/engine/state/tasks.js";
import type { CheckResult } from "../src/engine/graph/types.js";

const green = (ref: string, tree = "T"): CheckResult => ({ ref, passed: true, at: "t", tree });
const task = (
  id: string,
  status: Task["status"],
  boundChecks: string[],
  results: Record<string, CheckResult>,
): Task => ({
  id,
  title: id,
  status,
  boundChecks,
  results,
});

describe("bindingsOutOfSync — tell 'stale binding' apart from 'no proof' (FIX-DONEMSG-01)", () => {
  it("is in sync when the task's refs match the spec's (order-independent)", () => {
    expect(bindingsOutOfSync(["a::x", "b::y"], ["b::y", "a::x"])).toBe(false);
  });

  it("is OUT OF sync when a test was renamed (task holds the old ref, spec the new)", () => {
    expect(bindingsOutOfSync(["auth.test.ts::clears the cooky"], ["auth.test.ts::clears the cookie"])).toBe(
      true,
    );
  });

  it("is out of sync when the counts differ", () => {
    expect(bindingsOutOfSync(["a::x"], ["a::x", "a::z"])).toBe(true);
  });

  it("treats two empty binding sets as in sync", () => {
    expect(bindingsOutOfSync([], [])).toBe(false);
  });
});

describe("provableTaskIds — reconcile trace vs status, only on fresh full proof (FIX-RECONCILE-01)", () => {
  it("advances a not-done task whose every check is green on the current tree", () => {
    const t = task("A", "in_progress", ["f::x", "f::y"], { "f::x": green("f::x"), "f::y": green("f::y") });
    expect(provableTaskIds([t], "T")).toEqual(["A"]);
  });

  it("never re-advances an already-done task", () => {
    const t = task("A", "done", ["f::x"], { "f::x": green("f::x") });
    expect(provableTaskIds([t], "T")).toEqual([]);
  });

  it("does NOT advance when a check is missing or failing", () => {
    const missing = task("A", "in_progress", ["f::x", "f::y"], { "f::x": green("f::x") });
    const failing = task("B", "in_progress", ["f::x"], {
      "f::x": { ref: "f::x", passed: false, at: "t", tree: "T" },
    });
    expect(provableTaskIds([missing, failing], "T")).toEqual([]);
  });

  it("does NOT advance a task proven on an OLDER tree (stale)", () => {
    const t = task("A", "in_progress", ["f::x"], { "f::x": green("f::x", "OLD") });
    expect(provableTaskIds([t], "T")).toEqual([]);
  });

  it("ignores a task with no bound checks", () => {
    expect(provableTaskIds([task("A", "in_progress", [], {})], "T")).toEqual([]);
  });
});
