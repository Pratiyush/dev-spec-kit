# Rivet

> Spec-driven development with a **Verified Traceability Graph** — every requirement riveted to a passing check.

Rivet is a spec-driven development tool you drive from **Claude Code** (Spec-Kit-compatible layouts).
It turns a request into **EARS** acceptance criteria with `@check` bindings, derives evidence-bound
tasks, and — unlike every other SDD tool — **proves** the requirement → code → test → PR edges with
real executed checks. A task physically cannot be marked done while a bound check is failing or
unrun. Proofs carry the **tested tree-hash**, so committing tested code keeps them green while
changed code goes stale — **drift** you can see and fix with one command.

Built on [graphify](https://github.com/safishamsi/graphify) (the code knowledge graph) — Rivet
overlays the proven spec/test/PR edges and their traffic-light states on top.

**Status:** v0 — fully usable from source; npm publish as **`rivet-kit`** is deferred until the
app-dogfood phase completes (see `.rivet/DEFER.md`).

## The loop

```bash
rivet route "add idle session expiry"        # front door: research | quick | full-spec (+ security floor)
# write .rivet/specs/sessions.md — EARS + @check bindings
rivet spec tasks                              # spec → evidence-bound tasks (re-derive syncs bindings)
rivet task start R-AUTH-03
rivet check run R-AUTH-03 "SessionTest#idle" --stack java-maven --expect-red   # TDD red, journaled
# implement…
rivet check run R-AUTH-03 "SessionTest#idle" --stack java-maven               # green proof @ tree-hash
rivet task done R-AUTH-03                     # THE GATE — refuses without green proofs
rivet graph build                             # Verified Traceability Graph + boards (exit 1 on drift)
rivet drift                                   # re-verify anything stale/red in one move
rivet approve R-AUTH-03 --note "ship it"      # human gate as a signed artifact
rivet pr --title "Session expiry"             # graph-derived PR body; guard hook blocks non-green PRs
```

## What's inside

- **Hard gates (PreToolUse hooks):** PR creation blocked unless every proof is green (missing graph
  blocks too) · in-flight specs/tests/gate-config are tamper-protected (`rivet unlock` = journaled,
  time-boxed escape hatch) · opt-in DENY→FORCE→ALLOW investigative gate · PreCompact auto-saves
  `RESUME.md`.
- **Config-driven policy engine:** ~40 knobs in `.rivet/config.json` — TDD, flaky retries,
  kind-aware runners (`unit/integration/api/e2e/visual/parity`), app spin-up lifecycle for e2e,
  custom stacks as pure config, **gate packs** (security/contracts/nfr/rollback) with trigger words
  that floor risky requests to full-spec.
- **Laws** (`.rivet/laws.md` + scoped `laws/*.md`): always-on / file-match / summon-on-demand rules,
  personal→project inheritance, `#[[file:…]]` doc injection — `rivet laws` shows what's in force.
- **Continuity:** locked append-only journal with actor/model metadata · emoji audit trail
  (`rivet log`) · generated `LEDGER.md`/`TRACKING.md`/`RESUME.md` boards that cannot lie ·
  warn-on-repeat from the learnings ledger · `rivet dashboard` (emoji cockpit with completion %,
  traffic lights, drift banner, the code graph, and every `.rivet/*.md` rendered readable).
- **Parallelism:** `rivet wave plan/start/done` — no-shared-files waves, **fetch-first** worktrees
  branched from origin's current tip (stale-base disasters designed out), merge-gated
  provenance-checked cleanup.

## Commands

`doctor` · `init` · `route` · `spec tasks` · `task create/start/done` · `check run [--expect-red]` ·
`status` · `graph build` · `trace` · `drift` · `affected` · `approve` · `pr` · `guard pr` · `unlock` ·
`laws` · `wave plan/start/done` · `board` · `dashboard` · `resume` · `log`

Full reference with every option, the complete configuration guide, concepts, and a tutorial:
**`website/`** — open `website/index.html`, docs under `website/docs/`.

## The input contract — the tool never changes, only its inputs

| Input | Purpose |
|---|---|
| `.rivet/config.json` | every policy knob (gates, TDD, runners, autonomy) |
| `.rivet/specs/*.md` | EARS requirements + `@check` bindings — source of truth |
| `.rivet/intake/*.md` | raw ideas/tickets, verbatim (`rivet route --file`) |
| `.rivet/laws.md`, `.rivet/laws/*.md` | the rules the agent must always obey |
| `.rivet/learnings.md` | append-only retro ledger; lessons promote into laws or permanent checks |
| `.rivet/DEFER.md` | consciously postponed work, with revisit conditions |

Rivet writes (committed, travels with a clone): `journal.jsonl`, `graph.json`, boards, `approvals/`,
`pr-body.md`. Derived & gitignored: `graphify-out/`, `.rivet/cache/`.

## Pairs well with

[superpowers](https://github.com/obra/superpowers) (MIT) for brainstorming, systematic debugging,
and worktree craft — Rivet is the enforcement + traceability layer those stop short of.

## Prerequisites & develop

Node ≥ 22 · git · Python ≥ 3.10 · graphify (`pip install graphifyy && graphify install`) — check
everything with `rivet doctor`.

```bash
pnpm install && pnpm build && pnpm test     # 150+ tests
node dist/cli/index.js doctor
```

Rivet dogfoods itself: this repo's own `.rivet/` carries its specs, journal, laws, learnings, and
boards — every feature here went through the gate it ships.

## License

MIT © Pratiyush Kumar Singh
