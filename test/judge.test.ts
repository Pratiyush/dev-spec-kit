import { describe, it, expect } from "vitest";
import { resolveJudgeMode, judgeResult, hasApiKey } from "../src/engine/verify/judge.js";

describe("resolveJudgeMode — harness is free; api only when a key exists (FEAT-JUDGE-01)", () => {
  it("auto resolves to api when a key is present, harness when not", () => {
    expect(resolveJudgeMode("auto", true)).toBe("api");
    expect(resolveJudgeMode("auto", false)).toBe("harness");
  });

  it("respects an explicit mode regardless of the key", () => {
    expect(resolveJudgeMode("harness", true)).toBe("harness");
    expect(resolveJudgeMode("api", false)).toBe("api");
  });
});

describe("judgeResult — a recorded, labelled SECOND-CLASS proof", () => {
  it("records kind=judge with provenance + reason in the tail (never an executed green)", () => {
    const r = judgeResult(
      "docs/errors.md::tone",
      { passed: true, reason: "states cause and action" },
      { model: "claude-haiku-4-5", mode: "harness", cwd: process.cwd() },
    );
    expect(r.kind).toBe("judge");
    expect(r.passed).toBe(true);
    expect(r.tail).toContain("judged via harness (claude-haiku-4-5)");
    expect(r.tail).toContain("states cause and action");
  });

  it("carries a fail verdict and its reason", () => {
    const r = judgeResult(
      "r",
      { passed: false, reason: "no cause, no next step" },
      { model: "m", mode: "api", cwd: process.cwd() },
    );
    expect(r.passed).toBe(false);
    expect(r.tail).toContain("judged via api");
  });
});

describe("hasApiKey", () => {
  it("is true only when ANTHROPIC_API_KEY is set", () => {
    expect(hasApiKey({ ANTHROPIC_API_KEY: "sk-x" } as NodeJS.ProcessEnv)).toBe(true);
    expect(hasApiKey({} as NodeJS.ProcessEnv)).toBe(false);
  });
});
