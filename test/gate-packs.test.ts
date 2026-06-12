import { describe, it, expect } from "vitest";
import { requiredPacks, evaluatePack, applyGateFloor } from "../src/engine/gatepacks.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { defaultConfig } from "../src/config/schema.js";

/**
 * GATE-PACKS-01: the 17-gate proposal's CONTENT as config-driven packs — required spec sections +
 * required check kinds + security triggers that FLOOR the routing mode. Off by default
 * (anti-ceremony); a security trigger always floors to full-spec.
 */

describe("config defaults ship the four packs, none required by default", () => {
  it("security/contracts/nfr/rollback exist; gates.require is empty; facts off", () => {
    const c = defaultConfig();
    expect(Object.keys(c.gates.packs).sort()).toEqual(["contracts", "nfr", "rollback", "security"]);
    expect(c.gates.require).toEqual([]);
    expect(c.gates.facts).toBe("off");
  });
});

describe("requiredPacks: explicit require ∪ trigger-matched", () => {
  it("auth-ish text auto-requires the security pack", () => {
    const c = defaultConfig();
    const packs = requiredPacks("add a login endpoint with password reset", c);
    expect(packs).toContain("security");
  });
  it("plain text requires nothing by default", () => {
    expect(requiredPacks("rename a variable in the readme tool", defaultConfig())).toEqual([]);
  });
});

describe("evaluatePack: sections + check kinds", () => {
  const SPEC_TEXT = `# Feature: login\n\n## Requirement R-1 — login\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=A#a\n`;

  it("flags a missing required section and a missing check kind", () => {
    const reqs = parseSpec(SPEC_TEXT);
    const violations = evaluatePack(SPEC_TEXT, reqs, "security", {
      sections: ["Security"],
      kinds: ["api"],
      triggers: [],
    });
    expect(violations.join(" ")).toMatch(/section.*Security/i);
    expect(violations.join(" ")).toMatch(/kind.*api/i);
  });

  it("passes when the section heading and kind are present", () => {
    const text =
      SPEC_TEXT +
      `\n## Security\nthreats considered.\n\n## Requirement R-2 — api\nWHEN q THEN the system SHALL r.\n@check kind=api ref=B#b\n`;
    const reqs = parseSpec(text);
    expect(
      evaluatePack(text, reqs, "security", { sections: ["Security"], kinds: ["api"], triggers: [] }),
    ).toEqual([]);
  });
});

describe("applyGateFloor: security triggers floor the mode", () => {
  it("quick request touching auth floors to full-spec with the pack named", () => {
    const c = defaultConfig();
    const floored = applyGateFloor("fix typo in the password reset email", "quick", c);
    expect(floored.mode).toBe("full-spec");
    expect(floored.reason).toMatch(/security/i);
    expect(floored.packs).toContain("security");
  });
  it("non-trigger text keeps its mode", () => {
    const c = defaultConfig();
    expect(applyGateFloor("fix typo in readme", "quick", c).mode).toBe("quick");
  });
});
