import { describe, it, expect } from "vitest";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { approve, pr, route, guardPr, gateCmd, unlock } from "../src/cli/workflow.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

const journal = (dir: string) => new Journal(join(dir, ".dev-spec-kit", "journal.jsonl"));
const store = (dir: string) => new TaskStore(journal(dir));

const validates = (proof: string) =>
  JSON.stringify({
    nodes: [
      { id: "t:1", kind: "test", label: "x" },
      { id: "AC1", kind: "acceptanceCriterion", label: "x" },
    ],
    edges: [{ id: "e1", from: "t:1", to: "AC1", kind: "validates", proof, lastCheck: { ref: "c1" } }],
  });
const ZERO = JSON.stringify({ nodes: [], edges: [] });

describe("dev-spec-kit gate — lean graph-clean check (exit 2, no fresh-verify gate)", () => {
  it("passes (no exit code) when every proof is green", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    const { text, exitCode } = run(dir, () => gateCmd({}));
    expect(text).toContain("every proof green");
    expect(exitCode).toBeUndefined();
  });

  it("blocks (exit 2) on a STALE proof — the case the grep-guard false-passed", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("stale") });
    const { text, exitCode } = run(dir, () => gateCmd({}));
    expect(text).toContain("blocked");
    expect(text).toContain("STALE");
    expect(exitCode).toBe(2);
  });

  it("blocks (exit 2) on RED and on UNPROVEN too", () => {
    for (const p of ["red", "unproven"]) {
      const dir = tmpProject({ ".dev-spec-kit/graph.json": validates(p) });
      expect(run(dir, () => gateCmd({})).exitCode).toBe(2);
    }
  });

  it("blocks (exit 2) when the graph is missing — absence ≠ permission", () => {
    const dir = tmpProject(); // .dev-spec-kit exists, but no graph.json
    const { text, exitCode } = run(dir, () => gateCmd({}));
    expect(text).toContain("graph build");
    expect(exitCode).toBe(2);
  });

  it("passes zero-proof graphs with a notice", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": ZERO });
    const { text, exitCode } = run(dir, () => gateCmd({}));
    expect(text).toContain("zero bound proofs");
    expect(exitCode).toBeUndefined();
  });

  it("--quiet emits nothing and only signals the exit code", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("stale") });
    const { text, exitCode } = run(dir, () => gateCmd({ quiet: true }));
    expect(text).toBe("");
    expect(exitCode).toBe(2);
  });

  it("is a no-op outside a dev-spec-kit project", () => {
    const bare = mkdtempSync(join(tmpdir(), "gate-bare-"));
    const { text, exitCode } = run(bare, () => gateCmd({}));
    expect(text).toContain("nothing to enforce");
    expect(exitCode).toBeUndefined();
  });
});

describe("dev-spec-kit approve", () => {
  it("records an approval for a proven (done) task", () => {
    const dir = tmpProject();
    const s = store(dir);
    s.create("T1", "t", ["c1"]);
    s.recordCheck("T1", { ref: "c1", passed: true, at: "2026-06-12T00:00:00Z", sha: "S", tree: "T" });
    s.markDone("T1");
    const { text } = run(dir, () => approve(["T1"], { note: "ship it" }));
    expect(text).toContain("Approval recorded");
  });

  it("refuses (exit 1) to approve an unknown task", () => {
    const dir = tmpProject();
    const { text, exitCode } = run(dir, () => approve(["GHOST"], {}));
    expect(text).toContain("unknown task");
    expect(exitCode).toBe(1);
  });
});

describe("dev-spec-kit pr — graph-derived body + the gate", () => {
  it("errors when there is no graph", () => {
    const dir = tmpProject();
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("run `dev-spec-kit graph build`");
    expect(exitCode).toBe(1);
  });

  it("generates the body and notes zero-proof graphs (passes with a warning)", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": ZERO });
    const { text } = run(dir, () => pr({ title: "x" }));
    expect(text).toContain("PR body generated");
    expect(text).toContain("zero bound proofs");
    expect(existsSync(join(dir, ".dev-spec-kit", "pr-body.md"))).toBe(true);
  });

  it("is blocked by the gate when a proof is RED", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("red") });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(exitCode).toBe(1);
  });

  it("is blocked when proofs are green but no `dev-spec-kit verify` is recorded", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(exitCode).toBe(1);
  });

  it("passes the gate (prints the gh hint) when green AND a fresh verify is journaled", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: true, steps: [{ name: "x", ok: true }] });
    const { text, exitCode } = run(dir, () => pr({ title: "x" }));
    expect(text).toContain("gh pr create");
    expect(exitCode).toBeUndefined();
  });
});

describe("dev-spec-kit route — the front door", () => {
  it("errors with no request text", () => {
    const dir = tmpProject();
    const { text, exitCode } = run(dir, () => route(undefined, {}));
    expect(text).toContain("provide a request");
    expect(exitCode).toBe(1);
  });

  it("classifies a request and prints the next step", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => route("add a small helper function", {}));
    expect(text).toMatch(/RESEARCH|QUICK|FULL-SPEC/);
    expect(text).toContain("next:");
  });

  it("honors an explicit --mode override", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => route("anything", { mode: "research" }));
    expect(text).toContain("RESEARCH");
  });

  it("errors on a missing --file", () => {
    const dir = tmpProject();
    const { text, exitCode } = run(dir, () => route(undefined, { file: join(dir, "nope.md") }));
    expect(text).toContain("no such intake file");
    expect(exitCode).toBe(1);
  });

  it("routes the body of an intake --file (frontmatter stripped)", () => {
    const dir = tmpProject({ ".dev-spec-kit/intake/idea.md": "---\ntitle: x\n---\nbuild a quick thing\n" });
    const { text } = run(dir, () =>
      route(undefined, { file: join(dir, ".dev-spec-kit", "intake", "idea.md") }),
    );
    expect(text).toMatch(/RESEARCH|QUICK|FULL-SPEC/);
  });

  it("floors the mode to FULL-SPEC on a security trigger", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => route("add password login with token auth", {}));
    expect(text).toContain("FULL-SPEC");
  });

  it("defers to the user when mode.routing=pick", () => {
    const dir = tmpProject({ ".dev-spec-kit/config.json": JSON.stringify({ mode: { routing: "pick" } }) });
    const { text } = run(dir, () => route("do a thing", {}));
    expect(text).toContain("choose explicitly");
  });
});

describe("dev-spec-kit guard pr — the shared PR predicate", () => {
  it("does nothing outside a dev-spec-kit project", () => {
    const bare = mkdtempSync(join(tmpdir(), "dev-spec-kit-bare-"));
    const { text } = run(bare, () => guardPr());
    expect(text).toContain("not a dev-spec-kit project");
  });

  it("passes with a notice when the graph has zero proofs", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": ZERO });
    const { text } = run(dir, () => guardPr());
    expect(text).toContain("zero bound proofs");
  });

  it("blocks (exit 2) when a proof is red", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("red") });
    const { text, exitCode } = run(dir, () => guardPr());
    expect(text).toContain("blocked");
    expect(exitCode).toBe(2);
  });

  it("blocks (exit 2) when green but no fresh verify exists", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    const { exitCode } = run(dir, () => guardPr());
    expect(exitCode).toBe(2);
  });

  it("allows the PR when green AND verify is fresh", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: true, steps: [] });
    const { text } = run(dir, () => guardPr());
    expect(text).toContain("may proceed");
  });
});

describe("dev-spec-kit unlock — the journaled escape hatch", () => {
  it("writes unlock.json, journals a governance event, and prints the window", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => unlock(["spec/x.md"], { minutes: "15" }));
    expect(text).toContain("unlocked for 15m");
    const unlockFile = JSON.parse(readFileSync(join(dir, ".dev-spec-kit", "unlock.json"), "utf8"));
    expect(unlockFile.paths).toEqual(["spec/x.md"]);
    expect(readFileSync(join(dir, ".dev-spec-kit", "journal.jsonl"), "utf8")).toContain("governance");
  });

  it("defaults to a 30-minute window on a bad --minutes", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => unlock(["a"], { minutes: "garbage" }));
    expect(text).toContain("unlocked for 30m");
  });
});

describe("dev-spec-kit pr — verify-RED reasons", () => {
  it("prints the gate reasons when proofs are green but the last verify was RED", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: false, steps: [{ name: "x", ok: false }] });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(text).toContain("RED");
    expect(exitCode).toBe(1);
  });
});

describe("dev-spec-kit guard pr — a malformed graph blocks (absence ≠ permission)", () => {
  it("treats an unparseable graph.json as no graph and blocks", () => {
    const dir = tmpProject({ ".dev-spec-kit/graph.json": "{ not json" });
    const { text, exitCode } = run(dir, () => guardPr());
    expect(text).toContain("blocked");
    expect(exitCode).toBe(2);
  });
});
