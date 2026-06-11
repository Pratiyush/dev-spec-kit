# Rivet learnings — append-only; a lesson counts once PROMOTED or HARDENED

## 2026-06-11 Build-intent must veto research keywords in routing
- Trigger: live demo routed "i want a portfolio page … and compare with index" to RESEARCH — the
  word "compare" outweighed the explicit "i want a … page" build intent.
- Lesson: investigative keywords are weak signals; build-intent ("i/we want|need", "add/create/
  implement") must veto them. Misrouting a feature to research silently produces zero code.
- Promoted to: check:test/workflow.test.ts::want-signals veto research routing (permanent
  regression test, bound via task FIX-ROUTE-01 — red→fix→green through Rivet's own done-gate)

## 2026-06-11 Proof identity must be the TESTED TREE, not the commit SHA  ⟨P1 · BLOCKER⟩
- Trigger: adversarial review #1 (confirmed live): proofs stamp `git rev-parse HEAD` while the tree
  is dirty — green can vouch for uncommitted code; and committing the tested code moves HEAD, so
  every proof instantly flips stale.
- Lesson: "green means this code is proven" requires the proof to identify the tree it ran against.
  Stamp proofs with a content/tree hash (e.g. `git stash create` tree-hash or hash of bound files)
  + a dirty flag; compute staleness against the tree hash; dirty-tree greens are `provisional`.
- Promoted to: OPEN → task FIX-PROOF-01

## 2026-06-11 The spec→gate link must never freeze or clobber  ⟨P1⟩
- Trigger: review #2/#3 (confirmed): `spec tasks` skips existing tasks so NEW `@check` obligations
  are never enforced; bare `task create` on an existing id resets status and wipes recorded proofs.
- Lesson: the spec is only the source of truth if re-derivation diffs bindings into existing tasks,
  and `task.created` folds as create-if-absent — recorded evidence must be unclobberable.
- Promoted to: OPEN → task FIX-SPECSYNC-01

## 2026-06-11 User-editable inputs must never crash; infra errors are not test failures  ⟨P1⟩
- Trigger: review #4/#8/#5 (confirmed): malformed config.json or a data-less journal line → raw
  stack traces across commands; missing runner binary (ENOENT, status null) recorded as a RED proof.
- Lesson: parse all inputs defensively with one helper + clear message; spawn errors/status null are
  tooling errors, never proofs — they must not enter the graph.
- Promoted to: OPEN → task FIX-ROBUST-01

## 2026-06-11 All gates must share one predicate, and absence of state must block  ⟨P1⟩
- Trigger: review #6 (confirmed bypasses): `gh "pr" create`, `$GH pr create`, `gh api …/pulls`, and
  `rm .rivet/graph.json` all sail past the guard; `rivet pr` blocks red/stale but not unproven —
  three gates, three different predicates.
- Lesson: one shared rule — "anything not green blocks" — applied by the hook, `guard pr`, and
  `rivet pr` alike; in a Rivet project a MISSING graph blocks (state absence ≠ permission);
  `rivet pr --create` must run the same guard it advertises.
- Promoted to: OPEN → task FIX-GATE-01

## 2026-06-11 Worst-of obligation semantics everywhere — including the PR headline  ⟨P1 · quick⟩
- Trigger: review #7 (confirmed): PR body counts a criterion proven if ANY binding is green; one
  green + one red reports "100% proven green" exactly when a proof is failing.
- Lesson: every consumer of proof state uses worst-of (`every(green)`), never any-of. The headline
  number reviewers trust must be the strictest one.
- Promoted to: OPEN → task FIX-PRMATH-01

## 2026-06-11 Parser must respect markdown reality  ⟨P2⟩
- Trigger: review #11/#12/#13/#14 (confirmed): fenced code blocks become real requirements; blank-
  line-separated EARS sentences merge into one criterion; bulleted/orphan `@check` lines silently
  drop; `--mode bogus` accepted; `log -n 0` prints everything.
- Lesson: silent loss of a proof obligation is the worst parser failure — fence-track, flush on
  blank lines, strip list markers, warn on orphans, validate enums and numbers.
- Promoted to: OPEN → task FIX-PARSE-01

## 2026-06-11 Read-only must be read-only; retries must not burn deterministic reds  ⟨P2⟩
- Trigger: review #15/#10/#9: `trace`/`affected`/`drift --dry-run` rewrite graph.json or trigger
  re-index; TDD's expected red burns retryLimit+1 full Maven runs; equal-timestamp results resolve
  by iteration order.
- Lesson: queries take a no-write path; retry only on suspected flakiness (or `--expect-red` for
  TDD); tie-break proofs deterministically toward the worse state.
- Promoted to: OPEN → task FIX-QUERY-01

## 2026-06-11 Scale & evidence quality backlog  ⟨P3⟩
- Trigger: review #16-#19: full journal re-fold per command while audit events balloon the file;
  red proofs carry no failure output; test anchors collide on same-named classes; concurrent
  worktree waves can interleave journal writes and last-writer-wins graph.json.
- Lesson: snapshot+tail folding; gate audit to mutating commands or honor memory.journal=
  "milestones"; capture truncated failure tails in CheckResult; anchor by source path; file locking
  before parallel waves ship.
- Promoted to: OPEN → backlog (pre-P5 parallelism prerequisite)

## 2026-06-11 Verification and review catch DIFFERENT bug classes — keep both
- Trigger: during construction, bound checks caught 3 real bugs (stale Boot-3 import, ANSI-split
  assertion, worst-of rollup); the adversarial review then found 20 MORE confirmed issues the
  checks could not see (semantics, robustness, bypasses).
- Lesson: evidence-bound done ≠ reviewed. The rivet-review skill's two-pass doctrine is load-
  bearing, not ceremony; schedule adversarial review at feature boundaries.
- Promoted to: constitution candidate — "every feature gets an adversarial review pass before PR"
  (awaiting Pratiyush's approval)

## 2026-06-11 The 17-gate proposal: menu yes, mandate no
- Trigger: ChatGPT proposed 17 mandatory sequential checkbox gates before any coding.
- Lesson: checkbox gates are enforcement-by-prose (tickable without truth) and mandatory ceremony
  recreates the over-ceremony death spiral our research documented. But its CONTENT is valuable:
  NFR/security/threat-model/API+data-contract checklists, AI metadata in the audit trail.
- Promoted to: OPEN → task GATE-PACKS-01 (named packs in config — security/contracts/nfr/rollback —
  required spec sections + check kinds + approvals, attached per routing mode, off by default) and
  task AUDIT-META-01 (journal records model/agent + context sources per event).
