/**
 * EARS — Easy Approach to Requirements Syntax.
 *
 * The formal-but-readable acceptance-criteria syntax Rivet uses (Kiro's signature, adopted here and
 * made *verifiable*): WHEN/IF/WHILE/WHERE ... the system SHALL ... Each criterion carries one or more
 * `@check` bindings to executable checks — a criterion with no binding is UNVERIFIED and gets flagged.
 */

/** EARS clause patterns, plus "gherkin" for Given/When/Then criteria (FEAT-GHERKIN-01). */
export type EarsPattern = "ubiquitous" | "event" | "state" | "optional" | "unwanted" | "complex" | "gherkin";

export type CheckKind = "unit" | "integration" | "api" | "e2e" | "visual" | "parity";

/** A binding from an acceptance criterion to an executable check (the criterion↔check edge). */
export interface CheckBinding {
  kind: CheckKind;
  /** test id / "file::test" / a property description. */
  ref: string;
}

export interface AcceptanceCriterion {
  /** Stable id, e.g. "R-AUTH-03". */
  id: string;
  pattern: EarsPattern;
  /** The full EARS sentence. */
  text: string;
  /** Executable checks bound to this criterion. Empty => UNVERIFIED (flagged, FLOOR C). */
  checks: CheckBinding[];
}

export interface UserStory {
  role: string;
  want: string;
  benefit: string;
}

export interface Requirement {
  id: string;
  title: string;
  story?: UserStory;
  criteria: AcceptanceCriterion[];
}

/**
 * FEAT-IDS-01 — ids travel without their spec (PR bodies, boards, chat), so the prefix must carry
 * the noun. REQUIREMENT_ and NFR_ carry full proof obligations; ADR_ is a decision record — a
 * first-class graph node with NO check obligation (decisions are recorded, not unit-tested).
 */
export type RequirementKind = "requirement" | "nfr" | "adr";

export const QUALIFIED_PREFIXES = ["REQUIREMENT_", "NFR_", "ADR_"] as const;

export function isQualifiedId(id: string): boolean {
  return QUALIFIED_PREFIXES.some((p) => id.startsWith(p));
}

export function requirementKind(id: string): RequirementKind {
  if (id.startsWith("NFR_")) return "nfr";
  if (id.startsWith("ADR_")) return "adr";
  return "requirement";
}

/** Lint messages for unqualified ids, each with the fix-it suggestion. Severity is the caller's
 *  call (`rules.requireQualifiedIds`: warn | error | off). */
export function lintQualifiedIds(reqs: Requirement[]): string[] {
  return reqs
    .filter((r) => !isQualifiedId(r.id))
    .map(
      (r) =>
        `${r.id} — not fully qualified; use REQUIREMENT_${r.id.replace(/^R-/, "")} ` +
        `(prefixes: ${QUALIFIED_PREFIXES.join(" / ")})`,
    );
}

/** Unbound criteria that actually carry a proof obligation (ADR decision records are exempt). */
export function unboundObligations(reqs: Requirement[]): AcceptanceCriterion[] {
  return reqs
    .filter((r) => requirementKind(r.id) !== "adr")
    .flatMap((r) => r.criteria.filter((c) => c.checks.length === 0));
}

/** A criterion is verifiable only if it binds to at least one executable check. */
export function isVerifiable(c: AcceptanceCriterion): boolean {
  return c.checks.length > 0;
}

/** Criteria across the given requirements that have no bound check — must be flagged UNVERIFIED. */
export function unverifiedCriteria(reqs: Requirement[]): AcceptanceCriterion[] {
  return reqs.flatMap((r) => r.criteria).filter((c) => !isVerifiable(c));
}

/** RUNNERS-01: the spec is where a ref's kind lives — execution looks it up here. */
export function kindForRef(reqs: Requirement[], ref: string): CheckKind | undefined {
  for (const r of reqs) for (const c of r.criteria) for (const ch of c.checks) if (ch.ref === ref) return ch.kind;
  return undefined;
}

const EARS_PATTERNS: ReadonlyArray<[EarsPattern, RegExp]> = [
  // Gherkin first: a GIVEN…WHEN…THEN sentence is a scenario, even when it also says SHALL.
  ["gherkin", /\bGIVEN\b[\s\S]*\bWHEN\b[\s\S]*\bTHEN\b/i],
  ["complex", /\bWHEN\b.*\bWHILE\b|\bWHILE\b.*\bWHEN\b/i],
  ["unwanted", /^\s*IF\b.*\bTHEN\b.*\bSHALL\b/i],
  ["event", /^\s*WHEN\b.*\bSHALL\b/i],
  ["state", /^\s*WHILE\b.*\bSHALL\b/i],
  ["optional", /^\s*WHERE\b.*\bSHALL\b/i],
  ["ubiquitous", /\bSHALL\b/i],
];

/** Best-effort classification of an EARS sentence into its pattern. */
export function classifyEars(text: string): EarsPattern {
  for (const [pattern, re] of EARS_PATTERNS) {
    if (re.test(text)) return pattern;
  }
  return "ubiquitous";
}

/** Does the sentence look like valid EARS (contains a SHALL response clause)? */
export function looksLikeEars(text: string): boolean {
  return /\bSHALL\b/i.test(text);
}

/**
 * FEAT-GHERKIN-01 — the mechanical edge-case floor needs to recognize a "negative" criterion:
 * an EARS unwanted-pattern (IF…THEN…SHALL) or any criterion whose text names a failure mode.
 * Keyword-based on purpose: cheap, explainable, and tunable here when a word proves noisy.
 */
const NEGATIVE_RE =
  /\b(fail(s|ed|ure)?|error|invalid|reject(s|ed)?|den(y|ies|ied)|empty|missing|timeout|expir(e|es|ed)|wrong|unauthori[sz]ed|forbidden|cannot|can't|blocked|not|never|no)\b/i;

export function isNegativeCriterion(c: AcceptanceCriterion): boolean {
  return c.pattern === "unwanted" || NEGATIVE_RE.test(c.text);
}

/**
 * Off-format lint (warn-only, never blocks): both grammars always parse and bind; this just keeps a
 * project's declared `spec.criteriaFormat` honest. "mixed"/"plain" accept everything; ADRs exempt.
 */
export function lintCriteriaFormat(reqs: Requirement[], format: string): string[] {
  if (format !== "gherkin" && format !== "ears") return [];
  const out: string[] = [];
  for (const r of reqs) {
    if (requirementKind(r.id) === "adr") continue;
    for (const c of r.criteria) {
      if (format === "gherkin" && c.pattern !== "gherkin") {
        out.push(`${c.id}: EARS/plain criterion in a gherkin project — write a Scenario or set spec.criteriaFormat="mixed"`);
      } else if (format === "ears" && c.pattern === "gherkin") {
        out.push(`${c.id}: gherkin Scenario in an ears project — use WHEN/IF…SHALL or set spec.criteriaFormat="mixed"`);
      }
    }
  }
  return out;
}
