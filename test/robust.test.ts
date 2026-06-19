import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, InputError } from "../src/cli/config-io.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { renderLog } from "../src/cli/log.js";
import { execute, RunnerUnavailableError } from "../src/engine/verify/runner.js";

/** FIX-ROBUST-01: user-editable inputs never crash; infra errors are not proofs. */

function projectWithConfig(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-robust-"));
  mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
  writeFileSync(join(dir, ".dev-spec-kit", "config.json"), content);
  return dir;
}

describe("config loading", () => {
  it("malformed JSON throws a clean InputError naming the file, never a SyntaxError", () => {
    const dir = projectWithConfig('{ "version": 1, }'); // trailing comma
    expect(() => loadConfig(dir)).toThrowError(InputError);
    expect(() => loadConfig(dir)).toThrowError(/config\.json/);
  });

  it("schema-invalid config throws InputError with the offending path", () => {
    const dir = projectWithConfig(JSON.stringify({ verify: { flaky: "nope" } }));
    expect(() => loadConfig(dir)).toThrowError(InputError);
    expect(() => loadConfig(dir)).toThrowError(/verify\.flaky|flaky/);
  });

  it("missing config yields defaults", () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-robust-none-"));
    expect(loadConfig(dir).verify.blockDoneOnFail).toBe(true);
  });
});

describe("journal tolerance", () => {
  it("a structurally-valid event missing `data` does not brick log or the task fold", () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-robust-j-"));
    mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
    const path = join(dir, ".dev-spec-kit", "journal.jsonl");
    writeFileSync(
      path,
      `{"at":"2026-06-11T10:00:00Z","type":"cli.run"}\n` + // no data
        `{"at":"2026-06-11T10:01:00Z","type":"task.created","data":{"id":"T1","title":"t","boundChecks":[]}}\n`,
    );
    const journal = new Journal(path);
    const events = journal.read();
    expect(events).toHaveLength(2);
    expect(() => renderLog(events)).not.toThrow();
    expect(new TaskStore(journal).get("T1")?.title).toBe("t");
  });
});

describe("runner availability", () => {
  it("a missing runner binary throws RunnerUnavailableError — it is NOT recorded as a red proof", () => {
    expect(() =>
      execute(
        { kind: "unit", ref: "x" },
        { cmd: "dev-spec-kit-definitely-not-a-binary-xyz", args: [] },
        { cwd: process.cwd() },
      ),
    ).toThrowError(RunnerUnavailableError);
  });

  it("a TIMEOUT is a failing proof (a hung test is a failing test), not a tooling error", () => {
    const result = execute(
      { kind: "unit", ref: "hang" },
      { cmd: "node", args: ["-e", "setTimeout(()=>{}, 60000)"] },
      { cwd: process.cwd(), timeoutMs: 200 },
    );
    expect(result.passed).toBe(false);
  });
});
