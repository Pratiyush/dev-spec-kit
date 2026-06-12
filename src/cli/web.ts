import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { ZodError } from "zod";
import pc from "picocolors";
import { parseConfig } from "../config/schema.js";
import { Journal } from "../engine/state/journal.js";
import { TaskStore } from "../engine/state/tasks.js";
import { buildRivet, sidecarJs } from "./cockpit-data.js";
import { emitCockpit, SHELL_FILES } from "./cockpit.js";
import { label } from "./emoji.js";

/**
 * REQUIREMENT_COCKPIT-05 — `rivet web`: the cockpit's ONE served path. Reads stay static
 * (the same shell files; the sidecar is regenerated per request so every reload is fresh);
 * the server exists for the WRITE path only:
 *   GET  /api/state   → the RIVET object (serverMode: true)
 *   POST /api/config  → zod-validated save to .rivet/config.json, journaled as governance —
 *                       REFUSED with GATE-PROTECT-01 while tasks are in flight and no human
 *                       unlock window is open. The moat is not editable by the thing it gates.
 */

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const CONFIG_REL = ".rivet/config.json";

interface GateRefusal {
  blocked: "GATE-PROTECT-01";
  reason: string;
  unlockHint: string;
}

/** GATE-PROTECT-01 for the web save: in-flight tasks lock the config unless a human unlock is open. */
function gateRefusal(cwd: string): GateRefusal | null {
  const tasks = [...new TaskStore(new Journal(join(cwd, ".rivet", "journal.jsonl"))).all().values()];
  const inFlight = tasks.filter((t) => t.status === "in_progress").map((t) => t.id);
  if (inFlight.length === 0) return null;
  const unlockPath = join(cwd, ".rivet", "unlock.json");
  if (existsSync(unlockPath)) {
    try {
      const u = JSON.parse(readFileSync(unlockPath, "utf8")) as { paths?: string[]; until?: string };
      const active = u.until !== undefined && Date.parse(u.until) > Date.now();
      const covers = (u.paths ?? []).some((p) => CONFIG_REL.endsWith(p) || p.endsWith("config.json"));
      if (active && covers) return null;
    } catch {
      /* unreadable unlock = no unlock */
    }
  }
  return {
    blocked: "GATE-PROTECT-01",
    reason: `config is locked while ${inFlight.join(", ")} ${inFlight.length > 1 ? "are" : "is"} in flight`,
    unlockHint: `rivet unlock ${CONFIG_REL} --minutes 30`,
  };
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

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

export function createCockpitServer(cwd: string): Server {
  return createServer((req, res) => {
    void handle(cwd, req, res).catch((e: unknown) => {
      json(res, 500, { error: e instanceof Error ? e.message : String(e) });
    });
  });
}

async function handle(cwd: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = (req.url ?? "/").split("?")[0]!;

  if (req.method === "GET" && url === "/api/state") {
    json(res, 200, buildRivet(cwd, { serverMode: true }));
    return;
  }

  if (req.method === "POST" && url === "/api/config") {
    const refusal = gateRefusal(cwd);
    if (refusal) {
      json(res, 403, refusal);
      return;
    }
    let posted: Record<string, unknown>;
    try {
      posted = JSON.parse(await readBody(req)) as Record<string, unknown>;
    } catch {
      json(res, 400, { errors: [{ path: "", message: "body is not valid JSON" }] });
      return;
    }
    const configPath = join(cwd, CONFIG_REL);
    const existing = existsSync(configPath)
      ? (JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>)
      : {};
    const merged = deepMerge(existing, posted);
    try {
      parseConfig(merged);
    } catch (e) {
      if (e instanceof ZodError) {
        json(res, 422, { errors: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
        return;
      }
      throw e;
    }
    writeFileSync(configPath, JSON.stringify(merged, null, 2) + "\n");
    new Journal(join(cwd, ".rivet", "journal.jsonl")).append("governance", {
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
      res.end(sidecarJs(buildRivet(cwd, { serverMode: true })));
      return;
    }
    const rel = url === "/" ? "index.html" : normalize(url).replace(/^[/\\]+/, "");
    if ((SHELL_FILES as readonly string[]).includes(rel)) {
      const path = join(cwd, ".rivet", "cockpit", rel);
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
    // the graph iframe (../../graphify-out/graph.html) resolves to /graphify-out/… when served
    if (url.startsWith("/graphify-out/")) {
      const safe = normalize(url).replace(/^[/\\]+/, "");
      if (!safe.startsWith("graphify-out")) {
        json(res, 404, { error: "not found" });
        return;
      }
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

/** `rivet web [--port N] [--open]` — emit the cockpit and serve it with the save API. */
export function webCmd(opts: { port?: string; open?: boolean }): void {
  const cwd = process.cwd();
  emitCockpit(cwd, { serverMode: true });
  const port = Number(opts.port ?? 7341) || 7341;
  const server = createCockpitServer(cwd);
  server.listen(port, () => {
    const url = `http://localhost:${port}/`;
    console.log(pc.green(`${label("pr")} rivet cockpit serving`) + pc.dim(` → ${url} (Ctrl-C to stop)`));
    console.log(
      pc.dim(`  ${label("report")} dashboard + config studio · saves validate + respect GATE-PROTECT`),
    );
    if (opts.open) spawnSync("open", [url], { stdio: "ignore" });
  });
}
