import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { parseSpecsDir } from "../engine/spec/parse.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { createApproval, listApprovals, ApprovalError } from "../engine/approvals.js";
import { buildPrBody } from "../engine/pr/body.js";
import { routeRequest, assertMode } from "../engine/route/classify.js";
import type { VerifiedTraceabilityGraph } from "../engine/graph/types.js";
import { gateVerdict } from "../engine/gate.js";
import { loadConfig } from "./config-io.js";

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
  let synced = 0;
  for (const req of requirements) {
    const refs = req.criteria.flatMap((c) => c.checks.map((ch) => ch.ref));
    if (refs.length === 0) {
      console.log(pc.yellow(`⚠ ${req.id} has no @check bindings — UNVERIFIABLE, task not created; bind checks first`));
      continue;
    }
    const prior = existing.get(req.id);
    if (prior) {
      // FIX-SPECSYNC-01: the spec stays the source of truth — diff bindings into the existing task.
      const before = [...prior.boundChecks].sort().join(" ");
      if (before === [...refs].sort().join(" ")) {
        console.log(pc.dim(`= ${req.id} unchanged`));
        continue;
      }
      const updated = store.syncBindings(req.id, refs);
      synced++;
      const reopened = prior.status === "done" && updated.status !== "done" ? pc.yellow(" (reopened — new obligations)") : "";
      console.log(pc.cyan(`↻ ${req.id} bindings synced`) + pc.dim(` — now ${refs.length} check(s)`) + reopened);
      continue;
    }
    store.create(req.id, req.title, refs);
    created++;
    console.log(pc.green(`✓ ${req.id}`) + pc.dim(` — ${req.title} (${refs.length} bound check(s))`));
  }
  console.log(pc.dim(`\n${created} created · ${synced} synced from spec — the spec is the source of truth`));
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

  // FIX-GATE-01: same predicate as the hook and `guard pr` — anything not green blocks --create.
  const verdict = gateVerdict(graph);
  if (!verdict.ok) {
    console.error(pc.red("✗ blocked by the gate:"));
    for (const r of verdict.reasons) console.error(pc.red(`   ${r}`));
    process.exitCode = 1;
    return;
  }
  if (verdict.zeroProofs) console.log(pc.yellow("⚠ zero bound proofs in the graph — PR carries no evidence"));
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
  const config = loadConfig(cwd);

  let result = routeRequest(text);
  if (opts.mode) {
    result = { mode: assertMode(opts.mode), reason: "explicit --mode override" };
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

/** Load the graph for gating: null when missing/unreadable (which BLOCKS — absence ≠ permission). */
function gateGraph(cwd: string): VerifiedTraceabilityGraph | null {
  const graphPath = join(cwd, ".rivet", "graph.json");
  if (!existsSync(graphPath)) return null;
  try {
    return JSON.parse(readFileSync(graphPath, "utf8")) as VerifiedTraceabilityGraph;
  } catch {
    return null;
  }
}

/** `rivet guard pr` — FIX-GATE-01: the shared gateVerdict predicate; exit 2 on anything not green. */
export function guardPr(): void {
  const cwd = process.cwd();
  if (!existsSync(join(cwd, ".rivet"))) {
    console.log(pc.dim("rivet guard: not a Rivet project — nothing to enforce"));
    return;
  }
  const verdict = gateVerdict(gateGraph(cwd));
  if (verdict.ok) {
    console.log(
      verdict.zeroProofs
        ? pc.yellow("rivet guard: graph has zero bound proofs — nothing to enforce (bind @checks!)")
        : pc.green("✓ rivet guard: every proof green — PR may proceed"),
    );
    return;
  }
  console.error(pc.red("✗ rivet guard: blocked:"));
  for (const r of verdict.reasons) console.error(pc.red(`   ${r}`));
  process.exitCode = 2;
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}

/**
 * `rivet unlock <paths...> --minutes N` — GATE-PROTECT-01's human escape hatch: a time-boxed,
 * journaled unlock for protected files (specs / bound green tests / gate config). The unlock is
 * itself an auditable governance event — nothing is ever silently weakened.
 */
export function unlock(paths: string[], opts: { minutes?: string }): void {
  const cwd = process.cwd();
  const minutes = Math.max(1, Number(opts.minutes ?? 30) || 30);
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  writeFileSync(join(cwd, ".rivet", "unlock.json"), JSON.stringify({ paths, until }, null, 2) + "\n");
  journal(cwd).append("governance", { kind: "unlock", paths, until });
  console.log(pc.yellow(`🔓 unlocked for ${minutes}m (until ${until}):`));
  for (const p of paths) console.log(pc.dim(`   ${p}`));
  console.log(pc.dim("   journaled as a governance event — gates re-engage on expiry"));
}
