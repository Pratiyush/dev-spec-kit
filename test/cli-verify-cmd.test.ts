import { describe, it, expect } from "vitest";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyCmd, stampProofs, advanceTasks } from "../src/cli/verify-cmd.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { defaultConfig } from "../src/config/schema.js";
import type { VerifyRun } from "../src/engine/verify/verify-all.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

const TREE = "tree-deadbeef";

function vitestReport(file: string, title: string, status: "passed" | "failed"): string {
  return JSON.stringify({
    numTotalTests: 1,
    numPassedTests: status === "passed" ? 1 : 0,
    numFailedTests: status === "failed" ? 1 : 0,
    testResults: [
      {
        name: file,
        assertionResults: [{ title, status, failureMessages: status === "failed" ? ["boom"] : [] }],
      },
    ],
  });
}

describe("rivet verify — orchestration", () => {
  it("reports nothing to verify when no build steps or kinds are configured", () => {
    const dir = tmpProject({ ".rivet/config.json": JSON.stringify({ verify: { kinds: [], buildAll: [] } }) });
    const { text, exitCode } = run(dir, () => verifyCmd());
    expect(text).toContain("nothing to verify");
    expect(exitCode).toBe(1);
  });

  it("runs a build step, prints the summary, journals verify.run, and is GREEN", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({
        verify: { kinds: [], buildAll: [{ cmd: "node", args: ["-e", "0"] }] },
      }),
    });
    const { text, exitCode } = run(dir, () => verifyCmd());
    expect(text).toContain("verify summary");
    expect(text).toContain("verify GREEN");
    expect(exitCode).toBeUndefined();
    const journal = readFileSync(join(dir, ".rivet", "journal.jsonl"), "utf8");
    expect(journal).toContain("verify.run");
  });

  it("is RED (exit 1) when a build step fails", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({
        verify: { kinds: [], buildAll: [{ cmd: "node", args: ["-e", "process.exit(1)"] }] },
      }),
    });
    const { text, exitCode } = run(dir, () => verifyCmd());
    expect(text).toContain("verify RED");
    expect(exitCode).toBe(1);
  });

  it("--stamp with no JS test report says there is nothing to stamp", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({
        verify: { kinds: [], buildAll: [{ cmd: "node", args: ["-e", "0"] }] },
      }),
    });
    const { text } = run(dir, () => verifyCmd({ stamp: true }));
    expect(text).toContain("nothing to stamp");
  });
});

describe("stampProofs — map one suite run onto every bound criterion", () => {
  it("records a green proof for a ref the report covers", () => {
    const dir = tmpProject();
    const reportPath = join(dir, "report.json");
    writeFileSync(reportPath, vitestReport("/p/test/foo.test.ts", "does the thing", "passed"));
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["test/foo.test.ts::does the thing"]);
    const vrun: VerifyRun = {
      passed: true,
      steps: [],
      reports: [{ path: reportPath, reporter: "vitest" }],
      tree: TREE,
    };
    const { text } = run(dir, () => stampProofs(dir, defaultConfig(), journal, vrun));
    expect(text).toContain("stamped 1 proof");
    expect(text).toContain("1 green");
    expect(store.get("T1")!.results["test/foo.test.ts::does the thing"]!.passed).toBe(true);
  });

  it("records a red proof (with the failure tail) when the matched test failed", () => {
    const dir = tmpProject();
    const reportPath = join(dir, "report.json");
    writeFileSync(reportPath, vitestReport("/p/test/foo.test.ts", "does the thing", "failed"));
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["test/foo.test.ts::does the thing"]);
    const vrun: VerifyRun = {
      passed: false,
      steps: [],
      reports: [{ path: reportPath, reporter: "vitest" }],
      tree: TREE,
    };
    const { text } = run(dir, () => stampProofs(dir, defaultConfig(), journal, vrun));
    expect(text).toContain("1 red");
    expect(store.get("T1")!.results["test/foo.test.ts::does the thing"]!.passed).toBe(false);
  });

  it("says nothing to stamp when no report parses", () => {
    const dir = tmpProject();
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const vrun: VerifyRun = { passed: true, steps: [], reports: [], tree: TREE };
    const { text } = run(dir, () => stampProofs(dir, defaultConfig(), journal, vrun));
    expect(text).toContain("nothing to stamp");
  });
});

describe("advanceTasks — auto-advance fully-proven tasks", () => {
  it("marks a task done when its bound checks are all green at the verified tree", () => {
    const dir = tmpProject();
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: TREE });
    const vrun: VerifyRun = { passed: true, steps: [], tree: TREE };
    const { text } = run(dir, () => advanceTasks(dir, defaultConfig(), journal, vrun));
    expect(text).toContain("advanced 1");
    expect(store.get("T1")!.status).toBe("done");
  });

  it("advances nothing (and prints nothing) when no task is fully proven", () => {
    const dir = tmpProject();
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1"]); // never proven
    const vrun: VerifyRun = { passed: true, steps: [], tree: TREE };
    const { text } = run(dir, () => advanceTasks(dir, defaultConfig(), journal, vrun));
    expect(text).toBe("");
    expect(store.get("T1")!.status).toBe("pending");
  });
});

// ensure the boards are produced where stamping refreshes docs
it("stamp refresh writes LEDGER", () => {
  const dir = tmpProject();
  const reportPath = join(dir, "r.json");
  writeFileSync(reportPath, vitestReport("/p/test/foo.test.ts", "t", "passed"));
  const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
  const store = new TaskStore(journal);
  store.create("T1", "t", ["test/foo.test.ts::t"]);
  const vrun: VerifyRun = {
    passed: true,
    steps: [],
    reports: [{ path: reportPath, reporter: "vitest" }],
    tree: TREE,
  };
  run(dir, () => stampProofs(dir, defaultConfig(), journal, vrun));
  expect(existsSync(join(dir, ".rivet", "LEDGER.md"))).toBe(true);
});
