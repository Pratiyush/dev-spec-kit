import { describe, it, expect } from "vitest";
import { doctorChecks } from "../src/cli/doctor.js";
import { GRAPHIFY_INSTALL_HINT } from "../src/engine/graphify/index.js";

/** Dogfood lesson (notepad session): the graphifyy hint reads as a typosquat to permission
 *  classifiers, and a REQUIRED red stalls setup on a human. Rivet runs fully without graphify —
 *  so doctor degrades gracefully and the hint carries provenance. */

const probeMissingGraphify = (cmd: string): string | null =>
  /graphify/.test(cmd) ? null : "stub-version-1.0";

describe("doctor: graphify is optional with consequences, not a required red", () => {
  const checks = doctorChecks(probeMissingGraphify);
  const graphify = checks.find((c) => c.name.toLowerCase().includes("graphify"))!;

  it("graphify missing does NOT fail doctor", () => {
    expect(graphify.ok).toBe(false);
    expect(graphify.required).toBe(false);
    const requiredMissing = checks.filter((c) => c.required && !c.ok);
    expect(requiredMissing).toEqual([]);
  });

  it("the consequence is stated (graph features off), not a hard stop", () => {
    expect(`${graphify.detail} ${graphify.hint}`).toMatch(/graph features (off|disabled)/i);
  });
});

describe("the install hint carries provenance (classifier- and human-trustable)", () => {
  it("explains the name mismatch and links the source repo", () => {
    expect(GRAPHIFY_INSTALL_HINT).toContain("graphifyy");
    expect(GRAPHIFY_INSTALL_HINT).toMatch(/official PyPI (package|name)/i);
    expect(GRAPHIFY_INSTALL_HINT).toContain("github.com/safishamsi/graphify");
  });

  // FIX-PROV-01: provenance = verifiable pointers (URL, package, owner). A star count hardcoded
  // in a CLI string is stale the day it ships — and ours shipped inflated (213k vs ~65k live).
  it("pins no point-in-time vanity metrics (star counts rot or were never true)", () => {
    expect(GRAPHIFY_INSTALL_HINT).not.toMatch(/★/);
    expect(GRAPHIFY_INSTALL_HINT).not.toMatch(/\d+\s*k?\s*(stars?|★)/i);
  });
});
