import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlinkSync } from "node:fs";

/**
 * Git identity helpers — FIX-PROOF-01 + FIX-PROOF-02.
 *
 * A proof must identify the CODE it ran against — not the commit that happened to be HEAD, and not
 * dev-spec-kit's own bookkeeping. `gitTreeHash` builds a temporary index from HEAD, DROPS `.dev-spec-kit/` (the
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

/** Dirty = working changes OUTSIDE .dev-spec-kit (bookkeeping writes don't count). */
export function isDirty(cwd: string): boolean {
  const res = spawnSync("git", ["status", "--porcelain", "--", ":(exclude).dev-spec-kit"], {
    cwd,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return res.status === 0 && res.stdout.toString().trim().length > 0;
}

/** Content identity of the current CODE state (tracked + untracked, excluding .dev-spec-kit/). */
export function gitTreeHash(cwd: string): string | undefined {
  const tmpIndex = join(tmpdir(), `dev-spec-kit-index-${process.pid}-${Math.random().toString(36).slice(2)}`);
  const env = { ...process.env, GIT_INDEX_FILE: tmpIndex };
  try {
    if (spawnSync("git", ["read-tree", "HEAD"], { cwd, env, stdio: "ignore" }).status !== 0) return undefined;
    spawnSync("git", ["rm", "--cached", "-r", "-q", "--ignore-unmatch", ".dev-spec-kit"], {
      cwd,
      env,
      stdio: "ignore",
    });
    if (
      spawnSync("git", ["add", "-A", "--", ":(exclude).dev-spec-kit"], { cwd, env, stdio: "ignore" })
        .status !== 0
    ) {
      /* c8 ignore start -- `git add` of the working tree into a temp index essentially never fails
         once read-tree succeeded; defensive bail-out. */
      return undefined;
    }
    /* c8 ignore stop */
    return git(cwd, ["write-tree"], env);
  } finally {
    /* c8 ignore start -- the temp index unlink only fails if it was never created (an early git
       failure); the happy unlink is covered. */
    try {
      unlinkSync(tmpIndex);
    } catch {
      /* never created */
    }
    /* c8 ignore stop */
  }
}
