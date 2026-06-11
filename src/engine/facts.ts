/**
 * GATE-FACTS-01 — DENY→FORCE→ALLOW (ECC GateGuard mechanic, A/B-evidenced: gated 9.0 vs 6.75).
 *
 * The first edit to a file is DENIED with a demand for named facts; the retry (after the agent has
 * gathered them — the investigation itself creates the context that changes the output) is ALLOWED
 * within a 30-minute window. Opt-in via config `gates.facts: "on"`. State is bounded (500 entries)
 * and lives in .rivet/cache/ (gitignored). hooks/guard-facts.mjs mirrors this — keep in sync.
 */

const WINDOW_MS = 30 * 60_000;
const CAP = 500;

export interface FactsEntry {
  allowedUntil: number;
}

export interface FactsState {
  entries: Record<string, FactsEntry>;
}

export interface FactsVerdict {
  deny: boolean;
  state: FactsState;
  /** The facts the agent must present before retrying (set when denied). */
  demand?: string[];
}

export function factsDemand(file: string): string[] {
  return [
    `list every importer/usage of ${file} (grep it, or run: rivet affected <symbol>)`,
    "name the requirement id + criterion this edit serves (quote the EARS sentence)",
    "quote the user's current instruction verbatim",
    "then retry the edit — it will be allowed for 30 minutes",
  ];
}

export function factsVerdict(state: FactsState, file: string, now: number): FactsVerdict {
  const entry = state.entries[file];
  if (entry && entry.allowedUntil > now) {
    return { deny: false, state };
  }
  const entries = { ...state.entries, [file]: { allowedUntil: now + WINDOW_MS } };
  const keys = Object.keys(entries);
  if (keys.length > CAP) {
    // Evict the stalest allowances — bounded state, no unbounded growth.
    keys
      .sort((a, b) => entries[a]!.allowedUntil - entries[b]!.allowedUntil)
      .slice(0, keys.length - CAP)
      .forEach((k) => delete entries[k]);
  }
  return { deny: true, state: { entries }, demand: factsDemand(file) };
}
