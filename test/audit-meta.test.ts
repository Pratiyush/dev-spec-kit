import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Journal } from "../src/engine/state/journal.js";
import { renderLog } from "../src/cli/log.js";

/** AUDIT-META-01: who/what acted is part of the audit; governance events are first-class. */

function tempJournal(): Journal {
  return new Journal(join(mkdtempSync(join(tmpdir(), "rivet-meta-")), "j.jsonl"));
}

describe("event metadata", () => {
  it("append() can stamp actor/model metadata and it roundtrips", () => {
    const j = tempJournal();
    j.append("cli.run", { command: "task done", args: ["T1"] }, { meta: { actor: "Pratiyush", model: "claude-fable-5" } });
    const [e] = j.read();
    expect(e!.meta).toEqual({ actor: "Pratiyush", model: "claude-fable-5" });
  });

  it("renderLog shows actor/model when present", () => {
    const lines = renderLog([
      {
        at: "2026-06-11T10:00:00Z",
        type: "cli.run",
        data: { command: "approve", args: ["T1"] },
        meta: { actor: "Pratiyush", model: "claude-fable-5" },
      },
    ]);
    expect(lines[0]).toContain("Pratiyush");
    expect(lines[0]).toContain("claude-fable-5");
  });
});

describe("governance events", () => {
  it("governance is a first-class event type rendered with its own badge", () => {
    const j = tempJournal();
    j.append("governance", { kind: "unlock", paths: ["test/foo.test.ts"], until: "2026-06-12T00:00:00Z" });
    j.append("governance", { kind: "policy-violation", detail: "edit blocked on protected spec" });
    const lines = renderLog(j.read());
    expect(lines[0]).toContain("🛡️");
    expect(lines[0]).toContain("unlock");
    expect(lines[1]).toContain("policy-violation");
  });
});
