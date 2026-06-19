# Feature: CLI audit trail & progress visibility

> User story: As the user, I want every dev-spec-kit action audit-logged and a progress view after each
> completed task, so that I can always see what was done and what remains.
> Intake: Pratiyush, 2026-06-11 — "add jsonl logging for dev-spec-kit as audit logs so we can see what all
> is done; after completing one task dev-spec-kit should show pending tasks or features with progress with emoji."

## Requirement REQUIREMENT_AUDIT-01 — every CLI invocation is audit-logged

WHEN any dev-spec-kit command runs inside a dev-spec-kit project THEN the system SHALL append a `cli.run` event
(command path + arguments + timestamp) to the append-only journal `.dev-spec-kit/journal.jsonl`.

@check kind=unit ref=test/cli-ux.test.ts::audits cli invocations into the journal

IF dev-spec-kit runs outside a dev-spec-kit project THEN the system SHALL NOT write any audit event.

@check kind=unit ref=test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects

## Requirement REQUIREMENT_AUDIT-02 — the audit trail is readable

WHEN `dev-spec-kit log` runs THEN the system SHALL print the journal events in chronological order with
timestamps and per-type emoji, and WHEN `--json` is passed THEN the system SHALL emit raw JSONL.

@check kind=unit ref=test/cli-ux.test.ts::renders the audit trail with per-type emoji

IF the journal contains an event missing its data payload THEN the system SHALL render the audit trail without crashing.

@check kind=unit ref=test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold

## Requirement REQUIREMENT_PROG-01 — progress with emoji after completing a task

WHEN a task transitions to done THEN the system SHALL display the remaining tasks and features with
per-task emoji status, per-check proof lights, an overall progress bar with percentage, and the
suggested next task.

@check kind=unit ref=test/cli-ux.test.ts::renders progress with emoji, bar, and next-up

Scenario: empty board shows an explicit empty state, not a broken bar
  Given a project with no tasks
  When the progress view renders
  Then it states there are no tasks instead of rendering an empty bar

@check kind=unit ref=test/cli-ux.test.ts::renders an explicit empty state when there are no tasks

## Requirement NFR_AUDIT-03 — auditing never breaks the CLI

IF dev-spec-kit runs outside a dev-spec-kit project THEN the system SHALL NOT create a journal or write any audit event.

@check kind=unit ref=test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects
