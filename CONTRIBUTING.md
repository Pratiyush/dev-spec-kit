# Contributing to dev-spec-kit

Thanks for your interest! dev-spec-kit is a spec-driven development tool whose rule zero is
**verification by construction** — a claim of "done" is worthless; only an executed check counts. The
tool holds itself to that bar, so the contribution flow is a little stricter than most repos. This
guide gets you productive fast.

## Prerequisites

- **Node.js ≥ 22** and **git**.
- **pnpm** (the repo pins a version via `packageManager`; `corepack enable` will pick it up).
- That's it — the code-graph engine (**revitify**) ships bundled. graphify/Python is optional and only
  needed if you work on the external multi-modal provider.

## Setup

dev-spec-kit bundles the **revitify** code-graph engine via a local link (until revitify is published
to npm), so clone it as a **sibling** directory first and build it:

```sh
git clone https://github.com/Pratiyush/revitify.git
git clone https://github.com/Pratiyush/dev-spec-kit.git
( cd revitify && pnpm install && pnpm run build )   # the bundled provider
cd dev-spec-kit
pnpm install --frozen-lockfile
pnpm run build
pnpm test
```

The lockfile resolves `revitify` to `../revitify`, so the two repos must sit side by side. (CI does
the same: it checks out both and builds revitify before dev-spec-kit.)

## The quality bar (what CI enforces)

Every PR must pass the `ci` workflow, which runs exactly what you can run locally:

| Command | What it checks |
|---|---|
| `pnpm run build` | TypeScript compiles |
| `pnpm run typecheck` | `tsc --noEmit` is clean |
| `pnpm run lint` | ESLint is clean |
| `dev-spec-kit spec lint` | every `@check` ref resolves; every obligation is bound |
| `pnpm run coverage` | **100%** statements / functions / lines, branches at/above the floor |

The coverage gate is not aspirational — it is enforced in `vitest.config.ts` and CI will fail below it.
New code needs tests that *assert behavior*, not just execute lines.

## How dev-spec-kit develops itself (the dogfood loop)

dev-spec-kit's own features are built through its own loop. For an engine change:

1. **Spec it.** Add/extend a requirement in `.dev-spec-kit/specs/*.md` — an EARS criterion with at least
   one `@check kind=… ref=…` binding.
2. **Derive the task.** `dev-spec-kit spec tasks` (idempotent).
3. **TDD.** Write the failing test that matches the `@check` ref, then implement.
4. **Prove + finish.** Re-run the check green, `dev-spec-kit task done`.
5. **Re-prove the project.** Because a proof's identity is the working tree (minus `.dev-spec-kit/`),
   **any** code or doc change stales the proofs. Refresh them:

   ```sh
   dev-spec-kit verify --stamp   # re-run the suites, stamp fresh proofs
   dev-spec-kit graph build      # re-fuse; confirm 0 red / 0 stale
   # then commit the refreshed .dev-spec-kit/ state
   ```

A state-only commit (just `.dev-spec-kit/`) does not re-stale anything, so the dance terminates. See
[website/docs/internals.html](website/docs/internals.html) for the full mechanics.

Docs-only or tooling-only PRs still stale the proofs (the tree-hash is blunt) — run the same dance
before committing.

## Pull requests

- **Open a GitHub issue first.** Describe the change, then reference it from the PR (`Closes #NN`).
  Don't start without an issue — it keeps work traceable.
- **Branch** from `main` (it's protected — no direct pushes; PR + green CI required).
- Keep PRs **scoped to one change**. Fill in the PR template.
- CI must be **green** before merge. We **squash-merge** to keep `main` linear.
- **Conventional Commit titles are required** — they drive the automated release (see below).

## Releases

Releases are automated. On every push to `main`, the `release` workflow computes the next version
from [Conventional Commits](https://www.conventionalcommits.org/) and creates a git tag + GitHub
Release:

- `feat:` → **minor** · `fix:` → **patch** · `feat!:` / `BREAKING CHANGE:` → **major**
- `chore:` / `docs:` / `refactor:` / `test:` / `ci:` alone → **no release**

Don't tag by hand — the workflow owns versioning. Since we squash-merge, the **PR title is what the
release reads**, so make it a clean Conventional Commit.

## Conventions

- **Match the surrounding code** — naming, comment density, and idiom. Reuse before you add.
- Comments explain *why*, not *what*. The codebase favors a short rationale tag near non-obvious logic.
- Don't edit the verbatim cockpit surfaces (`src/cli/cockpit-assets/**`, `.design/**`) for style — they
  are pinned by a presence regression guard.

## Reporting bugs / requesting features

Use the issue templates. For bugs, include `dev-spec-kit doctor` output. For security issues, see
[SECURITY.md](SECURITY.md) — do **not** open a public issue.

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
