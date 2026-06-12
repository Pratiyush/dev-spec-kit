import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { inFlightTasks, isProtectedPath } from "../src/engine/protect.js";
import type { JournalEvent } from "../src/engine/state/journal.js";

/** GATE-PROTECT-01: while a task is in flight, its spec/bound tests/gate config are immutable
 *  to the agent — turning red green by editing the test is the one move the moat must forbid. */

const ev = (type: JournalEvent["type"], data: unknown): JournalEvent => ({ at: "t", type, data });

describe("in-flight protection (engine)", () => {
  const events: JournalEvent[] = [
    ev("task.created", { id: "T1", title: "t", boundChecks: ["test/foo.test.ts::x", "SessionTest#m"] }),
    ev("task.status", { id: "T1", status: "in_progress" }),
    // Both refs have gone GREEN — from here on, editing those files is post-green tampering.
    ev("check.run", { taskId: "T1", result: { ref: "test/foo.test.ts::x", passed: true, at: "t" } }),
    ev("check.run", { taskId: "T1", result: { ref: "SessionTest#m", passed: true, at: "t" } }),
    ev("task.created", { id: "T2", title: "t2", boundChecks: ["test/done.test.ts::y"] }),
    ev("check.run", { taskId: "T2", result: { ref: "test/done.test.ts::y", passed: true, at: "t" } }),
    ev("task.status", { id: "T2", status: "done" }),
  ];

  it("proven bound files of in-flight tasks are protected; done tasks release theirs", () => {
    const tasks = inFlightTasks(events);
    expect(tasks.map((t) => t.id)).toEqual(["T1"]);
    expect(isProtectedPath("/p/test/foo.test.ts", tasks, "/p")).toBe(true);
    expect(isProtectedPath("/p/src/main/java/SessionTest.java", tasks, "/p")).toBe(true); // maven ref by basename
    expect(isProtectedPath("/p/test/done.test.ts", tasks, "/p")).toBe(false);
    expect(isProtectedPath("/p/src/app.ts", tasks, "/p")).toBe(false);
  });

  it("pre-green refs stay editable (TDD writes the failing test first)", () => {
    const preGreen = inFlightTasks([
      ev("task.created", { id: "T3", title: "t", boundChecks: ["test/new.test.ts::z"] }),
      ev("task.status", { id: "T3", status: "in_progress" }),
    ]);
    expect(isProtectedPath("/p/test/new.test.ts", preGreen, "/p")).toBe(false);
  });

  it("specs and gate config are protected while ANY task is in flight", () => {
    const tasks = inFlightTasks(events);
    expect(isProtectedPath("/p/.rivet/specs/greeting.md", tasks, "/p")).toBe(true);
    expect(isProtectedPath("/p/.rivet/config.json", tasks, "/p")).toBe(true);
  });

  it("an unexpired unlock entry releases a path", () => {
    const tasks = inFlightTasks(events);
    const unlock = { paths: ["test/foo.test.ts"], until: new Date(Date.now() + 60_000).toISOString() };
    expect(isProtectedPath("/p/test/foo.test.ts", tasks, "/p", unlock)).toBe(false);
    const expired = { paths: ["test/foo.test.ts"], until: new Date(Date.now() - 1).toISOString() };
    expect(isProtectedPath("/p/test/foo.test.ts", tasks, "/p", expired)).toBe(true);
  });
});

describe("guard-protect hook (process-level)", () => {
  const hook = join(process.cwd(), "hooks", "guard-protect.mjs");
  const run = (payload: object): number | null =>
    spawnSync("node", [hook], { input: JSON.stringify(payload), stdio: ["pipe", "pipe", "pipe"] }).status;

  function project(): string {
    const dir = mkdtempSync(join(tmpdir(), "rivet-protect-"));
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    writeFileSync(
      join(dir, ".rivet", "journal.jsonl"),
      JSON.stringify({
        at: "t",
        type: "task.created",
        data: { id: "T1", title: "t", boundChecks: ["test/foo.test.ts::x"] },
      }) +
        "\n" +
        JSON.stringify({ at: "t", type: "task.status", data: { id: "T1", status: "in_progress" } }) +
        "\n" +
        JSON.stringify({
          at: "t",
          type: "check.run",
          data: { taskId: "T1", result: { ref: "test/foo.test.ts::x", passed: true, at: "t" } },
        }) +
        "\n",
    );
    return dir;
  }

  it("blocks editing a bound test file while its task is in flight (exit 2)", () => {
    const cwd = project();
    expect(run({ tool_name: "Edit", tool_input: { file_path: join(cwd, "test", "foo.test.ts") }, cwd })).toBe(
      2,
    );
  });

  it("allows unrelated files, allows after unlock, ignores non-edit tools", () => {
    const cwd = project();
    expect(run({ tool_name: "Edit", tool_input: { file_path: join(cwd, "src", "app.ts") }, cwd })).toBe(0);
    writeFileSync(
      join(cwd, ".rivet", "unlock.json"),
      JSON.stringify({ paths: ["test/foo.test.ts"], until: new Date(Date.now() + 60_000).toISOString() }),
    );
    expect(run({ tool_name: "Edit", tool_input: { file_path: join(cwd, "test", "foo.test.ts") }, cwd })).toBe(
      0,
    );
    expect(run({ tool_name: "Bash", tool_input: { command: "ls" }, cwd })).toBe(0);
  });
});
