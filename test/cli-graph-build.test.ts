import { describe, it, expect } from "vitest";
import { graphBuild } from "../src/cli/graph.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

/** Drives `rivet graph build` (refresh:false → no code-graph subprocess) through each gate branch. */

const VALID = `## Requirement REQUIREMENT_X-01 — a thing
WHEN x happens THEN the system SHALL do y.
@check kind=unit ref=A#a
IF x is invalid THEN the system SHALL reject it.
@check kind=unit ref=A#b
`;

describe("rivet graph build — the graph + its gates", () => {
  it("warns when there are no specs", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("no specs found");
  });

  it("prints the traffic-light summary and refreshes docs for a clean spec (exit 0)", () => {
    const dir = tmpProject({ ".rivet/specs/x.md": VALID });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("Verified Traceability Graph");
    expect(text).toContain("validates:");
    expect(text).toContain("docs → LEDGER");
    expect(exitCode).toBeUndefined();
  });

  it("blocks on the negative-edge floor when a requirement has no unhappy path", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_Y-01 — happy only\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n",
    });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("negativeFloor");
    expect(exitCode).toBe(1);
  });

  it("blocks an unbound obligation by default (verify.everyCriterionNeedsCheck)", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_Z-01 — partly bound\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\nIF bad THEN the system SHALL NOT proceed.\n",
    });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("NO @check binding");
    expect(text).toContain("everyCriterionNeedsCheck");
    expect(exitCode).toBe(1);
  });

  it("downgrades an unbound obligation to a warning when the knob is off", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ verify: { everyCriterionNeedsCheck: false } }),
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_Z-02 — partly bound\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\nIF bad THEN the system SHALL NOT proceed.\n",
    });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("NO @check binding");
    expect(exitCode).toBeUndefined(); // warn-only
  });

  it("errors on an unqualified id when rules.requireQualifiedIds is 'error'", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ rules: { requireQualifiedIds: "error" } }),
      ".rivet/specs/x.md":
        "## Requirement R-9 — short id\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\nIF bad THEN the system SHALL NOT go.\n@check kind=unit ref=A#b\n",
    });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("requireQualifiedIds");
    expect(exitCode).toBe(1);
  });

  it("warns (not errors) on an unqualified id by default", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement R-8 — short id\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\nIF bad THEN the system SHALL NOT go.\n@check kind=unit ref=A#b\n",
    });
    const { text } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("⚠");
  });

  it("enforces a triggered gate pack — 'password' floors security, which needs a Security section", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_AUTH-01 — login with a password\nWHEN a password is wrong THEN the system SHALL reject it.\n@check kind=unit ref=A#a\nIF locked THEN the system SHALL NOT accept.\n@check kind=unit ref=A#b\n",
    });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("gates");
    expect(exitCode).toBe(1);
  });

  it("notes a graphify-provider gap without failing (revitify is the bundled fallback)", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ graphify: { provider: "graphify" } }),
      ".rivet/specs/x.md": VALID,
    });
    const { text } = run(dir, () => graphBuild({ refresh: false }));
    // Either graphify is installed (no note) or it isn't (the hint shows) — both are valid; the
    // command must not throw and must still print the graph.
    expect(text).toContain("Verified Traceability Graph");
  });
});

import { spawnSync } from "node:child_process";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { join } from "node:path";

describe("rivet graph build — drift + satisfied gate packs", () => {
  it("flags stale proofs that predate the working tree (exit 1)", () => {
    const dir = tmpProject({
      "src/x.ts": "export const x = 1;\n",
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=c1\nIF bad THEN the system SHALL NOT z.\n@check kind=unit ref=c2\n",
    });
    for (const args of [
      ["init"],
      ["add", "-A"],
      ["-c", "user.email=t@t.co", "-c", "user.name=t", "commit", "-m", "x"],
    ])
      spawnSync("git", args, { cwd: dir, stdio: "ignore" });
    const s = new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));
    s.create("REQUIREMENT_X-01", "t", ["c1", "c2"]);
    s.recordCheck("REQUIREMENT_X-01", { ref: "c1", passed: true, at: "x", sha: "S", tree: "STALE_OLD_TREE" });
    s.recordCheck("REQUIREMENT_X-01", { ref: "c2", passed: true, at: "x", sha: "S", tree: "STALE_OLD_TREE" });
    const { text, exitCode } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("predate HEAD");
    expect(exitCode).toBe(1);
  });

  it("reports a triggered gate pack as SATISFIED when its section is present", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_AUTH-01 — password login\n## Security\n- threats handled\n\nWHEN a password is wrong THEN the system SHALL reject.\n@check kind=unit ref=a.test.ts::a\nIF locked THEN the system SHALL NOT accept.\n@check kind=unit ref=a.test.ts::b\n",
    });
    const { text } = run(dir, () => graphBuild({ refresh: false }));
    expect(text).toContain("satisfied");
  });
});
