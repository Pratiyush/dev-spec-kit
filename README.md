# dev-spec-kit

> Spec-driven development with a **Verified Traceability Graph** — every requirement bound to a passing check.

dev-spec-kit is a spec-driven development tool you drive from **Claude Code** (Spec-Kit-compatible layouts).
Built for Claude Code first; other assistants later.
It turns a request into **EARS** acceptance criteria with `@check` bindings, derives evidence-bound
tasks, and — unlike every other SDD tool — **proves** the requirement → code → test → PR edges with
real executed checks. A task physically cannot be marked done while a bound check is failing or
unrun. Proofs carry the **tested tree-hash**, so committing tested code keeps them green while
changed code goes stale — **drift** you can see and fix with one command.

Built on [graphify](https://github.com/safishamsi/graphify) (the code knowledge graph) — dev-spec-kit
overlays the proven spec/test/PR edges and their traffic-light states on top.

**Status:** v0 — fully usable from source; npm publish as **`dev-spec-kit`** is deferred until the
app-dogfood phase completes (see `.dev-spec-kit/DEFER.md`).

## The loop

```bash
dev-spec-kit route "add idle session expiry"        # front door: research | quick | full-spec (+ security floor)
# write .dev-spec-kit/specs/sessions.md — EARS + @check bindings
dev-spec-kit spec tasks                              # spec → evidence-bound tasks (re-derive syncs bindings)
dev-spec-kit task start R-AUTH-03
dev-spec-kit check run R-AUTH-03 "SessionTest#idle" --stack java-maven --expect-red   # TDD red, journaled
# implement…
dev-spec-kit check run R-AUTH-03 "SessionTest#idle" --stack java-maven               # green proof @ tree-hash
dev-spec-kit task done R-AUTH-03                     # THE GATE — refuses without green proofs
dev-spec-kit verify --stamp --advance                # prove EVERY bound criterion in ONE suite run, then
                                              # auto-advance fully-proven tasks (the fast path)
dev-spec-kit spec lint                               # static drift: orphaned @check refs (also a pre-commit gate)
dev-spec-kit graph build                             # Verified Traceability Graph + boards (exit 1 on drift)
dev-spec-kit drift                                   # re-verify anything stale/red in one move
dev-spec-kit approve R-AUTH-03 --note "ship it"      # human gate as a signed artifact
dev-spec-kit pr --title "Session expiry"             # graph-derived PR body (+ blast radius); guard blocks non-green PRs
```

## What's inside

- **Hard gates (PreToolUse hooks):** PR creation blocked unless every proof is green (missing graph
  blocks too) · in-flight specs/tests/gate-config are tamper-protected (`dev-spec-kit unlock` = journaled,
  time-boxed escape hatch) · opt-in DENY→FORCE→ALLOW investigative gate · PreCompact auto-saves
  `RESUME.md`.
- **Verification & drift:** `dev-spec-kit verify --stamp` proves EVERY bound criterion from ONE suite run
  (no per-criterion cold starts); `--advance` auto-advances fully-proven tasks. `dev-spec-kit spec lint`
  statically catches orphaned `@check` refs (renamed/moved tests) — folded into `dev-spec-kit doctor`, a
  pre-commit gate, and a Stop hook. `dev-spec-kit spec draft-tests` scaffolds a failing, bound stub per
  unbound criterion. `dev-spec-kit graph build` flags circular `dependsOn` chains.
- **The `judge` kind:** an LLM verdict for the genuinely-unmeasurable (tone, error-copy
  actionability, a transcript vs a rubric) — recorded as a **second-class** proof (rendered
  `⚖️ judged`, never an executed green) and **blocked on full obligations** by default. Default
  **harness** mode is free (the Claude Code agent supplies the verdict, no API key); optional
  **api** mode calls a small Anthropic model headlessly.
- **Config-driven policy engine:** ~40 knobs in `.dev-spec-kit/config.json` — TDD, flaky retries,
  kind-aware runners (`unit/integration/api/e2e/visual/parity/judge`), app spin-up lifecycle for e2e,
  custom stacks as pure config, **gate packs** (security/contracts/nfr/rollback) with trigger words
  that floor risky requests to full-spec.
- **Laws** (`.dev-spec-kit/laws.md` + scoped `laws/*.md`): always-on / file-match / summon-on-demand rules,
  personal→project inheritance, `#[[file:…]]` doc injection — `dev-spec-kit laws` shows what's in force.
- **Continuity:** locked append-only journal with actor/model metadata · emoji audit trail
  (`dev-spec-kit log`) · generated `LEDGER.md`/`TRACKING.md`/`RESUME.md` boards that cannot lie ·
  warn-on-repeat from the learnings ledger · `dev-spec-kit dashboard` (emoji cockpit with completion %,
  traffic lights, drift banner, the code graph, and every `.dev-spec-kit/*.md` rendered readable).
- **Parallelism:** `dev-spec-kit wave plan/start/done` — no-shared-files waves, **fetch-first** worktrees
  branched from origin's current tip (stale-base disasters designed out), merge-gated
  provenance-checked cleanup.

## Commands

`doctor` · `init` · `route` · `spec tasks/lint/draft-tests` · `task create/start/done` ·
`check run [--expect-red] [--verdict pass|fail]` · `status` · `verify [--stamp] [--advance]` ·
`graph build` · `trace` · `drift` · `affected` · `approve` · `pr` · `guard pr` · `unlock` ·
`laws` · `wave plan/start/done` · `board` · `dashboard` · `resume` · `log`

Full reference with every option, the complete configuration guide, concepts, and a tutorial:
**`website/`** — open `website/index.html`, docs under `website/docs/`.

## The input contract — the tool never changes, only its inputs

| Input | Purpose |
|---|---|
| `.dev-spec-kit/config.json` | every policy knob (gates, TDD, runners, autonomy) |
| `.dev-spec-kit/specs/*.md` | EARS requirements + `@check` bindings — source of truth |
| `.dev-spec-kit/intake/*.md` | raw ideas/tickets, verbatim (`dev-spec-kit route --file`) |
| `.dev-spec-kit/laws.md`, `.dev-spec-kit/laws/*.md` | the rules the agent must always obey |
| `.dev-spec-kit/learnings.md` | append-only retro ledger; lessons promote into laws or permanent checks |
| `.dev-spec-kit/DEFER.md` | consciously postponed work, with revisit conditions |

dev-spec-kit writes (committed, travels with a clone): `journal.jsonl`, `graph.json`, boards, `approvals/`,
`pr-body.md`. Derived & gitignored: `graphify-out/`, `.dev-spec-kit/cache/`.

## Pairs well with

[superpowers](https://github.com/obra/superpowers) (MIT) for brainstorming, systematic debugging,
and worktree craft — dev-spec-kit is the enforcement + traceability layer those stop short of.

## Specialized roles (Claude Code skills)

Thin, disposable subagent roles the workflow points at — free, no API key: **clarify** (≤5
recommended-option questions), **spec-author** (EARS/Gherkin + the 4-category edge mandate),
**architect** (HLD + ADRs), **test-author** (the rule→test loop on `draft-tests`), **analyze**
(complexity 1–10 + split), **research** (cited web augmentation), **review** (3-lens, no quota),
and **judge**.

## Planned (not yet shipped)

dev-spec-kit marks a capability built only when the **engine** does it. Currently **planned** — some exist
as a Claude Code skill (the disposable layer), not yet as durable engine logic:

- **Property-based / visual / parity / contract harnesses** — `judge` and the executable kinds ship;
  PBT generators, snapshot+baseline tooling, and cross-library parity are config-slot only today.
- **Mechanical contradiction detection** — surfaced as a `clarify` question, not a graph-constraint solver.
- **Complexity scoring / auto-split as engine commands** — shipped as the `analyze` skill only.
- **Architecture intelligence + ADR auto-emit** — ADR nodes are first-class *inputs*; generation isn't built.
- **Engine-orchestrated multi-agent dispatch** — roles run as manual subagents; the engine doesn't yet
  spawn/sequence them (only `wave` parallelizes tasks).
- **Learning-loop enforcement** — lessons warn-on-repeat and promote by hand; no gate blocks on an
  unpromoted lesson, and a fixed bug isn't auto-turned into a regression test yet.
- **MCP server** — exposing dev-spec-kit's verbs as MCP tools is planned.
- **Config honesty** — the engine hard-enforces the verification gates and the operational knobs
  (TDD, retry budget, flaky policy, wave size, the done-gate, every-criterion-needs-a-check, the
  negative-edge floor, gate packs, routing, runner stacks, `learning.warnOnRepeat`). The wider policy
  menu (review angles/passes, learning promotion, code-style/reuse preferences, intake sources,
  branch pattern) is **agent-facing** — surfaced to the Claude Code agent via the generated config
  manifest (`config-manifest.ts`), which it reads and obeys. Those are deliberate agent policy, not
  yet hard *engine* gates; this is stated, never pretended-enforced.

## Prerequisites & develop

Node ≥ 22 · git · Python ≥ 3.10 · graphify (`pip install graphifyy && graphify install`) — check
everything with `dev-spec-kit doctor`.

```bash
pnpm install && pnpm build && pnpm test     # 560+ tests
pnpm coverage                                # 100% lines/statements/functions (enforced gate)
node dist/cli/index.js doctor
```

Coverage is a **gate**, not a vanity number: `vitest` enforces 100% line/statement/function coverage
over the engine + CLI. The only exclusions are code vitest cannot execute — the browser cockpit
assets (guarded at the emission boundary) and the commander entry table — and every `c8 ignore` in
the source carries a reason (an external-tool subprocess, a concurrency race, a real-app lifecycle, or
a defensive guard against an impossible state). dev-spec-kit's moat is verification-by-construction; its own
suite holds to the same bar.

dev-spec-kit dogfoods itself: this repo's own `.dev-spec-kit/` carries its specs, journal, laws, learnings, and
boards — every feature here went through the gate it ships.

## License

MIT © Pratiyush Kumar Singh
