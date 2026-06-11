import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseConfig } from "../src/config/schema.js";
import { loadConfig, InputError } from "../src/cli/config-io.js";

/** Dogfood lesson (notepad session): "stack" named two disjoint enums — project description vs
 *  runner ids — and filing a runner id in config failed every command with a useless error. */

describe("project.platforms replaces project.stacks", () => {
  it("platforms accepts codebase descriptors", () => {
    const c = parseConfig({ project: { platforms: ["typescript", "spring"] } });
    expect(c.project.platforms).toEqual(["typescript", "spring"]);
  });

  it("legacy project.stacks is ignored harmlessly (no crash, defaults apply)", () => {
    const c = parseConfig({ project: { stacks: ["node"] } });
    expect(c.project.platforms).toEqual([]);
  });
});

describe("filing a RUNNER stack under platforms produces a disambiguating error", () => {
  it("the error names both vocabularies and points to the right home", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-stacks-"));
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    writeFileSync(
      join(dir, ".rivet", "config.json"),
      JSON.stringify({ version: 1, project: { platforms: ["node-vitest"] } }),
    );
    let message = "";
    try {
      loadConfig(dir);
    } catch (e) {
      expect(e).toBeInstanceOf(InputError);
      message = (e as Error).message;
    }
    expect(message).toMatch(/RUNNER stack/i);
    expect(message).toContain("check run --stack node-vitest");
    expect(message).toMatch(/verify\.runners/);
    expect(message).toMatch(/platforms/);
  });
});
