import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seedPractices, practicesFor } from "../src/engine/practices.js";

/**
 * FEAT-INITPACKS-01 — `rivet init --platforms <list>` seeds per-platform best-practice LAW packs
 * (scoped via the steering fileMatch mechanism), 100% free/OSS tools only, each ending with a
 * "Bind these as Rivet checks" section so the standards arrive pre-wired to enforcement.
 */

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "rivet-packs-"));
}

describe("FEAT-INITPACKS-01 — pack selection", () => {
  it("typescript+electron seeds ts, electron, and quality-gates packs (one language family ⇒ no polyglot)", () => {
    const names = practicesFor(["typescript", "electron"]).map((p) => p.file);
    expect(names).toContain("best-practices-typescript.md");
    expect(names).toContain("best-practices-electron.md");
    expect(names).toContain("best-practices-quality-gates.md");
    expect(names).not.toContain("best-practices-polyglot.md");
  });

  it("spring seeds the java pack; typescript+python crosses families ⇒ polyglot pack", () => {
    expect(practicesFor(["spring"]).map((p) => p.file)).toContain("best-practices-java.md");
    const names = practicesFor(["typescript", "python"]).map((p) => p.file);
    expect(names).toContain("best-practices-python.md");
    expect(names).toContain("best-practices-polyglot.md");
  });
});

describe("FEAT-INITPACKS-01 — seeded content", () => {
  it("writes scoped law files with the free/OSS constraint, key tools, and check wiring", () => {
    const dir = tmp();
    const seeded = seedPractices(dir, ["typescript", "electron"], false);
    expect(seeded.seeded.length).toBeGreaterThanOrEqual(3);

    const ts = readFileSync(join(dir, ".rivet", "laws", "best-practices-typescript.md"), "utf8");
    expect(ts).toMatch(/inclusion:\s*fileMatch/);
    expect(ts).toMatch(/pattern:.*tsx?/);
    expect(ts).toMatch(/free or open-source/i);
    for (const tool of ["ESLint", "Prettier", "noUncheckedIndexedAccess", "npm audit"]) {
      expect(ts).toContain(tool);
    }
    expect(ts).toContain("Bind these as Rivet checks");

    const electron = readFileSync(join(dir, ".rivet", "laws", "best-practices-electron.md"), "utf8");
    for (const must of ["contextIsolation", "nodeIntegration", "contextBridge", "Playwright", "CSP"]) {
      expect(electron).toContain(must);
    }

    const gates = readFileSync(join(dir, ".rivet", "laws", "best-practices-quality-gates.md"), "utf8");
    for (const tool of ["Husky", "lint-staged", "SonarQube Community", "CodeQL"])
      expect(gates).toContain(tool);
    expect(gates).toMatch(/optional/i);
  });

  it("java pack carries the full free toolchain incl. ArchUnit rules", () => {
    const dir = tmp();
    seedPractices(dir, ["spring"], false);
    const java = readFileSync(join(dir, ".rivet", "laws", "best-practices-java.md"), "utf8");
    for (const tool of [
      "Checkstyle",
      "SpotBugs",
      "PMD",
      "JaCoCo",
      "ArchUnit",
      "OWASP Dependency-Check",
      "Testcontainers",
    ]) {
      expect(java).toContain(tool);
    }
    expect(java).toMatch(/controllers? MUST NOT call repositor/i);
  });

  it("python pack ships ruff, mypy strict, pytest, pip-audit", () => {
    const dir = tmp();
    seedPractices(dir, ["python"], false);
    const py = readFileSync(join(dir, ".rivet", "laws", "best-practices-python.md"), "utf8");
    for (const tool of ["ruff", "mypy", "pytest", "pip-audit"]) expect(py).toContain(tool);
  });

  it("is idempotent: existing files are never clobbered without force", () => {
    const dir = tmp();
    seedPractices(dir, ["typescript"], false);
    const path = join(dir, ".rivet", "laws", "best-practices-typescript.md");
    writeFileSync(path, "MY EDITS\n");
    const second = seedPractices(dir, ["typescript"], false);
    expect(readFileSync(path, "utf8")).toBe("MY EDITS\n");
    expect(second.skipped).toContain("best-practices-typescript.md");
    seedPractices(dir, ["typescript"], true); // force re-seeds
    expect(readFileSync(path, "utf8")).not.toBe("MY EDITS\n");
  });

  it("polyglot pack demands per-language runners and ONE CI gate", () => {
    const dir = tmp();
    seedPractices(dir, ["typescript", "python"], false);
    const poly = readFileSync(join(dir, ".rivet", "laws", "best-practices-polyglot.md"), "utf8");
    expect(poly).toMatch(/verify\.runners/);
    expect(poly).toMatch(/ONE CI gate/i);
    expect(existsSync(join(dir, ".rivet", "laws", "best-practices-python.md"))).toBe(true);
  });
});
