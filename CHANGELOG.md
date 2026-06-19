# Changelog

## Unreleased

### Added
- **Blast radius in the PR body (FEAT-BLAST-01)** — `dev-spec-kit pr` now lists, per changed file, the proven
  graph edges it touches (a changed test via its `validates` edge; a changed source file via its code
  node), so a reviewer sees the diff's traceability impact without opening the graph. Pure
  `prBlastRadius(graph, changedFiles)`; the change set comes from `git diff` since the branch's fork
  point; honest when nothing maps. Dogfooded (REQUIREMENT_PRBLAST-01, 20/20 proven). Moves off the
  "Planned" list.

## 0.2.0 — 2026-06-14 (proof-layer integrity + the LLM layer)

Dogfood-feedback rework of the proof layer, plus an LLM layer (harness-first — free, no API key by
default). Every code unit built TDD-first and proven through dev-spec-kit's own loop.

### Added
- **`dev-spec-kit verify --stamp [--advance]`** — prove EVERY bound criterion from ONE suite run (maps the
  JSON report back to each `@check`) instead of N cold `check run`s; `--advance` auto-advances
  fully-proven tasks to done (never a blocked one).
- **`dev-spec-kit spec lint`** — static drift check: orphaned `@check` refs (renamed/moved tests), unbound
  criteria, and lost-obligation parser warnings. Folded into `dev-spec-kit doctor`, a pre-commit gate, and a
  loop-safe Stop hook. Exit 1 on orphans.
- **`dev-spec-kit spec draft-tests`** — scaffold a failing, bound vitest stub per unbound criterion (the
  rule→test→proof loop the `tool-drafts` config promised).
- **The `judge` check kind** — an LLM verdict for the unmeasurable, recorded SECOND-CLASS
  (`⚖️ judged`, never an executed green), blocked on full obligations by default. Harness mode is
  free (the agent supplies the verdict, no key); optional api mode calls Anthropic (lazy SDK).
- **Dependency-cycle detection** in `dev-spec-kit graph build` (circular `dependsOn` chains exit 1).
- **Specialized role skills** — clarify · architect · test-author · analyze · research · judge, plus
  spec-author Gherkin/edge-case generation.

### Fixed
- A name-filtered check matching ZERO tests is a FAILED proof, not a silent exit-0 green; flag-like
  test names bind via an escaped `--testNamePattern=` (no CACError).
- `task done` distinguishes a stale binding ("run `spec tasks`") from a missing proof.
- `--advance` no longer advances a blocked task; executed proofs self-describe their `kind`; the
  zero-match diagnostic distinguishes a renamed name from a missing file; lost-obligation parser
  warnings are surfaced by `spec lint`/`doctor`; api-mode judge warns on an unresolved evidence file.

### Docs
- README marks every capability built-or-planned (tooling honesty); the new commands, the `judge`
  kind, and the role skills are documented.

### Testing & quality
- **100% line/statement/function coverage** over the engine + CLI, now **enforced** by `vitest`
  thresholds (`pnpm coverage` is a green gate). 560+ tests (was 364). Only the browser cockpit assets
  and the commander entry table are excluded (vitest cannot execute them); every `c8 ignore` in the
  source carries a stated reason (external-tool subprocess, concurrency race, real-app lifecycle, or a
  defensive guard against an impossible state).
- Review-fix sweep: `trace` now names the drift cure (FIX-TRACE-HINT-01); `learning.warnOnRepeat` is
  wired (was display-only); `spec draft-tests` creates a missing target dir instead of crashing
  (FIX-DRAFT-02); the no-orphan-evidence invariant is locked by test; `.revitify/cache` is gitignored.

## 0.1.0 — 2026-06-12 (the feedback batch)

The notepad-dogfood feedback batch: every item driven through dev-spec-kit's own loop
(task → failing test → implement → green → done-gate), conventional commits.

### Added
- **`dev-spec-kit verify`** — Build ALL + run EVERY configured kind's full suite (custom kinds
  included), sequential, report-all, 📋 summary with ⏱️ durations, journaled with the
  code-tree hash. **Hard PR gate**: guard-pr / `dev-spec-kit pr` require the last verify green
  on the CURRENT tree; the PreToolUse hook gains an exists+green fast veto.
- **Gherkin first-class and the new default** — `Scenario:` blocks parse as bindable
  criteria; `Scenario Outline:` + `Examples:` expand one criterion per row, one `@check`
  binding them all (worst-of). Off-format criteria lint (warn-only).
- **Mechanical edge-case floor** (`gates.negativeFloor`, on everywhere) — a requirement
  with zero negative/failure criteria fails `dev-spec-kit graph build`.
- **Fully-qualified requirement ids** — `REQUIREMENT_<AREA>-NN`, `NFR_` (full obligations),
  `ADR_` (decision-record graph nodes, exempt). `rules.requireQualifiedIds: warn|error|off`.
- **`revitify`** (workspace package) — dev-spec-kit's native TypeScript code-knowledge-graph
  engine with graphify's exact output contract (graph.json · graph.html · GRAPH_REPORT.md).
  `graphify.provider: "revitify"` is the default: graph features with ZERO pip installs;
  external graphify stays available opt-in. Upstream pinned in `packages/revitify/.track`.
- **`dev-spec-kit init --platforms`** — seeds per-platform best-practice law packs (TypeScript,
  Electron security baseline, Java, Python, quality-gates, polyglot), 100% free/OSS tools,
  each pre-wired with "Bind these as dev-spec-kit checks". Self-adopted: ESLint + Prettier +
  lint-staged + husky; lint runs as a verify kind.
- **📋 per-task evidence table** at `task done` and persisted per task in LEDGER.md.
- **Central emoji vocabulary** (10 new types) with plain-ASCII degradation
  (`--plain`, `NO_EMOJI=1`, auto when not a TTY).
- **`verify.defaultStack` + platform inference** — `--stack` now optional.
- **electron** platform; platforms documented as an ARRAY (polyglot is normal).
- 📝 learnings-flush pre-flight warning in `dev-spec-kit pr`; 🧹 doctor lists stale isolation
  worktrees (visibility only).

### Fixed
- **FIX-PROOF-04** — every proof surface (PR body, approvals, audit log → LEDGER) stamps
  the tested TREE identity via one shared renderer; bare sha only as legacy fallback.
- **FIX-PROV-01** — the graphify hint carries verifiable pointers only (no rotting star counts).

### Docs
- README: "Built for Claude Code first; other assistants later."
- Skills rewritten: Gherkin-first spec authoring with the 4-category edge mandate,
  verify-before-PR, resume-first after any break, pipefail for scripted gate commands.
