import { describe, it, expect } from "vitest";
import { resolveCommand, execute } from "../src/engine/verify/runner.js";

describe("resolveCommand — stack mappings", () => {
  it("maven: ClassName#method selector", () => {
    const r = resolveCommand({ kind: "unit", ref: "SessionTest#idleTimeout" }, "java-maven");
    expect(r.cmd).toBe("mvn");
    expect(r.args).toEqual(["-B", "test", "-Dtest=SessionTest#idleTimeout"]);
  });

  it("vitest: file::name selector", () => {
    const r = resolveCommand({ kind: "unit", ref: "test/a.test.ts::does x" }, "node-vitest");
    expect(r.cmd).toBe("npx");
    expect(r.args).toEqual(["vitest", "run", "test/a.test.ts", "-t", "does x"]);
  });

  it("vitest: file-only ref omits -t", () => {
    const r = resolveCommand({ kind: "unit", ref: "test/a.test.ts" }, "node-vitest");
    expect(r.args).toEqual(["vitest", "run", "test/a.test.ts"]);
  });

  it("pytest: file::test selector passes through", () => {
    const r = resolveCommand({ kind: "unit", ref: "tests/test_a.py::test_x" }, "python-pytest");
    expect(r.cmd).toBe("python3");
    expect(r.args).toEqual(["-m", "pytest", "tests/test_a.py::test_x", "-q"]);
  });
});

describe("resolveCommand — config-supplied runners (code never changes, only input)", () => {
  it("substitutes {ref}/{file}/{name} placeholders in an override", () => {
    const r = resolveCommand({ kind: "unit", ref: "pkg/foo_test.go::TestBar" }, "go-test", {
      cmd: "go",
      args: ["test", "{file}", "-run={name}"],
    });
    expect(r.cmd).toBe("go");
    expect(r.args).toEqual(["test", "pkg/foo_test.go", "-run=TestBar"]);
  });

  it("drops {name}-bearing args when the ref has no name part", () => {
    const r = resolveCommand({ kind: "unit", ref: "pkg/foo_test.go" }, "go-test", {
      cmd: "go",
      args: ["test", "{file}", "-run={name}"],
    });
    expect(r.args).toEqual(["test", "pkg/foo_test.go"]);
  });

  it("throws a helpful error for an unknown stack with no override", () => {
    expect(() => resolveCommand({ kind: "unit", ref: "x" }, "go-test")).toThrowError(/verify\.runners/);
  });
});

describe("execute — real exit codes become proof", () => {
  it("exit 0 => passed", () => {
    const result = execute(
      { kind: "unit", ref: "synthetic-pass" },
      { cmd: "node", args: ["-e", "process.exit(0)"] },
      { cwd: process.cwd() },
    );
    expect(result.passed).toBe(true);
    expect(result.ref).toBe("synthetic-pass");
  });

  it("non-zero exit => failed (a model cannot claim this green)", () => {
    const result = execute(
      { kind: "unit", ref: "synthetic-fail" },
      { cmd: "node", args: ["-e", "process.exit(3)"] },
      { cwd: process.cwd() },
    );
    expect(result.passed).toBe(false);
  });
});
