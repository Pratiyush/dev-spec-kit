import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prChangedFiles } from "../src/cli/workflow.js";

function git(dir: string, args: string[]): void {
  spawnSync("git", ["-c", "user.email=t@t.co", "-c", "user.name=t", ...args], { cwd: dir, stdio: "ignore" });
}

/** A git repo on `main` with one committed source file. */
function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-changed-"));
  writeFileSync(join(dir, "a.ts"), "export const a = 1;\n");
  git(dir, ["init", "-b", "main"]);
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-m", "base"]);
  return dir;
}

describe("prChangedFiles", () => {
  it("lists files changed on a branch since it forked from main (committed + working)", () => {
    const dir = repo();
    git(dir, ["checkout", "-b", "feat"]);
    writeFileSync(join(dir, "a.ts"), "export const a = 2;\n"); // modified
    writeFileSync(join(dir, "b.ts"), "export const b = 1;\n"); // added
    git(dir, ["add", "-A"]);
    git(dir, ["commit", "-m", "work"]);
    const changed = prChangedFiles(dir).sort();
    expect(changed).toEqual(["a.ts", "b.ts"]);
  });

  it("is empty when nothing changed since the base", () => {
    const dir = repo();
    git(dir, ["checkout", "-b", "feat"]); // no changes
    expect(prChangedFiles(dir)).toEqual([]);
  });

  it("is empty outside a git repository (no base resolves)", () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-nogit-"));
    expect(prChangedFiles(dir)).toEqual([]);
  });
});
