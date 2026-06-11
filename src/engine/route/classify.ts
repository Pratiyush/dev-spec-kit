/**
 * The front door — deterministic mode routing (Kiro's {chat,do,spec} insight, engine-side).
 *
 * This heuristic provides the DEFAULT; the agent layer may override it with judgment, and
 * `mode.routing` in config decides who wins. Ceremony must stay proportional to change size —
 * the #1 practitioner complaint about every SDD tool is over-ceremony.
 */

export type Mode = "research" | "quick" | "full-spec";

export interface RouteResult {
  mode: Mode;
  reason: string;
}

const RESEARCH_RE =
  /\b(investigate|research|explain|why|understand|analy[sz]e|explore|compare|audit|review only|how does)\b/i;
const QUICK_RE =
  /\b(typo|rename|bump|tweak|small fix|quick fix|one[- ]liner|button|label|color|colour|comment|log line|spacing|padding|copy change|wording)\b/i;
const BIG_RE =
  /\b(feature|system|platform|architecture|redesign|refactor|migration|integrate|new (service|module|api|endpoint)|build (a|an|the)|implement|dashboard|pipeline)\b/i;

export function routeRequest(text: string): RouteResult {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  if (RESEARCH_RE.test(text) && !BIG_RE.test(text)) {
    return { mode: "research", reason: "asks to investigate/understand — no code change requested" };
  }
  if (QUICK_RE.test(text) && !BIG_RE.test(text)) {
    return { mode: "quick", reason: "small, localized change — fast path (still writes a test)" };
  }
  if (BIG_RE.test(text) || words > 60) {
    return {
      mode: "full-spec",
      reason: BIG_RE.test(text) ? "feature-sized scope — earns the full spec pipeline" : "long, multi-part request",
    };
  }
  if (words <= 12) {
    return { mode: "quick", reason: "short request with no feature-scope signals — fast path" };
  }
  return { mode: "full-spec", reason: "ambiguous scope — defaulting to spec-first (override with --mode)" };
}
