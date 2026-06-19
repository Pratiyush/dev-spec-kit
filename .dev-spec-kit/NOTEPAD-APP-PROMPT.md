# Notepad App — Rivet Dogfood Master Prompt

> Paste the block below into a FRESH Claude Code session. Locations are exact for this machine.
> Purpose is double: build the notepad app AND harvest Rivet improvements from every friction.

---

I'm building a **notepad-style app** using **RIVET**, my spec-driven dev tool. Rivet enforces
evidence-bound development: specs carry EARS criteria bound to real checks, a task cannot be marked
done until its checks pass, and drift is detected via code-tree hashes.

## Locations (exact)
- **Rivet repo (the tool):** `~/Github/llm-dev-kit` — already built. If ever needed:
  `cd ~/Github/llm-dev-kit && pnpm install && pnpm build && pnpm test`
- **Use the CLI via a shell function** (zsh — set this up first in every shell you use):
  `rivet() { node ~/Github/llm-dev-kit/dist/cli/index.js "$@"; }`
- **The app lives at:** `~/Desktop/AI/notepad` (create fresh: `git init`, local-only — no remote).
- **Rivet's own learnings ledger (for tool improvements):** `~/Github/llm-dev-kit/.rivet/learnings.md`
- **Rivet's docs if you need them:** `~/Github/llm-dev-kit/website/docs/` (commands, configuration,
  workflow) and the skills in `~/Github/llm-dev-kit/skills/`.

## Setup (first 5 minutes)
1. `mkdir -p ~/Desktop/AI/notepad && cd ~/Desktop/AI/notepad && git init -b main`
2. `git config user.name "Pratiyush Kumar Singh" && git config user.email pratiyush1@gmail.com`
3. `rivet init` then `rivet doctor` — fix anything red before proceeding.
4. Pick a SIMPLE stack with a Rivet-supported runner — recommended: **TypeScript + Vitest**
   (stack `node-vitest`). Scaffold minimal package.json + vitest; commit the skeleton.

## The app (design-think FIRST, then spec)
A clean notepad: create/edit/delete notes, autosave, search, tags, markdown preview, local
persistence. **Design-think before any spec:** explore 2–3 UI/architecture directions, show me the
recommended one with a short rationale, WAIT for my approval — then turn the approved design into
Rivet specs.

## Operating rules (HARD)
1. EVERY feature goes through the loop — no exceptions, no side-channel code:
   `rivet route "<ask>"` (confirm mode with me) → write `.rivet/specs/<feature>.md` (EARS +
   `@check kind=… ref=file.test.ts::name`) → show me the spec, WAIT for approval →
   `rivet spec tasks` → `rivet task start <id>` → write the FAILING test first →
   `rivet check run <id> "<ref>" --stack node-vitest --expect-red` → implement →
   `rivet check run <id> "<ref>" --stack node-vitest` (green) → `rivet task done <id>` →
   `rivet graph build` → `rivet drift` if anything is stale → `rivet approve <ids> --note "<my words>"`
   → `rivet pr --title "<feature>"` (body only — no remote).
2. **THE DOGFOOD RULE — the real purpose of this session:** the moment Rivet itself misbehaves
   (bug, wrong/confusing output, missing capability, annoying friction, unclear error), STOP app
   work immediately:
   a. Reproduce it minimally and show me.
   b. Append a lesson to `~/Github/llm-dev-kit/.rivet/learnings.md` in the ledger format:
      `## <date> <title>` / `- Trigger:` / `- Lesson:` / `- Confidence: low|medium|high` /
      `- Scope: project` / `- Promoted to: OPEN → task <ID>`
   c. If the fix is small and clear: fix it IN THE RIVET REPO through Rivet's own loop
      (task + failing test + gate + green) and `git commit` there (authored by me). If big: leave
      the lesson OPEN and tell me.
   d. THEN resume the app exactly where it stopped (`rivet status` / `rivet resume` re-orient you).
   App development is Rivet's test harness — friction found = work item, always.
3. Keep `rivet dashboard` fresh after each task (`rivet dashboard --open` when I ask to see it);
   `rivet board` keeps LEDGER/TRACKING current. Commits authored by me, never co-authored.
4. My gates: mode confirm → design approval → per-spec approval → before any destructive step.
   When stuck: bounded attempts, then ask. Never weaken a test to pass a gate (the hooks will block
   you anyway — that block itself is a lesson to log).

Start with step 1 of Setup now, then bring me the design directions for the notepad.
