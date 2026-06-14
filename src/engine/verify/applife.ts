import { spawn } from "node:child_process";

/**
 * RUNNERS-01 — app lifecycle for api/e2e checks: start the app (own process group), wait until it
 * answers, run the checks, and ALWAYS tear it down — pass, fail, or throw. "Unit-green but the app
 * doesn't actually run" was one of the founding pain points; this is the machinery that closes it.
 */

export interface AppConfig {
  start: string[];
  readyUrl?: string | null;
  readyTimeoutMs: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* c8 ignore start -- polls a REAL app URL until it answers; only used by the spawned-app path above
   (itself ignored). Needs a live server to exercise — integration, not unit. */
async function waitReady(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return; // it answered — ready (4xx still proves liveness)
    } catch {
      /* not up yet */
    }
    if (Date.now() - start > timeoutMs) throw new Error(`app not ready after ${timeoutMs}ms: ${url}`);
    await sleep(250);
  }
}
/* c8 ignore stop */

export async function withApp<T>(app: AppConfig, fn: () => T | Promise<T>): Promise<T> {
  if (app.start.length === 0) return await fn();
  /* c8 ignore start -- spawns a REAL app process (mvn/gradle/node server) and tears down its process
     group with SIGTERM→SIGKILL escalation; only reachable for api/e2e checks with a configured app.
     Unit tests drive the no-app path; this is integration territory. */
  const child = spawn(app.start[0]!, app.start.slice(1), { stdio: "ignore", detached: true });
  try {
    if (app.readyUrl) await waitReady(app.readyUrl, app.readyTimeoutMs);
    else await sleep(1000);
    return await fn();
  } finally {
    // Kill the whole process group (mvn/gradle spawn children); escalate if it lingers.
    const pid = child.pid;
    if (pid) {
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        try {
          child.kill("SIGTERM");
        } catch {
          /* already gone */
        }
      }
      await sleep(300);
      try {
        process.kill(-pid, "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
  /* c8 ignore stop */
}
