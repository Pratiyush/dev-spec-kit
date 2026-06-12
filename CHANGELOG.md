# Changelog

## 0.1.0 — 2026-06-12 (the feedback batch)

The notepad-dogfood feedback batch: every item driven through Rivet's own loop
(task → failing test → implement → green → done-gate), conventional commits.

### Added
- **`rivet verify`** — Build ALL + run EVERY configured kind's full suite (custom kinds
  included), sequential, report-all, 📋 summary with ⏱️ durations, journaled with the
  code-tree hash. **Hard PR gate**: guard-pr / `rivet pr` require the last verify green
  on the CURRENT tree; the PreToolUse hook gains an exists+green fast veto.
- **Gherkin first-class and the new default** — `Scenario:` blocks parse as bindable
  criteria; `Scenario Outline:` + `Examples:` expand one criterion per row, one `@check`
  binding them all (worst-of). Off-format criteria lint (warn-only).
- **Mechanical edge-case floor** (`gates.negativeFloor`, on everywhere) — a requirement
  with zero negative/failure criteria fails `rivet graph build`.
- **Fully-qualified requirement ids** — `REQUIREMENT_<AREA>-NN`, `NFR_` (full obligations),
  `ADR_` (decision-record graph nodes, exempt). `rules.requireQualifiedIds: warn|error|off`.
- **`revitify`** (workspace package) — Rivet's native TypeScript code-knowledge-graph
  engine with graphify's exact output contract (graph.json · graph.html · GRAPH_REPORT.md).
  `graphify.provider: "revitify"` is the default: graph features with ZERO pip installs;
  external graphify stays available opt-in. Upstream pinned in `packages/revitify/.track`.
- **`rivet init --platforms`** — seeds per-platform best-practice law packs (TypeScript,
  Electron security baseline, Java, Python, quality-gates, polyglot), 100% free/OSS tools,
  each pre-wired with "Bind these as Rivet checks". Self-adopted: ESLint + Prettier +
  lint-staged + husky; lint runs as a verify kind.
- **📋 per-task evidence table** at `task done` and persisted per task in LEDGER.md.
- **Central emoji vocabulary** (10 new types) with plain-ASCII degradation
  (`--plain`, `NO_EMOJI=1`, auto when not a TTY).
- **`verify.defaultStack` + platform inference** — `--stack` now optional.
- **electron** platform; platforms documented as an ARRAY (polyglot is normal).
- 📝 learnings-flush pre-flight warning in `rivet pr`; 🧹 doctor lists stale isolation
  worktrees (visibility only).

### Fixed
- **FIX-PROOF-04** — every proof surface (PR body, approvals, audit log → LEDGER) stamps
  the tested TREE identity via one shared renderer; bare sha only as legacy fallback.
- **FIX-PROV-01** — the graphify hint carries verifiable pointers only (no rotting star counts).

### Docs
- README: "Built for Claude Code first; other assistants later."
- Skills rewritten: Gherkin-first spec authoring with the 4-category edge mandate,
  verify-before-PR, resume-first after any break, pipefail for scripted gate commands.
