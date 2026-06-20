import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { buildCockpitData, sidecarJs } from "../src/cli/cockpit-data.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject } from "./helpers/cli-harness.js";

const journal = (dir: string) => new Journal(join(dir, ".dev-spec-kit", "journal.jsonl"));

describe("buildCockpitData — the cockpit sidecar object", () => {
  it("renders an activity line for every event type, plus approvals + governance sections", () => {
    const dir = tmpProject();
    const j = journal(dir);
    j.append("cli.run", { command: "verify", args: ["--stamp"] });
    j.append("verify.run", { passed: true, steps: [{}, {}] });
    j.append("task.created", { id: "T1", title: "do it" });
    j.append("task.bindings", { id: "T1", boundChecks: ["c1"] });
    j.append("task.status", { id: "T1", status: "done" });
    j.append("approval.recorded", { approver: "Pat", taskIds: ["T1"], sha: "abcdef1234567890" });
    j.append("governance", { kind: "unlock", paths: ["spec.md"], until: "2999-01-01" });

    const data = buildCockpitData(dir);
    const acts = data.dashboard.activity.map((a) => a.text).join(" | ");
    expect(acts).toContain("verify --stamp");
    expect(acts).toContain("verify 2 step(s)");
    expect(acts).toContain("bindings synced");
    expect(acts).toContain("approve T1");
    expect(acts).toContain("unlock");
    expect(data.dashboard.approvals[0]!.approver).toBe("Pat");
    expect(data.dashboard.approvals[0]!.commit).toBe("abcdef12");
    expect(data.dashboard.governance[0]!.kind).toBe("unlock");
    expect(data.dashboard.governance[0]!.detail).toContain("paths=spec.md");
  });

  it("marks a proof STALE in the task view when the code tree has moved", () => {
    const dir = tmpProject({ "src/x.ts": "export const x = 1;\n" });
    for (const args of [
      ["init"],
      ["add", "-A"],
      ["-c", "user.email=t@t.co", "-c", "user.name=t", "commit", "-m", "x"],
    ])
      spawnSync("git", args, { cwd: dir, stdio: "ignore" });
    const store = new TaskStore(journal(dir));
    store.create("T1", "t", ["c1"]);
    store.recordCheck("T1", { ref: "c1", passed: true, at: "x", sha: "S", tree: "OLD_TREE_HASH" });
    const data = buildCockpitData(dir);
    expect(data.dashboard.tasks[0]!.results["c1"]!.stale).toBe(true);
  });
});

describe("sidecarJs — safe inlining", () => {
  it("escapes <, U+2028 and U+2029 so no value can break the script", () => {
    const js = sidecarJs({
      meta: {
        project: "</script>",
        tagline: "",
        configPath: "",
        generatedAt: "",
        serverMode: false,
        refreshSeconds: 15,
        inFlightTasks: [],
      },
      nav: [],
      dashboard: {
        completion: { done: 0, total: 0 },
        validates: { green: 0, red: 0, stale: 0, unproven: 0 },
        drift: 0,
        graphHtml: null,
        tasks: [],
        requirements: [],
        approvals: [],
        governance: [],
        activity: [],
        files: [],
      },
      config: { sections: [], manifest: [] },
    });
    expect(js).toContain("\\u003c/script>");
    expect(js).toContain("window.RIVET =");
  });
});
