import { describe, it, expect } from "vitest";
import { findDependencyCycles, type DepEdge } from "../src/engine/graph/cycles.js";

const dep = (from: string, to: string): DepEdge => ({ from, to, kind: "dependsOn" });

describe("findDependencyCycles — catch circular dependsOn edges (FEAT-CYCLE-01)", () => {
  it("finds a simple A→B→A cycle", () => {
    const cycles = findDependencyCycles([dep("A", "B"), dep("B", "A")]);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["A", "B", "A"]);
  });

  it("returns nothing for an acyclic chain", () => {
    expect(findDependencyCycles([dep("A", "B"), dep("B", "C")])).toEqual([]);
  });

  it("finds a longer A→B→C→A cycle", () => {
    const cycles = findDependencyCycles([dep("A", "B"), dep("B", "C"), dep("C", "A")]);
    expect(cycles[0]).toEqual(["A", "B", "C", "A"]);
  });

  it("ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)", () => {
    expect(
      findDependencyCycles([
        { from: "A", to: "B", kind: "validates" },
        { from: "B", to: "A", kind: "implements" },
      ]),
    ).toEqual([]);
  });

  it("tolerates a self-loop A→A", () => {
    expect(findDependencyCycles([dep("A", "A")])).toEqual([["A", "A"]]);
  });
});
