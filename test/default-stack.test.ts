import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseConfig } from "../src/config/schema.js";
import { resolveStack } from "../src/engine/verify/runner.js";

/**
 * FEAT-STACK-01 — `--stack` becomes optional. Resolution: flag → verify.defaultStack → inferred
 * from project.platforms (with a 🧭 notice at the CLI) → a clear error naming all three options.
 */

function projectWith(deps: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "rivet-stack-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x", devDependencies: deps }));
  return dir;
}

describe("FEAT-STACK-01 — stack resolution chain", () => {
  it("verify.defaultStack is optional config", () => {
    expect(parseConfig({}).verify.defaultStack).toBeUndefined();
    expect(parseConfig({ verify: { defaultStack: "node-vitest" } }).verify.defaultStack).toBe("node-vitest");
  });

  it("an explicit flag always wins", () => {
    const config = parseConfig({ verify: { defaultStack: "python-pytest" } });
    const r = resolveStack("java-maven", config, "/nowhere");
    expect(r).toMatchObject({ stack: "java-maven", source: "flag" });
  });

  it("verify.defaultStack wins over platform inference", () => {
    const config = parseConfig({
      verify: { defaultStack: "python-pytest" },
      project: { platforms: ["typescript"] },
    });
    expect(resolveStack(undefined, config, "/nowhere")).toMatchObject({
      stack: "python-pytest",
      source: "config",
    });
  });

  it("infers node-vitest for node-ish platforms when vitest is a dependency", () => {
    const dir = projectWith({ vitest: "^1.0.0" });
    const config = parseConfig({ project: { platforms: ["typescript"] } });
    const r = resolveStack(undefined, config, dir);
    expect(r.stack).toBe("node-vitest");
    expect(r.source).toBe("inferred");
  });

  it("infers node-jest when jest is the test dependency", () => {
    const dir = projectWith({ jest: "^29.0.0" });
    const config = parseConfig({ project: { platforms: ["node"] } });
    expect(resolveStack(undefined, config, dir).stack).toBe("node-jest");
  });

  it("infers python-pytest and java-maven from their platforms", () => {
    expect(
      resolveStack(undefined, parseConfig({ project: { platforms: ["python"] } }), "/nowhere").stack,
    ).toBe("python-pytest");
    expect(
      resolveStack(undefined, parseConfig({ project: { platforms: ["spring"] } }), "/nowhere").stack,
    ).toBe("java-maven");
  });

  it("fails with a message naming all three options when nothing resolves", () => {
    expect(() => resolveStack(undefined, parseConfig({}), "/nowhere")).toThrowError(
      /--stack.*verify\.defaultStack.*project\.platforms/s,
    );
  });
});
