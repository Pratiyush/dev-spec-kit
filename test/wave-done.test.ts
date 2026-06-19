import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { waveStartAt, waveDoneAt } from "../src/cli/wave.js";

/** WAVE-02: cleanup is provenance-checked and merge-gated — destroy only what we created, and only
 *  after origin has the work (or with an explicit --force discard). */

function setup(): { work: string; sh: (c: string, d: string) => string } {
  const root = mkdtempSync(join(tmpdir(), "dev-spec-kit-wd-"));
  const sh = (cmd: string, cwd: string) => execSync(cmd, { cwd, stdio: "pipe" }).toString().trim();
  const bare = join(root, "origin.git");
  execSync(`git init -q --bare -b main ${bare}`);
  const seed = join(root, "seed");
  execSync(`git clone -q ${bare} ${seed}`);
  sh("git config user.name T && git config user.email t@t", seed);
  sh("echo one > f.txt && git add -A && git commit -qm c1 && git push -q origin HEAD:main", seed);
  const work = join(root, "work");
  execSync(`git clone -q ${bare} ${work}`);
  sh("git config user.name T && git config user.email t@t", work);
  return { work, sh };
}

describe("waveDoneAt", () => {
  it("refuses unmerged work without force; cleans up after the branch reaches origin", () => {
    const { work, sh } = setup();
    const [wt] = waveStartAt(work, ["T1"]);
    sh("git config user.name T && git config user.email t@t", wt!.path);
    sh("echo task > t1.txt && git add -A && git commit -qm t1", wt!.path);

    expect(() => waveDoneAt(work, "T1", {})).toThrowError(/merged|force/i);

    sh("git push -q origin dev-spec-kit/T1:main", wt!.path); // the work lands on origin
    sh("git fetch -q origin", work);
    const report = waveDoneAt(work, "T1", {});
    expect(report.removed).toBe(true);
    expect(existsSync(wt!.path)).toBe(false);
    expect(sh("git branch --list dev-spec-kit/T1", work)).toBe(""); // branch gone too
  });

  it("force discards unmerged work; provenance check refuses foreign paths", () => {
    const { work, sh } = setup();
    const [wt] = waveStartAt(work, ["T2"]);
    sh("git config user.name T && git config user.email t@t", wt!.path);
    sh("echo junk > j.txt && git add -A && git commit -qm junk", wt!.path);
    const report = waveDoneAt(work, "T2", { force: true });
    expect(report.removed).toBe(true);
    expect(existsSync(wt!.path)).toBe(false);

    expect(() => waveDoneAt(work, "../evil", {})).toThrowError(/provenance|\.worktrees/i);
  });
});
