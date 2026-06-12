# Feature: Rivet Cockpit — the web UI (dashboard + config studio)

> User story: As Pratiyush, I want one cockpit rendering my project's evidence and configuration
> from a single machine-written data file, so that truth is always one glance (and one save) away.
> Intake: .rivet/intake/config-studio-and-live-dashboard.md · Design: .design/rivet-cockpit/
> Architecture: STATIC SHELL (written once, version-stamped) + `rivet.data.js` sidecar
> (window.RIVET, rewritten by the CLI) — file:// cannot fetch JSON, script tags work.

## Requirement REQUIREMENT_COCKPIT-01 — config manifest generated from the schema

Scenario: every knob arrives explained
  Given the zod config schema
  When the manifest is generated for a project
  Then every leaf knob carries section, path, type, default, current value, changed flag, and a non-empty description

@check kind=unit ref=test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)

Scenario: enum and record knobs carry their vocabulary
  Given knobs like spec.criteriaFormat and verify.kindRunners
  When the manifest is generated
  Then enums list their allowed values and command-records expose the cmd/args record shape

@check kind=unit ref=test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape

Scenario: an undescribed or unsupported knob fails loudly, never silently
  Given a schema node the walker does not understand or a leaf without a description
  When the manifest is generated
  Then generation throws naming the offending path instead of silently dropping the knob

@check kind=unit ref=test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path

## Requirement REQUIREMENT_COCKPIT-02 — the RIVET data sidecar is the project's truth

Scenario: the sidecar carries every surface the cockpit renders
  Given a project with tasks, requirements, approvals, journal events, and .rivet markdown artifacts
  When the sidecar builds
  Then window.RIVET contains meta (refreshSeconds, inFlightTasks), dashboard (completion, validates, drift, tasks with failure tails, requirements with per-criterion proofs, approvals, governance, activity) and config (sections + manifest)

@check kind=unit ref=test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest

Scenario: stale evidence renders stale, not green
  Given a task whose passing result was recorded on an older code tree
  When the sidecar builds
  Then that check result is marked stale so the cockpit shows 🟣, never 🟢

@check kind=unit ref=test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar

Scenario: hostile artifact content cannot escape the script tag
  Given a .rivet markdown file containing a closing script tag
  When the sidecar is written
  Then the payload escapes it so the document cannot be broken or scripted

@check kind=unit ref=test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar

## Requirement REQUIREMENT_COCKPIT-03 — static shell emission, written once

Scenario: the cockpit emits shell plus sidecar
  Given a Rivet project
  When the cockpit is emitted
  Then .rivet/cockpit/ contains index.html, rivet.css, the four JS modules, and rivet.data.js, and index.html loads the sidecar via a script tag

@check kind=unit ref=test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar

Scenario: re-emission refreshes data but never rewrites an unchanged shell
  Given a cockpit emitted at the current shell version
  When the cockpit is emitted again
  Then rivet.data.js is rewritten while the shell files are left untouched
  And a bumped shell version rewrites the shell

@check kind=unit ref=test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes

## Requirement REQUIREMENT_COCKPIT-04 — live updates after every proof event

Scenario: live mode keeps the open cockpit current
  Given dashboard.updates is "live"
  When a task completes or a check records
  Then the sidecar is rewritten so the auto-reloading shell shows the new truth within refreshSeconds

@check kind=unit ref=test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run

Scenario: on-demand mode stays quiet
  Given dashboard.updates is "on-demand"
  When a task completes
  Then no sidecar write happens outside rivet dashboard

@check kind=unit ref=test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events

## Requirement REQUIREMENT_COCKPIT-05 — the config save server

Scenario: a valid save lands in config.json
  Given the cockpit server is running with no tasks in flight
  When a valid config posts to /api/config
  Then .rivet/config.json is rewritten with the merged config and the save is journaled as governance

@check kind=unit ref=test/cockpit-server.test.ts::a valid POST saves config.json and journals governance

Scenario: an invalid save returns field errors and writes nothing
  Given the cockpit server is running
  When a config with an invalid enum value posts to /api/config
  Then the response carries the offending path and message and config.json is unchanged

@check kind=unit ref=test/cockpit-server.test.ts::an invalid POST returns field errors and never writes

Scenario: GATE-PROTECT refuses saves while tasks are in flight
  Given a task is in progress and no unlock window is active
  When any config posts to /api/config
  Then the save is refused with GATE-PROTECT-01 and the rivet unlock hint and config.json is unchanged

@check kind=unit ref=test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint

Scenario: the state endpoint serves fresh truth
  Given the cockpit server is running
  When GET /api/state is requested
  Then the full RIVET object returns with serverMode true

@check kind=unit ref=test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode
