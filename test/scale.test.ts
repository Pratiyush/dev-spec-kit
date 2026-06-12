import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Journal } from "../src/engine/state/journal.js";
import { withLock } from "../src/engine/lock.js";
import { execute } from "../src/engine/verify/runner.js";
import { buildVTG } from "../src/engine/graph/build.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { auditCliRun } from "../src/engine/state/audit.js";

/** SCALE-01 (P3 backlog): the prerequisites parallel waves depend on. */

describe("withLock — cross-process mutual exclusion", () => {
  it("serializes concurrent journal appends from real child processes (no torn lines)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-lock-"));
    const journalPath = join(dir, "journal.jsonl");
    const journalUrl = new URL("../dist/engine/state/journal.js", import.meta.url).href;
    const script = `
      import { Journal } from ${JSON.stringify(journalUrl)};
      const j = new Journal(process.argv[1]);
      const id = process.argv[2];
      const pad = "x".repeat(300); // long enough that interleaving would tear JSON
      for (let i = 0; i < 20; i++) j.append("note", { id, i, pad });
    `;
    const procs = Array.from({ length: 5 }, (_, p) =>
      spawnSync("node", ["--input-type=module", "-e", script, journalPath, `p${p}`], { stdio: "pipe" }),
    );
    expect(procs.every((r) => r.status === 0)).toBe(true);
    const lines = readFileSync(journalPath, "utf8").split("\n").filter(Boolean);
    expect(lines).toHaveLength(100);
    for (const line of lines) expect(() => JSON.parse(line)).not.toThrow(); // every line intact
  });

  it("steals a stale lock instead of deadlocking", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-stale-"));
    const lock = join(dir, "x.lock");
    mkdirSync(lock); // abandoned lock from a dead process
    const ran = withLock(lock, () => "ok", { timeoutMs: 2000, staleMs: 0 });
    expect(ran).toBe("ok");
  });
});

describe("journal read cache", () => {
  it("re-reads when the file grows (append invalidates)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-cache-"));
    const path = join(dir, "j.jsonl");
    const a = new Journal(path);
    a.append("note", { n: 1 });
    expect(a.read()).toHaveLength(1);
    new Journal(path).append("note", { n: 2 }); // different instance, same file
    expect(new Journal(path).read()).toHaveLength(2);
  });
});

describe("failure-output capture", () => {
  it("a red proof carries a truncated output tail; green carries none", () => {
    const red = execute(
      { kind: "unit", ref: "boom" },
      { cmd: "node", args: ["-e", "console.error('the real reason it broke'); process.exit(1)"] },
      { cwd: process.cwd() },
    );
    expect(red.passed).toBe(false);
    expect(red.tail).toContain("the real reason it broke");
    expect((red.tail ?? "").length).toBeLessThanOrEqual(1500);

    const green = execute(
      { kind: "unit", ref: "fine" },
      { cmd: "node", args: ["-e", "console.log('noise'); process.exit(0)"] },
      { cwd: process.cwd() },
    );
    expect(green.tail).toBeUndefined();
  });
});

describe("test-anchor by source path", () => {
  it("same-named class files each get an anchor edge (ambiguity visible, never last-wins)", () => {
    const spec = "## Requirement R-1 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=Foo#a\n";
    const vtg = buildVTG({
      requirements: parseSpec(spec),
      tasks: [],
      codeGraph: {
        nodes: [
          { id: "a_foo", kind: "codeNode", label: "Foo.java", meta: { sourceFile: "a/Foo.java" } },
          { id: "b_foo", kind: "codeNode", label: "Foo.java", meta: { sourceFile: "b/Foo.java" } },
        ],
        links: [],
      },
    });
    const anchors = vtg.edges.filter((e) => e.kind === "dependsOn" && e.from === "test:Foo#a");
    expect(anchors.map((e) => e.to).sort()).toEqual(["a_foo", "b_foo"]);
  });
});

describe("audit gating (memory.journal = milestones)", () => {
  function project(mode: "full" | "milestones"): string {
    const dir = mkdtempSync(join(tmpdir(), "rivet-gate-audit-"));
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    writeFileSync(
      join(dir, ".rivet", "config.json"),
      JSON.stringify({ version: 1, memory: { journal: mode } }),
    );
    return dir;
  }

  it("milestones mode skips read-only commands but keeps mutating ones", () => {
    const dir = project("milestones");
    auditCliRun(dir, ["status"], []);
    expect(existsSync(join(dir, ".rivet", "journal.jsonl"))).toBe(false);
    auditCliRun(dir, ["task", "done"], ["T1"]);
    expect(new Journal(join(dir, ".rivet", "journal.jsonl")).read()).toHaveLength(1);
  });

  it("full mode audits everything", () => {
    const dir = project("full");
    auditCliRun(dir, ["status"], []);
    expect(new Journal(join(dir, ".rivet", "journal.jsonl")).read()).toHaveLength(1);
  });
});
