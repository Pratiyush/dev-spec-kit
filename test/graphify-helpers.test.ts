import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadCodeGraph,
  readFreshness,
  writeFreshness,
  isStale,
  providerAvailable,
} from "../src/engine/graphify/index.js";

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "rivet-gfy-"));
}

describe("loadCodeGraph — tolerant of graphify/d3 shapes", () => {
  it("maps nodes and resolves edge endpoints given as strings or {id} objects; drops bad edges", () => {
    const dir = tmp();
    const p = join(dir, "graph.json");
    writeFileSync(
      p,
      JSON.stringify({
        built_at_commit: "abc123",
        nodes: [{ id: "A", source_file: "a.ts" }, { name: "B" }, {}],
        links: [
          { source: "A", target: { id: "B" }, relation: "calls" },
          { source: null, target: "A" }, // dropped (no from)
          { from: "A", to: "B" }, // from/to alias
        ],
      }),
    );
    const g = loadCodeGraph(p);
    expect(g.nodes).toHaveLength(3);
    expect(g.nodes[0]!.kind).toBe("codeNode");
    expect(g.builtAtCommit).toBe("abc123");
    expect(g.links).toHaveLength(2); // the null-source edge was dropped
    expect(g.links[0]).toMatchObject({ from: "A", to: "B", relation: "calls" });
  });
});

describe("freshness record", () => {
  it("returns null sha when the file is absent", () => {
    expect(readFreshness(tmp()).lastIndexedSha).toBeNull();
  });

  it("round-trips a written sha", () => {
    const dir = tmp();
    writeFreshness(dir, "deadbeef");
    expect(readFreshness(dir).lastIndexedSha).toBe("deadbeef");
  });

  it("treats a corrupt graph-state.json as not-yet-indexed (catch → null)", () => {
    const dir = tmp();
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    writeFileSync(join(dir, ".rivet", "graph-state.json"), "{ not json");
    expect(readFreshness(dir).lastIndexedSha).toBeNull();
  });
});

describe("isStale / providerAvailable", () => {
  it("is stale when there is no git HEAD (cannot prove freshness)", () => {
    expect(isStale(tmp())).toBe(true);
  });

  it("revitify is always available; graphify depends on the binary", () => {
    expect(providerAvailable("revitify")).toBe(true);
    expect(typeof providerAvailable("graphify")).toBe("boolean");
  });
});

describe("loadCodeGraph — drops an edge whose endpoint object has no id", () => {
  it("ignores a {source:{no id}} edge", () => {
    const dir = tmp();
    const p = join(dir, "g.json");
    writeFileSync(p, JSON.stringify({ nodes: [{ id: "A" }], links: [{ source: { foo: 1 }, target: "A" }] }));
    const g = loadCodeGraph(p);
    expect(g.links).toHaveLength(0);
  });
});
