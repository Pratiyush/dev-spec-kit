import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { buildVTG, summarize } from "../engine/graph/build.js";
import {
  graphifyInstalled,
  refreshCodeGraph,
  loadCodeGraph,
  isStale,
  GRAPHIFY_INSTALL_HINT,
  type CodeGraph,
} from "../engine/graphify/index.js";

/**
 * `rivet graph build` — materialize the Verified Traceability Graph:
 * parse specs -> fold journal -> (re)index the code graph via graphify -> overlay proof states ->
 * write committed .rivet/graph.json and print a traffic-light summary.
 */
export function graphBuild(opts: { refresh?: boolean }): void {
  const cwd = process.cwd();
  const requirements = parseSpecsDir(cwd);
  if (requirements.length === 0) {
    console.log(pc.yellow("no specs found in .rivet/specs/ — nothing to build"));
  }

  let codeGraph: CodeGraph | undefined;
  const graphJson = join(cwd, "graphify-out", "graph.json");
  if (graphifyInstalled()) {
    if (opts.refresh !== false && (isStale(cwd) || !existsSync(graphJson))) {
      console.log(pc.dim("code graph stale or missing — running `graphify update .` …"));
      refreshCodeGraph(cwd);
    }
    if (existsSync(graphJson)) codeGraph = loadCodeGraph(graphJson);
  } else {
    console.log(pc.yellow("graphify not installed — building spec/test overlay only"));
    console.log(pc.dim(`  → ${GRAPHIFY_INSTALL_HINT}`));
  }

  const tasks = [...new TaskStore(new Journal(join(cwd, ".rivet", "journal.jsonl"))).all().values()];
  const head = gitHead(cwd);
  const vtg = buildVTG({ requirements, tasks, ...(head ? { currentSha: head } : {}), ...(codeGraph ? { codeGraph } : {}) });

  const outPath = join(cwd, ".rivet", "graph.json");
  writeFileSync(outPath, JSON.stringify(vtg, null, 2) + "\n");

  const s = summarize(vtg);
  console.log(pc.bold("\nVerified Traceability Graph") + pc.dim(` → .rivet/graph.json`));
  console.log(
    `  ${s.requirements} requirement(s) · ${s.criteria} criteria · ${s.tests} test(s) · ${s.codeNodes} code node(s)`,
  );
  const v = s.validates;
  console.log(
    `  validates: ${pc.green(`● ${v.green} green`)}  ${pc.red(`● ${v.red} red`)}  ` +
      `${pc.magenta(`● ${v.stale} stale`)}  ${pc.yellow(`○ ${v.unproven} unproven`)}`,
  );
  if (v.stale > 0) {
    console.log(pc.magenta(`  drift: ${v.stale} proof(s) predate HEAD — re-run their checks to re-verify`));
    process.exitCode = 1;
  }
  if (v.red > 0) process.exitCode = 1;
  console.log("");
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
