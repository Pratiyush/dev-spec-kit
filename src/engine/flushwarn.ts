/**
 * FEAT-FLUSH-01 — "flush session lessons before PR" (standing user rule, tool-ified).
 * A session is the trailing run of journal events with no gap over `gapMinutes`; the ledger
 * (.dev-spec-kit/learnings.md) must have been touched during it, or `dev-spec-kit pr` prints the 📝 warning.
 * Warning only — some sessions genuinely teach nothing; the human stays the judge.
 */

export function sessionStart(events: ReadonlyArray<{ at: string }>, gapMinutes = 30): string | undefined {
  if (events.length === 0) return undefined;
  let start = events[events.length - 1]!.at;
  for (let i = events.length - 1; i > 0; i--) {
    const gap = Date.parse(events[i]!.at) - Date.parse(events[i - 1]!.at);
    if (gap > gapMinutes * 60_000) return start;
    start = events[i - 1]!.at;
  }
  return start;
}

export function needsFlush(events: ReadonlyArray<{ at: string }>, ledgerMtimeIso: string): boolean {
  const start = sessionStart(events);
  if (!start) return false;
  return Date.parse(ledgerMtimeIso) < Date.parse(start);
}
