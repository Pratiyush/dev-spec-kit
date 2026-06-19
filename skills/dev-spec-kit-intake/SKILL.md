---
name: dev-spec-kit-intake
description: Turn a raw idea, voice-dump, or ticket into a dev-spec-kit intake file and route it. Use when the user brain-dumps a request, pastes a Jira/GitHub/GitLab ticket, or points at an idea that has no spec yet.
---

# Intake — ideas are external files, the tool only consumes input

Raw ideas live as files under `.dev-spec-kit/intake/` — versioned, re-routable, never lost. The tool's code
and skills never change per idea; only these inputs do.

## File shape (`.dev-spec-kit/intake/<slug>.md`)

```markdown
---
id: <slug>
source: raw | github#123 | gitlab#45 | jira:ABC-7
date: <YYYY-MM-DD>
---
<the idea, verbatim — do not editorialize the user's words>

## Refined (added during intake)
- Goal: <one sentence>
- In scope: …
- Out of scope: …
- Open questions: …
```

## Process (RFC-2119)

1. Capture the user's words VERBATIM into the file first — messy is fine; never lose the original.
2. Run `dev-spec-kit route --file .dev-spec-kit/intake/<slug>.md` and report the mode + reason. MUST confirm with
   the user before proceeding (confirm-first).
3. If the idea is vague, ask clarifying questions BEFORE any code — one at a time, ≤5, each with a
   recommended answer. Append answers to the file's `## Refined` section so the intake file stays the
   single record.
4. Then branch by mode:
   - research → investigate and report; write findings back under `## Refined`. NO code changes.
   - quick → one delta + one test; create the task directly (`dev-spec-kit task create … --check …`).
   - full-spec → hand off to the dev-spec-kit-spec-author skill; the spec MUST link back to the intake id.
5. Tickets: when the source is Jira/GitHub/GitLab, copy the ticket body into the file and record the
   source id in frontmatter. Write-back to the ticket only if config `intake.writeBack` allows.
