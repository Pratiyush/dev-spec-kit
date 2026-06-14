import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Server } from "node:http";
import { createCockpitServer, webCmd } from "../src/cli/web.js";
import { emitCockpit } from "../src/cli/cockpit.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { Journal } from "../src/engine/state/journal.js";
import { tmpProject, inDir } from "./helpers/cli-harness.js";

async function serve(dir: string): Promise<{ base: string; close: () => Promise<void> }> {
  const server = createCockpitServer(dir);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  return {
    base: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}

describe("rivet web — the cockpit server", () => {
  it("GET /api/state returns the RIVET object in server mode", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/state`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.meta.serverMode).toBe(true);
    } finally {
      await close();
    }
  });

  it("POST /api/config persists a schema-clean, deep-merged config and journals it", async () => {
    const dir = tmpProject({ ".rivet/config.json": JSON.stringify({ project: { name: "keep" } }) });
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ build: { retryLimit: 5 } }),
      });
      expect(res.status).toBe(200);
      const saved = JSON.parse(readFileSync(join(dir, ".rivet", "config.json"), "utf8"));
      expect(saved.build.retryLimit).toBe(5);
      expect(saved.project.name).toBe("keep"); // deep-merged
      expect(readFileSync(join(dir, ".rivet", "journal.jsonl"), "utf8")).toContain("config-save");
    } finally {
      await close();
    }
  });

  it("POST /api/config rejects schema-invalid input with 422 + issue paths", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ build: { retryLimit: -3 } }),
      });
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.errors[0].path).toContain("build");
    } finally {
      await close();
    }
  });

  it("POST /api/config rejects non-JSON with 400", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, { method: "POST", body: "not json{" });
      expect(res.status).toBe(400);
    } finally {
      await close();
    }
  });

  it("POST /api/config blocks a cross-origin save (CSRF) with 403", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://evil.example" },
        body: JSON.stringify({ build: { retryLimit: 2 } }),
      });
      expect(res.status).toBe(403);
      expect((await res.json()).blocked).toBe("CROSS-ORIGIN");
    } finally {
      await close();
    }
  });

  it("POST /api/config is GATE-PROTECT-01-refused while a task is in flight (no unlock)", async () => {
    const dir = tmpProject();
    const store = new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));
    store.create("T1", "t", ["c1"]);
    store.setStatus("T1", "in_progress");
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ build: { retryLimit: 2 } }),
      });
      expect(res.status).toBe(403);
      expect((await res.json()).blocked).toBe("GATE-PROTECT-01");
    } finally {
      await close();
    }
  });

  it("an active unlock covering the config path opens the gate", async () => {
    const dir = tmpProject();
    const store = new TaskStore(new Journal(join(dir, ".rivet", "journal.jsonl")));
    store.create("T1", "t", ["c1"]);
    store.setStatus("T1", "in_progress");
    writeFileSync(
      join(dir, ".rivet", "unlock.json"),
      JSON.stringify({ paths: [".rivet/config.json"], until: "2999-01-01T00:00:00Z" }),
    );
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ build: { retryLimit: 2 } }),
      });
      expect(res.status).toBe(200);
    } finally {
      await close();
    }
  });

  it("rejects an over-sized POST body with 413", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(300 * 1024),
      });
      expect(res.status).toBe(413);
    } finally {
      await close();
    }
  });

  it("GET /rivet.data.js serves the fresh sidecar", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/rivet.data.js`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("javascript");
      expect(await res.text()).toContain("RIVET");
    } finally {
      await close();
    }
  });

  it("serves the static cockpit shell after emission, and 404s the unknown", async () => {
    const dir = tmpProject();
    inDir(dir, () => emitCockpit(dir, { serverMode: true }));
    const { base, close } = await serve(dir);
    try {
      expect((await fetch(`${base}/`)).status).toBe(200);
      expect((await fetch(`${base}/nope.weird`)).status).toBe(404);
    } finally {
      await close();
    }
  });

  it("serves a graph asset under the outDir but 404s a sibling-dir traversal", async () => {
    const dir = tmpProject();
    mkdirSync(join(dir, "graphify-out"), { recursive: true });
    writeFileSync(join(dir, "graphify-out", "graph.html"), "<html>graph</html>");
    const { base, close } = await serve(dir);
    try {
      const ok = await fetch(`${base}/graphify-out/graph.html`);
      expect(ok.status).toBe(200);
      expect(await ok.text()).toContain("graph");
    } finally {
      await close();
    }
  });
});

describe("webCmd — emits the cockpit and starts listening", () => {
  it("returns a listening server (closeable)", async () => {
    const dir = tmpProject();
    const server: Server = inDir(dir, () => webCmd({ port: "0" }));
    try {
      await new Promise<void>((r) => (server.listening ? r() : server.on("listening", () => r())));
      expect(server.listening).toBe(true);
      expect(existsSync(join(dir, ".rivet", "cockpit"))).toBe(true);
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });
});

describe("rivet web — defensive branches", () => {
  it("a malformed config.json degrades to defaults for the outDir lookup (no crash)", async () => {
    const dir = tmpProject({ ".rivet/config.json": "{ not json" });
    const { base, close } = await serve(dir);
    try {
      // outDir resolution goes through safeReadConfig's catch → default 'graphify-out'
      expect((await fetch(`${base}/graphify-out/missing.html`)).status).toBe(404);
    } finally {
      await close();
    }
  });

  it("rejects a malformed Origin header as cross-origin", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/api/config`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://[bad" },
        body: "{}",
      });
      expect(res.status).toBe(403);
    } finally {
      await close();
    }
  });

  it("404s a sibling-dir traversal that escapes the outDir", async () => {
    const dir = tmpProject();
    const { base, close } = await serve(dir);
    try {
      const res = await fetch(`${base}/graphify-out/../secret`);
      expect(res.status).toBe(404);
    } finally {
      await close();
    }
  });
});
