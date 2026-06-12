import tseslint from "typescript-eslint";

// FEAT-INITPACKS-01 self-adoption — the typescript pack's lint baseline, eating our own cooking.
// Correctness rules only (Prettier owns formatting); runs as the `lint` kind under `rivet verify`.
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "website/**",
      "_ref/**",
      "graphify-out/**",
      ".rivet/**",
      "hooks/**", // self-contained .mjs hooks, deliberately dependency-free
      ".design/**", // design-session handoffs — reference material, kept verbatim
      "src/cli/cockpit-assets/**", // ported design shell (browser vanilla JS), kept verbatim
      "packages/*/dist/**",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // The repo's established idiom: explicit non-null assertions after length checks are load-bearing.
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // No silent catch blocks (typescript pack rule) — an empty catch must say why.
      "no-empty": ["error", { allowEmptyCatch: false }],
    },
  },
);
