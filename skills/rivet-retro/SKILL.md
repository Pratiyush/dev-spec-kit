---
name: rivet-retro
description: Run the Rivet learning loop — capture lessons after a feature/incident into .rivet/learnings.md, propose promotions into the constitution, and turn fixed bugs into permanent regression checks. Use after completing a feature, after any surprising failure, or when the user says retro.
---

# Rivet retro — lessons compound or they repeat

A lesson only counts once it is PROMOTED (into the constitution) or HARDENED (into a permanent
check). Logged-but-unpromoted lessons recur — that is the failure mode this loop exists to kill.

## The ledger (`.rivet/learnings.md` — append-only, data not code)

```markdown
## <YYYY-MM-DD> <short title>
- Trigger: <what happened — one line, concrete>
- Lesson: <what we now know>
- Promoted to: constitution#<section> | check:<ref> | OPEN
```

## Process (RFC-2119)

1. After each completed feature (and after any surprising failure), append entries. Be concrete:
   "stale Boot-3 import caught by executed check" beats "be careful with imports".
2. For every entry you MUST propose a promotion, and the user MUST approve before it lands:
   - A recurring mistake → a new rule in `.rivet/constitution.md` (quote the exact wording).
   - A fixed bug → a PERMANENT regression test: add the test, bind it with `@check` to the relevant
     requirement so it joins the graph forever. A bug that can come back silently was never fixed.
   - A process failure → a config change (`.rivet/config.json`) — never a code change to the tool.
3. Entries stay `OPEN` until promoted; strike through (~~…~~) when superseded — NEVER delete history.
4. Before starting new work in a project, scan `learnings.md` for OPEN entries and warn when the
   current task pattern-matches a known mistake (the repeat-warning).
5. Lessons are personal by default (config `learning.share`); do not export without being asked.
