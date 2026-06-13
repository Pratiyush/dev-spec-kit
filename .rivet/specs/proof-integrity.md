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
