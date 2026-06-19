import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { factsVerdict, type FactsState } from "../src/engine/facts.js";

/**
 * GATE-FACTS-01 (ECC GateGuard, A/B-evidenced): DENY the first edit to a file, FORCE named
 * fact-gathering, ALLOW the retry. Opt-in via config gates.facts="on" — ceremony stays proportional.
 */

describe("factsVerdict engine", () => {
  const T0 = 1_000_000;

  it("denies the first edit, allows the retry within the window", () => {
    const s0: FactsState = { entries: {} };
    const first = factsVerdict(s0, "src/a.ts", T0);
    expect(first.deny).toBe(true);
    const second = factsVerdict(first.state, "src/a.ts", T0 + 60_000);
    expect(second.deny).toBe(false);
  });

  it("expires after 30 minutes — a stale allowance re-denies", () => {
    const s0: FactsState = { entries: {} };
    const first = factsVerdict(s0, "src/a.ts", T0);
    const later = factsVerdict(first.state, "src/a.ts", T0 + 31 * 60_000);
    expect(later.deny).toBe(true);
  });

  it("caps tracked entries at 500 (oldest evicted, no unbounded growth)", () => {
    let s: FactsState = { entries: {} };
    for (let i = 0; i < 510; i++) s = factsVerdict(s, `f${i}.ts`, T0 + i).state;
    expect(Object.keys(s.entries).length).toBeLessThanOrEqual(500);
  });
});

describe("guard-facts hook (process-level)", () => {
  const hook = join(process.cwd(), "hooks", "guard-facts.mjs");
  const run = (payload: object): { status: number | null; stderr: string } => {
    const r = spawnSync("node", [hook], { input: JSON.stringify(payload), stdio: ["pipe", "pipe", "pipe"] });
    return { status: r.status, stderr: r.stderr.toString() };
  };

  function project(facts: "on" | "off"): string {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-facts-"));
    mkdirSync(join(dir, ".dev-spec-kit", "cache"), { recursive: true });
    writeFileSync(
      join(dir, ".dev-spec-kit", "config.json"),
      JSON.stringify({ version: 1, gates: { facts } }),
    );
    return dir;
  }

  it("OFF by default-config: passes straight through", () => {
    const cwd = project("off");
    expect(run({ tool_name: "Edit", tool_input: { file_path: join(cwd, "src", "a.ts") }, cwd }).status).toBe(
      0,
    );
  });

  it("ON: first edit denied with a fact demand, retry allowed", () => {
    const cwd = project("on");
    const payload = { tool_name: "Edit", tool_input: { file_path: join(cwd, "src", "a.ts") }, cwd };
    const first = run(payload);
    expect(first.status).toBe(2);
    expect(first.stderr).toMatch(/facts|investigate|importers/i);
    expect(run(payload).status).toBe(0); // facts presented -> retry allowed
  });
});
