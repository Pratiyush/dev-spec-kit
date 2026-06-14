/**
 * CLI integration harness — drive a thin `rivet` command against a throwaway project and read what
 * it printed / wrote. vitest's default `forks` pool gives each test FILE its own process, so the
 * process.chdir here is isolated from other files; inDir always restores cwd.
 */
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { vi } from "vitest";

/** A temp dir with a `.rivet/specs/` skeleton; seed extra files via the map (paths relative to root). */
export function tmpProject(files: Record<string, string> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "rivet-cli-"));
  mkdirSync(join(dir, ".rivet", "specs"), { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
  return dir;
}

const ANSI = /\[[0-9;]*m/g;
export const noColor = (s: string): string => s.replace(ANSI, "");

/** Capture console.log/error/warn. Returns a reader (colour-stripped) and a restore(). */
export function capture(): { text: () => string; restore: () => void } {
  const out: string[] = [];
  const sink = (...a: unknown[]): void => {
    out.push(a.map(String).join(" "));
  };
  const spies = [
    vi.spyOn(console, "log").mockImplementation(sink),
    vi.spyOn(console, "error").mockImplementation(sink),
    vi.spyOn(console, "warn").mockImplementation(sink),
  ];
  return { text: () => noColor(out.join("\n")), restore: () => spies.forEach((s) => s.mockRestore()) };
}

/** Run fn with cwd = dir, always restoring the previous cwd. */
export function inDir<T>(dir: string, fn: () => T): T {
  const prev = process.cwd();
  process.chdir(dir);
  try {
    return fn();
  } finally {
    process.chdir(prev);
  }
}

export interface RunResult {
  text: string;
  exitCode: number | string | undefined;
}

/** chdir + capture, run a SYNC command, return what it printed and the exit code it signalled. */
export function run(dir: string, fn: () => void): RunResult {
  const cap = capture();
  const prevExit = process.exitCode;
  process.exitCode = undefined; // read only THIS command's signal
  try {
    inDir(dir, fn);
    return { text: cap.text(), exitCode: process.exitCode };
  } finally {
    cap.restore();
    process.exitCode = prevExit; // never leak a failure code to the runner
  }
}

/** Async-command variant (pr, verify, route, …). */
export async function runAsync(dir: string, fn: () => Promise<void>): Promise<RunResult> {
  const cap = capture();
  const prevExit = process.exitCode;
  process.exitCode = undefined;
  const prev = process.cwd();
  process.chdir(dir);
  try {
    await fn();
    return { text: cap.text(), exitCode: process.exitCode };
  } finally {
    process.chdir(prev);
    cap.restore();
    process.exitCode = prevExit;
  }
}
