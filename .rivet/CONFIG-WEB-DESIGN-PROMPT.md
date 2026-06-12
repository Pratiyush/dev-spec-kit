# Rivet Config Studio — Design Prompt

> Paste the block below into a fresh Claude Code session in a NEW scratch folder (any model).
> Iterate visually there. When a design wins, bring `config-studio.html` back — it gets ported
> into Rivet (a new `rivet config --web` command: tiny localhost server + this UI) through the
> normal loop. Sibling to the dashboard design (same cockpit aesthetic).

---

You are a world-class product designer + front-end engineer. Design a STUNNING single-file
**configuration studio** for **Rivet**, a spec-driven development tool whose entire policy engine
lives in ONE file: `.rivet/config.json` (~70 knobs across 15 sections). Today humans edit raw
JSON; this UI is how every knob becomes discoverable, explained, and safely editable. The SAME
file is read and written by the CLI — the UI must treat the disk as the source of truth.

## Deliverables (in this folder — do not touch anything else)
1. `config-studio.html` — one self-contained file (inline CSS + vanilla JS, no build step, no
   external libs; one Google Fonts link allowed). Must render opened via file:// (read-only mode).
   Embed the SAMPLE DATA below as a JS object and render everything from it (the real tool will
   inject the same shape and serve it at http://localhost:<port>/config with a live save API).
2. `DESIGN-NOTES.md` — 10 lines max: design system + interaction notes.

## How it will really run (design for this, mock the endpoints)
- `rivet config --web` starts a tiny local server: GET /api/config returns DATA; POST /api/config
  saves to `.rivet/config.json` after zod validation (field-level errors come back as
  `{ errors: [{ path, message }] }` — design the inline error state).
- The CLI also writes this file (e.g. `rivet init --platforms`). The UI polls GET /api/config every
  **15 seconds** (same cadence as the dashboard refresh): if the disk changed under you, show a
  non-destructive "config changed on disk — reload / keep my edits" banner. Never silently clobber.
- GATE-PROTECT: while tasks are in flight, config saves can be REFUSED by the engine
  (`{ blocked: "GATE-PROTECT-01", reason, unlockHint: "rivet unlock .rivet/config.json --minutes 30" }`).
  Design that refusal state — it is a feature, not an error: the moat must not be editable by the
  thing it gates.
- Opened as file:// (no server): everything renders, Save is disabled with a hint
  ("read-only — run `rivet config --web` to edit").

## The data contract (render from exactly this; sample values included)
```js
const DATA = {
  project: "rivet",
  configPath: ".rivet/config.json",
  generatedAt: "2026-06-12T10:00:00Z",
  serverMode: true,                  // false => file:// read-only mode
  refreshSeconds: 15,
  inFlightTasks: ["FEAT-X-01"],      // non-empty => saves may hit the GATE-PROTECT refusal
  // Every knob, grouped. type: "enum" | "boolean" | "number" | "string" | "enum[]" | "record" | "object"
  // `changed` = value !== default (drive badges + per-knob reset + the Save bar dirty count).
  manifest: [
    { section: "project", key: "name", path: "project.name", type: "string",
      value: "rivet", default: "untitled", changed: true,
      description: "Human-readable project name used in board headers and journal metadata." },
    { section: "project", key: "platforms", path: "project.platforms", type: "enum[]",
      allowed: ["java-maven","java-gradle","spring","quarkus","node","typescript","electron","react","next","angular","python"],
      value: ["typescript","node"], default: [], changed: true,
      description: "Codebase platforms (an ARRAY — polyglot is normal). Drives stack inference and init best-practice packs. NOT runner ids." },
    { section: "spec", key: "criteriaFormat", path: "spec.criteriaFormat", type: "enum",
      allowed: ["gherkin","ears","plain","mixed"], value: "mixed", default: "gherkin", changed: true,
      description: "Criteria syntax. Gherkin (default): Scenario / Scenario Outline + Examples. Both grammars always parse; off-format criteria lint (warn-only)." },
    { section: "verify", key: "blockDoneOnFail", path: "verify.blockDoneOnFail", type: "boolean",
      value: true, default: true, changed: false,
      description: "A task cannot be marked done while bound checks fail — or while a passing proof is STALE (recorded on an older code tree)." },
    { section: "verify", key: "defaultStack", path: "verify.defaultStack", type: "string",
      value: null, default: null, changed: false, placeholder: "node-vitest",
      description: "Stack used when --stack is omitted. Resolution: flag → this → inferred from platforms → error." },
    { section: "verify", key: "kindRunners", path: "verify.kindRunners", type: "record",
      value: { lint: { cmd: "npx", args: ["eslint","."] } }, default: {}, changed: true,
      recordShape: { cmd: "string", args: "string[]" },
      description: "Kind-level runner templates (lint, audit, visual…). {ref}/{file}/{name} placeholders. Precedence: kindRunners > runners > builtin." },
    { section: "gates", key: "negativeFloor", path: "gates.negativeFloor", type: "enum",
      allowed: ["on","off"], value: "on", default: "on", changed: false,
      description: "Every requirement needs ≥1 negative/failure criterion or graph build flags it. Prose mandates are ignorable; floors aren't." },
    { section: "rules", key: "requireQualifiedIds", path: "rules.requireQualifiedIds", type: "enum",
      allowed: ["warn","error","off"], value: "warn", default: "warn", changed: false,
      description: "Requirement ids must self-describe: REQUIREMENT_/NFR_/ADR_. Legacy R- ids parse but lint at this severity." },
    { section: "graphify", key: "provider", path: "graphify.provider", type: "enum",
      allowed: ["revitify","graphify"], value: "revitify", default: "revitify", changed: false,
      description: "Who builds the code graph. revitify (bundled TS, zero installs) or the external Python graphify (multi-modal, opt-in)." },
    { section: "dashboard", key: "updates", path: "dashboard.updates", type: "enum",
      allowed: ["live","on-demand"], value: "live", default: "on-demand", changed: true,
      description: "live: boards + dashboard regenerate automatically after every task done / check run." },
    { section: "parallel", key: "waveSize", path: "parallel.waveSize", type: "number",
      value: 6, default: 6, changed: false, min: 1,
      description: "Max concurrent worktree tasks (~6 avoids rate-limit wipeouts)." }
    // …the real tool injects ~70 knobs. DESIGN FOR THAT SCALE using the full inventory below.
  ],
  jsonPreview: "{\n  \"project\": { \"name\": \"rivet\", \"platforms\": [\"typescript\",\"node\"] }\n}"
};
```

## The full inventory (all 15 sections — the design must comfortably hold ALL of it)
project(name, platforms) · mode(routing: auto|pick|auto-override, confirmFirst, researchMode,
custom record) · intake(sources: raw|github|gitlab|jira[], jiraEpic: mirror|replan|ask, writeBack) ·
spec(style: checklist|stories|both, acceptanceCriteria: tool-drafts|user-writes, criteriaFormat,
breakdownDepth, estimates, autoDependencies, diagram, gapHunting: off|propose|auto, riskWarn,
livingPlan: frozen|update-ask|update-auto, onVague: clarify|guess-flag) · build(tests:
tdd|code-first|either, fileFence, retryLimit, checkFrequency, whenStuck, codeStyle, reuse,
comments, commitCadence, newDeps: ask|auto|ask-big) · verify(kinds[], defaultStack, buildAll
{cmd,args}[], coverage number|null, blockDoneOnFail, everyCriterionNeedsCheck, runApp, ui,
sandbox, security, lintTypes, flaky, runners record, kindRunners record, app{start[], readyUrl,
readyTimeoutMs}) · review(separateReviewer, angles[], passes, fixFindings) · pr(autoBody,
branchPattern, merge: auto-on-green|manual, waitForCI, commitAuthor: user|co-author,
cleanupAfterMerge) · memory(crashResume, journal: full|milestones, driftDetection) ·
parallel(enabled, waveSize, isolation, onFileClash, coordinator) · dashboard(enabled, form,
updates, notify{channels[], on[]}, refreshSeconds NEW default 15) · rules(laws, onConflict,
inheritPersonal, requireQualifiedIds) · learning(capture, promoteToRules, bugToTest, scope,
retro, warnOnRepeat, share) · gates(facts on|off, negativeFloor, require[], packs record{
sections[], kinds[], triggers[]}) · graphify(provider, outDir, freshness)

## Interaction requirements
1. **Left nav of the 15 sections** with per-section changed-count badges; instant fuzzy **search**
   across key + description (the fastest path to any knob).
2. Enums = segmented controls; booleans = switches; numbers = steppers; records (runners,
   kindRunners, gate packs) = editable key→value rows with add/remove; arrays = chip multi-selects.
3. Every knob shows its **description** and **default**; changed knobs get a badge + one-click
   "reset to default". The Save bar shows the dirty count and stays sticky.
4. **JSON preview drawer** — the exact file that will be written, live, copyable.
5. The three live states, designed loudly but calmly: disk-changed banner (reload vs keep edits),
   GATE-PROTECT refusal (with the unlock hint), file:// read-only.
6. A subtle "synced HH:MM:SS · refreshes every 15s" indicator (shared pattern with the dashboard).
7. Same design language as the Rivet dashboard (dark cockpit, traffic-light accent palette
   green/red/violet/amber); assume it lives as a sibling tab: **Dashboard | Config**.
8. Validation errors from POST render inline at the offending knob and scroll-to it.

## Out of scope for the design session
The actual server, zod validation, and file writes — Rivet provides those at port time. Mock the
fetch calls; make every state reachable via keyboard shortcuts (document them in DESIGN-NOTES.md).
