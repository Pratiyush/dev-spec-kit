import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildGraph, revitify } from "../src/index.js";
import { loadCodeGraph } from "../../../src/engine/graphify/index.js";

/**
 * FEAT-REVITIFY-01 — Rivet's graph layer must not depend on someone else's pip package.
 * Revitify ingests code (TS/JS via the compiler API; Python/Java best-effort) + markdown into a
 * knowledge graph and emits graphify's EXACT output contract (graphify-out/: graph.json ·
 * graph.html · GRAPH_REPORT.md) so the VTG overlay, dashboard embed, and every existing consumer
 * swap providers invisibly. Concepts adapted from graphify (MIT); original implementation.
 */

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), "revitify-"));
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "auth.ts"),
    [
      `import { hash } from "./crypto.js";`,
      `export interface Session { id: string }`,
      `export class AuthService {`,
      `  login(user: string): Session { return { id: hash(user) }; }`,
      `}`,
      `export function logout(): void {}`,
    ].join("\n"),
  );
  writeFileSync(
    join(dir, "src", "crypto.ts"),
    [`export function hash(s: string): string {`, `  return s.toUpperCase();`, `}`].join("\n"),
  );
  mkdirSync(join(dir, "py"), { recursive: true });
  writeFileSync(
    join(dir, "py", "indicators.py"),
    "class Sma:\n    pass\n\ndef compute(values):\n    return 1\n",
  );
  writeFileSync(join(dir, "README.md"), "# Fixture App\n\n## Architecture\n\nNotes.\n");
  // Noise that must be EXCLUDED:
  mkdirSync(join(dir, "node_modules", "junk"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "junk", "x.ts"), "export const nope = 1;");
  return dir;
}

describe("FEAT-REVITIFY-01 — ingestion", () => {
  const dir = fixture();
  const graph = buildGraph(dir);
  const labels = graph.nodes.map((n) => n.label);

  it("extracts TS symbols (classes, interfaces, functions, methods) and file nodes", () => {
    for (const expected of ["AuthService", "Session", "logout", "hash", "login", "src/auth.ts"]) {
      expect(labels, `missing node '${expected}'`).toContain(expected);
    }
  });

  it("extracts Python classes/defs and markdown headings", () => {
    expect(labels).toContain("Sma");
    expect(labels).toContain("compute");
    expect(labels).toContain("Fixture App");
  });

  it("never ingests node_modules", () => {
    expect(labels).not.toContain("nope");
  });

  it("builds containment, import, and reference edges", () => {
    const rel = (r: string) => graph.links.filter((l) => l.relation === r);
    expect(rel("contains").length).toBeGreaterThan(4); // file → symbol
    const imports = rel("imports");
    expect(
      imports.some((l) => String(l.source).includes("auth.ts") && String(l.target).includes("crypto.ts")),
    ).toBe(true);
    expect(rel("references").some((l) => String(l.target).includes("hash"))).toBe(true);
  });

  it("every node carries source_file and a directory-based community", () => {
    const auth = graph.nodes.find((n) => n.label === "AuthService")!;
    expect(auth.source_file).toBe("src/auth.ts");
    expect(typeof auth.community).toBe("number");
  });
});

describe("FEAT-REVITIFY-01 — the graphify output contract", () => {
  const dir = fixture();
  const result = revitify(dir);

  it("emits graphify-out/graph.json + graph.html + GRAPH_REPORT.md", () => {
    for (const f of ["graph.json", "graph.html", "GRAPH_REPORT.md"]) {
      expect(existsSync(join(dir, "graphify-out", f)), `${f} missing`).toBe(true);
    }
    expect(result.counts.nodes).toBeGreaterThan(5);
  });

  it("Rivet's own loadCodeGraph ingests the output unchanged (provider-invisible)", () => {
    const code = loadCodeGraph(join(dir, "graphify-out", "graph.json"));
    expect(code.nodes.every((n) => n.kind === "codeNode")).toBe(true);
    expect(code.nodes.map((n) => n.label)).toContain("AuthService");
    expect(code.links.length).toBeGreaterThan(3);
  });

  it("graph.html is self-contained and interactive (embedded data, canvas, search)", () => {
    const html = readFileSync(join(dir, "graphify-out", "graph.html"), "utf8");
    expect(html).toContain("<canvas");
    expect(html).toMatch(/input[^>]*search/i);
    expect(html).toContain("AuthService"); // data embedded, no fetches
    expect(html).not.toMatch(/src="https?:/); // zero external resources
  });

  it("GRAPH_REPORT.md carries the highlights: counts, hubs, suggested questions", () => {
    const report = readFileSync(join(dir, "graphify-out", "GRAPH_REPORT.md"), "utf8");
    expect(report).toMatch(/\d+ nodes/);
    expect(report).toMatch(/most connected/i);
    expect(report).toMatch(/suggested questions/i);
  });
});

describe("FEAT-REVITIFY-01 — provider default", () => {
  it("rivet config defaults graph provider to revitify (pip never required)", async () => {
    const { parseConfig } = await import("../../../src/config/schema.js");
    expect(parseConfig({}).graphify.provider).toBe("revitify");
  });
});
