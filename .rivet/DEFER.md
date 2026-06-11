# DEFER — consciously postponed (each entry: why + when to revisit)

## Intake adapters: GitHub / GitLab issues + Jira (P6)
- **Why deferred:** Pratiyush (2026-06-12): intake comes from user input via Claude Code CLI for now
  ("we will do GitHub and GitLab issues and Jira integration later, it is not really required at this
  moment"). The raw path (`.rivet/intake/*.md` + `rivet route --file`) covers the actual workflow.
- **To revisit:** when Rivet is used on a project whose work actually arrives as tickets, or at the
  public launch when team usage begins. Config groundwork (`intake.sources`, `intake.jiraEpic`,
  `intake.writeBack`) already exists — only the adapters are missing.

## Packaging & publish: npm `rivet-kit` + plugin marketplace listing (P7)
- **Why deferred:** Pratiyush (2026-06-12): "defer packaging… we can do it later, and plugin
  marketplace listing later." First: build real apps WITH Rivet, learn, and improve from those
  lessons before freezing a public artifact.
- **To revisit:** after ≥1 app has been built end-to-end with Rivet and the resulting learnings are
  promoted (the app-build dogfood phase). Then: check `rivet-kit` npm availability, docs pass,
  marketplace listing.

## Durable journal snapshot+tail folding
- **Why deferred:** per-process (size,mtime) read cache covers current scale; snapshotting adds
  invalidation risk with no measured need. (Ledger: SCALE-01.)
- **To revisit:** when a real journal measurably slows commands (>~50k events).

## LLM-judged skill compliance scenarios
- **Why deferred:** structural skill-QA (commands/artifacts must exist) ships; judged compliance
  needs an eval budget and stable scenarios. (Ledger: SKILL-QA-01.)
- **To revisit:** pre-publish hardening, alongside the docs pass.
