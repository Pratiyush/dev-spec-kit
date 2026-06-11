import { appendFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * The append-only action journal — Rivet's "never loses its place" spine.
 *
 * Every meaningful action (task transitions, check runs, approvals) is one JSON line in
 * `.rivet/journal.jsonl`, committed to git so a fresh clone resumes exactly. State is never stored
 * mutably: it is *folded* from the journal, so boards are generated from ground truth, never claimed.
 */

export type JournalEventType =
  | "task.created"
  | "task.status"
  | "task.bindings"
  | "check.run"
  | "approval.recorded"
  | "cli.run"
  | "governance"
  | "note";

/** AUDIT-META-01: who/what acted is part of the audit trail. */
export interface EventMeta {
  /** Human or agent identity (git user.name, RIVET_ACTOR, …). */
  actor?: string;
  /** Model id when an AI performed the action. */
  model?: string;
  /** Context sources consulted (files, tickets, URLs). */
  sources?: string[];
}

export interface JournalEvent<T = unknown> {
  /** ISO timestamp. */
  at: string;
  type: JournalEventType;
  data: T;
  meta?: EventMeta;
}

export interface AppendOptions {
  at?: Date;
  meta?: EventMeta;
}

export class Journal {
  constructor(private readonly path: string) {}

  /** Append one event (atomic enough for a single-writer CLI; one line per event). */
  append<T>(type: JournalEventType, data: T, opts?: AppendOptions): JournalEvent<T> {
    const event: JournalEvent<T> = {
      at: (opts?.at ?? new Date()).toISOString(),
      type,
      data,
      ...(opts?.meta ? { meta: opts.meta } : {}),
    };
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, JSON.stringify(event) + "\n");
    return event;
  }

  /** Read every event in order. Tolerates a missing file (fresh project) and skips corrupt lines. */
  read(): JournalEvent[] {
    if (!existsSync(this.path)) return [];
    const out: JournalEvent[] = [];
    for (const line of readFileSync(this.path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as JournalEvent;
        if (typeof parsed.type !== "string") continue; // not an event line
        parsed.data = parsed.data ?? {}; // FIX-ROBUST-01: a data-less event must not brick folds
        out.push(parsed);
      } catch {
        // A torn/corrupt line (e.g. crash mid-write) must not poison resume; skip it.
      }
    }
    return out;
  }

  /** Fold events into a state — the only way state is derived. */
  fold<S>(initial: S, reducer: (state: S, event: JournalEvent) => S): S {
    return this.read().reduce(reducer, initial);
  }
}
