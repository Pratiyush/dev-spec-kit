---
name: dev-spec-kit-graph
description: Build, refresh, and read dev-spec-kit's Verified Traceability Graph — provider-agnostic. Keep it fresh with the build wrapper, read blast radius / implements-edges / drift to answer "what breaks if this changes?", and run the staleness re-prove dance. For choosing and configuring the code-graph engine itself, see the dev-spec-kit-revitify and dev-spec-kit-graphify skills.
---

# dev-spec-kit graph — the code-side of the moat

dev-spec-kit's graph has two layers fused into one artifact:

1. **The code graph** — nodes (functions/classes/files) and their import/call links, built by a
   provider (revitify or graphify) into `graphify-out/graph.json` (derived, gitignored).
2. **The overlay** — dev-spec-kit reads those code nodes and lays the *proven* spec/test/PR edges on
   top, writing the Verified Traceability Graph to `.dev-spec-kit/graph.json`.

The provider answers "what is the code?"; the overlay answers "what is *proven* about it?". Your job
is to keep both fresh and to read the second one — never to hand-author either.

## Providers — separate skills own this

Two engines can feed the **same** `graphify-out/graph.json` contract, so the graph loop below is
identical no matter which is configured (via `graphify.provider`):

- **revitify** — the bundled default, zero install. See the `dev-spec-kit-revitify` skill.
- **graphify** — the external, multi-modal opt-in. See the `dev-spec-kit-graphify` skill.

Picking or switching a provider is just a config change plus a rebuild; it never touches specs or
proofs. Everything below is provider-agnostic.

## Build & refresh — the wrapper

- `dev-spec-kit init` seeds the provider config (defaults to revitify) and gitignores the derived
  output. Skip it on an already-initialized project.
- `dev-spec-kit graph build` is **both create and update**: it re-indexes the code graph when HEAD
  has moved since the last index (freshness is tracked in `.dev-spec-kit/graph-state.json`), then
  fuses specs + journal + code graph into `.dev-spec-kit/graph.json`. It is idempotent — run it as
  often as you like. `--no-refresh` skips the re-index and only re-fuses.
- It **exits 1 on any red or stale proof**. A non-green graph is a STOP, not a warning — fix the
  proofs, do not work around the exit code.

## Reading the graph — what it answers

- **Blast radius** — a changed file → the proven edges that would go stale. *Source* files light up
  too, via implements-edges, so a PR body shows "this change moves these proofs": `dev-spec-kit affected`.
- **implements-edges** — `source → requirement`, derived from the code graph's test→source imports
  and carrying that requirement's *worst-of-chain* proof. An implements edge is **never greener than
  the checks behind it**; a widely-imported module links broadly by design (structural tie, not
  line-coverage).
- **unimplemented / untested** — requirements with no green `implements` edge, criteria with no green
  `validates` edge. A live "what isn't provably built/tested yet?" list.
- **Drift** — red or stale proofs plus the stack each last ran under: `dev-spec-kit drift`.
- `dev-spec-kit trace` prints the full traceability table; `dev-spec-kit status` the summary.

## The staleness rule (the re-prove dance) — non-negotiable

A proof's identity is the **working-tree content hash minus `.dev-spec-kit/`**. So ANY code or doc
change after a proof turns that proof *stale*. To get back to green:

1. `dev-spec-kit verify --stamp` — re-run the suites and stamp fresh proofs.
2. `dev-spec-kit graph build` — re-fuse and confirm green.
3. Commit the refreshed `.dev-spec-kit/` state.

State-only commits do **not** re-stale (they are excluded from the hash), so the dance terminates.

You MUST NOT hand-edit `.dev-spec-kit/graph.json`, `.dev-spec-kit/graph-state.json`, or
`graphify-out/` to force green — they are derived; regenerate them. NEVER fake a proof: a green graph
built on an unexecuted check defeats the entire tool.

## Rules

- The graph MUST be green before any PR.
- You MUST run `dev-spec-kit graph build` after any code change that could move a proof.
- NEVER commit `graphify-out/` — it is gitignored, derived, and regenerated from code.
- Provider choice is owned by `dev-spec-kit-revitify` / `dev-spec-kit-graphify`; this skill stays
  agnostic — never hard-code one provider's mechanics into the graph loop.
