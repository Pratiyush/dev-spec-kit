---
from: planning session, 2026-06-13 (LLM-layer features) — PLAN ONLY, not yet built
status: design for review. Four tracks: (A) LLM-judged check kind, (B) clarify/Q&A, (C) specialized
        agent roles, (D) harvest from claude-task-master. MCP deferred per Pratiyush ("soon"). Anthropic
        API specifics verified against the claude-api skill (model IDs, structured output) — not memory.
---

# Plan: an LLM-judge kind · clarify/Q&A · specialized agent roles · what to borrow from task-master

Guiding constraint (STRATEGY.md): Rivet's moat is **verification-by-construction beats vigilance** —
edges proven by an *executed* check, not an LLM's claim. Everything LLM-shaped below must respect that:
LLM verdicts are **recorded, labelled, and weaker-than-executed** — they extend the gate to the
genuinely-unmeasurable, they never dilute it. Rivet has **no LLM client today** (only an env var naming
the model); all of this is net-new Anthropic integration (`@anthropic-ai/sdk`; `zod` is already a dep).

---

## A. `judge` check kind — would an LLM judge improve the framework? YES, with a hard caveat

**Verdict: build it, but as a clearly-second-class proof.** SYSTEM-DESIGN §8 already lists `judge`
("llm-judged transcript, only for the genuinely-unmeasurable, and *recorded*") as a planned kind — it's
a strategy-vs-reality gap. It's genuinely useful for criteria a test can't assert: tone/UX-copy quality,
"is this error message actionable", "does this ADR explain the why", a transcript meeting a rubric. The
caveat that protects the moat:

- A judge proof is recorded with `kind: "judge"` and the **model + prompt + reason** in the journal, and
  rendered DISTINCTLY everywhere (`⚖️ judged` vs `✅ green`) — a judge-green must never masquerade as an
  executed-green in `trace`/PR body.
- It is **tree-stamped like any proof** (stales when the judged artifact changes) and **re-runnable**.
- Config gate: `verify.judge.allowForObligations` (default **false**) — proof-obligation requirements
  (`REQUIREMENT_`/`NFR_`) should prefer executable kinds; judge is opt-in, the fallback for the
  unmeasurable. This keeps the moat pure by default.

**Model (your "cheapest/fast judge"):** **Claude Haiku 4.5** — `claude-haiku-4-5`, $1/$5 per MTok, 200K
context, supports structured outputs. Configurable via `verify.judge.model` (bump to `claude-sonnet-4-6`
or `claude-opus-4-8` for high-stakes judging). No thinking/effort param (effort errors on Haiku); a
verdict needs ~512 `max_tokens`.

**Structured output = forced, parseable verdict** (no free-text to parse): `output_config.format` with a
JSON schema via the TS SDK's `client.messages.parse()` + `zodOutputFormat` (zod is already ours).

```ts
// src/engine/verify/judge.ts (sketch — verified against claude-api skill)
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Verdict = z.object({ passed: z.boolean(), reason: z.string() });

export async function judge(
  criterion: string,
  evidence: string,
  model = "claude-haiku-4-5",
): Promise<{ passed: boolean; reason: string }> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env (audit.ts already references it)
  const res = await client.messages.parse({
    model,
    max_tokens: 512,
    system:
      "You are a STRICT acceptance judge. Decide whether the EVIDENCE satisfies the CRITERION. " +
      "Default passed=false when uncertain or under-evidenced. Give a specific, falsifiable reason.",
    messages: [{ role: "user", content: `CRITERION:\n${criterion}\n\nEVIDENCE:\n${evidence}` }],
    output_config: { format: zodOutputFormat(Verdict) },
  });
  if (res.stop_reason === "refusal") throw new Error("judge refused — no proof recorded (tooling state)");
  if (!res.parsed_output) throw new Error("judge produced no structured verdict — no proof recorded");
  return res.parsed_output;
}
```

**Binding:** `@check kind=judge ref=<evidence-source>` where the evidence source is a file/glob or a
command whose output is the transcript; the **criterion text in the spec is the rubric**. The runner
(`runner.ts`) grows an async `judge` branch (it's an API call, not `spawnSync`); the `CheckResult`
already carries `kind`, `tail` (→ the reason), and `tree`. A refusal/parse-miss is a `RunnerUnavailable`
(never a fabricated proof — same discipline as FIX-TRUST-01).

**New dep:** `@anthropic-ai/sdk` (the engine was dep-light: commander/picocolors/zod — note this is the
first network dep; gate it behind the judge kind so non-judge projects never need a key).

---

## B. Clarify & Q&A — close the spec-kit gap, mostly with a prompt (thin)

spec-kit's `/clarify`: detect ambiguity, ask **≤5 questions, one at a time, each with a recommended
default** ("model pre-answers, you say yes"), before finalizing. Rivet's config already has
`spec.onVague: "clarify"` — unwired. Build it **prompt-first** (anti-erosion: the disposable layer):

- **`rivet-clarify` skill** (new, thin): runs spec-kit's 6 detection passes (ambiguity · missing edge
  cases · contradictions · under-specified acceptance · hidden assumptions · vague terms), then asks ≤5
  questions via the harness's own AskUserQuestion (recommended option first), one at a time, and folds
  answers back into the intake/spec. RFC-2119, role identity, output schema — the same register the
  existing skills already use well.
- **Engine's only job: make it provable.** A journaled `clarify` event (like `approvals/`) records the
  Q&A so the clarification is auditable and `trace`-visible. Wire `spec.onVague="clarify"` to require it
  before a full-spec route finalizes.

Net: ~1 skill + 1 small engine event. No LLM client needed (the harness model runs the skill).

---

## C. Specialized agent roles — a few thin, engine-orchestrated; NOT a 12-persona zoo

Today Rivet has 6 skills but **no formal roles** (researcher/architect/test-author/reviewer as distinct
agents). Borrow BMAD's role *clarity* without its depreciating prompt-ware. Formalize a **6-role set**,
each a ≤1-page skill (identity · RFC-2119 mandate · structured-output contract), **spawned fresh** by the
Engine's state machine (paste-don't-reference), validated on return:

| Role | Status | Mandate (one line) |
|---|---|---|
| researcher | exists (rivet-intake) | refine raw idea → grounded intake |
| spec-author | exists | EARS/Gherkin criteria + @check bindings |
| **architect** | **NEW** | HLD + ADR nodes from requirements (closes the unshipped §6 "ADR auto-emit") |
| **test-author** | **NEW** | drive `spec draft-tests`, then flesh stubs with descriptive assertions (the LLM role) |
| coder | exists (workflow) | implement within the file-fence, TDD |
| reviewer | exists (enhanced this PR) | 3-lens layered review, no quota |

"Use the LLM for different roles": each role can run on a **different model** (BMAD's doctrine — reviewer
in fresh context, ideally a different model than the coder; the API/subagent layer supports a cheaper
model per sub-task). Two surfaces: (1) **as a Rivet plugin in Claude Code** → roles are Claude Code
subagents (the Task tool), no API key needed; (2) **standalone engine** → roles are Claude API subagents
(agentic loop) or Managed Agents. Start with (1) — it's free and matches how Rivet ships today.

Design rule (anti-erosion): roles stay **thin + disposable**; the durable Engine orchestrates and
validates. Don't grow a persona roster — 6 is the cap.

---

## D. claude-task-master — what to borrow, and what we're deliberately NOT doing

task-master ships **~44 MCP tools** (you remembered ~35 — close; the extra are the autopilot set). It is
a strong *task-intelligence* layer with **no verification** (its `testStrategy` is dead prose, status is
a manual checkbox). So borrow its **intelligence**, never its **execution model** — the latter conflicts
with Rivet's proven-edges moat.

**Borrow (all LLM-shaped → reuse the §A judge/API infra):**

| Borrow | task-master tool | Fit in Rivet |
|---|---|---|
| **Complexity score 1–10 + recommended subtasks** | `analyze_project_complexity` | `rivet spec analyze` — score each requirement, flag over-scoped ones early (Rivet has no heuristic; §5 claims it, unshipped) |
| **Auto-expansion** | `expand_task` / `expand_all` | `rivet spec expand` — break a high-complexity requirement into bound sub-criteria (sequential IDs) |
| **Research augmentation** | `research` (context-aware, write-back) | `rivet research` — web_search server tool augments a requirement with current best-practice, written back as evidence (honors the "research-first, never-invent" law) |
| **Dependency cycle detect/fix** | `validate_dependencies` / `fix_dependencies` | fold cycle-detection into `spec lint` / `doctor` (Rivet has task DAGs via waves; catch circular deps) |

**NOT doing (and why — this is the differentiation):**
- **Autopilot (8 tools)** — an autonomous implement loop. Conflicts with Rivet's *human gates are
  recorded artifacts* law and evidence-bound done. Rivet keeps the human in the loop on purpose.
- **Tag/context isolation (6 tools)** — Rivet's worktree + wave isolation already covers parallel work;
  tags would be a redundant second model.
- **`models`/`rules`/`response-language` tools** — Rivet's `config.json` + laws cover these.
- **`parse_prd`** — Rivet's `route`/intake already bridges raw docs → spec.

The honest one-liner: task-master manages tasks with AI; Rivet **proves** them. Borrow the AI scoping/
research smarts; reject the manual-status + autopilot execution model that has no proof.

---

## E. MCP — deferred ("soon")

When ready: expose Rivet's verbs (`spec lint`, `verify --stamp`, `trace`, `task done`, `spec analyze`…)
as MCP tools so Cursor/Windsurf/other agents can drive Rivet — task-master's 44-tool surface, but every
tool carries Rivet's verification semantics (a `task done` MCP call still refuses without green proofs).

---

## Prioritized build order (review-ready)

1. **P1 · `judge` kind** — Haiku-backed, structured-output, recorded + labelled second-class. Adds
   `@anthropic-ai/sdk`. Closes the §8 strategy-vs-reality gap. Code sketch above.
2. **P1 · clarify** — `rivet-clarify` skill + a journaled clarify gate; wire `spec.onVague`.
3. **P1 · architect + test-author roles** — formalize the 6-role set; Engine orchestrates.
4. **P2 · task-master harvest** — `spec analyze` (1–10) → `spec expand` → `research` augmentation →
   dep-cycle lint. All reuse the judge/API client.
5. **Later · MCP** (per Pratiyush).

Sequencing note: 1 unlocks the shared Anthropic client that 4 reuses; 2–3 are prompt-layer and need no
key. Each LLM feature must ship its **tooling-honesty label** (judged ≠ executed) so the board still
can't lie.
