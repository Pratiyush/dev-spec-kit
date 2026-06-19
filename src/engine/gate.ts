import type { VerifiedTraceabilityGraph } from "./graph/types.js";

/**
 * FIX-GATE-01: the ONE gate predicate. Every PR-blocking surface (PreToolUse hook, `dev-spec-kit guard pr`,
 * `dev-spec-kit pr`) uses this rule — "anything not green blocks", and the ABSENCE of a graph blocks too
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
    return {
      ok: false,
      reasons: ["no .dev-spec-kit/graph.json — run `dev-spec-kit graph build` before creating a PR"],
    };
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

/**
 * FEAT-VERIFY-01 — the second half of the PR gate: the LAST `verify.run` journal event must exist,
 * be green, and carry the CURRENT code-tree hash. A green task is not a green project; a verify
 * from before the last code change vouches for code that no longer exists.
 */
export function verifyVerdict(
  events: ReadonlyArray<{ type: string; data?: unknown }>,
  currentTree: string | undefined,
): GateVerdict {
  const last = [...events].reverse().find((e) => e.type === "verify.run");
  if (!last) {
    return {
      ok: false,
      reasons: ["no `dev-spec-kit verify` recorded — run it (build ALL + every kind) before creating a PR"],
    };
  }
  const d = (last.data ?? {}) as { passed?: boolean; tree?: string };
  if (!d.passed) return { ok: false, reasons: ["last `dev-spec-kit verify` was RED — fix and re-run it"] };
  if (d.tree && currentTree && d.tree !== currentTree) {
    return {
      ok: false,
      reasons: ["`dev-spec-kit verify` is STALE — the code tree changed since it ran; re-run it"],
    };
  }
  return { ok: true, reasons: [] };
}
