---
inclusion: always
---
# Best practices — quality gates (any platform)

> Constraint: every tool below is **free or open-source** — no paid licenses, ever.

## Pre-commit (the cheapest gate)
- **Husky** runs checks before every commit; **lint-staged** scopes them to changed files —
  fast enough that nobody bypasses it.

## Central dashboards — OPTIONAL, never required
- **SonarQube Community Edition** (free): smells, bugs, duplication for Java + TS.
- **GitHub CodeQL** (free for public repos; check terms for private): deep SAST.
- These are optional add-ons; dev-spec-kit's verify gate is the required floor.

## Bind these as dev-spec-kit checks
```jsonc
// the pre-commit hook simply runs what verify runs:
//   .husky/pre-commit → npx lint-staged   (and dev-spec-kit verify before push/PR)
```
