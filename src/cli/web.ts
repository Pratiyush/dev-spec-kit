import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { ZodError } from "zod";
import pc from "picocolors";
import { parseConfig } from "../config/schema.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { buildCockpitData, sidecarJs } from "./cockpit-data.js";
import { emitCockpit, SHELL_FILES } from "./cockpit.js";
import { label } from "./emoji.js";

/**
 * REQUIREMENT_COCKPIT-05 — `dev-spec-kit web`: the cockpit's ONE served path. Reads stay static
 * (the same shell files; the sidecar is regenerated per request so every reload is fresh);
 * the server exists for the WRITE path only:
 *   GET  /api/state   → the RIVET object (serverMode: true)
 *   POST /api/config  → zod-validated save to .dev-spec-kit/config.json, journaled as governance —
 *                       REFUSED with GATE-PROTECT-01 while tasks are in flight and no human
 *                       unlock window is open. The moat is not editable by the thing it gates.
 */

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const CONFIG_REL = ".dev-spec-kit/config.json";

interface GateRefusal {
  blocked: "GATE-PROTECT-01";
  reason: string;
  unlockHint: string;
}

/** GATE-PROTECT-01 for the web save: in-flight tasks lock the config unless a human unlock is open. */
function gateRefusal(cwd: string): GateRefusal | null {
  const tasks = [...new TaskStore(new Journal(join(cwd, ".dev-spec-kit", "journal.jsonl"))).all().values()];
  const inFlight = tasks.filter((t) => t.status === "in_progress").map((t) => t.id);
  if (inFlight.length === 0) return null;
  const unlockPath = join(cwd, ".dev-spec-kit", "unlock.json");
  if (existsSync(unlockPath)) {
    try {
      const u = JSON.parse(readFileSync(unlockPath, "utf8")) as { paths?: string[]; until?: string };
      const active = u.until !== undefined && Date.parse(u.until) > Date.now();
      // finding #2: match the config path EXACTLY (or a trailing path-segment of it) — an unlock
      // for some other config.json (tsconfig.json, jest.config.json) must NOT open this gate.
      const covers = (u.paths ?? []).some((p) => p === CONFIG_REL || CONFIG_REL.endsWith("/" + p));
      if (active && covers) return null;
    } catch {
      /* unreadable unlock = no unlock */
    }
  }
  return {
    blocked: "GATE-PROTECT-01",
    reason: `config is locked while ${inFlight.join(", ")} ${inFlight.length > 1 ? "are" : "is"} in flight`,
    unlockHint: `dev-spec-kit unlock ${CONFIG_REL} --minutes 30`,
  };
}

function safeReadConfig(cwd: string): Record<string, unknown> {
  const p = join(cwd, CONFIG_REL);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    const prev = out[k];
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      out[k] = deepMerge(prev as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": MIME[".json"] });
  res.end(JSON.stringify(body));
}

const MAX_BODY = 256 * 1024;

class BodyTooLarge extends Error {}

/** finding #5: cap the body — an unbounded POST would OOM a process reachable on localhost. */
async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += (chunk as Buffer).length;
    if (total > MAX_BODY) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * finding #6: the mutating endpoint must not be drivable cross-origin (CSRF / DNS-rebinding).
 * A same-origin cockpit fetch sends no Origin (or one matching Host); a foreign page's simple
 * POST carries a foreign Origin. Reject anything whose Origin host ≠ the request Host.
 */
function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true; // non-CORS clients (curl, the cockpit's own fetch) send none
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export function createCockpitServer(cwd: string): Server {
  return createServer((req, res) => {
    void handle(cwd, req, res).catch((e: unknown) => {
      if (e instanceof BodyTooLarge) {
        json(res, 413, { errors: [{ path: "", message: "request body too large" }] });
        return;
      }
      json(res, 500, { error: e instanceof Error ? e.message : String(e) });
    });
  });
}

async function handle(cwd: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = (req.url ?? "/").split("?")[0]!;

  if (req.method === "GET" && url === "/api/state") {
    json(res, 200, buildCockpitData(cwd, { serverMode: true }));
    return;
  }

  if (req.method === "POST" && url === "/api/config") {
    if (!sameOrigin(req)) {
      json(res, 403, { blocked: "CROSS-ORIGIN", reason: "config saves must come from the local cockpit" });
      return;
    }
    const refusal = gateRefusal(cwd);
    if (refusal) {
      json(res, 403, refusal);
      return;
    }
    const raw = await readBody(req); // BodyTooLarge propagates to the 413 handler
    let posted: Record<string, unknown>;
    try {
      posted = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      json(res, 400, { errors: [{ path: "", message: "body is not valid JSON" }] });
      return;
    }
    const configPath = join(cwd, CONFIG_REL);
    const existing = existsSync(configPath)
      ? (JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>)
      : {};
    const merged = deepMerge(existing, posted);
    let clean: unknown;
    try {
      clean = parseConfig(merged); // finding #3: persist the SCHEMA-CLEAN result, not raw merged
    } catch (e) {
      if (e instanceof ZodError) {
        json(res, 422, { errors: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
        return;
      }
      /* c8 ignore start -- parseConfig only throws ZodError for a config object; a non-Zod throw is a
         programming error, surfaced (not swallowed) by the outer 500 handler. */
      throw e;
    }
    /* c8 ignore stop */
    writeFileSync(configPath, JSON.stringify(clean, null, 2) + "\n");
    new Journal(join(cwd, ".dev-spec-kit", "journal.jsonl")).append("governance", {
      kind: "config-save",
      via: "cockpit",
      paths: Object.keys(posted),
    });
    json(res, 200, { ok: true });
    return;
  }

  // Static shell: data is regenerated per request so every reload is fresh truth.
  if (req.method === "GET") {
    if (url === "/rivet.data.js") {
      res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-store" });
      res.end(sidecarJs(buildCockpitData(cwd, { serverMode: true })));
      return;
    }
    const rel = url === "/" ? "index.html" : normalize(url).replace(/^[/\\]+/, "");
    if ((SHELL_FILES as readonly string[]).includes(rel)) {
      const path = join(cwd, ".dev-spec-kit", "cockpit", rel);
      if (existsSync(path)) {
        const ext = rel.slice(rel.lastIndexOf("."));
        res.writeHead(200, {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(readFileSync(path));
        return;
      }
    }
    // the graph iframe (../../<outDir>/graph.html) resolves to /<outDir>/… when served
    const outDir = parseConfig(safeReadConfig(cwd)).graphify.outDir;
    if (url.startsWith(`/${outDir}/`)) {
      const safe = normalize(url).replace(/^[/\\]+/, "");
      /* c8 ignore start -- defense-in-depth: a `..` segment is normalized away by fetch/browsers before
         the request is sent, so this sibling-dir guard only fires for a hand-crafted raw client. */
      if (safe.split("/")[0] !== outDir) {
        // finding #8: compare the first path SEGMENT, not a string prefix (no sibling-dir leak)
        json(res, 404, { error: "not found" });
        return;
      }
      /* c8 ignore stop */
      const path = join(cwd, safe);
      if (existsSync(path)) {
        const ext = safe.slice(safe.lastIndexOf("."));
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
        res.end(readFileSync(path));
        return;
      }
    }
  }
  json(res, 404, { error: "not found" });
}

/** `dev-spec-kit web [--port N] [--open]` — emit the cockpit and serve it with the save API. Returns the
 *  server (so callers/tests can close it); the CLI just leaves it listening until Ctrl-C. */
export function webCmd(opts: { port?: string; open?: boolean }): Server {
  const cwd = process.cwd();
  emitCockpit(cwd, { serverMode: true });
  const port = Number(opts.port ?? 7341) || 7341;
  const server = createCockpitServer(cwd);
  server.listen(port, "127.0.0.1", () => {
    const addr = server.address();
    const shown = typeof addr === "object" && addr ? addr.port : port;
    const url = `http://localhost:${shown}/`;
    console.log(
      pc.green(`${label("pr")} dev-spec-kit cockpit serving`) + pc.dim(` → ${url} (Ctrl-C to stop)`),
    );
    console.log(
      pc.dim(`  ${label("report")} dashboard + config studio · saves validate + respect GATE-PROTECT`),
    );
    /* c8 ignore next -- launches the OS browser; nothing to assert and not wanted in CI */
    if (opts.open) spawnSync("open", [url], { stdio: "ignore" });
  });
  return server;
}
