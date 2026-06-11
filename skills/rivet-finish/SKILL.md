---
name: rivet-finish
description: The completion ritual — run when a feature's tasks are done and it's time to land the branch. Fresh-evidence entry gate, a fixed option menu, typed confirmation for destructive paths, provenance-checked cleanup, every step journaled. Use when the user says finish/land/merge/wrap up, or after rivet pr is ready.
---

# rivet-finish — landing a branch is a ritual, not a vibe

Entry is EARNED, the menu is FIXED, destruction is TYPED, and every step lands in the journal.

## 1. Entry gate — fresh evidence only

Run, in order, and SHOW the output:
1. `rivet graph build` — MUST exit 0 (every proof green at the current tree). Stale/red → run
   `rivet drift`, fix, and re-enter. Old green output does not count; the evidence must be fresh.
2. `rivet status` — all tasks for this feature DONE.
3. `rivet pr --title "<title>"` — body generated, gate verdict green.
If any step fails: STOP. Report what blocked. Do not present the menu.

## 2. The menu — present exactly these 4 options, nothing open-ended

1. **Merge locally** — merge to the base branch, verify the suite on the merged result.
2. **Push + PR** — push the branch and open the PR with the generated body (`rivet pr --create`).
3. **Keep as-is** — leave the branch for later; record why in the journal.
4. **Discard** — destructive. To proceed the human MUST type `discard` exactly. Anything else aborts.

Do not add commentary, recommendations, or a fifth option. Wait for the choice.

## 3. Execute + cleanup (option-conditional)

- Merge: merge → re-run the suite on the merged result → only then clean up.
- Push+PR / Keep: the worktree and branch SURVIVE (work may continue).
- Discard (typed confirmation received): delete branch; remove the worktree ONLY if it lives under
  `.worktrees/` or `.claude/worktrees/` — provenance check: never clean up a workspace Rivet did not
  create.
- `rivet approve <taskIds> --note "<the human's words>"` if the human gate wasn't recorded yet.

## 4. Journal the landing

Every executed step is already audit-logged (cli.run); close with `rivet log -n 10` so the human
sees the recorded trail: graph green → approval → PR/merge → cleanup. The ritual is complete only
when the journal shows it.
