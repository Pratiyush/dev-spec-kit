/**
 * EARS — Easy Approach to Requirements Syntax.
 *
 * The formal-but-readable acceptance-criteria syntax Rivet uses (Kiro's signature, adopted here and
 * made *verifiable*): WHEN/IF/WHILE/WHERE ... the system SHALL ... Each criterion carries one or more
 * `@check` bindings to executable checks — a criterion with no binding is UNVERIFIED and gets flagged.
 */

/** EARS clause patterns. */
export type EarsPattern = "ubiquitous" | "event" | "state" | "optional" | "unwanted" | "complex";

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

/** A criterion is verifiable only if it binds to at least one executable check. */
export function isVerifiable(c: AcceptanceCriterion): boolean {
  return c.checks.length > 0;
}

/** Criteria across the given requirements that have no bound check — must be flagged UNVERIFIED. */
export function unverifiedCriteria(reqs: Requirement[]): AcceptanceCriterion[] {
  return reqs.flatMap((r) => r.criteria).filter((c) => !isVerifiable(c));
}

const EARS_PATTERNS: ReadonlyArray<[EarsPattern, RegExp]> = [
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
