import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectRivetFiles, mdToHtml } from "../src/cli/dashboard.js";

/** FILES-01: every .rivet markdown artifact, collected + rendered READABLE (and injection-safe). */

describe("collectRivetFiles", () => {
  it("collects laws/learnings/specs/boards/approvals in stable order, skipping machine files", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-files-"));
    for (const d of [".rivet/specs", ".rivet/approvals", ".rivet/laws"]) mkdirSync(join(dir, d), { recursive: true });
    writeFileSync(join(dir, ".rivet", "laws.md"), "# laws");
    writeFileSync(join(dir, ".rivet", "laws", "security.md"), "scoped");
    writeFileSync(join(dir, ".rivet", "learnings.md"), "# lessons");
    writeFileSync(join(dir, ".rivet", "specs", "a.md"), "# spec a");
    writeFileSync(join(dir, ".rivet", "approvals", "x.md"), "# approval");
    writeFileSync(join(dir, ".rivet", "LEDGER.md"), "# ledger");
    writeFileSync(join(dir, ".rivet", "journal.jsonl"), "{}"); // machine state — excluded
    writeFileSync(join(dir, ".rivet", "config.json"), "{}"); // excluded

    const files = collectRivetFiles(dir);
    const names = files.map((f) => f.name);
    expect(names[0]).toBe("laws.md"); // laws lead
    expect(names).toContain("laws/security.md");
    expect(names).toContain("specs/a.md");
    expect(names).toContain("approvals/x.md");
    expect(names).toContain("LEDGER.md");
    expect(names.join(" ")).not.toMatch(/journal|config/);
  });

  it("caps oversized files with a truncation note", () => {
    const dir = mkdtempSync(join(tmpdir(), "rivet-files-big-"));
    mkdirSync(join(dir, ".rivet"), { recursive: true });
    writeFileSync(join(dir, ".rivet", "laws.md"), "x".repeat(60_000));
    const [f] = collectRivetFiles(dir);
    expect(f!.content.length).toBeLessThan(55_000);
    expect(f!.content).toContain("truncated");
  });
});

describe("mdToHtml — minimal, readable, injection-safe", () => {
  it("renders headings, bold, lists, inline code and fenced code", () => {
    const html = mdToHtml("# Title\n\n- item **bold** `code`\n\n```\nraw block\n```\n");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<li>item <strong>bold</strong> <code>code</code></li>");
    expect(html).toContain("<pre><code>raw block");
  });

  it("renders pipe tables as real tables (the TRACKING case)", () => {
    const html = mdToHtml("| Req | Proof |\n|---|---|\n| R-1 | 🟢 |\n");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>Req</th>");
    expect(html).toContain("<td>R-1</td>");
    expect(html).toContain("🟢");
  });

  it("escapes raw HTML — markdown content cannot inject script", () => {
    const html = mdToHtml("hello <script>alert(1)</script> **bold**");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<strong>bold</strong>");
  });
});
