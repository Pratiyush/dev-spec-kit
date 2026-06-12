import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { revitify } from "revitify";
import { loadCodeGraph } from "../src/engine/graphify/index.js";
import { parseConfig } from "../src/config/schema.js";

/**
 * FEAT-REVITIFY-02 — revitify lives in its OWN repo (~/Github/revitify, consumed via file:
 * dependency); this is the CONSUMER-side contract: Rivet's loadCodeGraph must ingest revitify's
 * graphify-out output unchanged, and revitify stays the default provider. Revitify's own
 * ingestion suite lives in its repo; this test pins the seam between the two.
 */
describe("FEAT-REVITIFY-02 — the provider contract from Rivet's side", () => {
  it("loadCodeGraph ingests revitify output unchanged (provider-invisible)", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-revitify-"));
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(
      join(dir, "src", "auth.ts"),
      'import { hash } from "./crypto.js";\nexport class AuthService {\n  login(u: string) { return hash(u); }\n}\n',
    );
    writeFileSync(
      join(dir, "src", "crypto.ts"),
      "export function hash(s: string): string {\n  return s;\n}\n",
    );
    const { graphJsonPath, counts } = revitify(dir);
    expect(counts.nodes).toBeGreaterThan(3);
    const code = loadCodeGraph(graphJsonPath);
    expect(code.nodes.every((n) => n.kind === "codeNode")).toBe(true);
    expect(code.nodes.map((n) => n.label)).toContain("AuthService");
    expect(code.links.length).toBeGreaterThan(1);
  });

  it("revitify remains the default graph provider (pip never required)", () => {
    expect(parseConfig({}).graphify.provider).toBe("revitify");
  });
});
