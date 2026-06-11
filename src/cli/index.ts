#!/usr/bin/env node
import { Command } from "commander";
import { runDoctor } from "./doctor.js";
import { runInit } from "./init.js";
import { taskCreate, taskStart, taskDone, checkRun, status } from "./tasks.js";
import { graphBuild } from "./graph.js";

const program = new Command();

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

program.parseAsync(process.argv);
