import { describe, it, expect } from "vitest";
import { parseSpec } from "../src/engine/spec/parse.js";
import { buildVTG, summarize } from "../src/engine/graph/build.js";
import type { Task } from "../src/engine/state/tasks.js";

const GREETING_SPEC = `# Feature: Greeting API

> User story: As an API consumer, I want a personalized greeting endpoint, so that I can verify the
> service is alive and addressing me.

## Requirement R-GREET-01 — personalized greeting

WHEN a GET request is made to \`/greet\` with a \`name\` parameter THEN the system SHALL respond \`200 OK\`
with JSON \`{"message": "Hello, <name>!"}\`.

@check kind=api ref=GreetControllerTest#greetReturnsPersonalizedMessage

## Requirement R-GREET-02 — missing name

WHEN a GET request is made to \`/greet\` without a \`name\` parameter THEN the system SHALL respond \`200 OK\`
with JSON \`{"message": "Hello, world!"}\`.

@check kind=api ref=GreetControllerTest#greetDefaultsToWorld
@check kind=unit ref=GreetControllerTest#extraProof
`;

describe("spec parser", () => {
  it("parses requirements, EARS criteria, and @check bindings from the real spec shape", () => {
    const reqs = parseSpec(GREETING_SPEC);
    expect(reqs.map((r) => r.id)).toEqual(["R-GREET-01", "R-GREET-02"]);
    expect(reqs[0]!.title).toBe("personalized greeting");

    const c1 = reqs[0]!.criteria[0]!;
    expect(c1.pattern).toBe("event"); // WHEN ... SHALL
    expect(c1.checks).toEqual([{ kind: "api", ref: "GreetControllerTest#greetReturnsPersonalizedMessage" }]);

    // Consecutive @check lines bind extra proofs to the same criterion.
    const c2 = reqs[1]!.criteria[0]!;
    expect(c2.checks.map((c) => c.ref)).toEqual([
      "GreetControllerTest#greetDefaultsToWorld",
      "GreetControllerTest#extraProof",
    ]);
    expect(c2.checks[1]!.kind).toBe("unit");
  });
});

describe("VTG overlay builder", () => {
  const task = (results: Task["results"]): Task => ({
    id: "T1",
    title: "t",
    status: "in_progress",
    boundChecks: Object.keys(results),
    results,
  });

  it("maps journal results to proof states incl. stale-on-SHA-mismatch (drift)", () => {
    const reqs = parseSpec(GREETING_SPEC);
    const vtg = buildVTG({
      requirements: reqs,
      currentSha: "HEAD000",
      tasks: [
        task({
          "GreetControllerTest#greetReturnsPersonalizedMessage": {
            ref: "GreetControllerTest#greetReturnsPersonalizedMessage",
            passed: true,
            at: "2026-06-11T10:00:00Z",
            sha: "OLD111", // proof predates HEAD -> stale
          },
          "GreetControllerTest#greetDefaultsToWorld": {
            ref: "GreetControllerTest#greetDefaultsToWorld",
            passed: true,
            at: "2026-06-11T10:00:00Z",
            sha: "HEAD000", // proof at HEAD -> green
          },
          // extraProof never ran -> unproven
        }),
      ],
    });
    const s = summarize(vtg);
    expect(s.requirements).toBe(2);
    expect(s.tests).toBe(3);
    expect(s.validates).toEqual({ green: 1, stale: 1, unproven: 1, red: 0 });
  });

  it("anchors test nodes to graphify code nodes by class-file label", () => {
    const reqs = parseSpec(GREETING_SPEC);
    const vtg = buildVTG({
      requirements: reqs,
      tasks: [],
      codeGraph: {
        nodes: [
          { id: "rivet_example_greetcontrollertest", kind: "codeNode", label: "GreetControllerTest.java" },
        ],
        links: [],
      },
    });
    const anchor = vtg.edges.find(
      (e) => e.kind === "dependsOn" && e.to === "rivet_example_greetcontrollertest",
    );
    expect(anchor).toBeDefined();
    expect(anchor!.from).toBe("test:GreetControllerTest#greetReturnsPersonalizedMessage");
  });
});
