import { afterEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { taskCreate } from "../src/cli/tasks.js";
import { drift, trace } from "../src/cli/queries.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";

/**
 * REQUIREMENT_DOCS-01 — "every time we change anything, it should update the documents"
 * (Pratiyush, 2026-06-12). BOARDS-01 gave LEDGER/TRACKING a cannot-lie guarantee; this extends it
 * to EVERY generated document — RESUME, graph.json, and the cockpit sidecar — on EVERY mutating
 * command. Read-only stays read-only (FIX-QUERY-01); dashboard.updates="on-demand" opts only the
 * sidecar out. This is the regression test for the stale-dashboard incident: drift re-greened 21
 * proofs while the open cockpit kept showing yesterday.
 */

const OLD_TREE = "fade1234567890fade1234567890fade12345678";

function project(extraConfig: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "rivet-docs-"));
  execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
  writeFileSync(join(dir, "app.ts"), "export const one = 1;\n");
  execSync("git add -A && git commit -qm init", { cwd: dir });
  mkdirSync(join(dir, ".rivet", "specs"), { recursive: true });
  writeFileSync(
    join(dir, ".rivet", "config.json"),
    JSON.stringify({
      version: 1,
      verify: { kindRunners: { unit: { cmd: "node", args: ["-e", "process.exit(0)"] } } },
      ...extraConfig,
    }),
  );
  writeFileSync(
    join(dir, ".rivet", "specs", "feat.md"),
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
      "@check kind=unit ref=test/a.test.ts::works",
    ].join("\n"),
  );
  return dir;
}

const here = process.cwd();
afterEach(() => process.chdir(here));

describe("REQUIREMENT_DOCS-01 — every mutation refreshes every generated document", () => {
  it("task mutations refresh boards, resume, graph, and the sidecar", () => {
    const dir = project(); // dashboard.updates defaults to live now
    process.chdir(dir);
    taskCreate("T1", "first thing", ["test/a.test.ts::works"]);
    for (const doc of ["LEDGER.md", "TRACKING.md", "RESUME.md", "graph.json", "cockpit/rivet.data.js"]) {
      expect(existsSync(join(dir, ".rivet", doc)), `${doc} must exist after a mutation`).toBe(true);
    }
    expect(readFileSync(join(dir, ".rivet", "LEDGER.md"), "utf8")).toContain("T1");
    expect(readFileSync(join(dir, ".rivet", "cockpit", "rivet.data.js"), "utf8")).toContain("first thing");
  });

  it("drift refreshes the sidecar and boards after re-proving", async () => {
    const dir = project();
    const store = new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));
    store.create("REQUIREMENT_FEAT-01", "the feature", ["test/a.test.ts::works"]);
    store.recordCheck("REQUIREMENT_FEAT-01", {
      ref: "test/a.test.ts::works",
      passed: true,
      at: "2026-06-12T08:00:00Z",
      tree: OLD_TREE, // older tree ⇒ the proof is STALE against the repo's current tree
      stack: "node-vitest",
      kind: "unit",
    });
    process.chdir(dir);
    drift({}); // re-runs the stale proof via the fake green runner
    const sidecar = readFileSync(join(dir, ".rivet", "cockpit", "rivet.data.js"), "utf8");
    expect(sidecar).toContain('"green": 2'); // two criteria bind the same ref — both edges green
    expect(sidecar).toContain('"stale": 0');
    expect(readFileSync(join(dir, ".rivet", "LEDGER.md"), "utf8")).toContain("REQUIREMENT_FEAT-01");
  });

  it("read-only queries never create or touch documents", () => {
    const dir = project();
    process.chdir(dir);
    trace(); // FIX-QUERY-01: queries leave no fingerprints
    for (const doc of ["LEDGER.md", "RESUME.md", "graph.json", "cockpit"]) {
      expect(existsSync(join(dir, ".rivet", doc)), `${doc} must NOT appear from a read-only query`).toBe(
        false,
      );
    }
  });

  it("on-demand keeps boards fresh without writing the sidecar", () => {
    const dir = project({ dashboard: { updates: "on-demand" } });
    process.chdir(dir);
    taskCreate("T1", "first thing", ["test/a.test.ts::works"]);
    expect(existsSync(join(dir, ".rivet", "LEDGER.md"))).toBe(true);
    expect(existsSync(join(dir, ".rivet", "RESUME.md"))).toBe(true);
    expect(existsSync(join(dir, ".rivet", "cockpit", "rivet.data.js"))).toBe(false);
  });
});
