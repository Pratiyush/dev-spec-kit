import { requirementKind, type Requirement } from "./ears.js";
import { splitRef } from "../verify/report.js";

/**
 * FEAT-LINT-01 — static drift detection. The dogfood lesson: a renamed test left a `@check` ref
 * pointing at a name that no longer exists, and Rivet only noticed on a check run — where a bad
 * match can silently pass (now fixed by FIX-TRUST-01, but the binding was still rotten). A STATIC
 * lint catches it before any run: grep the test literal, flag the orphan. (OpenFastTrace's model:
 * ORPHANED = a reference to something that doesn't exist; UNCOVERED = an obligation with no check.)
 *
 * Pure core: `findDangling` takes {owner, ref} pairs + an injected file reader so the resolution
 * rules are unit-testable without a filesystem.
 */

export interface RefOwner {
  /** who declares this ref — a requirement id, or `task <id>`. */
  owner: string;
  ref: string;
}

export interface DanglingFinding {
  owner: string;
  ref: string;
  reason: "file-missing" | "name-missing";
}

/** Only refs that name a file we could read (an extension or a path) are statically resolvable;
 *  selector-only refs like maven `Class#method` or a bare property description are skipped. */
function looksLikeFileRef(file: string): boolean {
  return /[./]/.test(file);
}

export function findDangling(
  refs: RefOwner[],
  readFile: (rel: string) => string | undefined,
): DanglingFinding[] {
  const out: DanglingFinding[] = [];
  for (const { owner, ref } of refs) {
    const [file, name] = splitRef(ref);
    if (!looksLikeFileRef(file)) continue;
    const text = readFile(file);
    if (text === undefined) {
      out.push({ owner, ref, reason: "file-missing" });
      continue;
    }
    // The test literal must still appear in the file — catches a rename before a run. A name absent
    // from its file is a dangling binding (the renamed/deleted test); presence is good enough signal.
    if (name !== undefined && !text.includes(name)) out.push({ owner, ref, reason: "name-missing" });
  }
  return out;
}

/** Every {owner, ref} a spec contributes via `@check` bindings (ADR requirements carry no obligation). */
export function specRefs(reqs: Requirement[]): RefOwner[] {
  const out: RefOwner[] = [];
  for (const r of reqs) {
    if (requirementKind(r.id) === "adr") continue;
    for (const c of r.criteria) for (const ch of c.checks) out.push({ owner: r.id, ref: ch.ref });
  }
  return out;
}

/** De-duplicate refs by ref string, keeping the first owner seen (spec owners are added first). */
export function dedupeRefs(refs: RefOwner[]): RefOwner[] {
  const seen = new Map<string, RefOwner>();
  for (const r of refs) if (!seen.has(r.ref)) seen.set(r.ref, r);
  return [...seen.values()];
}
