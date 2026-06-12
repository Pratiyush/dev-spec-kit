import { describe, expect, it } from "vitest";
import { parseSpec } from "../src/engine/spec/parse.js";
import { classifyEars, isNegativeCriterion, lintCriteriaFormat } from "../src/engine/spec/ears.js";
import { floorViolations } from "../src/engine/gatepacks.js";
import { parseConfig } from "../src/config/schema.js";

/**
 * FEAT-GHERKIN-01 — Gherkin is first-class AND the default criteria format. Scenario blocks are
 * criteria; Scenario Outlines expand each Examples row into its own criterion (one @check under the
 * Outline binds them all — worst-of applies). The edge-case mandate is mechanical: every obligated
 * requirement needs ≥1 negative/failure criterion or graph build flags it (gates.negativeFloor).
 */

const SCENARIO_SPEC = `## Requirement REQUIREMENT_VAULT-01 — vault saves

Scenario: note persists across restart
  Given a note "alpha" exists
  When the app restarts
  Then the note "alpha" is still present

@check kind=unit ref=test/vault.test.ts::persists across restart
`;

const OUTLINE_SPEC = `## Requirement REQUIREMENT_VAULT-02 — rejects bad titles

Scenario Outline: invalid titles are rejected
  Given a note titled "<title>"
  When the note is saved
  Then the save fails with "<error>"

Examples:
  | title | error |
  | <empty> | title required |
  | x/y | no slashes |

@check kind=unit ref=test/vault.test.ts::rejects invalid titles
`;

describe("FEAT-GHERKIN-01 — gherkin criteria", () => {
  it("classifies bare GIVEN/WHEN/THEN sentences as gherkin", () => {
    expect(classifyEars("GIVEN a logged-in user WHEN the session idles THEN the system logs out")).toBe(
      "gherkin",
    );
    expect(classifyEars("WHEN x THEN the system SHALL y.")).toBe("event");
  });

  it("parses a Scenario block as ONE bindable criterion", () => {
    const [req] = parseSpec(SCENARIO_SPEC);
    expect(req!.criteria).toHaveLength(1);
    const c = req!.criteria[0]!;
    expect(c.pattern).toBe("gherkin");
    expect(c.text).toContain("note persists across restart");
    expect(c.text).toContain("the app restarts");
    expect(c.checks.map((ch) => ch.ref)).toEqual(["test/vault.test.ts::persists across restart"]);
  });

  it("expands a Scenario Outline into one criterion per Examples row, substituting placeholders", () => {
    const [req] = parseSpec(OUTLINE_SPEC);
    expect(req!.criteria).toHaveLength(2);
    const [r1, r2] = req!.criteria;
    expect(r1!.pattern).toBe("gherkin");
    expect(r1!.text).toContain('a note titled "<empty>"');
    expect(r1!.text).toContain('fails with "title required"');
    expect(r2!.text).toContain('a note titled "x/y"');
    expect(r2!.text).toContain('fails with "no slashes"');
  });

  it("one @check under the Outline binds ALL expanded rows (worst-of fan-out)", () => {
    const [req] = parseSpec(OUTLINE_SPEC);
    for (const c of req!.criteria) {
      expect(c.checks.map((ch) => ch.ref)).toEqual(["test/vault.test.ts::rejects invalid titles"]);
    }
  });

  it("gherkin scenarios and EARS criteria coexist in one requirement", () => {
    const [req] = parseSpec(
      "## Requirement REQUIREMENT_X-01 — t\n\nWHEN a THEN the system SHALL b.\n@check kind=unit ref=a::1\n\n" +
        "Scenario: edge\n  Given c\n  When d\n  Then e\n\n@check kind=unit ref=a::2\n",
    );
    expect(req!.criteria).toHaveLength(2);
    expect(req!.criteria[0]!.pattern).toBe("event");
    expect(req!.criteria[1]!.pattern).toBe("gherkin");
    expect(req!.criteria[1]!.checks[0]!.ref).toBe("a::2");
  });
});

describe("FEAT-GHERKIN-01 — gherkin is the default format; off-format lints, never blocks", () => {
  it("new configs default spec.criteriaFormat to gherkin", () => {
    expect(parseConfig({}).spec.criteriaFormat).toBe("gherkin");
    expect(parseConfig({ spec: { criteriaFormat: "ears" } }).spec.criteriaFormat).toBe("ears");
  });

  it("warns on EARS criteria in a gherkin project and vice versa; mixed is silent", () => {
    const ears = parseSpec(
      "## Requirement REQUIREMENT_X-01 — t\nWHEN a THEN the system SHALL b.\n@check kind=unit ref=a::1\n",
    );
    const gherkin = parseSpec(SCENARIO_SPEC);
    expect(lintCriteriaFormat(ears, "gherkin")[0]).toMatch(/criteriaFormat|mixed/);
    expect(lintCriteriaFormat(gherkin, "gherkin")).toEqual([]);
    expect(lintCriteriaFormat(gherkin, "ears")[0]).toMatch(/criteriaFormat|mixed/);
    expect(lintCriteriaFormat(ears, "mixed")).toEqual([]);
    expect(lintCriteriaFormat(gherkin, "mixed")).toEqual([]);
  });
});

describe("FEAT-GHERKIN-01 — the mechanical negative floor", () => {
  const happyOnly = parseSpec(
    "## Requirement REQUIREMENT_X-01 — t\nWHEN a THEN the system SHALL b.\n@check kind=unit ref=a::1\n",
  );
  const withUnwanted = parseSpec(
    "## Requirement REQUIREMENT_X-01 — t\nWHEN a THEN the system SHALL b.\n@check kind=unit ref=a::1\n\n" +
      "IF the input is invalid THEN the system SHALL reject it.\n@check kind=unit ref=a::2\n",
  );
  const withFailureScenario = parseSpec(
    "## Requirement REQUIREMENT_X-01 — t\nWHEN a THEN the system SHALL b.\n@check kind=unit ref=a::1\n\n" +
      "Scenario: save fails on a read-only disk\n  Given a read-only disk\n  When a note saves\n  Then an error is shown\n\n@check kind=unit ref=a::2\n",
  );

  it("classifies negative criteria: EARS unwanted-pattern and failure-worded gherkin", () => {
    expect(isNegativeCriterion(withUnwanted[0]!.criteria[1]!)).toBe(true);
    expect(isNegativeCriterion(withFailureScenario[0]!.criteria[1]!)).toBe(true);
    expect(isNegativeCriterion(happyOnly[0]!.criteria[0]!)).toBe(false);
  });

  it("flags requirements with zero negative criteria; satisfied/exempt ones pass", () => {
    const config = parseConfig({});
    expect(floorViolations(happyOnly, config)).toHaveLength(1);
    expect(floorViolations(happyOnly, config)[0]).toContain("REQUIREMENT_X-01");
    expect(floorViolations(withUnwanted, config)).toEqual([]);
    expect(floorViolations(withFailureScenario, config)).toEqual([]);
    // ADR decision records carry no proof obligation — no floor either.
    const adr = parseSpec("## Requirement ADR_STORE-01 — files\nPlain files chosen.\n");
    expect(floorViolations(adr, config)).toEqual([]);
  });

  it("the floor is config, on by default, and can be turned off", () => {
    expect(parseConfig({}).gates.negativeFloor).toBe("on");
    const off = parseConfig({ gates: { negativeFloor: "off" } });
    expect(floorViolations(happyOnly, off)).toEqual([]);
  });
});
