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
      ],
      reporter: ["text-summary", "json-summary", "html"],
    },
  },
});
