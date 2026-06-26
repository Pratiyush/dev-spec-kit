import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { parseSpecsDir } from "../engine/spec/parse.js";
import {
  lintQualifiedIds,
  lintCriteriaFormat,
  requirementKind,
  unboundObligations,
  type Requirement,
} from "../engine/spec/ears.js";
import { findDangling, specRefs, dedupeRefs } from "../engine/spec/lint.js";
import { draftStubs, describeBlock, type DraftStub } from "../engine/spec/draft.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { createApproval, listApprovals, ApprovalError } from "../engine/approvals.js";
import { buildPrBody } from "../engine/pr/body.js";
import { routeRequest, assertMode } from "../engine/route/classify.js";
import { applyGateFloor } from "../engine/gatepacks.js";
import type { VerifiedTraceabilityGraph } from "../engine/graph/types.js";
import { gateVerdict, verifyVerdict } from "../engine/gate.js";
import { summarize } from "../engine/graph/build.js";
import { gitTreeHash, isDirty } from "../engine/git.js";
import { needsFlush } from "../engine/flushwarn.js";
import { loadConfig } from "./config-io.js";
import { label } from "./emoji.js";

function journal(cwd: string): Journal {
  return new Journal(join(cwd, ".dev-spec-kit", "journal.jsonl"));
}

/** FEAT-FLUSH-01: the ledger this session's lessons belong in — the project's own learnings.md,
 *  falling back to the TOOL repo's (dogfood sessions bank tool lessons, not app lessons). */
function ledgerPath(cwd: string): string | null {
  const project = join(cwd, ".dev-spec-kit", "learnings.md");
  if (existsSync(project)) return project;
  const toolRepo = fileURLToPath(new URL("../../.dev-spec-kit/learnings.md", import.meta.url));
  return existsSync(toolRepo) ? toolRepo : null;
}

/** FEAT-IDS-01 lint printer — returns false when level=error and violations exist (caller stops). */
function lintIds(requirements: Requirement[], level: "warn" | "error" | "off"): boolean {
  if (level === "off") return true;
  const violations = lintQualifiedIds(requirements);
  for (const v of violations) {
    if (level === "error") console.error(pc.red(`✗ ${v}`) + pc.dim("  [rules.requireQualifiedIds]"));
    else console.log(pc.yellow(`⚠ ${v}`));
  }
  if (level === "error" && violations.length > 0) {
    process.exitCode = 1;
    return false;
  }
  return true;
}

/**
 * `dev-spec-kit spec lint` — FEAT-LINT-01: static drift check, no run required. Resolves every `@check`
 * ref (from specs AND from task bindings) against the actual test files — a missing file or a test
 * name that no longer appears is ORPHANED (a rename dev-spec-kit would otherwise only meet at a check run).
 * Unbound obligations (a criterion with no `@check`) are reported as UNCOVERED warnings. Orphaned
 * refs exit 1 so a Stop/pre-commit hook can refuse to let the drift persist.
 */
export interface SpecHealth {
  hasSpecs: boolean;
  dangling: ReturnType<typeof findDangling>;
  unbound: ReturnType<typeof unboundObligations>;
  /** FIX-PARSE-02: parser warnings (e.g. an orphan `@check` with no criterion = a LOST proof
   *  obligation). Previously only `graph build` printed these; now `spec lint`/`doctor` do too. */
  parseWarnings: string[];
}

/** Collect drift findings (orphaned @check refs + unbound criteria + parser warnings). Shared by
 *  `spec lint` (which prints + exits) and `dev-spec-kit doctor` (which folds it into the health check). */
export function specHealth(cwd: string): SpecHealth {
  const parseWarnings: string[] = [];
  const reqs = parseSpecsDir(cwd, parseWarnings);
  if (reqs.length === 0) return { hasSpecs: false, dangling: [], unbound: [], parseWarnings };
  const store = new TaskStore(journal(cwd));
  const taskRefs = [...store.all().values()].flatMap((t) =>
    t.boundChecks.map((ref) => ({ owner: `task ${t.id}`, ref })),
  );
  const refs = dedupeRefs([...specRefs(reqs), ...taskRefs]);
  const read = (rel: string): string | undefined => {
    try {
      return readFileSync(join(cwd, rel), "utf8");
    } catch {
      return undefined;
    }
  };
  return {
    hasSpecs: true,
    dangling: findDangling(refs, read),
    unbound: unboundObligations(reqs),
    parseWarnings,
  };
}

export function specLint(): void {
  const { hasSpecs, dangling, unbound, parseWarnings } = specHealth(process.cwd());
  if (!hasSpecs) {
    console.log(pc.yellow("no specs in .dev-spec-kit/specs/ — nothing to lint"));
    return;
  }
  console.log(pc.bold("\n🔎 dev-spec-kit spec lint — static drift check\n"));
  for (const w of parseWarnings) {
    // FIX-PARSE-02: a dropped @check / parser issue is a lost proof obligation — surface it loudly.
    console.error(pc.red(`✗ SPEC       ${w}`));
  }
  for (const d of dangling) {
    const why = d.reason === "file-missing" ? "file not found" : "test name not in file — renamed?";
    console.error(pc.red(`✗ ORPHANED   ${d.ref}`) + pc.dim(`  (${why}; ${d.owner})`));
  }
  for (const c of unbound) {
    console.log(pc.yellow(`⚠ UNCOVERED  ${c.id}`) + pc.dim("  (criterion has no @check binding)"));
  }
  if (dangling.length === 0 && unbound.length === 0 && parseWarnings.length === 0) {
    console.log(pc.green("✓ clean — every @check ref resolves; every obligation is bound"));
  } else {
    console.log(
      pc.dim(
        `\n${dangling.length} orphaned ref(s) · ${unbound.length} unbound criterion(criteria)` +
          (parseWarnings.length ? ` · ${parseWarnings.length} spec parser warning(s)` : ""),
      ),
    );
  }
  // Orphaned refs AND lost-obligation parser warnings are errors; unbound criteria are warnings.
  if (dangling.length > 0 || parseWarnings.length > 0) process.exitCode = 1;
}

/**
 * `dev-spec-kit spec draft-tests` — FEAT-DRAFT-01: the rule→test loop `acceptanceCriteria: "tool-drafts"`
 * promises. For every UNBOUND criterion, write a FAILING vitest stub (carrying the criterion text +
 * the edge-case mandate) and print the `@check` line to bind it. Idempotent: a stub whose name is
 * already in the target file is skipped. The agent then fills the body; `spec tasks` + `verify
 * --stamp` prove it. We print the bindings rather than editing the spec — the spec is yours to edit.
 */
export function specDraftTests(): void {
  const cwd = process.cwd();
  const reqs = parseSpecsDir(cwd);
  if (reqs.length === 0) {
    console.log(pc.yellow("no specs in .dev-spec-kit/specs/ — write one first (EARS + criteria)"));
    return;
  }
  const stubs = draftStubs(reqs);
  if (stubs.length === 0) {
    console.log(pc.green("✓ every criterion is already bound — nothing to draft"));
    return;
  }
  console.log(pc.bold("\n✍️  dev-spec-kit spec draft-tests — failing stubs for unbound criteria\n"));
  const byFile = new Map<string, DraftStub[]>();
  for (const s of stubs) {
    const arr = byFile.get(s.file);
    if (arr) arr.push(s);
    else byFile.set(s.file, [s]);
  }
  let written = 0;
  const checkLines: string[] = [];
  for (const [file, fileStubs] of byFile) {
    const abs = join(cwd, file);
    const existing = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    const fresh = fileStubs.filter((s) => !existing?.includes(`it(${JSON.stringify(s.name)}`));
    if (fresh.length === 0) {
      console.log(pc.dim(`= ${file} — all ${fileStubs.length} stub(s) already present`));
      continue;
    }
    const byReq = new Map<string, DraftStub[]>();
    for (const s of fresh) {
      const arr = byReq.get(s.reqId);
      if (arr) arr.push(s);
      else byReq.set(s.reqId, [s]);
    }
    const blocks = [...byReq.entries()].map(([reqId, ss]) => describeBlock(reqId, ss)).join("\n\n");
    if (existing === null) {
      // FIX-DRAFT-02: a fresh project may not have the target dir (e.g. test/) yet — create it
      // rather than crash with ENOENT.
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, `import { describe, it, expect } from "vitest";\n\n${blocks}\n`);
      console.log(pc.green(`+ ${file}`) + pc.dim(` — created with ${fresh.length} stub(s)`));
    } else {
      writeFileSync(abs, `${existing.replace(/\s*$/, "")}\n\n${blocks}\n`);
      console.log(pc.green(`+ ${file}`) + pc.dim(` — appended ${fresh.length} stub(s)`));
    }
    written += fresh.length;
    for (const s of fresh) checkLines.push(`  ${s.reqId} → @check kind=unit ref=${s.checkRef}`);
  }
  if (written === 0) return;
  console.log(pc.bold(`\n${written} stub(s) drafted (all failing). Add these @check bindings to the spec:`));
  for (const l of checkLines) console.log(pc.dim(l));
  console.log(
    pc.dim("\nthen fill the stub bodies, `dev-spec-kit spec tasks`, and `dev-spec-kit verify --stamp`."),
  );
}

/** `dev-spec-kit spec tasks` — derive evidence-bound tasks from the spec's @check bindings (idempotent). */
export function specTasks(): void {
  const cwd = process.cwd();
  const requirements = parseSpecsDir(cwd);
  if (requirements.length === 0) {
    console.log(pc.yellow("no specs in .dev-spec-kit/specs/ — write one first (EARS + @check bindings)"));
    return;
  }
  // FEAT-IDS-01: ids must self-describe; severity comes from rules.requireQualifiedIds.
  const config = loadConfig(cwd);
  if (!lintIds(requirements, config.rules.requireQualifiedIds)) return;
  // FEAT-GHERKIN-01: off-format criteria lint (warn-only).
  for (const w of lintCriteriaFormat(requirements, config.spec.criteriaFormat)) {
    console.log(pc.yellow(`⚠ ${w}`));
  }
  const store = new TaskStore(journal(cwd));
  const existing = store.all();
  let created = 0;
  let synced = 0;
  for (const req of requirements) {
    if (requirementKind(req.id) === "adr") {
      console.log(pc.dim(`◇ ${req.id} — decision record (ADR), no task derived`));
      continue;
    }
    // One @check under an Outline binds every row — the task's obligation list dedupes the ref.
    const refs = [...new Set(req.criteria.flatMap((c) => c.checks.map((ch) => ch.ref)))];
    if (refs.length === 0) {
      console.log(
        pc.yellow(`⚠ ${req.id} has no @check bindings — UNVERIFIABLE, task not created; bind checks first`),
      );
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
      const reopened =
        prior.status === "done" && updated.status !== "done"
          ? pc.yellow(" (reopened — new obligations)")
          : "";
      console.log(
        pc.cyan(`↻ ${req.id} bindings synced`) + pc.dim(` — now ${refs.length} check(s)`) + reopened,
      );
      continue;
    }
    store.create(req.id, req.title, refs);
    created++;
    console.log(pc.green(`✓ ${req.id}`) + pc.dim(` — ${req.title} (${refs.length} bound check(s))`));
  }
  console.log(
    pc.dim(
      `\n${label("specSync")} ${created} created · ${synced} synced from spec — the spec is the source of truth`,
    ),
  );
}

/** `dev-spec-kit approve <taskIds...>` — record the human gate as a signed artifact. */
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
    /* c8 ignore start -- rethrow a non-ApprovalError (an unexpected fault, surfaced not swallowed). */
    throw e;
  }
  /* c8 ignore stop */
}

/** `dev-spec-kit pr` — generate the graph-derived PR body; optionally create the PR via gh. */
export function pr(opts: { title?: string; create?: boolean }): void {
  const cwd = process.cwd();
  const graphPath = join(cwd, ".dev-spec-kit", "graph.json");
  if (!existsSync(graphPath)) {
    console.error(pc.red("no .dev-spec-kit/graph.json — run `dev-spec-kit graph build` first"));
    process.exitCode = 1;
    return;
  }
  const graph = JSON.parse(readFileSync(graphPath, "utf8")) as VerifiedTraceabilityGraph;
  const requirements = parseSpecsDir(cwd);
  const tasks = [...new TaskStore(journal(cwd)).all().values()];
  const head = gitHead(cwd);
  // FIX-PROOF-04: the PR body claims coverage of the CODE TREE, so stamp that identity.
  const tree = gitTreeHash(cwd);
  const body = buildPrBody({
    title: opts.title ?? "dev-spec-kit change",
    requirements,
    graph,
    tasks,
    approvals: listApprovals(cwd),
    changedFiles: prChangedFiles(cwd), // FEAT-BLAST-01: what this PR touches, from the graph
    ...(head ? { headSha: head } : {}),
    ...(tree ? { tree, dirty: isDirty(cwd) } : {}),
  });
  const outPath = join(cwd, ".dev-spec-kit", "pr-body.md");
  writeFileSync(outPath, body + "\n");
  console.log(pc.green(`${label("pr")} ✓ PR body generated`) + pc.dim(" → .dev-spec-kit/pr-body.md"));

  // FEAT-FLUSH-01: 📝 pre-flight — lessons must be banked before the work ships (warning, not a gate).
  const ledger = ledgerPath(cwd);
  if (ledger && needsFlush(journal(cwd).read(), statSync(ledger).mtime.toISOString())) {
    console.log(
      pc.yellow(`${label("flush")} flush session lessons before PR`) +
        pc.dim(
          ` — ${ledger.includes(cwd) ? ".dev-spec-kit/learnings.md" : "the tool repo's learnings.md"} has no entry from this session`,
        ),
    );
  }

  // FIX-GATE-01: same predicate as the hook and `guard pr` — anything not green blocks --create.
  const verdict = gateVerdict(graph);
  if (!verdict.ok) {
    console.error(pc.red("✗ blocked by the gate:"));
    for (const r of verdict.reasons) console.error(pc.red(`   ${r}`));
    process.exitCode = 1;
    return;
  }
  if (verdict.zeroProofs) console.log(pc.yellow("⚠ zero bound proofs in the graph — PR carries no evidence"));
  // FEAT-VERIFY-01: with real proofs in play, a PR also needs a fresh green `dev-spec-kit verify`.
  if (!verdict.zeroProofs) {
    const vv = verifyVerdict(journal(cwd).read(), tree);
    if (!vv.ok) {
      console.error(pc.red("✗ blocked by the gate:"));
      for (const r of vv.reasons) console.error(pc.red(`   ${r}`));
      process.exitCode = 1;
      return;
    }
  }
  if (opts.create) {
    /* c8 ignore start -- shells out to `gh pr create`: needs the GitHub CLI + auth and would open a
       real PR; never run in CI. Everything up to here (the gate that GUARDS this call) is tested. */
    const res = spawnSync(
      "gh",
      ["pr", "create", "--title", opts.title ?? "dev-spec-kit change", "--body-file", outPath],
      {
        cwd,
        stdio: "inherit",
      },
    );
    if (res.status !== 0) process.exitCode = res.status ?? 1;
    /* c8 ignore stop */
  } else {
    console.log(
      pc.dim(`  open it with: gh pr create --title "<title>" --body-file .dev-spec-kit/pr-body.md`),
    );
  }
}

/**
 * `dev-spec-kit route "<request>"` / `dev-spec-kit route --file <idea.md>` — the front door.
 * Ideas live as external files (.dev-spec-kit/intake/*.md, optional YAML frontmatter); the tool only ever
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
    text = readFileSync(opts.file, "utf8")
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      .trim();
  }
  if (!text) {
    console.error(
      pc.red(
        'provide a request: dev-spec-kit route "<text>" or dev-spec-kit route --file .dev-spec-kit/intake/<idea>.md',
      ),
    );
    process.exitCode = 1;
    return;
  }
  const config = loadConfig(cwd);

  let result = routeRequest(text);
  if (opts.mode) {
    result = { mode: assertMode(opts.mode), reason: "explicit --mode override" };
  }
  // GATE-PACKS-01: a security trigger floors the mode — even past --mode and the heuristic.
  const floor = applyGateFloor(text, result.mode, config);
  if (floor.mode !== result.mode) {
    result = { mode: floor.mode, reason: floor.reason };
  }
  if (!opts.mode && config.mode.routing === "pick") {
    console.log(pc.yellow("mode.routing=pick — choose explicitly with --mode research|quick|full-spec"));
    console.log(pc.dim(`  (heuristic would say: ${result.mode} — ${result.reason})`));
    return;
  }
  const badge =
    result.mode === "research"
      ? pc.cyan("RESEARCH")
      : result.mode === "quick"
        ? pc.green("QUICK")
        : pc.magenta("FULL-SPEC");
  console.log(`${label("route")} ${badge} ${pc.dim("— " + result.reason)}`);
  if (config.mode.confirmFirst && !opts.mode) {
    console.log(pc.dim("confirm-first is on: proceed with this mode, or override via --mode"));
  }
  const next =
    result.mode === "research"
      ? `${label("research")} investigate and report — no code changes`
      : result.mode === "quick"
        ? "one delta + one test (quick mode still writes a test) → dev-spec-kit check run → dev-spec-kit task done"
        : "write .dev-spec-kit/specs/<feature>.md (EARS + @check) → dev-spec-kit spec tasks → TDD → dev-spec-kit graph build";
  console.log(pc.dim(`next: ${next}`));
}

/** Load the graph for gating: null when missing/unreadable (which BLOCKS — absence ≠ permission). */
function gateGraph(cwd: string): VerifiedTraceabilityGraph | null {
  const graphPath = join(cwd, ".dev-spec-kit", "graph.json");
  if (!existsSync(graphPath)) return null;
  try {
    return JSON.parse(readFileSync(graphPath, "utf8")) as VerifiedTraceabilityGraph;
  } catch {
    return null;
  }
}

/** `dev-spec-kit guard pr` — FIX-GATE-01: the shared gateVerdict predicate; exit 2 on anything not green.
 *  FEAT-VERIFY-01: once real proofs exist, the gate ALSO demands a fresh green `dev-spec-kit verify`. */
export function guardPr(): void {
  const cwd = process.cwd();
  if (!existsSync(join(cwd, ".dev-spec-kit"))) {
    console.log(pc.dim("dev-spec-kit guard: not a dev-spec-kit project — nothing to enforce"));
    return;
  }
  const verdict = gateVerdict(gateGraph(cwd));
  if (verdict.ok) {
    if (verdict.zeroProofs) {
      console.log(
        pc.yellow("dev-spec-kit guard: graph has zero bound proofs — nothing to enforce (bind @checks!)"),
      );
      return;
    }
    const vv = verifyVerdict(journal(cwd).read(), gitTreeHash(cwd));
    if (!vv.ok) {
      console.error(pc.red("✗ dev-spec-kit guard: blocked:"));
      for (const r of vv.reasons) console.error(pc.red(`   ${r}`));
      process.exitCode = 2;
      return;
    }
    console.log(pc.green("✓ dev-spec-kit guard: every proof green + fresh verify — PR may proceed"));
    return;
  }
  console.error(pc.red("✗ dev-spec-kit guard: blocked:"));
  for (const r of verdict.reasons) console.error(pc.red(`   ${r}`));
  process.exitCode = 2;
}

/**
 * `dev-spec-kit gate` — FIX-GATE-01, the lean per-commit graph-clean check. Loads the graph, runs the shared
 * `gateVerdict` predicate, prints the validates summary, and exits **2** on ANY non-green proof (red / stale /
 * unproven) or a missing graph (absence ≠ permission). Unlike `guard pr` it does NOT require a fresh `verify`,
 * so it's the fast inner build→commit gate — and a real exit code retires the fragile hand-rolled `grep` of the
 * graph-build output (which false-matched "...4`0 stale`" as `0 stale`). `--quiet` = exit code only.
 */
export function gateCmd(opts?: { quiet?: boolean }): void {
  const cwd = process.cwd();
  const quiet = opts?.quiet === true;
  if (!existsSync(join(cwd, ".dev-spec-kit"))) {
    if (!quiet) console.log(pc.dim("dev-spec-kit gate: not a dev-spec-kit project — nothing to enforce"));
    return;
  }
  const graph = gateGraph(cwd);
  if (!quiet && graph) {
    const v = summarize(graph).validates;
    console.log(
      `  validates: ${pc.green(`● ${v.green} green`)}  ${pc.red(`● ${v.red} red`)}  ` +
        `${pc.magenta(`● ${v.stale} stale`)}  ${pc.yellow(`○ ${v.unproven} unproven`)}`,
    );
  }
  const verdict = gateVerdict(graph);
  if (verdict.ok) {
    if (!quiet) {
      console.log(
        verdict.zeroProofs
          ? pc.yellow("✓ dev-spec-kit gate: zero bound proofs — nothing to enforce (bind @checks!)")
          : pc.green("✓ dev-spec-kit gate: every proof green"),
      );
    }
    return;
  }
  if (!quiet) {
    console.error(pc.red("✗ dev-spec-kit gate: blocked:"));
    for (const r of verdict.reasons) console.error(pc.red(`   ${r}`));
  }
  process.exitCode = 2;
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}

/**
 * FEAT-BLAST-01 — files changed on this branch since it forked from its base (tracking branch →
 * origin's default → main/master, first that resolves), committed OR working. Empty when no base
 * resolves (no remote / unrelated history) — the blast-radius section then says so honestly.
 */
export function prChangedFiles(cwd: string): string[] {
  const gitOut = (args: string[]): string | undefined => {
    const res = spawnSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] });
    return res.status === 0 ? res.stdout.toString().trim() : undefined;
  };
  let base: string | undefined;
  for (const cand of ["@{u}", "origin/HEAD", "origin/main", "main", "origin/master", "master"]) {
    if (gitOut(["rev-parse", "--verify", "--quiet", cand]) !== undefined) {
      base = cand;
      break;
    }
  }
  if (!base) return [];
  const fork = gitOut(["merge-base", base, "HEAD"]) ?? base;
  const diff = gitOut(["diff", "--name-only", fork]);
  return diff
    ? diff
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

/**
 * `dev-spec-kit unlock <paths...> --minutes N` — GATE-PROTECT-01's human escape hatch: a time-boxed,
 * journaled unlock for protected files (specs / bound green tests / gate config). The unlock is
 * itself an auditable governance event — nothing is ever silently weakened.
 */
export function unlock(paths: string[], opts: { minutes?: string }): void {
  const cwd = process.cwd();
  const minutes = Math.max(1, Number(opts.minutes ?? 30) || 30);
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  writeFileSync(join(cwd, ".dev-spec-kit", "unlock.json"), JSON.stringify({ paths, until }, null, 2) + "\n");
  journal(cwd).append("governance", { kind: "unlock", paths, until });
  console.log(pc.yellow(`🔓 unlocked for ${minutes}m (until ${until}):`));
  for (const p of paths) console.log(pc.dim(`   ${p}`));
  console.log(pc.dim("   journaled as a governance event — gates re-engage on expiry"));
}
