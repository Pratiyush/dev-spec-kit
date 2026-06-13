import { describe, it, expect } from "vitest";
import { bindingsOutOfSync } from "../src/engine/state/tasks.js";

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
