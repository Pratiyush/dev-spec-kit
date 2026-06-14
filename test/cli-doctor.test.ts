import { describe, it, expect } from "vitest";
import { doctorChecks, parseStaleWorktrees, runDoctor } from "../src/cli/doctor.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

describe("doctorChecks — the prerequisite matrix (probe-injectable)", () => {
  it("is all-green when every probe answers", () => {
    const checks = doctorChecks(() => "v1.2.3");
    expect(checks.find((c) => c.name === "git")!.ok).toBe(true);
    expect(checks.find((c) => c.name === "graphify")!.ok).toBe(true);
    expect(checks.find((c) => c.name === "graphify")!.detail).toContain("installed");
  });

  it("flags a missing required tool (git) and notes graphify is optional", () => {
    const checks = doctorChecks(() => null);
    const git = checks.find((c) => c.name === "git")!;
    expect(git.ok).toBe(false);
    expect(git.required).toBe(true);
    const graphify = checks.find((c) => c.name === "graphify")!;
    expect(graphify.ok).toBe(false);
    expect(graphify.required).toBe(false);
    expect(graphify.detail).toContain("bundled revitify");
  });

  it("always reports Node from process.versions (required)", () => {
    const node = doctorChecks(() => null).find((c) => c.name === "Node.js")!;
    expect(node.required).toBe(true);
    expect(node.detail).toBe(process.version);
  });
});

describe("parseStaleWorktrees — isolation dirs only", () => {
  it("keeps only .claude/worktrees and .worktrees paths", () => {
    const porcelain = [
      "worktree /repo",
      "worktree /repo/.claude/worktrees/abc",
      "worktree /repo/.worktrees/W1",
      "worktree /somewhere/else",
    ].join("\n");
    expect(parseStaleWorktrees(porcelain)).toEqual(["/repo/.claude/worktrees/abc", "/repo/.worktrees/W1"]);
  });

  it("returns nothing for empty porcelain", () => {
    expect(parseStaleWorktrees("")).toEqual([]);
  });
});

describe("rivet doctor — the command", () => {
  it("prints the prerequisite header and (in this env) passes the required checks", () => {
    const { text } = run(tmpProject(), () => runDoctor());
    expect(text).toContain("Rivet doctor");
    expect(text).toContain("prerequisite");
  });

  it("reports drift and exits 1 when a spec has an orphaned @check", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=gone.test.ts::works\n",
    });
    const { text, exitCode } = run(dir, () => runDoctor());
    expect(text).toContain("spec health");
    expect(text).toContain("ORPHANED");
    expect(exitCode).toBe(1);
  });

  it("reports spec in sync when every @check resolves", () => {
    const dir = tmpProject({
      "foo.test.ts": 'import {it} from "vitest";\nit("works", () => {});\n',
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    const { text } = run(dir, () => runDoctor());
    expect(text).toContain("every @check ref resolves");
  });
});
