#!/usr/bin/env node
import { Command } from "commander";
import { runDoctor } from "./doctor.js";
import { runInit } from "./init.js";

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

program.parseAsync(process.argv);
