import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { waveStartAt, waveDoneAt, wavePlan, waveStart, waveDone } from "../src/cli/wave.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

const store = (dir: string) => new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));

/** A Rivet project that is a git clone with an `origin` remote (the fetch-first path needs one). */
function projectWithRemote(): string {
  const remote = mkdtempSync(join(tmpdir(), "rivet-remote-"));
  spawnSync("git", ["init", "--bare", "-b", "main", remote], { stdio: "ignore" });
  const work = tmpProject({ "src/x.ts": "export const x = 1;\n" });
  const g = (args: string[]) =>
    spawnSync("git", ["-c", "user.email=t@t.co", "-c", "user.name=t", ...args], {
      cwd: work,
      stdio: "ignore",
    });
  g(["init", "-b", "main"]);
  g(["add", "-A"]);
  g(["commit", "-m", "init"]);
  g(["remote", "add", "origin", remote]);
  g(["push", "-u", "origin", "main"]);
  g(["remote", "set-head", "origin", "main"]);
  return work;
}

describe("rivet wave plan", () => {
  it("notes when there is nothing to dispatch", () => {
    const { text } = run(tmpProject(), () => wavePlan());
    expect(text).toContain("nothing to dispatch");
  });

  it("groups pending tasks into waves", () => {
    const dir = tmpProject();
    store(dir).create("T1", "a", ["c1"]);
    store(dir).create("T2", "b", ["c2"]);
    const { text } = run(dir, () => wavePlan());
    expect(text).toContain("Wave plan");
    expect(text).toContain("T1");
  });
});

describe("rivet wave start/done — fetch-first worktrees", () => {
  it("creates a worktree branched from origin's tip, then cleans it up when merged", () => {
    const work = projectWithRemote();
    const reports = waveStartAt(work, ["W1"]);
    expect(reports).toHaveLength(1);
    expect(existsSync(join(work, ".worktrees", "W1"))).toBe(true);
    expect(readFileSync(join(work, ".gitattributes"), "utf8")).toContain("merge=union");

    // rivet/W1 is at origin/main's tip → an ancestor → cleanup is allowed without --force.
    const done = waveDoneAt(work, "W1", {});
    expect(done.removed).toBe(true);
    expect(existsSync(join(work, ".worktrees", "W1"))).toBe(false);
    expect(readFileSync(join(work, ".rivet", "journal.jsonl"), "utf8")).toContain("worktree-cleaned");
  });

  it("the CLI wrappers print their summaries", () => {
    const work = projectWithRemote();
    const started = run(work, () => waveStart(["W2"]));
    expect(started.text).toContain("worktree(s) ready");
    const cleaned = run(work, () => waveDone("W2", { force: true }));
    expect(cleaned.text).toContain("cleaned");
  });

  it("provenance: refuses an id that is not a .worktrees child", () => {
    const work = projectWithRemote();
    expect(() => waveDoneAt(work, "../escape", {})).toThrow(/provenance/);
  });

  it("provenance: refuses cleanup of a path that does not exist", () => {
    const work = projectWithRemote();
    expect(() => waveDoneAt(work, "never-created", {})).toThrow(/does not exist/);
  });
});
