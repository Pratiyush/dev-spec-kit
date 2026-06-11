import { spawnSync } from "node:child_process";

/**
 * Git identity helpers — FIX-PROOF-01.
 *
 * A proof must identify the CONTENT it ran against, not the commit that happened to be HEAD.
 * `gitTreeHash` returns the tree-hash of the working state: via `git stash create` when the tree is
 * dirty (a commit object reflecting tracked working changes, without touching the tree or index),
 * else HEAD's tree. Same content ⇒ same hash, across commits — so committing tested code does NOT
 * stale its proofs, and discarding tested changes does.
 *
 * Known limitation (safe direction): untracked files are invisible to `stash create`, so a brand-new
 * file doesn't change the identity until first `git add` — at which point proofs go stale and must
 * re-run. Re-verification is forced, never skipped.
 */

function git(cwd: string, args: string[]): string | undefined {
  const res = spawnSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] });
  if (res.status !== 0) return undefined;
  const out = res.stdout.toString().trim();
  return out.length > 0 ? out : undefined;
}

export function gitHead(cwd: string): string | undefined {
  return git(cwd, ["rev-parse", "HEAD"]);
}

export function isDirty(cwd: string): boolean {
  const res = spawnSync("git", ["status", "--porcelain"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 && res.stdout.toString().trim().length > 0;
}

/** Content identity of the current working state (tracked files). */
export function gitTreeHash(cwd: string): string | undefined {
  const stash = git(cwd, ["stash", "create"]);
  if (stash) return git(cwd, ["rev-parse", `${stash}^{tree}`]);
  return git(cwd, ["rev-parse", "HEAD^{tree}"]);
}
