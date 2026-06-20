# CLAUDE.md — working in the dev-spec-kit repo

Guidance for Claude Code (and other AI assistants) contributing to **this** repository — the
dev-spec-kit engine itself. (For *using* dev-spec-kit on a project, see the `skills/` and `website/`.)

## What this repo is

A spec-driven development CLI built around a **Verified Traceability Graph**: requirements (EARS specs
with `@check` bindings) × executed check results (the journal) × the code graph (bundled **revitify**)
fuse into proven `validates`/`implements`/`satisfies` edges. The tool **dogfoods itself** — its own
features live in `.dev-spec-kit/specs/` and are proven through its own loop.

## Commands

```sh
pnpm run build       # tsc + copy cockpit assets
pnpm run typecheck   # tsc --noEmit
pnpm run lint        # eslint
pnpm run coverage    # vitest run --coverage  (THE gate)
node dist/cli/index.js <cmd>   # run the CLI (e.g. verify --stamp, graph build, spec lint)
```

## Non-negotiables

- **Coverage gate: 100% statements/functions/lines + branch floor** (`vitest.config.ts`). New code
  needs behavior-asserting tests. CI fails below the gate.
- **The re-prove dance.** A proof's identity is the working-tree content hash *minus* `.dev-spec-kit/`,
  so **any** change to `src/`, `test/`, `website/`, `skills/`, etc. stales the proofs. After your
  change is final:
  ```sh
  node dist/cli/index.js verify --stamp   # re-run + stamp
  node dist/cli/index.js graph build      # re-fuse; must show 0 red / 0 stale
  ```
  Then commit the refreshed `.dev-spec-kit/` state. A state-only commit does NOT re-stale (that dir is
  excluded), so the dance terminates. Do this even for docs-only changes.
- **`main` is protected.** No direct pushes — branch, open a PR, let CI go green, then **squash-merge**.
- **Don't restyle the verbatim surfaces:** `src/cli/cockpit-assets/**` and `.design/**` (the browser
  cockpit shell — `window.RIVET` / `.rivet` CSS / `rivet.*.js` are intentionally kept) are pinned by a
  presence regression guard.

## Conventions

- Match the surrounding code — naming, comment density, idiom. Reuse before adding.
- Comments carry a short *why* (often a ledger tag like `FIX-PROOF-01`), not a restatement of the code.
- Commit/PR titles: `feat:` / `fix:` / `docs:` / `refactor:` / `chore:`.

## Where things live

- `src/engine/` — the verification heart: `spec/` (EARS), `state/` (journal + tasks),
  `graph/` (build + types), `graphify/` (the revitify/graphify provider), `verify/` (runners + stamp),
  `gate.ts` (the one PR-gate predicate).
- `src/cli/` — the command surface (`index.ts` wires commands).
- `skills/` — the Claude Code skills (validated structurally by `test/skill-qa.test.ts`).
- `.dev-spec-kit/` — the project's own committed spec/proof state (specs, journal, graph).
- `website/` — the static docs site.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full flow.
