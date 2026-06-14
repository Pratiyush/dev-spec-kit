import { z } from "zod";
import { RivetConfigSchema, defaultConfig, type RivetConfig } from "../config/schema.js";

/**
 * REQUIREMENT_COCKPIT-01 — the config-studio manifest, GENERATED from the zod schema so types,
 * enums, and defaults can never drift from what the engine actually validates. Descriptions are
 * the UI-facing voice (schema comments stay the engineering voice); completeness is enforced —
 * an undescribed or structurally-unsupported knob THROWS, because silent knob loss is the config
 * studio's version of the parser's worst failure.
 */

export interface KnobField {
  key: string;
  type: "string" | "number" | "boolean" | "string[]" | "enum" | "enum[]";
  allowed?: string[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
}

export interface Knob {
  section: string;
  key: string;
  path: string;
  type: "string" | "enum" | "enum[]" | "string[]" | "boolean" | "number" | "record" | "object" | "json";
  allowed?: string[];
  value: unknown;
  default: unknown;
  changed: boolean;
  description: string;
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  nullable?: boolean;
  recordShape?: { cmd?: string; args?: string; generic?: boolean };
  fields?: KnobField[];
}

export interface SectionMeta {
  id: string;
  icon: string;
  blurb: string;
}

/** Rail presentation metadata — one entry per top-level config section. */
export const SECTIONS: SectionMeta[] = [
  { id: "project", icon: "📦", blurb: "Identity the boards and journal read from." },
  { id: "mode", icon: "🧭", blurb: "How a request is routed into a workflow." },
  { id: "intake", icon: "📥", blurb: "Where new work is ingested from." },
  { id: "spec", icon: "📐", blurb: "How specs and acceptance criteria are shaped." },
  { id: "build", icon: "🔨", blurb: "Coding discipline: tests, fences, retries, deps." },
  { id: "verify", icon: "✅", blurb: "The proof engine — checks, stacks, runners." },
  { id: "review", icon: "🔎", blurb: "Second-pass review before merge." },
  { id: "pr", icon: "🔀", blurb: "Branching, CI and merge policy." },
  { id: "memory", icon: "🧠", blurb: "Resume, journaling and drift detection." },
  { id: "parallel", icon: "⚡", blurb: "Concurrent worktree execution." },
  { id: "dashboard", icon: "📊", blurb: "The cockpit + notifications." },
  { id: "rules", icon: "⚖️", blurb: "Laws, conflicts and id hygiene." },
  { id: "learning", icon: "🌱", blurb: "Capturing and promoting learnings." },
  { id: "gates", icon: "🛡️", blurb: "The moat: what must hold before done." },
  { id: "graphify", icon: "🕸️", blurb: "The code-graph provider." },
];

/** UI descriptions per knob path — the studio's voice. Completeness is test-enforced both ways. */
const DESCRIPTIONS: Record<string, string> = {
  "project.name": "Human-readable project name used in board headers and journal metadata.",
  "project.platforms":
    "Codebase platforms (an ARRAY — polyglot is normal). Drives stack inference and `init --platforms` best-practice packs. NOT runner ids like `node-vitest`.",
  "mode.routing":
    "How requests become workflows. `auto` picks the lane; `pick` always asks; `auto-override` routes automatically but lets you veto.",
  "mode.confirmFirst": "Show the chosen mode and reasoning, then pause for confirmation before proceeding.",
  "mode.researchMode": "Offer a research-only `investigate and report` mode that never changes code.",
  "mode.custom": "User-defined custom modes: name → description or workflow reference.",
  "intake.sources":
    "Where new work is ingested from. `raw` = freeform prompts/files; the rest mirror external trackers.",
  "intake.jiraEpic":
    "When a Jira epic lands: `mirror` it 1:1, `replan` into Rivet's own breakdown, or `ask` each time.",
  "intake.writeBack": "Push status and links back to the originating tracker as tasks complete.",
  "spec.style": "Shape of the spec: terse `checklist`, user `stories`, or `both` side by side.",
  "spec.acceptanceCriteria":
    "Who authors acceptance criteria — the tool drafts and you edit, or you write from scratch.",
  "spec.criteriaFormat":
    "Criteria syntax. `gherkin` (default): Scenario / Scenario Outline + Examples. Both grammars always parse and bind; off-format criteria lint (warn-only). `mixed` accepts both silently.",
  "spec.breakdownDepth":
    "How deep work is decomposed: full feature→story→task→subtask, or just task→subtask.",
  "spec.estimates": "Attach effort estimates to derived tasks.",
  "spec.autoDependencies": "Infer dependencies between tasks automatically while planning.",
  "spec.diagram": "Generate a diagram alongside the spec when it helps comprehension.",
  "spec.gapHunting":
    "Actively hunt missing edge cases. `propose` surfaces gaps for review; `auto` files them as criteria.",
  "spec.riskWarn": "Warn and suggest splitting big or risky changes before any work starts.",
  "spec.livingPlan":
    "Whether the plan may evolve mid-build: frozen after approval, update with approval, or update freely.",
  "spec.onVague":
    "When a request is vague: stop and `clarify`, or `guess-flag` — proceed and mark every assumption.",
  "build.tests":
    "Test discipline. `tdd` writes the failing check first; `code-first` tests after; `either` lets the agent choose.",
  "build.fileFence": "Confine each task's writes to its declared file set; out-of-fence edits are blocked.",
  "build.retryLimit": "How many times a failing check may be retried before escalating to you.",
  "build.checkFrequency": "Run bound checks after every change, or once per task before done.",
  "build.whenStuck": "When blocked: ask immediately, grind on, or grind within a bound and then ask.",
  "build.codeStyle": "Match the surrounding repo style, follow the style guide, or both.",
  "build.reuse": "Prefer existing code before writing new (`prefer-flag` also reports what was reused).",
  "build.comments": "Comment density for generated code.",
  "build.commitCadence": "Commit after each step or once per completed task.",
  "build.newDeps": "Adding a dependency: always `ask`, `auto`-approve, or only ask for big ones (`ask-big`).",
  "verify.kinds": "Which proof kinds criteria may bind to. Custom kinds wired in kindRunners run too.",
  "verify.defaultStack":
    "Stack used when `--stack` is omitted. Resolution: flag → this → inferred from platforms → error.",
  "verify.buildAll":
    "Build steps `rivet verify` runs before the test kinds (`Build ALL`). Empty → node-ish platforms fall back to package.json build/typecheck scripts. Edited as JSON: an array of { cmd, args }.",
  "verify.coverage": "Minimum coverage percentage gate; null = judge by criteria coverage, not a number.",
  "verify.blockDoneOnFail":
    "A task cannot be marked done while bound checks fail — or while a passing proof is STALE (recorded on an older code tree).",
  "verify.everyCriterionNeedsCheck": "Every acceptance criterion must bind to at least one executable check.",
  "verify.runApp": "Boot the app for api/e2e checks using verify.app's lifecycle.",
  "verify.ui": "Visual/UI verification method for ui-flavored checks.",
  "verify.sandbox": "Run checks in an isolated sandbox or directly on this machine.",
  "verify.security": "When security review runs: never, before every PR, or on demand.",
  "verify.lintTypes": "Lint/type checks count as part of done, or run as a separate concern.",
  "verify.flaky": "Flaky checks: retry and flag the flakiness, or quarantine them.",
  "verify.runners":
    "Custom check-runner commands keyed by STACK name. Args support {ref}/{file}/{name} placeholders; matching keys override built-ins, new keys define new stacks.",
  "verify.kindRunners":
    "Kind-level runner templates (lint, audit, visual…) with the same placeholders. Precedence: kindRunners > runners > builtin.",
  "verify.app":
    "How to boot the app for runApp checks: start argv, readiness URL polled until it answers, and the wait budget.",
  "verify.judge":
    "The LLM `judge` kind (a second-class proof for the unmeasurable): mode (harness=the agent supplies the verdict free, api=the engine calls Anthropic headlessly, auto), the api model, and whether judge is allowed on full obligations (off by default).",
  "review.separateReviewer": "Review with a fresh agent that didn't write the code, to avoid author bias.",
  "review.angles": "Which review angles run on every change.",
  "review.passes": "Blind diff-only pass, full-context pass, or both.",
  "review.fixFindings":
    "What happens to findings: auto-fix, list for the human, or auto-fix only small ones.",
  "pr.autoBody": "Generate the PR body from the Verified Traceability Graph.",
  "pr.branchPattern": "Branch name template; {type} and {slug} interpolate per change.",
  "pr.merge": "Merge policy: automatically once green, or wait for the human.",
  "pr.waitForCI": "Block merge until remote CI is green, not just local checks.",
  "pr.commitAuthor":
    "Commits are authored by the human; `co-author` adds the agent as a trailer. Default: human only.",
  "pr.cleanupAfterMerge": "Delete branches/worktrees after a merged PR.",
  "memory.crashResume": "After a crash: resume exactly mid-task, or restart the task cleanly.",
  "memory.journal":
    "Journal verbosity. `full` records every CLI run; `milestones` keeps only state-changing events.",
  "memory.driftDetection": "Mark passing proofs STALE when the code they ran against has since changed.",
  "parallel.enabled": "Run independent tasks concurrently in isolated worktrees.",
  "parallel.waveSize": "Max concurrent worktree tasks (~6 avoids rate-limit wipeouts).",
  "parallel.isolation": "Each parallel task gets its own worktree, or they share the checkout.",
  "parallel.onFileClash": "When two tasks want the same file: serialize them, warn, or both.",
  "parallel.coordinator": "Run a coordinator that sequences merges and resolves conflicts between waves.",
  "dashboard.enabled": "Generate the cockpit (dashboard + config studio).",
  "dashboard.refreshSeconds": "How often the open cockpit reloads its data sidecar, in seconds.",
  "dashboard.form": "Cockpit form factor: web page, editor panel, or both.",
  "dashboard.updates":
    "`live`: the data sidecar is rewritten automatically after every task done / check run, so the open cockpit stays current.",
  "dashboard.notify": "Where and when to send notifications about run events.",
  "rules.laws": "Load the laws files (.rivet/laws.md + scoped laws) into every run.",
  "rules.onConflict": "When an instruction conflicts with a law: refuse, or warn and continue.",
  "rules.inheritPersonal": "Layer your personal ~/.rivet laws underneath the project's.",
  "rules.requireQualifiedIds":
    "Requirement ids must self-describe: REQUIREMENT_/NFR_/ADR_. Legacy `R-` ids still parse but lint at this severity.",
  "learning.capture": "Record lessons into learnings.md as work proceeds.",
  "learning.promoteToRules":
    "Turn confirmed lessons into enforced laws: never, with approval, or automatically.",
  "learning.bugToTest": "Every fixed bug must leave behind a regression check that would have caught it.",
  "learning.scope": "Where lessons apply: this project, globally, or both.",
  "learning.retro": "Run the retro loop after every feature, or only on demand.",
  "learning.warnOnRepeat": "Surface matching OPEN lessons when a task starts — before the mistake repeats.",
  "learning.share": "Keep learnings personal or share them with the team.",
  "gates.facts":
    "DENY→FORCE→ALLOW investigative gate: the first edit is blocked until named facts are gathered.",
  "gates.negativeFloor":
    "Every requirement needs ≥1 negative/failure criterion or graph build flags it. Prose mandates are ignorable; floors aren't.",
  "gates.require": "Gate packs enforced on every spec (empty by default — ceremony stays proportional).",
  "gates.packs":
    "Named gate packs: required spec sections, required check kinds, and routing triggers. Edited as JSON per entry.",
  "graphify.provider":
    "Who builds the code graph. `revitify` (bundled TS, zero installs) or the external Python `graphify` (multi-modal, opt-in).",
  "graphify.outDir": "Directory the code-graph artifacts are written to (gitignored, derived).",
  "graphify.freshness": "How the code graph is kept fresh.",
};

/* ------------------------------ zod walking ------------------------------ */

interface Unwrapped {
  node: z.ZodTypeAny;
  nullable: boolean;
}

function unwrap(node: z.ZodTypeAny): Unwrapped {
  let n = node;
  let nullable = false;
  for (;;) {
    const def = (n as { _def: { typeName: string } })._def;
    if (def.typeName === "ZodDefault") n = (n as z.ZodDefault<z.ZodTypeAny>)._def.innerType;
    else if (def.typeName === "ZodOptional") n = (n as z.ZodOptional<z.ZodTypeAny>)._def.innerType;
    else if (def.typeName === "ZodNullable") {
      nullable = true;
      n = (n as z.ZodNullable<z.ZodTypeAny>)._def.innerType;
    } else if (def.typeName === "ZodUnion") {
      // the schema's `number | null` pattern
      const options = (n as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>)._def.options;
      const nonNull = options.filter(
        (o) => (o as { _def: { typeName: string } })._def.typeName !== "ZodNull",
      );
      if (nonNull.length === options.length) return { node: n, nullable };
      nullable = true;
      if (nonNull.length !== 1) return { node: n, nullable };
      n = nonNull[0]!;
    } else return { node: n, nullable };
  }
}

function numberBounds(n: z.ZodNumber): { min?: number; max?: number } {
  const out: { min?: number; max?: number } = {};
  for (const c of n._def.checks) {
    if (c.kind === "min") out.min = c.value;
    if (c.kind === "max") out.max = c.value;
  }
  return out;
}

const typeName = (n: z.ZodTypeAny): string => (n as { _def: { typeName: string } })._def.typeName;

function classifyField(key: string, raw: z.ZodTypeAny, path: string): KnobField {
  const { node } = unwrap(raw);
  const t = typeName(node);
  if (t === "ZodBoolean") return { key, type: "boolean" };
  if (t === "ZodString") return { key, type: "string" };
  if (t === "ZodEnum")
    return { key, type: "enum", allowed: (node as z.ZodEnum<[string, ...string[]]>)._def.values };
  if (t === "ZodNumber") return { key, type: "number", ...numberBounds(node as z.ZodNumber) };
  if (t === "ZodArray") {
    const el = unwrap((node as z.ZodArray<z.ZodTypeAny>)._def.type).node;
    if (typeName(el) === "ZodEnum")
      return { key, type: "enum[]", allowed: (el as z.ZodEnum<[string, ...string[]]>)._def.values };
    if (typeName(el) === "ZodString") return { key, type: "string[]" };
  }
  /* c8 ignore start -- a schema-shape guard: fires only if the zod schema gains a field type the
     manifest doesn't model yet (a compile-time-ish invariant), forcing us to extend it. */
  throw new Error(`config-manifest: unsupported object field at ${path}.${key}`);
}
/* c8 ignore stop */

function classify(
  path: string,
  raw: z.ZodTypeAny,
): Omit<Knob, "section" | "key" | "value" | "default" | "changed" | "description"> {
  const { node, nullable } = unwrap(raw);
  const t = typeName(node);
  if (t === "ZodBoolean") return { path, type: "boolean" };
  if (t === "ZodString") return { path, type: "string", ...(nullable ? { nullable } : {}) };
  if (t === "ZodEnum")
    return {
      path,
      type: "enum",
      allowed: (node as z.ZodEnum<[string, ...string[]]>)._def.values,
      ...(nullable ? { nullable } : {}), // finding #12: a nullable enum keeps its null option
    };
  if (t === "ZodNumber")
    return { path, type: "number", ...numberBounds(node as z.ZodNumber), ...(nullable ? { nullable } : {}) };
  if (t === "ZodArray") {
    const el = unwrap((node as z.ZodArray<z.ZodTypeAny>)._def.type).node;
    const et = typeName(el);
    if (et === "ZodEnum")
      return { path, type: "enum[]", allowed: (el as z.ZodEnum<[string, ...string[]]>)._def.values };
    if (et === "ZodString") return { path, type: "string[]" };
    if (et === "ZodObject") return { path, type: "json" }; // e.g. verify.buildAll: [{cmd,args}]
    /* c8 ignore start -- schema-shape guard: an array of an unmodeled element type would force us to
       extend the manifest; not reachable from the current schema. */
    throw new Error(`config-manifest: unsupported array element at ${path}`);
  }
  /* c8 ignore stop */
  if (t === "ZodRecord") {
    const val = unwrap((node as z.ZodRecord)._def.valueType).node;
    if (typeName(val) === "ZodObject") {
      const shape = (val as z.ZodObject<z.ZodRawShape>).shape;
      if ("cmd" in shape && "args" in shape)
        return { path, type: "record", recordShape: { cmd: "string", args: "string[]" } };
      return { path, type: "record", recordShape: { generic: true } };
    }
    return { path, type: "record", recordShape: { generic: true } };
  }
  if (t === "ZodObject") {
    const shape = (node as z.ZodObject<z.ZodRawShape>).shape;
    const fields = Object.entries(shape).map(([k, v]) => classifyField(k, v as z.ZodTypeAny, path));
    return { path, type: "object", fields };
  }
  throw new Error(`config-manifest: unsupported schema node at ${path} (${t})`);
}

const get = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown> | undefined)?.[p], obj);

/**
 * Low-level generator over any section-shaped schema — exported for the failure-mode tests.
 * `descriptions` MUST cover every produced knob; a miss throws (never a silent blank).
 */
export function manifestFromSchema(
  schema: z.ZodTypeAny,
  value: unknown,
  defaults: unknown,
  descriptions: Record<string, string>,
): Knob[] {
  const root = unwrap(schema).node;
  if (typeName(root) !== "ZodObject") throw new Error("config-manifest: root must be an object schema");
  const knobs: Knob[] = [];
  for (const [section, rawSection] of Object.entries((root as z.ZodObject<z.ZodRawShape>).shape)) {
    const sec = unwrap(rawSection as z.ZodTypeAny).node;
    if (typeName(sec) === "ZodLiteral") continue; // version — internal plumbing
    if (typeName(sec) !== "ZodObject")
      throw new Error(`config-manifest: unsupported top-level node at ${section}`);
    for (const [key, rawKnob] of Object.entries((sec as z.ZodObject<z.ZodRawShape>).shape)) {
      const path = `${section}.${key}`;
      const base = classify(path, rawKnob as z.ZodTypeAny);
      const description = descriptions[path];
      if (!description) throw new Error(`config-manifest: no description for ${path}`);
      const v = get(value, path) ?? null;
      const d = get(defaults, path) ?? null;
      knobs.push({
        section,
        key,
        ...base,
        value: v,
        default: d,
        changed: JSON.stringify(v) !== JSON.stringify(d),
        description,
      });
    }
  }
  return knobs;
}

/** The real thing: the full Rivet manifest for a resolved project config. */
export function generateManifest(config: RivetConfig): Knob[] {
  return manifestFromSchema(RivetConfigSchema, config, defaultConfig(), DESCRIPTIONS);
}
