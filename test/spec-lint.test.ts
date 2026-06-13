import { describe, it, expect } from "vitest";
import { findDangling, specRefs, dedupeRefs, type RefOwner } from "../src/engine/spec/lint.js";
import type { Requirement } from "../src/engine/spec/ears.js";

const reader = (files: Record<string, string>) => (rel: string) => files[rel];

describe("findDangling — catch a renamed/removed test before a run (FEAT-LINT-01)", () => {
  const files = {
    "test/auth.test.ts": `it("rejects an expired token", () => {});\nit("clears the cookie", () => {});`,
  };

  it("flags a ref whose file is missing", () => {
    const r = findDangling(
      [{ owner: "REQUIREMENT_X-01", ref: "test/gone.test.ts::whatever" }],
      reader(files),
    );
    expect(r).toEqual([
      { owner: "REQUIREMENT_X-01", ref: "test/gone.test.ts::whatever", reason: "file-missing" },
    ]);
  });

  it("flags a ref whose test NAME no longer appears in the file (a rename)", () => {
    const r = findDangling([{ owner: "task T", ref: "test/auth.test.ts::clears the cooky" }], reader(files));
    expect(r).toEqual([
      { owner: "task T", ref: "test/auth.test.ts::clears the cooky", reason: "name-missing" },
    ]);
  });

  it("passes a ref whose file and name both resolve", () => {
    expect(
      findDangling([{ owner: "R", ref: "test/auth.test.ts::rejects an expired token" }], reader(files)),
    ).toEqual([]);
  });

  it("passes a file-only ref when the file exists", () => {
    expect(findDangling([{ owner: "R", ref: "test/auth.test.ts" }], reader(files))).toEqual([]);
  });

  it("skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)", () => {
    expect(findDangling([{ owner: "R", ref: "SessionTest#idleTimeout" }], reader(files))).toEqual([]);
  });
});

describe("specRefs / dedupeRefs — collect bindings, ADR exempt, no double-report", () => {
  const reqs: Requirement[] = [
    {
      id: "REQUIREMENT_A-01",
      title: "a",
      criteria: [
        {
          id: "A-01-AC1",
          pattern: "event",
          text: "WHEN x THEN SHALL y",
          checks: [{ kind: "unit", ref: "test/a.test.ts::one" }],
        },
      ],
    },
    {
      id: "ADR_A-02",
      title: "a decision",
      criteria: [
        {
          id: "A-02-AC1",
          pattern: "ubiquitous",
          text: "SHALL z",
          checks: [{ kind: "unit", ref: "test/never.test.ts::x" }],
        },
      ],
    },
  ];

  it("collects requirement refs but skips ADR decision records", () => {
    expect(specRefs(reqs)).toEqual([{ owner: "REQUIREMENT_A-01", ref: "test/a.test.ts::one" }]);
  });

  it("dedupes by ref, keeping the first owner (spec before task)", () => {
    const refs: RefOwner[] = [
      { owner: "REQUIREMENT_A-01", ref: "test/a.test.ts::one" },
      { owner: "task REQUIREMENT_A-01", ref: "test/a.test.ts::one" },
    ];
    expect(dedupeRefs(refs)).toEqual([{ owner: "REQUIREMENT_A-01", ref: "test/a.test.ts::one" }]);
  });
});
