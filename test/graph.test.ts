import { describe, it, expect } from "vitest";
import {
  unimplementedRequirements,
  untestedCriteria,
  blastRadius,
  driftedEdges,
  type VerifiedTraceabilityGraph,
} from "../src/engine/graph/types.js";
import {
  classifyEars,
  looksLikeEars,
  unverifiedCriteria,
  type Requirement,
} from "../src/engine/spec/ears.js";

const graph: VerifiedTraceabilityGraph = {
  nodes: [
    { id: "R1", kind: "requirement", label: "Idle session expiry" },
    { id: "R2", kind: "requirement", label: "Login" },
    { id: "AC1", kind: "acceptanceCriterion", label: "idle timeout" },
    { id: "AC2", kind: "acceptanceCriterion", label: "happy path" },
    { id: "C1", kind: "codeNode", label: "SessionService" },
    { id: "T1", kind: "test", label: "session_test" },
  ],
  edges: [
    { id: "e1", from: "C1", to: "R1", kind: "implements", proof: "green" },
    { id: "e2", from: "T1", to: "AC1", kind: "validates", proof: "green" },
    { id: "e3", from: "C1", to: "R2", kind: "implements", proof: "red" },
    // AC2 has no validates edge at all
  ],
};

describe("Verified Traceability Graph queries", () => {
  it("flags requirements with no green implements edge", () => {
    const ids = unimplementedRequirements(graph).map((n) => n.id);
    expect(ids).toContain("R2"); // only a red edge proves it
    expect(ids).not.toContain("R1"); // green
  });

  it("flags acceptance criteria with no green validates edge", () => {
    const ids = untestedCriteria(graph).map((n) => n.id);
    expect(ids).toContain("AC2"); // no edge at all
    expect(ids).not.toContain("AC1"); // green
  });

  it("computes blast radius for a code node", () => {
    const ids = blastRadius(graph, "C1")
      .map((e) => e.id)
      .sort();
    expect(ids).toEqual(["e1", "e3"]);
  });

  it("reports drifted (red/stale) proven edges", () => {
    expect(driftedEdges(graph).map((e) => e.id)).toEqual(["e3"]);
  });
});

describe("EARS", () => {
  it("classifies EARS patterns", () => {
    expect(classifyEars("WHEN a session is idle 30m THEN the system SHALL return 401")).toBe("event");
    expect(classifyEars("IF the token is invalid THEN the system SHALL reject the request")).toBe("unwanted");
    expect(classifyEars("The system SHALL log every request")).toBe("ubiquitous");
  });

  it("recognises EARS sentences", () => {
    expect(looksLikeEars("The system SHALL persist the session")).toBe(true);
    expect(looksLikeEars("just a note")).toBe(false);
  });

  it("flags criteria with no bound check as unverified", () => {
    const reqs: Requirement[] = [
      {
        id: "R1",
        title: "Sessions",
        criteria: [
          {
            id: "AC1",
            pattern: "event",
            text: "WHEN x THEN the system SHALL y",
            checks: [{ kind: "unit", ref: "a::b" }],
          },
          { id: "AC2", pattern: "ubiquitous", text: "The system SHALL z", checks: [] },
        ],
      },
    ];
    expect(unverifiedCriteria(reqs).map((c) => c.id)).toEqual(["AC2"]);
  });
});
