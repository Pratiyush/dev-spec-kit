import { join } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { emitCockpit } from "./cockpit.js";
import { label } from "./emoji.js";

/**
 * `dev-spec-kit dashboard` — emits the COCKPIT (the design-handoff shell + the window.RIVET sidecar)
 * and optionally opens it. DASH-02's single-file template grew into .dev-spec-kit/cockpit/ with
 * FEAT-COCKPIT: the shell is static (written once per version), rivet.data.js carries the truth,
 * and `dev-spec-kit web` serves the same files with the validated save API.
 */

export interface CockpitFile {
  name: string;
  content: string;
}

const FILE_CAP = 50_000;

/** FILES-01: every human-readable .dev-spec-kit markdown artifact, in stable reading order. */
export function collectCockpitFiles(cwd: string): CockpitFile[] {
  const base = join(cwd, ".dev-spec-kit");
  const out: CockpitFile[] = [];
  const add = (rel: string) => {
    const p = join(base, rel);
    if (!existsSync(p)) return;
    let content = readFileSync(p, "utf8");
    if (content.length > FILE_CAP) content = content.slice(0, FILE_CAP) + "\n…(truncated)";
    out.push({ name: rel, content });
  };
  const dir = (rel: string) => {
    const p = join(base, rel);
    if (!existsSync(p)) return [] as string[];
    return readdirSync(p)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => `${rel}/${f}`);
  };
  add("laws.md");
  for (const f of dir("laws")) add(f);
  add("learnings.md");
  add("DEFER.md");
  for (const f of dir("specs")) add(f);
  add("LEDGER.md");
  add("TRACKING.md");
  add("RESUME.md");
  for (const f of dir("approvals")) add(f);
  return out;
}

export function dashboardCmd(opts: { open?: boolean }): void {
  const cwd = process.cwd();
  const res = emitCockpit(cwd);
  console.log(
    pc.green(`✓ cockpit ${res.wroteShell ? "generated" : "data refreshed"}`) +
      pc.dim(
        ` → .dev-spec-kit/cockpit/index.html (dashboard + config studio · reloads every ${res.data.meta.refreshSeconds}s)`,
      ),
  );
  console.log(pc.dim(`  ${label("report")} edit config with save + gates: dev-spec-kit web`));
  if (opts.open) spawnSync("open", [join(res.dir, "index.html")], { stdio: "ignore" });
}
