## feat: blast radius in the PR body
**Binding coverage:** 48/48 acceptance criteria proven green (100%) at `tree cb52bed2`
### Traceability (generated from the Verified Traceability Graph)
| Requirement | Criterion | Proof |
|---|---|---|
| REQUIREMENT_AUDIT-01 | REQUIREMENT_AUDIT-01-AC1 | 🟢 green `test/cli-ux.test.ts::audits cli invocations into the journal` |
| REQUIREMENT_AUDIT-01 | REQUIREMENT_AUDIT-01-AC2 | 🟢 green `test/cli-ux.test.ts::does not create journals outside Rivet projects` |
| REQUIREMENT_AUDIT-02 | REQUIREMENT_AUDIT-02-AC1 | 🟢 green `test/cli-ux.test.ts::renders the audit trail with per-type emoji` |
| REQUIREMENT_AUDIT-02 | REQUIREMENT_AUDIT-02-AC2 | 🟢 green `test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold` |
| REQUIREMENT_PROG-01 | REQUIREMENT_PROG-01-AC1 | 🟢 green `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` |
| REQUIREMENT_PROG-01 | REQUIREMENT_PROG-01-AC2 | 🟢 green `test/cli-ux.test.ts::renders an explicit empty state when there are no tasks` |
| NFR_AUDIT-03 | NFR_AUDIT-03-AC1 | 🟢 green `test/cli-ux.test.ts::does not create journals outside Rivet projects` |
| REQUIREMENT_COCKPIT-01 | REQUIREMENT_COCKPIT-01-AC1 | 🟢 green `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` |
| REQUIREMENT_COCKPIT-01 | REQUIREMENT_COCKPIT-01-AC2 | 🟢 green `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` |
| REQUIREMENT_COCKPIT-01 | REQUIREMENT_COCKPIT-01-AC3 | 🟢 green `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` |
| REQUIREMENT_COCKPIT-02 | REQUIREMENT_COCKPIT-02-AC1 | 🟢 green `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` |
| REQUIREMENT_COCKPIT-02 | REQUIREMENT_COCKPIT-02-AC2 | 🟢 green `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` |
| REQUIREMENT_COCKPIT-02 | REQUIREMENT_COCKPIT-02-AC3 | 🟢 green `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` |
| REQUIREMENT_COCKPIT-03 | REQUIREMENT_COCKPIT-03-AC1 | 🟢 green `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` |
| REQUIREMENT_COCKPIT-03 | REQUIREMENT_COCKPIT-03-AC2 | 🟢 green `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` |
| REQUIREMENT_COCKPIT-04 | REQUIREMENT_COCKPIT-04-AC1 | 🟢 green `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` |
| REQUIREMENT_COCKPIT-04 | REQUIREMENT_COCKPIT-04-AC2 | 🟢 green `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` |
| REQUIREMENT_COCKPIT-05 | REQUIREMENT_COCKPIT-05-AC1 | 🟢 green `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` |
| REQUIREMENT_COCKPIT-05 | REQUIREMENT_COCKPIT-05-AC2 | 🟢 green `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` |
| REQUIREMENT_COCKPIT-05 | REQUIREMENT_COCKPIT-05-AC3 | 🟢 green `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` |
| REQUIREMENT_COCKPIT-05 | REQUIREMENT_COCKPIT-05-AC4 | 🟢 green `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` |
| REQUIREMENT_DOCS-01 | REQUIREMENT_DOCS-01-AC1 | 🟢 green `test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar` |
| REQUIREMENT_DOCS-01 | REQUIREMENT_DOCS-01-AC2 | 🟢 green `test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving` |
| REQUIREMENT_DOCS-01 | REQUIREMENT_DOCS-01-AC3 | 🟢 green `test/docs-refresh.test.ts::read-only queries never create or touch documents` |
| REQUIREMENT_DOCS-01 | REQUIREMENT_DOCS-01-AC4 | 🟢 green `test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar` |
| REQUIREMENT_TRUST-01 | REQUIREMENT_TRUST-01-AC1 | 🟢 green `test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0`<br>🟢 green `test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof` |
| REQUIREMENT_TRUST-01 | REQUIREMENT_TRUST-01-AC2 | 🟢 green `test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof` |
| REQUIREMENT_TRUST-01 | REQUIREMENT_TRUST-01-AC3 | 🟢 green `test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)` |
| REQUIREMENT_TRUST-02 | REQUIREMENT_TRUST-02-AC1 | 🟢 green `test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern` |
| REQUIREMENT_TRUST-02 | REQUIREMENT_TRUST-02-AC2 | 🟢 green `test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI` |
| REQUIREMENT_STAMP-01 | REQUIREMENT_STAMP-01-AC1 | 🟢 green `test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind`<br>🟢 green `test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)` |
| REQUIREMENT_STAMP-01 | REQUIREMENT_STAMP-01-AC2 | 🟢 green `test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)` |
| REQUIREMENT_STAMP-01 | REQUIREMENT_STAMP-01-AC3 | 🟢 green `test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence` |
| REQUIREMENT_LINT-01 | REQUIREMENT_LINT-01-AC1 | 🟢 green `test/spec-lint.test.ts::flags a ref whose file is missing`<br>🟢 green `test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)` |
| REQUIREMENT_LINT-01 | REQUIREMENT_LINT-01-AC2 | 🟢 green `test/spec-lint.test.ts::passes a ref whose file and name both resolve` |
| REQUIREMENT_LINT-01 | REQUIREMENT_LINT-01-AC3 | 🟢 green `test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)` |
| REQUIREMENT_DONE-01 | REQUIREMENT_DONE-01-AC1 | 🟢 green `test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)`<br>🟢 green `test/done-msg.test.ts::is out of sync when the counts differ` |
| REQUIREMENT_DONE-01 | REQUIREMENT_DONE-01-AC2 | 🟢 green `test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)` |
| REQUIREMENT_DRAFT-01 | REQUIREMENT_DRAFT-01-AC1 | 🟢 green `test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate`<br>🟢 green `test/draft.test.ts::takes the SHALL clause and drops 'the system'` |
| REQUIREMENT_DRAFT-01 | REQUIREMENT_DRAFT-01-AC2 | 🟢 green `test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records` |
| REQUIREMENT_RECONCILE-01 | REQUIREMENT_RECONCILE-01-AC1 | 🟢 green `test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree`<br>🟢 green `test/done-msg.test.ts::never re-advances an already-done task` |
| REQUIREMENT_RECONCILE-01 | REQUIREMENT_RECONCILE-01-AC2 | 🟢 green `test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)` |
| REQUIREMENT_JUDGE-01 | REQUIREMENT_JUDGE-01-AC1 | 🟢 green `test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)`<br>🟢 green `test/judge.test.ts::respects an explicit mode regardless of the key` |
| REQUIREMENT_JUDGE-01 | REQUIREMENT_JUDGE-01-AC2 | 🟢 green `test/judge.test.ts::auto resolves to api when a key is present, harness when not`<br>🟢 green `test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set` |
| REQUIREMENT_CYCLE-01 | REQUIREMENT_CYCLE-01-AC1 | 🟢 green `test/cycles.test.ts::finds a simple A→B→A cycle`<br>🟢 green `test/cycles.test.ts::finds a longer A→B→C→A cycle` |
| REQUIREMENT_CYCLE-01 | REQUIREMENT_CYCLE-01-AC2 | 🟢 green `test/cycles.test.ts::returns nothing for an acyclic chain`<br>🟢 green `test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)` |
| REQUIREMENT_PRBLAST-01 | REQUIREMENT_PRBLAST-01-AC1 | 🟢 green `test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves`<br>🟢 green `test/pr-blast.test.ts::renders the touched edges for changed files that map` |
| REQUIREMENT_PRBLAST-01 | REQUIREMENT_PRBLAST-01-AC2 | 🟢 green `test/pr-blast.test.ts::notes honestly when changed files map to no graph node`<br>🟢 green `test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)` |
### Blast radius (proven edges this change touches)

- `test/pr-blast.test.ts` → 🟢 green `REQUIREMENT_PRBLAST-01-AC1`, 🟢 green `REQUIREMENT_PRBLAST-01-AC2`
### Tasks
- ✅ **FIX-ROUTE-01** route: build-intent must veto research keywords (done)
- ✅ **R-AUDIT-01** every CLI invocation is audit-logged (done)
- ✅ **R-AUDIT-02** the audit trail is readable (done)
- ✅ **R-PROG-01** progress with emoji after completing a task (done)
- ✅ **FIX-PRMATH-01** PR coverage uses worst-of obligation semantics (done)
- ✅ **FIX-PROOF-01** proof identity = tested tree hash, not commit SHA (done)
- ✅ **FIX-ROBUST-01** inputs never crash; infra errors are not proofs (done)
- ✅ **FIX-SPECSYNC-01** spec re-derive syncs bindings; evidence unclobberable (done)
- ✅ **FIX-GATE-01** one not-green-blocks predicate; missing graph blocks (done)
- ✅ **GATE-PROTECT-01** in-flight specs/tests/config need human unlock (done)
- ✅ **FIX-PARSE-01** parser respects markdown reality (done)
- ✅ **FIX-QUERY-01** read-only queries; no retry burn; deterministic ties (done)
- ✅ **AUDIT-META-01** journal meta (actor/model) + governance events (done)
- ✅ **FINISH-RITUAL-01** rivet-finish skill: evidence gate, fixed menu, typed confirm (done)
- ✅ **GATE-FACTS-01** DENY-FORCE-ALLOW investigative gate (opt-in) (done)
- ✅ **GATE-PACKS-01** config gate packs: sections+kinds+security floor (done)
- ✅ **COMPACT-01** phase-aware checkpoints + PreCompact resume save (done)
- ✅ **SKILL-QA-01** mechanical QA: skills reference only real commands/artifacts (done)
- ✅ **SCALE-01** P3: locking, fold cache, failure tails, anchor-by-path, audit gating (done)
- ✅ **RUNNERS-01** multi-kind verification: kind-aware runs + app lifecycle + kind runners (done)
- ✅ **RENAME-LAWS-01** rename constitution → laws (user term) (done)
- ✅ **BOARDS-01** generated LEDGER.md + TRACKING.md boards (done)
- ✅ **WAVE-01** worktree wave dispatcher: plan + fetch-first start (done)
- ✅ **STEER-01** laws engine: 3 scopes + personal inheritance + file injection (done)
- ✅ **LEARN-01** warn-on-repeat: open lessons surface at task start (done)
- ✅ **WAVE-02** wave done: provenance-checked worktree cleanup after merge (done)
- ✅ **DASH-01** dashboard v1: emoji + completion % + traffic lights + graph embed (done)
- ✅ **FILES-01** dashboard files plumbing: collect .rivet md + safe renderer (done)
- ✅ **README-01** README refresh: match the real tool surface (done)
- ✅ **FIX-PROOF-02** proof identity excludes .rivet state (journal must not stale its own proofs) (done)
- ✅ **TRAIL-01** per-task gate trail: minute-level done/blocked/skipped/pending (done)
- ✅ **DASH-02** port design.html as the dashboard template with live data injection (done)
- ✅ **FIX-DOCTOR-01** graphify optional in doctor + provenance hint (classifier-safe) (done)
- ✅ **FIX-STACKNAMES-01** project.platforms rename + runner-stack disambiguation error (done)
- ✅ **FIX-PROOF-03** check-run stamp shows tree identity, not commit sha (done)
- ✅ **FIX-PROOF-04** every proof surface stamps the tree identity (PR body, approvals, ledger log) (done)
- ✅ **FIX-PROV-01** provenance hint carries no rotting vanity metrics (star count) (done)
- ✅ **FEAT-IDS-01** fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint (done)
- ✅ **REQUIREMENT_AUDIT-01** every CLI invocation is audit-logged (done)
- ✅ **REQUIREMENT_AUDIT-02** the audit trail is readable (done)
- ✅ **REQUIREMENT_PROG-01** progress with emoji after completing a task (done)
- ✅ **FEAT-GHERKIN-01** gherkin first-class + default format + mechanical negative floor (done)
- ✅ **NFR_AUDIT-03** auditing never breaks the CLI (done)
- ✅ **FEAT-STACK-01** verify.defaultStack + platform inference; --stack optional (done)
- ✅ **FEAT-REPORT-01** tabular post-task evidence report (terminal + LEDGER) (done)
- ✅ **FEAT-EMOJI-01** central emoji vocabulary (>=10 new) + plain mode for CI (done)
- ✅ **FEAT-VERIFY-01** rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate (done)
- ✅ **FEAT-PLATFORM-01** electron platform; platforms is an ARRAY (polyglot normal) (done)
- ✅ **FEAT-INITPACKS-01** init --platforms seeds free/OSS best-practice law packs, pre-wired to checks (done)
- ✅ **FEAT-CCFIRST-01** README states Claude-Code-first explicitly (done)
- ✅ **FEAT-FLUSH-01** pr learnings-flush warn + doctor stale-worktree visibility (done)
- ✅ **FEAT-REVITIFY-01** revitify: native TS knowledge graph, graphify output contract, default provider (done)
- ✅ **FEAT-REVITIFY-02** revitify extracted to its own repo; consumer-side contract pinned (done)
- ✅ **FIX-STALEDONE-01** done-gate refuses stale evidence (pass on an older tree is not green) (done)
- ✅ **REQUIREMENT_COCKPIT-01** config manifest generated from the schema (done)
- ✅ **REQUIREMENT_COCKPIT-02** the RIVET data sidecar is the project's truth (done)
- ✅ **REQUIREMENT_COCKPIT-03** static shell emission, written once (done)
- ✅ **REQUIREMENT_COCKPIT-04** live updates after every proof event (done)
- ✅ **REQUIREMENT_COCKPIT-05** the config save server (done)
- ✅ **REQUIREMENT_DOCS-01** every mutation refreshes every generated document (done)
- ✅ **FIX-COCKPIT-SEC-01** cockpit hardening: 12 adversarial-review findings (localhost bind, unlock match, parsed-write, body cap, CSRF, etc.) (done)
- ✅ **FIX-COCKPIT-ASSETS-01** regression guard for browser-asset findings #4 (json control) + #9 (auto-reload state) (done)
- ✅ **REQUIREMENT_TRUST-01** a name-filtered run that matches zero tests is never a pass (done)
- ✅ **REQUIREMENT_TRUST-02** flag-like and regex-special test names bind to exactly that test (done)
- ✅ **REQUIREMENT_STAMP-01** one suite run stamps every bound criterion (kills the depth tax) (done)
- ✅ **REQUIREMENT_LINT-01** static drift check flags orphaned refs before any run (done)
- ✅ **REQUIREMENT_DONE-01** the done-gate tells a stale binding apart from a missing proof (done)
- ✅ **REQUIREMENT_DRAFT-01** draft-tests scaffolds a failing, bound stub per unbound criterion (done)
- ✅ **REQUIREMENT_RECONCILE-01** verify --stamp --advance reconciles trace with status (done)
- ✅ **REQUIREMENT_JUDGE-01** an LLM judge verdict is a recorded, second-class proof (done)
- ✅ **REQUIREMENT_CYCLE-01** a circular dependency is flagged, not silently built (done)
- ✅ **REQUIREMENT_PRBLAST-01** the PR body shows the change's blast radius (done)
### Recorded approvals

- `2026-06-12-FEAT-VERIFY-01-FEAT-GHERKIN-01-FEAT-IDS-01-FEAT-REPORT-01-FEAT-EMOJI-01-FEAT-INITPACKS-01-FEAT-PLATFORM-01-FEAT-STACK-01-FEAT-CCFIRST-01-FEAT-FLUSH-01-FEAT-REVITIFY-01-FEAT-REVITIFY-02.md`
- `2026-06-12-REQUIREMENT_COCKPIT-01-REQUIREMENT_COCKPIT-02-REQUIREMENT_COCKPIT-03-REQUIREMENT_COCKPIT-04-REQUIREMENT_COCKPIT-05-REQUIREMENT_DOCS-01.md`
---
_72/72 task(s) done · generated by Rivet — every requirement riveted to a passing check._
