<!-- Thanks for contributing to dev-spec-kit! Keep this PR scoped to one change. -->

## What & why

<!-- What does this change do, and why is it needed? Link any issue: Closes #123 -->

## Type of change

- [ ] Bug fix
- [ ] New feature / capability
- [ ] Refactor (no behavior change)
- [ ] Docs / website
- [ ] Tooling / CI

## How it was verified

<!-- Paste the relevant command output. dev-spec-kit dogfoods itself — show the proofs. -->

- [ ] `pnpm run build` + `pnpm run typecheck` pass
- [ ] `pnpm run lint` clean
- [ ] `pnpm run coverage` green (100% statements/functions/lines, branches ≥ floor)
- [ ] For engine changes: re-proven — `dev-spec-kit verify --stamp` green, `dev-spec-kit graph build` shows 0 red / 0 stale
- [ ] Specs/skills updated if behavior changed (`dev-spec-kit spec lint` clean)
- [ ] Docs / website updated if user-facing

## Notes for the reviewer

<!-- Anything non-obvious: trade-offs, follow-ups, things you want a closer look at. -->
