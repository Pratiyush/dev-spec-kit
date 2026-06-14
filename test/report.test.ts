import { describe, it, expect } from "vitest";
import {
  escapeTestNamePattern,
  interpretCheckRun,
  parseTestReport,
  reportArgs,
  type TestReport,
} from "../src/engine/verify/report.js";

describe("escapeTestNamePattern — names match literally, not as regex", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeTestNamePattern("rejects 1+1 (a|b) [x]")).toBe("rejects 1\\+1 \\(a\\|b\\) \\[x\\]");
  });

  it("leaves a plain name and a leading dash untouched (the equals-form handles the dash)", () => {
    expect(escapeTestNamePattern("--help lists the verbs")).toBe("--help lists the verbs");
  });
});

describe("reportArgs — emit a JSON report while keeping human output", () => {
  it("vitest keeps the default reporter and writes json to the path", () => {
    expect(reportArgs("vitest", "/tmp/r.json")).toEqual([
      "--reporter=default",
      "--reporter=json",
      "--outputFile=/tmp/r.json",
    ]);
  });
});

const report = (passed: number, failed: number): TestReport => ({
  numTotalTests: passed + failed,
  numPassedTests: passed,
  numFailedTests: failed,
  assertions: [],
});

describe("interpretCheckRun — a zero-match is NEVER a pass (FIX-TRUST-01)", () => {
  it("treats a run where 0 tests executed as failed, even on exit 0", () => {
    const v = interpretCheckRun(report(0, 0), 0);
    expect(v.passed).toBe(false);
    expect(v.ran).toBe(0);
    expect(v.reason).toMatch(/0 tests matched|dangling|renamed/i);
  });

  it("passes when a matched test ran and none failed", () => {
    expect(interpretCheckRun(report(1, 0), 0)).toEqual({ passed: true, ran: 1 });
  });

  it("fails when any matched test failed", () => {
    expect(interpretCheckRun(report(2, 1), 1).passed).toBe(false);
  });

  it("fails on a non-zero exit even if the report shows no failures (e.g. a crash)", () => {
    expect(interpretCheckRun(report(1, 0), 1).passed).toBe(false);
  });
});

describe("parseTestReport — normalize the jest/vitest JSON shape", () => {
  it("flattens assertionResults and carries the file path", () => {
    const raw = JSON.stringify({
      numTotalTests: 2,
      numPassedTests: 1,
      numFailedTests: 1,
      testResults: [
        {
          name: "/abs/test/foo.test.ts",
          assertionResults: [
            { title: "does a", fullName: "grp does a", status: "passed" },
            { title: "does b", fullName: "grp does b", status: "failed", failureMessages: ["boom"] },
          ],
        },
      ],
    });
    const r = parseTestReport(raw);
    expect(r.numPassedTests).toBe(1);
    expect(r.numFailedTests).toBe(1);
    expect(r.assertions).toHaveLength(2);
    expect(r.assertions[0]).toMatchObject({
      title: "does a",
      file: "/abs/test/foo.test.ts",
      status: "passed",
    });
    expect(r.assertions[1].failureMessages).toEqual(["boom"]);
  });
});
