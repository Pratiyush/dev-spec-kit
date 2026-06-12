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

## 2026-06-12 Test fixtures must pin every git assumption the host can override
- Trigger: WAVE-01's fixture broke twice on this machine's `init.defaultBranch=master` — a push
  refspec assumed a local `main`, and a bare origin's HEAD pointed at a branch we never pushed.
- Lesson: fixtures that shell out to git must pin branch names (`init -b`, `push HEAD:<branch>`),
  identity, and HEAD explicitly — host config is part of the environment under test.
- Confidence: high (two failures, same cause) · Scope: global (applies to any repo's git fixtures)
- Promoted to: check:test/wave.test.ts (the fixture itself now pins -b main + HEAD:main)

## 2026-06-12 The journal must not stale its own proofs
- Trigger: first self-graph of the rivet repo — drift re-proved 3/3 PASS yet all stayed STALE
  forever: recording a proof appends to the tracked journal, which changed the tree-hash the proof
  was compared against. The bookkeeping invalidated the evidence it was keeping.
- Lesson: proof identity = the CODE tree only. Build a temp index from HEAD, drop .rivet/, add the
  working state (now INCLUDING untracked files — closes the stash-create blind spot), write-tree.
  A system whose act of measurement changes the measurement is not a measurement system.
- Confidence: high (reproduced live; permanent regression test) · Scope: project
- Promoted to: check:test/proof-identity.test.ts (FIX-PROOF-02 — journal-append keeps identity,
  code change moves it, untracked files count; drift now converges 3/3 green on this very repo)

## 2026-06-11 Doctor's graphify install hint reads as a typosquat to security tooling
- Trigger: dogfooding the notepad app — `rivet doctor` flags graphify as the only required red with
  hint `pip install graphifyy && graphify install`. Claude Code's permission classifier auto-DENIED
  the command as "agent-chosen, typosquat-looking package … untrusted external code execution"
  (PyPI name 'graphifyy' ≠ CLI name 'graphify'), so an agent cannot self-heal doctor's one required
  prerequisite; setup stalls on a human.
- Lesson: a name-mismatched install hint is indistinguishable from a supply-chain attack to policy
  bots and cautious humans. Options: publish under the CLI's own name, state provenance in the hint
  ("graphifyy is Rivet's companion package — <repo url>"), let doctor accept a vendored/bundled
  graphify path, or degrade gracefully (graph features off with a clear enable message) instead of
  a required red.
- Confidence: medium (one environment, but the classifier's reasoning generalizes)
- Scope: project
- Promoted to: check:test/doctor-fix.test.ts (HARDENED via FIX-DOCTOR-01 — graphify is optional-with-consequences in doctor, never a required red; install hint carries provenance + source repo + 'optional' framing so classifiers and humans can trust it)

## 2026-06-11 "Stack" names two disjoint enums — config rejects the runner vocabulary
- Trigger: dogfooding the notepad setup — the project brief says "stack node-vitest" (matching
  `check run --stack` / BUILTIN_STACKS in engine/verify/runner.ts), but `project.stacks` in
  config.json is a different enum (java-maven|…|node|typescript|react|…). Setting
  `"stacks": ["node-vitest"]` fails EVERY command with an enum error whose valid values share no
  overlap with runner ids and no pointer to where runner stacks actually live.
- Lesson: one word naming two disjoint enums guarantees mis-filing by users and agents alike.
  Either unify/rename (e.g. `project.stacks` → `project.platforms`, runner ids stay "stacks"), or
  make the config error disambiguate: "node-vitest is a RUNNER stack — pass it to `check run
  --stack` or configure verify.runners; project.stacks describes the codebase (typescript, react…)".
- Confidence: high (reproduced; the project's own brief conflates the two)
- Scope: project
- Promoted to: check:test/stacknames.test.ts (HARDENED via FIX-STACKNAMES-01 — project.stacks renamed to project.platforms (legacy key ignored harmlessly); filing a runner stack there now yields a disambiguating error pointing to `check run --stack` / verify.runners)

## 2026-06-12 The printed proof stamp showed HEAD, not the proof's identity
- Trigger: dogfooding the notepad vault feature — a TDD red and its green ran against DIFFERENT
  code (stub → implementation, both uncommitted) yet both printed "@ 9aa40ae2": checkRun stamped
  `result.sha` (HEAD) while the journal correctly recorded distinct `tree` hashes. Cost a live
  P1-scare detour into the journal to rule out a proof-identity regression.
- Lesson: every printed identity must be the SAME identity the system reasons with (FIX-PROOF-01/02
  made that the tree) — a stale-but-familiar id invites false bug reports and, worse, false
  confidence. Related: the PR-body stamp (workflow.test.ts pins "@ abc12345") may deserve the same
  treatment.
- Confidence: high (reproduced live; permanent test)
- Scope: project
- Promoted to: check:test/proof-display.test.ts::stamps the tree identity, not the commit sha
  (FIX-PROOF-03 — red→green through Rivet's own done-gate; stamp = "tree <hash8>" + "*" dirty
  marker, sha only as legacy fallback; landed in commit 96ce52a authored by Pratiyush)

## 2026-06-12 Provenance lines must not pin facts that rot (or were never true)
- Trigger: FIX-DOCTOR-01's improved graphify hint says "Source: github.com/safishamsi/graphify
  (213k★)" — live GitHub API shows the repo is real but has ~65.6k stars. An inflated number
  inside the very line meant to establish trust undercuts it; star counts hardcoded in CLI
  strings are stale the day they ship.
- Lesson: provenance = verifiable pointers (URL, package name, owner), never point-in-time
  vanity metrics. If popularity matters, phrase it un-rottably ("65k+ stars as of 2026-06") or
  let the reader click. (The repo itself checks out — graphifyy install is trustworthy.)
- Confidence: high (checked via GitHub API live)
- Scope: project
- Promoted to: check:test/doctor-fix.test.ts::pins no point-in-time vanity metrics (HARDENED via
  FIX-PROV-01 — hint is verifiable pointers only; revitify-first wording landed with FEAT-REVITIFY-01)

## 2026-06-12 PR body and LEDGER still stamp commit sha (anticipated tail of the proof-display lesson)
- Trigger: finishing vault-persistence in the notepad — `rivet pr` emitted "proven green (100%) at
  `3311f7bb`" and LEDGER.md rows print "@ 6903f20f" (bare commit shas) while every proof in the
  journal is identified by tree (`70786fd1`). Harmless this run (tree was clean, so sha↔tree map
  1:1), but on any dirty-tree run these surfaces repeat the exact misdirection FIX-PROOF-03 cured
  in the CLI stamp.
- Lesson: "printed identity = the identity the system reasons with" wasn't applied to all
  printers — when changing an identity scheme, sweep every surface that renders a proof (PR body,
  LEDGER.md, TRACKING.md, dashboards), not just the surface that triggered the report.
- Confidence: high (observed live; .rivet/pr-body.md + LEDGER.md on notepad branch worktree-vault-07-08)
- Scope: project
- Promoted to: check:test/proof-display.test.ts::FEAT-PROOF-04 sweep (HARDENED via FIX-PROOF-04 —
  shared engine/verify/stamp.ts renders tree+dirty in PR body, approvals, audit log/LEDGER;
  workflow.test.ts pin updated to tree identity)

## 2026-06-12 A broken session must cost zero re-orientation  ⟨P2⟩
- Trigger: the notepad dogfood session died mid-batch on connectivity; `rivet status` + `rivet
  resume` + the journal re-oriented a fresh session losslessly — twice in one day — but only
  because a human knew to run them first.
- Lesson: "resume-first after any break" is tool knowledge, not human knowledge — the workflow and
  finish skills must state it as a hard first step so any agent session starts from recorded truth.
- Confidence: high (two live recoveries) · Scope: project
- Promoted to: skills/rivet-workflow + rivet-finish hard rules (HARDENED via FEAT-VERIFY-01 —
  resume-first is step zero in both; skill-qa enforces the files stay real)

## 2026-06-12 Requirement ids are read by humans out of context — they must self-describe
- Trigger: Pratiyush, reading boards/PR bodies from the notepad run: "Don't use R-VAULT etc — use
  FULLY QUALIFIED NAMES." `R-` carries zero meaning to anyone who didn't write the parser.
- Lesson: ids travel without their spec (PR bodies, LEDGER, dashboards, chat). The prefix must
  carry the noun: REQUIREMENT_VAULT-01, NFR_PERF-01, ADR_STORAGE-01. Enforce as a lint
  (configurable warn|error|off) — never break parsing of old specs.
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/qualified-ids.test.ts (HARDENED via FEAT-IDS-01 — REQUIREMENT_/NFR_/ADR_
  prefixes, configurable lint, ADR exempt; own spec migrated and re-proven)

## 2026-06-12 Edge-case coverage mandates in prose are ignorable — make absence detectable
- Trigger: Pratiyush: "Use Gherkin test cases but cover more ground — 100%, edge cases etc,
  every test has to be very solid." The spec-author skill already says "hunt unhappy paths";
  nothing notices when a spec ships without a single failure criterion.
- Lesson: a requirement with zero negative/failure criteria is an UNVERIFIED-shaped hole the
  graph must flag, exactly like an unbound criterion. Gherkin (Scenario + Scenario Outline with
  Examples) becomes first-class and the default; the floor is mechanical, on everywhere.
- Confidence: high (direct user feedback + matches FLOOR-C instinct) · Scope: project
- Promoted to: check:test/gherkin.test.ts (HARDENED via FEAT-GHERKIN-01 — Scenario + Outline/Examples
  expansion, gherkin default, off-format lint, gates.negativeFloor on everywhere; own spec grew
  negative criteria incl. a Gherkin failure Scenario)

## 2026-06-12 A green task is not a green project — "Build ALL + run ALL kinds" needs one command
- Trigger: Pratiyush: "Build ALL. Run All Type Test." Tasks prove their bound checks; nothing
  proves the whole tree builds and every configured kind passes before a PR.
- Lesson: one journaled `rivet verify` (build + every kind, full suites, report-all) carrying the
  code-tree hash is the only honest PR precondition — and it must be a hard gate in guard-pr
  (green + same tree), not skill prose.
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/verify-cmd.test.ts (HARDENED via FEAT-VERIFY-01 — rivet verify runs
  build+ALL kinds report-all, journaled with tree hash; verifyVerdict hard-gates guard-pr/pr;
  hook gains the exists+green fast veto)

## 2026-06-12 Post-task evidence must be scannable — table, not prose
- Trigger: Pratiyush: "Tabular format of report after task." `task done` prints a progress bar;
  the actual evidence (which checks, what kind, what proof, which tree) is in the journal where
  nobody looks.
- Lesson: the moment of "done" is when evidence must be shown: a 📋 table (Check | Kind | State |
  Proof | Proven at) in the terminal AND persisted per-task in LEDGER.
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/task-report.test.ts (HARDENED via FEAT-REPORT-01 — 📋 table at task done
  + persisted per-task in LEDGER, stale-honest, tree-stamped)

## 2026-06-12 Emoji are an event-type grammar — central map with a plain fallback
- Trigger: Pratiyush: "Use more emojis, at least 6-10 more types." Current emoji are scattered
  string literals; adding types means hunting call sites, and CI logs can't opt out.
- Lesson: one emoji map keyed by event type (≥10 new: 🧪📋🧭✍️📦⏱️♻️🧰🔍🚀📝🧹), every renderer
  reads it, and !TTY / NO_EMOJI=1 / --plain degrade to ASCII labels so logs stay greppable.
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/emoji.test.ts (HARDENED via FEAT-EMOJI-01 — central map, 10 new types,
  --plain/NO_EMOJI/TTY degradation, LEDGER legend)

## 2026-06-12 Init must seed standards, not just folders — per-platform law packs
- Trigger: Pratiyush: "If project is initialized, add best practices for different types of
  projects — TypeScript and Electron, and multiple langs can be used in a project." Today
  `rivet init` writes config + an empty laws file; quality standards stay in the human's head.
- Lesson: `init --platforms` seeds scoped law packs (TypeScript/Electron/Java/Python/
  quality-gates/polyglot), 100% free/OSS tools, each ending with "Bind these as Rivet checks"
  wiring — standards arrive pre-wired to enforcement, and platforms is an ARRAY (polyglot is
  normal, not an edge case).
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/init-practices.test.ts (HARDENED via FEAT-INITPACKS-01 — init --platforms
  seeds scoped law packs (ts/electron/java/python/quality-gates/polyglot), free/OSS-only, check
  wiring included; this repo self-adopted: ESLint+Prettier+lint-staged, lint as a verify kind)

## 2026-06-12 The graph layer must not depend on someone else's pip package
- Trigger: Pratiyush: clone github.com/safishamsi/graphify and create a modular TS counterpart
  named **revitify**. Root cause chain: doctor's graphify hint already burned us twice
  (typosquat-looking install auto-DENIED; star count rotted) — the dependency itself is the
  liability, not just its hint.
- Lesson: anything moat-adjacent (the visual/queryable graph) needs a native, in-repo provider.
  revitify = packages/revitify workspace pkg, same output contract as graphify (graph.json /
  graph.html / GRAPH_REPORT.md) so the engine swaps providers invisibly; external graphify stays
  available behind config for those who want its full multi-modal power.
- Confidence: high (two prior lessons + direct instruction) · Scope: project
- Promoted to: check:packages/revitify/test/revitify.test.ts (HARDENED via FEAT-REVITIFY-01 —
  native TS provider, graphify output contract proven against loadCodeGraph, provider config,
  445 code nodes self-hosted; upstream pinned in packages/revitify/.track @ 0.8.38/#1271)

## 2026-06-12 Depth on one harness beats breadth — say it out loud
- Trigger: Pratiyush: "Focus it for only Claude Code now, later we extend it."
- Lesson: docs/skills are already Claude-Code-only by construction; the README must SAY so
  ("Built for Claude Code first; other assistants later.") so contributors don't generalize
  early and dilute the hook/skill integration that is the moat.
- Confidence: high (direct user feedback) · Scope: project
- Promoted to: check:test/readme.test.ts::declares the Claude-Code-first focus explicitly
  (HARDENED via FEAT-CCFIRST-01)

## 2026-06-12 Piped CLI output swallows the exit code the gate depends on  ⟨P2⟩
- Trigger: this batch — `rivet check run … | tail -1` let a && chain continue past a FAILING
  check (tail exits 0), committing a broken test that only the done-gate caught one step later.
- Lesson: every scripted/agent invocation of gate-bearing commands must run with `set -o pipefail`
  (or capture status explicitly) — a gate whose exit code is eaten by a pipe is decoration.
- Confidence: high (reproduced live this session) · Scope: global (any shell automation)
- Promoted to: skills/rivet-workflow hard rule ("Scripted check runs MUST preserve exit codes") —
  HARDENED; the done-gate caught the slipped commit, the rule prevents the next one

## 2026-06-12 The done-gate accepted STALE evidence  ⟨P1 · found by our own 📋 table⟩
- Trigger: closing FEAT-REVITIFY-01 this batch — the new per-task evidence table printed the bound
  proof as 🟣 stale (tree had moved between the run and `task done`) yet the gate said DONE:
  markDone only asks "is there a passing run", never "does that run vouch for the CURRENT code".
- Lesson: worst-of must hold at the done-gate too — a pass recorded on an older tree is NOT green
  evidence for the code being declared done. Block (or done-with-warnings under
  verify.blockDoneOnFail=false) and tell the human exactly which refs to re-run.
- Confidence: high (observed live in this session's own output) · Scope: project
- Promoted to: check:test/stale-done.test.ts (FIX-STALEDONE-01, this session)

## 2026-06-12 Untracked reference material must be gitignored the moment it lands  ⟨P2⟩
- Trigger: a routine `git add -A` swept `_ref/` (9 embedded reference repos!) and `.claude/` into a
  release commit; caught by the embedded-repo warnings and amended out.
- Lesson: "untracked but precious" is a trap — anything meant to stay out of history gets its
  .gitignore line in the SAME change that creates it, never later.
- Confidence: high (live near-miss) · Scope: global
- Promoted to: .gitignore (_ref/, .claude/worktrees/, .claude/settings.local.json) — structural;
  the class is covered by this entry + memory note for future sessions.

## 2026-06-12 A relative file: dependency breaks every worktree  ⟨P2 · found mid-fix⟩
- Trigger: pnpm install inside the batch worktree failed — `file:../revitify` resolves relative to
  the INSTALLING dir, so from `.claude/worktrees/<name>/` it points at a void. Rivet's own wave
  dispatch (one worktree per task) would hit this on every parallel task.
- Lesson: location-relative dependencies and worktree-based parallelism are structurally at odds;
  a machine-local sibling dep must be an ABSOLUTE file: path (it was already machine-local by
  choice — the relative form only pretended to be portable).
- Confidence: high (reproduced live) · Scope: global (any repo pairing file: deps with worktrees)
- Promoted to: package.json (link:/Users/pratiyush/Github/revitify — pnpm's link: protocol; bare
  absolute file: mis-parses) + this entry; revisit at
  Phase E packaging when revitify ships to npm and the file: dep disappears entirely.

## 2026-06-12 The commit-time formatter stales every pre-commit proof  ⟨P2⟩
- Trigger: cockpit batch — lint-staged's `prettier --write` reformatted 4 staged files INSIDE the
  commit, so the committed tree differed from the tree drift had just proved; main landed with
  21/21 proofs stale despite an all-green pre-commit gauntlet.
- Lesson: prove against the bytes that will actually land — format BEFORE the final prove/verify
  (`npx prettier --write src test` then drift/verify), or expect one post-commit drift pass.
  A formatter in the commit path is a tree-mover like any other edit.
- Confidence: high (observed live; mechanism certain) · Scope: global (any repo with staged formatters)
- Promoted to: skills/rivet-workflow hard rule (this entry) — "format before the final prove:
  commit-time formatters move the tree and stale fresh proofs"
