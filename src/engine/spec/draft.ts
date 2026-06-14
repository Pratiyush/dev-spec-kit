import { requirementKind, type Requirement } from "./ears.js";

/**
 * FEAT-DRAFT-01 — the rule→test→proof loop the config already promises (`acceptanceCriteria:
 * "tool-drafts"`) but never delivered: there was no drafter. For each UNBOUND criterion this emits a
 * FAILING test stub already bound by a generated `@check`, so the obligation is real (red) until the
 * agent fills the body. The stub carries the criterion text + the 4-category edge-case mandate
 * (happy · invalid input · empty/boundary · failure-injection) so the drafted test is descriptive,
 * not a bare placeholder. Pure core: `draftStubs` returns the plan; the CLI writes the files.
 */

export interface DraftStub {
  reqId: string;
  critId: string;
  critText: string;
  /** target test file derived from the requirement's AREA, e.g. REQUIREMENT_AUTH-01 -> test/auth.test.ts */
  file: string;
  /** descriptive `it(...)` name derived from the criterion's SHALL/THEN clause. */
  name: string;
  /** the `@check` ref to add to the spec: `<file>::<name>`. */
  checkRef: string;
}

/** REQUIREMENT_AUTH-01 / NFR_PERF-02 -> the AREA slug ("auth" / "perf"); falls back to the whole id. */
export function areaSlug(reqId: string): string {
  const m = reqId.match(/_([A-Za-z0-9]+)-\d+/);
  const raw = m?.[1] ?? reqId;
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "drafted";
}

/** A readable test name from a criterion: the SHALL/THEN clause, minus "the system", clipped. */
export function deriveTestName(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  const shall = t.match(/\bSHALL\s+(NOT\s+)?(.+)/i);
  const then = t.match(/\bTHEN\b\s+(.+)/i);
  let phrase = shall ? `${shall[1] ? "does not " : ""}${shall[2]}` : (then?.[1] ?? t);
  phrase = phrase
    .replace(/^the system\s+/i, "")
    .replace(/[.\s]+$/, "")
    .trim();
  return phrase.length > 80 ? `${phrase.slice(0, 77)}...` : phrase || "behaves as specified";
}

/** Plan a failing, bound stub for every unbound criterion (ADR records carry no obligation). */
export function draftStubs(reqs: Requirement[]): DraftStub[] {
  const out: DraftStub[] = [];
  for (const r of reqs) {
    if (requirementKind(r.id) === "adr") continue;
    const file = `test/${areaSlug(r.id)}.test.ts`;
    for (const c of r.criteria) {
      if (c.checks.length > 0) continue; // already bound — nothing to draft
      const name = deriveTestName(c.text);
      out.push({ reqId: r.id, critId: c.id, critText: c.text, file, name, checkRef: `${file}::${name}` });
    }
  }
  return out;
}

/** The vitest `it(...)` block for a stub — fails until implemented, carries the edge-case mandate. */
export function stubBlock(stub: DraftStub): string {
  const text = stub.critText.replace(/\s+/g, " ").trim();
  return [
    `  it(${JSON.stringify(stub.name)}, () => {`,
    `    // TODO(draft ${stub.critId}): ${text}`,
    `    // cover the unhappy paths too: invalid input · empty/boundary · failure-injection`,
    `    expect.fail(${JSON.stringify(`drafted stub — implement ${stub.critId}`)});`,
    `  });`,
  ].join("\n");
}

/** A `describe(reqId) { ...stubs... }` block for the stubs of one requirement in one file. */
export function describeBlock(reqId: string, stubs: DraftStub[]): string {
  return [`describe(${JSON.stringify(reqId)}, () => {`, stubs.map(stubBlock).join("\n\n"), `});`].join("\n");
}
