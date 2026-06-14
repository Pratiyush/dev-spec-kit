import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { revitify } from "revitify";
import type { GraphNode } from "../graph/types.js";

/**
 * graphify integration — the code-side of the Verified Traceability Graph.
 *
 * graphify (PyPI `graphifyy`, CLI `graphify`) indexes the codebase into `graphify-out/graph.json`
 * (gitignored, derived). Code-only refresh needs no LLM key: `graphify update <path>`. Rivet ingests
 * its nodes as `codeNode`s and overlays the proven spec/test/PR edges. Freshness: graphify stamps
 * `built_at_commit` in graph.json and we mirror the last-indexed SHA in committed state.
 */

/** Resolve the graphify executable: PATH first, then uv's default install location. */
export function graphifyBin(): string | null {
  if (spawnSync("graphify", ["--help"], { stdio: "ignore" }).status === 0) return "graphify";
  const uvPath = join(homedir(), ".local", "bin", "graphify");
  if (existsSync(uvPath)) return uvPath;
  return null;
}

export function graphifyInstalled(): boolean {
  return graphifyBin() !== null;
}

// FIX-PROV-01: provenance is verifiable pointers only (repo URL, package name, owner) — never a
// point-in-time vanity metric. The shipped star count was stale-by-construction AND wrong.
export const GRAPHIFY_INSTALL_HINT =
  "Optional — Rivet's graph features run on the BUNDLED revitify provider by default (zero installs). " +
  'To opt into the external tool instead (multi-modal: PDFs/images/video), set graphify.provider to "graphify" and ' +
  "pip install graphifyy && graphify install — 'graphifyy' (double-y) is graphify's official PyPI package name; " +
  "the CLI stays 'graphify'. Source: https://github.com/safishamsi/graphify (MIT — verify the repo yourself).";

/** Raw graphify graph.json (verified against v0.8.37 output). */
interface RawGraph {
  built_at_commit?: string;
  nodes?: Array<{
    id?: string;
    name?: string;
    label?: string;
    source_file?: string;
    source_location?: string;
    community?: number;
    [k: string]: unknown;
  }>;
  links?: Array<{ source?: unknown; target?: unknown; relation?: string; [k: string]: unknown }>;
  edges?: Array<{
    source?: unknown;
    target?: unknown;
    from?: unknown;
    to?: unknown;
    relation?: string;
    [k: string]: unknown;
  }>;
}

export interface CodeLink {
  from: string;
  to: string;
  relation?: string;
}

export interface CodeGraph {
  nodes: GraphNode[];
  /** Raw code-to-code links (kept opaque; Rivet's proven edges are layered separately). */
  links: CodeLink[];
  /** Commit the graph was built at, when graphify recorded it. */
  builtAtCommit?: string;
}

/** Load graphify's graph.json into Rivet codeNodes (tolerant of older/other shapes too). */
export function loadCodeGraph(graphJsonPath: string): CodeGraph {
  const raw = JSON.parse(readFileSync(graphJsonPath, "utf8")) as RawGraph;
  const nodes: GraphNode[] = (raw.nodes ?? []).map((n, i) => ({
    id: String(n.id ?? n.name ?? n.label ?? `node-${i}`),
    kind: "codeNode",
    label: String(n.label ?? n.name ?? n.id ?? `node-${i}`),
    meta: { sourceFile: n.source_file, sourceLocation: n.source_location, community: n.community },
  }));
  const rawEdges = raw.links ?? raw.edges ?? [];
  const links: CodeLink[] = [];
  for (const e of rawEdges) {
    const from = endpointId(e.source ?? (e as { from?: unknown }).from);
    const to = endpointId(e.target ?? (e as { to?: unknown }).to);
    if (from === undefined || to === undefined) continue;
    links.push({ from, to, ...(e.relation ? { relation: e.relation } : {}) });
  }
  return { nodes, links, ...(raw.built_at_commit ? { builtAtCommit: raw.built_at_commit } : {}) };
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
 * Re-index the project's CODE graph via `graphify update <path>` (no LLM key needed), then record
 * freshness. Returns the graph.json path, or null when graphify is not installed (caller surfaces
 * the install hint — never silent).
 */
export function refreshCodeGraph(projectDir: string, outDir = "graphify-out"): string | null {
  const bin = graphifyBin();
  if (!bin) return null;
  const res = spawnSync(bin, ["update", "."], { cwd: projectDir, stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) {
    throw new Error(`graphify update exited ${res.status}: ${res.stderr?.toString().slice(0, 500)}`);
  }
  const head = gitHead(projectDir);
  if (head) writeFreshness(projectDir, head);
  const graphJson = join(projectDir, outDir, "graph.json");
  return existsSync(graphJson) ? graphJson : null;
}

export type GraphProvider = "revitify" | "graphify";

/** FEAT-REVITIFY-01: revitify ships inside Rivet — it is ALWAYS available; pip never required. */
export function providerAvailable(provider: GraphProvider): boolean {
  return provider === "revitify" ? true : graphifyInstalled();
}

/**
 * Provider-aware refresh: revitify's FULL engine (tree-sitter multi-language, cache, workers)
 * runs via its CLI in a synchronous subprocess — the same shape as the external graphify
 * provider, so materialize stays sync. The classic in-process sync call remains the fallback
 * when the CLI is not resolvable (older revitify builds). Same graphify-out/ contract either way.
 */
export function refreshCodeGraphVia(
  provider: GraphProvider,
  projectDir: string,
  outDir = "graphify-out",
): string | null {
  if (provider === "graphify") return refreshCodeGraph(projectDir, outDir);
  const cli = revitifyCli();
  if (cli) {
    const res = spawnSync(process.execPath, [cli, "build", projectDir, "--out", outDir], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (res.status !== 0) {
      throw new Error(`revitify build exited ${res.status}: ${res.stderr?.toString().slice(0, 500)}`);
    }
  } else {
    revitify(projectDir, outDir);
  }
  const head = gitHead(projectDir);
  if (head) writeFreshness(projectDir, head);
  const graphJson = join(projectDir, outDir, "graph.json");
  return existsSync(graphJson) ? graphJson : null;
}

/** revitify's CLI entry, resolved relative to the installed package (null on older builds). */
function revitifyCli(): string | null {
  try {
    const pkg = createRequire(import.meta.url).resolve("revitify/package.json");
    const cli = join(dirname(pkg), "dist", "cli", "main.js");
    return existsSync(cli) ? cli : null;
  } catch {
    return null;
  }
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
