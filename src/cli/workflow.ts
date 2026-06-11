import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { createApproval, listApprovals, ApprovalError } from "../engine/approvals.js";
import { buildPrBody } from "../engine/pr/body.js";
import { routeRequest, type Mode } from "../engine/route/classify.js";
import type { VerifiedTraceabilityGraph } from "../engine/graph/types.js";
import { parseConfig } from "../config/schema.js";

function journal(cwd: string): Journal {
  return new Journal(join(cwd, ".rivet", "journal.jsonl"));
}

/** `rivet spec tasks` — derive evidence-bound tasks from the spec's @check bindings (idempotent). */
export function specTasks(): void {
  const cwd = process.cwd();
  const requirements = parseSpecsDir(cwd);
  if (requirements.length === 0) {
    console.log(pc.yellow("no specs in .rivet/specs/ — write one first (EARS + @check bindings)"));
    return;
  }
  const store = new TaskStore(journal(cwd));
  const existing = store.all();
  let created = 0;
  for (const req of requirements) {
    const refs = req.criteria.flatMap((c) => c.checks.map((ch) => ch.ref));
    if (existing.has(req.id)) {
      console.log(pc.dim(`= ${req.id} already exists — skipped`));
      continue;
    }
    if (refs.length === 0) {
      console.log(pc.yellow(`⚠ ${req.id} has no @check bindings — UNVERIFIABLE, task not created; bind checks first`));
      continue;
    }
    store.create(req.id, req.title, refs);
    created++;
    console.log(pc.green(`✓ ${req.id}`) + pc.dim(` — ${req.title} (${refs.length} bound check(s))`));
  }
  console.log(pc.dim(`\n${created} task(s) created from spec — the spec is the source of truth`));
}

/** `rivet approve <taskIds...>` — record the human gate as a signed artifact. */
export function approve(taskIds: string[], opts: { note?: string }): void {
  const cwd = process.cwd();
  try {
    const { path } = createApproval({
      projectDir: cwd,
      taskIds,
      store: new TaskStore(journal(cwd)),
      journal: journal(cwd),
      ...(opts.note ? { note: opts.note } : {}),
    });
    console.log(pc.green("✓ Approval recorded") + pc.dim(` → ${path.replace(cwd + "/", "")}`));
  } catch (e) {
    if (e instanceof ApprovalError) {
      console.error(pc.red(`✗ ${e.message}`));
      process.exitCode = 1;
      return;
    }
    throw e;
  }
}

/** `rivet pr` — generate the graph-derived PR body; optionally create the PR via gh. */
export function pr(opts: { title?: string; create?: boolean }): void {
  const cwd = process.cwd();
  const graphPath = join(cwd, ".rivet", "graph.json");
  if (!existsSync(graphPath)) {
    console.error(pc.red("no .rivet/graph.json — run `rivet graph build` first"));
    process.exitCode = 1;
    return;
  }
  const graph = JSON.parse(readFileSync(graphPath, "utf8")) as VerifiedTraceabilityGraph;
  const requirements = parseSpecsDir(cwd);
  const tasks = [...new TaskStore(journal(cwd)).all().values()];
  const head = gitHead(cwd);
  const body = buildPrBody({
    title: opts.title ?? "Rivet change",
    requirements,
    graph,
    tasks,
    approvals: listApprovals(cwd),
    ...(head ? { headSha: head } : {}),
  });
  const outPath = join(cwd, ".rivet", "pr-body.md");
  writeFileSync(outPath, body + "\n");
  console.log(pc.green("✓ PR body generated") + pc.dim(" → .rivet/pr-body.md"));

  const drifted = graph.edges.some((e) => e.kind === "validates" && (e.proof === "red" || e.proof === "stale"));
  if (drifted) {
    console.error(pc.red("✗ red/stale proofs present — fix before opening the PR"));
    process.exitCode = 1;
    return;
  }
  if (opts.create) {
    const res = spawnSync("gh", ["pr", "create", "--title", opts.title ?? "Rivet change", "--body-file", outPath], {
      cwd,
      stdio: "inherit",
    });
    if (res.status !== 0) process.exitCode = res.status ?? 1;
  } else {
    console.log(pc.dim(`  open it with: gh pr create --title "<title>" --body-file .rivet/pr-body.md`));
  }
}

/**
 * `rivet route "<request>"` / `rivet route --file <idea.md>` — the front door.
 * Ideas live as external files (.rivet/intake/*.md, optional YAML frontmatter); the tool only ever
 * consumes input, it is never edited per project.
 */
export function route(textArg: string | undefined, opts: { mode?: string; file?: string }): void {
  const cwd = process.cwd();
  let text = textArg ?? "";
  if (opts.file) {
    if (!existsSync(opts.file)) {
      console.error(pc.red(`no such intake file: ${opts.file}`));
      process.exitCode = 1;
      return;
    }
    // Strip YAML frontmatter; route on the body.
    text = readFileSync(opts.file, "utf8").replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  }
  if (!text) {
    console.error(pc.red("provide a request: rivet route \"<text>\" or rivet route --file .rivet/intake/<idea>.md"));
    process.exitCode = 1;
    return;
  }
  const configPath = join(cwd, ".rivet", "config.json");
  const config = parseConfig(existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {});

  let result = routeRequest(text);
  if (opts.mode) {
    result = { mode: opts.mode as Mode, reason: "explicit --mode override" };
  } else if (config.mode.routing === "pick") {
    console.log(pc.yellow("mode.routing=pick — choose explicitly with --mode research|quick|full-spec"));
    console.log(pc.dim(`  (heuristic would say: ${result.mode} — ${result.reason})`));
    return;
  }
  const badge =
    result.mode === "research" ? pc.cyan("RESEARCH") : result.mode === "quick" ? pc.green("QUICK") : pc.magenta("FULL-SPEC");
  console.log(`${badge} ${pc.dim("— " + result.reason)}`);
  if (config.mode.confirmFirst && !opts.mode) {
    console.log(pc.dim("confirm-first is on: proceed with this mode, or override via --mode"));
  }
  const next =
    result.mode === "research"
      ? "investigate and report — no code changes"
      : result.mode === "quick"
        ? "one delta + one test (quick mode still writes a test) → rivet check run → rivet task done"
        : "write .rivet/specs/<feature>.md (EARS + @check) → rivet spec tasks → TDD → rivet graph build";
  console.log(pc.dim(`next: ${next}`));
}

/** `rivet guard pr` — hard gate for PR creation: exit 2 when proofs are red/stale/missing. */
export function guardPr(): void {
  const cwd = process.cwd();
  const graphPath = join(cwd, ".rivet", "graph.json");
  if (!existsSync(graphPath)) {
    console.log(pc.dim("rivet guard: no .rivet/graph.json here — nothing to enforce"));
    return;
  }
  const graph = JSON.parse(readFileSync(graphPath, "utf8")) as VerifiedTraceabilityGraph;
  const validates = graph.edges.filter((e) => e.kind === "validates");
  const bad = validates.filter((e) => e.proof !== "green");
  if (bad.length === 0) {
    console.log(pc.green(`✓ rivet guard: all ${validates.length} proof(s) green — PR may proceed`));
    return;
  }
  console.error(pc.red(`✗ rivet guard: ${bad.length}/${validates.length} proof(s) not green:`));
  for (const e of bad) console.error(pc.red(`   ${e.proof.toUpperCase()} ${e.lastCheck?.ref ?? e.from}`));
  console.error(pc.dim("   re-run checks (rivet check run …) and rebuild (rivet graph build)"));
  process.exitCode = 2;
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}
