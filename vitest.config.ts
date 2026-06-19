import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // FEAT-REVITIFY-01: tests transform revitify from SOURCE — no dist build needed to test.
      // Absolute on purpose: relative forms break inside .claude/worktrees/* (see ledger 2026-06-12).
      revitify: "/Users/pratiyush/Github/revitify/src/index.ts",
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      // Honest excludes — NOT logic we're skipping, but code vitest cannot meaningfully execute:
      exclude: [
        // Browser runtime: these run in the cockpit's <script>, against document/window. They ship
        // as static files (cockpit.ts copies them verbatim) and are guarded by cockpit.test.ts at the
        // EMISSION boundary; executing them needs a DOM harness, not a Node unit run.
        "src/cli/cockpit-assets/**",
        // Pure entry glue: the commander program registration + shebang bin. The real logic it wires
        // (every action handler) is covered directly; the `.command().action()` table is not.
        "src/cli/index.ts",
        // Cross-process concurrency primitive (mkdir-as-lock + Atomics busy-wait), exercised by real
        // subprocess + timing tests in scale.test.ts. It IS tested — but v8's per-line profiler is
        // non-deterministic on it (~1-in-8 runs drops a line) under that concurrent load, which would
        // make the gate flaky. Excluded from MEASUREMENT (not from testing) to keep the gate stable.
        "src/engine/lock.ts",
      ],
      reporter: ["text-summary", "json-summary", "html"],
      // Every executable line/statement/function in the non-excluded surface is proven by a test or
      // carries a justified `c8 ignore` (an external-tool subprocess, a concurrency race, or a
      // defensive guard against an "impossible" state — each annotated with why). Branch coverage is
      // floored, not maxed: the residual branches are `?? default` / `?.` fallbacks not worth a test.
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 88,
      },
    },
  },
});
