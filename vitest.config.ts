import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // FEAT-REVITIFY-01: tests transform revitify from SOURCE — no dist build needed to test.
      revitify: fileURLToPath(new URL("./packages/revitify/src/index.ts", import.meta.url)),
    },
  },
  test: {
    include: ["test/**/*.test.ts", "packages/*/test/**/*.test.ts"],
  },
});
