import { describe, it, expect } from "vitest";
import { parseLearnings, matchOpenLessons, lessonsToWarn } from "../src/engine/learnwarn.js";

/** LEARN-01: logged-but-unpromoted lessons recur — so OPEN lessons surface BEFORE the work starts. */

const LEDGER = `# Rivet learnings

## 2026-06-11 Worktree subagents must fetch first
- Trigger: stale base reverted merged work.
- Lesson: always fetch origin before branching worktrees.
- Promoted to: OPEN → task FIX-WT-99

## 2026-06-11 Parser must respect markdown
- Trigger: fences became requirements.
- Lesson: fence-track the parser.
- Promoted to: check:test/parse-fix.test.ts (HARDENED)
`;

describe("parseLearnings", () => {
  it("identifies OPEN vs promoted entries", () => {
    const entries = parseLearnings(LEDGER);
    expect(entries).toHaveLength(2);
    expect(entries[0]!.open).toBe(true);
    expect(entries[1]!.open).toBe(false);
  });
});

describe("matchOpenLessons", () => {
  it("matches an open lesson against task words; promoted lessons never warn", () => {
    const entries = parseLearnings(LEDGER);
    const hits = matchOpenLessons(entries, "WAVE-03 improve worktree dispatch ordering");
    expect(hits).toHaveLength(1);
    expect(hits[0]!.title).toContain("fetch first");
    expect(matchOpenLessons(entries, "tune the parser fences")).toHaveLength(0); // that one is HARDENED
    expect(matchOpenLessons(entries, "unrelated dashboard work")).toHaveLength(0);
  });
});

/** FIX-CONFIG-WIRE-01: learning.warnOnRepeat now actually gates the warnings (it was display-only). */
describe("lessonsToWarn honors the learning.warnOnRepeat toggle", () => {
  const words = "WAVE-03 improve worktree dispatch ordering";
  it("warns (matched open lessons) when the toggle is on", () => {
    expect(lessonsToWarn(true, LEDGER, words)).toHaveLength(1);
  });
  it("warns nothing when the toggle is off — the user silenced warn-on-repeat", () => {
    expect(lessonsToWarn(false, LEDGER, words)).toHaveLength(0);
  });
});
