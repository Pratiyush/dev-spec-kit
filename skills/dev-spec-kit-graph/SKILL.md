---
name: dev-spec-kit-graph
description: Build, refresh, and read dev-spec-kit's code graph — the code-side of the Verified Traceability Graph. Pick the provider (bundled revitify by default, external graphify for multi-modal), keep it fresh, and use blast radius / implements-edges / drift to answer "what breaks if this changes?". Use whenever the graph is stale, a provider question comes up, or you need source→requirement traceability.
---

# dev-spec-kit graph — the code-side of the moat

dev-spec-kit's graph has two layers fused into one artifact:

1. **The code graph** — nodes (functions/classes/files) and their import/call links, built by a
   provider (revitify or graphify) into `graphify-out/graph.json` (derived, gitignored).
2. **The overlay** — dev-spec-kit reads those code nodes and lays the *proven* spec/test/PR edges on
   top, writing the Verified Traceability Graph to `.dev-spec-kit/graph.json`.

The provider answers "what is the code?"; the overlay answers "what is *proven* about it?". Your job
is to keep both fresh and to read the second one — never to hand-author either.

## Providers — the default is already right

| | `revitify` (default) | `graphify` (opt-in) |
|---|---|---|
| Ships | **Bundled** inside dev-spec-kit | External Python tool |
| Install | none, zero key | `pip install graphifyy && graphify install` |
| Reach | code-only, tree-sitter multi-language | multi-modal: PDFs / images / video too |
| When | every normal project | only when the spec depends on non-code artifacts |

- revitify is **always** available — it is bundled. You MUST NOT switch to `graphify` merely to
  avoid an install; that trades a working default for an external dependency and gains nothing for a
  code-only project.
- Opt into graphify **only** for multi-modal ingestion: set `graphify.provider` to `graphify` in
  `.dev-spec-kit/config.json`, install it (the PyPI package is `graphifyy` — double-y — but the CLI
  stays `graphify`), then confirm with `dev-spec-kit doctor` before you rely on it. graphify is MIT
  (source: github.com/safishamsi/graphify) — verify the repo yourself.
- Both providers honor the **same** `graphify-out/graph.json` contract, so switching is just a
  rebuild — no spec or proof changes.

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
- You MUST run `dev-spec-kit doctor` before opting into the graphify provider.
- NEVER commit `graphify-out/` — it is gitignored, derived, and regenerated from code.
- NEVER switch providers to dodge an install; revitify is bundled and needs none.
