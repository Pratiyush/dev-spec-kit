import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planVerify, runVerify } from "../src/engine/verify/verify-all.js";
import { verifyVerdict } from "../src/engine/gate.js";
import { parseConfig } from "../src/config/schema.js";

/**
 * FEAT-VERIFY-01 — "Build ALL. Run All Type Test." One journaled `rivet verify` = build steps +
 * every configured kind's FULL suite (no -t filter), sequential, report-all (a red never hides the
 * later reds), summarized 📋 with ⏱️ durations. A green task is not a green project; this command
 * is the project-level truth, and the PR gate demands it green ON THE CURRENT CODE TREE.
 */

const ok = { cmd: "node", args: ["-e", "process.exit(0)"] };
const fail = { cmd: "node", args: ["-e", "process.exit(1)"] };

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "rivet-verify-"));
}

describe("FEAT-VERIFY-01 — plan: everything configured, nothing twice", () => {
  it("derives build steps from verify.buildAll and dedupes kinds that share a runner", () => {
    const config = parseConfig({
      verify: {
        buildAll: [ok],
        kinds: ["unit", "integration"],
        kindRunners: {
          unit: { cmd: "node", args: ["-e", "process.exit(0)", "{ref}"] }, // placeholder stripped in full-suite mode
          integration: ok,
        },
      },
    });
    const steps = planVerify(tmp(), config);
    expect(steps.filter((s) => s.name.startsWith("build"))).toHaveLength(1);
    const testSteps = steps.filter((s) => s.name.startsWith("tests"));
    expect(testSteps).toHaveLength(1); // unit+integration resolve to the SAME command → run once
    expect(testSteps[0]!.kinds).toEqual(["unit", "integration"]);
    expect(testSteps[0]!.args.join(" ")).not.toContain("{ref}");
  });

  it("includes custom kinds wired only in kindRunners (lint, audit) — everything configured runs", () => {
    const config = parseConfig({
      verify: {
        kinds: ["unit"],
        kindRunners: { unit: ok, lint: fail },
      },
    });
    const kinds = planVerify(tmp(), config)
      .filter((s) => s.name.startsWith("tests"))
      .flatMap((s) => s.kinds ?? []);
    expect(kinds).toContain("lint");
  });

  it("falls back to package.json build/typecheck scripts for node-ish platforms", () => {
    const dir = tmp();
    writeFileSync(join(dir, "package.json"), JSON.stringify({ scripts: { build: "tsc", typecheck: "tsc --noEmit" } }));
    const config = parseConfig({
      project: { platforms: ["typescript"] },
      verify: { kinds: ["unit"], kindRunners: { unit: ok } },
    });
    const names = planVerify(dir, config).map((s) => s.name);
    expect(names).toContain("build:build");
    expect(names).toContain("build:typecheck");
  });
});

describe("FEAT-VERIFY-01 — run: sequential, report-all, honest exit", () => {
  it("all green ⇒ passed, with per-step durations", () => {
    const config = parseConfig({ verify: { buildAll: [ok], kinds: ["unit"], kindRunners: { unit: ok } } });
    const run = runVerify(tmp(), config);
    expect(run.passed).toBe(true);
    expect(run.steps).toHaveLength(2);
    for (const s of run.steps) {
      expect(s.ok).toBe(true);
      expect(s.ms).toBeGreaterThanOrEqual(0);
    }
  });

  it("a red step turns the run red but every later step STILL executes (report-all)", () => {
    const config = parseConfig({ verify: { buildAll: [fail], kinds: ["unit"], kindRunners: { unit: ok } } });
    const run = runVerify(tmp(), config);
    expect(run.passed).toBe(false);
    expect(run.steps).toHaveLength(2);
    expect(run.steps[0]!.ok).toBe(false);
    expect(run.steps[1]!.ok).toBe(true); // ran anyway — the summary shows the whole picture
  });
});

describe("FEAT-VERIFY-01 — the PR gate demands a fresh green verify (same code tree)", () => {
  const ev = (data: Record<string, unknown>) => ({ at: "t", type: "verify.run", data });

  it("no verify recorded ⇒ blocked", () => {
    const v = verifyVerdict([], "TREE");
    expect(v.ok).toBe(false);
    expect(v.reasons.join(" ")).toMatch(/rivet verify/);
  });

  it("red verify ⇒ blocked; stale tree ⇒ blocked; fresh green ⇒ ok", () => {
    expect(verifyVerdict([ev({ passed: false, tree: "TREE" })], "TREE").ok).toBe(false);
    const stale = verifyVerdict([ev({ passed: true, tree: "OLD" })], "TREE");
    expect(stale.ok).toBe(false);
    expect(stale.reasons.join(" ")).toMatch(/stale/i);
    expect(verifyVerdict([ev({ passed: true, tree: "TREE" })], "TREE").ok).toBe(true);
  });

  it("the LAST verify wins (an old green does not whitewash a newer red)", () => {
    const events = [ev({ passed: true, tree: "TREE" }), ev({ passed: false, tree: "TREE" })];
    expect(verifyVerdict(events, "TREE").ok).toBe(false);
  });
});
