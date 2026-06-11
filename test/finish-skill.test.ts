import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * FINISH-RITUAL-01: the completion ritual is prose (a skill), so its regression guard is
 * structural — the load-bearing mechanics must stay present in the shipped skill.
 */

const PATH = join(process.cwd(), "skills", "rivet-finish", "SKILL.md");

describe("rivet-finish skill", () => {
  it("exists with frontmatter", () => {
    expect(existsSync(PATH)).toBe(true);
    const s = readFileSync(PATH, "utf8");
    expect(s).toMatch(/^---\nname: rivet-finish/m);
  });

  it("keeps the load-bearing mechanics: evidence entry gate, fixed menu, typed confirm, provenance, journal", () => {
    const s = readFileSync(PATH, "utf8");
    expect(s).toMatch(/rivet graph build/); // fresh-evidence entry gate runs the real gate
    expect(s).toMatch(/exactly\s+(these\s+)?4 options/i); // fixed menu, no open-ended "what next?"
    expect(s).toMatch(/type\s+[`"']?discard/i); // typed confirmation for the destructive path
    expect(s).toMatch(/\.worktrees\//); // provenance check before cleanup
    expect(s).toMatch(/journal/i); // every step lands in the audit trail
  });
});
