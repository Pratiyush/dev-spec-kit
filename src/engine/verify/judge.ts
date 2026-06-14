import { gitHead, gitTreeHash, isDirty } from "../git.js";
import type { CheckResult } from "../graph/types.js";

/**
 * FEAT-JUDGE-01 — the `judge` kind. An LLM verdict for the genuinely-unmeasurable (tone, copy quality,
 * "is this error actionable"), recorded as a SECOND-CLASS proof: tree-stamped like any check, but
 * labelled `kind: "judge"` and never rendered as an executed green (the moat stays "proven by an
 * executed check"). Two producers of the verdict:
 *   - harness (default): the Claude Code agent reads the rubric + evidence and supplies the verdict —
 *     free, no API key, no network. The engine just records it.
 *   - api: the engine calls Anthropic headlessly (CI), lazy-loading the SDK so harness-only projects
 *     never need it. A refusal or unparseable verdict records NOTHING (same discipline as FIX-TRUST-01).
 */

export interface JudgeVerdict {
  passed: boolean;
  reason: string;
}

export type JudgeMode = "harness" | "api" | "auto";

/** Resolve `auto` → api when an API key is present, else harness. Pure (key presence injected). */
export function resolveJudgeMode(mode: JudgeMode, hasApiKey: boolean): "harness" | "api" {
  return mode === "auto" ? (hasApiKey ? "api" : "harness") : mode;
}

/**
 * Build the recorded proof from a verdict. The reason carries the provenance (`how` it was judged) so
 * every surface can show judged ≠ executed. Tree-stamped so it stales when the judged artifact changes.
 */
export function judgeResult(
  ref: string,
  verdict: JudgeVerdict,
  meta: { model: string; mode: "harness" | "api"; cwd: string; sha?: string },
): CheckResult {
  const tree = gitTreeHash(meta.cwd);
  return {
    ref,
    passed: verdict.passed,
    at: new Date().toISOString(),
    sha: meta.sha ?? gitHead(meta.cwd),
    ...(tree ? { tree } : {}),
    dirty: isDirty(meta.cwd),
    kind: "judge",
    tail: `⚖️ judged via ${meta.mode} (${meta.model}): ${verdict.reason}`,
  };
}

/** True when an Anthropic API key is available for api-mode judging. */
export function hasApiKey(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.ANTHROPIC_API_KEY);
}

/**
 * api-mode judge — lazy-imports `@anthropic-ai/sdk` so it's an OPTIONAL dependency. Uses a forced
 * structured output (`{passed, reason}`) so the verdict is parseable, not free text. A safety refusal
 * or a missing verdict throws — the caller records nothing rather than fabricate a proof.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function judgeViaApi(criterion: string, evidence: string, model: string): Promise<JudgeVerdict> {
  // Computed specifiers keep `@anthropic-ai/sdk` a truly OPTIONAL, runtime-only dependency — tsc does
  // not resolve it, so harness-only projects never install it. It loads only when api-mode judges.
  const sdkName = "@anthropic-ai/sdk";
  const helpersName = "@anthropic-ai/sdk/helpers/zod";
  let Anthropic: any;
  let zodOutputFormat: any;
  try {
    Anthropic = (await import(sdkName)).default;
    zodOutputFormat = (await import(helpersName)).zodOutputFormat;
  } catch {
    throw new Error(
      "api-mode judge needs @anthropic-ai/sdk (npm i @anthropic-ai/sdk) — or use verify.judge.mode=harness, " +
        "where the Claude Code agent supplies the verdict (free, no key)",
    );
  }
  const { z } = await import("zod");
  const Verdict = z.object({ passed: z.boolean(), reason: z.string() });
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const res: any = await client.messages.parse({
    model,
    max_tokens: 512,
    system:
      "You are a STRICT acceptance judge. Decide whether the EVIDENCE satisfies the CRITERION. " +
      "Default passed=false when uncertain or under-evidenced. Give a specific, falsifiable reason.",
    messages: [{ role: "user", content: `CRITERION:\n${criterion}\n\nEVIDENCE:\n${evidence}` }],
    output_config: { format: zodOutputFormat(Verdict) },
  });
  return interpretJudgeResponse(res);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * The trust guards of an api-mode judge, extracted PURE so they're unit-testable without the SDK: a
 * safety refusal or a missing/malformed verdict throws (the caller records NOTHING — never a
 * fabricated proof, FIX-TRUST-01 spirit). A valid verdict is normalized.
 */
export function interpretJudgeResponse(res: { stop_reason?: string; parsed_output?: unknown }): JudgeVerdict {
  if (res?.stop_reason === "refusal")
    throw new Error("judge refused — no proof recorded (tooling state, not a red)");
  const parsed = res?.parsed_output as { passed?: unknown; reason?: unknown } | undefined;
  if (!parsed || typeof parsed.passed !== "boolean")
    throw new Error("judge produced no structured verdict — no proof recorded");
  return { passed: parsed.passed, reason: String(parsed.reason ?? "") };
}
