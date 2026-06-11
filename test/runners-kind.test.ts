import { describe, it, expect } from "vitest";
import { kindForRef } from "../src/engine/spec/ears.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { pickRunner } from "../src/engine/verify/runner.js";
import { withApp } from "../src/engine/verify/applife.js";
import { defaultConfig } from "../src/config/schema.js";

/** RUNNERS-01: a binding's KIND changes how it runs — api/e2e get the app spun up, visual/parity
 *  get kind-level runner templates (pure config), and the kind is recorded on the proof. */

describe("kindForRef — the spec knows each ref's kind", () => {
  const reqs = parseSpec(
    `## Requirement R-1 — t\nWHEN x THEN the system SHALL y.\n@check kind=e2e ref=GreetE2E#roundtrip\n\nWHEN p THEN the system SHALL q.\n@check kind=unit ref=A#a\n`,
  );
  it("resolves kinds and falls back to undefined for unknown refs", () => {
    expect(kindForRef(reqs, "GreetE2E#roundtrip")).toBe("e2e");
    expect(kindForRef(reqs, "A#a")).toBe("unit");
    expect(kindForRef(reqs, "nope")).toBeUndefined();
  });
});

describe("pickRunner — precedence: kind template > stack template > builtin", () => {
  it("kind runner wins over stack runner; stack over builtin; builtin otherwise", () => {
    const config = defaultConfig();
    config.verify.kindRunners["visual"] = { cmd: "node", args: ["snap.js", "{ref}"] };
    config.verify.runners["node-vitest"] = { cmd: "npx", args: ["vitest", "run", "{file}"] };

    const byKind = pickRunner(config, "visual", "node-vitest");
    expect(byKind.source).toBe("kind");
    expect(byKind.override?.cmd).toBe("node");

    const byStack = pickRunner(config, "unit", "node-vitest");
    expect(byStack.source).toBe("stack");

    const builtin = pickRunner(config, "unit", "python-pytest");
    expect(builtin.source).toBe("builtin");
    expect(builtin.override).toBeUndefined();
  });

  it("schema ships kindRunners + app config defaults", () => {
    const c = defaultConfig();
    expect(c.verify.kindRunners).toEqual({});
    expect(c.verify.app).toEqual({ start: [], readyUrl: null, readyTimeoutMs: 30000 });
  });
});

describe("withApp — spin up, wait ready, run, ALWAYS tear down", () => {
  const port = 30000 + (process.pid % 20000);
  const url = `http://127.0.0.1:${port}/`;

  it("starts the app, waits for readiness, runs the fn, then kills the app", async () => {
    const status = await withApp(
      {
        start: ["node", "-e", `require('http').createServer((q,s)=>s.end('ok')).listen(${port})`],
        readyUrl: url,
        readyTimeoutMs: 8000,
      },
      async () => (await fetch(url)).status,
    );
    expect(status).toBe(200);
    await new Promise((r) => setTimeout(r, 500));
    await expect(fetch(url)).rejects.toThrow(); // server is DOWN after the run
  });

  it("tears down even when the fn throws", async () => {
    await expect(
      withApp(
        {
          start: ["node", "-e", `require('http').createServer((q,s)=>s.end('ok')).listen(${port + 1})`],
          readyUrl: `http://127.0.0.1:${port + 1}/`,
          readyTimeoutMs: 8000,
        },
        () => {
          throw new Error("check failed");
        },
      ),
    ).rejects.toThrow("check failed");
    await new Promise((r) => setTimeout(r, 500));
    await expect(fetch(`http://127.0.0.1:${port + 1}/`)).rejects.toThrow();
  });

  it("no start command = plain passthrough", async () => {
    expect(await withApp({ start: [], readyUrl: null, readyTimeoutMs: 1000 }, () => 42)).toBe(42);
  });
});
