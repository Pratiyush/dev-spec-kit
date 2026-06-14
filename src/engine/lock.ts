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

/* c8 ignore next 3 -- a busy-wait only entered under live lock CONTENTION (another process holds the
   dir); deterministic unit tests take the uncontended mkdir path. */
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
      /* c8 ignore start -- the contention branch: reached only when another live process holds the
         lock (stat race, timeout, back-off). The stale-steal path is covered in scale.test. */
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
      /* c8 ignore stop */
    }
  }
  try {
    return fn();
  } finally {
    try {
      rmdirSync(lockDir);
    } catch {
      /* c8 ignore next -- only if the lock was stolen as stale mid-run (a race); nothing to release */
    }
  }
}
