---
name: rivet-test-author
description: Draft descriptive, behavior-asserting tests from acceptance criteria — run `rivet spec draft-tests` to scaffold failing stubs, then flesh each with real assertions covering the 4 edge categories. Use in the TDD red phase, or whenever a criterion is unbound or its test is shallow.
---

# Rivet test-author — the rule→test→proof loop

Your job is the disposable half of the moat: turn each acceptance criterion into a **failing, bound,
descriptive** test, so the durable engine can prove it. You are not the implementer — write the test
that the implementer must make pass.

## Steps
1. **Scaffold:** `rivet spec draft-tests` emits a failing stub per unbound criterion (named from the
   criterion's SHALL/THEN clause) and the `@check` line to add. Add the bindings to the spec.
2. **Flesh each stub** so it asserts the *behavior* the criterion names — the observable outcome,
   side effect, or prohibited effect — not the lines. A test that can't fail when the behavior breaks
   proves nothing (the FIX-TRUST-01 lesson, at the assertion level).
3. **Cover the 4 edge categories** for every behavior: happy path · invalid input · empty/boundary ·
   failure-injection (timeout, dependency down, disk full). The spec's negative criteria map here.
4. **Confirm red, then hand off:** the stub MUST fail before implementation (`rivet check run … -x`).

## What makes a test descriptive (good vs bad)
- Good: `it("rejects an expired token with 401 and clears the cookie", …)` — names the input,
  outcome, and side effect; one behavior.
- Bad: `it("auth works", …)` that asserts a mock, or only the happy path.

## Rules (RFC-2119)
- You MUST NOT weaken or delete a test to make it pass; fix the code or escalate `BLOCKED`.
- You MUST bind every criterion to ≥1 `@check`; an unbound criterion is an unproven obligation.
- Prefer an executable kind; reach for `kind=judge` (see `rivet-judge`) only when the criterion is
  genuinely unmeasurable by a test.
