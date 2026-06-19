---
name: dev-spec-kit-analyze
description: Score each requirement's complexity 1–10 and recommend a subtask breakdown, then expand the over-scoped ones into bound sub-criteria. Use after a spec is drafted and before implementation, to catch requirements that are too big to prove as a single unit.
---

# dev-spec-kit analyze — complexity score, then expand the over-scoped

Borrowed from claude-task-master's complexity analysis, fitted to dev-spec-kit's spec model: a requirement
that's too big to prove as one unit is a hidden risk. Score it, then break it down — but keep every
piece **bound and provable**.

## Score (1–10 per requirement)
Consider implementation effort, technical risk, dependency depth, and **how many distinct behaviors
the acceptance criteria assert**. Report per requirement: `score (1–10) · recommendedSubtasks ·
one-line reasoning`. Buckets: 1–4 low (leave as-is) · 5–7 medium (breakdown helps) · 8–10 high
(MUST split — too large to prove or implement in one pass).

## Expand (score ≥ 8, or on request)
- Break the requirement into 2–6 **sub-criteria**, each one behavior, each independently bound by an
  `@check`. Use the existing `### Requirement`/`@check` grammar — no new id scheme; sub-criteria are
  numbered `-ACn` under the requirement.
- Each new sub-criterion MUST still be a single falsifiable SHALL/scenario — expansion that produces
  vaguer pieces is worse than the original.
- After editing the spec, run `dev-spec-kit spec tasks` to sync, then `dev-spec-kit spec draft-tests` for the new
  unbound criteria (hand to `dev-spec-kit-test-author`).

## Rules (RFC-2119)
- You MUST NOT inflate scores to justify breakdown — a genuinely small requirement stays one unit
  (the over-ceremony trap that sinks rival tools).
- A split MUST preserve total coverage: the sub-criteria together assert everything the original did,
  plus the edge cases the split surfaced.
- Report the scores to the user before expanding anything; expansion changes the spec, which is theirs.
