import { describe, it, expect } from "vitest";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { approve, pr, route, guardPr, unlock } from "../src/cli/workflow.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

const journal = (dir: string) => new Journal(join(dir, ".rivet", "journal.jsonl"));
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

describe("rivet approve", () => {
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

describe("rivet pr — graph-derived body + the gate", () => {
  it("errors when there is no graph", () => {
    const dir = tmpProject();
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("run `rivet graph build`");
    expect(exitCode).toBe(1);
  });

  it("generates the body and notes zero-proof graphs (passes with a warning)", () => {
    const dir = tmpProject({ ".rivet/graph.json": ZERO });
    const { text } = run(dir, () => pr({ title: "x" }));
    expect(text).toContain("PR body generated");
    expect(text).toContain("zero bound proofs");
    expect(existsSync(join(dir, ".rivet", "pr-body.md"))).toBe(true);
  });

  it("is blocked by the gate when a proof is RED", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("red") });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(exitCode).toBe(1);
  });

  it("is blocked when proofs are green but no `rivet verify` is recorded", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("green") });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(exitCode).toBe(1);
  });

  it("passes the gate (prints the gh hint) when green AND a fresh verify is journaled", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: true, steps: [{ name: "x", ok: true }] });
    const { text, exitCode } = run(dir, () => pr({ title: "x" }));
    expect(text).toContain("gh pr create");
    expect(exitCode).toBeUndefined();
  });
});

describe("rivet route — the front door", () => {
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
    const dir = tmpProject({ ".rivet/intake/idea.md": "---\ntitle: x\n---\nbuild a quick thing\n" });
    const { text } = run(dir, () => route(undefined, { file: join(dir, ".rivet", "intake", "idea.md") }));
    expect(text).toMatch(/RESEARCH|QUICK|FULL-SPEC/);
  });

  it("floors the mode to FULL-SPEC on a security trigger", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => route("add password login with token auth", {}));
    expect(text).toContain("FULL-SPEC");
  });

  it("defers to the user when mode.routing=pick", () => {
    const dir = tmpProject({ ".rivet/config.json": JSON.stringify({ mode: { routing: "pick" } }) });
    const { text } = run(dir, () => route("do a thing", {}));
    expect(text).toContain("choose explicitly");
  });
});

describe("rivet guard pr — the shared PR predicate", () => {
  it("does nothing outside a Rivet project", () => {
    const bare = mkdtempSync(join(tmpdir(), "rivet-bare-"));
    const { text } = run(bare, () => guardPr());
    expect(text).toContain("not a Rivet project");
  });

  it("passes with a notice when the graph has zero proofs", () => {
    const dir = tmpProject({ ".rivet/graph.json": ZERO });
    const { text } = run(dir, () => guardPr());
    expect(text).toContain("zero bound proofs");
  });

  it("blocks (exit 2) when a proof is red", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("red") });
    const { text, exitCode } = run(dir, () => guardPr());
    expect(text).toContain("blocked");
    expect(exitCode).toBe(2);
  });

  it("blocks (exit 2) when green but no fresh verify exists", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("green") });
    const { exitCode } = run(dir, () => guardPr());
    expect(exitCode).toBe(2);
  });

  it("allows the PR when green AND verify is fresh", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: true, steps: [] });
    const { text } = run(dir, () => guardPr());
    expect(text).toContain("may proceed");
  });
});

describe("rivet unlock — the journaled escape hatch", () => {
  it("writes unlock.json, journals a governance event, and prints the window", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => unlock(["spec/x.md"], { minutes: "15" }));
    expect(text).toContain("unlocked for 15m");
    const unlockFile = JSON.parse(readFileSync(join(dir, ".rivet", "unlock.json"), "utf8"));
    expect(unlockFile.paths).toEqual(["spec/x.md"]);
    expect(readFileSync(join(dir, ".rivet", "journal.jsonl"), "utf8")).toContain("governance");
  });

  it("defaults to a 30-minute window on a bad --minutes", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => unlock(["a"], { minutes: "garbage" }));
    expect(text).toContain("unlocked for 30m");
  });
});

describe("rivet pr — verify-RED reasons", () => {
  it("prints the gate reasons when proofs are green but the last verify was RED", () => {
    const dir = tmpProject({ ".rivet/graph.json": validates("green") });
    journal(dir).append("verify.run", { passed: false, steps: [{ name: "x", ok: false }] });
    const { text, exitCode } = run(dir, () => pr({}));
    expect(text).toContain("blocked by the gate");
    expect(text).toContain("RED");
    expect(exitCode).toBe(1);
  });
});

describe("rivet guard pr — a malformed graph blocks (absence ≠ permission)", () => {
  it("treats an unparseable graph.json as no graph and blocks", () => {
    const dir = tmpProject({ ".rivet/graph.json": "{ not json" });
    const { text, exitCode } = run(dir, () => guardPr());
    expect(text).toContain("blocked");
    expect(exitCode).toBe(2);
  });
});
