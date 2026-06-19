import { afterEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createCockpitServer } from "../src/cli/web.js";
import { emitCockpit } from "../src/cli/cockpit.js";
import { sidecarJs, type RivetCockpitData } from "../src/cli/cockpit-data.js";
import { manifestFromSchema } from "../src/engine/config-manifest.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { z } from "zod";

/**
 * FIX-COCKPIT-SEC-01 — the adversarial review's confirmed findings, each pinned. The cockpit's
 * one served path (`dev-spec-kit web`) is now a security surface: it must bind loopback-only, refuse
 * cross-origin writes, cap the body, persist only schema-clean config, and never let an unrelated
 * unlock open the config gate.
 */

function project(opts: { inFlight?: boolean; unlockPath?: string } = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-hard-"));
  execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
  writeFileSync(join(dir, "app.ts"), "export const one = 1;\n");
  execSync("git add -A && git commit -qm init", { cwd: dir });
  mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
  writeFileSync(
    join(dir, ".dev-spec-kit", "config.json"),
    JSON.stringify({ version: 1, project: { name: "h" } }),
  );
  if (opts.inFlight) {
    const s = new TaskStore(new Journal(join(dir, ".dev-spec-kit", "journal.jsonl")));
    s.create("T1", "in flight", ["c1"]);
    s.setStatus("T1", "in_progress");
  }
  if (opts.unlockPath) {
    writeFileSync(
      join(dir, ".dev-spec-kit", "unlock.json"),
      JSON.stringify({ paths: [opts.unlockPath], until: new Date(Date.now() + 600_000).toISOString() }),
    );
  }
  return dir;
}

let server: Server | undefined;
afterEach(() => {
  server?.close();
  server = undefined;
});
async function serve(dir: string): Promise<{ url: string; address: string }> {
  server = createCockpitServer(dir);
  await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
  const a = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${a.port}`, address: a.address };
}

describe("FIX-COCKPIT-SEC-01 — server is a loopback-only, CSRF-safe surface", () => {
  it("binds loopback only (finding #1)", async () => {
    const { address } = await serve(project());
    expect(address).toBe("127.0.0.1");
  });

  it("rejects a cross-origin POST — CSRF / DNS-rebinding (finding #6)", async () => {
    const { url } = await serve(project());
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://evil.example" },
      body: JSON.stringify({ project: { name: "x" } }),
    });
    expect(res.status).toBe(403);
    const ok = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: url },
      body: JSON.stringify({ project: { name: "ok" } }),
    });
    expect(ok.status).toBe(200);
  });

  it("caps the request body (finding #5)", async () => {
    const { url } = await serve(project());
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { name: "x".repeat(400_000) } }),
    });
    expect(res.status).toBe(413);
  });

  it("persists only schema-clean config — strips unknown keys (finding #3)", async () => {
    const dir = project();
    const { url } = await serve(dir);
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { name: "clean" }, evilTopLevel: 1 }),
    });
    expect(res.status).toBe(200);
    const written = JSON.parse(readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8")) as Record<
      string,
      unknown
    >;
    expect(written.project).toMatchObject({ name: "clean" });
    expect(written.evilTopLevel).toBeUndefined();
  });

  it("an unrelated unlock does NOT open the config gate (finding #2)", async () => {
    // a tsconfig.json unlock must NOT satisfy the .dev-spec-kit/config.json gate
    const dir = project({ inFlight: true, unlockPath: "tsconfig.json" });
    const { url } = await serve(dir);
    const blocked = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: url },
      body: JSON.stringify({ project: { name: "sneaky" } }),
    });
    expect(blocked.status).toBe(403);
    expect(((await blocked.json()) as { blocked?: string }).blocked).toBe("GATE-PROTECT-01");
    // ...the RIGHT unlock still works
    const dir2 = project({ inFlight: true, unlockPath: ".dev-spec-kit/config.json" });
    const { url: url2 } = await serve(dir2);
    const ok = await fetch(`${url2}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: url2 },
      body: JSON.stringify({ project: { name: "allowed" } }),
    });
    expect(ok.status).toBe(200);
  });
});

describe("FIX-COCKPIT-SEC-01 — robustness findings", () => {
  it("emitCockpit self-heals a deleted shell asset even at the same version (finding #10)", () => {
    const dir = project();
    emitCockpit(dir);
    rmSync(join(dir, ".dev-spec-kit", "cockpit", "rivet.core.js"));
    const res = emitCockpit(dir); // same SHELL_VERSION, but a file is missing
    expect(res.wroteShell).toBe(true);
    expect(
      readFileSync(join(dir, ".dev-spec-kit", "cockpit", "rivet.core.js"), "utf8").length,
    ).toBeGreaterThan(0);
  });

  it("the sidecar escapes JS line separators U+2028/U+2029 (finding #11)", () => {
    const data = {
      dashboard: { files: [{ name: "x.md", content: "a\u2028b\u2029c" }] },
    } as unknown as RivetCockpitData;
    const js = sidecarJs(data);
    expect(js).not.toMatch(/[\u2028\u2029]/);
    expect(js).toContain("\\u2028");
    expect(js).toContain("\\u2029");
  });

  it("the manifest threads nullable through enum knobs (finding #12)", () => {
    const schema = z.object({
      sec: z.object({ mode: z.enum(["a", "b"]).nullable().default(null) }).default({}),
    });
    const m = manifestFromSchema(
      schema,
      { sec: { mode: null } },
      { sec: { mode: null } },
      { "sec.mode": "a nullable enum" },
    );
    expect(m[0]!.type).toBe("enum");
    expect(m[0]!.nullable).toBe(true);
  });
});

describe("FIX-COCKPIT-SEC-01 — done-with-warnings refreshes documents (finding #7)", () => {
  const here = process.cwd();
  afterEach(() => process.chdir(here));
  it("force-done under blockDoneOnFail=false still refreshes the sidecar", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-dwf-"));
    execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
    writeFileSync(join(dir, "app.ts"), "export const a = 1;\n");
    execSync("git add -A && git commit -qm init", { cwd: dir });
    mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
    writeFileSync(
      join(dir, ".dev-spec-kit", "config.json"),
      JSON.stringify({ version: 1, verify: { blockDoneOnFail: false } }),
    );
    const { taskCreate, taskDone } = await import("../src/cli/tasks.js");
    process.chdir(dir);
    taskCreate("T1", "warny", ["c1"]); // bound check never runs → force-done path
    taskDone("T1");
    const { existsSync } = await import("node:fs");
    expect(existsSync(join(dir, ".dev-spec-kit", "cockpit", "rivet.data.js"))).toBe(true);
  });
});
