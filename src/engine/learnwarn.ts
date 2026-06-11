/**
 * LEARN-01 — warn-on-repeat. The ledger's own doctrine: "logged-but-unpromoted lessons recur."
 * So OPEN lessons surface at task start, BEFORE the same mistake is made again. Promoted/hardened
 * lessons never warn — their check already guards.
 */

export interface LessonEntry {
  title: string;
  body: string;
  open: boolean;
}

export function parseLearnings(text: string): LessonEntry[] {
  const entries: LessonEntry[] = [];
  const parts = text.split(/^## /m).slice(1); // drop the file header
  for (const part of parts) {
    const [titleLine, ...rest] = part.split("\n");
    const body = rest.join("\n");
    const promoted = /Promoted to:\s*(check:|laws#|constitution#|.*HARDENED|.*APPROVED|DONE)/i.test(body);
    const open = /Promoted to:.*OPEN/i.test(body) || !promoted;
    entries.push({ title: (titleLine ?? "").trim(), body, open });
  }
  return entries;
}

const STOP = new Set(["must", "never", "always", "their", "about", "after", "before", "which", "every", "lesson", "trigger"]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9-]+/)
      .filter((w) => w.length > 4 && !STOP.has(w)),
  );
}

/** Open lessons whose TITLE overlaps the task's words — title is the lesson's signature. */
export function matchOpenLessons(entries: LessonEntry[], taskWords: string): LessonEntry[] {
  const hay = tokens(taskWords);
  return entries.filter((e) => {
    if (!e.open) return false;
    const sig = tokens(e.title);
    for (const w of sig) if (hay.has(w)) return true;
    return false;
  });
}
