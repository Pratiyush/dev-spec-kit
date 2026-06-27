import { describe, it, expect } from "vitest";
import { trace, drift, affected } from "../src/cli/queries.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { join } from "node:path";
import { tmpProject, run } from "./helpers/cli-harness.js";

const store = (dir: string) => new TaskStore(new Journal(join(dir, ".dev-spec-kit", "journal.jsonl")));
const SPEC =
  "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=c1\nIF bad THEN the system SHALL NOT z.\n@check kind=unit ref=c2\n";

describe("dev-spec-kit trace", () => {
  it("notes when there are no specs", () => {
    const { text } = run(tmpProject(), () => trace());
    expect(text).toContain("no specs");
  });

  it("prints the truth table and is PENDING (exit 1) for unproven requirements", () => {
    const dir = tmpProject({ ".dev-spec-kit/specs/x.md": SPEC });
    const { text, exitCode } = run(dir, () => trace());
    expect(text).toContain("Traceability");
    expect(text).toContain("PENDING");
    expect(text).toContain("0/1 requirement(s) proven");
    expect(exitCode).toBe(1);
  });
});

describe("dev-spec-kit drift", () => {
  it("reports no drift when nothing is red or stale", () => {
    const dir = tmpProject({ ".dev-spec-kit/specs/x.md": SPEC });
    store(dir).create("REQUIREMENT_X-01", "t", ["c1", "c2"]); // unproven, not drifted
    const { text } = run(dir, () => drift({}));
    expect(text).toContain("no drift");
  });

  it("--dry-run lists a red proof without re-running it (exit 1)", () => {
    const dir = tmpProject({ ".dev-spec-kit/specs/x.md": SPEC });
    const s = store(dir);
    s.create("REQUIREMENT_X-01", "t", ["c1", "c2"]);
    s.recordCheck("REQUIREMENT_X-01", { ref: "c1", passed: false, at: "x", sha: "S", tree: "T" });
    const { text, exitCode } = run(dir, () => drift({ dryRun: true }));
    expect(text).toContain("drifted proof");
    expect(text).toContain("--dry-run");
    expect(exitCode).toBe(1);
  });

  it("re-runs a drifted proof through a custom runner and re-greens it", () => {
    const dir = tmpProject({
      ".dev-spec-kit/config.json": JSON.stringify({
        verify: { runners: { fake: { cmd: "node", args: ["-e", "process.exit(0)"] } } },
      }),
      ".dev-spec-kit/specs/x.md": SPEC,
    });
    const s = store(dir);
    s.create("REQUIREMENT_X-01", "t", ["c1", "c2"]);
    s.recordCheck("REQUIREMENT_X-01", { ref: "c1", passed: false, at: "x", sha: "S", tree: "T" });
    const { text } = run(dir, () => drift({ stack: "fake" }));
    expect(text).toContain("re-ran");
  });

  it("batches a large drift (≥5 JS proofs) into one suite run instead of N serial spawns", () => {
    const checks = ["c1", "c2", "c3", "c4", "c5", "c6"];
    const spec =
      "## Requirement REQUIREMENT_B-01 — t\nWHEN x THEN the system SHALL y.\n" +
      checks.map((c) => `@check kind=unit ref=${c}`).join("\n") +
      "\n";
    const dir = tmpProject({
      ".dev-spec-kit/config.json": JSON.stringify({
        verify: { buildAll: [{ cmd: "node", args: ["-e", "0"] }] },
      }),
      ".dev-spec-kit/specs/b.md": spec,
    });
    const s = store(dir);
    s.create("REQUIREMENT_B-01", "t", checks);
    for (const c of checks)
      s.recordCheck("REQUIREMENT_B-01", {
        ref: c,
        passed: false,
        at: "x",
        sha: "S",
        tree: "T",
        stack: "node-vitest",
      });
    const { text } = run(dir, () => drift({}));
    expect(text).toContain("batching into one suite run"); // took the batch path, not N serial spawns
  });
});

describe("dev-spec-kit affected", () => {
  it("reports no matching code node for an unknown label", () => {
    const dir = tmpProject({ ".dev-spec-kit/specs/x.md": SPEC });
    const { text } = run(dir, () => affected("does-not-exist-anywhere"));
    expect(text).toContain("no code node matching");
  });
});

describe("dev-spec-kit drift — no stack to re-run with", () => {
  it("skips a drifted proof that has no recorded stack and no --stack fallback", () => {
    const dir = tmpProject({ ".dev-spec-kit/specs/x.md": SPEC });
    const s = store(dir);
    s.create("REQUIREMENT_X-01", "t", ["c1", "c2"]);
    s.recordCheck("REQUIREMENT_X-01", { ref: "c1", passed: false, at: "x", sha: "S", tree: "T" }); // no stack
    const { text } = run(dir, () => drift({}));
    expect(text).toContain("no recorded stack");
  });
});
