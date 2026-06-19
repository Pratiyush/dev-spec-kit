---
name: dev-spec-kit-finish
description: The completion ritual — run when a feature's tasks are done and it's time to land the branch. Fresh-evidence entry gate, a fixed option menu, typed confirmation for destructive paths, provenance-checked cleanup, every step journaled. Use when the user says finish/land/merge/wrap up, or after dev-spec-kit pr is ready.
---

# dev-spec-kit-finish — landing a branch is a ritual, not a vibe

Entry is EARNED, the menu is FIXED, destruction is TYPED, and every step lands in the journal.

## 1. Entry gate — fresh evidence only

Run, in order, and SHOW the output (after any session break: `dev-spec-kit resume` FIRST):
1. `dev-spec-kit graph build` — MUST exit 0 (every proof green at the current tree). Stale/red → run
   `dev-spec-kit drift`, fix, and re-enter. Old green output does not count; the evidence must be fresh.
2. `dev-spec-kit verify` — MUST exit 0 (Build ALL + every configured kind green, journaled on the
   current tree). The PR gate refuses without it.
3. `dev-spec-kit status` — all tasks for this feature DONE.
4. `dev-spec-kit pr --title "<title>"` — body generated, gate verdict green.
If any step fails: STOP. Report what blocked. Do not present the menu.

## 2. The menu — present exactly these 4 options, nothing open-ended

1. **Merge locally** — merge to the base branch, verify the suite on the merged result.
2. **Push + PR** — push the branch and open the PR with the generated body (`dev-spec-kit pr --create`).
3. **Keep as-is** — leave the branch for later; record why in the journal.
4. **Discard** — destructive. To proceed the human MUST type `discard` exactly. Anything else aborts.

Do not add commentary, recommendations, or a fifth option. Wait for the choice.

## 3. Execute + cleanup (option-conditional)

- Merge: merge → re-run the suite on the merged result → only then clean up.
- Push+PR / Keep: the worktree and branch SURVIVE (work may continue).
- Discard (typed confirmation received): delete branch; remove the worktree ONLY if it lives under
  `.worktrees/` or `.claude/worktrees/` — provenance check: never clean up a workspace dev-spec-kit did not
  create.
- `dev-spec-kit approve <taskIds> --note "<the human's words>"` if the human gate wasn't recorded yet.

## 4. Journal the landing

Every executed step is already audit-logged (cli.run); close with `dev-spec-kit log -n 10` so the human
sees the recorded trail: graph green → approval → PR/merge → cleanup. The ritual is complete only
when the journal shows it.
