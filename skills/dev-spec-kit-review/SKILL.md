---
name: dev-spec-kit-review
description: Two-pass adversarial code review for dev-spec-kit changes — a blind diff-only pass, then a full-context pass against the spec and graph. Use before any PR, after dev-spec-kit graph build is green, or when the user asks for review.
---

# dev-spec-kit review — two passes, findings listed, no quotas

Verification proves the criteria; review hunts what criteria can't see. Run it AFTER
`dev-spec-kit graph build` is green (review is not a substitute for proofs).

## Pass 1 — blind (diff only)

Read ONLY the diff (`git diff main...HEAD`), with no spec, no task context, no prior conversation —
ideally in a fresh subagent. Hunt: logic errors, edge cases, security smells (injection, authz,
secrets), concurrency, resource leaks, error-handling gaps. The implementer finished suspiciously
confidently — do NOT take their word for anything; read the code.

### Lens — exhaustive path enumeration (run within Pass 1)

Don't review by vibes; enumerate. Walk every branching path — control flow (conditionals, loops,
error handlers, early returns) and domain boundaries (where a value, state, or condition transitions:
empty/one/many, zero/negative/overflow, null/undefined, first/last, concurrent/timeout). Derive the
edge classes from THIS code, not a fixed checklist. For each path, decide whether the code handles
it; collect only the UNHANDLED ones as findings and drop the handled ones silently. This is the lens
that catches the off-by-one and the missing `else` that line-coverage and a confident author miss.

## Pass 2 — full context (diff + spec + graph)

Now load `.dev-spec-kit/specs/*.md`, `.dev-spec-kit/graph.json`, and the tasks. Hunt what blind review can't:
- Criteria satisfied in letter but not intent (test passes, behavior misses the point).
- Scope creep: changes no requirement asks for (flag, don't condemn).
- Spec gaps the implementation revealed — propose spec updates, don't silently patch around them.
- Reuse violations: code that duplicates something the code graph shows already exists
  (`graphify query` / the dashboard map are your friends).
- **Silent failures**: swallowed exceptions, catch-and-continue, default fallbacks that mask errors,
  empty error branches — every error path must surface or journal, never vanish.
- **Behavioral coverage, not line coverage**: do the bound tests assert the *behavior* the criterion
  names (outcome, side effects, prohibited effects), or merely execute the lines? A test that
  cannot fail when the behavior breaks proves nothing.

## Receiving review feedback (when dev-spec-kit's work is reviewed)

Verify each suggestion against the spec and graph BEFORE implementing it — a reviewer can be wrong
about a requirement. No performative agreement: if a finding conflicts with a criterion, say so
with the criterion id; if it reveals a spec gap, propose the spec change rather than silently
complying. Accepted findings follow the normal loop (bind a check where one is missing).

## Output rules (RFC-2119)

- Findings MUST be a list for the human to decide — you MUST NOT auto-fix (config `review.fixFindings`
  is `list`). Each finding: severity (BLOCKER/MAJOR/MINOR/NOTE) · location (`file:line`) · what · why
  it matters · suggested fix.
- There is NO minimum or maximum finding count. Manufacturing nitpicks to look thorough is review
  fatigue, not quality (the BMAD lesson). But zero findings is *suspicious until earned*: before you
  report "clean", confirm you actually ran the path-enumeration lens over every hunk — zero findings
  means "I enumerated and found nothing", never "I skimmed and it looked fine". "Looks good" without
  having read every hunk is lying.
- You MUST NOT approve your own implementation; review runs in a separate context from the writer.
- End with: proofs state (from the graph) · findings count by severity · your recommendation
  (ship / fix-first / discuss), and remind the user the merge gate is theirs.
