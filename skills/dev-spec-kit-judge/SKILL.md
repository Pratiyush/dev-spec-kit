---
name: dev-spec-kit-judge
description: Supply an LLM acceptance verdict for a dev-spec-kit `judge` check — for criteria a test can't assert (tone, copy quality, "is this error actionable", a transcript vs a rubric). Use when a @check kind=judge needs proving in harness mode (no API key needed — you are the LLM).
---

# dev-spec-kit judge — you are the acceptance judge (harness mode)

A `judge` check binds a criterion no executed test can assert — UX-copy tone, error-message
actionability, "does this ADR explain the why", a transcript meeting a rubric. In **harness mode**
(the default), YOU are the judge: read the rubric + the evidence, decide strictly, record the verdict.
No API key, no network — you're already the model. (api mode calls Anthropic headlessly for CI.)

## Steps
1. Read the **criterion** — the spec text bound to the ref. That is your rubric.
2. Read the **evidence** — the ref's file/artifact/transcript. For `file::name`, the file is the
   evidence; otherwise judge what the ref points at.
3. Decide **strictly**. Default to FAIL when the evidence is missing, partial, or only plausibly
   satisfies the criterion — a judge proof you can't justify is verification theater.
4. Record it: `dev-spec-kit check run <taskId> "<ref>" --verdict pass|fail --reason "<one falsifiable line>"`.

## Rules (RFC-2119)
- You MUST cite specific evidence in `--reason` — what in the artifact does or doesn't satisfy the
  criterion. "looks good" is not a reason.
- You MUST NOT judge a full obligation (`REQUIREMENT_`/`NFR_`) green to dodge writing a real test;
  judge is for the genuinely-unmeasurable. The gate blocks it unless `verify.judge.allowForObligations`.
- A judge verdict is a SECOND-CLASS proof — recorded and labelled `⚖️ judged`, never an executed green.
  Prefer an executable check whenever the criterion can be mechanically asserted.
- When in doubt, FAIL and say why. Under-judging is recoverable; a false green corrupts the graph.
