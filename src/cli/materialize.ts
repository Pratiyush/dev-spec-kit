import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { gitTreeHash } from "../engine/git.js";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore, type Task } from "../engine/state/tasks.js";
import { buildVTG } from "../engine/graph/build.js";
import type { VerifiedTraceabilityGraph } from "../engine/graph/types.js";
import type { Requirement } from "../engine/spec/ears.js";
import {
  providerAvailable,
  refreshCodeGraphVia,
  loadCodeGraph,
  isStale,
  type CodeGraph,
} from "../engine/graphify/index.js";
import { type RivetConfig } from "../config/schema.js";
import { loadConfig } from "./config-io.js";

/** Shared materialization: specs + journal + (optionally refreshed) code graph -> VTG on disk. */
export interface Materialized {
  vtg: VerifiedTraceabilityGraph;
  requirements: Requirement[];
  tasks: Task[];
  head?: string;
  config: RivetConfig;
  codeGraphLoaded: boolean;
  /** Parser warnings (orphan @checks etc.) — surfaced, never swallowed. */
  specWarnings: string[];
}

export function materialize(cwd: string, opts: { refresh: boolean; write?: boolean }): Materialized {
  const specWarnings: string[] = [];
  const requirements = parseSpecsDir(cwd, specWarnings);
  const tasks = [...new TaskStore(journalFor(cwd)).all().values()];
  const config = configFor(cwd);

  let codeGraph: CodeGraph | undefined;
  const graphJson = join(cwd, config.graphify.outDir, "graph.json");
  // FEAT-REVITIFY-01: the bundled revitify provider is always available; external graphify only
  // when the project opts in via graphify.provider.
  if (providerAvailable(config.graphify.provider)) {
    if (opts.refresh && (isStale(cwd) || !existsSync(graphJson))) {
      refreshCodeGraphVia(config.graphify.provider, cwd, config.graphify.outDir);
    }
    if (existsSync(graphJson)) codeGraph = loadCodeGraph(graphJson);
  }

  const head = gitHead(cwd);
  const tree = gitTreeHash(cwd);
  const vtg = buildVTG({
    requirements,
    tasks,
    ...(head ? { currentSha: head } : {}),
    ...(tree ? { currentTree: tree } : {}),
    ...(codeGraph ? { codeGraph } : {}),
  });
  // FIX-QUERY-01: queries pass write:false — read-only commands leave no fingerprints.
  if (opts.write !== false) {
    writeFileSync(join(cwd, ".rivet", "graph.json"), JSON.stringify(vtg, null, 2) + "\n");
  }
  return {
    vtg,
    requirements,
    tasks,
    ...(head ? { head } : {}),
    config,
    codeGraphLoaded: !!codeGraph,
    specWarnings,
  };
}

export function journalFor(cwd: string): Journal {
  return new Journal(join(cwd, ".rivet", "journal.jsonl"));
}

export function configFor(cwd: string): RivetConfig {
  return loadConfig(cwd); // FIX-ROBUST-01: one defensive loader everywhere
}

export function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
