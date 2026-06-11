import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { classifyEars, type AcceptanceCriterion, type CheckBinding, type CheckKind, type Requirement } from "./ears.js";

/**
 * Spec-file parser — reads `.rivet/specs/*.md` into Requirements with EARS criteria and `@check`
 * bindings. Markdown stays the human-editable source of truth; this parser is how it becomes
 * machine state (tasks, graph nodes, proof obligations).
 *
 * Recognized shapes:
 *   ## Requirement R-ID — Title        (em/en dash or hyphen)
 *   <EARS sentence lines...>
 *   @check kind=<kind> ref=<ref>
 */

const REQ_HEADING = /^##\s+Requirement:?\s+([A-Za-z][A-Za-z0-9_-]*)\s*(?:[—–-]\s*(.*))?$/;
const CHECK_LINE = /^@check\s+kind=([a-z]+)\s+ref=(.+)$/i;
const CHECK_KINDS: ReadonlySet<string> = new Set(["unit", "integration", "api", "e2e", "visual", "parity"]);

export function parseSpec(content: string): Requirement[] {
  const requirements: Requirement[] = [];
  let current: Requirement | null = null;
  let textLines: string[] = [];

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
    const line = raw.trim();
    const heading = line.match(REQ_HEADING);
    if (heading) {
      if (current) flushCriterion(current, []);
      current = { id: heading[1]!, title: (heading[2] ?? heading[1]!).trim(), criteria: [] };
      requirements.push(current);
      continue;
    }
    if (!current) continue; // preamble (feature title, user story note, prose)

    const check = line.match(CHECK_LINE);
    if (check) {
      const kindRaw = check[1]!.toLowerCase();
      const kind = (CHECK_KINDS.has(kindRaw) ? kindRaw : "unit") as CheckKind;
      // A @check closes the criterion accumulated above it.
      const pending: CheckBinding = { kind, ref: check[2]!.trim() };
      if (textLines.length > 0) {
        flushCriterion(current, [pending]);
      } else if (current.criteria.length > 0) {
        // Consecutive @check lines bind additional proofs to the same criterion.
        current.criteria[current.criteria.length - 1]!.checks.push(pending);
      }
      continue;
    }
    if (line.startsWith("#") || line.startsWith(">")) continue; // other headings / quotes
    if (line) textLines.push(line);
    else if (textLines.length > 0 && current.criteria.length === 0) {
      // blank line inside requirement body before any @check: keep accumulating (EARS may wrap)
    }
  }
  if (current) flushCriterion(current, []);
  return requirements;
}

/** Parse every spec file in a project's `.rivet/specs/` directory. */
export function parseSpecsDir(projectDir: string): Requirement[] {
  const dir = join(projectDir, ".rivet", "specs");
  if (!existsSync(dir)) return [];
  const out: Requirement[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    out.push(...parseSpec(readFileSync(join(dir, f), "utf8")));
  }
  return out;
}
