import { requirementKind, type Requirement } from "../spec/ears.js";
import type { Task } from "../state/tasks.js";
import type { CodeGraph } from "../graphify/index.js";
import type { CheckResult, GraphEdge, GraphNode, ProofState, VerifiedTraceabilityGraph } from "./types.js";
import { normPath } from "./types.js";

/**
 * The overlay builder — fuses the three sources of truth into the Verified Traceability Graph:
 *   specs (requirements + EARS criteria + @check bindings)  ×  journal (executed check results)
 *   ×  graphify's code graph (codeNodes)
 *
 * Proof-state rules for a `validates` edge (test → criterion):
 *   no recorded run            -> unproven
 *   last run failed            -> red
 *   last run passed @ HEAD     -> green
 *   last run passed @ old SHA  -> stale   (code moved since the proof — re-verify; this is drift)
 */

export interface BuildInput {
  requirements: Requirement[];
  tasks: Task[];
  /** Current HEAD (legacy staleness fallback for proofs recorded before tree hashes). */
  currentSha?: string;
  /** Content tree-hash of the current working state — the REAL identity proofs compare against. */
  currentTree?: string;
  codeGraph?: CodeGraph;
  /**
   * FEAT-INCR-01: per distinct proof-tree, the files that changed vs `currentTree` (excluding the kit's own
   * bookkeeping). When present, `buildVTG` relaxes a `stale` proof back to green if none of the files it
   * covers changed — affected-aware staleness. Absent → the conservative whole-tree compare (every proof
   * goes stale on any change).
   */
  treeChanges?: Record<string, string[]>;
}

export function buildVTG(input: BuildInput): VerifiedTraceabilityGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Latest recorded result per check ref, across all tasks (the journal's verdicts).
  const latest = new Map<string, CheckResult>();
  for (const t of input.tasks) {
    for (const [ref, r] of Object.entries(t.results)) {
      const prev = latest.get(ref);
      // FIX-QUERY-01: equal timestamps tie-break toward the WORSE result — proof state must never
      // depend on task iteration order, and when in doubt the gate stays shut.
      if (!prev || r.at > prev.at || (r.at === prev.at && prev.passed && !r.passed)) latest.set(ref, r);
    }
  }

  // SCALE-01: a label can collide (two Foo.java in different dirs) — keep ALL candidates and
  // anchor to each, so ambiguity is visible in the graph instead of last-wins arbitrary.
  const codeByNormLabel = new Map<string, GraphNode[]>();
  if (input.codeGraph) {
    for (const n of input.codeGraph.nodes) {
      nodes.push(n);
      const key = n.label.toLowerCase();
      (codeByNormLabel.get(key) ?? codeByNormLabel.set(key, []).get(key)!).push(n);
    }
  }

  const testNodes = new Map<string, GraphNode>();
  let edgeSeq = 0;
  const edge = (
    from: string,
    to: string,
    kind: GraphEdge["kind"],
    proof: ProofState,
    lastCheck?: CheckResult,
  ) => edges.push({ id: `e${++edgeSeq}`, from, to, kind, proof, ...(lastCheck ? { lastCheck } : {}) });

  for (const req of input.requirements) {
    // FEAT-IDS-01: ADR_ ids are decision records — first-class "adr" nodes in the graph.
    nodes.push({
      id: req.id,
      kind: requirementKind(req.id) === "adr" ? "adr" : "requirement",
      label: req.title,
    });
    for (const c of req.criteria) {
      nodes.push({ id: c.id, kind: "acceptanceCriterion", label: c.text });
      edge(c.id, req.id, "derivedFrom", "unproven");

      for (const binding of c.checks) {
        // One test node per distinct check ref.
        let test = testNodes.get(binding.ref);
        if (!test) {
          test = {
            id: `test:${binding.ref}`,
            kind: "test",
            label: binding.ref,
            meta: { kind: binding.kind },
          };
          testNodes.set(binding.ref, test);
          nodes.push(test);

          // Anchor the test to graphify's code node(s) for its class file ("Class#m" -> class.java).
          const className = binding.ref.split(/[#:]/)[0]!.split("/").pop()!;
          const anchors =
            codeByNormLabel.get(`${className.toLowerCase()}.java`) ??
            codeByNormLabel.get(className.toLowerCase()) ??
            [];
          for (const anchor of anchors) edge(test.id, anchor.id, "dependsOn", "unproven");
        }

        const result = latest.get(binding.ref);
        // FIX-PROOF-01: identity = tested tree when recorded (content-equal across commits stays
        // green); sha comparison only as legacy fallback for pre-tree journal entries.
        const isStaleProof = (r: CheckResult): boolean => {
          if (r.tree && input.currentTree) return r.tree !== input.currentTree;
          return !!(input.currentSha && r.sha && r.sha !== input.currentSha);
        };
        const proof: ProofState = !result
          ? "unproven"
          : !result.passed
            ? "red"
            : isStaleProof(result)
              ? "stale"
              : "green";
        edge(test.id, c.id, "validates", proof, result);
      }
    }
  }

  // FEAT-INCR-01: affected-aware staleness — relax unaffected `stale` validates edges to green BEFORE the
  // implements rollup below, so a requirement whose only "drift" is an unrelated edit reads green end-to-end.
  if (input.treeChanges && input.codeGraph) {
    relaxAffectedStaleness(edges, input.treeChanges, input.codeGraph);
  }

  // FEAT-IMPL-01: proven `implements` edges (source file → requirement). The code graph records
  // test→source imports; a requirement's bound test that imports a source file ties that file to the
  // requirement, and the edge carries the requirement's OWN rollup proof (never greener than its
  // checks). This lights up changed-SOURCE-file blast radius and makes unimplementedRequirements() live.
  if (input.codeGraph) {
    const worstByReq = new Map<string, ProofState>();
    for (const r of rollupRequirements(input.requirements, { nodes, edges })) {
      if (r.criteria.length === 0) continue;
      worstByReq.set(
        r.id,
        r.criteria.reduce<ProofState>(
          (acc, c) => (PROOF_RANK[c.proof] < PROOF_RANK[acc] ? c.proof : acc),
          "green",
        ),
      );
    }
    for (const e of deriveImplementsEdges(input.requirements, input.codeGraph, worstByReq)) {
      edge(e.from, e.to, "implements", e.proof);
    }
  }

  return { nodes, edges };
}

/** A path that is a JS/TS test file — the only side of an import the code graph anchors as a proof. */
export function isTestFile(path: string): boolean {
  return /\.(test|spec)\.[cm]?[jt]sx?$/.test(path);
}

export interface ImplementsEdgeSpec {
  from: string;
  to: string;
  proof: ProofState;
}

/**
 * FEAT-IMPL-01 — derive `implements` edges (source codeNode → requirement) from the code graph's
 * test→source import links. The source files a requirement's bound tests import are its provable
 * implementation; each gets ONE edge, anchored to a deterministic representative codeNode of that
 * file, carrying the requirement's rollup proof.
 *
 * Honest limitation: an import is a structural tie, not line-coverage — a widely-imported module
 * links to every requirement whose tests import it, so source blast radius is intentionally broad.
 * The proof still comes only from the executed `validates` checks; an `implements` edge is never
 * greener than the work behind it.
 */
export function deriveImplementsEdges(
  requirements: Requirement[],
  codeGraph: CodeGraph | undefined,
  worstProofByReq: Map<string, ProofState>,
): ImplementsEdgeSpec[] {
  if (!codeGraph || codeGraph.nodes.length === 0) return [];

  const repNodeByFile = new Map<string, string>();
  for (const n of codeGraph.nodes) {
    const raw = n.meta?.["sourceFile"];
    if (typeof raw !== "string") continue;
    const sf = normPath(raw); // align with the spec ref + prBlastRadius normalization (./, separators)
    const rep = repNodeByFile.get(sf);
    if (rep === undefined || n.id < rep) repNodeByFile.set(sf, n.id); // smallest id = a stable anchor
  }

  const imports = importsByTestFile(codeGraph);

  const out: ImplementsEdgeSpec[] = [];
  for (const req of requirements) {
    if (requirementKind(req.id) === "adr") continue; // decision records carry no implementation obligation
    const proof = worstProofByReq.get(req.id);
    if (!proof) continue; // a requirement with no criteria anchors nothing

    const sources = new Set<string>();
    for (const c of req.criteria)
      for (const ch of c.checks) {
        const file = normPath(ch.ref.split("::")[0] ?? "");
        if (file && isTestFile(file)) for (const s of imports.get(file) ?? []) sources.add(s);
      }
    for (const sf of sources) out.push({ from: repNodeByFile.get(sf)!, to: req.id, proof });
  }
  return out;
}

/**
 * test file → the NON-test source files it imports (the code graph emits test→source import links only).
 * Shared by `deriveImplementsEdges` (FEAT-IMPL-01) and `relaxAffectedStaleness` (FEAT-INCR-01) so both read
 * coverage the same way.
 */
export function importsByTestFile(codeGraph: CodeGraph): Map<string, Set<string>> {
  const sourceFileById = new Map<string, string>();
  for (const n of codeGraph.nodes) {
    const raw = n.meta?.["sourceFile"];
    if (typeof raw === "string") sourceFileById.set(n.id, normPath(raw));
  }
  const map = new Map<string, Set<string>>();
  for (const l of codeGraph.links) {
    if (l.relation !== "imports" && l.relation !== "imports_from") continue;
    const fromSf = sourceFileById.get(l.from);
    const toSf = sourceFileById.get(l.to);
    if (!fromSf || !toSf) continue;
    if (!isTestFile(fromSf) || isTestFile(toSf)) continue; // only test→source; a test is never an impl
    (map.get(fromSf) ?? map.set(fromSf, new Set()).get(fromSf)!).add(toSf);
  }
  return map;
}

/**
 * FEAT-INCR-01 — affected-aware staleness. A `validates` edge marked `stale` ONLY because the tree moved,
 * but whose covered files (its test file + the sources that test imports) are byte-identical between the
 * proof's tree and the current one, still HOLDS → relax it to `green`. Mutates `edges` in place.
 *
 * Strictly conservative: only `stale`→`green`, never touching red/unproven; and only when the proof's tree
 * is diffable (in `treeChanges`) and its ref resolves to a test file — any uncertainty leaves it stale. The
 * honest gap is structural import-coverage (a non-imported runtime dep won't stale a proof); `guard pr`'s
 * mandatory full `verify` is the net for that before a PR merges.
 */
export function relaxAffectedStaleness(
  edges: GraphEdge[],
  treeChanges: Record<string, string[]>,
  codeGraph: CodeGraph,
): void {
  const imports = importsByTestFile(codeGraph);
  for (const e of edges) {
    if (e.kind !== "validates" || e.proof !== "stale") continue;
    const ref = e.lastCheck?.ref;
    const tree = e.lastCheck?.tree;
    if (!ref || !tree) continue; // no identity to reason about → stay stale
    const changed = treeChanges[tree];
    if (!changed) continue; // this tree isn't diffable (e.g. GC'd) → stay stale
    const testFile = normPath(ref.split("::")[0] ?? "");
    const covered = new Set<string>([testFile, ...(imports.get(testFile) ?? [])]);
    const changedSet = new Set(changed.map(normPath));
    if (![...covered].some((f) => changedSet.has(f))) e.proof = "green";
  }
}

export interface VTGSummary {
  requirements: number;
  criteria: number;
  tests: number;
  codeNodes: number;
  validates: Record<ProofState, number>;
}

/**
 * Per-requirement rollup. Every binding is an OBLIGATION, so a criterion rolls up to its WORST
 * proof (green+stale = stale; green+unrun = unproven) — never its best. A requirement is proven
 * only when every criterion's worst proof is green.
 */
export interface RequirementRollup {
  id: string;
  title: string;
  criteria: Array<{ id: string; bound: boolean; proof: ProofState }>;
  proven: boolean;
}

const PROOF_RANK: Record<ProofState, number> = { unproven: 0, red: 1, stale: 2, green: 3 };

export function rollupRequirements(
  requirements: Requirement[],
  g: VerifiedTraceabilityGraph,
): RequirementRollup[] {
  const byCriterion = new Map<string, ProofState[]>();
  for (const e of g.edges) {
    if (e.kind !== "validates") continue;
    (byCriterion.get(e.to) ?? byCriterion.set(e.to, []).get(e.to)!).push(e.proof);
  }
  return requirements.map((req) => {
    const criteria = req.criteria.map((c) => {
      const proofs = byCriterion.get(c.id) ?? [];
      const proof = proofs.reduce(
        (worst, p) => (PROOF_RANK[p] < PROOF_RANK[worst] ? p : worst),
        proofs.length === 0 ? ("unproven" as ProofState) : ("green" as ProofState),
      );
      return { id: c.id, bound: c.checks.length > 0, proof };
    });
    return {
      id: req.id,
      title: req.title,
      criteria,
      proven: criteria.length > 0 && criteria.every((c) => c.proof === "green"),
    };
  });
}

/** Drift work-list: red/stale validates edges with the stack each proof last ran under. */
export interface DriftTarget {
  ref: string;
  proof: ProofState;
  stack?: string;
  taskIds: string[];
}

export function driftTargets(
  g: VerifiedTraceabilityGraph,
  tasks: Array<{ id: string; boundChecks: string[] }>,
): DriftTarget[] {
  const out = new Map<string, DriftTarget>();
  for (const e of g.edges) {
    if (e.kind !== "validates" || (e.proof !== "red" && e.proof !== "stale")) continue;
    const ref = e.lastCheck?.ref ?? e.from.replace(/^test:/, "");
    if (out.has(ref)) continue;
    const taskIds = tasks.filter((t) => t.boundChecks.includes(ref)).map((t) => t.id);
    out.set(ref, {
      ref,
      proof: e.proof,
      ...(e.lastCheck?.stack ? { stack: e.lastCheck.stack } : {}),
      taskIds,
    });
  }
  return [...out.values()];
}

export function summarize(g: VerifiedTraceabilityGraph): VTGSummary {
  const count = (kind: GraphNode["kind"]) => g.nodes.filter((n) => n.kind === kind).length;
  const validates: Record<ProofState, number> = { unproven: 0, green: 0, red: 0, stale: 0 };
  for (const e of g.edges) if (e.kind === "validates") validates[e.proof]++;
  return {
    requirements: count("requirement"),
    criteria: count("acceptanceCriterion"),
    tests: count("test"),
    codeNodes: count("codeNode"),
    validates,
  };
}
