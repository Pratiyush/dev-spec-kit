# Rivet Dashboard — Design Prompt

> Paste the block below into a fresh Claude Code session in a NEW scratch folder (any model).
> Iterate visually there. When a design wins, bring `design.html` back — it gets ported into
> Rivet's renderer (`src/cli/dashboard.ts`) through the normal loop.

---

You are a world-class product designer + front-end engineer. Design a STUNNING single-file
dashboard for **Rivet**, a spec-driven development tool whose core idea is *evidence-bound done*:
every requirement is riveted to a passing check, proofs carry traffic-light states, and the
dashboard is the cockpit where you SEE that truth.

## Deliverables (in this folder — do not touch anything else)
1. `design.html` — one self-contained file (inline CSS + vanilla JS, no build step, no external
   libs; one Google Fonts link allowed). Must work opened via file://. Embed the SAMPLE DATA below
   as a JS object and render everything from it (the real tool will inject the same shape).
2. `DESIGN-NOTES.md` — 10 lines max: the design system (colors/type/spacing), and any interaction
   notes.

## The data contract (render from exactly this; sample values included)
```js
const DATA = {
  project: "rivet",
  generatedAt: "2026-06-12T09:30:00Z",          // regenerated on demand: `rivet dashboard`
  completion: { done: 24, total: 27 },           // hero number: percentage
  validates: { green: 18, red: 1, stale: 4, unproven: 2 },   // proof-state pills
  tasks: [  // status: done | in_progress | blocked | pending ; lights from results per boundCheck
    { id: "DASH-01", title: "dashboard v1", status: "done",
      boundChecks: ["test/dashboard.test.ts"], results: { "test/dashboard.test.ts": { passed: true, at: "2026-06-12T09:00:00Z", kind: "unit", flaky: false } } },
    { id: "WAVE-02", title: "wave cleanup", status: "in_progress",
      boundChecks: ["test/wave-done.test.ts"], results: { "test/wave-done.test.ts": { passed: false, at: "2026-06-12T08:50:00Z", kind: "unit", tail: "AssertionError: expected branch gone" } } },
    { id: "STEER-01", title: "laws engine", status: "pending", boundChecks: ["test/steering.test.ts"], results: {} },
  ],
  requirements: [ // proof: green | red | stale | unproven (worst-of its criteria)
    { id: "R-GREET-01", title: "personalized greeting", proven: true,  criteria: [{ id: "AC1", proof: "green" }] },
    { id: "R-GREET-02", title: "missing name default",  proven: false, criteria: [{ id: "AC1", proof: "stale" }, { id: "AC2", proof: "unproven" }] },
  ],
  approvals: [ { at: "2026-06-11T21:00:00Z", approver: "Pratiyush", taskIds: ["T1","R-GREET-01"] } ],
  governance: [ { at: "2026-06-12T07:10:00Z", kind: "unlock", detail: "test/foo.test.ts for 30m" } ],
  activity: [ // journal tail; type: cli.run | check.run | task.status | approval | governance
    { at: "2026-06-12T09:00:12Z", icon: "✅", text: "check test/dashboard.test.ts → DASH-01", meta: "Pratiyush · claude" },
    { at: "2026-06-12T09:00:30Z", icon: "🏁", text: "task DASH-01 → done" },
    { at: "2026-06-12T08:50:02Z", icon: "❌", text: "check test/wave-done.test.ts → WAVE-02" },
  ],
  graphHtml: "graph-placeholder",   // when non-null: embed an iframe panel (use a styled placeholder box)
  drift: 5,                         // red+stale count; 0 hides the banner
  files: [                          // EVERY .rivet markdown artifact, rendered READABLE in a Files tab
    { name: "laws.md",      content: "# Project Laws\n\n## Hard rules\n- A task is not done until its bound checks pass.\n- Commits are authored by the human.\n" },
    { name: "learnings.md", content: "# Learnings\n\n## 2026-06-12 Fixtures pin git config\n- Trigger: host init.defaultBranch broke fixtures.\n- Lesson: pin `-b main` + `HEAD:main`.\n- Promoted to: check:test/wave.test.ts\n" },
    { name: "specs/greeting.md", content: "# Feature: Greeting API\n\n## Requirement R-GREET-01 — personalized greeting\nWHEN a GET request hits `/greet` THEN the system SHALL respond 200.\n\n@check kind=api ref=GreetControllerTest#greet\n" },
    { name: "LEDGER.md",    content: "# LEDGER\n\n## Progress board\n**24/27 done (89%)**\n" },
    { name: "TRACKING.md",  content: "# TRACKING\n\n| Req | Proof | Approved |\n|---|---|---|\n| R-GREET-01 | 🟢 | ✅ |\n" },
    { name: "RESUME.md",    content: "# RESUME\n\n## THE ONE OPEN ACTION\n→ **WAVE-02** — wave cleanup\n" },
    { name: "DEFER.md",     content: "# DEFER\n\n## Intake adapters\n- **Why deferred:** CLI input only for now.\n- **To revisit:** at team usage.\n" },
    { name: "approvals/2026-06-11-T1.md", content: "# Approval — T1\n- **Approved by:** Pratiyush\n- **Commit:** 9d9cc2d5\n" }
  ]
};
```

## Design requirements
- **Tabs** (this is locked UX): **Overview · Tasks · Requirements · Graph · Activity · Files** —
  vanilla-JS tab switching, deep-linkable via location.hash.
- **Files** (REQUIRED): renders EVERY `.rivet/` markdown artifact from `DATA.files` in a beautiful,
  fully READABLE format — left sidebar listing the files (specs/, approvals/ grouped), right pane
  showing the selected file rendered as rich HTML. Write a MINIMAL inline markdown renderer in
  vanilla JS (headings, bold/italic, lists, tables, code blocks/inline code, links, blockquotes,
  emoji pass-through — ~80 lines, no libraries). Tables must render as real styled tables (the
  TRACKING file), code blocks in JetBrains Mono. Escape raw HTML in the markdown (no injection).
- **Overview** = the hero: HUGE completion percentage with an animated bar, the four proof-state
  pills (🟢🔴🟣⚪ with counts), a drift banner when `drift > 0` ("🟣 5 proofs red/stale — run
  `rivet drift`"), latest approval, and a tiny sparkline-style activity strip.
- **Tasks** = board feel: emoji status (✅🔨🚧⬜), proof lights per task, FAILED tasks expandable to
  show the `tail` (the failure output) in a terminal block, client-side filter (all/red/in-progress).
- **Requirements** = the DoD table: worst-of proof light per criterion, proven badge, approval ✅.
- **Graph** = full-bleed iframe panel (placeholder box in the mockup) + legend of edge proof states.
- **Activity** = the journal tail with icons + actor/model meta chips (🧾 ✅ ❌ 🏁 🔏 🛡️).
- **Identity:** dark, ONE accent color, emoji as first-class UI language, completion-% motif
  (📊 ██████░░ vibes), JetBrains Mono for anything terminal/code, tasteful motion (count-up on the
  %, bar fill, reveal transitions, smooth tab swaps — no gimmicks), fully responsive, great empty
  states ("no tasks yet — rivet spec tasks").
- **Truth styling rule:** stale = purple 🟣 and visually distinct from red — stale means "code moved,
  re-verify", not "broken". Include a one-line legend explaining the four states.

## Iterate with me
Show me the first cut, then refine on my feedback (3-4 rounds). Optimize for: glanceable truth in
2 seconds, beauty worth screenshotting, zero dependencies.
