import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { specHealth, specLint, specDraftTests, specTasks } from "../src/cli/workflow.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

const store = (dir: string) => new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));

describe("rivet spec lint — static drift", () => {
  it("says nothing to lint with no specs", () => {
    const { text } = run(tmpProject(), () => specLint());
    expect(text).toContain("nothing to lint");
  });

  it("is clean when every @check resolves and every obligation is bound", () => {
    const dir = tmpProject({
      "foo.test.ts": 'import {it} from "vitest";\nit("works", () => {});\n',
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    const { text, exitCode } = run(dir, () => specLint());
    expect(text).toContain("clean");
    expect(exitCode).toBeUndefined();
  });

  it("flags an orphaned ref to a missing file and exits 1", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=gone.test.ts::works\n",
    });
    const { text, exitCode } = run(dir, () => specLint());
    expect(text).toContain("ORPHANED");
    expect(text).toContain("file not found");
    expect(exitCode).toBe(1);
  });

  it("flags a renamed test (name missing from an existing file)", () => {
    const dir = tmpProject({
      "foo.test.ts": 'import {it} from "vitest";\nit("works", () => {});\n',
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::renamed\n",
    });
    const { text, exitCode } = run(dir, () => specLint());
    expect(text).toContain("renamed");
    expect(exitCode).toBe(1);
  });

  it("warns (no exit) on an UNCOVERED criterion with no @check", () => {
    const dir = tmpProject({
      "foo.test.ts": 'import {it} from "vitest";\nit("works", () => {});\n',
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\nThe system SHALL also persist z.\n",
    });
    const { text, exitCode } = run(dir, () => specLint());
    expect(text).toContain("UNCOVERED");
    expect(exitCode).toBeUndefined();
  });
});

describe("specHealth — the shared structured finding", () => {
  it("reports hasSpecs:false for an empty project", () => {
    const dir = tmpProject();
    expect(specHealth(dir).hasSpecs).toBe(false);
  });

  it("includes task-binding refs (not just spec refs) when resolving dangling", () => {
    const dir = tmpProject({
      "foo.test.ts": 'import {it} from "vitest";\nit("works", () => {});\n',
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    store(dir).create("REQUIREMENT_X-01", "t", ["missing.test.ts::ghost"]);
    const h = specHealth(dir);
    expect(h.dangling.some((d) => d.ref.includes("missing.test.ts"))).toBe(true);
  });
});

describe("rivet spec draft-tests — failing stubs for unbound criteria", () => {
  it("notes when there are no specs", () => {
    const { text } = run(tmpProject(), () => specDraftTests());
    expect(text).toContain("no specs");
  });

  it("says everything is bound when no criterion is unbound", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    const { text } = run(dir, () => specDraftTests());
    expect(text).toContain("already bound");
  });

  it("drafts a failing stub file for an unbound criterion and prints the @check to add", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md": "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n",
    });
    const { text } = run(dir, () => specDraftTests());
    expect(text).toContain("stub(s) drafted");
    expect(text).toContain("@check kind=unit ref=");
  });

  it("is idempotent — a second run reports the stub already present", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md": "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n",
    });
    run(dir, () => specDraftTests());
    const { text } = run(dir, () => specDraftTests());
    expect(text).toContain("already present");
  });
});

describe("rivet spec tasks — derive evidence-bound tasks", () => {
  it("notes when there are no specs", () => {
    const { text } = run(tmpProject(), () => specTasks());
    expect(text).toContain("no specs");
  });

  it("creates a task per requirement, then reports it unchanged on re-run", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — login\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    const first = run(dir, () => specTasks());
    expect(first.text).toContain("REQUIREMENT_X-01");
    expect(first.text).toContain("created");
    expect(store(dir).get("REQUIREMENT_X-01")).toBeDefined();
    const second = run(dir, () => specTasks());
    expect(second.text).toContain("unchanged");
  });

  it("syncs bindings into an existing task when the spec's refs change", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::a\n",
    });
    run(dir, () => specTasks());
    writeFileSync(
      join(dir, ".rivet", "specs", "x.md"),
      "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::a\n@check kind=unit ref=foo.test.ts::b\n",
    );
    const { text } = run(dir, () => specTasks());
    expect(text).toContain("synced");
    expect(store(dir).get("REQUIREMENT_X-01")!.boundChecks).toHaveLength(2);
  });

  it("skips an ADR requirement (decision record, no task)", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md": "## Requirement ADR_X-01 — we chose Postgres\nThe system SHALL use Postgres.\n",
    });
    const { text } = run(dir, () => specTasks());
    expect(text).toContain("decision record");
    expect(store(dir).get("ADR_X-01")).toBeUndefined();
  });

  it("warns and creates no task when a requirement has no @check bindings", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md": "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n",
    });
    const { text } = run(dir, () => specTasks());
    expect(text).toContain("UNVERIFIABLE");
    expect(store(dir).get("REQUIREMENT_X-01")).toBeUndefined();
  });

  it("stops (exit 1, no tasks) when an unqualified id is configured as an error", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ rules: { requireQualifiedIds: "error" } }),
      ".rivet/specs/x.md":
        "## Requirement R-1 — short\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=foo.test.ts::works\n",
    });
    const { text, exitCode } = run(dir, () => specTasks());
    expect(text).toContain("requireQualifiedIds");
    expect(exitCode).toBe(1);
    expect(store(dir).get("R-1")).toBeUndefined();
  });
});

describe("spec lint / tasks — final branches", () => {
  it("surfaces a lost-obligation parser warning (orphan @check with no criterion)", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md": "## Requirement REQUIREMENT_X-01 — t\n@check kind=unit ref=a::b\n",
    });
    const { text, exitCode } = run(dir, () => specLint());
    expect(text).toContain("SPEC");
    expect(exitCode).toBe(1);
  });

  it("reopens a DONE task when spec tasks adds a new unproven obligation", () => {
    const dir = tmpProject({
      ".rivet/specs/x.md":
        "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
    });
    const s = store(dir);
    s.create("REQUIREMENT_X-01", "t", ["a::b"]);
    s.recordCheck("REQUIREMENT_X-01", { ref: "a::b", passed: true, at: "x", sha: "S", tree: "T" });
    s.markDone("REQUIREMENT_X-01");
    writeFileSync(
      join(dir, ".rivet", "specs", "x.md"),
      "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\nIF bad THEN the system SHALL NOT z.\n@check kind=unit ref=a::c\n",
    );
    const { text } = run(dir, () => specTasks());
    expect(text).toContain("reopened");
  });
});
