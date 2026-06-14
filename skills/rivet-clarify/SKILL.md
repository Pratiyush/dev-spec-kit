---
name: rivet-clarify
description: Resolve ambiguity in a raw intake or draft spec by asking the user ≤5 high-value questions, each with a recommended default. Use before finalizing a full-spec route, or when `spec.onVague` is "clarify", or whenever a requirement is under-specified.
---

# Rivet clarify — ≤5 questions, recommended-option, one at a time

Verification only works if the spec says something falsifiable. Before authoring criteria, find the
ambiguity and resolve it with the user — cheaply. Borrowed from spec-kit's `/clarify`: the model
pre-answers, the user mostly says "yes".

## Detection passes (run all six over the intake/spec)
1. **Ambiguity** — terms with more than one reading ("fast", "secure", "soon").
2. **Missing edge cases** — unstated behavior on invalid input, empty/boundary, failure.
3. **Contradictions** — two requirements that can't both hold.
4. **Under-specified acceptance** — "works" with no observable outcome.
5. **Hidden assumptions** — implied infra, auth, scale, data shape.
6. **Vague terms** — undefined nouns the criteria will depend on.

## Asking (RFC-2119)
- Ask **≤5** questions total, the highest-impact first, **one at a time**.
- Every question MUST carry a **recommended answer** (your best inference, marked "(recommended)")
  so the user can confirm with a word. Use the harness's question UI when available.
- You MUST NOT ask what the intake already answers, or what a sensible default settles — make the
  call, note the assumption, and move on (only escalate when guessing is costlier than asking).
- After each answer, fold it back into the intake/spec text immediately; don't batch.

## Done
- Record the resolved decisions in the intake doc (and, if the project wants it auditable, as a
  journaled note). Then hand to `rivet-spec-author`. A clarification you didn't write down didn't
  happen.
