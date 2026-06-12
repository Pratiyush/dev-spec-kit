import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRivet, writeSidecar, type RivetCockpitData } from "./cockpit-data.js";

/**
 * REQUIREMENT_COCKPIT-03 — static shell emission. The shell (the design handoff, ported with
 * documented patches) is written ONCE per shell version; every emission rewrites only the
 * `rivet.data.js` sidecar. A user-tweaked shell survives same-version re-emits — the version
 * stamp is the only thing that may overwrite it.
 */

export const SHELL_VERSION = "1.0.0-cockpit";

export const SHELL_FILES = [
  "index.html",
  "rivet.css",
  "rivet.core.js",
  "rivet.dashboard.js",
  "rivet.config.js",
  "rivet.app.js",
] as const;

const VERSION_FILE = ".shell-version";

function assetsDir(): string {
  return fileURLToPath(new URL("./cockpit-assets/", import.meta.url));
}

export interface EmitResult {
  dir: string;
  wroteShell: boolean;
  data: RivetCockpitData;
}

export function emitCockpit(cwd: string, opts: { serverMode?: boolean } = {}): EmitResult {
  const dir = join(cwd, ".rivet", "cockpit");
  mkdirSync(dir, { recursive: true });
  const versionPath = join(dir, VERSION_FILE);
  const current = existsSync(versionPath) ? readFileSync(versionPath, "utf8").trim() : null;
  // finding #10: a bumped version OR any missing shell asset re-copies the shell (self-heal).
  const missingAsset = SHELL_FILES.some((f) => !existsSync(join(dir, f)));
  const wroteShell = current !== SHELL_VERSION || missingAsset;
  if (wroteShell) {
    const src = assetsDir();
    for (const f of SHELL_FILES) copyFileSync(join(src, f), join(dir, f));
    writeFileSync(versionPath, SHELL_VERSION + "\n");
  }
  const data = buildRivet(cwd, opts);
  writeSidecar(cwd, data);
  return { dir, wroteShell, data };
}
