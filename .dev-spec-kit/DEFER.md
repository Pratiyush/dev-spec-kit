# DEFER — consciously postponed (each entry: why + when to revisit)

## Intake adapters: GitHub / GitLab issues + Jira (P6)
- **Why deferred:** Pratiyush (2026-06-12): intake comes from user input via Claude Code CLI for now
  ("we will do GitHub and GitLab issues and Jira integration later, it is not really required at this
  moment"). The raw path (`.dev-spec-kit/intake/*.md` + `dev-spec-kit route --file`) covers the actual workflow.
- **To revisit:** when dev-spec-kit is used on a project whose work actually arrives as tickets, or at the
  public launch when team usage begins. Config groundwork (`intake.sources`, `intake.jiraEpic`,
  `intake.writeBack`) already exists — only the adapters are missing.

## Packaging & publish: npm + plugin marketplace listing (P7)
- **Why deferred:** Pratiyush (2026-06-12): "defer packaging… we can do it later, and plugin
  marketplace listing later." First: build real apps WITH dev-spec-kit, learn, and improve from those
  lessons before freezing a public artifact.
- **Dogfood trigger MET (2026-06-19):** revitify was built end-to-end *with* dev-spec-kit (the first real
  app dogfood), so the "≥1 app built with dev-spec-kit" condition to revisit packaging is satisfied.
- **Public-brand DECIDED (2026-06-19): `dev-spec-kit`.** An availability sweep (npm + GitHub +
  .ai/.dev/.io) showed the "dev-spec-kit/RivetKit" brand is already occupied — `rivet` on npm is Pact's
  API-contract tool, and `rivetkit` + rivet.io/.ai/.dev belong to **rivet.gg** (active company,
  product literally "RivetKit"). So the planned `dev-spec-kit-kit` name was dropped. `dev-spec-kit` is free
  on every surface (npm `dev-spec-kit` & `devspeckit`, GitHub `devspeckit`, devspeckit.ai/.dev/.io).
  **The local `rivet` command and `.dev-spec-kit/` state dir stay unchanged** — this is the published
  brand/npm identity only; a command→brand rename is a separate, deferred decision (it's a breaking
  state-dir migration with no pre-publish benefit).
- **Still human-gated (your explicit action):** registering devspeckit.ai/.dev/.io (paid), claiming
  the GitHub `devspeckit` org/handle, the actual `npm publish` as `dev-spec-kit`, docs pass,
  marketplace listing.

## Durable journal snapshot+tail folding
- **Why deferred:** per-process (size,mtime) read cache covers current scale; snapshotting adds
  invalidation risk with no measured need. (Ledger: SCALE-01.)
- **To revisit:** when a real journal measurably slows commands (>~50k events).

## LLM-judged skill compliance scenarios
- **Why deferred:** structural skill-QA (commands/artifacts must exist) ships; judged compliance
  needs an eval budget and stable scenarios. (Ledger: SKILL-QA-01.)
- **To revisit:** pre-publish hardening, alongside the docs pass.

## Live Spring `withApp` e2e showcase
- **Why deferred:** Pratiyush (2026-06-12): showcase only; the lifecycle is already proven in-suite
  against a real HTTP server (RUNNERS-01). Spinning Spring adds demo value, not verification value.
- **To revisit:** before the public launch demo reel, or first real api/e2e-kind project.

## Sonnet-driven temporary e2e demo (master-prompt dry run)
- **Why deferred:** Pratiyush (2026-06-12): the REAL app-dogfood phase (him + master prompt)
  supersedes a synthetic dry run.
- **To revisit:** only if the app phase stalls and we need a cheap rehearsal first.

## Behavioral cockpit e2e (Playwright against `dev-spec-kit web`)
- **Why deferred:** the cockpit shell is browser-only vanilla JS; FIX-COCKPIT-ASSETS-01 pins the
  json-control (#4) and auto-reload-state (#9) wiring with a source-presence regression guard, which
  covers the regression risk. A true behavioral test needs a browser driver.
- **To revisit:** Phase D pre-publish hardening, alongside the docs pass — add Playwright (already
  the recommended E2E tool in the electron/init best-practice pack) and drive a real `dev-spec-kit web`.
