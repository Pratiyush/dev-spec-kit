import { execSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { planWaves } from "../engine/wave.js";
import { TaskStore } from "../engine/state/tasks.js";
import { journalFor, configFor } from "./materialize.js";

/**
 * WAVE-01 — the dispatcher. `rivet wave plan` groups independent tasks; `rivet wave start <ids>`
 * creates one worktree per task with the FETCH-FIRST guard: always `git fetch origin` and branch
 * from origin's CURRENT tip — never the possibly-stale local HEAD (the algo-trading disaster:
 * subagents on stale bases silently reverting merged work). Journals union-merge across branches.
 */

function git(cwd: string, cmd: string): string {
  return execSync(`git ${cmd}`, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
}

function defaultBranch(cwd: string): string {
  try {
    return git(cwd, "symbolic-ref refs/remotes/origin/HEAD").replace("refs/remotes/origin/", "");
  } catch {
    for (const b of ["main", "master"]) {
      try {
        git(cwd, `rev-parse --verify origin/${b}`);
        return b;
      } catch {
        /* next */
      }
    }
    throw new Error("cannot determine origin's default branch — set refs/remotes/origin/HEAD");
  }
}

/** Union-merge for append-only files so parallel branches reconcile instead of conflicting. */
function ensureUnionMerge(cwd: string): void {
  const path = join(cwd, ".gitattributes");
  const wanted = [".rivet/journal.jsonl merge=union", ".rivet/learnings.md merge=union"];
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const missing = wanted.filter((w) => !current.includes(w));
  if (missing.length > 0)
    appendFileSync(path, (current && !current.endsWith("\n") ? "\n" : "") + missing.join("\n") + "\n");
}

export interface WorktreeReport {
  id: string;
  path: string;
  base: string;
}

/** Core, testable: fetch-first worktree creation rooted at `cwd`. */
export function waveStartAt(cwd: string, ids: string[]): WorktreeReport[] {
  ensureUnionMerge(cwd);
  git(cwd, "fetch origin"); // THE guard — stale local state is never the base
  const branch = defaultBranch(cwd);
  const base = git(cwd, `rev-parse origin/${branch}`);
  const reports: WorktreeReport[] = [];
  for (const id of ids) {
    const path = join(cwd, ".worktrees", id);
    git(cwd, `worktree add "${path}" -B rivet/${id} origin/${branch}`);
    reports.push({ id, path, base });
  }
  return reports;
}

export interface WaveDoneReport {
  removed: boolean;
  branchDeleted: boolean;
  forced: boolean;
}

/**
 * WAVE-02 — cleanup, provenance-checked and merge-gated: only `.worktrees/<id>` paths we created
 * may be removed, and only after the branch's work is on origin (or with an explicit force
 * discard). Journaled as a governance event either way.
 */
export function waveDoneAt(cwd: string, id: string, opts: { force?: boolean }): WaveDoneReport {
  if (!/^[A-Za-z0-9._-]+$/.test(id)) {
    throw new Error(`provenance check: '${id}' is not a wave id — only .worktrees/<id> may be cleaned up`);
  }
  const path = join(cwd, ".worktrees", id);
  if (!existsSync(path)) {
    throw new Error(
      `provenance check: ${path} does not exist — only .worktrees/<id> we created may be cleaned up`,
    );
  }
  const branch = `rivet/${id}`;
  const forced = opts.force ?? false;
  if (!forced) {
    const def = defaultBranch(cwd);
    git(cwd, "fetch origin");
    try {
      git(cwd, `merge-base --is-ancestor ${branch} origin/${def}`);
    } catch {
      throw new Error(
        `${branch} is not merged into origin/${def} — merge first, or pass --force to discard the work`,
      );
    }
  }
  git(cwd, `worktree remove ${forced ? "--force " : ""}"${path}"`);
  let branchDeleted = false;
  try {
    git(cwd, `branch -D ${branch}`);
    branchDeleted = true;
  } catch {
    /* branch may not exist locally */
  }
  journalFor(cwd).append("governance", { kind: "worktree-cleaned", id, forced });
  return { removed: true, branchDeleted, forced };
}

export function waveDone(id: string, opts: { force?: boolean }): void {
  const r = waveDoneAt(process.cwd(), id, opts);
  console.log(
    pc.green(`✓ worktree ${id} cleaned`) +
      pc.dim(
        ` (branch ${r.branchDeleted ? "deleted" : "kept"}${r.forced ? " · FORCED discard" : " · merged"})`,
      ),
  );
}

export function wavePlan(): void {
  const cwd = process.cwd();
  const tasks = [...new TaskStore(journalFor(cwd)).all().values()];
  const waves = planWaves(tasks, configFor(cwd).parallel.waveSize);
  if (waves.length === 0) {
    console.log(pc.dim("no pending tasks — nothing to dispatch"));
    return;
  }
  console.log(
    pc.bold(`\nWave plan (no shared files within a wave, cap ${configFor(cwd).parallel.waveSize}):\n`),
  );
  waves.forEach((wave, i) => {
    console.log(`  wave ${i + 1}: ${wave.map((t) => pc.bold(t.id)).join("  ")}`);
  });
  console.log(pc.dim(`\nstart the first wave: rivet wave start ${waves[0]!.map((t) => t.id).join(" ")}`));
}

export function waveStart(ids: string[]): void {
  const cwd = process.cwd();
  const reports = waveStartAt(cwd, ids);
  console.log(
    pc.bold(`\n${reports.length} worktree(s) ready (base ${reports[0]?.base.slice(0, 8)} = origin tip):\n`),
  );
  for (const r of reports) {
    console.log(`  ${pc.green("✓")} ${pc.bold(r.id)} → ${r.path}` + pc.dim(`  (branch rivet/${r.id})`));
  }
  console.log(
    pc.dim(
      "\neach worktree: work the task → rivet check run … → rivet task done → merge via rivet-finish ritual.\n" +
        "journals union-merge; provenance rule: only .worktrees/ may be cleaned up.",
    ),
  );
}
