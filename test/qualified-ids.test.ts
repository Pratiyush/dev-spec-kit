import { describe, expect, it } from "vitest";
import { parseSpec } from "../src/engine/spec/parse.js";
import {
  isQualifiedId,
  requirementKind,
  lintQualifiedIds,
  unboundObligations,
} from "../src/engine/spec/ears.js";
import { buildVTG } from "../src/engine/graph/build.js";

/**
 * FEAT-IDS-01 — ids travel without their spec (PR bodies, LEDGER, dashboards, chat), so the prefix
 * must carry the noun: REQUIREMENT_VAULT-01 / NFR_PERF-01 / ADR_STORAGE-01. Legacy short ids keep
 * parsing (never break old specs) but lint with a fix-it suggestion; the severity is config
 * (`rules.requireQualifiedIds`: warn | error | off, default warn).
 */
describe("FEAT-IDS-01 — fully-qualified requirement ids", () => {
  it("recognizes the qualified prefix set and classifies the kind", () => {
    expect(isQualifiedId("REQUIREMENT_VAULT-01")).toBe(true);
    expect(isQualifiedId("NFR_PERF-01")).toBe(true);
    expect(isQualifiedId("ADR_STORAGE-01")).toBe(true);
    expect(isQualifiedId("R-VAULT-01")).toBe(false);
    expect(isQualifiedId("VAULT-01")).toBe(false);
    expect(requirementKind("REQUIREMENT_VAULT-01")).toBe("requirement");
    expect(requirementKind("NFR_PERF-01")).toBe("nfr");
    expect(requirementKind("ADR_STORAGE-01")).toBe("adr");
    // Legacy ids are functional requirements — full obligations, just unqualified naming.
    expect(requirementKind("R-VAULT-01")).toBe("requirement");
  });

  it("parses fully-qualified headings exactly (underscore ids bind checks)", () => {
    const reqs = parseSpec(
      "## Requirement REQUIREMENT_VAULT-01 — saves to the vault\n" +
        "WHEN a note changes THEN the system SHALL persist it.\n" +
        "@check kind=unit ref=test/vault.test.ts::persists\n",
    );
    expect(reqs).toHaveLength(1);
    expect(reqs[0]!.id).toBe("REQUIREMENT_VAULT-01");
    expect(reqs[0]!.criteria[0]!.checks[0]!.ref).toBe("test/vault.test.ts::persists");
  });

  it("lints non-qualified ids with a fix-it suggestion; qualified ids are silent", () => {
    const legacy = parseSpec(
      "## Requirement R-VAULT-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
    );
    const warnings = lintQualifiedIds(legacy);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("R-VAULT-01");
    expect(warnings[0]).toContain("REQUIREMENT_VAULT-01"); // the suggested qualified form
    const modern = parseSpec(
      [
        "## Requirement REQUIREMENT_VAULT-01 — t\nWHEN x THEN the system SHALL y.",
        "## Requirement NFR_PERF-01 — t\nWHEN x THEN the system SHALL respond within 100ms.",
        "## Requirement ADR_STORE-01 — files over sqlite\nPlain files chosen for portability.",
      ].join("\n\n"),
    );
    expect(lintQualifiedIds(modern)).toEqual([]);
  });

  it("ADR requirements are decision records — exempt from check obligations; NFR are not", () => {
    const reqs = parseSpec(
      [
        "## Requirement ADR_STORAGE-01 — store notes as files\nThe team chose plain files over sqlite.",
        "## Requirement NFR_PERF-01 — fast saves\nWHEN a note saves THEN the system SHALL finish within 100ms.",
        "## Requirement REQUIREMENT_VAULT-01 — t\nWHEN x THEN the system SHALL y.",
      ].join("\n\n"),
    );
    const unbound = unboundObligations(reqs).map((c) => c.id);
    expect(unbound).toContain("NFR_PERF-01-AC1"); // NFR carries full proof obligations
    expect(unbound).toContain("REQUIREMENT_VAULT-01-AC1");
    expect(unbound.some((id) => id.startsWith("ADR_"))).toBe(false); // ADR exempt
  });

  it("ADR requirements appear in the graph as adr nodes, not requirement nodes", () => {
    const reqs = parseSpec(
      "## Requirement ADR_STORAGE-01 — files\nPlain files chosen.\n\n" +
        "## Requirement REQUIREMENT_VAULT-01 — t\nWHEN x THEN the system SHALL y.\n",
    );
    const g = buildVTG({ requirements: reqs, tasks: [] });
    expect(g.nodes.find((n) => n.id === "ADR_STORAGE-01")?.kind).toBe("adr");
    expect(g.nodes.find((n) => n.id === "REQUIREMENT_VAULT-01")?.kind).toBe("requirement");
  });
});
