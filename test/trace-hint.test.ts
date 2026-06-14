import { describe, it, expect } from "vitest";
import { staleRemedy } from "../src/cli/queries.js";
import type { RequirementRollup } from "../src/engine/graph/build.js";
import type { ProofState } from "../src/engine/graph/types.js";

/**
 * FIX-TRACE-HINT-01: `graph build` names the cure for a stale proof; `trace` used to leave the user
 * staring at a magenta dot. staleRemedy is the shared, pure decision — same drift, same one-liner.
 */
const roll = (proofs: ProofState[]): RequirementRollup => ({
  id: "R-1",
  title: "t",
  criteria: proofs.map((p, i) => ({ id: `R-1-AC${i}`, bound: true, proof: p })),
  proven: proofs.length > 0 && proofs.every((p) => p === "green"),
});

describe("staleRemedy — trace names the drift cure (parity with graph build)", () => {
  it("returns a `rivet drift` remedy counting every stale proof across requirements", () => {
    const r = staleRemedy([roll(["green", "stale"]), roll(["stale"])]);
    expect(r).not.toBeNull();
    expect(r).toMatch(/rivet drift/);
    expect(r).toContain("2 proof(s)");
  });

  it("is null when nothing is stale — green/red/unproven need a different remedy, not re-verify", () => {
    expect(staleRemedy([roll(["green", "green"]), roll(["red", "unproven"])])).toBeNull();
  });

  it("is null for an empty graph (no requirements, nothing to re-verify)", () => {
    expect(staleRemedy([])).toBeNull();
  });
});
