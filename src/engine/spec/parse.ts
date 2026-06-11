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
 *   Scenario: <name> + Given/When/Then/And/But steps          (FEAT-GHERKIN-01: one criterion)
 *   Scenario Outline: <name> + steps + Examples: |table|      (one criterion PER data row;
 *                                                               an @check below binds them ALL)
 *   @check kind=<kind> ref=<ref>       (also as a "- @check ..." bullet)
 */

const REQ_HEADING = /^##\s+Requirement:?\s+([A-Za-z][A-Za-z0-9_-]*)\s*(?:[—–-]\s*(.*))?$/;
// [a-z0-9]: 'e2e' carries a digit — a kind pattern of [a-z]+ silently dropped e2e bindings (real
// bug caught by the RUNNERS-01 suite; "silent loss of a proof obligation is the worst parser failure").
const CHECK_LINE = /^@check\s+kind=([a-z0-9]+)\s+ref=(.+)$/i;
const FENCE = /^(```|~~~)/;
const LIST_MARKER = /^(?:[-*+]|\d+\.)\s+/;
const CHECK_KINDS: ReadonlySet<string> = new Set(["unit", "integration", "api", "e2e", "visual", "parity"]);
const OUTLINE_LINE = /^Scenario\s+Outline:\s*(.+)$/i;
const SCENARIO_LINE = /^Scenario:\s*(.+)$/i;
const STEP_LINE = /^(Given|When|Then|And|But)\b/i;
const EXAMPLES_LINE = /^Examples:?\s*$/i;
const TABLE_ROW = /^\|(.+)\|\s*$/;

interface ScenarioState {
  name: string;
  steps: string[];
  outline: boolean;
  inExamples: boolean;
  header: string[] | null;
  rows: string[][];
}

export function parseSpec(content: string, warnings?: string[]): Requirement[] {
  const requirements: Requirement[] = [];
  let current: Requirement | null = null;
  let textLines: string[] = [];
  let inFence = false;
  let scenario: ScenarioState | null = null;
  // The criterion group an @check below binds to: [one EARS criterion] or ALL of an Outline's
  // expanded rows (FEAT-GHERKIN-01 — one binding under an Outline obligates every Examples row).
  let lastGroup: AcceptanceCriterion[] = [];

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
    lastGroup = [criterion];
  };

  const flushScenario = (req: Requirement) => {
    if (!scenario) return;
    const s = scenario;
    scenario = null;
    const mk = (text: string): AcceptanceCriterion => {
      const criterion: AcceptanceCriterion = {
        id: `${req.id}-AC${req.criteria.length + 1}`,
        pattern: "gherkin",
        text,
        checks: [],
      };
      req.criteria.push(criterion);
      return criterion;
    };
    if (s.outline && s.header && s.rows.length > 0) {
      lastGroup = s.rows.map((row) => {
        let steps = s.steps.join(" ");
        s.header!.forEach((h, i) => {
          steps = steps.split(`<${h}>`).join(row[i] ?? "");
        });
        const label = s.header!.map((h, i) => `${h}=${row[i] ?? ""}`).join(", ");
        return mk(`Scenario: ${s.name} (${label}) — ${steps}`);
      });
    } else {
      if (s.outline) {
        warnings?.push(`Scenario Outline '${s.name}' has no Examples rows — treated as a single criterion`);
      }
      lastGroup = [mk(`Scenario: ${s.name} — ${s.steps.join(" ")}`)];
    }
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
      if (current) {
        flushCriterion(current, []);
        flushScenario(current);
      }
      current = { id: heading[1]!, title: (heading[2] ?? heading[1]!).trim(), criteria: [] };
      requirements.push(current);
      lastGroup = []; // bindings never leak across requirements
      continue;
    }
    if (!current) continue; // preamble (feature title, user story note, prose)

    // FEAT-GHERKIN-01: Scenario / Scenario Outline open a block; steps and Examples accumulate.
    const outlineMatch = line.match(OUTLINE_LINE);
    const scenarioMatch = outlineMatch ? null : line.match(SCENARIO_LINE);
    if (outlineMatch || scenarioMatch) {
      flushCriterion(current, []);
      flushScenario(current);
      scenario = {
        name: (outlineMatch ?? scenarioMatch)![1]!.trim(),
        steps: [],
        outline: !!outlineMatch,
        inExamples: false,
        header: null,
        rows: [],
      };
      continue;
    }
    if (scenario) {
      if (scenario.outline && EXAMPLES_LINE.test(line)) {
        scenario.inExamples = true;
        continue;
      }
      const row = scenario.inExamples ? line.match(TABLE_ROW) : null;
      if (row) {
        const cells = row[1]!.split("|").map((c) => c.trim());
        if (!scenario.header) scenario.header = cells;
        else if (!cells.every((c) => /^[-: ]*$/.test(c))) scenario.rows.push(cells); // skip |---|
        continue;
      }
      if (STEP_LINE.test(line)) {
        scenario.steps.push(line);
        continue;
      }
      if (!line) continue; // blank lines never split a scenario block
      // Anything else (an @check, prose, a sub-heading) closes the scenario; the line falls
      // through so an @check binds to the scenario's criteria via lastGroup.
      flushScenario(current);
    }

    // A bullet may carry the @check; strip the marker before matching.
    const unbulleted = line.replace(LIST_MARKER, "");
    const check = unbulleted.match(CHECK_LINE);
    if (check) {
      const kindRaw = check[1]!.toLowerCase();
      const kind = (CHECK_KINDS.has(kindRaw) ? kindRaw : "unit") as CheckKind;
      const pending: CheckBinding = { kind, ref: check[2]!.trim() };
      if (textLines.length > 0) {
        flushCriterion(current, [pending]);
      } else if (lastGroup.length > 0) {
        // Consecutive/post-blank @check lines bind additional proofs to the last criterion group
        // (a single EARS sentence, a Scenario, or EVERY row of a Scenario Outline).
        for (const c of lastGroup) c.checks.push(pending);
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
  if (current) {
    flushCriterion(current, []);
    flushScenario(current);
  }
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
