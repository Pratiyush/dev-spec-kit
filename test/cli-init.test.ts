import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { runInit } from "../src/cli/init.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

describe("rivet init — scaffold the durable .rivet/ state", () => {
  it("initializes a fresh project (config, laws, journal, gitignore)", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => runInit({}));
    expect(text).toContain("Initialized Rivet");
    expect(existsSync(join(dir, ".rivet", "config.json"))).toBe(true);
    expect(existsSync(join(dir, ".rivet", "laws.md"))).toBe(true);
    expect(existsSync(join(dir, ".rivet", "journal.jsonl"))).toBe(true);
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toContain("graphify-out/");
  });

  it("refuses to clobber an existing config without --force", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ version: 1, project: { name: "tuned" } }),
    });
    const { text } = run(dir, () => runInit({}));
    expect(text).toContain("already initialized");
    // config untouched
    expect(JSON.parse(readFileSync(join(dir, ".rivet", "config.json"), "utf8")).project.name).toBe("tuned");
  });

  it("seeds platform law packs and prints them on a fresh init --platforms", () => {
    const dir = tmpProject();
    const { text } = run(dir, () => runInit({ platforms: "typescript,electron" }));
    expect(text).toContain("platforms: typescript, electron");
    const cfg = JSON.parse(readFileSync(join(dir, ".rivet", "config.json"), "utf8"));
    expect(cfg.project.platforms).toEqual(["typescript", "electron"]);
  });

  it("updates ONLY project.platforms when re-run on an existing config (no clobber)", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({
        version: 1,
        project: { name: "keepme" },
        verify: { coverage: 90 },
      }),
    });
    const { text } = run(dir, () => runInit({ platforms: "python" }));
    expect(text).toContain("platforms: python");
    const cfg = JSON.parse(readFileSync(join(dir, ".rivet", "config.json"), "utf8"));
    expect(cfg.project.platforms).toEqual(["python"]);
    expect(cfg.project.name).toBe("keepme"); // preserved
    expect(cfg.verify.coverage).toBe(90); // preserved
  });

  it("rejects an unknown platform with the allowed list", () => {
    const dir = tmpProject();
    expect(() => run(dir, () => runInit({ platforms: "cobol" }))).toThrow(/unknown platform/);
  });

  it("--force overwrites an existing config and re-seeds laws", () => {
    const dir = tmpProject({
      ".rivet/config.json": JSON.stringify({ version: 1, project: { name: "old" } }),
    });
    const { text } = run(dir, () => runInit({ force: true }));
    expect(text).toContain("Initialized Rivet");
    expect(JSON.parse(readFileSync(join(dir, ".rivet", "config.json"), "utf8")).project.name).toBe(
      "untitled",
    );
  });

  it("appends gitignore entries when the file exists without a trailing newline", () => {
    const dir = tmpProject();
    writeFileSync(join(dir, ".gitignore"), "node_modules/"); // no trailing newline
    run(dir, () => runInit({}));
    const gi = readFileSync(join(dir, ".gitignore"), "utf8");
    expect(gi).toContain("node_modules/");
    expect(gi).toContain(".rivet/cache/");
  });

  it("is idempotent on .gitignore — a second init adds nothing", () => {
    const dir = tmpProject();
    run(dir, () => runInit({}));
    const after1 = readFileSync(join(dir, ".gitignore"), "utf8");
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    run(dir, () => runInit({ force: true }));
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe(after1);
  });
});
