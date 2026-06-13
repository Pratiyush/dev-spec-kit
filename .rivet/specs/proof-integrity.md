# Feature: Proof-layer integrity — the green light cannot lie

> User story: As a Rivet user, I want a "green" check to mean a test actually executed and passed —
> never a vacuous pass from a name that matched nothing, and never a crash from a flag-like test
> name — so that the Verified Traceability Graph's edges are trustworthy by construction.
> Intake: dogfood feedback 2026-06-13 — "a bad -t match can silently pass with 0 tests, which is
> worse than failing"; "vitest -t swallows ---prefixed names (CACError) … I had to rename the test."

## Requirement REQUIREMENT_TRUST-01 — a name-filtered run that matches zero tests is never a pass

WHEN a bound check runs a JS test runner (vitest/jest) with a `::name` selector AND the name matches
no test THEN the system SHALL record the proof as FAILED, because a run in which zero tests executed
proves nothing — an exit-0 "no test matched" is the most corrosive possible false-green.

@check kind=unit ref=test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0
@check kind=unit ref=test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof

WHEN the named test exists and passes THEN the system SHALL record the proof as PASSED.

@check kind=unit ref=test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof

IF the JS runner exits 0 but writes no JSON report THEN the system SHALL refuse to record a proof
(treat it as a tooling failure) rather than infer a green it cannot confirm.

@check kind=unit ref=test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)

## Requirement REQUIREMENT_TRUST-02 — flag-like and regex-special test names bind to exactly that test

WHEN a check ref names a test whose name begins with `-` or contains regex metacharacters THEN the
system SHALL pass it to the runner as an escaped `--testNamePattern=<value>` (equals form) so the
runner's CLI parser binds that exact test and never reads the name as an option.

@check kind=unit ref=test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern

IF a test name begins with `-` THEN the system SHALL NOT crash the runner CLI (the old `-t <name>`
form raised "Unknown option"); the bound check SHALL still resolve to a passing proof.

@check kind=unit ref=test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI

## Requirement REQUIREMENT_STAMP-01 — one suite run stamps every bound criterion (kills the depth tax)

WHEN `rivet verify --stamp` runs THEN the system SHALL execute the test suite ONCE and record a
passing/failing `check.run` proof for every bound criterion whose test appears in the run, stamped
with the same code tree the suite ran on — so `trace` reads them green without a per-criterion
re-run (proving N criteria must cost one run, not N cold `check run`s).

@check kind=unit ref=test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind
@check kind=unit ref=test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)

IF a bound ref names a test NOT present in the run (another runner, or renamed away) THEN the system
SHALL leave that ref's existing proof untouched rather than fabricate or clear it.

@check kind=unit ref=test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)

IF a matched test only SKIPPED THEN the system SHALL NOT stamp a proof — skipped is not evidence.

@check kind=unit ref=test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence

## Requirement REQUIREMENT_LINT-01 — static drift check flags orphaned refs before any run

WHEN `rivet spec lint` runs THEN the system SHALL resolve every `@check` ref (from specs AND task
bindings) against the test files and report any whose file is missing, or whose test name no longer
appears in the file, as ORPHANED — exiting non-zero so a Stop/pre-commit hook can refuse the drift.

@check kind=unit ref=test/spec-lint.test.ts::flags a ref whose file is missing
@check kind=unit ref=test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)

WHEN every `@check` ref resolves THEN the system SHALL report a resolvable ref as clean.

@check kind=unit ref=test/spec-lint.test.ts::passes a ref whose file and name both resolve

IF a ref is a selector-only form the linter cannot statically resolve (e.g. maven `Class#method`)
THEN the system SHALL NOT report it as orphaned — no false positives.

@check kind=unit ref=test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)

## Requirement REQUIREMENT_DONE-01 — the done-gate tells a stale binding apart from a missing proof

WHEN a task's bound `@check` refs no longer match its requirement's current spec refs THEN the
system SHALL report the binding as out of sync — so the done-gate points at `rivet spec tasks`
(re-sync) instead of telling the user to re-run a ref that no longer exists.

@check kind=unit ref=test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)
@check kind=unit ref=test/done-msg.test.ts::is out of sync when the counts differ

WHEN a task's bound refs match the spec (order aside) THEN the system SHALL report them in sync, so
a genuinely-unproven task is NOT misreported as a binding problem.

@check kind=unit ref=test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)

## Requirement REQUIREMENT_DRAFT-01 — draft-tests scaffolds a failing, bound stub per unbound criterion

WHEN `rivet spec draft-tests` runs on a requirement with an unbound criterion THEN the system SHALL
emit a FAILING test stub (named from the criterion's clause, carrying the criterion text + the
edge-case mandate) plus the `@check` ref that binds it — the rule→test→proof loop the config's
`acceptanceCriteria: "tool-drafts"` mode promises but never delivered.

@check kind=unit ref=test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate
@check kind=unit ref=test/draft.test.ts::takes the SHALL clause and drops 'the system'

IF a criterion already binds a check (or the requirement is an ADR decision record) THEN the system
SHALL NOT draft a stub for it — drafting is only for unmet obligations.

@check kind=unit ref=test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records

## Requirement REQUIREMENT_RECONCILE-01 — verify --stamp --advance reconciles trace with status

WHEN `rivet verify --stamp --advance` runs AND a not-done task has a fresh passing proof for every
bound check THEN the system SHALL advance that task to done, so `trace` (criteria) and `status`
(tasks) stop disagreeing (feedback #7: "trace green while 34 tasks TODO").

@check kind=unit ref=test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree
@check kind=unit ref=test/done-msg.test.ts::never re-advances an already-done task

IF any bound check is missing, failing, or proven on an OLDER tree THEN the system SHALL NOT advance
the task — only fully and freshly proven work qualifies (it reuses the done-gate's own evidence).

@check kind=unit ref=test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)

## Requirement REQUIREMENT_JUDGE-01 — an LLM judge verdict is a recorded, second-class proof

WHEN a `judge` check records a verdict THEN the system SHALL stamp it `kind=judge` carrying the model
and reason — labelled distinctly so it is never rendered or counted as an executed green.

@check kind=unit ref=test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)
@check kind=unit ref=test/judge.test.ts::respects an explicit mode regardless of the key

IF no Anthropic API key is present THEN the system SHALL default `auto` mode to harness (the agent
supplies the verdict, free) — the common path never requires a key.

@check kind=unit ref=test/judge.test.ts::auto resolves to api when a key is present, harness when not
@check kind=unit ref=test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set

## Requirement REQUIREMENT_CYCLE-01 — a circular dependency is flagged, not silently built

WHEN the graph holds a circular `dependsOn` chain THEN the system SHALL report each cycle as a node
path and fail the build — a proof loop with no entry point cannot resolve.

@check kind=unit ref=test/cycles.test.ts::finds a simple A→B→A cycle
@check kind=unit ref=test/cycles.test.ts::finds a longer A→B→C→A cycle

WHEN the `dependsOn` edges are acyclic THEN the system SHALL report no cycle, and a non-dependsOn
edge SHALL never be mistaken for a dependency cycle — no false positives.

@check kind=unit ref=test/cycles.test.ts::returns nothing for an acyclic chain
@check kind=unit ref=test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)
