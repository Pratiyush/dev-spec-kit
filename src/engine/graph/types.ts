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

/** A changed file and the proven edges it touches in the graph. */
export interface FileBlast {
  file: string;
  edges: GraphEdge[];
}

const normPath = (f: string): string => f.replace(/^\.?\/+/, "").replaceAll("\\", "/");

/**
 * FEAT-BLAST-01 — the PR's blast radius: for each CHANGED file, the proven edges it touches, so a PR
 * body can say "this change moves these proofs". Two mappings from the same VTG:
 *  - a changed TEST file is the `from` of a `validates` edge (matched via the proof ref's file);
 *  - a changed SOURCE file maps to a `codeNode` (via `meta.sourceFile`), whose proven edges follow.
 * Pure over (graph, changedFiles); edges are deduped per file. Files that map to nothing are dropped.
 */
export function prBlastRadius(g: VerifiedTraceabilityGraph, changedFiles: string[]): FileBlast[] {
  const wanted = new Set(changedFiles.map(normPath));
  if (wanted.size === 0) return [];
  const nodesByFile = new Map<string, string[]>();
  for (const n of g.nodes) {
    if (n.kind !== "codeNode") continue;
    const src = n.meta?.["sourceFile"];
    if (typeof src === "string") {
      const key = normPath(src);
      const arr = nodesByFile.get(key);
      if (arr) arr.push(n.id);
      else nodesByFile.set(key, [n.id]);
    }
  }
  const out: FileBlast[] = [];
  for (const file of wanted) {
    const edges = new Map<string, GraphEdge>();
    for (const e of g.edges) {
      if (e.kind !== "validates") continue;
      const ref = e.lastCheck?.ref ?? e.from.replace(/^test:/, "");
      if (normPath(ref.split("::")[0] ?? "") === file) edges.set(e.id, e);
    }
    for (const id of nodesByFile.get(file) ?? []) for (const e of blastRadius(g, id)) edges.set(e.id, e);
    if (edges.size > 0) out.push({ file, edges: [...edges.values()] });
  }
  return out;
}

/** Proven edges whose proof is no longer trustworthy — red (failed) or stale (code changed since). */
export function driftedEdges(g: VerifiedTraceabilityGraph): GraphEdge[] {
  return g.edges.filter((e) => PROVEN_EDGE_KINDS.has(e.kind) && (e.proof === "red" || e.proof === "stale"));
}
