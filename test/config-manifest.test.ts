import { describe, expect, it } from "vitest";
import { z } from "zod";
import { generateManifest, manifestFromSchema, SECTIONS } from "../src/engine/config-manifest.js";
import { parseConfig } from "../src/config/schema.js";

/**
 * REQUIREMENT_COCKPIT-01 — the config studio renders ONLY what this manifest says, so the manifest
 * is generated from the zod schema (types/enums/defaults can't lie) with UI descriptions enforced
 * complete. Silent knob loss is the config-studio equivalent of the parser's worst failure.
 */
describe("REQUIREMENT_COCKPIT-01 — manifest from the schema", () => {
  const manifest = generateManifest(parseConfig({}));
  const byPath = new Map(manifest.map((k) => [k.path, k]));

  it("every leaf knob is fully described (type, default, value, changed, description)", () => {
    expect(manifest.length).toBeGreaterThan(60); // the real schema is ~70 knobs — never shrink silently
    for (const k of manifest) {
      expect(k.section, k.path).toBeTruthy();
      expect(k.path.startsWith(k.section + "."), k.path).toBe(true);
      expect([
        "string",
        "enum",
        "enum[]",
        "string[]",
        "boolean",
        "number",
        "record",
        "object",
        "json",
      ]).toContain(k.type);
      expect(k.description?.trim().length, `${k.path} needs a description`).toBeGreaterThan(10);
      expect(k.changed, `${k.path} should be unchanged at defaults`).toBe(false);
      expect("default" in k, k.path).toBe(true);
    }
    // the version literal is internal plumbing, never a knob
    expect(byPath.has("version")).toBe(false);
  });

  it("enums carry allowed values; runner records carry the cmd-args shape", () => {
    expect(byPath.get("spec.criteriaFormat")!.allowed).toContain("gherkin");
    expect(byPath.get("graphify.provider")!.allowed).toEqual(["revitify", "graphify"]);
    expect(byPath.get("project.platforms")!.type).toBe("enum[]");
    expect(byPath.get("project.platforms")!.allowed).toContain("electron");
    expect(byPath.get("verify.kindRunners")!.type).toBe("record");
    expect(byPath.get("verify.kindRunners")!.recordShape).toMatchObject({ cmd: "string" });
    const app = byPath.get("verify.app")!;
    expect(app.type).toBe("object");
    expect(app.fields!.map((f) => f.key)).toEqual(["start", "readyUrl", "readyTimeoutMs"]);
    expect(byPath.get("verify.coverage")!.nullable).toBe(true);
    expect(byPath.get("verify.buildAll")!.type).toBe("json"); // array-of-objects edits as JSON
  });

  it("dashboard.refreshSeconds exists for the cockpit's reload cadence", () => {
    const rs = byPath.get("dashboard.refreshSeconds")!;
    expect(rs.type).toBe("number");
    expect(rs.default).toBe(15);
    expect(rs.min).toBeGreaterThanOrEqual(5);
  });

  it("changed flags flip when a value differs from the default", () => {
    const m = generateManifest(
      parseConfig({ project: { name: "rivet" }, spec: { criteriaFormat: "mixed" } }),
    );
    const by = new Map(m.map((k) => [k.path, k]));
    expect(by.get("project.name")!.changed).toBe(true);
    expect(by.get("spec.criteriaFormat")!.changed).toBe(true);
    expect(by.get("mode.routing")!.changed).toBe(false);
  });

  it("unsupported or undescribed schema nodes throw with the offending path", () => {
    const weird = z.object({ sec: z.object({ knob: z.tuple([z.string()]) }).default({ knob: ["x"] }) });
    expect(() => manifestFromSchema(weird, {}, {}, { "sec.knob": "a tuple" })).toThrowError(/sec\.knob/);
    const fine = z.object({ sec: z.object({ knob: z.boolean().default(true) }).default({}) });
    expect(() => manifestFromSchema(fine, { sec: { knob: true } }, { sec: { knob: true } }, {})).toThrowError(
      /description.*sec\.knob|sec\.knob.*description/,
    );
  });

  it("the 15 sections ship presentation metadata for the rail", () => {
    expect(SECTIONS).toHaveLength(15);
    for (const s of SECTIONS) {
      expect(s.id).toBeTruthy();
      expect(s.icon).toBeTruthy();
      expect(s.blurb.length).toBeGreaterThan(10);
    }
    const ids = new Set(SECTIONS.map((s) => s.id));
    for (const k of manifest)
      expect(ids.has(k.section), `section ${k.section} missing from SECTIONS`).toBe(true);
  });
});
