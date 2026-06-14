import { describe, it, expect } from "vitest";
import { matchProofs, type BatchBinding } from "../src/engine/verify/stamp-batch.js";
import type { TestReport, AssertionResult } from "../src/engine/verify/report.js";

const a = (
  file: string,
  title: string,
  status: AssertionResult["status"],
  fail?: string,
): AssertionResult => ({
  file,
  title,
  fullName: title,
  status,
  ...(fail ? { failureMessages: [fail] } : {}),
});

const report = (...assertions: AssertionResult[]): TestReport => ({
  numTotalTests: assertions.length,
  numPassedTests: assertions.filter((x) => x.status === "passed").length,
  numFailedTests: assertions.filter((x) => x.status === "failed").length,
  assertions,
});

const meta = { at: "2026-06-13T00:00:00.000Z", tree: "TREE", sha: "SHA", stack: "node-vitest" };
const bind = (ref: string, kind?: string): BatchBinding => ({ taskId: "T", ref, ...(kind ? { kind } : {}) });

describe("matchProofs — one suite run stamps many criteria (FEAT-STAMP-01)", () => {
  const rep = report(
    a("/abs/test/auth.test.ts", "rejects an expired token", "passed"),
    a("/abs/test/auth.test.ts", "clears the cookie", "failed", "AssertionError: cookie still set"),
    a("/abs/test/util.test.ts", "parses input", "passed"),
    a("/abs/test/util.test.ts", "skipped one", "skipped"),
  );

  it("stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind", () => {
    const [p] = matchProofs([bind("test/auth.test.ts::rejects an expired token", "unit")], [rep], meta);
    expect(p.taskId).toBe("T");
    expect(p.result).toMatchObject({
      ref: "test/auth.test.ts::rejects an expired token",
      passed: true,
      tree: "TREE",
      sha: "SHA",
      stack: "node-vitest",
      kind: "unit",
    });
  });

  it("stamps a failing test red and carries its failure message as the tail", () => {
    const [p] = matchProofs([bind("test/auth.test.ts::clears the cookie")], [rep], meta);
    expect(p.result.passed).toBe(false);
    expect(p.result.tail).toContain("cookie still set");
  });

  it("a file-only ref is green only when EVERY test in the file passed", () => {
    expect(matchProofs([bind("test/util.test.ts")], [rep], meta)[0].result.passed).toBe(true);
    // auth.test.ts has a failing test, so the whole-file ref is red
    expect(matchProofs([bind("test/auth.test.ts")], [rep], meta)[0].result.passed).toBe(false);
  });

  it("leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)", () => {
    expect(matchProofs([bind("test/nope.test.ts::whatever")], [rep], meta)).toEqual([]);
  });

  it("does NOT stamp a ref whose only match was skipped — skipped is not evidence", () => {
    expect(matchProofs([bind("test/util.test.ts::skipped one")], [rep], meta)).toEqual([]);
  });

  it("stamps every binding in one pass (the whole point — N criteria, one run)", () => {
    const bindings = [
      bind("test/auth.test.ts::rejects an expired token"),
      bind("test/util.test.ts::parses input"),
    ];
    const proofs = matchProofs(bindings, [rep], meta);
    expect(proofs).toHaveLength(2);
    expect(proofs.every((p) => p.result.passed)).toBe(true);
  });
});
