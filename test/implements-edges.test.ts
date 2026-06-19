import { describe, it, expect } from "vitest";
import { buildVTG, deriveImplementsEdges, isTestFile } from "../src/engine/graph/build.js";
import { unimplementedRequirements, prBlastRadius, type ProofState } from "../src/engine/graph/types.js";
import type { Requirement } from "../src/engine/spec/ears.js";
import type { Task } from "../src/engine/state/tasks.js";
import type { CodeGraph } from "../src/engine/graphify/index.js";

/**
 * FEAT-IMPL-01 — proven `implements` edges (source codeNode → requirement) derived from the code
 * graph's test→source imports. They (a) light up changed-SOURCE-file blast radius and (b) revive the
 * `unimplementedRequirements` check. Proof is inherited from the executed `validates` chain — an
 * implements edge is never greener than the work behind it.
 */

const req = (id: string, ref: string): Requirement => ({
  id,
  title: id,
  criteria: [
    {
      id: `${id}-AC1`,
      pattern: "event",
      text: "WHEN x THEN the system SHALL y",
      checks: [{ kind: "unit", ref }],
    },
  ],
});

// One code graph for the pure tests. test/foo.test.ts imports src/foo.ts (the impl) AND a test helper
// (never an impl). It also carries a no-source node, a non-import (`calls`) link, and a dangling link —
// so every guard in deriveImplementsEdges is exercised.
const codeGraph: CodeGraph = {
  nodes: [
    { id: "c:src/foo.ts:bar", kind: "codeNode", label: "bar", meta: { sourceFile: "src/foo.ts" } },
    { id: "c:src/foo.ts:baz", kind: "codeNode", label: "baz", meta: { sourceFile: "src/foo.ts" } },
    {
      id: "c:test/foo.test.ts:works",
      kind: "codeNode",
      label: "works",
      meta: { sourceFile: "test/foo.test.ts" },
    },
    {
      id: "c:test/helper.test.ts:h",
      kind: "codeNode",
      label: "h",
      meta: { sourceFile: "test/helper.test.ts" },
    },
    { id: "c:src/other.ts:q", kind: "codeNode", label: "q", meta: { sourceFile: "src/other.ts" } },
    { id: "c:no-source", kind: "codeNode", label: "n" }, // no meta.sourceFile → skipped by the builder
  ],
  links: [
    { from: "c:test/foo.test.ts:works", to: "c:src/foo.ts:bar", relation: "imports" },
    { from: "c:test/foo.test.ts:works", to: "c:test/helper.test.ts:h", relation: "imports" }, // test→test: never an impl
    { from: "c:test/foo.test.ts:works", to: "c:src/other.ts:q", relation: "calls" }, // not an import edge → ignored
    { from: "c:test/foo.test.ts:works", to: "c:ghost", relation: "imports" }, // dangling endpoint → ignored
  ],
};

const FOO = "REQUIREMENT_FOO-01";
const green = new Map<string, ProofState>([[FOO, "green"]]);

describe("deriveImplementsEdges", () => {
  it("links a source file a bound test imports to the requirement, carrying its rollup proof", () => {
    const out = deriveImplementsEdges([req(FOO, "test/foo.test.ts::works")], codeGraph, green);
    // exactly one edge → src/foo.ts's representative (smallest-id) node, carrying the green proof
    expect(out).toEqual([{ from: "c:src/foo.ts:bar", to: FOO, proof: "green" }]);
  });

  it("inherits the requirement's worst criterion proof — green only when every criterion is green", () => {
    const out = deriveImplementsEdges(
      [req(FOO, "test/foo.test.ts::works")],
      codeGraph,
      new Map<string, ProofState>([[FOO, "stale"]]),
    );
    expect(out.map((e) => e.proof)).toEqual(["stale"]);
  });

  it("does not link a source the requirement's tests never import", () => {
    const out = deriveImplementsEdges([req(FOO, "test/foo.test.ts::works")], codeGraph, green);
    expect(out.some((e) => e.from.includes("src/other.ts"))).toBe(false); // only `calls`, no import → not linked
  });

  it("never links a test→test import as an implementation", () => {
    const out = deriveImplementsEdges([req(FOO, "test/foo.test.ts::works")], codeGraph, green);
    expect(out.some((e) => e.from.includes("test/helper.test.ts"))).toBe(false);
  });

  it("skips ADR records and requirements with no rolled-up proof", () => {
    const out = deriveImplementsEdges(
      [
        req(FOO, "test/foo.test.ts::works"),
        req("ADR_PICK-01", "test/foo.test.ts::works"), // decision record → no obligation
        req("REQUIREMENT_GHOST-02", "test/foo.test.ts::works"), // absent from the proof map
      ],
      codeGraph,
      green,
    );
    expect(out.map((e) => e.to)).toEqual([FOO]);
  });

  it("emits no implements edges when no code graph is present", () => {
    expect(deriveImplementsEdges([req(FOO, "test/foo.test.ts::works")], undefined, green)).toEqual([]);
  });
});

describe("isTestFile", () => {
  it("recognises .test/.spec files and rejects plain sources", () => {
    expect(isTestFile("test/foo.test.ts")).toBe(true);
    expect(isTestFile("src/foo.spec.tsx")).toBe(true);
    expect(isTestFile("src/foo.ts")).toBe(false);
  });
});

describe("buildVTG — implements edges (integration)", () => {
  const greenTask: Task = {
    id: "T-FOO",
    title: "foo",
    status: "pending",
    boundChecks: ["test/foo.test.ts::works"],
    results: {
      "test/foo.test.ts::works": {
        ref: "test/foo.test.ts::works",
        passed: true,
        at: "2026-06-19T00:00:00Z",
        tree: "TREE",
      },
    },
  };
  const requirements = [
    req(FOO, "test/foo.test.ts::works"), // imports src/foo.ts, proven green
    req("REQUIREMENT_BARE-02", "test/bare.test.ts::x"), // no code-graph anchor at all
    { id: "REQUIREMENT_EMPTY-03", title: "empty", criteria: [] }, // a requirement with no criteria
  ];

  it("buildVTG emits a green implements edge that makes unimplementedRequirements live", () => {
    const g = buildVTG({ requirements, tasks: [greenTask], currentTree: "TREE", codeGraph });
    expect(g.edges).toContainEqual(
      expect.objectContaining({ from: "c:src/foo.ts:bar", to: FOO, kind: "implements", proof: "green" }),
    );
    const flagged = unimplementedRequirements(g).map((n) => n.id);
    expect(flagged).toContain("REQUIREMENT_BARE-02"); // no green implements edge → still flagged
    expect(flagged).not.toContain(FOO); // now provably implemented
  });

  it("lights up a changed source file's blast radius through the implements edge", () => {
    const g = buildVTG({ requirements, tasks: [greenTask], currentTree: "TREE", codeGraph });
    const blast = prBlastRadius(g, ["src/foo.ts"]);
    expect(blast).toHaveLength(1);
    expect(blast[0]!.file).toBe("src/foo.ts");
    expect(blast[0]!.edges.some((e) => e.kind === "implements" && e.to === FOO)).toBe(true);
  });
});
