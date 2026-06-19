import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** README-01: the public face must match the real tool — structural guard against doc rot. */

const README = readFileSync(join(process.cwd(), "README.md"), "utf8");

describe("README matches the shipped surface", () => {
  it("no stale phase claims", () => {
    expect(README).not.toMatch(/Phase 0 \(foundation\)/i);
    expect(README).not.toMatch(/not yet usable/i);
  });

  it("names the current capabilities", () => {
    for (const term of [
      "Verified Traceability Graph",
      "wave",
      "laws",
      "dashboard",
      "drift",
      "dev-spec-kit",
      "graphify",
    ]) {
      expect(README, `README should mention '${term}'`).toContain(term);
    }
  });

  it("documents the loop and points at the website docs", () => {
    expect(README).toMatch(/spec tasks[\s\S]*task done[\s\S]*graph build/);
    expect(README).toContain("website/");
  });

  // FEAT-CCFIRST-01: depth on one harness beats breadth — say it out loud so contributors don't
  // generalize early and dilute the hook/skill integration that is the moat.
  it("declares the Claude-Code-first focus explicitly", () => {
    expect(README).toMatch(/Built for Claude Code first; other assistants later\./);
  });
});
