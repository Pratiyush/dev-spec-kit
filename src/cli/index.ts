#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { runDoctor } from "./doctor.js";
import { runInit } from "./init.js";
import { taskCreate, taskStart, taskDone, checkRun, status, taskTrail } from "./tasks.js";
import { graphBuild } from "./graph.js";
import { specTasks, specLint, specDraftTests, approve, pr, route, guardPr, unlock } from "./workflow.js";
import { trace, drift, affected } from "./queries.js";
import { logCmd } from "./log.js";
import { resumeCmd } from "./resume.js";
import { wavePlan, waveStart, waveDone } from "./wave.js";
import { boardCmd } from "./board-cmd.js";
import { lawsCmd } from "./laws-cmd.js";
import { dashboardCmd } from "./dashboard.js";
import { verifyCmd } from "./verify-cmd.js";
import { webCmd } from "./web.js";
import { auditCliRun } from "../engine/state/audit.js";
import { InputError } from "./config-io.js";
import { RunnerUnavailableError } from "../engine/verify/runner.js";

/**
 * FIX-ROBUST-01: every action runs through safe() — a malformed input or unavailable runner is a
 * one-line red message with a meaningful exit code, never a raw stack trace.
 */
function safe<A extends unknown[]>(fn: (...args: A) => void | Promise<void>): (...args: A) => Promise<void> {
  return async (...args: A) => {
    try {
      await fn(...args);
    } catch (e) {
      if (e instanceof RunnerUnavailableError) {
        console.error(pc.red(`✗ ${e.message}`));
        process.exitCode = 2;
        return;
      }
      if (e instanceof InputError || e instanceof Error) {
        console.error(pc.red(`✗ ${(e as Error).message}`));
        process.exitCode = process.exitCode ?? 1;
        return;
      }
      throw e;
    }
  };
}

const program = new Command();

// R-AUDIT-01: every invocation inside a dev-spec-kit project lands in the journal (no-op elsewhere).
program.hook("preAction", (_thisCommand, actionCommand) => {
  // DEV_SPEC_KIT_NO_AUDIT=1 suppresses the audit write — set by the pre-commit gate so a read-only
  // `spec lint` run doesn't dirty the journal on every commit (the hook would never settle).
  if (process.env.DEV_SPEC_KIT_NO_AUDIT === "1") return;
  const path: string[] = [];
  for (let c: Command | null = actionCommand; c && c.name() !== "dev-spec-kit"; c = c.parent)
    path.unshift(c.name());
  try {
    auditCliRun(process.cwd(), path, actionCommand.args.map(String));
  } catch {
    // auditing must never block the command itself
  }
});

program
  .name("dev-spec-kit")
  .description(
    "dev-spec-kit — spec-driven development with a Verified Traceability Graph.\n" +
      "Every requirement bound to a passing check.",
  )
  .version("0.1.0");

program
  .command("doctor")
  .description("Check prerequisites (Node, git, Python, graphify, Java, Maven)")
  .action(safe(() => runDoctor()));

program
  .command("init")
  .description("Initialize dev-spec-kit in the current project (.dev-spec-kit/ config, laws, specs, journal)")
  .option("-f, --force", "overwrite the existing dev-spec-kit config")
  .option(
    "-p, --platforms <list>",
    "comma-separated codebase platforms (typescript,electron,python,…) — seeds best-practice law packs",
  )
  .action(safe((opts: { force?: boolean; platforms?: string }) => runInit(opts)));

const task = program.command("task").description("Evidence-bound tasks (done requires green checks)");
task
  .command("create")
  .description("Create a task bound to one or more checks")
  .argument("<id>", "stable task id, e.g. T1")
  .argument("<title>", "human title")
  .option("-c, --check <ref...>", "check ref(s) this task must prove (e.g. SessionTest#idleTimeout)", [])
  .action(safe((id: string, title: string, opts: { check: string[] }) => taskCreate(id, title, opts.check)));
task
  .command("start")
  .description("Mark a task in progress")
  .argument("<id>")
  .action(safe((id: string) => taskStart(id)));
task
  .command("trail")
  .description("Every gate this task crossed — minute-level, done/blocked/skipped/pending")
  .argument("<id>")
  .action(safe((id: string) => taskTrail(id)));
task
  .command("done")
  .description("THE GATE — mark done; refuses unless every bound check has a passing run")
  .argument("<id>")
  .action(safe((id: string) => taskDone(id)));

const check = program.command("check").description("Run bound checks and record proof");
check
  .command("run")
  .description("Execute a check via the stack's real test runner and record the result")
  .argument("<taskId>", "task to record the proof against")
  .argument("<ref>", "check ref (maven: Class#method · vitest/jest: file::name · pytest: file::test)")
  .option(
    "-s, --stack <stack>",
    "java-maven | node-vitest | node-jest | python-pytest | <config-defined> " +
      "(optional — falls back to verify.defaultStack, then platform inference)",
  )
  .option("-x, --expect-red", "TDD red phase: skip flaky retries for this run")
  .option("--verdict <pass|fail>", "for a judge ref: the agent-supplied LLM verdict (harness mode)")
  .option("--reason <text>", "for a judge ref: the one-line reason behind the verdict")
  .action(
    safe(
      (
        taskId: string,
        ref: string,
        opts: { stack?: string; expectRed?: boolean; verdict?: string; reason?: string },
      ) =>
        checkRun(taskId, ref, opts.stack, {
          expectRed: opts.expectRed ?? false,
          ...(opts.verdict === "pass" || opts.verdict === "fail" ? { verdict: opts.verdict } : {}),
          ...(opts.reason ? { reason: opts.reason } : {}),
        }),
    ),
  );

program
  .command("status")
  .description("Board generated from the journal — tasks with traffic-light proof states")
  .action(safe(() => status()));

program
  .command("web")
  .description("Serve the cockpit (dashboard + config studio) with the validated save API")
  .option("-p, --port <port>", "port (default 7341)")
  .option("--open", "open it in the browser (macOS)")
  .action(safe((opts: { port?: string; open?: boolean }) => void webCmd(opts)));

program
  .command("verify")
  .description(
    "Build ALL + run EVERY configured kind (full suites) — journaled; the PR gate needs this green on the current tree",
  )
  .option("--stamp", "also stamp a per-criterion proof for every bound check from the one suite run")
  .option("--advance", "after stamping, auto-advance every fully-proven task to done (implies --stamp)")
  .action(safe((opts: { stamp?: boolean; advance?: boolean }) => verifyCmd(opts)));

const graph = program.command("graph").description("The Verified Traceability Graph");
graph
  .command("build")
  .description(
    "Fuse specs + journal + graphify code graph into .dev-spec-kit/graph.json (exit 1 on red/stale)",
  )
  .option("--no-refresh", "skip the graphify re-index even if the code graph is stale")
  .action(safe((opts: { refresh?: boolean }) => graphBuild(opts)));

const spec = program.command("spec").description("Spec-driven flow (specs are the source of truth)");
spec
  .command("tasks")
  .description("Create/sync evidence-bound tasks from .dev-spec-kit/specs/*.md @check bindings (idempotent)")
  .action(safe(() => specTasks()));
spec
  .command("lint")
  .description(
    "Static drift check: orphaned @check refs (renamed/missing tests) + unbound criteria (exit 1 on orphans)",
  )
  .action(safe(() => specLint()));
spec
  .command("draft-tests")
  .description("Scaffold a failing, bound test stub for every unbound criterion (the rule→test→proof loop)")
  .action(safe(() => specDraftTests()));

program
  .command("approve")
  .description("Record the human gate as a signed artifact (.dev-spec-kit/approvals/) — tasks must be DONE")
  .argument("<taskIds...>")
  .option("-n, --note <note>", "approval note")
  .action(safe((taskIds: string[], opts: { note?: string }) => approve(taskIds, opts)));

program
  .command("pr")
  .description("Generate the graph-derived PR body (.dev-spec-kit/pr-body.md); --create opens it via gh")
  .option("-t, --title <title>", "PR title")
  .option("--create", "create the PR with gh after generating the body")
  .action(safe((opts: { title?: string; create?: boolean }) => pr(opts)));

program
  .command("route")
  .description("The front door — classify a request into research | quick | full-spec (config-aware)")
  .argument("[request]", "the raw request text (or use --file)")
  .option("-m, --mode <mode>", "override: research | quick | full-spec")
  .option("-f, --file <path>", "route an external idea file (e.g. .dev-spec-kit/intake/<idea>.md)")
  .action(safe((text: string | undefined, opts: { mode?: string; file?: string }) => route(text, opts)));

const guard = program.command("guard").description("Hard gates (hook-friendly; exit 2 = block)");
guard
  .command("pr")
  .description("Block PR creation unless every proof is green (missing graph also blocks)")
  .action(safe(() => guardPr()));

program
  .command("unlock")
  .description("Human escape hatch: time-boxed unlock of protected files (journaled governance event)")
  .argument("<paths...>", "project-relative paths to unlock")
  .option("-m, --minutes <minutes>", "how long the unlock lasts (default 30)")
  .action(safe((paths: string[], opts: { minutes?: string }) => unlock(paths, opts)));

program
  .command("trace")
  .description("Requirement→criterion truth table from the graph (exit 1 while any requirement unproven)")
  .action(safe(() => trace()));

program
  .command("drift")
  .description("Find red/stale proofs and re-run their checks in one move (exit 1 if any remain)")
  .option("-s, --stack <stack>", "fallback stack for proofs recorded before stacks were journaled")
  .option("--dry-run", "list drifted proofs without re-running")
  .action(safe((opts: { stack?: string; dryRun?: boolean }) => drift(opts)));

program
  .command("affected")
  .description("Blast radius of a code node — proven edges touching it + graphify reverse traversal")
  .argument("<label>", "code node label or id (e.g. GreetController)")
  .action(safe((label: string) => affected(label)));

const wave = program.command("wave").description("Parallel waves — plan independence, dispatch worktrees");
wave
  .command("plan")
  .description("Group pending tasks into waves (no shared bound-check files; cap = parallel.waveSize)")
  .action(safe(() => wavePlan()));
wave
  .command("start")
  .description("Create one worktree per task — fetch-first, branched from origin's CURRENT tip")
  .argument("<ids...>")
  .action(safe((ids: string[]) => waveStart(ids)));
wave
  .command("done")
  .description(
    "Provenance-checked cleanup: remove .worktrees/<id> after its branch reached origin (--force discards)",
  )
  .argument("<id>")
  .option("--force", "discard unmerged work (destructive — requires explicit intent)")
  .action(safe((id: string, opts: { force?: boolean }) => waveDone(id, opts)));

program
  .command("laws")
  .description(
    "Print the effective laws: personal → project → scoped (fileMatch via --for, manual via --summon)",
  )
  .option("--for <file>", "activate fileMatch-scoped laws for this path")
  .option("--summon <names...>", "load manual-scope laws by name")
  .action(safe((opts: { for?: string; summon?: string[] }) => lawsCmd(opts)));

program
  .command("dashboard")
  .description(
    "Emit the cockpit (.dev-spec-kit/cockpit/ — dashboard + config studio, auto-reloading data sidecar)",
  )
  .option("--open", "open it in the browser after generating (macOS)")
  .action(safe((opts: { open?: boolean }) => dashboardCmd(opts)));

program
  .command("board")
  .description(
    "Regenerate .dev-spec-kit/LEDGER.md + TRACKING.md from the journal and graph (boards that cannot lie)",
  )
  .action(safe(() => boardCmd()));

program
  .command("resume")
  .description("Write + print the state-only handoff (.dev-spec-kit/RESUME.md), generated from the journal")
  .action(safe(() => resumeCmd()));

program
  .command("log")
  .description("The audit trail — every recorded action, chronological, with emoji (--json for raw JSONL)")
  .option("--json", "emit raw JSONL")
  .option("-n <count>", "number of events to show (default 25)")
  .action(safe((opts: { json?: boolean; n?: string }) => logCmd(opts)));

program.parseAsync(process.argv);
