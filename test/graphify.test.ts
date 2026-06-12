import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCodeGraph, readFreshness, writeFreshness, isStale } from "../src/engine/graphify/index.js";

describe("graphify loader (tolerant of d3-style shapes)", () => {
  it("maps nodes/links with object endpoints into codeNodes", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-graph-"));
    const p = join(dir, "graph.json");
    writeFileSync(
      p,
      JSON.stringify({
        nodes: [{ id: "SessionService", type: "class" }, { name: "AuthController" }],
        links: [{ source: { id: "AuthController" }, target: "SessionService" }],
      }),
    );
    const g = loadCodeGraph(p);
    expect(g.nodes.map((n) => n.id)).toEqual(["SessionService", "AuthController"]);
    expect(g.nodes.every((n) => n.kind === "codeNode")).toBe(true);
    expect(g.links).toEqual([{ from: "AuthController", to: "SessionService" }]);
  });
});

describe("graph freshness record", () => {
  it("roundtrips the last-indexed SHA and reports stale outside git", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-fresh-"));
    expect(readFreshness(dir)).toEqual({ lastIndexedSha: null });
    writeFreshness(dir, "abc123");
    expect(readFreshness(dir)).toEqual({ lastIndexedSha: "abc123" });
    // Not a git repo => HEAD unknown => always considered stale (must re-index).
    expect(isStale(dir)).toBe(true);
  });
});
