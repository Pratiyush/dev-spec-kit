import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { generateManifest } from "../src/engine/config-manifest.js";
import { parseConfig } from "../src/config/schema.js";

/**
 * FIX-COCKPIT-ASSETS-01 — the cockpit's browser shell is vanilla global-scope JS (not importable
 * for DOM unit tests), so adversarial-review findings #4 and #9 were originally only "verified by
 * inspection." This is the permanent regression GUARD: it pins the specific wiring in the shipped
 * assets so a future edit can't silently drop it. (A behavioral Playwright e2e against `dev-spec-kit web`
 * remains a Phase-D item — see .dev-spec-kit/DEFER.md.) Read the ACTUAL files dev-spec-kit ships, not a copy.
 */

const assetsDir = fileURLToPath(new URL("../src/cli/cockpit-assets/", import.meta.url));
const read = (f: string) => readFileSync(join(assetsDir, f), "utf8");

describe("FIX-COCKPIT-ASSETS-01 — finding #4: verify.buildAll is editable via a json control", () => {
  const config = read("rivet.config.js");

  it("the schema produces a json-typed knob (the thing the control must handle)", () => {
    const buildAll = generateManifest(parseConfig({})).find((k) => k.path === "verify.buildAll");
    expect(buildAll?.type).toBe("json");
  });

  it("control() has a json case and wireKnobs has a jsonedit handler that parses + validates", () => {
    expect(config).toMatch(/case ['"]json['"]:\s*return jsonCtl/);
    expect(config).toContain('data-act="jsonedit"'); // the textarea control
    expect(config).toMatch(/act === ['"]jsonedit['"]/); // the handler
    // the handler must JSON.parse and record an error on bad input (not silently corrupt state)
    const handler = config.slice(config.indexOf('act === "jsonedit"'));
    expect(handler.slice(0, 200)).toMatch(/JSON\.parse/);
    expect(handler.slice(0, 200)).toMatch(/errorMap/);
  });

  it("the design's old 'unsupported' fallthrough no longer swallows json knobs", () => {
    // before the fix, a json-typed knob hit default → "unsupported"; the json case must precede
    // that fallthrough. ("unsupported" appears only in the switch default's return — unambiguous.)
    const jsonCase = Math.max(config.indexOf("case 'json'"), config.indexOf('case "json"'));
    const unsupported = config.indexOf("unsupported");
    expect(jsonCase).toBeGreaterThan(0);
    expect(jsonCase).toBeLessThan(unsupported);
  });
});

describe("FIX-COCKPIT-ASSETS-01 — finding #9: auto-reload preserves state and never clobbers edits", () => {
  const app = read("rivet.app.js");

  it("persists transient view state across the reload (sessionStorage)", () => {
    expect(app).toContain("rivet-viewstate");
    expect(app).toMatch(/sessionStorage\.setItem\(\s*["']rivet-viewstate/);
    expect(app).toMatch(/sessionStorage\.getItem\(\s*["']rivet-viewstate/);
  });

  it("the reload tick refuses to fire over unsaved edits or an open drawer", () => {
    const tick = app.slice(app.indexOf("setInterval"));
    expect(tick).toMatch(/Config\.hasDirty\(\)\s*\)\s*return/); // dirty config → no reload
    expect(tick).toMatch(/drawerOpen\)\s*return/); // open JSON drawer → no reload
    expect(tick).toContain("location.reload()");
  });

  it("the reload honors the configured refreshSeconds with a sane floor", () => {
    expect(app).toMatch(/refreshSeconds\s*\|\|\s*15/);
    expect(app).toMatch(/Math\.max\(\s*5/); // never busy-reload below 5s
  });
});
