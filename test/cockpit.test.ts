import { afterEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCockpitData, sidecarJs } from "../src/cli/cockpit-data.js";
import { emitCockpit, SHELL_FILES } from "../src/cli/cockpit.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { taskDone, checkRun } from "../src/cli/tasks.js";

/**
 * REQUIREMENT_COCKPIT-02/03/04 — the cockpit is a STATIC SHELL (written once, version-stamped)
 * plus a `rivet.data.js` sidecar (window.RIVET) the CLI rewrites: on demand, and on every proof
 * event when dashboard.updates="live". The sidecar is the project's truth — including the truths
 * that hurt (stale evidence, failure tails) — and hostile artifact content must never be able to
 * break out of the script tag.
 */

const OLD_TREE = "fade1234567890fade1234567890fade12345678";

function project(extraConfig: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-cockpit-"));
  execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
  writeFileSync(join(dir, "app.ts"), "export const one = 1;\n");
  execSync("git add -A && git commit -qm init", { cwd: dir });
  mkdirSync(join(dir, ".dev-spec-kit", "specs"), { recursive: true });
  writeFileSync(join(dir, ".dev-spec-kit", "config.json"), JSON.stringify({ version: 1, ...extraConfig }));
  writeFileSync(
    join(dir, ".dev-spec-kit", "specs", "feat.md"),
    [
      "## Requirement REQUIREMENT_FEAT-01 — the feature",
      "",
      "Scenario: works",
      "  Given a thing",
      "  When it runs",
      "  Then it works",
      "",
      "@check kind=unit ref=test/a.test.ts::works",
      "",
      "IF the input is invalid THEN the system SHALL reject it.",
      "",
      "@check kind=unit ref=test/a.test.ts::rejects",
    ].join("\n"),
  );
  // an artifact carrying a hostile payload — must never escape the sidecar's script tag
  writeFileSync(
    join(dir, ".dev-spec-kit", "laws.md"),
    "# Laws\n\nNever trust `</script><script>alert(1)</script>`.\n",
  );
  const store = new TaskStore(new Journal(join(dir, ".dev-spec-kit", "journal.jsonl")));
  store.create("REQUIREMENT_FEAT-01", "the feature", ["test/a.test.ts::works", "test/a.test.ts::rejects"]);
  store.setStatus("REQUIREMENT_FEAT-01", "in_progress");
  store.recordCheck("REQUIREMENT_FEAT-01", {
    ref: "test/a.test.ts::works",
    passed: true,
    at: "2026-06-12T08:00:00Z",
    tree: OLD_TREE, // recorded on an OLDER tree than the repo's current one
    kind: "unit",
  });
  store.recordCheck("REQUIREMENT_FEAT-01", {
    ref: "test/a.test.ts::rejects",
    passed: false,
    at: "2026-06-12T08:01:00Z",
    kind: "unit",
    tail: "AssertionError: expected rejection",
  });
  return dir;
}

describe("REQUIREMENT_COCKPIT-02 — the RIVET sidecar is the project's truth", () => {
  const dir = project();
  const data = buildCockpitData(dir);

  it("the RIVET sidecar carries meta, dashboard truth, and the config manifest", () => {
    expect(data.meta.refreshSeconds).toBe(15);
    expect(data.meta.inFlightTasks).toContain("REQUIREMENT_FEAT-01");
    expect(data.meta.serverMode).toBe(false);
    expect(data.nav[0]!.items.length).toBeGreaterThanOrEqual(6);
    const d = data.dashboard;
    expect(d.completion).toMatchObject({ done: 0, total: 1 });
    expect(d.validates.red).toBeGreaterThanOrEqual(1);
    expect(d.tasks[0]!.id).toBe("REQUIREMENT_FEAT-01");
    expect(d.tasks[0]!.results["test/a.test.ts::rejects"]!.tail).toContain("AssertionError");
    expect(d.requirements[0]!.id).toBe("REQUIREMENT_FEAT-01");
    expect(d.requirements[0]!.criteria.length).toBe(2);
    expect(d.activity.length).toBeGreaterThan(0);
    expect(d.files.map((f) => f.name)).toContain("laws.md");
    expect(data.config.sections).toHaveLength(15);
    expect(data.config.manifest.length).toBeGreaterThan(60);
  });

  it("passing results from an older tree are marked stale in the sidecar", () => {
    const r = data.dashboard.tasks[0]!.results["test/a.test.ts::works"]!;
    expect(r.passed).toBe(true);
    expect(r.stale).toBe(true); // 🟣, never 🟢 — the tree moved after the proof
  });

  it("a closing script tag in artifact content is escaped in the sidecar", () => {
    const js = sidecarJs(data);
    expect(js.startsWith("window.RIVET = ")).toBe(true);
    expect(js).not.toContain("</script>");
    expect(js).toContain("\\u003c/script");
  });
});

describe("REQUIREMENT_COCKPIT-03 — static shell emission, written once", () => {
  it("emission writes the shell once plus a fresh sidecar", () => {
    const dir = project();
    const res = emitCockpit(dir);
    expect(res.wroteShell).toBe(true);
    for (const f of SHELL_FILES) expect(existsSync(join(dir, ".dev-spec-kit", "cockpit", f)), f).toBe(true);
    expect(existsSync(join(dir, ".dev-spec-kit", "cockpit", "rivet.data.js"))).toBe(true);
    const html = readFileSync(join(dir, ".dev-spec-kit", "cockpit", "index.html"), "utf8");
    expect(html).toContain('src="rivet.data.js"');
  });

  it("re-emission touches only the sidecar until the shell version changes", () => {
    const dir = project();
    emitCockpit(dir);
    const shellPath = join(dir, ".dev-spec-kit", "cockpit", "rivet.core.js");
    const dataPath = join(dir, ".dev-spec-kit", "cockpit", "rivet.data.js");
    writeFileSync(shellPath, "/* user-tweaked */\n"); // must survive a same-version re-emit
    const before = statSync(dataPath).mtimeMs;
    const res = emitCockpit(dir);
    expect(res.wroteShell).toBe(false);
    expect(readFileSync(shellPath, "utf8")).toBe("/* user-tweaked */\n");
    expect(statSync(dataPath).mtimeMs).toBeGreaterThanOrEqual(before);
    // a bumped shell version rewrites the shell
    writeFileSync(join(dir, ".dev-spec-kit", "cockpit", ".shell-version"), "0-old\n");
    const res2 = emitCockpit(dir);
    expect(res2.wroteShell).toBe(true);
    expect(readFileSync(shellPath, "utf8")).not.toBe("/* user-tweaked */\n");
  });
});

describe("REQUIREMENT_COCKPIT-04 — live updates after every proof event", () => {
  const here = process.cwd();
  afterEach(() => process.chdir(here));

  it("live mode rewrites the sidecar on task done and check run", async () => {
    const dir = project({
      dashboard: { updates: "live" },
      verify: { kindRunners: { unit: { cmd: "node", args: ["-e", "process.exit(0)"] } } },
    });
    process.chdir(dir);
    const dataPath = join(dir, ".dev-spec-kit", "cockpit", "rivet.data.js");
    expect(existsSync(dataPath)).toBe(false);
    await checkRun("REQUIREMENT_FEAT-01", "test/a.test.ts::works", "node-vitest", {});
    expect(existsSync(dataPath), "check run must write the sidecar in live mode").toBe(true);
    const afterCheck = readFileSync(dataPath, "utf8");
    await checkRun("REQUIREMENT_FEAT-01", "test/a.test.ts::rejects", "node-vitest", {});
    taskDone("REQUIREMENT_FEAT-01");
    const afterDone = readFileSync(dataPath, "utf8");
    expect(afterDone).not.toBe(afterCheck);
    expect(afterDone).toContain('"done": 1');
  });

  it("on-demand mode never rewrites the sidecar on task events", async () => {
    const dir = project({
      dashboard: { updates: "on-demand" }, // REQUIREMENT_DOCS-01 flipped the default to live
      verify: { kindRunners: { unit: { cmd: "node", args: ["-e", "process.exit(0)"] } } },
    });
    process.chdir(dir);
    await checkRun("REQUIREMENT_FEAT-01", "test/a.test.ts::works", "node-vitest", {});
    expect(existsSync(join(dir, ".dev-spec-kit", "cockpit", "rivet.data.js"))).toBe(false);
  });
});
