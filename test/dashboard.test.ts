import { afterEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dashboardCmd } from "../src/cli/dashboard.js";

/** DASH-02 → FEAT-COCKPIT: `dev-spec-kit dashboard` now emits the cockpit — static shell + data sidecar.
 *  The injection-safety and rendering pins live with the cockpit suite; this pins the command. */

describe("dev-spec-kit dashboard emits the cockpit", () => {
  const here = process.cwd();
  afterEach(() => process.chdir(here));

  it("writes .dev-spec-kit/cockpit (shell + sidecar) and reports the reload cadence", () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-dash-"));
    execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
    writeFileSync(join(dir, "a.ts"), "export const a = 1;");
    execSync("git add -A && git commit -qm init", { cwd: dir });
    mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
    writeFileSync(join(dir, ".dev-spec-kit", "config.json"), JSON.stringify({ version: 1 }));
    process.chdir(dir);
    dashboardCmd({});
    const cockpit = join(dir, ".dev-spec-kit", "cockpit");
    expect(existsSync(join(cockpit, "index.html"))).toBe(true);
    expect(existsSync(join(cockpit, "rivet.data.js"))).toBe(true);
    expect(readFileSync(join(cockpit, "index.html"), "utf8")).toContain('src="rivet.data.js"');
    expect(readFileSync(join(cockpit, "rivet.data.js"), "utf8")).toContain('"refreshSeconds": 15');
  });
});
