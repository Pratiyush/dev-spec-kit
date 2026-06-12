import { describe, expect, it } from "vitest";
import { sessionStart, needsFlush } from "../src/engine/flushwarn.js";

/**
 * FEAT-FLUSH-01 — the learnings-flush pre-flight (standing user rule, tool-ified): `rivet pr`
 * warns 📝 when .rivet/learnings.md carries nothing from THIS session — lessons must be banked
 * before the work ships. A session = the trailing run of journal events with no gap > 30 min.
 * Warning only, never a gate (some sessions genuinely teach nothing).
 */

const ev = (at: string) => ({ at, type: "cli.run", data: {} });

describe("FEAT-FLUSH-01 — session boundary detection", () => {
  it("an unbroken run of events is one session starting at the first event", () => {
    const events = [ev("2026-06-12T10:00:00Z"), ev("2026-06-12T10:10:00Z"), ev("2026-06-12T10:20:00Z")];
    expect(sessionStart(events)).toBe("2026-06-12T10:00:00Z");
  });

  it("a gap over 30 minutes starts a new session", () => {
    const events = [
      ev("2026-06-12T08:00:00Z"),
      ev("2026-06-12T08:05:00Z"),
      // 2h gap — the morning was a different session
      ev("2026-06-12T10:00:00Z"),
      ev("2026-06-12T10:10:00Z"),
    ];
    expect(sessionStart(events)).toBe("2026-06-12T10:00:00Z");
  });

  it("no events ⇒ no session", () => {
    expect(sessionStart([])).toBeUndefined();
  });
});

describe("FEAT-FLUSH-01 — the warn predicate", () => {
  const events = [ev("2026-06-12T10:00:00Z"), ev("2026-06-12T10:20:00Z")];

  it("warns when the ledger predates the session; quiet when it was touched during it", () => {
    expect(needsFlush(events, "2026-06-12T09:59:00Z")).toBe(true); // stale ledger — flush!
    expect(needsFlush(events, "2026-06-12T10:10:00Z")).toBe(false); // banked mid-session
  });

  it("never warns without a session", () => {
    expect(needsFlush([], "2026-06-12T09:00:00Z")).toBe(false);
  });
});
