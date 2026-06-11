import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlinkSync } from "node:fs";

/**
 * Git identity helpers — FIX-PROOF-01 + FIX-PROOF-02.
 *
 * A proof must identify the CODE it ran against — not the commit that happened to be HEAD, and not
 * Rivet's own bookkeeping. `gitTreeHash` builds a temporary index from HEAD, DROPS `.rivet/` (the
 * journal must never stale its own proofs — recording a proof appends to it), adds the working
 * state (INCLUDING untracked code — the old stash-create blind spot), and hashes that tree.
 * Same code ⇒ same hash across commits and journal appends; changed code ⇒ stale.
 */

function git(cwd: string, args: string[], env?: NodeJS.ProcessEnv): string | undefined {
  const res = spawnSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"], ...(env ? { env } : {}) });
  if (res.status !== 0) return undefined;
  const out = res.stdout.toString().trim();
  return out.length > 0 ? out : undefined;
}

export function gitHead(cwd: string): string | undefined {
  return git(cwd, ["rev-parse", "HEAD"]);
}

/** Dirty = working changes OUTSIDE .rivet (bookkeeping writes don't count). */
export function isDirty(cwd: string): boolean {
  const res = spawnSync("git", ["status", "--porcelain", "--", ":(exclude).rivet"], {
    cwd,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return res.status === 0 && res.stdout.toString().trim().length > 0;
}

/** Content identity of the current CODE state (tracked + untracked, excluding .rivet/). */
export function gitTreeHash(cwd: string): string | undefined {
  const tmpIndex = join(tmpdir(), `rivet-index-${process.pid}-${Math.random().toString(36).slice(2)}`);
  const env = { ...process.env, GIT_INDEX_FILE: tmpIndex };
  try {
    if (spawnSync("git", ["read-tree", "HEAD"], { cwd, env, stdio: "ignore" }).status !== 0) return undefined;
    spawnSync("git", ["rm", "--cached", "-r", "-q", "--ignore-unmatch", ".rivet"], { cwd, env, stdio: "ignore" });
    if (spawnSync("git", ["add", "-A", "--", ":(exclude).rivet"], { cwd, env, stdio: "ignore" }).status !== 0) {
      return undefined;
    }
    return git(cwd, ["write-tree"], env);
  } finally {
    try {
      unlinkSync(tmpIndex);
    } catch {
      /* never created */
    }
  }
}
