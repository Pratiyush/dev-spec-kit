# Feature: CLI audit trail & progress visibility

> User story: As the user, I want every Rivet action audit-logged and a progress view after each
> completed task, so that I can always see what was done and what remains.
> Intake: Pratiyush, 2026-06-11 — "add jsonl logging for rivet as audit logs so we can see what all
> is done; after completing one task rivet should show pending tasks or features with progress with emoji."

## Requirement R-AUDIT-01 — every CLI invocation is audit-logged

WHEN any rivet command runs inside a Rivet project THEN the system SHALL append a `cli.run` event
(command path + arguments + timestamp) to the append-only journal `.rivet/journal.jsonl`.

@check kind=unit ref=test/cli-ux.test.ts::audits cli invocations into the journal

## Requirement R-AUDIT-02 — the audit trail is readable

WHEN `rivet log` runs THEN the system SHALL print the journal events in chronological order with
timestamps and per-type emoji, and WHEN `--json` is passed THEN the system SHALL emit raw JSONL.

@check kind=unit ref=test/cli-ux.test.ts::renders the audit trail with per-type emoji

## Requirement R-PROG-01 — progress with emoji after completing a task

WHEN a task transitions to done THEN the system SHALL display the remaining tasks and features with
per-task emoji status, per-check proof lights, an overall progress bar with percentage, and the
suggested next task.

@check kind=unit ref=test/cli-ux.test.ts::renders progress with emoji, bar, and next-up
