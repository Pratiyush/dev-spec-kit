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
- Promoted to: check:test/proof-identity.test.ts (HARDENED via FIX-PROOF-01 — proofs carry
  tree+dirty; staleness compares trees with sha fallback for legacy entries; with tree identity a
  dirty green is sound, so no provisional state was needed)

## 2026-06-11 The spec→gate link must never freeze or clobber  ⟨P1⟩
- Trigger: review #2/#3 (confirmed): `spec tasks` skips existing tasks so NEW `@check` obligations
  are never enforced; bare `task create` on an existing id resets status and wipes recorded proofs.
- Lesson: the spec is only the source of truth if re-derivation diffs bindings into existing tasks,
  and `task.created` folds as create-if-absent — recorded evidence must be unclobberable.
- Promoted to: check:test/spec-sync.test.ts (HARDENED via FIX-SPECSYNC-01 — create() refuses duplicates, fold is create-if-absent, syncBindings diffs spec refs in and reopens done tasks with new obligations)

## 2026-06-11 User-editable inputs must never crash; infra errors are not test failures  ⟨P1⟩
- Trigger: review #4/#8/#5 (confirmed): malformed config.json or a data-less journal line → raw
  stack traces across commands; missing runner binary (ENOENT, status null) recorded as a RED proof.
- Lesson: parse all inputs defensively with one helper + clear message; spawn errors/status null are
  tooling errors, never proofs — they must not enter the graph.
- Promoted to: check:test/robust.test.ts (HARDENED via FIX-ROBUST-01 — one defensive loadConfig + safe() CLI wrapper, data-less journal lines tolerated, RunnerUnavailableError instead of fake red proofs; timeout stays a red proof)

## 2026-06-11 All gates must share one predicate, and absence of state must block  ⟨P1⟩
- Trigger: review #6 (confirmed bypasses): `gh "pr" create`, `$GH pr create`, `gh api …/pulls`, and
  `rm .rivet/graph.json` all sail past the guard; `rivet pr` blocks red/stale but not unproven —
  three gates, three different predicates.
- Lesson: one shared rule — "anything not green blocks" — applied by the hook, `guard pr`, and
  `rivet pr` alike; in a Rivet project a MISSING graph blocks (state absence ≠ permission);
  `rivet pr --create` must run the same guard it advertises.
- Promoted to: check:test/gate.test.ts (HARDENED via FIX-GATE-01 — shared gateVerdict across hook/guard/pr, missing or unreadable graph BLOCKS, quote-stripped matcher + gh api …/pulls; $VAR indirection documented as known limit)

## 2026-06-11 Worst-of obligation semantics everywhere — including the PR headline  ⟨P1 · quick⟩
- Trigger: review #7 (confirmed): PR body counts a criterion proven if ANY binding is green; one
  green + one red reports "100% proven green" exactly when a proof is failing.
- Lesson: every consumer of proof state uses worst-of (`every(green)`), never any-of. The headline
  number reviewers trust must be the strictest one.
- Promoted to: check:test/workflow.test.ts::worst-of coverage in the PR body (HARDENED via FIX-PRMATH-01)

## 2026-06-11 Parser must respect markdown reality  ⟨P2⟩
- Trigger: review #11/#12/#13/#14 (confirmed): fenced code blocks become real requirements; blank-
  line-separated EARS sentences merge into one criterion; bulleted/orphan `@check` lines silently
  drop; `--mode bogus` accepted; `log -n 0` prints everything.
- Lesson: silent loss of a proof obligation is the worst parser failure — fence-track, flush on
  blank lines, strip list markers, warn on orphans, validate enums and numbers.
- Promoted to: check:test/parse-fix.test.ts (HARDENED via FIX-PARSE-01 — fences invisible, blank lines separate criteria, bulleted @checks bind, orphan @checks WARN, assertMode + parseCount validate inputs)

## 2026-06-11 Read-only must be read-only; retries must not burn deterministic reds  ⟨P2⟩
- Trigger: review #15/#10/#9: `trace`/`affected`/`drift --dry-run` rewrite graph.json or trigger
  re-index; TDD's expected red burns retryLimit+1 full Maven runs; equal-timestamp results resolve
  by iteration order.
- Lesson: queries take a no-write path; retry only on suspected flakiness (or `--expect-red` for
  TDD); tie-break proofs deterministically toward the worse state.
- Promoted to: check:test/query-fix.test.ts (HARDENED via FIX-QUERY-01 — materialize(write:false) for trace/affected/dry-run, --expect-red skips retry burn, equal-timestamp ties break toward the worse proof)

## 2026-06-11 Scale & evidence quality backlog  ⟨P3⟩
- Trigger: review #16-#19: full journal re-fold per command while audit events balloon the file;
  red proofs carry no failure output; test anchors collide on same-named classes; concurrent
  worktree waves can interleave journal writes and last-writer-wins graph.json.
- Lesson: snapshot+tail folding; gate audit to mutating commands or honor memory.journal=
  "milestones"; capture truncated failure tails in CheckResult; anchor by source path; file locking
  before parallel waves ship.
- Promoted to: check:test/scale.test.ts (HARDENED via SCALE-01 — withLock mkdir-mutex with stale-steal serializes journal appends across real processes; per-process (size,mtime)-keyed read cache; red proofs carry a 1500-char output tail; same-label code nodes each get anchor edges (ambiguity visible); memory.journal='milestones' skips read-only cli.run noise. Durable snapshot+tail folding deferred until journals measurably grow.)

## 2026-06-11 Verification and review catch DIFFERENT bug classes — keep both
- Trigger: during construction, bound checks caught 3 real bugs (stale Boot-3 import, ANSI-split
  assertion, worst-of rollup); the adversarial review then found 20 MORE confirmed issues the
  checks could not see (semantics, robustness, bypasses).
- Lesson: evidence-bound done ≠ reviewed. The rivet-review skill's two-pass doctrine is load-
  bearing, not ceremony; schedule adversarial review at feature boundaries.
- Promoted to: constitution#hard-rules — "every feature gets an adversarial review pass before PR"
  (APPROVED by Pratiyush 2026-06-11; recorded in .rivet/constitution.md)

## 2026-06-11 The 17-gate proposal: menu yes, mandate no
- Trigger: ChatGPT proposed 17 mandatory sequential checkbox gates before any coding.
- Lesson: checkbox gates are enforcement-by-prose (tickable without truth) and mandatory ceremony
  recreates the over-ceremony death spiral our research documented. But its CONTENT is valuable:
  NFR/security/threat-model/API+data-contract checklists, AI metadata in the audit trail.
- Promoted to: check:test/gate-packs.test.ts + check:test/audit-meta.test.ts (BOTH HARDENED — packs ship as editable config defaults, security trigger floors the mode, graph build enforces sections+kinds; journal meta + governance events landed). Its artifact
  taxonomy (business/tech spec split, ADR, API+data contracts, test strategy) folds into
  pack-required spec sections; ADR is already a VTG node type; "AI Execution Plan" = our task DAG.
  Its "no code before tests" ordering: already stronger in Rivet (bindings at spec time, mechanical).

## 2026-06-11 Gates can FORCE investigation, not just block (ECC GateGuard)
- Trigger: ECC's DENY→FORCE→ALLOW gate ships A/B evidence (gated 9.0 vs ungated 6.75): blocking the
  first edit until the agent gathers named facts (importers, schemas, verbatim instruction) changes
  the output, because "the investigation itself creates context."
- Lesson: Rivet's guards should be able to demand evidence-gathering before retry — not only refuse.
- Promoted to: check:test/gate-facts.test.ts (HARDENED via GATE-FACTS-01 — DENY→FORCE→ALLOW in guard-facts.mjs + engine/facts.ts; opt-in gates.facts='on'; 30-min window; 500-entry bounded state)

## 2026-06-11 Protect the gates from the agent (anti-gaming)
- Trigger: ECC `pre:config-protection` blocks edits to linter configs ("fix code instead of weakening
  configs"). Rivet today lets an agent edit a bound test or spec mid-task to turn red green.
- Lesson: while a task is in flight, edits to its spec criteria, bound test files, and gate config
  require an explicit human-approved unlock — the moat must not be editable by the thing it gates.
- Promoted to: check:test/protect.test.ts (HARDENED via GATE-PROTECT-01 — specs/config immutable while tasks in flight; bound test files lock AFTER their ref goes green (pre-green TDD stays free); human escape hatch `rivet unlock` is time-boxed + journaled)

## 2026-06-11 Gate packs: tier classifier + phase mask + security floor + YAML rules
- Trigger: ECC orch-pipeline (trivial/small/standard/large → phase masks; "anything touching a
  security trigger or public API is AT LEAST standard"; two named human gates; "gated, not
  autonomous") + hookify-rules (markdown rules: event/pattern/conditions/action warn|block,
  verb-first names) — our GATE-PACKS-01 design, independently convergent and field-tested.
- Lesson: adopt this exact shape: routing tier picks the phase mask; security triggers floor the
  tier; packs are user-editable rule files, not code.
- Promoted to: check:test/gate-packs.test.ts (HARDENED via GATE-PACKS-01 — packs as config data: sections+kinds+triggers; security floor in route; enforcement in graph build; require empty by default)

## 2026-06-11 Journal upgrades: governance events + "confidence is not approval"
- Trigger: ECC decision-ledger (decision marks, coherence vs prior entries, promotion-gate results)
  + governance-capture hook (secrets/policy-violation/approval-request as first-class events) +
  provenance schema (source/created_at/confidence/author required on anything learned).
- Lesson: journal event taxonomy should include governance kinds; learnings carry confidence +
  evidence and promotion requires beating the incumbent, never self-declared confidence.
- Promoted to: check:test/audit-meta.test.ts (HARDENED via AUDIT-META-01 — EventMeta actor/model/sources on journal events, cli.run stamped with git user/RIVET_MODEL, governance first-class event type 🛡️, unlock journals as governance; pack-seeded content remains with GATE-PACKS-01)

## 2026-06-11 Finishing ritual + phase chaining (superpowers)
- Trigger: finishing-a-development-branch (fresh test-evidence entry gate; fixed 4-option menu;
  typed confirmation to discard; provenance check before cleanup) + every phase skill pins its sole
  successor + checklists compile into tracked tasks, not prose.
- Lesson: Rivet needs a completion ritual skill with evidence-gated entry and option-conditional
  cleanup; skills should name their one successor so phases can't be silently skipped.
- Promoted to: check:test/finish-skill.test.ts (HARDENED via FINISH-RITUAL-01 — skills/rivet-finish: fresh-evidence entry gate via rivet graph build, fixed 4-option menu, typed `discard`, provenance-checked cleanup, journaled landing)

## 2026-06-11 Skill integration: COMPOSE, don't vendor (superpowers + ECC, both MIT)
- Trigger: full catalog inventory — superpowers 14 skills, ECC 262 skills/64 agents/84 commands
  (~230 are stack packs & domain verticals, consciously skipped). Both MIT; adaptation as original
  prose unencumbered. Independent pass confirmed all five prior promotions (GATE-FACTS/PROTECT/
  PACKS-01, AUDIT-META-01, FINISH-RITUAL-01).
- Lesson: Rivet is the enforcement/traceability layer; generic craft (brainstorming, systematic-
  debugging, worktrees, parallel dispatch, TDD craft) stays in superpowers — recommend alongside,
  never duplicate. Absorb only mechanics that strengthen the moat. Net-new from this pass:
  review content (silent-failure hunt, behavioral-vs-line coverage, verify-feedback-before-
  implementing), retro instinct mechanics (confidence, project/global scope, promote on 2+ project
  recurrence), phase-aware compaction, and compliance-QA of our own skills.
- Promoted to: DONE this pass → rivet-review + rivet-retro skill enhancements + README pairing note;
  check:test/compact.test.ts + check:test/skill-qa.test.ts (BOTH HARDENED — phaseBoundary + renderResume + rivet resume + PreCompact resume-save.mjs hook + 💾 checkpoint hint at 100%; structural skill QA validates frontmatter, RFC-2119 teeth, and that every referenced command/artifact exists — it caught a bare .rivet/ ref on first run. LLM-judged compliance scenarios remain a future layer.)

## 2026-06-12 A grammar that can't spell its own kinds drops obligations silently
- Trigger: RUNNERS-01's kind-resolution test failed — CHECK_LINE's kind pattern was [a-z]+, so
  `kind=e2e` (digit!) never matched and e2e bindings had parsed as PROSE since day one. No error,
  no warning: the obligation just vanished.
- Lesson: grammar character classes must be derived from the actual vocabulary (e2e has a digit);
  every enum the parser accepts needs at least one test using its trickiest member.
- Confidence: high (reproduced; permanent test) · Scope: project
- Promoted to: check:test/runners-kind.test.ts (kind=e2e resolution is now asserted forever)
