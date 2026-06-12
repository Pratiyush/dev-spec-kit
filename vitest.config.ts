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
  },
});
