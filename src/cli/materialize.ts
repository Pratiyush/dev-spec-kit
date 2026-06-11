import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { gitTreeHash } from "../engine/git.js";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore, type Task } from "../engine/state/tasks.js";
import { buildVTG } from "../engine/graph/build.js";
import type { VerifiedTraceabilityGraph } from "../engine/graph/types.js";
import type { Requirement } from "../engine/spec/ears.js";
import { graphifyInstalled, refreshCodeGraph, loadCodeGraph, isStale, type CodeGraph } from "../engine/graphify/index.js";
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
}

export function materialize(cwd: string, opts: { refresh: boolean }): Materialized {
  const requirements = parseSpecsDir(cwd);
  const tasks = [...new TaskStore(journalFor(cwd)).all().values()];
  const config = configFor(cwd);

  let codeGraph: CodeGraph | undefined;
  const graphJson = join(cwd, config.graphify.outDir, "graph.json");
  if (graphifyInstalled()) {
    if (opts.refresh && (isStale(cwd) || !existsSync(graphJson))) refreshCodeGraph(cwd, config.graphify.outDir);
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
  writeFileSync(join(cwd, ".rivet", "graph.json"), JSON.stringify(vtg, null, 2) + "\n");
  return { vtg, requirements, tasks, ...(head ? { head } : {}), config, codeGraphLoaded: !!codeGraph };
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
