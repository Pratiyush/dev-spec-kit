import { describe, expect, it } from "vitest";
import { staleProofRefs } from "../src/engine/state/tasks.js";
import type { Task } from "../src/engine/state/tasks.js";

/**
 * FIX-STALEDONE-01 — the done-gate must apply worst-of to TIME, not just to pass/fail: a passing
 * run recorded on an OLDER code tree does not vouch for the code being declared done. Found by our
 * own 📋 table printing 🟣 stale at the moment a task went DONE this session.
 * Block (or DONE-WITH-WARNINGS under verify.blockDoneOnFail=false) and name the refs to re-run.
 */

const TREE = "2b626e9957e01816103d7dc0a87d93a7523d297f";
const OLD = "fade1234567890fade1234567890fade12345678";

function task(results: Task["results"]): Pick<Task, "boundChecks" | "results"> {
  return { boundChecks: Object.keys(results), results };
}

describe("FIX-STALEDONE-01 — staleProofRefs", () => {
  it("flags a PASSING run recorded on an older tree", () => {
    const t = task({ a: { ref: "a", passed: true, at: "t", tree: OLD } });
    expect(staleProofRefs(t, TREE)).toEqual(["a"]);
  });

  it("fresh greens pass; reds are NOT its business (the existing gate already blocks them)", () => {
    const t = task({
      fresh: { ref: "fresh", passed: true, at: "t", tree: TREE },
      red: { ref: "red", passed: false, at: "t", tree: OLD },
    });
    expect(staleProofRefs(t, TREE)).toEqual([]);
  });

  it("legacy results without a tree and non-git projects never block", () => {
    const legacy = task({ a: { ref: "a", passed: true, at: "t", sha: "abc" } });
    expect(staleProofRefs(legacy, TREE)).toEqual([]); // can't judge a pre-tree proof
    const t = task({ a: { ref: "a", passed: true, at: "t", tree: OLD } });
    expect(staleProofRefs(t, undefined)).toEqual([]); // no git identity → no staleness concept
  });

  it("lists every stale ref so the human can re-run them all in one pass", () => {
    const t = task({
      a: { ref: "a", passed: true, at: "t", tree: OLD },
      b: { ref: "b", passed: true, at: "t", tree: OLD },
      c: { ref: "c", passed: true, at: "t", tree: TREE },
    });
    expect(staleProofRefs(t, TREE)).toEqual(["a", "b"]);
  });
});
