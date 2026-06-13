---
from: dogfood feedback + competitor/prompt review, 2026-06-13
status: plan for review — does NOT override _ref/PLAN-v2.md (that roadmap stands). This is a focused
        two-track plan banked from (a) a real dogfood run's feedback and (b) a fan-out review of the
        9 reference frameworks + leaked agent prompts under _ref/, cross-checked against the shipped
        code. Every item cites where it came from; items marked [SHIPPED] are done this session.
---

# Plan: the proof layer cannot lie or rot · the prompt layer drafts better — without becoming prompt-ware

Two tracks, one thesis. Rivet's moat (STRATEGY.md) is **verification-by-construction** split into a
durable **Engine** and a disposable **Prompt** layer. The dogfood run exposed holes in BOTH:
the Engine let a green proof mean nothing (T1), and the Prompt layer never delivers the test-drafting
the config promises (T2). Fixing T1 makes the green light honest; fixing T2 makes the agent produce
better, more descriptive tests — the input the honest gate then proves.

---

## 0. Shipped this session — [SHIPPED] FIX-TRUST-01/02 (proof trust)

The single most corrosive bug: a name-filtered check that matched **zero** tests exited 0, so the
runner minted a **green proof that proved nothing** — and a `-t <name>` whose name began with `-`
crashed the CLI (`CACError`), forcing test renames. Both fixed, dogfooded through Rivet's own loop
(spec → spec tasks → check run ×6 → gated task done → `verify` GREEN), full suite 293 green.
- `src/engine/verify/report.ts` (new): escape names into `--testNamePattern=` (equals form, regex-
  escaped); parse the jest/vitest JSON report; `interpretCheckRun` makes **0 executed tests a FAILURE**.
- `src/engine/verify/runner.ts`: equals-form name binding; verdict from the report, not the exit code;
  refuses to record a proof when a green can't be confirmed.
- The shared `report.ts` is the plumbing the batch path below reuses.

---

## Track 1 — the proof layer (from the dogfood feedback)

The meta-finding: drift was *structurally invisible* — 210 vitest-green while `trace` was 100%
unproven, because the cheap signal (vitest/`verify`) and the true signal (`trace`) were never forced
into one view, and the proof path cost ~20× the test path (73 cold `check run`s vs one 3 s `verify`).
A rational builder takes the cheap green path; the proof layer rots silently.

| # | Problem | Reality in code (verified) | Fix | Grounding |
|---|---|---|---|---|
| 1 | no proactive drift/spec lint | `drift`/`affected` exist (runtime); **no static always-on lint** | `rivet spec lint` + fold into `doctor` + pre-commit/Stop hook | OpenFastTrace status model; `graphify/validate.py`; `BMAD/validate-file-refs.js`; `OpenSpec --strict` |
| 2 | bad `-t` match silently passes (0 tests) | **was unhandled** | **[SHIPPED]** zero-match = fail | vitest docs; Devin "0 matched is a red flag" |
| 3 | `vitest -t` swallows `-`-names | partial mitigation only | **[SHIPPED]** equals-form + escape | vitest CACError repro |
| 4 | `task done` conflates "no proof" vs "stale binding" | `staleProofRefs` IS separate; message isn't | message: "stale — run `spec tasks`" vs "no passing proof" | dogfood |
| 5 | 20× depth tax (73 cold starts) | confirmed — `verify` stamps nothing per-criterion | **`rivet verify --stamp`**: one suite run → JSON `assertionResults[]` → stamp every bound criterion | no competitor does this (white space); vitest `--reporter=json` |
| 6 | CLI reads stdin in scripts | **no `process.stdin` reads in Rivet core** | none needed (guard the class via clig.dev `isTTY` if ever added) | clig.dev |
| 7 | `trace` (criteria) vs `status` (tasks) disagree | confirmed two surfaces | auto-advance a task when its last bound ref goes green (DoD automation) | GitHub 2025 "merge ≠ done" toggle |
| 8 | config says `tool-drafts` but no drafter | confirmed (see Track 2) | `rivet spec draft-tests` | Kiro EARS; spec-kit SpecTest |

**T1 build order:** (P0) `verify --stamp` — kills the 20× tax, the drift engine. (P0) static `spec lint`
(OFT `ORPHANED`=dangling ref / `UNCOVERED`=criterion-with-no-test, non-zero exit) folded into `doctor`
+ a pre-commit/Stop hook so green-tests-empty-trace can't persist. (P1) `task done` message clarity.
(P2) task auto-advance / surface reconciliation.

---

## Track 2 — the LLM / prompt / agent layer (the new ideas for review)

Rivet already does the **hard** prompt thing well: the skills (`skills/rivet-spec-author`,
`skills/rivet-workflow`) are written in disciplined **RFC-2119** — "Every criterion MUST be a Gherkin
Scenario… MUST carry ≥1 `@check`… the SHALL clause MUST be observable," "You MUST NOT mark a task
complete while any bound check is failing." That is the right register and matches the best leaked
prompts (Kiro's "The model MUST/SHOULD/MAY"). So the ask "follow MUST/SHOULD like Claude/other LLMs"
is **largely already met in the skills** — keep it, and extend it to the two places below.

### 2a. The unkept promise: `acceptanceCriteria: "tool-drafts"` has NO drafter — build `rivet spec draft-tests`
`config.json` defaults to *the tool drafts tests, you edit* — but there is **no command, template, or
prompt** that drafts anything (confirmed: the engine never materializes a draft; the agent authors
from scratch). This is the rule→test→proof loop the methodology rests on, with no scaffolding.

Build `rivet spec draft-tests`: for each unbound criterion, emit a **failing** test stub already bound
by a generated `@check`, plus a prompt that makes the draft *descriptive* — the user's "more
descriptive test cases / better results." Borrow concretely from `_ref`:
- **Kiro** EARS `WHEN/IF/WHILE [event] THEN the system SHALL [response]` → one assertion per criterion
  (`system-prompts/Kiro/Spec_Prompt.txt`).
- **spec-kit** `tasks-template.md`: "Write these tests FIRST, ensure they FAIL before implementation,"
  each task tagged `[US1]` back to its requirement (traceability built in).
- **superpowers** TDD skill: **good-vs-bad test examples** side by side ("clear name, tests real
  behavior, one thing" vs "tests mock not code") — this is what makes drafts descriptive.
- **BMAD** edge-case-hunter: the **4-category mandate** (happy · invalid input · empty/boundary ·
  failure-injection) so every draft includes negative + boundary cases, not just the happy path. Rivet
  already states this mandate in `rivet-spec-author`; draft-tests should *emit* it, not just ask for it.

### 2b. Do we need a specialized agent? — answer: a *few thin* ones, engine-orchestrated; NOT a persona zoo
Competitor contrast: **BMAD ships 12+ named agents** (Analyst/PM/Architect/Dev/UX/QA…) — that is
exactly the prompt-ware our anti-erosion thesis says *depreciates* as models improve (Agent OS retired
its layer for this reason). So the answer is **not** "copy BMAD's roster." But two *disposable,
engine-spawned, structured-output* sub-agents earn their keep:
- **test-author** — drives `draft-tests` (2a): reads a criterion, returns descriptive failing stubs.
- **layered reviewer** — adopt BMAD's *layered adversarial* review, which Rivet's `rivet-review`
  only gestures at: run **3 parallel lenses** (adversarial-general · edge-case-hunter · acceptance-
  auditor), each fresh-context, **no fixed issue quota** (STRATEGY already rejects BMAD's quota), and
  **"zero findings is suspicious → re-analyze"** (`BMAD/bmad-review-adversarial-general/SKILL.md`).
  Output a structured findings list, not prose.
Both stay *disposable* (spawned per-run, validated by the Engine) — consistent with "agents thin,
Engine fat." Keep them as ≤2 skills, not a 12-persona system.

---

## Track 3 — competitor coverage & honest drift (the comparison you asked for)

Condensed matrix (✅ full · 🟡 partial · ❌ none). Full per-cell notes in the research transcript.

| Capability | Rivet | spec-kit | OpenSpec | BMAD | task-master | agent-os | Kiro |
|---|---|---|---|---|---|---|---|
| Spec authoring (EARS/Gherkin) | ✅ | ✅ | ✅ | 🟡 | ❌ | 🟡 | 🟡 |
| Clarify / Q&A UX | 🟡 flags | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Executable verification (real exit codes) | ✅ | ❌ | ❌ | ❌ | 🟡 | ❌ | 🟡 PBT |
| Traceability graph + **proven edges** | ✅ | ❌ | 🟡 | ❌ | ❌ | 🟡 | ❌ |
| **Drift detection** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Evidence-bound task state | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ |
| Parallel orchestration | ✅ | ❌ | ❌ | ❌ | 🟡 | ❌ | ✅ |
| Graph-derived PR body | ✅ | 🟡 | 🟡 | ❌ | 🟡 | ❌ | ❌ |
| Layered review/QA | 🟡 | ❌ | ❌ | ✅ | 🟡 | ❌ | ❌ |
| Learning loop with teeth | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ | ❌ |
| Multi-agent roles | 🟡 | ❌ | ❌ | ✅ | 🟡 | ❌ | ❌ |
| MCP / tool server | 🟡 planned | ❌ | ❌ | ❌ | ✅ 36 tools | ❌ | 🟡 |

**Where competitors beat us (real gaps):** spec-kit's first-class **clarify** UX; BMAD's **layered
review** + agent roles; task-master's **MCP server** + **complexity scoring (1–10 → recommended
subtasks)**; OpenSpec's lighter **propose→apply→archive** iteration; Kiro's **property tests from
EARS**.

**Where we're uniquely ahead (no competitor has these):** proven edges (edge green only if its check
executed), **post-implementation drift detection**, evidence-bound `done` that physically refuses,
**tree-hash proof identity**, ceremony-proportional fast path, hook-level hard gates, journal that
can't be hand-claimed.

**Strategy-vs-reality drift — the honest part (tooling-honesty law).** Several capabilities the
STRATEGY/SYSTEM-DESIGN call moats are **not shipped**, and we should either build them or stop
claiming them:
- **`property` / `judge` check kinds** — claimed (SYSTEM-DESIGN §8) but absent from the `verify.kinds`
  schema. Kiro actually ships PBT; we don't.
- **clarify loop** — "reuses spec-kit's `/clarify`" (§4) but no `route --clarify` exists.
- **engine-orchestrated subagent dispatch** (§11) — no spawn mechanism ships.
- **complexity scoring / auto-split** (§5) — named, not built.
- **ADR auto-emit + architecture intelligence** (§6) — data model only.
- **learning-loop promotion** (§5 "bug → regression gate") — learnings captured, promotion manual.
→ Action: demote these to `[PLANNED]` in the docs (we already mark tooling honesty as law) and pick
the 1–2 worth building (property kind + clarify are the highest-leverage).

---

## Integrated roadmap (review-ready)

1. **P0 · `verify --stamp`** (T1.5) — one run stamps all criteria; removes the 20× drift engine.
2. **P0 · static `spec lint` + hook** (T1.1) — OFT model; makes drift loud, not discoverable-only.
3. **P0.5 · tooling-honesty pass** (T3) — demote unshipped moats to `[PLANNED]`; the board can't lie,
   nor can the README.
4. **P1 · `rivet spec draft-tests`** (T2a) — the rule→test loop the config promises; descriptive stubs
   (EARS + 4-category + good/bad examples), each bound by a generated `@check`.
5. **P1 · layered reviewer sub-agent** (T2b) — 3 lenses, no quota, zero-findings-suspicious.
6. **P1 · `task done` message clarity** (T1.4); **P2 · task auto-advance** (T1.7).
7. **P2 · pick from the gap list** — `property` kind (match Kiro) and/or clarify UX (match spec-kit).

Sequencing rationale: 1–2 flip the default outcome from "drifts" to "stays proven"; 3 keeps us honest
while we close gaps; 4–5 are where better prompts/agents buy **more descriptive tests + harder review**
without drifting into prompt-ware (each is thin, disposable, and feeds the durable gate).
