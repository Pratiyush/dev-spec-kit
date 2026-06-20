---
name: dev-spec-kit-graphify
description: dev-spec-kit's optional code-graph provider — the external Python graphify tool (multi-modal: indexes PDFs, images, and video alongside code). Opt-in only. Use to decide when graphify is worth its install over the bundled revitify default, how to install and configure it, and how dev-spec-kit verifies and falls back when it is absent. For the build/read loop itself, see dev-spec-kit-graph.
---

# graphify — the external, multi-modal opt-in provider

graphify is an **external** Python tool (CLI `graphify`, PyPI package `graphifyy` — double-y). Its
one advantage over the bundled revitify default is **reach**: it indexes non-code artifacts — PDFs,
images, video — alongside source. It is **opt-in** and worth installing only when the spec's evidence
actually lives in those artifacts.

## When to opt in (and when not to)

- **Opt in only** when a requirement depends on non-code material graphify can read and revitify
  cannot. That is the entire reason this provider exists.
- For a code-only project, do **not** opt in — the bundled revitify default gives the same graph
  contract with zero install. See `dev-spec-kit-revitify`.

## Install & configure

1. Install: `pip install graphifyy && graphify install` (the package is `graphifyy`; the CLI stays
   `graphify`).
2. Switch the provider: set `graphify.provider` to `graphify` in `.dev-spec-kit/config.json`.
3. Verify: `dev-spec-kit doctor` reports it as installed or missing.

Because it honors the **same** `graphify-out/graph.json` contract as revitify, switching is just that
config change plus a rebuild — specs and proofs are untouched.

## Safety net

If `graphify.provider` is `graphify` but the tool is not installed, dev-spec-kit does not break — it
degrades to the spec/test overlay only and tells you so. The code-graph features simply run on the
bundled revitify provider until graphify is present. dev-spec-kit never hard-fails on a missing
external provider.

## Provenance

graphify is MIT (source: github.com/safishamsi/graphify) — verify the repo yourself before trusting
a build. It is the upstream that revitify ports; here it is an optional external tool, never bundled.

## Rules

- You MUST run `dev-spec-kit doctor` to confirm graphify is installed before relying on its output.
- NEVER opt into graphify for a code-only project just to "have more" — the install cost buys nothing
  there, and the bundled revitify default is the correct choice.
- `graphify-out/` is derived — NEVER commit it; regenerate via `dev-spec-kit graph build`.
- For the build/refresh wrapper, reading the graph, and the staleness re-prove dance, follow
  `dev-spec-kit-graph` — those mechanics are provider-agnostic and identical here.
