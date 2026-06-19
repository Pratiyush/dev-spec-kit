import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadLaws } from "../src/engine/steering.js";

/** STEER-01: the laws layer made real — 3 scopes (always / fileMatch / manual), personal→project
 *  inheritance, and #[[file:...]] injection. Rules are data; the engine only assembles them. */

function project(): string {
  const dir = mkdtempSync(join(tmpdir(), "dev-spec-kit-steer-"));
  mkdirSync(join(dir, ".dev-spec-kit", "laws"), { recursive: true });
  writeFileSync(join(dir, ".dev-spec-kit", "laws.md"), "# Project Laws\n- project rule one\n");
  writeFileSync(
    join(dir, ".dev-spec-kit", "laws", "security.md"),
    "---\ninclusion: fileMatch\npattern: auth\n---\n- security: never log tokens\n",
  );
  writeFileSync(
    join(dir, ".dev-spec-kit", "laws", "notes.md"),
    "---\ninclusion: manual\nname: notes\n---\n- summoned-only guidance\n",
  );
  writeFileSync(join(dir, "snippet.md"), "INJECTED-CONTENT");
  writeFileSync(join(dir, ".dev-spec-kit", "laws", "withref.md"), "see #[[file:snippet.md]] inline\n");
  return dir;
}

describe("loadLaws", () => {
  it("personal laws come first, then project laws; scoped files obey their inclusion", () => {
    const dir = project();
    const personal = join(mkdtempSync(join(tmpdir(), "dev-spec-kit-personal-")), "laws.md");
    writeFileSync(personal, "- personal default rule\n");

    const plain = loadLaws(dir, { personalPath: personal });
    const sources = plain.sections.map((s) => s.source);
    expect(sources[0]).toBe("personal");
    expect(sources).toContain("project");
    expect(plain.sections.some((s) => s.body.includes("security"))).toBe(false); // no file context
    expect(plain.sections.some((s) => s.body.includes("summoned-only"))).toBe(false); // not summoned

    const forAuth = loadLaws(dir, { personalPath: personal, file: "src/auth/login.ts" });
    expect(forAuth.sections.some((s) => s.body.includes("never log tokens"))).toBe(true);

    const summoned = loadLaws(dir, { personalPath: personal, summon: ["notes"] });
    expect(summoned.sections.some((s) => s.body.includes("summoned-only"))).toBe(true);
  });

  it("expands #[[file:...]] includes and warns on missing targets", () => {
    const dir = project();
    const laws = loadLaws(dir, { personalPath: join(dir, "nope-personal.md") });
    const withref = laws.sections.find((s) => s.source.includes("withref"))!;
    expect(withref.body).toContain("INJECTED-CONTENT");
    expect(withref.body).not.toContain("#[[file:snippet.md]]");

    writeFileSync(join(dir, ".dev-spec-kit", "laws", "broken.md"), "ref #[[file:missing.md]] here\n");
    const second = loadLaws(dir, { personalPath: join(dir, "nope-personal.md") });
    expect(second.warnings.join(" ")).toContain("missing.md");
  });
});
