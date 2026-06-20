---
name: dev-spec-kit-revitify
description: dev-spec-kit's default code-graph provider — the bundled revitify engine (native TypeScript, tree-sitter multi-language). Zero install, zero API key, always available. Use to understand when revitify is the right provider, how it is configured, what it can and cannot index, and how it feeds the Verified Traceability Graph. For the build/read loop itself, see dev-spec-kit-graph.
---

# revitify — the bundled, default graph provider

revitify is dev-spec-kit's **built-in** code-graph engine: a native-TypeScript indexer (tree-sitter,
multi-language, with a cache and workers). It ships **inside** dev-spec-kit as a normal dependency,
so it is **always available** — no `pip`, no external binary, no API key. It is the default value of
`graphify.provider` and the right choice for essentially every project.

## What it does

- Walks the repo and indexes source across languages into nodes (functions / classes / files) and
  their import/call links, writing the `graphify-out/graph.json` contract that dev-spec-kit ingests
  as `codeNode`s and overlays proven edges onto.
- Runs on `dev-spec-kit graph build` with **nothing to configure** — it is already the default.
- Reports as always-OK under `dev-spec-kit doctor` (it cannot be "missing" — it is bundled).

## When revitify is the right provider

- **Code-only projects** — i.e. almost all of them. If the spec's evidence lives in source code,
  revitify is strictly better than the alternative: same graph contract, zero install cost.
- Choose the other provider **only** when you must index non-code artifacts (PDFs, images, video) —
  that is the sole reason to leave the default. See `dev-spec-kit-graphify`.

## Provenance

revitify is an independent MIT **port** of the Python "graphify" project
(github.com/safishamsi/graphify). graphify is credited as the upstream inspiration and is never a
runtime dependency of revitify — the bundled engine stands alone.

## Rules

- revitify is bundled and ALWAYS available — you MUST NOT switch to the external graphify provider
  merely to avoid an install. That trades a working default for an external dependency and buys
  nothing on a code-only project.
- `graphify-out/` is derived — NEVER hand-edit or commit it; regenerate via `dev-spec-kit graph build`.
- For the build/refresh wrapper, reading blast radius / implements-edges, and the staleness re-prove
  dance, follow `dev-spec-kit-graph` — those mechanics are provider-agnostic and identical here.
