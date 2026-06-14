import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveCommand, resolveStack } from "../src/engine/verify/runner.js";
import { createApproval, listApprovals } from "../src/engine/approvals.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { parseConfig } from "../src/config/schema.js";
import { tmpProject } from "./helpers/cli-harness.js";

describe("resolveCommand — builtin stacks (no override)", () => {
  const binding = { kind: "unit" as const, ref: "foo.test.ts::does it" };
  it("maps node-vitest to an npx vitest run with a name filter + a json reporter", () => {
    const r = resolveCommand(binding, "node-vitest");
    expect(r.cmd).toBe("npx");
    expect(r.args).toContain("vitest");
    expect(r.args.some((a) => a.startsWith("--testNamePattern="))).toBe(true);
    expect(r.reporter).toBe("vitest");
  });

  it("maps node-jest to npx jest with a json reporter", () => {
    const r = resolveCommand(binding, "node-jest");
    expect(r.cmd).toBe("npx");
    expect(r.args).toContain("jest");
    expect(r.reporter).toBe("jest");
  });

  it("maps python-pytest to python3 -m pytest", () => {
    const r = resolveCommand({ kind: "unit", ref: "tests/test_x.py::test_y" }, "python-pytest");
    expect(r.cmd).toBe("python3");
    expect(r.args).toContain("pytest");
  });
});

describe("resolveStack — inference survives a malformed package.json", () => {
  it("infers node-vitest even when package.json is unparseable (hasDep catch)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-stack-"));
    writeFileSync(join(dir, "package.json"), "{ not json");
    const res = resolveStack(undefined, parseConfig({ project: { platforms: ["node"] } }), dir);
    expect(res.stack).toBe("node-vitest");
    expect(res.source).toBe("inferred");
  });
});

describe("approvals — listing + the no-recorded-run evidence line", () => {
  it("renders a bound check with no result as 'no recorded run' (done-with-warnings)", () => {
    const dir = tmpProject();
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1"]);
    store.markDone("T1", { force: true }); // done despite c1 having no run
    const { markdown } = createApproval({ projectDir: dir, taskIds: ["T1"], store, journal, approver: "P" });
    expect(markdown).toContain("no recorded run");
  });

  it("lists the approval files on disk", () => {
    const dir = tmpProject();
    const journal = new Journal(join(dir, ".rivet", "journal.jsonl"));
    const store = new TaskStore(journal);
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "x", sha: "S", tree: "T" });
    store.markDone("T1");
    createApproval({ projectDir: dir, taskIds: ["T1"], store, journal, approver: "P" });
    expect(listApprovals(dir).length).toBeGreaterThan(0);
  });
});
