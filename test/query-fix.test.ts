import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materialize } from "../src/cli/materialize.js";
import { buildVTG } from "../src/engine/graph/build.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import type { Task } from "../src/engine/state/tasks.js";

/** FIX-QUERY-01: read-only must be read-only; ties break toward the worse proof. */

describe("materialize write control", () => {
  function project(): string {
    const dir = mkdtempSync(join(tmpdir(), "rivet-q-"));
    mkdirSync(join(dir, ".rivet", "specs"), { recursive: true });
    writeFileSync(
      join(dir, ".rivet", "specs", "x.md"),
      "## Requirement R-1 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n",
    );
    return dir;
  }

  it("write:false (queries) leaves no graph.json behind", () => {
    const dir = project();
    const m = materialize(dir, { refresh: false, write: false });
    expect(m.requirements).toHaveLength(1);
    expect(existsSync(join(dir, ".rivet", "graph.json"))).toBe(false);
  });

  it("write:true (builds) persists the graph", () => {
    const dir = project();
    materialize(dir, { refresh: false, write: true });
    expect(existsSync(join(dir, ".rivet", "graph.json"))).toBe(true);
  });
});

describe("equal-timestamp results tie-break toward the WORSE proof", () => {
  const SPEC = "## Requirement R-1 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n";
  const task = (id: string, passed: boolean): Task => ({
    id,
    title: "t",
    status: "in_progress",
    boundChecks: ["A#a"],
    results: { "A#a": { ref: "A#a", passed, at: "2026-06-11T10:00:00Z", sha: "S", tree: "T" } },
  });

  it("is red regardless of task iteration order", () => {
    for (const tasks of [
      [task("P", true), task("F", false)],
      [task("F", false), task("P", true)],
    ]) {
      const vtg = buildVTG({ requirements: parseSpec(SPEC), tasks, currentSha: "S", currentTree: "T" });
      expect(vtg.edges.find((e) => e.kind === "validates")!.proof).toBe("red");
    }
  });
});
