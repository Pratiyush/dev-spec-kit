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
