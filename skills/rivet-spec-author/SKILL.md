---
name: rivet-spec-author
description: Write high-quality Rivet specs — Gherkin scenarios (default) or EARS acceptance criteria with @check bindings in .rivet/specs/*.md. Use when authoring or revising a spec, converting a ticket/idea into requirements, or when criteria are vague, untestable, or unbound.
---

# Authoring a Rivet spec

A spec is the source of truth: `rivet spec tasks` derives evidence-bound tasks from it, and every
criterion's `@check` binding becomes a proof obligation in the graph. A criterion nobody can execute
is a wish, not a requirement.

## File shape (`.rivet/specs/<feature>.md`) — Gherkin is the default format

```markdown
# Feature: <name>

> User story: As a <role>, I want <capability>, so that <benefit>.

## Requirement REQUIREMENT_<AREA>-NN — <short title>

Scenario: <one observable behavior>
  Given <precondition>
  When <event>
  Then <observable outcome>

@check kind=<unit|integration|api|e2e|visual|parity> ref=<runner selector>

Scenario Outline: <behavior over a data table>
  Given a note titled "<title>"
  When the note is saved
  Then the save fails with "<error>"

Examples:
  | title   | error          |
  | <empty> | title required |
  | a/b     | no slashes     |

@check kind=unit ref=<one parameterized test that covers EVERY row>
```

Each `Scenario:` is ONE bindable criterion. A `Scenario Outline:` expands to one criterion PER
Examples row, and the `@check` under it binds ALL rows — worst-of applies: that check red means
every row unproven. EARS sentences (`WHEN/IF/WHILE/WHERE … the system SHALL …`) remain fully
supported (`spec.criteriaFormat`: gherkin = default, ears, mixed); off-format criteria lint but
always parse and bind.

## Rules (RFC-2119)

- Every criterion MUST be a Gherkin Scenario (Given/When/Then, one behavior) or a single EARS
  sentence: `WHEN/IF/WHILE/WHERE … the system SHALL …`. One behavior per criterion; split
  compound sentences.
- **The edge-case mandate — 100% behavioral coverage.** For EVERY behavior you MUST name its
  unhappy paths across four categories: happy path · invalid input · empty/boundary ·
  failure-injection (disk full, timeout, dependency down). If an edge case can't be named proven,
  it isn't covered. The floor is mechanical: a requirement with zero negative/failure criteria
  fails `rivet graph build` (`gates.negativeFloor`, on by default) — write the failure Scenario
  (or IF-pattern criterion) and bind it, don't argue with the gate.
- The SHALL clause MUST be observable from outside (a response, a state change, an emitted event) —
  never an implementation detail ("uses a HashMap") or a vibe ("is fast", "handles gracefully").
- Every criterion MUST carry ≥1 `@check` binding. If you cannot name the test that would prove it,
  the criterion is not done being written. Unbound criteria are flagged UNVERIFIED and create no task.
- Ref syntax MUST match the stack's runner: maven `Class#method` · vitest/jest `file::test name` ·
  pytest `file.py::test_name` · custom stacks per `verify.runners` in config.
- IDs MUST be fully qualified — they travel without their spec (PR bodies, boards, chat):
  `REQUIREMENT_<AREA>-NN` for functional and `NFR_<AREA>-NN` for non-functional criteria (both
  carry full proof obligations); `ADR_<AREA>-NN` for decision records (graph nodes, NO check
  obligation). Never bare `R-…` ids — legacy ids still parse but lint (`rules.requireQualifiedIds`).
- IDs are stable forever — never renumber; deprecate instead.
- Before locking a spec, ask the user at most 5 clarifying questions, ONE at a time, each with a
  recommended answer they can accept with "yes" (scope > security > UX > technical detail).
- Hunt for the unhappy paths: for each WHEN, ask "and when it doesn't?" — propose IF-pattern criteria
  for invalid input, timeouts, and empty states. Propose; the user approves scope.

## Quality check before handing off

Checklist-as-unit-test-for-the-spec: every criterion observable? every criterion bound? every ID
stable? no compound sentences? unhappy paths covered or explicitly deferred (note why)?
