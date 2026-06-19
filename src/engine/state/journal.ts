import { appendFileSync, existsSync, readFileSync, mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { withLock } from "../lock.js";

/** SCALE-01: per-process read cache keyed by (size, mtime) — a command that folds the journal
 *  several times reads the file once. Appends invalidate; growth from other processes is detected
 *  by the stat key. */
const readCache = new Map<string, { size: number; mtimeMs: number; events: JournalEvent[] }>();

/**
 * The append-only action journal — dev-spec-kit's "never loses its place" spine.
 *
 * Every meaningful action (task transitions, check runs, approvals) is one JSON line in
 * `.dev-spec-kit/journal.jsonl`, committed to git so a fresh clone resumes exactly. State is never stored
 * mutably: it is *folded* from the journal, so boards are generated from ground truth, never claimed.
 */

export type JournalEventType =
  | "task.created"
  | "task.status"
  | "task.bindings"
  | "check.run"
  | "verify.run"
  | "approval.recorded"
  | "cli.run"
  | "governance"
  | "note";

/** AUDIT-META-01: who/what acted is part of the audit trail. */
export interface EventMeta {
  /** Human or agent identity (git user.name, DEV_SPEC_KIT_ACTOR, …). */
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

  /** Append one event under a cross-process lock — concurrent waves cannot tear lines. */
  append<T>(type: JournalEventType, data: T, opts?: AppendOptions): JournalEvent<T> {
    const event: JournalEvent<T> = {
      at: (opts?.at ?? new Date()).toISOString(),
      type,
      data,
      ...(opts?.meta ? { meta: opts.meta } : {}),
    };
    mkdirSync(dirname(this.path), { recursive: true });
    withLock(this.path + ".lock", () => appendFileSync(this.path, JSON.stringify(event) + "\n"));
    readCache.delete(this.path);
    return event;
  }

  /** Read every event in order. Tolerates a missing file (fresh project) and skips corrupt lines. */
  read(): JournalEvent[] {
    if (!existsSync(this.path)) return [];
    const stat = statSync(this.path);
    const cached = readCache.get(this.path);
    if (cached && cached.size === stat.size && cached.mtimeMs === stat.mtimeMs) return cached.events;
    const out: JournalEvent[] = [];
    for (const line of readFileSync(this.path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as JournalEvent;
        if (typeof parsed.type !== "string") continue; // not an event line
        parsed.data = parsed.data ?? {}; // FIX-ROBUST-01: a data-less event must not brick folds
        out.push(parsed);
        /* c8 ignore start -- skips a torn/corrupt JSONL line (a crash mid-append); needs a real
           partial write to reproduce. Resilience by design — a bad line never poisons resume. */
      } catch {
        // A torn/corrupt line (e.g. crash mid-write) must not poison resume; skip it.
      }
      /* c8 ignore stop */
    }
    readCache.set(this.path, { size: stat.size, mtimeMs: stat.mtimeMs, events: out });
    return out;
  }

  /** Fold events into a state — the only way state is derived. */
  fold<S>(initial: S, reducer: (state: S, event: JournalEvent) => S): S {
    return this.read().reduce(reducer, initial);
  }
}
