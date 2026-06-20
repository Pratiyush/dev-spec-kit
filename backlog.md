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

## Deferred features — revisit on trigger (see `.dev-spec-kit/DEFER.md`)

- [ ] **Intake adapters** (GitHub / GitLab issues + Jira) — when work actually arrives as tickets.
- [ ] **LLM-judged skill-compliance scenarios** — pre-publish hardening, alongside a docs pass.
- [ ] **Cockpit behavioral e2e** (Playwright against `dev-spec-kit web`) — Phase D pre-publish.
- [ ] **Live Spring `withApp` e2e showcase** — for the launch demo reel.
- [ ] **Sonnet master-prompt e2e dry run** — only if the real app-dogfood phase stalls.
- [ ] **Durable journal snapshot + tail folding** — when a real journal exceeds ~50k events.
