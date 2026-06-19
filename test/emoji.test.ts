import { describe, expect, it } from "vitest";
import { EMOJI, BASELINE_EMOJI, resolvePlain, labelWith } from "../src/cli/emoji.js";
import { renderLedger } from "../src/cli/boards.js";

/**
 * FEAT-EMOJI-01 — emoji are an event-type grammar: ONE central map, ≥10 NEW types beyond the
 * baseline set that was already scattered through the renderers, and a plain-ASCII degradation
 * (--plain flag, NO_EMOJI=1, or auto when stdout is not a TTY) so CI logs stay greppable.
 * Persisted markdown artifacts (LEDGER/PR body) keep emoji as content — plain mode is terminal-only.
 */
describe("FEAT-EMOJI-01 — central vocabulary", () => {
  it("exposes at least 10 NEW emoji types beyond the frozen baseline", () => {
    const fresh = Object.values(EMOJI).filter((e) => !(BASELINE_EMOJI as readonly string[]).includes(e));
    expect(new Set(fresh).size).toBeGreaterThanOrEqual(10);
  });

  it("names the surfaces the feedback asked for", () => {
    expect(EMOJI.checkRun).toBe("🧪");
    expect(EMOJI.route).toBe("🧭");
    expect(EMOJI.specSync).toBe("✍️");
    expect(EMOJI.build).toBe("📦");
    expect(EMOJI.duration).toBe("⏱️");
    expect(EMOJI.drift).toBe("♻️");
    expect(EMOJI.scaffold).toBe("🧰");
    expect(EMOJI.research).toBe("🔍");
    expect(EMOJI.pr).toBe("🚀");
    expect(EMOJI.cleanup).toBe("🧹");
  });
});

describe("FEAT-EMOJI-01 — plain mode resolution (flag > env > TTY)", () => {
  it("--plain always wins", () => {
    expect(resolvePlain({ argv: ["node", "dev-spec-kit", "--plain"], env: {}, isTTY: true })).toBe(true);
  });
  it("NO_EMOJI=1 forces plain; NO_EMOJI=0 forces emoji even without a TTY", () => {
    expect(resolvePlain({ argv: [], env: { NO_EMOJI: "1" }, isTTY: true })).toBe(true);
    expect(resolvePlain({ argv: [], env: { NO_EMOJI: "0" }, isTTY: false })).toBe(false);
  });
  it("auto-plain when stdout is not a TTY", () => {
    expect(resolvePlain({ argv: [], env: {}, isTTY: false })).toBe(true);
    expect(resolvePlain({ argv: [], env: {}, isTTY: true })).toBe(false);
  });
  it("labelWith degrades each emoji to a greppable ASCII tag", () => {
    expect(labelWith("checkRun", false)).toBe("🧪");
    expect(labelWith("checkRun", true)).toBe("[test]");
    expect(labelWith("route", true)).toBe("[route]");
    expect(labelWith("build", true)).toBe("[build]");
  });
});

describe("FEAT-EMOJI-01 — the LEDGER carries a legend for the vocabulary", () => {
  it("renderLedger explains the proof lights", () => {
    const ledger = renderLedger([], []);
    expect(ledger).toContain("Legend");
    for (const e of ["🟢", "🔴", "🟣", "⚪"]) expect(ledger).toContain(e);
  });
});
