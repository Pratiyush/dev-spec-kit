import { describe, it, expect } from "vitest";
import { runCheck } from "../src/engine/verify/runner.js";

const FIX = "test/trust-fixtures.test.ts";

/**
 * FIX-TRUST-01 — a name-filtered run that matches ZERO tests must never be recorded as a pass.
 * A vacuous-green proof is the most corrosive bug possible for a verification tool: the edge says
 * "proven" while nothing executed. vitest exits 0 on a zero-match `-t`, so exit code alone lies.
 *
 * FIX-TRUST-02 — flag-like (leading `-`) and regex-special test names must bind to exactly that
 * test. The old `-t <name>` form let vitest's CLI parser read a leading `-` as an option
 * (CACError: Unknown option) and treated metacharacters as regex.
 */
describe("runner trust — zero-match is never a pass (FIX-TRUST-01)", () => {
  it("records a real vitest check whose name matches no test as a FAILED proof", () => {
    const result = runCheck({ kind: "unit", ref: `${FIX}::no such test name zzz` }, "node-vitest", {
      cwd: process.cwd(),
    });
    expect(result.passed).toBe(false);
  });

  it("records a real vitest check whose name DOES match as a passing proof", () => {
    const result = runCheck({ kind: "unit", ref: `${FIX}::plain trust fixture passes` }, "node-vitest", {
      cwd: process.cwd(),
    });
    expect(result.passed).toBe(true);
  });
});

describe("runner trust — flag-like & regex-special names bind safely (FIX-TRUST-02)", () => {
  it("binds a test whose name begins with '-' without crashing the runner CLI", () => {
    const result = runCheck({ kind: "unit", ref: `${FIX}::--help lists the verbs` }, "node-vitest", {
      cwd: process.cwd(),
    });
    expect(result.passed).toBe(true);
  });
});
