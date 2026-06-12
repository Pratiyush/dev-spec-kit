/**
 * The Verified Traceability Graph (VTG) — Rivet's moat.
 *
 * A graph of SDLC artifacts whose load-bearing edges are *gates proven by an executed check*, not
 * LLM-asserted links. An `implements`/`validates`/`satisfies` edge is only "green" when its bound
 * check last ran and passed; it goes "stale" when code on either end changed since the proof.
 *
 * graphify provides the code-side nodes/edges; Rivet overlays the spec/test/PR edges + proof states.
 */

/** Node kinds (the SDLC artifacts). */
export type NodeKind =
  | "product"
  | "research"
  | "requirement"
  | "feature"
  | "epic"
  | "story"
  | "task"
  | "subtask"
  | "architecture"
  | "adr"
  | "codeSpec"
  | "codeNode"
  | "test"
  | "acceptanceCriterion"
  | "pullRequest"
  | "repoObject";

/** Edge kinds. `implements` / `validates` / `satisfies` are the *proven* edges. */
export type EdgeKind = "derivedFrom" | "implements" | "validates" | "satisfies" | "dependsOn" | "blocks";

/**
 * Proof state of an edge — the heart of the moat.
 * - `unproven`: no check has run yet.
 * - `green`: the bound check last ran and passed.
 * - `red`: the bound check last ran and failed.
 * - `stale`: code on either end changed since the last green proof; must be re-verified.
 */
export type ProofState = "unproven" | "green" | "red" | "stale";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  meta?: Record<string, unknown>;
}

export interface CheckResult {
  /** test id / "file::test" / a property description. */
  ref: string;
  passed: boolean;
  /** ISO timestamp of the run. */
  at: string;
  /** commit SHA the proof was taken at. */
  sha?: string;
  /** content tree-hash of the working state actually tested (FIX-PROOF-01: the real identity). */
  tree?: string;
  /** true when the tree had uncommitted changes at proof time. */
  dirty?: boolean;
  /** stack the check ran under (recorded so drift can re-run it without asking). */
  stack?: string;
  /** check kind (unit/integration/api/e2e/visual/parity) the proof was taken as. */
  kind?: string;
  /** true when the run only passed after flaky retries. */
  flaky?: boolean;
  /** Truncated stdout/stderr tail captured on FAILURE — the proof carries its own diagnostic. */
  tail?: string;
}

export interface GraphEdge {
  id: string;
  /** source node id. */
  from: string;
  /** target node id. */
  to: string;
  kind: EdgeKind;
  proof: ProofState;
  lastCheck?: CheckResult;
}

export interface VerifiedTraceabilityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** The edge kinds whose truth is established by an executed check. */
export const PROVEN_EDGE_KINDS: ReadonlySet<EdgeKind> = new Set<EdgeKind>([
  "implements",
  "validates",
  "satisfies",
]);

function hasGreenEdge(
  g: VerifiedTraceabilityGraph,
  nodeId: string,
  kind: EdgeKind,
  dir: "in" | "out",
): boolean {
  return g.edges.some(
    (e) => e.kind === kind && e.proof === "green" && (dir === "out" ? e.from === nodeId : e.to === nodeId),
  );
}

/** Requirements with no GREEN `implements` edge pointing at them — not provably implemented. */
export function unimplementedRequirements(g: VerifiedTraceabilityGraph): GraphNode[] {
  return g.nodes.filter((n) => n.kind === "requirement" && !hasGreenEdge(g, n.id, "implements", "in"));
}

/** Acceptance criteria with no GREEN `validates` edge — not provably tested. */
export function untestedCriteria(g: VerifiedTraceabilityGraph): GraphNode[] {
  return g.nodes.filter((n) => n.kind === "acceptanceCriterion" && !hasGreenEdge(g, n.id, "validates", "in"));
}

/**
 * Blast radius of a code node: the proven edges touching it that would need re-verification if it
 * changes (i.e. are at risk of going stale/red). Powers "what breaks if this changes?".
 */
export function blastRadius(g: VerifiedTraceabilityGraph, codeNodeId: string): GraphEdge[] {
  return g.edges.filter(
    (e) => (e.from === codeNodeId || e.to === codeNodeId) && PROVEN_EDGE_KINDS.has(e.kind),
  );
}

/** Proven edges whose proof is no longer trustworthy — red (failed) or stale (code changed since). */
export function driftedEdges(g: VerifiedTraceabilityGraph): GraphEdge[] {
  return g.edges.filter((e) => PROVEN_EDGE_KINDS.has(e.kind) && (e.proof === "red" || e.proof === "stale"));
}
