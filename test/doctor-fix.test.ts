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

  it("the consequence is stated honestly: bundled revitify covers graph features, external is opt-in", () => {
    expect(`${graphify.detail} ${graphify.hint}`).toMatch(/revitify/i);
    expect(`${graphify.detail} ${graphify.hint}`).toMatch(/optional|opt-in/i);
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

// FEAT-FLUSH-01 (worktree half): stale worktrees pile up invisibly under .claude/worktrees/ and
// wave dispatch dirs. Doctor LISTS them with the cleanup hint — visibility only, removal stays human.
describe("doctor lists stale isolation worktrees (🧹 visibility, never removal)", () => {
  it("parses worktree paths under .claude/worktrees and .worktrees from porcelain output", async () => {
    const { parseStaleWorktrees } = await import("../src/cli/doctor.js");
    const porcelain = [
      "worktree /Users/x/repo",
      "HEAD aaaa",
      "branch refs/heads/main",
      "",
      "worktree /Users/x/repo/.claude/worktrees/feedback-2026-06-12",
      "HEAD bbbb",
      "branch refs/heads/worktree-feedback-2026-06-12",
      "",
      "worktree /Users/x/repo/.worktrees/FEAT-X-01",
      "HEAD cccc",
      "branch refs/heads/wave-FEAT-X-01",
      "",
    ].join("\n");
    const stale = parseStaleWorktrees(porcelain);
    expect(stale).toEqual([
      "/Users/x/repo/.claude/worktrees/feedback-2026-06-12",
      "/Users/x/repo/.worktrees/FEAT-X-01",
    ]);
  });
});
