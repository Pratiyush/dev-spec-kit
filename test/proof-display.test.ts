import { describe, expect, it } from "vitest";
import { proofStamp } from "../src/cli/tasks.js";

const SHA = "9aa40ae21db8e76fe3a3c5d48574acafa072b501";
const TREE = "2b626e9957e01816103d7dc0a87d93a7523d297f";

// FIX-PROOF-03: the stamp printed after ✓ PASS / ✗ FAIL must show the proof's IDENTITY — the
// tested tree — never just HEAD. Printing the sha made a red and a green over DIFFERENT code
// render the same "@ 9aa40ae2", which reads as a proof-identity bug.
describe("proof stamp display", () => {
  it("stamps the tree identity, not the commit sha", () => {
    const stamp = proofStamp({ sha: SHA, tree: TREE, dirty: true });
    expect(stamp).toContain(TREE.slice(0, 8));
    expect(stamp).not.toContain(SHA.slice(0, 8));
    expect(stamp).toContain("*"); // dirty marker: a green on a dirty tree is visible at a glance
  });

  it("falls back to the sha for legacy results without a tree", () => {
    expect(proofStamp({ sha: SHA })).toContain(SHA.slice(0, 8));
  });

  it("renders nothing when no identity exists", () => {
    expect(proofStamp({})).toBe("");
  });
});
