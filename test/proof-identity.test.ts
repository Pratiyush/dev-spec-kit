import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { gitDiffFiles, gitTreeHash, isDirty } from "../src/engine/git.js";
import { execute } from "../src/engine/verify/runner.js";
import { buildVTG } from "../src/engine/graph/build.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import type { Task } from "../src/engine/state/tasks.js";

/**
 * FIX-PROOF-01 (BLOCKER): proof identity must be the TESTED TREE, not the commit SHA.
 * Old behavior: green could vouch for uncommitted code, and committing the tested code staled
 * every proof. New behavior: proofs carry the content tree-hash; staleness compares trees, so a
 * commit that doesn't change the content keeps proofs green, and changed content goes stale.
 */

function tempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-proof-"));
  const run = (cmd: string) => execSync(cmd, { cwd: dir, stdio: "pipe" });
  run("git init -q");
  run("git config user.name Test && git config user.email t@t");
  writeFileSync(join(dir, "f.txt"), "v1\n");
  run("git add -A && git commit -qm c1");
  return dir;
}

const SPEC = `## Requirement R-1 — a\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n`;

function taskWith(result: Task["results"][string]): Task {
  return { id: "R-1", title: "a", status: "in_progress", boundChecks: ["A#a"], results: { "A#a": result } };
}

describe("proof identity = tested tree", () => {
  it("execute() records the content tree-hash and dirty flag", () => {
    const dir = tempRepo();
    const clean = execute(
      { kind: "unit", ref: "A#a" },
      { cmd: "node", args: ["-e", "process.exit(0)"] },
      { cwd: dir },
    );
    expect(clean.tree).toBeTruthy();
    expect(clean.dirty).toBe(false);

    writeFileSync(join(dir, "f.txt"), "v2\n");
    const dirty = execute(
      { kind: "unit", ref: "A#a" },
      { cmd: "node", args: ["-e", "process.exit(0)"] },
      { cwd: dir },
    );
    expect(dirty.dirty).toBe(true);
    expect(dirty.tree).not.toBe(clean.tree); // different content => different identity
  });

  it("a proof taken on a dirty tree SURVIVES the commit of that same content", () => {
    const dir = tempRepo();
    writeFileSync(join(dir, "f.txt"), "v2\n");
    const proof = execute(
      { kind: "unit", ref: "A#a" },
      { cmd: "node", args: ["-e", "process.exit(0)"] },
      { cwd: dir },
    );
    expect(proof.dirty).toBe(true);

    execSync("git add -A && git commit -qm c2", { cwd: dir, stdio: "pipe" }); // HEAD moves
    expect(isDirty(dir)).toBe(false);
    expect(gitTreeHash(dir)).toBe(proof.tree); // same content, same identity

    const vtg = buildVTG({
      requirements: parseSpec(SPEC),
      tasks: [taskWith(proof)],
      currentSha: "DIFFERENT-HEAD", // sha moved —
      currentTree: gitTreeHash(dir), // — but the tree did not
    });
    const edge = vtg.edges.find((e) => e.kind === "validates")!;
    expect(edge.proof).toBe("green"); // old behavior: stale. The moat's claim holds now.
  });

  it("FIX-PROOF-02: the journal must not stale its own proofs — .dev-spec-kit is excluded from identity", () => {
    const dir = tempRepo();
    execSync(
      "mkdir -p .dev-spec-kit && echo '{}' > .dev-spec-kit/journal.jsonl && git add -A && git commit -qm rivet",
      {
        cwd: dir,
        stdio: "pipe",
      },
    );
    const before = gitTreeHash(dir);
    // Recording a proof appends to the tracked journal — identity MUST NOT move.
    execSync('echo \'{"type":"check.run"}\' >> .dev-spec-kit/journal.jsonl', { cwd: dir, stdio: "pipe" });
    expect(gitTreeHash(dir)).toBe(before);
    // …but a CODE change still moves it.
    writeFileSync(join(dir, "f.txt"), "v-changed\n");
    expect(gitTreeHash(dir)).not.toBe(before);
  });

  it("the revitify code-graph cache is excluded from identity — graph build must not stale its own proofs", () => {
    const dir = tempRepo();
    execSync(
      "mkdir -p .revitify/cache && echo '{}' > .revitify/cache/stat-index.json && git add -A && git commit -qm revitify",
      { cwd: dir, stdio: "pipe" },
    );
    const before = gitTreeHash(dir);
    // `graph build` regenerates the cache — identity MUST NOT move (the self-stale bug), and it isn't "dirty" either.
    execSync("echo '{\"changed\":1}' > .revitify/cache/stat-index.json", { cwd: dir, stdio: "pipe" });
    expect(gitTreeHash(dir)).toBe(before);
    expect(isDirty(dir)).toBe(false);
    // …but a CODE change still moves it.
    writeFileSync(join(dir, "f.txt"), "v-changed\n");
    expect(gitTreeHash(dir)).not.toBe(before);
  });

  it("untracked code files now COUNT toward identity (closes the old stash-create blind spot)", () => {
    const dir = tempRepo();
    const before = gitTreeHash(dir);
    writeFileSync(join(dir, "brand-new.ts"), "export const x = 1;\n");
    expect(gitTreeHash(dir)).not.toBe(before);
  });

  it("gitDiffFiles lists files changed between two trees; undefined for an undiffable tree (FEAT-INCR-01)", () => {
    const dir = tempRepo();
    const t1 = gitTreeHash(dir)!;
    writeFileSync(join(dir, "f.txt"), "v2\n");
    writeFileSync(join(dir, "new.ts"), "export const x = 1;\n");
    const t2 = gitTreeHash(dir)!;
    expect(gitDiffFiles(dir, t1, t2)!.sort()).toEqual(["f.txt", "new.ts"]);
    expect(gitDiffFiles(dir, "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef", t2)).toBeUndefined();
  });

  it("changed content goes stale even at the same HEAD; legacy sha-only proofs still compare by sha", () => {
    const r = parseSpec(SPEC);
    const treeProof = { ref: "A#a", passed: true, at: "t", sha: "S1", tree: "T1" };
    const changed = buildVTG({
      requirements: r,
      tasks: [taskWith(treeProof)],
      currentSha: "S1",
      currentTree: "T2",
    });
    expect(changed.edges.find((e) => e.kind === "validates")!.proof).toBe("stale");

    const legacy = { ref: "A#a", passed: true, at: "t", sha: "S1" }; // no tree recorded (old journal)
    const sameSha = buildVTG({
      requirements: r,
      tasks: [taskWith(legacy)],
      currentSha: "S1",
      currentTree: "T9",
    });
    expect(sameSha.edges.find((e) => e.kind === "validates")!.proof).toBe("green");
    const movedSha = buildVTG({
      requirements: r,
      tasks: [taskWith(legacy)],
      currentSha: "S2",
      currentTree: "T9",
    });
    expect(movedSha.edges.find((e) => e.kind === "validates")!.proof).toBe("stale");
  });
});
