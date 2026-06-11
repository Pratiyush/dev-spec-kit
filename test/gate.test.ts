import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { gateVerdict } from "../src/engine/gate.js";
import type { VerifiedTraceabilityGraph } from "../src/engine/graph/types.js";

/** FIX-GATE-01: one shared "not-green blocks" predicate; absence of state blocks. */

const graphWith = (proofs: Array<"green" | "red" | "stale" | "unproven">): VerifiedTraceabilityGraph => ({
  nodes: [],
  edges: proofs.map((proof, i) => ({
    id: `e${i}`,
    from: `test:T${i}`,
    to: `AC${i}`,
    kind: "validates" as const,
    proof,
  })),
});

describe("gateVerdict — the one predicate", () => {
  it("missing graph blocks (state absence is not permission)", () => {
    const v = gateVerdict(null);
    expect(v.ok).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/graph/i);
  });

  it("red, stale, AND unproven all block — anything not green", () => {
    for (const bad of ["red", "stale", "unproven"] as const) {
      const v = gateVerdict(graphWith(["green", bad]));
      expect(v.ok).toBe(false);
      expect(v.reasons.join(" ")).toContain(bad.toUpperCase());
    }
  });

  it("all green passes; zero proofs passes with the zeroProofs flag", () => {
    expect(gateVerdict(graphWith(["green", "green"])).ok).toBe(true);
    const empty = gateVerdict(graphWith([]));
    expect(empty.ok).toBe(true);
    expect(empty.zeroProofs).toBe(true);
  });
});

describe("guard-pr hook — hardened matcher + missing-graph block", () => {
  const hook = join(process.cwd(), "hooks", "guard-pr.mjs");
  const run = (payload: object): number | null =>
    spawnSync("node", [hook], { input: JSON.stringify(payload), stdio: ["pipe", "pipe", "pipe"] }).status;

  function rivetProject(graph?: object): string {
    const dir = mkdtempSync(join(tmpdir(), "rivet-gate-"));
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    if (graph) writeFileSync(join(dir, ".rivet", "graph.json"), JSON.stringify(graph));
    return dir;
  }

  it("missing graph in a Rivet project BLOCKS pr creation (exit 2)", () => {
    const cwd = rivetProject(); // .rivet exists, no graph.json
    expect(run({ tool_name: "Bash", tool_input: { command: "gh pr create -t x" }, cwd })).toBe(2);
  });

  it("quoted and api-route forms are caught", () => {
    const red = { edges: [{ kind: "validates", proof: "red", from: "test:X" }] };
    const cwd = rivetProject(red);
    expect(run({ tool_name: "Bash", tool_input: { command: `gh "pr" create` }, cwd })).toBe(2);
    expect(run({ tool_name: "Bash", tool_input: { command: "gh api repos/o/r/pulls -f title=x" }, cwd })).toBe(2);
  });

  it("green graph passes even for quoted forms; non-PR commands never touched", () => {
    const green = { edges: [{ kind: "validates", proof: "green", from: "test:X" }] };
    const cwd = rivetProject(green);
    expect(run({ tool_name: "Bash", tool_input: { command: `gh "pr" create` }, cwd })).toBe(0);
    expect(run({ tool_name: "Bash", tool_input: { command: "git status" }, cwd })).toBe(0);
  });
});
