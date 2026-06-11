import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { classifyEars, type AcceptanceCriterion, type CheckBinding, type CheckKind, type Requirement } from "./ears.js";

/**
 * Spec-file parser — reads `.rivet/specs/*.md` into Requirements with EARS criteria and `@check`
 * bindings. Markdown stays the human-editable source of truth; this parser is how it becomes
 * machine state (tasks, graph nodes, proof obligations).
 *
 * FIX-PARSE-01 rules: fenced code blocks are invisible; a blank line separates criteria (no silent
 * merge); list markers before `@check` are stripped; an orphan `@check` is WARNED about — silent
 * loss of a proof obligation is the worst parser failure.
 *
 * Recognized shapes:
 *   ## Requirement R-ID — Title        (em/en dash or hyphen)
 *   <EARS sentence lines...>
 *   @check kind=<kind> ref=<ref>       (also as a "- @check ..." bullet)
 */

const REQ_HEADING = /^##\s+Requirement:?\s+([A-Za-z][A-Za-z0-9_-]*)\s*(?:[—–-]\s*(.*))?$/;
// [a-z0-9]: 'e2e' carries a digit — a kind pattern of [a-z]+ silently dropped e2e bindings (real
// bug caught by the RUNNERS-01 suite; "silent loss of a proof obligation is the worst parser failure").
const CHECK_LINE = /^@check\s+kind=([a-z0-9]+)\s+ref=(.+)$/i;
const FENCE = /^(```|~~~)/;
const LIST_MARKER = /^(?:[-*+]|\d+\.)\s+/;
const CHECK_KINDS: ReadonlySet<string> = new Set(["unit", "integration", "api", "e2e", "visual", "parity"]);

export function parseSpec(content: string, warnings?: string[]): Requirement[] {
  const requirements: Requirement[] = [];
  let current: Requirement | null = null;
  let textLines: string[] = [];
  let inFence = false;

  const flushCriterion = (req: Requirement, checks: CheckBinding[]) => {
    const text = textLines.join(" ").replace(/\s+/g, " ").trim();
    textLines = [];
    if (!text) return;
    const criterion: AcceptanceCriterion = {
      id: `${req.id}-AC${req.criteria.length + 1}`,
      pattern: classifyEars(text),
      text,
      checks,
    };
    req.criteria.push(criterion);
  };

  for (const raw of content.split(/\r?\n/)) {
    let line = raw.trim();
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue; // examples are not obligations

    const heading = line.match(REQ_HEADING);
    if (heading) {
      if (current) flushCriterion(current, []);
      current = { id: heading[1]!, title: (heading[2] ?? heading[1]!).trim(), criteria: [] };
      requirements.push(current);
      continue;
    }
    if (!current) continue; // preamble (feature title, user story note, prose)

    // A bullet may carry the @check; strip the marker before matching.
    const unbulleted = line.replace(LIST_MARKER, "");
    const check = unbulleted.match(CHECK_LINE);
    if (check) {
      const kindRaw = check[1]!.toLowerCase();
      const kind = (CHECK_KINDS.has(kindRaw) ? kindRaw : "unit") as CheckKind;
      const pending: CheckBinding = { kind, ref: check[2]!.trim() };
      if (textLines.length > 0) {
        flushCriterion(current, [pending]);
      } else if (current.criteria.length > 0) {
        // Consecutive/post-blank @check lines bind additional proofs to the last criterion.
        current.criteria[current.criteria.length - 1]!.checks.push(pending);
      } else {
        warnings?.push(
          `orphan @check '${pending.ref}' in requirement ${current.id} — no criterion above it; binding DROPPED`,
        );
      }
      continue;
    }
    if (line.startsWith("#") || line.startsWith(">")) continue; // other headings / quotes
    if (line) {
      textLines.push(line);
    } else if (textLines.length > 0) {
      // Blank line ends the current criterion — two EARS sentences must never silently merge.
      flushCriterion(current, []);
    }
  }
  if (current) flushCriterion(current, []);
  return requirements;
}

/** Parse every spec file in a project's `.rivet/specs/` directory. */
export function parseSpecsDir(projectDir: string, warnings?: string[]): Requirement[] {
  const dir = join(projectDir, ".rivet", "specs");
  if (!existsSync(dir)) return [];
  const out: Requirement[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const fileWarnings: string[] = [];
    out.push(...parseSpec(readFileSync(join(dir, f), "utf8"), fileWarnings));
    warnings?.push(...fileWarnings.map((w) => `${f}: ${w}`));
  }
  return out;
}
