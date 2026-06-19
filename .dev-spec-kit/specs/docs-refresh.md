# Feature: Documents that cannot go stale

> User story: As Pratiyush, I want every generated document refreshed whenever anything changes,
> so that no surface — board, resume, graph, cockpit — can ever show yesterday's truth.
> Intake: "everytime we change anything here it should update the documents" (Pratiyush, 2026-06-12,
> after the stale-dashboard investigation). Generalizes BOARDS-01's "boards cannot lie" to ALL
> generated documents.

## Requirement REQUIREMENT_DOCS-01 — every mutation refreshes every generated document

Scenario: a task mutation refreshes all truth surfaces
  Given a project whose dashboard updates live
  When a mutating command runs
  Then LEDGER.md, TRACKING.md, RESUME.md, graph.json and the cockpit sidecar all reflect the new state

@check kind=unit ref=test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar

Scenario: drift re-proofs refresh the documents
  Given a stale proof that dev-spec-kit drift re-greens
  When the drift re-runs complete
  Then the cockpit sidecar and the boards show the re-greened truth

@check kind=unit ref=test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving

Scenario: read-only queries never write documents
  Given a project where no cockpit was ever emitted
  When a read-only query runs
  Then no document is created or modified — read-only stays read-only

@check kind=unit ref=test/docs-refresh.test.ts::read-only queries never create or touch documents

Scenario: on-demand opts the sidecar out while boards still refresh
  Given dashboard.updates is "on-demand"
  When a mutating command runs
  Then the boards refresh while no sidecar is written

@check kind=unit ref=test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar
