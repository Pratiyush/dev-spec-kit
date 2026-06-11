import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { proofStamp } from "../src/cli/tasks.js";
import { identityLabel } from "../src/engine/verify/stamp.js";
import { buildPrBody } from "../src/engine/pr/body.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { buildVTG } from "../src/engine/graph/build.js";
import { renderLog } from "../src/cli/log.js";
import { Journal, type JournalEvent } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { createApproval } from "../src/engine/approvals.js";

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

// FIX-PROOF-04: FIX-PROOF-03 fixed ONE printer; the lesson said sweep them ALL. Every surface that
// renders a proof (PR body, approval artifact, audit log → LEDGER recent activity) must show the
// same identity the engine reasons with — the tested tree — never a bare commit sha.
describe("FIX-PROOF-04 — every proof surface stamps the tree identity", () => {
  it("identityLabel prefers the tree, falls back to sha, renders empty when neither", () => {
    expect(identityLabel({ sha: SHA, tree: TREE, dirty: true })).toBe(`tree ${TREE.slice(0, 8)}*`);
    expect(identityLabel({ sha: SHA })).toBe(SHA.slice(0, 8));
    expect(identityLabel({})).toBe("");
  });

  it("PR body coverage line stamps the tree (dirty-marked), not the head sha", () => {
    const spec = `## Requirement R-1 — a\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n`;
    const requirements = parseSpec(spec);
    const graph = buildVTG({
      requirements,
      currentSha: "HEAD",
      tasks: [
        {
          id: "R-1",
          title: "a",
          status: "done",
          boundChecks: ["A#a"],
          results: { "A#a": { ref: "A#a", passed: true, at: "t", sha: "HEAD" } },
        },
      ],
    });
    const body = buildPrBody({
      title: "x",
      requirements,
      graph,
      tasks: [],
      approvals: [],
      headSha: SHA,
      tree: TREE,
      dirty: true,
    });
    expect(body).toContain(`at \`tree ${TREE.slice(0, 8)}*\``);
    expect(body).not.toContain(SHA.slice(0, 8));
  });

  it("PR body falls back to the sha for legacy callers without a tree", () => {
    const body = buildPrBody({
      title: "x",
      requirements: [],
      graph: { nodes: [], edges: [] },
      tasks: [],
      approvals: [],
      headSha: SHA,
    });
    expect(body).toContain(`at \`${SHA.slice(0, 8)}\``);
  });

  it("approval evidence rows stamp the recorded tree, not the recorded sha", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-stamp-"));
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-12T01:00:00Z", sha: SHA, tree: TREE, dirty: false });
    store.markDone("T1");
    const { markdown } = createApproval({ projectDir: dir, taskIds: ["T1"], store, journal, approver: "P" });
    expect(markdown).toContain(`✅ \`c1\` @ tree ${TREE.slice(0, 8)}`);
    expect(markdown).not.toContain(SHA.slice(0, 8));
    expect(markdown).toContain("**Code tree:**");
  });

  it("audit log (and therefore LEDGER recent activity) stamps the tree for check runs", () => {
    const ev = (result: Record<string, unknown>): JournalEvent =>
      ({ at: "2026-06-12T01:00:00.000Z", type: "check.run", data: { taskId: "T1", result } }) as JournalEvent;
    const [modern] = renderLog([ev({ ref: "c1", passed: true, at: "t", sha: SHA, tree: TREE, dirty: true })]);
    expect(modern).toContain(`tree ${TREE.slice(0, 8)}*`);
    expect(modern).not.toContain(SHA.slice(0, 8));
    const [legacy] = renderLog([ev({ ref: "c1", passed: false, at: "t", sha: SHA })]);
    expect(legacy).toContain(`@ ${SHA.slice(0, 8)}`);
  });
});
