import { afterEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createCockpitServer } from "../src/cli/web.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";

/**
 * REQUIREMENT_COCKPIT-05 — the ONE served path: reads are static everywhere, but SAVING config
 * needs a server, and that server enforces the same truths as the CLI: zod validation with
 * field-level errors, and GATE-PROTECT-01 — the moat must not be editable by the thing it gates.
 */

function project(opts: { inFlight?: boolean; unlock?: boolean } = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-srv-"));
  execSync(`git init -q -b main && git config user.email t@t && git config user.name T`, { cwd: dir });
  writeFileSync(join(dir, "app.ts"), "export const one = 1;\n");
  execSync("git add -A && git commit -qm init", { cwd: dir });
  mkdirSync(join(dir, ".dev-spec-kit"), { recursive: true });
  writeFileSync(
    join(dir, ".dev-spec-kit", "config.json"),
    JSON.stringify({ version: 1, project: { name: "srv" } }),
  );
  if (opts.inFlight) {
    const store = new TaskStore(new Journal(join(dir, ".dev-spec-kit", "journal.jsonl")));
    store.create("T1", "in flight", ["c1"]);
    store.setStatus("T1", "in_progress");
  }
  if (opts.unlock) {
    writeFileSync(
      join(dir, ".dev-spec-kit", "unlock.json"),
      JSON.stringify({
        paths: [".dev-spec-kit/config.json"],
        until: new Date(Date.now() + 600_000).toISOString(),
      }),
    );
  }
  return dir;
}

let server: Server | undefined;
afterEach(() => {
  server?.close();
  server = undefined;
});

async function serve(dir: string): Promise<string> {
  server = createCockpitServer(dir);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe("REQUIREMENT_COCKPIT-05 — the config save server", () => {
  it("GET /api/state returns the RIVET object in server mode", async () => {
    const url = await serve(project());
    const res = await fetch(`${url}/api/state`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { meta: { serverMode: boolean }; config: { manifest: unknown[] } };
    expect(data.meta.serverMode).toBe(true);
    expect(data.config.manifest.length).toBeGreaterThan(60);
  });

  it("a valid POST saves config.json and journals governance", async () => {
    const dir = project();
    const url = await serve(dir);
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { name: "renamed" }, spec: { criteriaFormat: "mixed" } }),
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { ok: boolean }).ok).toBe(true);
    const cfg = JSON.parse(readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8")) as {
      project: { name: string };
      spec: { criteriaFormat: string };
    };
    expect(cfg.project.name).toBe("renamed");
    expect(cfg.spec.criteriaFormat).toBe("mixed");
    const events = new Journal(join(dir, ".dev-spec-kit", "journal.jsonl")).read();
    const gov = events.find(
      (e) => e.type === "governance" && (e.data as { kind?: string }).kind === "config-save",
    );
    expect(gov, "config saves are governance events").toBeTruthy();
  });

  it("an invalid POST returns field errors and never writes", async () => {
    const dir = project();
    const before = readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8");
    const url = await serve(dir);
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec: { criteriaFormat: "haiku" } }),
    });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { errors: Array<{ path: string; message: string }> };
    expect(body.errors[0]!.path).toBe("spec.criteriaFormat");
    expect(body.errors[0]!.message.length).toBeGreaterThan(3);
    expect(readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8")).toBe(before);
  });

  it("in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint", async () => {
    const dir = project({ inFlight: true });
    const before = readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8");
    const url = await serve(dir);
    const res = await fetch(`${url}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { name: "sneaky" } }),
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { blocked: string; reason: string; unlockHint: string };
    expect(body.blocked).toBe("GATE-PROTECT-01");
    expect(body.reason).toContain("T1");
    expect(body.unlockHint).toContain("dev-spec-kit unlock");
    expect(readFileSync(join(dir, ".dev-spec-kit", "config.json"), "utf8")).toBe(before);

    // ...and a journaled human unlock window opens the gate (the escape hatch works end-to-end)
    const dir2 = project({ inFlight: true, unlock: true });
    const url2 = await serve(dir2);
    const ok = await fetch(`${url2}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: { name: "allowed" } }),
    });
    expect(ok.status).toBe(200);
  });
});
