# Rivet

> Spec-driven development with a **Verified Traceability Graph** — every requirement riveted to a passing check.

**Status:** Phase 0 (foundation). Early, not yet usable. Repo: `Pratiyush/llm-dev-kit`.

Rivet is a Spec-Kit-compatible spec-driven development tool you drive from **Claude Code**. It turns a request
(a raw idea, a GitHub/GitLab issue, or a Jira epic) into **EARS** acceptance criteria, decomposes it into a
verified plan, and — unlike other SDD tools — **proves every requirement → code → test → PR edge with a real,
executed check.** A task literally cannot be marked *done* until its bound checks pass.

It builds on **[graphify](https://github.com/safishamsi/graphify)** for the code knowledge graph (Java,
TypeScript, Python, and 20+ more languages) and overlays the proven spec/test/PR edges and their proof states
on top — the **Verified Traceability Graph**.

## Why

Every SDD tool today writes acceptance criteria as *text* and trusts the model to honor them (the "verification
hole"), and most drown small changes in ceremony. Rivet's answer: **evidence-bound "done"** (no green without a
real passing check) and **ceremony proportional to change size** (a fast path for small changes; the full spec
pipeline only when a feature earns it).

## Pairs well with

Rivet is the **enforcement + traceability layer**; it deliberately does not duplicate generic dev
craft. We recommend installing [superpowers](https://github.com/obra/superpowers) (MIT) alongside it
for brainstorming, systematic debugging, git-worktree discipline, and parallel subagent dispatch —
Rivet's skills compose with them and pick up where they stop: proofs, gates, and the graph.

## Prerequisites

- **Node.js ≥ 22** and **git**
- **Python ≥ 3.10** and **graphify**: `pip install graphifyy && graphify install`
  (the PyPI package is `graphifyy`; the CLI is `graphify`)
- Per-stack build/test tools for your targets (e.g. a JDK + Maven for Spring/Quarkus; pytest for Python)

Run `rivet doctor` to check all of these.

## The input contract — the tool never changes, only its inputs

Rivet has three layers: **engine code** (changes only when Rivet evolves), **skills** (the tool's
voice, versioned here under `skills/`), and **project inputs** — the only thing that changes per
project, all under `.rivet/` in your repo:

| Input | Format | Purpose |
|---|---|---|
| `.rivet/config.json` | JSON (zod-validated) | every policy knob — gates, TDD, runners, autonomy |
| `.rivet/specs/*.md` | Markdown + EARS + `@check` | requirements; source of truth for tasks & proofs |
| `.rivet/intake/*.md` | Markdown + YAML frontmatter | raw ideas/tickets, verbatim; `rivet route --file` |
| `.rivet/constitution.md` | Markdown | the rules the agent must always obey |
| `.rivet/learnings.md` | Markdown (append-only) | the retro loop; lessons promote into rules/checks |
| `verify.runners` (in config) | JSON command templates | new test stacks with zero code changes |

State Rivet writes (also in-repo, committed): `journal.jsonl`, `graph.json`, `approvals/`, `pr-body.md`.

## Develop

```bash
pnpm install
pnpm build
node dist/cli/index.js doctor    # or: pnpm dev doctor
node dist/cli/index.js init
pnpm test
```

## Roadmap

P0 foundation → **P1 vertical slice** (one verified change end-to-end on a real Spring Boot project) → P2
multi-kind verification + drift detection → P3 planning depth + agent roster → P4 state/continuity + parallelism
→ P5 rules/steering + learning loop → P6 intake adapters (Jira/GitLab/GitHub) → P7 dashboard + public release.

## License

MIT © Pratiyush Kumar Singh
