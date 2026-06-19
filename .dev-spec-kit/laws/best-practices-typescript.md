---
inclusion: fileMatch
pattern: \.tsx?$
---
# Best practices — TypeScript

> Constraint: every tool below is **free or open-source** — no paid licenses, ever.

## Compiler is the first linter
- `tsconfig.json` MUST set: `strict: true`, `noImplicitAny`, `noUnusedLocals`,
  `noUncheckedIndexedAccess` — indexing returns `T | undefined`; handle it, don't assert it away.
- ESM (`"type": "module"`); no `require` in new code.

## Lint + format (free, standard)
- **ESLint** (typescript-eslint recommended config) — correctness, not style debates.
- **Prettier** — formatting is automated, never reviewed.
- No silent `catch` blocks: every catch either handles, rethrows, or logs with context.

## Tests & dependencies
- **Vitest** co-located tests (`foo.test.ts` next to `foo.ts` or in `test/`); every bug fix
  starts with the failing test.
- **npm audit** on dependencies — runs in `dev-spec-kit verify` via the audit kind below.

## Bind these as dev-spec-kit checks
```jsonc
// .dev-spec-kit/config.json → verify
"kindRunners": {
  "lint":  { "cmd": "npx", "args": ["eslint", "."] },
  "audit": { "cmd": "npm", "args": ["audit", "--audit-level=high"] }
}
// spec criteria can then bind: @check kind=lint ref=eslint  ·  @check kind=audit ref=npm-audit
```
