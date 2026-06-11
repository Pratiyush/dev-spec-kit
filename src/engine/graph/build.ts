import type { Requirement } from "../spec/ears.js";
import type { Task } from "../state/tasks.js";
import type { CodeGraph } from "../graphify/index.js";
import type { CheckResult, GraphEdge, GraphNode, ProofState, VerifiedTraceabilityGraph } from "./types.js";

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
  /** Current HEAD of the project; proofs taken at other SHAs are stale. */
  currentSha?: string;
  codeGraph?: CodeGraph;
}

export function buildVTG(input: BuildInput): VerifiedTraceabilityGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Latest recorded result per check ref, across all tasks (the journal's verdicts).
  const latest = new Map<string, CheckResult>();
  for (const t of input.tasks) {
    for (const [ref, r] of Object.entries(t.results)) {
      const prev = latest.get(ref);
      if (!prev || r.at > prev.at) latest.set(ref, r);
    }
  }

  const codeByNormLabel = new Map<string, GraphNode>();
  if (input.codeGraph) {
    for (const n of input.codeGraph.nodes) {
      nodes.push(n);
      codeByNormLabel.set(n.label.toLowerCase(), n);
    }
  }

  const testNodes = new Map<string, GraphNode>();
  let edgeSeq = 0;
  const edge = (from: string, to: string, kind: GraphEdge["kind"], proof: ProofState, lastCheck?: CheckResult) =>
    edges.push({ id: `e${++edgeSeq}`, from, to, kind, proof, ...(lastCheck ? { lastCheck } : {}) });

  for (const req of input.requirements) {
    nodes.push({ id: req.id, kind: "requirement", label: req.title });
    for (const c of req.criteria) {
      nodes.push({ id: c.id, kind: "acceptanceCriterion", label: c.text });
      edge(c.id, req.id, "derivedFrom", "unproven");

      for (const binding of c.checks) {
        // One test node per distinct check ref.
        let test = testNodes.get(binding.ref);
        if (!test) {
          test = { id: `test:${binding.ref}`, kind: "test", label: binding.ref, meta: { kind: binding.kind } };
          testNodes.set(binding.ref, test);
          nodes.push(test);

          // Anchor the test to graphify's code node for its class file (e.g. "Class#m" -> class.java).
          const className = binding.ref.split(/[#:]/)[0]!.split("/").pop()!;
          const anchor =
            codeByNormLabel.get(`${className.toLowerCase()}.java`) ??
            codeByNormLabel.get(className.toLowerCase());
          if (anchor) edge(test.id, anchor.id, "dependsOn", "unproven");
        }

        const result = latest.get(binding.ref);
        const proof: ProofState = !result
          ? "unproven"
          : !result.passed
            ? "red"
            : input.currentSha && result.sha && result.sha !== input.currentSha
              ? "stale"
              : "green";
        edge(test.id, c.id, "validates", proof, result);
      }
    }
  }

  return { nodes, edges };
}

export interface VTGSummary {
  requirements: number;
  criteria: number;
  tests: number;
  codeNodes: number;
  validates: Record<ProofState, number>;
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
