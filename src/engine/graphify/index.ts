import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { GraphNode } from "../graph/types.js";

/**
 * graphify integration — the code-side of the Verified Traceability Graph.
 *
 * graphify (PyPI `graphifyy`, CLI `graphify`) indexes the codebase into `graphify-out/graph.json`
 * (gitignored, derived). Rivet ingests its nodes as `codeNode`s and overlays the proven
 * spec/test/PR edges. Freshness: we record the last-indexed commit SHA in committed state and
 * re-index via `graphify <dir> --update` when HEAD moves (graphify also offers --watch and a
 * post-commit hook for continuous sync).
 */

export function graphifyInstalled(): boolean {
  const res = spawnSync("graphify", ["--help"], { stdio: "ignore" });
  return res.status === 0;
}

export const GRAPHIFY_INSTALL_HINT =
  "pip install graphifyy && graphify install   (PyPI package is 'graphifyy'; CLI is 'graphify')";

/** Raw graphify graph.json shapes we tolerate (d3-style nodes/links or nodes/edges). */
interface RawGraph {
  nodes?: Array<{ id?: string; name?: string; label?: string; type?: string; [k: string]: unknown }>;
  links?: Array<{ source?: unknown; target?: unknown; [k: string]: unknown }>;
  edges?: Array<{ source?: unknown; target?: unknown; from?: unknown; to?: unknown; [k: string]: unknown }>;
}

export interface CodeGraph {
  nodes: GraphNode[];
  /** Raw code-to-code links (kept opaque; Rivet's proven edges are layered separately). */
  links: Array<{ from: string; to: string }>;
}

/**
 * Load graphify's graph.json into Rivet codeNodes. Tolerant of shape variations; the exact schema
 * is pinned down against real output during P1 (tooling honesty: best-effort until then).
 */
export function loadCodeGraph(graphJsonPath: string): CodeGraph {
  const raw = JSON.parse(readFileSync(graphJsonPath, "utf8")) as RawGraph;
  const nodes: GraphNode[] = (raw.nodes ?? []).map((n, i) => ({
    id: String(n.id ?? n.name ?? n.label ?? `node-${i}`),
    kind: "codeNode",
    label: String(n.label ?? n.name ?? n.id ?? `node-${i}`),
    meta: { type: n.type },
  }));
  const rawEdges = raw.links ?? raw.edges ?? [];
  const links = rawEdges
    .map((e) => ({
      from: endpointId(e.source ?? (e as { from?: unknown }).from),
      to: endpointId(e.target ?? (e as { to?: unknown }).to),
    }))
    .filter((l): l is { from: string; to: string } => l.from !== undefined && l.to !== undefined);
  return { nodes, links };
}

/** d3 edge endpoints may be ids or node objects. */
function endpointId(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return undefined;
}

/** Committed freshness record: which commit the code graph was last indexed at. */
export interface GraphFreshness {
  lastIndexedSha: string | null;
}

const FRESHNESS_FILE = join(".rivet", "graph-state.json");

export function readFreshness(projectDir: string): GraphFreshness {
  const p = join(projectDir, FRESHNESS_FILE);
  if (!existsSync(p)) return { lastIndexedSha: null };
  try {
    return JSON.parse(readFileSync(p, "utf8")) as GraphFreshness;
  } catch {
    return { lastIndexedSha: null };
  }
}

export function writeFreshness(projectDir: string, sha: string): void {
  const p = join(projectDir, FRESHNESS_FILE);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ lastIndexedSha: sha } satisfies GraphFreshness, null, 2) + "\n");
}

/** Does the code graph need re-indexing (HEAD moved since last index)? */
export function isStale(projectDir: string): boolean {
  const head = gitHead(projectDir);
  if (!head) return true;
  return readFreshness(projectDir).lastIndexedSha !== head;
}

/**
 * Re-index the project with graphify (incremental --update when prior output exists), then record
 * freshness. Returns the graph.json path, or null when graphify is not installed (caller surfaces
 * the install hint — never silent).
 */
export function refreshCodeGraph(projectDir: string, outDir = "graphify-out"): string | null {
  if (!graphifyInstalled()) return null;
  const graphJson = join(projectDir, outDir, "graph.json");
  const args = existsSync(graphJson) ? [".", "--update"] : ["."];
  const res = spawnSync("graphify", args, { cwd: projectDir, stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) {
    throw new Error(`graphify exited ${res.status}: ${res.stderr?.toString().slice(0, 500)}`);
  }
  const head = gitHead(projectDir);
  if (head) writeFreshness(projectDir, head);
  return existsSync(graphJson) ? graphJson : null;
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
