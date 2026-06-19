import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { planWaves } from "../src/engine/wave.js";
import { waveStartAt } from "../src/cli/wave.js";

/** WAVE-01: parallel waves with the no-shared-files rule and the FETCH-FIRST stale-base guard —
 *  the exact disaster class from the algo-trading sessions, designed out. */

describe("planWaves — independence by bound-check files, capped wave size", () => {
  const t = (id: string, refs: string[], status = "pending") => ({ id, boundChecks: refs, status });

  it("tasks sharing a file serialize into later waves; done tasks are excluded", () => {
    const waves = planWaves(
      [
        t("A", ["test/a.test.ts::x"]),
        t("B", ["test/a.test.ts::y"]), // same file as A -> must not share a wave
        t("C", ["test/c.test.ts::z"]),
        t("D", ["Foo#m"]),
        t("E", ["test/e.test.ts::q"], "done"),
      ],
      6,
    );
    expect(waves[0]!.map((x) => x.id)).toEqual(["A", "C", "D"]);
    expect(waves[1]!.map((x) => x.id)).toEqual(["B"]);
    expect(waves.flat().map((x) => x.id)).not.toContain("E");
  });

  it("respects the wave-size cap (~6, the rate-limit lesson)", () => {
    const many = Array.from({ length: 8 }, (_, i) => t(`T${i}`, [`f${i}.ts::t`]));
    const waves = planWaves(many, 3);
    expect(waves[0]).toHaveLength(3);
    expect(waves.flat()).toHaveLength(8);
  });
});

describe("waveStartAt — fetch-first worktrees (process-level, real git)", () => {
  it("branches every worktree from origin's CURRENT tip, not the stale local clone", () => {
    const root = mkdtempSync(join(tmpdir(), "dev-spec-kit-wave-"));
    const sh = (cmd: string, cwd: string) => execSync(cmd, { cwd, stdio: "pipe" }).toString().trim();

    // bare origin + two clones; W goes stale while S advances origin.
    const bare = join(root, "origin.git");
    execSync(`git init -q --bare -b main ${bare}`); // bare HEAD must name the branch we push
    const seed = join(root, "seed");
    execSync(`git clone -q ${bare} ${seed}`);
    sh("git config user.name T && git config user.email t@t", seed);
    sh("echo one > f.txt && git add -A && git commit -qm c1 && git push -q origin HEAD:main", seed);

    const work = join(root, "work");
    execSync(`git clone -q ${bare} ${work}`);
    sh("git config user.name T && git config user.email t@t", work);

    sh("echo two >> f.txt && git add -A && git commit -qm c2 && git push -q origin HEAD:main", seed);
    const originTip = sh("git rev-parse HEAD", seed);
    expect(sh("git rev-parse HEAD", work)).not.toBe(originTip); // work IS stale

    const report = waveStartAt(work, ["T1"]);
    expect(report[0]!.path).toContain(".worktrees/T1");
    expect(existsSync(report[0]!.path)).toBe(true);
    const wtHead = sh("git rev-parse HEAD", report[0]!.path);
    expect(wtHead).toBe(originTip); // FETCH-FIRST: based on origin's tip, stale local be damned
    expect(sh("git branch --show-current", report[0]!.path)).toBe("rivet/T1");
    // journals union-merge so parallel branches reconcile instead of conflicting
    expect(readFileSync(join(work, ".gitattributes"), "utf8")).toContain("merge=union");
  });
});
