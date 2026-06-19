import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { criterionTextForRef, requirementIdForRef } from "../src/engine/spec/ears.js";
import { routeRequest } from "../src/engine/route/classify.js";
import { parseSpec } from "../src/engine/spec/parse.js";
import { reportArgs } from "../src/engine/verify/report.js";
import { specTasks, specDraftTests } from "../src/cli/workflow.js";
import { stampProofs } from "../src/cli/verify-cmd.js";
import { Journal } from "../src/engine/state/journal.js";
import { TaskStore } from "../src/engine/state/tasks.js";
import { defaultConfig } from "../src/config/schema.js";
import type { VerifyRun } from "../src/engine/verify/verify-all.js";
import { tmpProject, run } from "./helpers/cli-harness.js";

describe("ears ref lookups — no match returns undefined", () => {
  const reqs = parseSpec(
    "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
  );
  it("criterionTextForRef / requirementIdForRef are undefined for an unknown ref", () => {
    expect(criterionTextForRef(reqs, "nope::missing")).toBeUndefined();
    expect(requirementIdForRef(reqs, "nope::missing")).toBeUndefined();
  });
  it("resolve a known ref to its text + owner", () => {
    expect(criterionTextForRef(reqs, "a::b")).toContain("SHALL");
    expect(requirementIdForRef(reqs, "a::b")).toBe("REQUIREMENT_X-01");
  });
});

describe("routeRequest — long multi-part requests earn full-spec", () => {
  it("routes a long, comma-heavy request to full-spec", () => {
    const text =
      "please update the billing page, then the invoice exporter, then the email templates, then the admin settings, then the audit log, and finally the reporting dashboard across the whole app";
    expect(routeRequest(text).mode).toBe("full-spec");
  });
});

describe("parseSpec — Scenario Outline with no Examples warns", () => {
  it("treats an Examples-less outline as a single criterion and warns", () => {
    const warnings: string[] = [];
    parseSpec(
      "## Requirement REQUIREMENT_X-01 — t\nScenario Outline: do <thing>\n  Given a <thing>\n",
      warnings,
    );
    expect(warnings.some((w) => w.includes("no Examples"))).toBe(true);
  });
});

describe("reportArgs — vitest and jest JSON output flags", () => {
  it("emits reporter flags for both runners", () => {
    expect(reportArgs("vitest", "/tmp/r.json").join(" ")).toContain("--reporter=json");
    expect(reportArgs("jest", "/tmp/r.json").join(" ")).toContain("--json");
  });
});

describe("spec tasks / draft — remaining branches", () => {
  it("skips id-lint entirely when rules.requireQualifiedIds is off", () => {
    const dir = tmpProject({
      ".dev-spec-kit/config.json": JSON.stringify({ rules: { requireQualifiedIds: "off" } }),
      ".dev-spec-kit/specs/x.md":
        "## Requirement R-1 — short\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
    });
    const { text, exitCode } = run(dir, () => specTasks());
    expect(text).not.toContain("requireQualifiedIds");
    expect(exitCode).toBeUndefined();
  });

  it("appends stubs to an EXISTING test file rather than recreating it", () => {
    const dir = tmpProject({
      ".dev-spec-kit/specs/x.md": "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n",
    });
    const first = run(dir, () => specDraftTests()); // creates test/<slug>.test.ts
    expect(first.text).toContain("created");
    // add another unbound criterion → second draft appends to the now-existing file
    writeFileSync(
      join(dir, ".dev-spec-kit", "specs", "x.md"),
      "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\nThe system SHALL also persist data.\n",
    );
    const second = run(dir, () => specDraftTests());
    expect(second.text).toContain("appended");
  });
});

describe("stampProofs — a malformed report is skipped, not crashed on", () => {
  it("ignores an unparseable report file", () => {
    const dir = tmpProject();
    const bad = join(dir, "bad.json");
    writeFileSync(bad, "{ not json");
    const journal = new Journal(join(dir, ".dev-spec-kit", "journal.jsonl"));
    new TaskStore(journal).create("T1", "t", ["c1"]);
    const vrun: VerifyRun = {
      passed: true,
      steps: [],
      reports: [{ path: bad, reporter: "vitest" }],
      tree: "T",
    };
    const { text } = run(dir, () => stampProofs(dir, defaultConfig(), journal, vrun));
    expect(text).toContain("nothing to stamp");
  });
});

import { inFlightTasks } from "../src/engine/protect.js";
import { planVerify } from "../src/engine/verify/verify-all.js";
import { parseConfig } from "../src/config/schema.js";
import { buildPrBody } from "../src/engine/pr/body.js";
import { specTasks as specTasks2 } from "../src/cli/workflow.js";

describe("inFlightTasks — folds bindings + status", () => {
  it("tracks a task through created → bindings → in_progress", () => {
    const at = "2026-06-12T00:00:00Z";
    const inflight = inFlightTasks([
      { at, type: "task.created", data: { id: "T1", boundChecks: ["c1"] } },
      { at, type: "task.bindings", data: { id: "T1", boundChecks: ["c1", "c2"] } },
      { at, type: "task.status", data: { id: "T1", status: "in_progress" } },
    ] as never);
    expect(inflight.map((t) => t.id)).toContain("T1");
  });
});

describe("planVerify — a kind with no resolvable stack is skipped", () => {
  it("yields no test steps when neither platforms, defaultStack nor runners resolve a stack", () => {
    const steps = planVerify(tmpProject(), parseConfig({ verify: { kinds: ["unit"], buildAll: [] } }));
    expect(steps.filter((s) => s.name.startsWith("tests:"))).toHaveLength(0);
  });
});

describe("buildPrBody — an unbound criterion renders 'no check bound'", () => {
  it("marks a criterion with no validates edge", () => {
    const requirements = parseSpec(
      "## Requirement REQUIREMENT_X-01 — t\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
    );
    const body = buildPrBody({
      title: "X",
      requirements,
      graph: { nodes: [], edges: [] },
      tasks: [],
      approvals: [],
      headSha: "HEAD",
    });
    expect(body).toContain("no check bound");
  });
});

describe("spec tasks — warns (not errors) on an unqualified id by default", () => {
  it("prints a yellow id warning without blocking", () => {
    const dir = tmpProject({
      ".dev-spec-kit/specs/x.md":
        "## Requirement R-1 — short\nWHEN x THEN the system SHALL y.\n@check kind=unit ref=a::b\n",
    });
    const { text, exitCode } = run(dir, () => specTasks2());
    expect(text).toContain("⚠");
    expect(exitCode).toBeUndefined();
  });
});

describe("routeRequest — a feature-sized keyword earns full-spec", () => {
  it("routes 'build a new authentication system' to full-spec (feature-sized reason)", () => {
    const r = routeRequest("build a new authentication system");
    expect(r.mode).toBe("full-spec");
    expect(r.reason).toContain("feature-sized");
  });
});

describe("routeRequest — a long request (no big keyword) is full-spec via length", () => {
  it("routes a 60+ word non-keyword request to full-spec (long multi-part reason)", () => {
    const r = routeRequest(
      "please go through every page on the site one by one and make sure each section reads clearly then double check the links all point where they should then confirm the images load on slow connections then verify the forms submit without errors then ensure the contact details are current everywhere and let me know what you find at the very end today",
    );
    expect(r.mode).toBe("full-spec");
    expect(r.reason).toContain("long, multi-part");
  });
});
