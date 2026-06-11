import type { VerifiedTraceabilityGraph } from "./graph/types.js";

/**
 * FIX-GATE-01: the ONE gate predicate. Every PR-blocking surface (PreToolUse hook, `rivet guard pr`,
 * `rivet pr`) uses this rule — "anything not green blocks", and the ABSENCE of a graph blocks too
 * (state absence is not permission). hooks/guard-pr.mjs mirrors this logic self-contained; keep in sync.
 */

export interface GateVerdict {
  ok: boolean;
  reasons: string[];
  /** True when the graph exists but binds zero proofs (nothing to enforce — passes with a notice). */
  zeroProofs?: boolean;
}

export function gateVerdict(graph: VerifiedTraceabilityGraph | null | undefined): GateVerdict {
  if (!graph) {
    return { ok: false, reasons: ["no .rivet/graph.json — run `rivet graph build` before creating a PR"] };
  }
  const validates = graph.edges.filter((e) => e.kind === "validates");
  if (validates.length === 0) return { ok: true, reasons: [], zeroProofs: true };
  const bad = validates.filter((e) => e.proof !== "green");
  if (bad.length === 0) return { ok: true, reasons: [] };
  return {
    ok: false,
    reasons: bad.map((e) => `${e.proof.toUpperCase()} ${e.lastCheck?.ref ?? e.from.replace(/^test:/, "")}`),
  };
}
