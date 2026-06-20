---
name: dev-spec-kit-workflow
description: Drive spec-driven development with dev-spec-kit — route the request, write EARS specs with @check bindings, derive evidence-bound tasks, TDD, prove checks with real test runs, build the Verified Traceability Graph, record approvals, and generate graph-derived PR bodies. Use whenever the user asks to build/change code in a dev-spec-kit-initialized project (.dev-spec-kit/ present) or mentions rivet, specs, EARS, or traceability.
---

# dev-spec-kit workflow — verification-by-construction

dev-spec-kit's rule zero: **a claim of "done" is worthless; only an executed check counts.** The CLI enforces
this — `dev-spec-kit task done` physically refuses without green proofs. Your job is to follow the loop, not
to fight it.

Prerequisite: the `dev-spec-kit` CLI (this plugin's repo, `npm run build`; run via `node <repo>/dist/cli/index.js`
or a global install) and `dev-spec-kit doctor` passing. If `.dev-spec-kit/` is missing, run `dev-spec-kit init` first.

## The loop

1. **Route first.** Run `dev-spec-kit route "<the user's request>"`. Tell the user the chosen mode and why.
   - MUST confirm with the user before proceeding when config has `mode.confirmFirst: true`.
   - research → investigate and report. You MUST NOT change code in research mode.
   - quick → one small change. Quick mode still writes at least one test (NO exceptions).
   - full-spec → continue with step 2.
2. **Spec.** Write `.dev-spec-kit/specs/<feature>.md`: a user story, then
   `## Requirement REQUIREMENT_<AREA>-NN — title` sections (ids MUST be fully qualified:
   `REQUIREMENT_` / `NFR_` / `ADR_`, never bare `R-…`) with EARS criteria
   (`WHEN/IF … THEN the system SHALL …`) and one `@check kind=<kind> ref=<ref>`
   line per criterion. Refs use the runner's selector syntax (maven `Class#method`, vitest/jest
   `file::name`, pytest `file::test`). Present the spec to the user for approval BEFORE implementing.
3. **Derive tasks.** `dev-spec-kit spec tasks` — one evidence-bound task per requirement. NEVER create code
   without a task that binds the checks that will prove it.
4. **TDD.** Write the failing test FIRST, exactly matching the bound check ref. Run
   `dev-spec-kit check run <taskId> <ref> --stack <stack>` and SHOW the red run. Then implement.
   - You MUST verify a library exists in the project manifest before importing it.
   - Reuse existing code and follow the repo's conventions; check the graph/code first.
5. **Prove.** Re-run each bound check until green. NEVER edit a recorded result; only real runs count.
6. **Done.** `dev-spec-kit task done <taskId>`. If it blocks, the task is NOT done — fix and re-prove. Do not
   argue with the gate; it is correct by construction.
7. **Graph.** `dev-spec-kit graph build`. Red/stale proofs exit 1 — stale means code moved after the proof:
   re-run those checks. The graph MUST be green before any PR. For freshness and reading blast radius
   / implements-edges, see `dev-spec-kit-graph`; for the code-graph engine, `dev-spec-kit-revitify`
   (bundled default) or `dev-spec-kit-graphify` (multi-modal opt-in).
8. **Verify ALL.** `dev-spec-kit verify` — Build ALL + run EVERY configured kind's full suite, journaled.
   A green task is not a green project; the PR gate requires the last verify green ON THE CURRENT
   code tree (any code change after it ⇒ re-run). MUST be green before approve/PR.
9. **Approve.** Ask the user, then record their gate: `dev-spec-kit approve <taskIds> --note "<their words>"`.
   Approval is the human gate ON TOP of verification, never a substitute.
10. **PR.** `dev-spec-kit pr --title "<title>"` generates `.dev-spec-kit/pr-body.md` from the graph (traceability
   table + binding coverage). `--create` opens it via `gh`. The guard hook blocks PR creation while
   proofs are not green or the verify is missing/red/stale.

## Specialized roles (spawn fresh; the engine orchestrates)

For depth, delegate to a focused role skill in a fresh subagent — each thin, disposable, validated on
return. They run as Claude Code subagents (free, no API key):
- `dev-spec-kit-clarify` — resolve ambiguity with ≤5 recommended-option questions, before step 2.
- `dev-spec-kit-architect` — a thin HLD + an ADR per non-obvious decision, between steps 2 and 3.
- `dev-spec-kit-test-author` — `dev-spec-kit spec draft-tests` scaffolds failing stubs; flesh them with
  behavior-asserting tests across the 4 edge categories, at step 4.
- `dev-spec-kit-analyze` — score complexity 1–10 and split a too-big requirement into bound sub-criteria.
- `dev-spec-kit-research` — cited web augmentation when the spec depends on outside knowledge.
- `dev-spec-kit-review` — the 3-lens, no-quota review before the PR.
- `dev-spec-kit-judge` — a `kind=judge` verdict for a criterion no test can assert (tone, copy, actionability).

## Faster proving
- The `--stamp` fast path: one suite run stamps a proof for EVERY bound criterion (instead of N cold
  `check run`s); `--advance` then auto-advances fully-proven tasks to done. Prefer it once the tests
  are green — it's how you keep `trace` honest cheaply.
- `dev-spec-kit spec lint` catches orphaned `@check` refs (renamed/moved tests) before a run, and gates
  commits via the pre-commit hook so drift can't land.

## Hard rules (RFC-2119)

- You MUST NOT mark, claim, or imply a task is complete while any bound check is failing or unrun.
- You MUST NOT weaken, skip, or delete a failing test to make it pass; fix the code or escalate.
- You MUST show real command output for check runs — never paraphrase a result that did not happen.
- Format BEFORE the final prove: commit-time formatters (lint-staged + prettier) move the code
  tree and stale fresh proofs — run the formatter, then drift/verify, then commit.
- Scripted check runs MUST preserve exit codes (`set -o pipefail` before piping the CLI's
  output) — a gate whose exit code a pipe eats is decoration.
- After ANY session break, crash, or interruption you MUST run `dev-spec-kit resume` FIRST, then
  `dev-spec-kit status` — re-orient from recorded truth before touching anything. (Two live recoveries
  prove the journal re-orients losslessly; only the resume-first habit makes that automatic.)
- Commits MUST be authored by the human (per project laws (.dev-spec-kit/laws.md)), and you MUST stop at the
  configured human gates (plan approval, task approval, pre-PR, pre-merge).
