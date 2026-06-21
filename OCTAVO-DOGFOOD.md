# Dogfood report — building Octavo v0.1.0 on dev-spec-kit

Octavo (a local-first Markdown notepad: Electron + React 19 + TS-strict + CodeMirror 6) was built
**entirely through dev-spec-kit's loop** — 1 milestone (M00, 9 slices), 40 requirements, 120 `@check`
proofs, 100% coverage, 0 drift, tagged `v0.1.0`. This captures what we learned, as input for upstream
improvements. (Source: github.com/Pratiyush/octavo · project-side index: `RIVET-IMPROVEMENTS.md`.)

## What worked exceptionally well
- The **spec (EARS + `@check`) → tasks → check run → `task done` gate → drift → graph build** loop held
  **zero drift across 32 commits** and a major refactor (the autosave rework). Tree-hash proofs re-green
  cleanly via `rivet drift` after every edit; a state-only commit doesn't re-stale, so it terminates.
- **100% coverage as a kit-enforced gate** + a "story per component" check (we added one project-side)
  made the antidrift guarantee real, not aspirational.
- Evolving a *completed* requirement was smooth: e.g. SHELL-02 grew a `vault` IPC namespace and SHELL-05's
  root moved to compose a gate — edit spec + test, `drift` re-greens, the graph stays honest.
- **The release-gate adversarial review caught 3 real blockers** (path traversal, autosave data-loss,
  silent IPC rejections) that 120 green unit checks did not. The human/adversarial gate earns its place.

## Friction / bugs found (ranked — candidates for upstream fixes)
1. **Clean-clone build fails.** `revitify` is pinned `link:<absolute-path>` and `packages/revitify` is
   gitignored, so a fresh `git clone` + `pnpm i && pnpm build` can't resolve it (we repointed a symlink:
   `ln -sfn <abs>/revitify node_modules/revitify`). → Ship revitify as a real workspace package, or
   document the bootstrap in CONTRIBUTING.
2. **ADR/NFR spec headings are swallowed.** The spec parser matches only `## Requirement <id>`; a
   `## ADR_<id>` (or `## Decision …`) heading is parsed as an *unbound criterion of the previous
   requirement*, which then ✗-blocks `graph build`. Workaround: title ADRs `## Requirement ADR_<id> — …`.
   → Accept `## ADR_*` / `## Decision *` as first-class ADR sections.
3. **`rivet approve` task-id mismatch.** `approve REQUIREMENT_FOO` reports "unknown task" for the exact
   ids that `task done REQUIREMENT_FOO` accepts — so the per-milestone approve gate was unusable; we used
   the git tag + 120 proofs as release evidence instead. → Align `approve`'s lookup with `task done`'s.

4. **Cockpit dashboard looks stale though `/api/state` is live.** The server regenerates data per request
   (verified: `/api/state` matched reality 47/47), but the SPA's auto-reload is **fully suppressed while the
   Config drawer is open** (`Config.hasDirty()` / `drawerOpen` guard in `rivet.app.js`), so the Dashboard tab
   never refreshes and looks like wrong/stale data. → Poll/refresh the dashboard data independently of the
   config-edit guard (only block the reload that would clobber unsaved *config* edits, not the data poll).

## Under-used surface (happy-path docs opportunity)
We leaned hard on `check`/`task`/`spec`/`drift`/`graph`/`status` (≈90% of invocations) but barely touched
the **analysis phase** (`route` → clarify → analyze → architect — we hand-authored specs), and never used
`verify` (batch), `affected`, `wave`, or `guard`/`laws`. A "zero to first proof" guide threading
`route → spec → loop` would surface them. We also layered a **refinement + gap-analysis ritual** on top
(see Octavo's `plans/REFINEMENT.md`) — a kit-native `refine` step could formalize it.
