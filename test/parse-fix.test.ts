import { describe, it, expect } from "vitest";
import { parseSpec } from "../src/engine/spec/parse.js";
import { assertMode } from "../src/engine/route/classify.js";
import { parseCount } from "../src/cli/log.js";

/** FIX-PARSE-01: silent loss of a proof obligation is the worst parser failure. */

describe("parser respects markdown reality", () => {
  it("fenced code blocks never become requirements", () => {
    const spec = [
      "# Feature: docs",
      "",
      "```markdown",
      "## Requirement R-FAKE — example only",
      "WHEN x THEN the system SHALL y.",
      "@check kind=unit ref=Fake#x",
      "```",
      "",
      "## Requirement R-REAL — real",
      "WHEN a THEN the system SHALL b.",
      "@check kind=unit ref=Real#a",
    ].join("\n");
    const reqs = parseSpec(spec);
    expect(reqs.map((r) => r.id)).toEqual(["R-REAL"]);
  });

  it("blank-line-separated EARS sentences become SEPARATE criteria (no silent merge)", () => {
    const spec = [
      "## Requirement R-1 — two behaviors",
      "WHEN x THEN the system SHALL y.",
      "",
      "WHEN p THEN the system SHALL q.",
      "@check kind=unit ref=A#pq",
    ].join("\n");
    const [r] = parseSpec(spec);
    expect(r!.criteria).toHaveLength(2);
    expect(r!.criteria[0]!.checks).toEqual([]); // first is unbound -> flagged unverifiable downstream
    expect(r!.criteria[1]!.checks.map((c) => c.ref)).toEqual(["A#pq"]);
  });

  it("bulleted @check lines bind (list markers stripped)", () => {
    const spec = ["## Requirement R-2 — t", "WHEN x THEN the system SHALL y.", "- @check kind=unit ref=B#x"].join("\n");
    const [r] = parseSpec(spec);
    expect(r!.criteria[0]!.checks.map((c) => c.ref)).toEqual(["B#x"]);
  });

  it("an orphan @check (no criterion above it) is WARNED about, never silently dropped", () => {
    const warnings: string[] = [];
    const spec = ["## Requirement R-3 — t", "@check kind=unit ref=Orphan#x"].join("\n");
    const [r] = parseSpec(spec, warnings);
    expect(r!.criteria).toHaveLength(0);
    expect(warnings.join(" ")).toContain("Orphan#x");
  });
});

describe("CLI input validation", () => {
  it("assertMode rejects unknown modes loudly", () => {
    expect(() => assertMode("bogus")).toThrowError(/research|quick|full-spec/);
    expect(assertMode("quick")).toBe("quick");
  });

  it("parseCount: default 25, NaN -> 25, 0 -> 0, negatives clamp to 0", () => {
    expect(parseCount(undefined)).toBe(25);
    expect(parseCount("abc")).toBe(25);
    expect(parseCount("0")).toBe(0);
    expect(parseCount("-5")).toBe(0);
    expect(parseCount("7")).toBe(7);
  });
});
