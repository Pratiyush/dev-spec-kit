import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { boardCmd } from "../src/cli/board-cmd.js";
import { resumeCmd } from "../src/cli/resume.js";
import { lawsCmd } from "../src/cli/laws-cmd.js";
import { tmpProject, run } from "./helpers/cli-harness.js";
import * as lib from "../src/index.js";

const SPEC = `## Requirement REQUIREMENT_X-01 — thing
WHEN x THEN the system SHALL y.
@check kind=unit ref=A#a
WHEN nothing THEN the system SHALL NOT z.
@check kind=unit ref=A#b
`;

describe("rivet board — regenerate boards from ground truth", () => {
  it("writes LEDGER.md + TRACKING.md and reports success", () => {
    const dir = tmpProject({ ".rivet/specs/x.md": SPEC });
    const { text } = run(dir, () => boardCmd());
    expect(text).toContain("boards regenerated");
    expect(existsSync(join(dir, ".rivet", "LEDGER.md"))).toBe(true);
    expect(existsSync(join(dir, ".rivet", "TRACKING.md"))).toBe(true);
  });
});

describe("rivet resume — state-only handoff", () => {
  it("writes RESUME.md, prints it, and notes the auto-save", () => {
    const dir = tmpProject({ ".rivet/specs/x.md": SPEC });
    const { text } = run(dir, () => resumeCmd());
    expect(existsSync(join(dir, ".rivet", "RESUME.md"))).toBe(true);
    expect(text).toContain("saved to .rivet/RESUME.md");
    expect(readFileSync(join(dir, ".rivet", "RESUME.md"), "utf8").length).toBeGreaterThan(0);
  });
});

describe("rivet laws — effective laws with sources", () => {
  const realHome = process.env.HOME;
  afterEach(() => {
    process.env.HOME = realHome;
  });

  it("reports nothing when no laws file exists anywhere", () => {
    const empty = tmpProject();
    process.env.HOME = empty; // no ~/.rivet/laws.md under this HOME
    const { text } = run(empty, () => lawsCmd({}));
    expect(text).toContain("no laws found");
  });

  it("prints each project law section under its source banner", () => {
    const home = tmpProject();
    process.env.HOME = home;
    const dir = tmpProject({ ".rivet/laws.md": "# Laws\n\nAlways write a failing test first.\n" });
    const { text } = run(dir, () => lawsCmd({}));
    expect(text).toContain("project");
    expect(text).toContain("Always write a failing test first.");
  });

  it("surfaces an unresolved include as a warning", () => {
    const home = tmpProject();
    process.env.HOME = home;
    const dir = tmpProject({ ".rivet/laws.md": "# Laws\n\n#[[file:missing.md]]\n" });
    const { text } = run(dir, () => lawsCmd({}));
    expect(text).toContain("⚠");
    expect(text).toContain("missing.md");
  });
});

describe("public library barrel (src/index.ts)", () => {
  it("re-exports the engine surface (schema, graph, journal, runner)", () => {
    expect(typeof lib.defaultConfig).toBe("function");
    expect(typeof lib.buildVTG).toBe("function");
    expect(typeof lib.Journal).toBe("function");
    expect(typeof lib.parseSpec).toBe("function");
  });
});
