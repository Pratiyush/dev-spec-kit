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

## Prerequisites

- **Node.js ≥ 22** and **git**
- **Python ≥ 3.10** and **graphify**: `pip install graphifyy && graphify install`
  (the PyPI package is `graphifyy`; the CLI is `graphify`)
- Per-stack build/test tools for your targets (e.g. a JDK + Maven for Spring/Quarkus; pytest for Python)

Run `rivet doctor` to check all of these.

## Develop

```bash
npm install
npm run build
node dist/cli/index.js doctor    # or: npm run dev -- doctor
node dist/cli/index.js init
```

## Roadmap

P0 foundation → **P1 vertical slice** (one verified change end-to-end on a real Spring Boot project) → P2
multi-kind verification + drift detection → P3 planning depth + agent roster → P4 state/continuity + parallelism
→ P5 rules/steering + learning loop → P6 intake adapters (Jira/GitLab/GitHub) → P7 dashboard + public release.

## License

MIT © Pratiyush Kumar Singh
