import { mkdirSync, rmdirSync, statSync } from "node:fs";

/**
 * SCALE-01 — cross-process mutual exclusion with zero dependencies: mkdir is atomic on every
 * platform, so a lock DIRECTORY is the lock. Stale locks (a dead process) are stolen after
 * `staleMs`. This is what makes concurrent worktree waves safe against torn journal lines and
 * last-writer-wins graph clobbers.
 */

export interface LockOptions {
  timeoutMs?: number;
  staleMs?: number;
}

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function withLock<T>(lockDir: string, fn: () => T, opts: LockOptions = {}): T {
  const timeoutMs = opts.timeoutMs ?? 5_000;
  const staleMs = opts.staleMs ?? 30_000;
  const start = Date.now();
  for (;;) {
    try {
      mkdirSync(lockDir);
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      try {
        if (Date.now() - statSync(lockDir).mtimeMs >= staleMs) {
          rmdirSync(lockDir); // abandoned by a dead process — steal it
          continue;
        }
      } catch {
        continue; // holder released between our stat and now — retry immediately
      }
      if (Date.now() - start > timeoutMs) throw new Error(`lock timeout after ${timeoutMs}ms: ${lockDir}`);
      sleepSync(5 + Math.floor(Math.random() * 15));
    }
  }
  try {
    return fn();
  } finally {
    try {
      rmdirSync(lockDir);
    } catch {
      /* already stolen as stale — nothing to release */
    }
  }
}
