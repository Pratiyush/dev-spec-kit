#!/usr/bin/env node
import { Command } from "commander";
import { runDoctor } from "./doctor.js";
import { runInit } from "./init.js";
import { taskCreate, taskStart, taskDone, checkRun, status } from "./tasks.js";
import { graphBuild } from "./graph.js";
import { specTasks, approve, pr, route, guardPr } from "./workflow.js";
import { trace, drift, affected } from "./queries.js";
import { logCmd } from "./log.js";
import { auditCliRun } from "../engine/state/audit.js";

const program = new Command();

// R-AUDIT-01: every invocation inside a Rivet project lands in the journal (no-op elsewhere).
program.hook("preAction", (_thisCommand, actionCommand) => {
  const path: string[] = [];
  for (let c: Command | null = actionCommand; c && c.name() !== "rivet"; c = c.parent) path.unshift(c.name());
  auditCliRun(process.cwd(), path, actionCommand.args.map(String));
});

program
  .name("rivet")
  .description(
    "Rivet — spec-driven development with a Verified Traceability Graph.\n" +
      "Every requirement riveted to a passing check.",
  )
  .version("0.0.1");

program
  .command("doctor")
  .description("Check prerequisites (Node, git, Python, graphify, Java, Maven)")
  .action(() => runDoctor());

program
  .command("init")
  .description("Initialize Rivet in the current project (.rivet/ config, constitution, specs, journal)")
  .option("-f, --force", "overwrite the existing Rivet config")
  .action((opts: { force?: boolean }) => runInit(opts));

const task = program.command("task").description("Evidence-bound tasks (done requires green checks)");
task
  .command("create")
  .description("Create a task bound to one or more checks")
  .argument("<id>", "stable task id, e.g. T1")
  .argument("<title>", "human title")
  .option("-c, --check <ref...>", "check ref(s) this task must prove (e.g. SessionTest#idleTimeout)", [])
  .action((id: string, title: string, opts: { check: string[] }) => taskCreate(id, title, opts.check));
task
  .command("start")
  .description("Mark a task in progress")
  .argument("<id>")
  .action((id: string) => taskStart(id));
task
  .command("done")
  .description("THE GATE — mark done; refuses unless every bound check has a passing run")
  .argument("<id>")
  .action((id: string) => taskDone(id));

const check = program.command("check").description("Run bound checks and record proof");
check
  .command("run")
  .description("Execute a check via the stack's real test runner and record the result")
  .argument("<taskId>", "task to record the proof against")
  .argument("<ref>", "check ref (maven: Class#method · vitest/jest: file::name · pytest: file::test)")
  .requiredOption("-s, --stack <stack>", "java-maven | node-vitest | node-jest | python-pytest")
  .action((taskId: string, ref: string, opts: { stack: string }) => checkRun(taskId, ref, opts.stack));

program
  .command("status")
  .description("Board generated from the journal — tasks with traffic-light proof states")
  .action(() => status());

const graph = program.command("graph").description("The Verified Traceability Graph");
graph
  .command("build")
  .description("Fuse specs + journal + graphify code graph into .rivet/graph.json (exit 1 on red/stale)")
  .option("--no-refresh", "skip the graphify re-index even if the code graph is stale")
  .action((opts: { refresh?: boolean }) => graphBuild(opts));

const spec = program.command("spec").description("Spec-driven flow (specs are the source of truth)");
spec
  .command("tasks")
  .description("Create evidence-bound tasks from .rivet/specs/*.md @check bindings (idempotent)")
  .action(() => specTasks());

program
  .command("approve")
  .description("Record the human gate as a signed artifact (.rivet/approvals/) — tasks must be DONE")
  .argument("<taskIds...>")
  .option("-n, --note <note>", "approval note")
  .action((taskIds: string[], opts: { note?: string }) => approve(taskIds, opts));

program
  .command("pr")
  .description("Generate the graph-derived PR body (.rivet/pr-body.md); --create opens it via gh")
  .option("-t, --title <title>", "PR title")
  .option("--create", "create the PR with gh after generating the body")
  .action((opts: { title?: string; create?: boolean }) => pr(opts));

program
  .command("route")
  .description("The front door — classify a request into research | quick | full-spec (config-aware)")
  .argument("[request]", "the raw request text (or use --file)")
  .option("-m, --mode <mode>", "override: research | quick | full-spec")
  .option("-f, --file <path>", "route an external idea file (e.g. .rivet/intake/<idea>.md)")
  .action((text: string | undefined, opts: { mode?: string; file?: string }) => route(text, opts));

const guard = program.command("guard").description("Hard gates (hook-friendly; exit 2 = block)");
guard
  .command("pr")
  .description("Block PR creation while any proof is red/stale/unproven")
  .action(() => guardPr());

program
  .command("trace")
  .description("Requirement→criterion truth table from the graph (exit 1 while any requirement unproven)")
  .action(() => trace());

program
  .command("drift")
  .description("Find red/stale proofs and re-run their checks in one move (exit 1 if any remain)")
  .option("-s, --stack <stack>", "fallback stack for proofs recorded before stacks were journaled")
  .option("--dry-run", "list drifted proofs without re-running")
  .action((opts: { stack?: string; dryRun?: boolean }) => drift(opts));

program
  .command("affected")
  .description("Blast radius of a code node — proven edges touching it + graphify reverse traversal")
  .argument("<label>", "code node label or id (e.g. GreetController)")
  .action((label: string) => affected(label));

program
  .command("log")
  .description("The audit trail — every recorded action, chronological, with emoji (--json for raw JSONL)")
  .option("--json", "emit raw JSONL")
  .option("-n <count>", "number of events to show (default 25)")
  .action((opts: { json?: boolean; n?: string }) => logCmd(opts));

program.parseAsync(process.argv);
