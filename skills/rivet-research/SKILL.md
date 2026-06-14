---
name: rivet-research
description: Augment a requirement or intake with current, cited best-practice before it's finalized — search the web, read the sources, and write findings back as linked evidence. Use when a spec touches a fast-moving area (a protocol, a library API, a security pattern) the model shouldn't answer from memory.
---

# Rivet research — ground the spec in current sources, never invent

Rivet's law is **research-first, never-invent**: every non-obvious claim traces to a source. Before a
requirement that depends on outside knowledge is finalized, gather current context and attach it.

## Steps
1. **Scope** to the requirement/intake at hand and the specific question ("current OAuth 2.1 PKCE
   requirements", "the vitest JSON reporter schema").
2. **Search + read** — use the web tools; open the primary/authoritative sources (official docs,
   RFCs, the library's own repo), not just summaries.
3. **Adversarially check** the key claims against a second source before relying on them; note
   anything you could not confirm.
4. **Write back** the findings into the intake/spec as a short, **cited** evidence block (claim →
   URL), linked to the requirement it informs. Keep it tight — the most decision-relevant facts only.

## Rules (RFC-2119)
- Every factual claim you add MUST carry its source URL; an uncited "best practice" is exactly the
  invention this skill exists to prevent.
- You MUST flag staleness and disagreement between sources rather than silently picking one.
- Research informs the criteria; it does not replace them — the requirement still needs a bound,
  falsifiable `@check`. Findings can become a `kind=judge` rubric only when the criterion is
  genuinely unmeasurable by a test.
- Verify claims against the actual page (fetch it); do not answer "current" questions from memory.
