# Rivet learnings — append-only; a lesson counts once PROMOTED or HARDENED

## 2026-06-11 Build-intent must veto research keywords in routing
- Trigger: live demo routed "i want a portfolio page … and compare with index" to RESEARCH — the
  word "compare" outweighed the explicit "i want a … page" build intent.
- Lesson: investigative keywords are weak signals; build-intent ("i/we want|need", "add/create/
  implement") must veto them. Misrouting a feature to research silently produces zero code.
- Promoted to: check:test/workflow.test.ts::want-signals veto research routing (permanent
  regression test, bound via task FIX-ROUTE-01 — red→fix→green through Rivet's own done-gate)
