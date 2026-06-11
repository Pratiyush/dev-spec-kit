---
name: rivet-spec-author
description: Write high-quality Rivet specs — EARS acceptance criteria with @check bindings in .rivet/specs/*.md. Use when authoring or revising a spec, converting a ticket/idea into requirements, or when criteria are vague, untestable, or unbound.
---

# Authoring a Rivet spec

A spec is the source of truth: `rivet spec tasks` derives evidence-bound tasks from it, and every
criterion's `@check` binding becomes a proof obligation in the graph. A criterion nobody can execute
is a wish, not a requirement.

## File shape (`.rivet/specs/<feature>.md`)

```markdown
# Feature: <name>

> User story: As a <role>, I want <capability>, so that <benefit>.

## Requirement R-<AREA>-NN — <short title>

WHEN <event> THEN the system SHALL <observable response>.

@check kind=<unit|integration|api|e2e|visual|parity> ref=<runner selector>
```

## Rules (RFC-2119)

- Every criterion MUST be a single EARS sentence: `WHEN/IF/WHILE/WHERE … the system SHALL …`.
  One behavior per criterion; split compound sentences.
- The SHALL clause MUST be observable from outside (a response, a state change, an emitted event) —
  never an implementation detail ("uses a HashMap") or a vibe ("is fast", "handles gracefully").
- Every criterion MUST carry ≥1 `@check` binding. If you cannot name the test that would prove it,
  the criterion is not done being written. Unbound criteria are flagged UNVERIFIED and create no task.
- Ref syntax MUST match the stack's runner: maven `Class#method` · vitest/jest `file::test name` ·
  pytest `file.py::test_name` · custom stacks per `verify.runners` in config.
- IDs (`R-AREA-NN`) are stable forever — never renumber; deprecate instead.
- Before locking a spec, ask the user at most 5 clarifying questions, ONE at a time, each with a
  recommended answer they can accept with "yes" (scope > security > UX > technical detail).
- Hunt for the unhappy paths: for each WHEN, ask "and when it doesn't?" — propose IF-pattern criteria
  for invalid input, timeouts, and empty states. Propose; the user approves scope.

## Quality check before handing off

Checklist-as-unit-test-for-the-spec: every criterion observable? every criterion bound? every ID
stable? no compound sentences? unhappy paths covered or explicitly deferred (note why)?
