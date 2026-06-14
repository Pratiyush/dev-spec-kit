import { describe, it, expect } from "vitest";
import { areaSlug, deriveTestName, draftStubs, stubBlock } from "../src/engine/spec/draft.js";
import type { Requirement } from "../src/engine/spec/ears.js";

const crit = (id: string, text: string, bound = false) => ({
  id,
  pattern: "event" as const,
  text,
  checks: bound ? [{ kind: "unit" as const, ref: "test/x.test.ts::x" }] : [],
});

describe("areaSlug — target file from the requirement AREA", () => {
  it("extracts the AREA from a qualified id", () => {
    expect(areaSlug("REQUIREMENT_AUTH-01")).toBe("auth");
    expect(areaSlug("NFR_PERF-02")).toBe("perf");
  });
});

describe("deriveTestName — a descriptive name from the criterion clause", () => {
  it("takes the SHALL clause and drops 'the system'", () => {
    expect(deriveTestName("WHEN a token expires THEN the system SHALL return 401")).toBe("return 401");
  });

  it("marks a negative (SHALL NOT) criterion", () => {
    expect(deriveTestName("IF outside a project THEN the system SHALL NOT write a journal")).toBe(
      "does not write a journal",
    );
  });
});

describe("draftStubs — one failing, bound stub per UNBOUND criterion (FEAT-DRAFT-01)", () => {
  const reqs: Requirement[] = [
    {
      id: "REQUIREMENT_AUTH-01",
      title: "auth",
      criteria: [
        crit("REQUIREMENT_AUTH-01-AC1", "WHEN a token expires THEN the system SHALL return 401"),
        crit("REQUIREMENT_AUTH-01-AC2", "WHEN valid THEN the system SHALL allow", true), // already bound
      ],
    },
    { id: "ADR_AUTH-02", title: "a decision", criteria: [crit("ADR_AUTH-02-AC1", "SHALL record the why")] },
  ];

  it("drafts only the unbound criterion, skipping bound ones and ADR records", () => {
    const stubs = draftStubs(reqs);
    expect(stubs).toHaveLength(1);
    expect(stubs[0]).toMatchObject({
      reqId: "REQUIREMENT_AUTH-01",
      critId: "REQUIREMENT_AUTH-01-AC1",
      file: "test/auth.test.ts",
      name: "return 401",
      checkRef: "test/auth.test.ts::return 401",
    });
  });

  it("emits a stub that FAILS until implemented and carries the criterion + edge-case mandate", () => {
    const block = stubBlock(draftStubs(reqs)[0]);
    expect(block).toContain('it("return 401"');
    expect(block).toContain("expect.fail("); // red until implemented
    expect(block).toContain("TODO(draft REQUIREMENT_AUTH-01-AC1)");
    expect(block).toContain("invalid input · empty/boundary · failure-injection");
  });
});
