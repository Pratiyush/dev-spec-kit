# Backlog — dev-spec-kit

Pending technical work that an agent or contributor can pick up. Maintainer-only actions live in
[human-backlog.md](human-backlog.md); deeper rationale for the deferred features is in
`.dev-spec-kit/DEFER.md`. Nothing here blocks use — `main` is green, 100% coverage, VTG fully proven.

## Now / next

- [ ] **Publish-readiness — the revitify dependency.** dev-spec-kit bundles the revitify engine via a
  local `link:` (sibling checkout). Once revitify is published to npm (see human-backlog), swap the
  dependency to the published `revitify@^x.y.z` — removes the CI sibling-checkout workaround, the
  `REVITIFY_SRC` alias override, and the broken standalone `pnpm install` for contributors.
- [ ] **Triage open Dependabot PRs** — confirm CI is green on each before merge (especially the GitHub
  Actions major bumps: `actions/checkout` v7, `actions/setup-node` v6, `pnpm/action-setup` v6).
- [ ] **Re-prove after each release.** Merging a release-please PR bumps `package.json`, which stales the
  proofs. Run `dev-spec-kit verify --stamp` → `graph build` → commit the refreshed `.dev-spec-kit/`
  state. (Could be automated later.)

## Dogfood findings — building Octavo on the kit (2026-06)

Surfaced building Octavo (a real Electron app) end-to-end on the kit — 4 milestones, ~26 requirements,
~250 checks, 100% coverage, 0 drift. Full field report: [OCTAVO-DOGFOOD.md](OCTAVO-DOGFOOD.md).
(The revitify clean-clone friction is the "Publish-readiness" item under *Now / next* above.)

- [ ] **Accept `## ADR_*` / `## Decision *` spec headings.** The spec parser matches only
  `## Requirement <id>`; an `## ADR_<id>` heading is parsed as an unbound criterion of the *previous*
  requirement → ✗-blocks `graph build` (`everyCriterionNeedsCheck`) with a confusing shifting "uncovered
  ACn" in lint. Octavo worked around it by titling ADRs `## Requirement ADR_<id>`. Fix: accept
  ADR/Decision headings as first-class, or lint-warn on an id-prefixed non-"Requirement" `##` heading.
- [ ] **Align `rivet approve` task-id lookup with `task done`.** `approve REQUIREMENT_FOO` reports
  "unknown task" for the exact ids `task done REQUIREMENT_FOO` accepts, so the per-milestone approve gate
  was unusable — Octavo used the git tag + green proofs as release evidence instead.
- [ ] **Upstream the cockpit dashboard-staleness fix.** Already fixed in a clone (`fix(cockpit): poll
  /api/state for change-detection`): the SPA's auto-reload is suppressed while the config drawer is open
  (`Config.hasDirty()` / `drawerOpen` guard in `rivet.app.js`), so the Dashboard looks stale though
  `/api/state` is live (verified 47/47). Port it to a `fix(cockpit)` PR — poll the data independently of
  the config-edit guard (block only the reload that would clobber unsaved *config* edits).
- [ ] **Consider a kit-native multi-angle `review` phase.** Fan out per-angle agents at milestone close —
  Correctness · Security · Performance · Accessibility/UX, **security always included**. On Octavo this
  caught a HIGH a11y blocker that a single broad pass had cleared.
- [ ] **Consider a kit-native `docs` / release-checklist step** asserting "guides updated" each release,
  so user / developer / feature / product docs stay current instead of rotting.

## Deferred features — revisit on trigger (see `.dev-spec-kit/DEFER.md`)

- [ ] **Intake adapters** (GitHub / GitLab issues + Jira) — when work actually arrives as tickets.
- [ ] **LLM-judged skill-compliance scenarios** — pre-publish hardening, alongside a docs pass.
- [ ] **Cockpit behavioral e2e** (Playwright against `dev-spec-kit web`) — Phase D pre-publish.
- [ ] **Live Spring `withApp` e2e showcase** — for the launch demo reel.
- [ ] **Sonnet master-prompt e2e dry run** — only if the real app-dogfood phase stalls.
- [ ] **Durable journal snapshot + tail folding** — when a real journal exceeds ~50k events.
