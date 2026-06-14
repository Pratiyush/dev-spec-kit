import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { taskCreate, taskStart, taskDone, checkRun, status, taskTrail } from "../src/cli/tasks.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { join } from "node:path";
import { tmpProject, run, runAsync } from "./helpers/cli-harness.js";

const store = (dir: string) => new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));
const PASS = JSON.stringify({
  verify: { runners: { fake: { cmd: "node", args: ["-e", "process.exit(0)"] } } },
});
const FAIL = JSON.stringify({
  verify: { runners: { fake: { cmd: "node", args: ["-e", "process.exit(1)"] } } },
});

function gitInit(dir: string): void {
  for (const args of [
    ["init"],
    ["add", "-A"],
    ["-c", "user.email=t@t.co", "-c", "user.name=t", "commit", "-m", "x"],
  ])
    spawnSync("git", args, { cwd: dir, stdio: "ignore" });
}

describe("rivet task create", () => {
  it("creates a task and lists its bound checks", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => taskCreate("T1", "do it", ["c1", "c2"]));
    expect(text).toContain("Task T1 created");
    expect(text).toContain("bound: c1");
  });

  it("warns when a task has no bound checks (can never be proven)", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => taskCreate("T1", "do it", []));
    expect(text).toContain("never be proven");
  });
});

describe("rivet task start", () => {
  it("marks the task in progress", () => {
    const dir = tmpProject();
    store(dir).create("T1", "do it", ["c1"]);
    const { text } = run(dir, () => taskStart("T1"));
    expect(text).toContain("in progress");
  });

  it("surfaces a matching OPEN lesson from the ledger (warn-on-repeat)", () => {
    const dir = tmpProject({
      ".rivet/learnings.md":
        "# L\n\n## Worktree dispatch ordering matters\n- Lesson: order dispatch.\n- Promoted to: OPEN\n",
    });
    store(dir).create("T1", "improve worktree dispatch ordering", ["c1"]);
    const { text } = run(dir, () => taskStart("T1"));
    expect(text).toContain("open lesson may apply");
  });
});

describe("rivet task done — THE GATE", () => {
  it("marks done when every bound check is green", () => {
    const dir = tmpProject();
    const s = store(dir);
    s.create("T1", "t", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: "T" });
    const { text } = run(dir, () => taskDone("T1"));
    expect(text).toContain("Task T1 DONE");
    expect(store(dir).get("T1")!.status).toBe("done");
  });

  it("BLOCKS (exit 1) when a bound check never ran", () => {
    const dir = tmpProject();
    store(dir).create("T1", "t", ["c1"]);
    const { text, exitCode } = run(dir, () => taskDone("T1"));
    expect(text).toContain("BLOCKED");
    expect(exitCode).toBe(1);
  });

  it("degrades to DONE-WITH-WARNINGS when verify.blockDoneOnFail=false", () => {
    const dir = tmpProject({ ".rivet/config.json": JSON.stringify({ verify: { blockDoneOnFail: false } }) });
    store(dir).create("T1", "t", ["c1"]); // unproven
    const { text } = run(dir, () => taskDone("T1"));
    expect(text).toContain("DONE-WITH-WARNINGS");
    expect(store(dir).get("T1")!.status).toBe("done");
  });

  it("BLOCKS on a STALE proof — code moved after the run (git tree differs)", () => {
    const dir = tmpProject({ "src/x.ts": "export const x = 1;\n" }); // real file so the commit has a tree
    gitInit(dir);
    const s = store(dir);
    s.create("T1", "t", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "x", sha: "S", tree: "STALE_TREE_HASH" });
    const { text, exitCode } = run(dir, () => taskDone("T1"));
    expect(text).toContain("STALE");
    expect(exitCode).toBe(1);
  });
});

describe("rivet check run — executed proof via a custom runner", () => {
  it("records a PASS when the runner exits 0", async () => {
    const dir = tmpProject({ ".rivet/config.json": PASS });
    store(dir).create("T1", "t", ["c1"]);
    const { text } = await runAsync(dir, () => checkRun("T1", "c1", "fake"));
    expect(text).toContain("PASS c1");
    expect(store(dir).get("T1")!.results["c1"]!.passed).toBe(true);
  });

  it("records a FAIL (exit 1) when the runner exits non-zero", async () => {
    const dir = tmpProject({ ".rivet/config.json": FAIL });
    store(dir).create("T1", "t", ["c1"]);
    const { text, exitCode } = await runAsync(dir, () => checkRun("T1", "c1", "fake"));
    expect(text).toContain("FAIL c1");
    expect(exitCode).toBe(1);
  });

  it("rejects an unknown stack with exit 2", async () => {
    const dir = tmpProject();
    store(dir).create("T1", "t", ["c1"]);
    const { text, exitCode } = await runAsync(dir, () => checkRun("T1", "c1", "bogus-stack"));
    expect(text).toContain("unknown --stack");
    expect(exitCode).toBe(2);
  });
});

describe("rivet check run — a judge ref (FEAT-JUDGE-01)", () => {
  const judgeSpec =
    "## Requirement REQUIREMENT_X-01 — copy\nThe error copy SHALL be actionable.\n@check kind=judge ref=copy::actionable\n";

  it("blocks a judge verdict on a full obligation by default", async () => {
    const dir = tmpProject({ ".rivet/specs/x.md": judgeSpec });
    store(dir).create("T1", "t", ["copy::actionable"]);
    const { text, exitCode } = await runAsync(dir, () =>
      checkRun("T1", "copy::actionable", undefined, { verdict: "pass" }),
    );
    expect(text).toContain("judge blocked");
    expect(exitCode).toBe(2);
  });

  it("records a harness JUDGED PASS when obligations are allowed", async () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ verify: { judge: { allowForObligations: true } } }),
      ".rivet/specs/x.md": judgeSpec,
    });
    store(dir).create("T1", "t", ["copy::actionable"]);
    const { text } = await runAsync(dir, () =>
      checkRun("T1", "copy::actionable", undefined, { verdict: "pass", reason: "clear and specific" }),
    );
    expect(text).toContain("JUDGED PASS");
    expect(store(dir).get("T1")!.results["copy::actionable"]!.kind).toBe("judge");
  });

  it("records a JUDGED FAIL (exit 1) on a fail verdict", async () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ verify: { judge: { allowForObligations: true } } }),
      ".rivet/specs/x.md": judgeSpec,
    });
    store(dir).create("T1", "t", ["copy::actionable"]);
    const { text, exitCode } = await runAsync(dir, () =>
      checkRun("T1", "copy::actionable", undefined, { verdict: "fail", reason: "vague" }),
    );
    expect(text).toContain("JUDGED FAIL");
    expect(exitCode).toBe(1);
  });

  it("asks for a verdict in harness mode when none is supplied", async () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ verify: { judge: { allowForObligations: true } } }),
      ".rivet/specs/x.md": judgeSpec,
    });
    store(dir).create("T1", "t", ["copy::actionable"]);
    const { text, exitCode } = await runAsync(dir, () => checkRun("T1", "copy::actionable", undefined));
    expect(text).toContain("needs a verdict");
    expect(exitCode).toBe(2);
  });

  it("reports 'judge unavailable' when api mode has no SDK installed", async () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ verify: { judge: { allowForObligations: true, mode: "api" } } }),
      ".rivet/specs/x.md": judgeSpec,
    });
    store(dir).create("T1", "t", ["copy::actionable"]);
    const { text, exitCode } = await runAsync(dir, () => checkRun("T1", "copy::actionable", undefined));
    expect(text).toContain("judge unavailable");
    expect(exitCode).toBe(2);
  });
});

describe("rivet status", () => {
  it("notes when there are no tasks", () => {
    const { text } = run(tmpProject(), () => status());
    expect(text).toContain("no tasks yet");
  });

  it("renders a light per bound check across statuses", () => {
    const dir = tmpProject();
    const s = store(dir);
    s.create("T1", "done one", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "x", sha: "S", tree: "T" });
    s.markDone("T1");
    s.create("T2", "todo one", ["c2"]);
    const { text } = run(dir, () => status());
    expect(text).toContain("DONE");
    expect(text).toContain("● green");
    expect(text).toContain("○ unproven");
  });
});

describe("rivet task trail", () => {
  it("renders the gate timeline for a task with events", () => {
    const dir = tmpProject();
    const s = store(dir);
    s.create("T1", "t", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "x", sha: "S", tree: "T" });
    const { text } = run(dir, () => taskTrail("T1"));
    expect(text).toContain("Gate trail — T1");
  });

  it("notes when a task has no recorded gates", () => {
    const { text } = run(tmpProject(), () => taskTrail("GHOST"));
    expect(text).toContain("no recorded gates");
  });
});
