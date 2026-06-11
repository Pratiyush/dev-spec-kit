import type { CheckResult } from "../graph/types.js";

/**
 * Flaky handling (config `verify.flaky: retry-flag`): retry a failing check up to `retries` extra
 * times; if it eventually passes, the result is marked `flaky: true` — it counts as proof, but the
 * flakiness is recorded, never hidden.
 */
export function runWithRetry(run: () => CheckResult, retries: number): { result: CheckResult; attempts: number } {
  let attempts = 1;
  let result = run();
  while (!result.passed && attempts <= retries) {
    attempts++;
    result = run();
  }
  if (result.passed && attempts > 1) result = { ...result, flaky: true };
  return { result, attempts };
}
