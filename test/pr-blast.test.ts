import { describe, it, expect } from "vitest";
import { prBlastRadius, type VerifiedTraceabilityGraph } from "../src/engine/graph/types.js";

/**
 * FEAT-BLAST-01 — the PR's blast radius: which PROVEN edges the changed files touch. A changed test
 * file is the source of a `validates` edge (via its ref's file); a changed source file maps to a
 * codeNode through `meta.sourceFile`. Pure so the PR body and any future `affected` share it.
 */
const graph: VerifiedTraceabilityGraph = {
  nodes: [{ id: "code:src/foo.ts:bar", kind: "codeNode", label: "bar", meta: { sourceFile: "src/foo.ts" } }],
  edges: [
    {
      id: "v1",
      from: "test:test/foo.test.ts::works",
      to: "REQUIREMENT_X-01-AC1",
      kind: "validates",
      proof: "green",
      lastCheck: { ref: "test/foo.test.ts::works", passed: true, at: "2026-06-14T00:00:00Z" },
    },
    { id: "im1", from: "code:src/foo.ts:bar", to: "REQUIREMENT_X-01", kind: "implements", proof: "green" },
    // a non-proven code link must NOT count as blast radius
    {
      id: "dep1",
      from: "code:src/foo.ts:bar",
      to: "code:src/util.ts:x",
      kind: "dependsOn",
      proof: "unproven",
    },
  ],
};

describe("prBlastRadius", () => {
  it("maps a changed TEST file to the validates edge it proves", () => {
    const out = prBlastRadius(graph, ["test/foo.test.ts"]);
    expect(out).toHaveLength(1);
    expect(out[0]!.file).toBe("test/foo.test.ts");
    expect(out[0]!.edges.map((e) => e.id)).toEqual(["v1"]);
  });

  it("maps a changed SOURCE file to the proven edges of its code node (dropping unproven links)", () => {
    const out = prBlastRadius(graph, ["src/foo.ts"]);
    expect(out).toHaveLength(1);
    expect(out[0]!.edges.map((e) => e.id)).toEqual(["im1"]); // im1 proven; dep1 (dependsOn/unproven) excluded
  });

  it("normalizes a leading ./ on the changed path", () => {
    expect(prBlastRadius(graph, ["./test/foo.test.ts"])[0]?.edges.map((e) => e.id)).toEqual(["v1"]);
  });

  it("returns nothing for a file the graph does not know", () => {
    expect(prBlastRadius(graph, ["src/unrelated.ts"])).toEqual([]);
  });

  it("returns nothing for an empty changed set", () => {
    expect(prBlastRadius(graph, [])).toEqual([]);
  });

  it("dedupes edges when a file matches by both a test ref and a code node", () => {
    const g: VerifiedTraceabilityGraph = {
      nodes: [{ id: "code:a.test.ts:t", kind: "codeNode", label: "t", meta: { sourceFile: "a.test.ts" } }],
      edges: [
        {
          id: "v",
          from: "test:a.test.ts::x",
          to: "R-1-AC1",
          kind: "validates",
          proof: "green",
          lastCheck: { ref: "a.test.ts::x", passed: true, at: "x" },
        },
        { id: "im", from: "code:a.test.ts:t", to: "R-1", kind: "implements", proof: "green" },
      ],
    };
    const edges = prBlastRadius(g, ["a.test.ts"])[0]!
      .edges.map((e) => e.id)
      .sort();
    expect(edges).toEqual(["im", "v"]); // both, no duplicates
  });
});

import { buildPrBody } from "../src/engine/pr/body.js";
import { parseSpec } from "../src/engine/spec/parse.js";

const reqs = parseSpec(
  "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=test/foo.test.ts::works\n",
);

describe("buildPrBody — blast-radius section", () => {
  it("omits the section entirely when changedFiles is undefined (back-compat)", () => {
    const body = buildPrBody({ title: "X", requirements: reqs, graph, tasks: [], approvals: [] });
    expect(body).not.toContain("Blast radius");
  });

  it("renders the touched edges for changed files that map", () => {
    const body = buildPrBody({
      title: "X",
      requirements: reqs,
      graph,
      tasks: [],
      approvals: [],
      changedFiles: ["test/foo.test.ts", "src/foo.ts"],
    });
    expect(body).toContain("### Blast radius (proven edges this change touches)");
    expect(body).toContain("`test/foo.test.ts` → 🟢 green `REQUIREMENT_X-01-AC1`");
    expect(body).toContain("`src/foo.ts` → 🟢 green `REQUIREMENT_X-01`");
  });

  it("notes honestly when changed files map to no graph node", () => {
    const body = buildPrBody({
      title: "X",
      requirements: reqs,
      graph,
      tasks: [],
      approvals: [],
      changedFiles: ["docs/README.md", "package.json"],
    });
    expect(body).toContain("### Blast radius");
    expect(body).toContain("none of the 2 changed file(s) map to a graph node");
  });

  it("caps the listing and notes the overflow", () => {
    const edges = Array.from({ length: 16 }, (_, i) => ({
      id: `e${i}`,
      from: `test:test/f${i}.test.ts::t`,
      to: `R-1-AC${i}`,
      kind: "validates" as const,
      proof: "green" as const,
      lastCheck: { ref: `test/f${i}.test.ts::t`, passed: true, at: "x" },
    }));
    const body = buildPrBody({
      title: "X",
      requirements: [],
      graph: { nodes: [], edges },
      tasks: [],
      approvals: [],
      changedFiles: edges.map((_, i) => `test/f${i}.test.ts`),
    });
    expect(body).toContain("…and 1 more file(s)");
  });
});
