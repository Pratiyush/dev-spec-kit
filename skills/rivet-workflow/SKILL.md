---
name: rivet-workflow
description: Drive spec-driven development with Rivet — route the request, write EARS specs with @check bindings, derive evidence-bound tasks, TDD, prove checks with real test runs, build the Verified Traceability Graph, record approvals, and generate graph-derived PR bodies. Use whenever the user asks to build/change code in a Rivet-initialized project (.rivet/ present) or mentions rivet, specs, EARS, or traceability.
---

# Rivet workflow — verification-by-construction

Rivet's rule zero: **a claim of "done" is worthless; only an executed check counts.** The CLI enforces
this — `rivet task done` physically refuses without green proofs. Your job is to follow the loop, not
to fight it.

Prerequisite: the `rivet` CLI (this plugin's repo, `npm run build`; run via `node <repo>/dist/cli/index.js`
or a global install) and `rivet doctor` passing. If `.rivet/` is missing, run `rivet init` first.

## The loop

1. **Route first.** Run `rivet route "<the user's request>"`. Tell the user the chosen mode and why.
   - MUST confirm with the user before proceeding when config has `mode.confirmFirst: true`.
   - research → investigate and report. You MUST NOT change code in research mode.
   - quick → one small change. Quick mode still writes at least one test (NO exceptions).
   - full-spec → continue with step 2.
2. **Spec.** Write `.rivet/specs/<feature>.md`: a user story, then
   `## Requirement REQUIREMENT_<AREA>-NN — title` sections (ids MUST be fully qualified:
   `REQUIREMENT_` / `NFR_` / `ADR_`, never bare `R-…`) with EARS criteria
   (`WHEN/IF … THEN the system SHALL …`) and one `@check kind=<kind> ref=<ref>`
   line per criterion. Refs use the runner's selector syntax (maven `Class#method`, vitest/jest
   `file::name`, pytest `file::test`). Present the spec to the user for approval BEFORE implementing.
3. **Derive tasks.** `rivet spec tasks` — one evidence-bound task per requirement. NEVER create code
   without a task that binds the checks that will prove it.
4. **TDD.** Write the failing test FIRST, exactly matching the bound check ref. Run
   `rivet check run <taskId> <ref> --stack <stack>` and SHOW the red run. Then implement.
   - You MUST verify a library exists in the project manifest before importing it.
   - Reuse existing code and follow the repo's conventions; check the graph/code first.
5. **Prove.** Re-run each bound check until green. NEVER edit a recorded result; only real runs count.
6. **Done.** `rivet task done <taskId>`. If it blocks, the task is NOT done — fix and re-prove. Do not
   argue with the gate; it is correct by construction.
7. **Graph.** `rivet graph build`. Red/stale proofs exit 1 — stale means code moved after the proof:
   re-run those checks. The graph MUST be green before any PR.
8. **Verify ALL.** `rivet verify` — Build ALL + run EVERY configured kind's full suite, journaled.
   A green task is not a green project; the PR gate requires the last verify green ON THE CURRENT
   code tree (any code change after it ⇒ re-run). MUST be green before approve/PR.
9. **Approve.** Ask the user, then record their gate: `rivet approve <taskIds> --note "<their words>"`.
   Approval is the human gate ON TOP of verification, never a substitute.
10. **PR.** `rivet pr --title "<title>"` generates `.rivet/pr-body.md` from the graph (traceability
   table + binding coverage). `--create` opens it via `gh`. The guard hook blocks PR creation while
   proofs are not green or the verify is missing/red/stale.

## Hard rules (RFC-2119)

- You MUST NOT mark, claim, or imply a task is complete while any bound check is failing or unrun.
- You MUST NOT weaken, skip, or delete a failing test to make it pass; fix the code or escalate.
- You MUST show real command output for check runs — never paraphrase a result that did not happen.
- After ANY session break, crash, or interruption you MUST run `rivet resume` FIRST, then
  `rivet status` — re-orient from recorded truth before touching anything. (Two live recoveries
  prove the journal re-orients losslessly; only the resume-first habit makes that automatic.)
- Commits MUST be authored by the human (per project laws (.rivet/laws.md)), and you MUST stop at the
  configured human gates (plan approval, task approval, pre-PR, pre-merge).
