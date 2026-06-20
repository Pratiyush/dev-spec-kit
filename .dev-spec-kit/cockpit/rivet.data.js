window.RIVET = {
  "meta": {
    "project": "dev-spec-kit",
    "tagline": "evidence-bound delivery",
    "configPath": ".dev-spec-kit/config.json",
    "generatedAt": "2026-06-20T07:52:46.390Z",
    "serverMode": false,
    "refreshSeconds": 15,
    "inFlightTasks": [
      "REQUIREMENT_AUDIT-01",
      "NFR_AUDIT-03"
    ]
  },
  "nav": [
    {
      "group": "Dashboard",
      "mode": "dashboard",
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "icon": "◎"
        },
        {
          "id": "tasks",
          "label": "Tasks",
          "icon": "✅"
        },
        {
          "id": "requirements",
          "label": "Requirements",
          "icon": "📐"
        },
        {
          "id": "graph",
          "label": "Graph",
          "icon": "🕸️"
        },
        {
          "id": "activity",
          "label": "Activity",
          "icon": "🧾"
        },
        {
          "id": "files",
          "label": "Artifacts",
          "icon": "📁"
        }
      ]
    },
    {
      "group": "Config",
      "mode": "config",
      "items": "@sections"
    }
  ],
  "dashboard": {
    "completion": {
      "done": 70,
      "total": 73
    },
    "validates": {
      "green": 66,
      "red": 0,
      "stale": 0,
      "unproven": 0
    },
    "drift": 0,
    "graphHtml": "../../graphify-out/graph.html",
    "tasks": [
      {
        "id": "FIX-ROUTE-01",
        "title": "route: build-intent must veto research keywords",
        "status": "done",
        "boundChecks": [
          "test/workflow.test.ts::want-signals veto research routing"
        ],
        "results": {
          "test/workflow.test.ts::want-signals veto research routing": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "R-AUDIT-01",
        "title": "every CLI invocation is audit-logged",
        "status": "done",
        "boundChecks": [
          "test/cli-ux.test.ts::audits cli invocations into the journal"
        ],
        "results": {
          "test/cli-ux.test.ts::audits cli invocations into the journal": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "R-AUDIT-02",
        "title": "the audit trail is readable",
        "status": "done",
        "boundChecks": [
          "test/cli-ux.test.ts::renders the audit trail with per-type emoji"
        ],
        "results": {
          "test/cli-ux.test.ts::renders the audit trail with per-type emoji": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "R-PROG-01",
        "title": "progress with emoji after completing a task",
        "status": "done",
        "boundChecks": [
          "test/cli-ux.test.ts::renders progress with emoji, bar, and next-up"
        ],
        "results": {
          "test/cli-ux.test.ts::renders progress with emoji, bar, and next-up": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "FIX-PRMATH-01",
        "title": "PR coverage uses worst-of obligation semantics",
        "status": "done",
        "boundChecks": [
          "test/workflow.test.ts::worst-of coverage in the PR body"
        ],
        "results": {
          "test/workflow.test.ts::worst-of coverage in the PR body": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PROOF-01",
        "title": "proof identity = tested tree hash, not commit SHA",
        "status": "done",
        "boundChecks": [
          "test/proof-identity.test.ts"
        ],
        "results": {
          "test/proof-identity.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-ROBUST-01",
        "title": "inputs never crash; infra errors are not proofs",
        "status": "done",
        "boundChecks": [
          "test/robust.test.ts"
        ],
        "results": {
          "test/robust.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-SPECSYNC-01",
        "title": "spec re-derive syncs bindings; evidence unclobberable",
        "status": "done",
        "boundChecks": [
          "test/spec-sync.test.ts"
        ],
        "results": {
          "test/spec-sync.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-GATE-01",
        "title": "one not-green-blocks predicate; missing graph blocks",
        "status": "done",
        "boundChecks": [
          "test/gate.test.ts"
        ],
        "results": {
          "test/gate.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "GATE-PROTECT-01",
        "title": "in-flight specs/tests/config need human unlock",
        "status": "done",
        "boundChecks": [
          "test/protect.test.ts"
        ],
        "results": {
          "test/protect.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PARSE-01",
        "title": "parser respects markdown reality",
        "status": "done",
        "boundChecks": [
          "test/parse-fix.test.ts"
        ],
        "results": {
          "test/parse-fix.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-QUERY-01",
        "title": "read-only queries; no retry burn; deterministic ties",
        "status": "done",
        "boundChecks": [
          "test/query-fix.test.ts"
        ],
        "results": {
          "test/query-fix.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "AUDIT-META-01",
        "title": "journal meta (actor/model) + governance events",
        "status": "done",
        "boundChecks": [
          "test/audit-meta.test.ts"
        ],
        "results": {
          "test/audit-meta.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FINISH-RITUAL-01",
        "title": "rivet-finish skill: evidence gate, fixed menu, typed confirm",
        "status": "done",
        "boundChecks": [
          "test/finish-skill.test.ts"
        ],
        "results": {
          "test/finish-skill.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "GATE-FACTS-01",
        "title": "DENY-FORCE-ALLOW investigative gate (opt-in)",
        "status": "done",
        "boundChecks": [
          "test/gate-facts.test.ts"
        ],
        "results": {
          "test/gate-facts.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "GATE-PACKS-01",
        "title": "config gate packs: sections+kinds+security floor",
        "status": "done",
        "boundChecks": [
          "test/gate-packs.test.ts"
        ],
        "results": {
          "test/gate-packs.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "COMPACT-01",
        "title": "phase-aware checkpoints + PreCompact resume save",
        "status": "done",
        "boundChecks": [
          "test/compact.test.ts"
        ],
        "results": {
          "test/compact.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "SKILL-QA-01",
        "title": "mechanical QA: skills reference only real commands/artifacts",
        "status": "done",
        "boundChecks": [
          "test/skill-qa.test.ts"
        ],
        "results": {
          "test/skill-qa.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "SCALE-01",
        "title": "P3: locking, fold cache, failure tails, anchor-by-path, audit gating",
        "status": "done",
        "boundChecks": [
          "test/scale.test.ts"
        ],
        "results": {
          "test/scale.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "RUNNERS-01",
        "title": "multi-kind verification: kind-aware runs + app lifecycle + kind runners",
        "status": "done",
        "boundChecks": [
          "test/runners-kind.test.ts"
        ],
        "results": {
          "test/runners-kind.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "RENAME-LAWS-01",
        "title": "rename constitution → laws (user term)",
        "status": "done",
        "boundChecks": [
          "test/skill-qa.test.ts"
        ],
        "results": {
          "test/skill-qa.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "BOARDS-01",
        "title": "generated LEDGER.md + TRACKING.md boards",
        "status": "done",
        "boundChecks": [
          "test/boards.test.ts"
        ],
        "results": {
          "test/boards.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "WAVE-01",
        "title": "worktree wave dispatcher: plan + fetch-first start",
        "status": "done",
        "boundChecks": [
          "test/wave.test.ts"
        ],
        "results": {
          "test/wave.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "STEER-01",
        "title": "laws engine: 3 scopes + personal inheritance + file injection",
        "status": "done",
        "boundChecks": [
          "test/steering.test.ts"
        ],
        "results": {
          "test/steering.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "LEARN-01",
        "title": "warn-on-repeat: open lessons surface at task start",
        "status": "done",
        "boundChecks": [
          "test/learnwarn.test.ts"
        ],
        "results": {
          "test/learnwarn.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "WAVE-02",
        "title": "wave done: provenance-checked worktree cleanup after merge",
        "status": "done",
        "boundChecks": [
          "test/wave-done.test.ts"
        ],
        "results": {
          "test/wave-done.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "DASH-01",
        "title": "dashboard v1: emoji + completion % + traffic lights + graph embed",
        "status": "done",
        "boundChecks": [
          "test/dashboard.test.ts"
        ],
        "results": {
          "test/dashboard.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FILES-01",
        "title": "dashboard files plumbing: collect .rivet md + safe renderer",
        "status": "done",
        "boundChecks": [
          "test/files-tab.test.ts"
        ],
        "results": {
          "test/files-tab.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "README-01",
        "title": "README refresh: match the real tool surface",
        "status": "done",
        "boundChecks": [
          "test/readme.test.ts"
        ],
        "results": {
          "test/readme.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PROOF-02",
        "title": "proof identity excludes .rivet state (journal must not stale its own proofs)",
        "status": "done",
        "boundChecks": [
          "test/proof-identity.test.ts"
        ],
        "results": {
          "test/proof-identity.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "TRAIL-01",
        "title": "per-task gate trail: minute-level done/blocked/skipped/pending",
        "status": "done",
        "boundChecks": [
          "test/trail.test.ts"
        ],
        "results": {
          "test/trail.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "DASH-02",
        "title": "port design.html as the dashboard template with live data injection",
        "status": "done",
        "boundChecks": [
          "test/dashboard.test.ts"
        ],
        "results": {
          "test/dashboard.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-DOCTOR-01",
        "title": "graphify optional in doctor + provenance hint (classifier-safe)",
        "status": "done",
        "boundChecks": [
          "test/doctor-fix.test.ts"
        ],
        "results": {
          "test/doctor-fix.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-STACKNAMES-01",
        "title": "project.platforms rename + runner-stack disambiguation error",
        "status": "done",
        "boundChecks": [
          "test/stacknames.test.ts"
        ],
        "results": {
          "test/stacknames.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PROOF-03",
        "title": "check-run stamp shows tree identity, not commit sha",
        "status": "done",
        "boundChecks": [
          "test/proof-display.test.ts::stamps the tree identity, not the commit sha"
        ],
        "results": {
          "test/proof-display.test.ts::stamps the tree identity, not the commit sha": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PROOF-04",
        "title": "every proof surface stamps the tree identity (PR body, approvals, ledger log)",
        "status": "done",
        "boundChecks": [
          "test/proof-display.test.ts"
        ],
        "results": {
          "test/proof-display.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-PROV-01",
        "title": "provenance hint carries no rotting vanity metrics (star count)",
        "status": "done",
        "boundChecks": [
          "test/doctor-fix.test.ts"
        ],
        "results": {
          "test/doctor-fix.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-IDS-01",
        "title": "fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint",
        "status": "done",
        "boundChecks": [
          "test/qualified-ids.test.ts"
        ],
        "results": {
          "test/qualified-ids.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "REQUIREMENT_AUDIT-01",
        "title": "every CLI invocation is audit-logged",
        "status": "in_progress",
        "boundChecks": [
          "test/cli-ux.test.ts::audits cli invocations into the journal",
          "test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects"
        ],
        "results": {
          "test/cli-ux.test.ts::audits cli invocations into the journal": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cli-ux.test.ts::does not create journals outside Rivet projects": {
            "passed": false,
            "at": "2026-06-19T21:32:18.099Z",
            "kind": "unit",
            "tail": "no test executed — the file has 6 test(s) but the ::name matched none (the test was renamed, or the ref's name is wrong)\nRUN  v2.1.9 /Users/pratiyush/Github/llm-dev-kit\n\n ↓ test/cli-ux.test.ts (6 tests | 6 skipped)\n\n Test Files  1 skipped (1)\n      Tests  6 skipped (6)\n   Start at  23:32:17\n   Duration  454ms (transform 103ms, setup 0ms, collect 288ms, tests 0ms, environment 0ms, prepare 29ms)\n\nJSON report written to /var/folders/3z/2mjcvn_16jsgyc0d9hlm3mb80000gn/T/dev-spec-kit-check-AIUopk/report.json"
          },
          "test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_AUDIT-02",
        "title": "the audit trail is readable",
        "status": "done",
        "boundChecks": [
          "test/cli-ux.test.ts::renders the audit trail with per-type emoji",
          "test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold"
        ],
        "results": {
          "test/cli-ux.test.ts::renders the audit trail with per-type emoji": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_PROG-01",
        "title": "progress with emoji after completing a task",
        "status": "done",
        "boundChecks": [
          "test/cli-ux.test.ts::renders progress with emoji, bar, and next-up",
          "test/cli-ux.test.ts::renders an explicit empty state when there are no tasks"
        ],
        "results": {
          "test/cli-ux.test.ts::renders progress with emoji, bar, and next-up": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cli-ux.test.ts::renders an explicit empty state when there are no tasks": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "FEAT-GHERKIN-01",
        "title": "gherkin first-class + default format + mechanical negative floor",
        "status": "done",
        "boundChecks": [
          "test/gherkin.test.ts"
        ],
        "results": {
          "test/gherkin.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "NFR_AUDIT-03",
        "title": "auditing never breaks the CLI",
        "status": "in_progress",
        "boundChecks": [
          "test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects"
        ],
        "results": {
          "test/cli-ux.test.ts::does not create journals outside Rivet projects": {
            "passed": false,
            "at": "2026-06-19T21:32:18.099Z",
            "kind": "unit",
            "tail": "no test executed — the file has 6 test(s) but the ::name matched none (the test was renamed, or the ref's name is wrong)\nRUN  v2.1.9 /Users/pratiyush/Github/llm-dev-kit\n\n ↓ test/cli-ux.test.ts (6 tests | 6 skipped)\n\n Test Files  1 skipped (1)\n      Tests  6 skipped (6)\n   Start at  23:32:17\n   Duration  454ms (transform 103ms, setup 0ms, collect 288ms, tests 0ms, environment 0ms, prepare 29ms)\n\nJSON report written to /var/folders/3z/2mjcvn_16jsgyc0d9hlm3mb80000gn/T/dev-spec-kit-check-AIUopk/report.json"
          },
          "test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "FEAT-STACK-01",
        "title": "verify.defaultStack + platform inference; --stack optional",
        "status": "done",
        "boundChecks": [
          "test/default-stack.test.ts"
        ],
        "results": {
          "test/default-stack.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-REPORT-01",
        "title": "tabular post-task evidence report (terminal + LEDGER)",
        "status": "done",
        "boundChecks": [
          "test/task-report.test.ts"
        ],
        "results": {
          "test/task-report.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-EMOJI-01",
        "title": "central emoji vocabulary (>=10 new) + plain mode for CI",
        "status": "done",
        "boundChecks": [
          "test/emoji.test.ts"
        ],
        "results": {
          "test/emoji.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-VERIFY-01",
        "title": "rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate",
        "status": "done",
        "boundChecks": [
          "test/verify-cmd.test.ts"
        ],
        "results": {
          "test/verify-cmd.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-PLATFORM-01",
        "title": "electron platform; platforms is an ARRAY (polyglot normal)",
        "status": "done",
        "boundChecks": [
          "test/stacknames.test.ts"
        ],
        "results": {
          "test/stacknames.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-INITPACKS-01",
        "title": "init --platforms seeds free/OSS best-practice law packs, pre-wired to checks",
        "status": "done",
        "boundChecks": [
          "test/init-practices.test.ts"
        ],
        "results": {
          "test/init-practices.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-CCFIRST-01",
        "title": "README states Claude-Code-first explicitly",
        "status": "done",
        "boundChecks": [
          "test/readme.test.ts"
        ],
        "results": {
          "test/readme.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-FLUSH-01",
        "title": "pr learnings-flush warn + doctor stale-worktree visibility",
        "status": "done",
        "boundChecks": [
          "test/pr-flush-warn.test.ts",
          "test/doctor-fix.test.ts"
        ],
        "results": {
          "test/pr-flush-warn.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          },
          "test/doctor-fix.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-REVITIFY-01",
        "title": "revitify: native TS knowledge graph, graphify output contract, default provider",
        "status": "done",
        "boundChecks": [
          "test/revitify-contract.test.ts"
        ],
        "results": {
          "packages/revitify/test/revitify.test.ts": {
            "passed": true,
            "at": "2026-06-12T05:05:39.506Z",
            "kind": "unit",
            "stale": true
          },
          "test/revitify-contract.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FEAT-REVITIFY-02",
        "title": "revitify extracted to its own repo; consumer-side contract pinned",
        "status": "done",
        "boundChecks": [
          "test/revitify-contract.test.ts"
        ],
        "results": {
          "test/revitify-contract.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-STALEDONE-01",
        "title": "done-gate refuses stale evidence (pass on an older tree is not green)",
        "status": "done",
        "boundChecks": [
          "test/stale-done.test.ts"
        ],
        "results": {
          "test/stale-done.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "REQUIREMENT_COCKPIT-01",
        "title": "config manifest generated from the schema",
        "status": "done",
        "boundChecks": [
          "test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)",
          "test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape",
          "test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path"
        ],
        "results": {
          "test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_COCKPIT-02",
        "title": "the RIVET data sidecar is the project's truth",
        "status": "done",
        "boundChecks": [
          "test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest",
          "test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar",
          "test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar"
        ],
        "results": {
          "test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_COCKPIT-03",
        "title": "static shell emission, written once",
        "status": "done",
        "boundChecks": [
          "test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar",
          "test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes"
        ],
        "results": {
          "test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_COCKPIT-04",
        "title": "live updates after every proof event",
        "status": "done",
        "boundChecks": [
          "test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run",
          "test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events"
        ],
        "results": {
          "test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_COCKPIT-05",
        "title": "the config save server",
        "status": "done",
        "boundChecks": [
          "test/cockpit-server.test.ts::a valid POST saves config.json and journals governance",
          "test/cockpit-server.test.ts::an invalid POST returns field errors and never writes",
          "test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint",
          "test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode"
        ],
        "results": {
          "test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit-server.test.ts::a valid POST saves config.json and journals governance": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit-server.test.ts::an invalid POST returns field errors and never writes": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_DOCS-01",
        "title": "every mutation refreshes every generated document",
        "status": "done",
        "boundChecks": [
          "test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar",
          "test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving",
          "test/docs-refresh.test.ts::read-only queries never create or touch documents",
          "test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar"
        ],
        "results": {
          "test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/docs-refresh.test.ts::read-only queries never create or touch documents": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "FIX-COCKPIT-SEC-01",
        "title": "cockpit hardening: 12 adversarial-review findings (localhost bind, unlock match, parsed-write, body cap, CSRF, etc.)",
        "status": "done",
        "boundChecks": [
          "test/cockpit-hardening.test.ts"
        ],
        "results": {
          "test/cockpit-hardening.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "FIX-COCKPIT-ASSETS-01",
        "title": "regression guard for browser-asset findings #4 (json control) + #9 (auto-reload state)",
        "status": "done",
        "boundChecks": [
          "test/cockpit-assets.test.ts"
        ],
        "results": {
          "test/cockpit-assets.test.ts": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z"
          }
        }
      },
      {
        "id": "REQUIREMENT_TRUST-01",
        "title": "a name-filtered run that matches zero tests is never a pass",
        "status": "done",
        "boundChecks": [
          "test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0",
          "test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof",
          "test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof",
          "test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)"
        ],
        "results": {
          "test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_TRUST-02",
        "title": "flag-like and regex-special test names bind to exactly that test",
        "status": "done",
        "boundChecks": [
          "test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern",
          "test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI"
        ],
        "results": {
          "test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_STAMP-01",
        "title": "one suite run stamps every bound criterion (kills the depth tax)",
        "status": "done",
        "boundChecks": [
          "test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind",
          "test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)",
          "test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)",
          "test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence"
        ],
        "results": {
          "test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_LINT-01",
        "title": "static drift check flags orphaned refs before any run",
        "status": "done",
        "boundChecks": [
          "test/spec-lint.test.ts::flags a ref whose file is missing",
          "test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)",
          "test/spec-lint.test.ts::passes a ref whose file and name both resolve",
          "test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)"
        ],
        "results": {
          "test/spec-lint.test.ts::flags a ref whose file is missing": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/spec-lint.test.ts::passes a ref whose file and name both resolve": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_DONE-01",
        "title": "the done-gate tells a stale binding apart from a missing proof",
        "status": "done",
        "boundChecks": [
          "test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)",
          "test/done-msg.test.ts::is out of sync when the counts differ",
          "test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)"
        ],
        "results": {
          "test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/done-msg.test.ts::is out of sync when the counts differ": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_DRAFT-01",
        "title": "draft-tests scaffolds a failing, bound stub per unbound criterion",
        "status": "done",
        "boundChecks": [
          "test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate",
          "test/draft.test.ts::takes the SHALL clause and drops 'the system'",
          "test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records"
        ],
        "results": {
          "test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/draft.test.ts::takes the SHALL clause and drops 'the system'": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_RECONCILE-01",
        "title": "verify --stamp --advance reconciles trace with status",
        "status": "done",
        "boundChecks": [
          "test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree",
          "test/done-msg.test.ts::never re-advances an already-done task",
          "test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)"
        ],
        "results": {
          "test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/done-msg.test.ts::never re-advances an already-done task": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_JUDGE-01",
        "title": "an LLM judge verdict is a recorded, second-class proof",
        "status": "done",
        "boundChecks": [
          "test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)",
          "test/judge.test.ts::respects an explicit mode regardless of the key",
          "test/judge.test.ts::auto resolves to api when a key is present, harness when not",
          "test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set"
        ],
        "results": {
          "test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/judge.test.ts::respects an explicit mode regardless of the key": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/judge.test.ts::auto resolves to api when a key is present, harness when not": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_CYCLE-01",
        "title": "a circular dependency is flagged, not silently built",
        "status": "done",
        "boundChecks": [
          "test/cycles.test.ts::finds a simple A→B→A cycle",
          "test/cycles.test.ts::finds a longer A→B→C→A cycle",
          "test/cycles.test.ts::returns nothing for an acyclic chain",
          "test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)"
        ],
        "results": {
          "test/cycles.test.ts::finds a simple A→B→A cycle": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cycles.test.ts::finds a longer A→B→C→A cycle": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cycles.test.ts::returns nothing for an acyclic chain": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_PRBLAST-01",
        "title": "the PR body shows the change's blast radius",
        "status": "done",
        "boundChecks": [
          "test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves",
          "test/pr-blast.test.ts::renders the touched edges for changed files that map",
          "test/pr-blast.test.ts::notes honestly when changed files map to no graph node",
          "test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)"
        ],
        "results": {
          "test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/pr-blast.test.ts::renders the touched edges for changed files that map": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/pr-blast.test.ts::notes honestly when changed files map to no graph node": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      },
      {
        "id": "REQUIREMENT_IMPL-01",
        "title": "proven implements edges tie changed source files to their requirements",
        "status": "pending",
        "boundChecks": [
          "test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof",
          "test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live",
          "test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge",
          "test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green",
          "test/implements-edges.test.ts::never links a test→test import as an implementation",
          "test/implements-edges.test.ts::does not link a source the requirement's tests never import"
        ],
        "results": {
          "test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/implements-edges.test.ts::never links a test→test import as an implementation": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          },
          "test/implements-edges.test.ts::does not link a source the requirement's tests never import": {
            "passed": true,
            "at": "2026-06-20T07:52:39.532Z",
            "kind": "unit"
          }
        }
      }
    ],
    "requirements": [
      {
        "id": "REQUIREMENT_AUDIT-01",
        "title": "every CLI invocation is audit-logged",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_AUDIT-02",
        "title": "the audit trail is readable",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_PROG-01",
        "title": "progress with emoji after completing a task",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "NFR_AUDIT-03",
        "title": "auditing never breaks the CLI",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_COCKPIT-01",
        "title": "config manifest generated from the schema",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_COCKPIT-02",
        "title": "the RIVET data sidecar is the project's truth",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_COCKPIT-03",
        "title": "static shell emission, written once",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_COCKPIT-04",
        "title": "live updates after every proof event",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_COCKPIT-05",
        "title": "the config save server",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          },
          {
            "id": "AC4",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_DOCS-01",
        "title": "every mutation refreshes every generated document",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          },
          {
            "id": "AC4",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_TRUST-01",
        "title": "a name-filtered run that matches zero tests is never a pass",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_TRUST-02",
        "title": "flag-like and regex-special test names bind to exactly that test",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_STAMP-01",
        "title": "one suite run stamps every bound criterion (kills the depth tax)",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_LINT-01",
        "title": "static drift check flags orphaned refs before any run",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_DONE-01",
        "title": "the done-gate tells a stale binding apart from a missing proof",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_DRAFT-01",
        "title": "draft-tests scaffolds a failing, bound stub per unbound criterion",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_RECONCILE-01",
        "title": "verify --stamp --advance reconciles trace with status",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_JUDGE-01",
        "title": "an LLM judge verdict is a recorded, second-class proof",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_CYCLE-01",
        "title": "a circular dependency is flagged, not silently built",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_PRBLAST-01",
        "title": "the PR body shows the change's blast radius",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          }
        ]
      },
      {
        "id": "REQUIREMENT_IMPL-01",
        "title": "proven implements edges tie changed source files to their requirements",
        "proven": true,
        "criteria": [
          {
            "id": "AC1",
            "proof": "green"
          },
          {
            "id": "AC2",
            "proof": "green"
          },
          {
            "id": "AC3",
            "proof": "green"
          }
        ]
      }
    ],
    "approvals": [
      {
        "at": "2026-06-12T07:21:29.913Z",
        "approver": "Pratiyush Kumar Singh",
        "taskIds": [
          "FEAT-VERIFY-01",
          "FEAT-GHERKIN-01",
          "FEAT-IDS-01",
          "FEAT-REPORT-01",
          "FEAT-EMOJI-01",
          "FEAT-INITPACKS-01",
          "FEAT-PLATFORM-01",
          "FEAT-STACK-01",
          "FEAT-CCFIRST-01",
          "FEAT-FLUSH-01",
          "FEAT-REVITIFY-01",
          "FEAT-REVITIFY-02"
        ],
        "commit": "48324e99"
      },
      {
        "at": "2026-06-12T07:21:29.214Z",
        "approver": "Pratiyush Kumar Singh",
        "taskIds": [
          "REQUIREMENT_COCKPIT-01",
          "REQUIREMENT_COCKPIT-02",
          "REQUIREMENT_COCKPIT-03",
          "REQUIREMENT_COCKPIT-04",
          "REQUIREMENT_COCKPIT-05",
          "REQUIREMENT_DOCS-01"
        ],
        "commit": "48324e99"
      }
    ],
    "governance": [
      {
        "at": "2026-06-12T07:20:18.537Z",
        "kind": "unlock",
        "detail": "paths=test/cockpit.test.ts · until=2026-06-12T07:50:18.537Z"
      },
      {
        "at": "2026-06-12T07:00:16.579Z",
        "kind": "unlock",
        "detail": "paths=test/dashboard.test.ts,test/files-tab.test.ts · until=2026-06-12T08:00:16.579Z"
      },
      {
        "at": "2026-06-12T05:01:36.612Z",
        "kind": "unlock",
        "detail": "paths=test/doctor-fix.test.ts · until=2026-06-12T05:31:36.612Z"
      },
      {
        "at": "2026-06-12T04:51:20.884Z",
        "kind": "unlock",
        "detail": "paths=test/doctor-fix.test.ts · until=2026-06-12T05:21:20.884Z"
      },
      {
        "at": "2026-06-12T04:48:57.051Z",
        "kind": "unlock",
        "detail": "paths=test/readme.test.ts · until=2026-06-12T05:08:57.051Z"
      },
      {
        "at": "2026-06-11T23:58:59.298Z",
        "kind": "unlock",
        "detail": "paths=test/stacknames.test.ts · until=2026-06-12T00:28:59.298Z"
      },
      {
        "at": "2026-06-11T23:58:14.741Z",
        "kind": "unlock",
        "detail": "paths=test/skill-qa.test.ts · until=2026-06-12T00:28:14.741Z"
      },
      {
        "at": "2026-06-11T23:55:10.102Z",
        "kind": "unlock",
        "detail": "paths=test/gate.test.ts · until=2026-06-12T00:55:10.102Z"
      },
      {
        "at": "2026-06-11T23:41:27.273Z",
        "kind": "unlock",
        "detail": "paths=.rivet/specs/cli-ux.md,test/cli-ux.test.ts,.rivet/config.json · until=2026-06-12T00:41:27.273Z"
      },
      {
        "at": "2026-06-11T23:34:24.469Z",
        "kind": "unlock",
        "detail": "paths=.rivet/specs/cli-ux.md · until=2026-06-12T00:04:24.469Z"
      },
      {
        "at": "2026-06-11T23:29:29.462Z",
        "kind": "unlock",
        "detail": "paths=test/doctor-fix.test.ts · until=2026-06-12T00:29:29.462Z"
      },
      {
        "at": "2026-06-11T23:25:31.905Z",
        "kind": "unlock",
        "detail": "paths=test/proof-display.test.ts,test/workflow.test.ts · until=2026-06-12T01:25:31.905Z"
      }
    ],
    "activity": [
      {
        "at": "2026-06-20T07:52:45.587Z",
        "icon": "🧾",
        "text": "graph build",
        "meta": "Pratiyush Kumar Singh"
      },
      {
        "at": "2026-06-20T07:52:40.209Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::does not link a source the requirement's tests never import → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.204Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::never links a test→test import as an implementation → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.198Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.193Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.187Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.181Z",
        "icon": "✅",
        "text": "check test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof → REQUIREMENT_IMPL-01"
      },
      {
        "at": "2026-06-20T07:52:40.175Z",
        "icon": "✅",
        "text": "check test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat) → REQUIREMENT_PRBLAST-01"
      },
      {
        "at": "2026-06-20T07:52:40.170Z",
        "icon": "✅",
        "text": "check test/pr-blast.test.ts::notes honestly when changed files map to no graph node → REQUIREMENT_PRBLAST-01"
      },
      {
        "at": "2026-06-20T07:52:40.164Z",
        "icon": "✅",
        "text": "check test/pr-blast.test.ts::renders the touched edges for changed files that map → REQUIREMENT_PRBLAST-01"
      },
      {
        "at": "2026-06-20T07:52:40.159Z",
        "icon": "✅",
        "text": "check test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves → REQUIREMENT_PRBLAST-01"
      },
      {
        "at": "2026-06-20T07:52:40.153Z",
        "icon": "✅",
        "text": "check test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle) → REQUIREMENT_CYCLE-01"
      },
      {
        "at": "2026-06-20T07:52:40.148Z",
        "icon": "✅",
        "text": "check test/cycles.test.ts::returns nothing for an acyclic chain → REQUIREMENT_CYCLE-01"
      },
      {
        "at": "2026-06-20T07:52:40.143Z",
        "icon": "✅",
        "text": "check test/cycles.test.ts::finds a longer A→B→C→A cycle → REQUIREMENT_CYCLE-01"
      },
      {
        "at": "2026-06-20T07:52:40.137Z",
        "icon": "✅",
        "text": "check test/cycles.test.ts::finds a simple A→B→A cycle → REQUIREMENT_CYCLE-01"
      },
      {
        "at": "2026-06-20T07:52:40.131Z",
        "icon": "✅",
        "text": "check test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set → REQUIREMENT_JUDGE-01"
      },
      {
        "at": "2026-06-20T07:52:40.126Z",
        "icon": "✅",
        "text": "check test/judge.test.ts::auto resolves to api when a key is present, harness when not → REQUIREMENT_JUDGE-01"
      },
      {
        "at": "2026-06-20T07:52:40.120Z",
        "icon": "✅",
        "text": "check test/judge.test.ts::respects an explicit mode regardless of the key → REQUIREMENT_JUDGE-01"
      },
      {
        "at": "2026-06-20T07:52:40.114Z",
        "icon": "✅",
        "text": "check test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green) → REQUIREMENT_JUDGE-01"
      },
      {
        "at": "2026-06-20T07:52:40.109Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale) → REQUIREMENT_RECONCILE-01"
      },
      {
        "at": "2026-06-20T07:52:40.103Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::never re-advances an already-done task → REQUIREMENT_RECONCILE-01"
      },
      {
        "at": "2026-06-20T07:52:40.097Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree → REQUIREMENT_RECONCILE-01"
      },
      {
        "at": "2026-06-20T07:52:40.092Z",
        "icon": "✅",
        "text": "check test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records → REQUIREMENT_DRAFT-01"
      },
      {
        "at": "2026-06-20T07:52:40.086Z",
        "icon": "✅",
        "text": "check test/draft.test.ts::takes the SHALL clause and drops 'the system' → REQUIREMENT_DRAFT-01"
      },
      {
        "at": "2026-06-20T07:52:40.080Z",
        "icon": "✅",
        "text": "check test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate → REQUIREMENT_DRAFT-01"
      },
      {
        "at": "2026-06-20T07:52:40.074Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent) → REQUIREMENT_DONE-01"
      },
      {
        "at": "2026-06-20T07:52:40.068Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::is out of sync when the counts differ → REQUIREMENT_DONE-01"
      },
      {
        "at": "2026-06-20T07:52:40.062Z",
        "icon": "✅",
        "text": "check test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new) → REQUIREMENT_DONE-01"
      },
      {
        "at": "2026-06-20T07:52:40.056Z",
        "icon": "✅",
        "text": "check test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method) → REQUIREMENT_LINT-01"
      },
      {
        "at": "2026-06-20T07:52:40.049Z",
        "icon": "✅",
        "text": "check test/spec-lint.test.ts::passes a ref whose file and name both resolve → REQUIREMENT_LINT-01"
      }
    ],
    "files": [
      {
        "name": "laws.md",
        "content": "# Project Constitution\n\n> The rules dev-spec-kit must always obey for this project. Three scopes are supported (Kiro-style steering):\n> always-on (this file), file-match, and on-summon. A personal default can be inherited and overridden here.\n\n## Standards\n- (add your do's and don'ts here)\n\n## Tech & conventions\n- (stacks, libraries, naming, structure, folder layout)\n\n## Hard rules (never violate)\n- Commits are authored by the human, never co-authored by the AI.\n- A task is not \"done\" until its bound checks pass (evidence-bound completion).\n- Reuse existing code before writing new; follow the surrounding patterns.\n- Every feature gets an adversarial review pass before PR — verification and review catch\n  different bug classes; neither substitutes for the other.\n  (Promoted from learnings 2026-06-11; APPROVED by Pratiyush 2026-06-11.)\n"
      },
      {
        "name": "laws/best-practices-quality-gates.md",
        "content": "---\ninclusion: always\n---\n# Best practices — quality gates (any platform)\n\n> Constraint: every tool below is **free or open-source** — no paid licenses, ever.\n\n## Pre-commit (the cheapest gate)\n- **Husky** runs checks before every commit; **lint-staged** scopes them to changed files —\n  fast enough that nobody bypasses it.\n\n## Central dashboards — OPTIONAL, never required\n- **SonarQube Community Edition** (free): smells, bugs, duplication for Java + TS.\n- **GitHub CodeQL** (free for public repos; check terms for private): deep SAST.\n- These are optional add-ons; dev-spec-kit's verify gate is the required floor.\n\n## Bind these as dev-spec-kit checks\n```jsonc\n// the pre-commit hook simply runs what verify runs:\n//   .husky/pre-commit → npx lint-staged   (and dev-spec-kit verify before push/PR)\n```\n"
      },
      {
        "name": "laws/best-practices-typescript.md",
        "content": "---\ninclusion: fileMatch\npattern: \\.tsx?$\n---\n# Best practices — TypeScript\n\n> Constraint: every tool below is **free or open-source** — no paid licenses, ever.\n\n## Compiler is the first linter\n- `tsconfig.json` MUST set: `strict: true`, `noImplicitAny`, `noUnusedLocals`,\n  `noUncheckedIndexedAccess` — indexing returns `T | undefined`; handle it, don't assert it away.\n- ESM (`\"type\": \"module\"`); no `require` in new code.\n\n## Lint + format (free, standard)\n- **ESLint** (typescript-eslint recommended config) — correctness, not style debates.\n- **Prettier** — formatting is automated, never reviewed.\n- No silent `catch` blocks: every catch either handles, rethrows, or logs with context.\n\n## Tests & dependencies\n- **Vitest** co-located tests (`foo.test.ts` next to `foo.ts` or in `test/`); every bug fix\n  starts with the failing test.\n- **npm audit** on dependencies — runs in `dev-spec-kit verify` via the audit kind below.\n\n## Bind these as dev-spec-kit checks\n```jsonc\n// .dev-spec-kit/config.json → verify\n\"kindRunners\": {\n  \"lint\":  { \"cmd\": \"npx\", \"args\": [\"eslint\", \".\"] },\n  \"audit\": { \"cmd\": \"npm\", \"args\": [\"audit\", \"--audit-level=high\"] }\n}\n// spec criteria can then bind: @check kind=lint ref=eslint  ·  @check kind=audit ref=npm-audit\n```\n"
      },
      {
        "name": "learnings.md",
        "content": "# dev-spec-kit learnings — append-only; a lesson counts once PROMOTED or HARDENED\n\n## 2026-06-11 Build-intent must veto research keywords in routing\n- Trigger: live demo routed \"i want a portfolio page … and compare with index\" to RESEARCH — the\n  word \"compare\" outweighed the explicit \"i want a … page\" build intent.\n- Lesson: investigative keywords are weak signals; build-intent (\"i/we want|need\", \"add/create/\n  implement\") must veto them. Misrouting a feature to research silently produces zero code.\n- Promoted to: check:test/workflow.test.ts::want-signals veto research routing (permanent\n  regression test, bound via task FIX-ROUTE-01 — red→fix→green through dev-spec-kit's own done-gate)\n\n## 2026-06-11 Proof identity must be the TESTED TREE, not the commit SHA  ⟨P1 · BLOCKER⟩\n- Trigger: adversarial review #1 (confirmed live): proofs stamp `git rev-parse HEAD` while the tree\n  is dirty — green can vouch for uncommitted code; and committing the tested code moves HEAD, so\n  every proof instantly flips stale.\n- Lesson: \"green means this code is proven\" requires the proof to identify the tree it ran against.\n  Stamp proofs with a content/tree hash (e.g. `git stash create` tree-hash or hash of bound files)\n  + a dirty flag; compute staleness against the tree hash; dirty-tree greens are `provisional`.\n- Promoted to: check:test/proof-identity.test.ts (HARDENED via FIX-PROOF-01 — proofs carry\n  tree+dirty; staleness compares trees with sha fallback for legacy entries; with tree identity a\n  dirty green is sound, so no provisional state was needed)\n\n## 2026-06-11 The spec→gate link must never freeze or clobber  ⟨P1⟩\n- Trigger: review #2/#3 (confirmed): `spec tasks` skips existing tasks so NEW `@check` obligations\n  are never enforced; bare `task create` on an existing id resets status and wipes recorded proofs.\n- Lesson: the spec is only the source of truth if re-derivation diffs bindings into existing tasks,\n  and `task.created` folds as create-if-absent — recorded evidence must be unclobberable.\n- Promoted to: check:test/spec-sync.test.ts (HARDENED via FIX-SPECSYNC-01 — create() refuses duplicates, fold is create-if-absent, syncBindings diffs spec refs in and reopens done tasks with new obligations)\n\n## 2026-06-11 User-editable inputs must never crash; infra errors are not test failures  ⟨P1⟩\n- Trigger: review #4/#8/#5 (confirmed): malformed config.json or a data-less journal line → raw\n  stack traces across commands; missing runner binary (ENOENT, status null) recorded as a RED proof.\n- Lesson: parse all inputs defensively with one helper + clear message; spawn errors/status null are\n  tooling errors, never proofs — they must not enter the graph.\n- Promoted to: check:test/robust.test.ts (HARDENED via FIX-ROBUST-01 — one defensive loadConfig + safe() CLI wrapper, data-less journal lines tolerated, RunnerUnavailableError instead of fake red proofs; timeout stays a red proof)\n\n## 2026-06-11 All gates must share one predicate, and absence of state must block  ⟨P1⟩\n- Trigger: review #6 (confirmed bypasses): `gh \"pr\" create`, `$GH pr create`, `gh api …/pulls`, and\n  `rm .dev-spec-kit/graph.json` all sail past the guard; `dev-spec-kit pr` blocks red/stale but not unproven —\n  three gates, three different predicates.\n- Lesson: one shared rule — \"anything not green blocks\" — applied by the hook, `guard pr`, and\n  `dev-spec-kit pr` alike; in a dev-spec-kit project a MISSING graph blocks (state absence ≠ permission);\n  `dev-spec-kit pr --create` must run the same guard it advertises.\n- Promoted to: check:test/gate.test.ts (HARDENED via FIX-GATE-01 — shared gateVerdict across hook/guard/pr, missing or unreadable graph BLOCKS, quote-stripped matcher + gh api …/pulls; $VAR indirection documented as known limit)\n\n## 2026-06-11 Worst-of obligation semantics everywhere — including the PR headline  ⟨P1 · quick⟩\n- Trigger: review #7 (confirmed): PR body counts a criterion proven if ANY binding is green; one\n  green + one red reports \"100% proven green\" exactly when a proof is failing.\n- Lesson: every consumer of proof state uses worst-of (`every(green)`), never any-of. The headline\n  number reviewers trust must be the strictest one.\n- Promoted to: check:test/workflow.test.ts::worst-of coverage in the PR body (HARDENED via FIX-PRMATH-01)\n\n## 2026-06-11 Parser must respect markdown reality  ⟨P2⟩\n- Trigger: review #11/#12/#13/#14 (confirmed): fenced code blocks become real requirements; blank-\n  line-separated EARS sentences merge into one criterion; bulleted/orphan `@check` lines silently\n  drop; `--mode bogus` accepted; `log -n 0` prints everything.\n- Lesson: silent loss of a proof obligation is the worst parser failure — fence-track, flush on\n  blank lines, strip list markers, warn on orphans, validate enums and numbers.\n- Promoted to: check:test/parse-fix.test.ts (HARDENED via FIX-PARSE-01 — fences invisible, blank lines separate criteria, bulleted @checks bind, orphan @checks WARN, assertMode + parseCount validate inputs)\n\n## 2026-06-11 Read-only must be read-only; retries must not burn deterministic reds  ⟨P2⟩\n- Trigger: review #15/#10/#9: `trace`/`affected`/`drift --dry-run` rewrite graph.json or trigger\n  re-index; TDD's expected red burns retryLimit+1 full Maven runs; equal-timestamp results resolve\n  by iteration order.\n- Lesson: queries take a no-write path; retry only on suspected flakiness (or `--expect-red` for\n  TDD); tie-break proofs deterministically toward the worse state.\n- Promoted to: check:test/query-fix.test.ts (HARDENED via FIX-QUERY-01 — materialize(write:false) for trace/affected/dry-run, --expect-red skips retry burn, equal-timestamp ties break toward the worse proof)\n\n## 2026-06-11 Scale & evidence quality backlog  ⟨P3⟩\n- Trigger: review #16-#19: full journal re-fold per command while audit events balloon the file;\n  red proofs carry no failure output; test anchors collide on same-named classes; concurrent\n  worktree waves can interleave journal writes and last-writer-wins graph.json.\n- Lesson: snapshot+tail folding; gate audit to mutating commands or honor memory.journal=\n  \"milestones\"; capture truncated failure tails in CheckResult; anchor by source path; file locking\n  before parallel waves ship.\n- Promoted to: check:test/scale.test.ts (HARDENED via SCALE-01 — withLock mkdir-mutex with stale-steal serializes journal appends across real processes; per-process (size,mtime)-keyed read cache; red proofs carry a 1500-char output tail; same-label code nodes each get anchor edges (ambiguity visible); memory.journal='milestones' skips read-only cli.run noise. Durable snapshot+tail folding deferred until journals measurably grow.)\n\n## 2026-06-11 Verification and review catch DIFFERENT bug classes — keep both\n- Trigger: during construction, bound checks caught 3 real bugs (stale Boot-3 import, ANSI-split\n  assertion, worst-of rollup); the adversarial review then found 20 MORE confirmed issues the\n  checks could not see (semantics, robustness, bypasses).\n- Lesson: evidence-bound done ≠ reviewed. The dev-spec-kit-review skill's two-pass doctrine is load-\n  bearing, not ceremony; schedule adversarial review at feature boundaries.\n- Promoted to: constitution#hard-rules — \"every feature gets an adversarial review pass before PR\"\n  (APPROVED by Pratiyush 2026-06-11; recorded in .dev-spec-kit/constitution.md)\n\n## 2026-06-11 The 17-gate proposal: menu yes, mandate no\n- Trigger: ChatGPT proposed 17 mandatory sequential checkbox gates before any coding.\n- Lesson: checkbox gates are enforcement-by-prose (tickable without truth) and mandatory ceremony\n  recreates the over-ceremony death spiral our research documented. But its CONTENT is valuable:\n  NFR/security/threat-model/API+data-contract checklists, AI metadata in the audit trail.\n- Promoted to: check:test/gate-packs.test.ts + check:test/audit-meta.test.ts (BOTH HARDENED — packs ship as editable config defaults, security trigger floors the mode, graph build enforces sections+kinds; journal meta + governance events landed). Its artifact\n  taxonomy (business/tech spec split, ADR, API+data contracts, test strategy) folds into\n  pack-required spec sections; ADR is already a VTG node type; \"AI Execution Plan\" = our task DAG.\n  Its \"no code before tests\" ordering: already stronger in dev-spec-kit (bindings at spec time, mechanical).\n\n## 2026-06-11 Gates can FORCE investigation, not just block (ECC GateGuard)\n- Trigger: ECC's DENY→FORCE→ALLOW gate ships A/B evidence (gated 9.0 vs ungated 6.75): blocking the\n  first edit until the agent gathers named facts (importers, schemas, verbatim instruction) changes\n  the output, because \"the investigation itself creates context.\"\n- Lesson: dev-spec-kit's guards should be able to demand evidence-gathering before retry — not only refuse.\n- Promoted to: check:test/gate-facts.test.ts (HARDENED via GATE-FACTS-01 — DENY→FORCE→ALLOW in guard-facts.mjs + engine/facts.ts; opt-in gates.facts='on'; 30-min window; 500-entry bounded state)\n\n## 2026-06-11 Protect the gates from the agent (anti-gaming)\n- Trigger: ECC `pre:config-protection` blocks edits to linter configs (\"fix code instead of weakening\n  configs\"). dev-spec-kit today lets an agent edit a bound test or spec mid-task to turn red green.\n- Lesson: while a task is in flight, edits to its spec criteria, bound test files, and gate config\n  require an explicit human-approved unlock — the moat must not be editable by the thing it gates.\n- Promoted to: check:test/protect.test.ts (HARDENED via GATE-PROTECT-01 — specs/config immutable while tasks in flight; bound test files lock AFTER their ref goes green (pre-green TDD stays free); human escape hatch `dev-spec-kit unlock` is time-boxed + journaled)\n\n## 2026-06-11 Gate packs: tier classifier + phase mask + security floor + YAML rules\n- Trigger: ECC orch-pipeline (trivial/small/standard/large → phase masks; \"anything touching a\n  security trigger or public API is AT LEAST standard\"; two named human gates; \"gated, not\n  autonomous\") + hookify-rules (markdown rules: event/pattern/conditions/action warn|block,\n  verb-first names) — our GATE-PACKS-01 design, independently convergent and field-tested.\n- Lesson: adopt this exact shape: routing tier picks the phase mask; security triggers floor the\n  tier; packs are user-editable rule files, not code.\n- Promoted to: check:test/gate-packs.test.ts (HARDENED via GATE-PACKS-01 — packs as config data: sections+kinds+triggers; security floor in route; enforcement in graph build; require empty by default)\n\n## 2026-06-11 Journal upgrades: governance events + \"confidence is not approval\"\n- Trigger: ECC decision-ledger (decision marks, coherence vs prior entries, promotion-gate results)\n  + governance-capture hook (secrets/policy-violation/approval-request as first-class events) +\n  provenance schema (source/created_at/confidence/author required on anything learned).\n- Lesson: journal event taxonomy should include governance kinds; learnings carry confidence +\n  evidence and promotion requires beating the incumbent, never self-declared confidence.\n- Promoted to: check:test/audit-meta.test.ts (HARDENED via AUDIT-META-01 — EventMeta actor/model/sources on journal events, cli.run stamped with git user/DEV_SPEC_KIT_MODEL, governance first-class event type 🛡️, unlock journals as governance; pack-seeded content remains with GATE-PACKS-01)\n\n## 2026-06-11 Finishing ritual + phase chaining (superpowers)\n- Trigger: finishing-a-development-branch (fresh test-evidence entry gate; fixed 4-option menu;\n  typed confirmation to discard; provenance check before cleanup) + every phase skill pins its sole\n  successor + checklists compile into tracked tasks, not prose.\n- Lesson: dev-spec-kit needs a completion ritual skill with evidence-gated entry and option-conditional\n  cleanup; skills should name their one successor so phases can't be silently skipped.\n- Promoted to: check:test/finish-skill.test.ts (HARDENED via FINISH-RITUAL-01 — skills/dev-spec-kit-finish: fresh-evidence entry gate via dev-spec-kit graph build, fixed 4-option menu, typed `discard`, provenance-checked cleanup, journaled landing)\n\n## 2026-06-11 Skill integration: COMPOSE, don't vendor (superpowers + ECC, both MIT)\n- Trigger: full catalog inventory — superpowers 14 skills, ECC 262 skills/64 agents/84 commands\n  (~230 are stack packs & domain verticals, consciously skipped). Both MIT; adaptation as original\n  prose unencumbered. Independent pass confirmed all five prior promotions (GATE-FACTS/PROTECT/\n  PACKS-01, AUDIT-META-01, FINISH-RITUAL-01).\n- Lesson: dev-spec-kit is the enforcement/traceability layer; generic craft (brainstorming, systematic-\n  debugging, worktrees, parallel dispatch, TDD craft) stays in superpowers — recommend alongside,\n  never duplicate. Absorb only mechanics that strengthen the moat. Net-new from this pass:\n  review content (silent-failure hunt, behavioral-vs-line coverage, verify-feedback-before-\n  implementing), retro instinct mechanics (confidence, project/global scope, promote on 2+ project\n  recurrence), phase-aware compaction, and compliance-QA of our own skills.\n- Promoted to: DONE this pass → dev-spec-kit-review + dev-spec-kit-retro skill enhancements + README pairing note;\n  check:test/compact.test.ts + check:test/skill-qa.test.ts (BOTH HARDENED — phaseBoundary + renderResume + dev-spec-kit resume + PreCompact resume-save.mjs hook + 💾 checkpoint hint at 100%; structural skill QA validates frontmatter, RFC-2119 teeth, and that every referenced command/artifact exists — it caught a bare .dev-spec-kit/ ref on first run. LLM-judged compliance scenarios remain a future layer.)\n\n## 2026-06-12 A grammar that can't spell its own kinds drops obligations silently\n- Trigger: RUNNERS-01's kind-resolution test failed — CHECK_LINE's kind pattern was [a-z]+, so\n  `kind=e2e` (digit!) never matched and e2e bindings had parsed as PROSE since day one. No error,\n  no warning: the obligation just vanished.\n- Lesson: grammar character classes must be derived from the actual vocabulary (e2e has a digit);\n  every enum the parser accepts needs at least one test using its trickiest member.\n- Confidence: high (reproduced; permanent test) · Scope: project\n- Promoted to: check:test/runners-kind.test.ts (kind=e2e resolution is now asserted forever)\n\n## 2026-06-12 Test fixtures must pin every git assumption the host can override\n- Trigger: WAVE-01's fixture broke twice on this machine's `init.defaultBranch=master` — a push\n  refspec assumed a local `main`, and a bare origin's HEAD pointed at a branch we never pushed.\n- Lesson: fixtures that shell out to git must pin branch names (`init -b`, `push HEAD:\u003cbranch>`),\n  identity, and HEAD explicitly — host config is part of the environment under test.\n- Confidence: high (two failures, same cause) · Scope: global (applies to any repo's git fixtures)\n- Promoted to: check:test/wave.test.ts (the fixture itself now pins -b main + HEAD:main)\n\n## 2026-06-12 The journal must not stale its own proofs\n- Trigger: first self-graph of the dev-spec-kit repo — drift re-proved 3/3 PASS yet all stayed STALE\n  forever: recording a proof appends to the tracked journal, which changed the tree-hash the proof\n  was compared against. The bookkeeping invalidated the evidence it was keeping.\n- Lesson: proof identity = the CODE tree only. Build a temp index from HEAD, drop .dev-spec-kit/, add the\n  working state (now INCLUDING untracked files — closes the stash-create blind spot), write-tree.\n  A system whose act of measurement changes the measurement is not a measurement system.\n- Confidence: high (reproduced live; permanent regression test) · Scope: project\n- Promoted to: check:test/proof-identity.test.ts (FIX-PROOF-02 — journal-append keeps identity,\n  code change moves it, untracked files count; drift now converges 3/3 green on this very repo)\n\n## 2026-06-11 Doctor's graphify install hint reads as a typosquat to security tooling\n- Trigger: dogfooding the notepad app — `dev-spec-kit doctor` flags graphify as the only required red with\n  hint `pip install graphifyy && graphify install`. Claude Code's permission classifier auto-DENIED\n  the command as \"agent-chosen, typosquat-looking package … untrusted external code execution\"\n  (PyPI name 'graphifyy' ≠ CLI name 'graphify'), so an agent cannot self-heal doctor's one required\n  prerequisite; setup stalls on a human.\n- Lesson: a name-mismatched install hint is indistinguishable from a supply-chain attack to policy\n  bots and cautious humans. Options: publish under the CLI's own name, state provenance in the hint\n  (\"graphifyy is dev-spec-kit's companion package — \u003crepo url>\"), let doctor accept a vendored/bundled\n  graphify path, or degrade gracefully (graph features off with a clear enable message) instead of\n  a required red.\n- Confidence: medium (one environment, but the classifier's reasoning generalizes)\n- Scope: project\n- Promoted to: check:test/doctor-fix.test.ts (HARDENED via FIX-DOCTOR-01 — graphify is optional-with-consequences in doctor, never a required red; install hint carries provenance + source repo + 'optional' framing so classifiers and humans can trust it)\n\n## 2026-06-11 \"Stack\" names two disjoint enums — config rejects the runner vocabulary\n- Trigger: dogfooding the notepad setup — the project brief says \"stack node-vitest\" (matching\n  `check run --stack` / BUILTIN_STACKS in engine/verify/runner.ts), but `project.stacks` in\n  config.json is a different enum (java-maven|…|node|typescript|react|…). Setting\n  `\"stacks\": [\"node-vitest\"]` fails EVERY command with an enum error whose valid values share no\n  overlap with runner ids and no pointer to where runner stacks actually live.\n- Lesson: one word naming two disjoint enums guarantees mis-filing by users and agents alike.\n  Either unify/rename (e.g. `project.stacks` → `project.platforms`, runner ids stay \"stacks\"), or\n  make the config error disambiguate: \"node-vitest is a RUNNER stack — pass it to `check run\n  --stack` or configure verify.runners; project.stacks describes the codebase (typescript, react…)\".\n- Confidence: high (reproduced; the project's own brief conflates the two)\n- Scope: project\n- Promoted to: check:test/stacknames.test.ts (HARDENED via FIX-STACKNAMES-01 — project.stacks renamed to project.platforms (legacy key ignored harmlessly); filing a runner stack there now yields a disambiguating error pointing to `check run --stack` / verify.runners)\n\n## 2026-06-12 The printed proof stamp showed HEAD, not the proof's identity\n- Trigger: dogfooding the notepad vault feature — a TDD red and its green ran against DIFFERENT\n  code (stub → implementation, both uncommitted) yet both printed \"@ 9aa40ae2\": checkRun stamped\n  `result.sha` (HEAD) while the journal correctly recorded distinct `tree` hashes. Cost a live\n  P1-scare detour into the journal to rule out a proof-identity regression.\n- Lesson: every printed identity must be the SAME identity the system reasons with (FIX-PROOF-01/02\n  made that the tree) — a stale-but-familiar id invites false bug reports and, worse, false\n  confidence. Related: the PR-body stamp (workflow.test.ts pins \"@ abc12345\") may deserve the same\n  treatment.\n- Confidence: high (reproduced live; permanent test)\n- Scope: project\n- Promoted to: check:test/proof-display.test.ts::stamps the tree identity, not the commit sha\n  (FIX-PROOF-03 — red→green through dev-spec-kit's own done-gate; stamp = \"tree \u003chash8>\" + \"*\" dirty\n  marker, sha only as legacy fallback; landed in commit 96ce52a authored by Pratiyush)\n\n## 2026-06-12 Provenance lines must not pin facts that rot (or were never true)\n- Trigger: FIX-DOCTOR-01's improved graphify hint says \"Source: github.com/safishamsi/graphify\n  (213k★)\" — live GitHub API shows the repo is real but has ~65.6k stars. An inflated number\n  inside the very line meant to establish trust undercuts it; star counts hardcoded in CLI\n  strings are stale the day they ship.\n- Lesson: provenance = verifiable pointers (URL, package name, owner), never point-in-time\n  vanity metrics. If popularity matters, phrase it un-rottably (\"65k+ stars as of 2026-06\") or\n  let the reader click. (The repo itself checks out — graphifyy install is trustworthy.)\n- Confidence: high (checked via GitHub API live)\n- Scope: project\n- Promoted to: check:test/doctor-fix.test.ts::pins no point-in-time vanity metrics (HARDENED via\n  FIX-PROV-01 — hint is verifiable pointers only; revitify-first wording landed with FEAT-REVITIFY-01)\n\n## 2026-06-12 PR body and LEDGER still stamp commit sha (anticipated tail of the proof-display lesson)\n- Trigger: finishing vault-persistence in the notepad — `dev-spec-kit pr` emitted \"proven green (100%) at\n  `3311f7bb`\" and LEDGER.md rows print \"@ 6903f20f\" (bare commit shas) while every proof in the\n  journal is identified by tree (`70786fd1`). Harmless this run (tree was clean, so sha↔tree map\n  1:1), but on any dirty-tree run these surfaces repeat the exact misdirection FIX-PROOF-03 cured\n  in the CLI stamp.\n- Lesson: \"printed identity = the identity the system reasons with\" wasn't applied to all\n  printers — when changing an identity scheme, sweep every surface that renders a proof (PR body,\n  LEDGER.md, TRACKING.md, dashboards), not just the surface that triggered the report.\n- Confidence: high (observed live; .dev-spec-kit/pr-body.md + LEDGER.md on notepad branch worktree-vault-07-08)\n- Scope: project\n- Promoted to: check:test/proof-display.test.ts::FEAT-PROOF-04 sweep (HARDENED via FIX-PROOF-04 —\n  shared engine/verify/stamp.ts renders tree+dirty in PR body, approvals, audit log/LEDGER;\n  workflow.test.ts pin updated to tree identity)\n\n## 2026-06-12 A broken session must cost zero re-orientation  ⟨P2⟩\n- Trigger: the notepad dogfood session died mid-batch on connectivity; `dev-spec-kit status` + `rivet\n  resume` + the journal re-oriented a fresh session losslessly — twice in one day — but only\n  because a human knew to run them first.\n- Lesson: \"resume-first after any break\" is tool knowledge, not human knowledge — the workflow and\n  finish skills must state it as a hard first step so any agent session starts from recorded truth.\n- Confidence: high (two live recoveries) · Scope: project\n- Promoted to: skills/dev-spec-kit-workflow + dev-spec-kit-finish hard rules (HARDENED via FEAT-VERIFY-01 —\n  resume-first is step zero in both; skill-qa enforces the files stay real)\n\n## 2026-06-12 Requirement ids are read by humans out of context — they must self-describe\n- Trigger: Pratiyush, reading boards/PR bodies from the notepad run: \"Don't use R-VAULT etc — use\n  FULLY QUALIFIED NAMES.\" `R-` carries zero meaning to anyone who didn't write the parser.\n- Lesson: ids travel without their spec (PR bodies, LEDGER, dashboards, chat). The prefix must\n  carry the noun: REQUIREMENT_VAULT-01, NFR_PERF-01, ADR_STORAGE-01. Enforce as a lint\n  (configurable warn|error|off) — never break parsing of old specs.\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/qualified-ids.test.ts (HARDENED via FEAT-IDS-01 — REQUIREMENT_/NFR_/ADR_\n  prefixes, configurable lint, ADR exempt; own spec migrated and re-proven)\n\n## 2026-06-12 Edge-case coverage mandates in prose are ignorable — make absence detectable\n- Trigger: Pratiyush: \"Use Gherkin test cases but cover more ground — 100%, edge cases etc,\n  every test has to be very solid.\" The spec-author skill already says \"hunt unhappy paths\";\n  nothing notices when a spec ships without a single failure criterion.\n- Lesson: a requirement with zero negative/failure criteria is an UNVERIFIED-shaped hole the\n  graph must flag, exactly like an unbound criterion. Gherkin (Scenario + Scenario Outline with\n  Examples) becomes first-class and the default; the floor is mechanical, on everywhere.\n- Confidence: high (direct user feedback + matches FLOOR-C instinct) · Scope: project\n- Promoted to: check:test/gherkin.test.ts (HARDENED via FEAT-GHERKIN-01 — Scenario + Outline/Examples\n  expansion, gherkin default, off-format lint, gates.negativeFloor on everywhere; own spec grew\n  negative criteria incl. a Gherkin failure Scenario)\n\n## 2026-06-12 A green task is not a green project — \"Build ALL + run ALL kinds\" needs one command\n- Trigger: Pratiyush: \"Build ALL. Run All Type Test.\" Tasks prove their bound checks; nothing\n  proves the whole tree builds and every configured kind passes before a PR.\n- Lesson: one journaled `dev-spec-kit verify` (build + every kind, full suites, report-all) carrying the\n  code-tree hash is the only honest PR precondition — and it must be a hard gate in guard-pr\n  (green + same tree), not skill prose.\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/verify-cmd.test.ts (HARDENED via FEAT-VERIFY-01 — dev-spec-kit verify runs\n  build+ALL kinds report-all, journaled with tree hash; verifyVerdict hard-gates guard-pr/pr;\n  hook gains the exists+green fast veto)\n\n## 2026-06-12 Post-task evidence must be scannable — table, not prose\n- Trigger: Pratiyush: \"Tabular format of report after task.\" `task done` prints a progress bar;\n  the actual evidence (which checks, what kind, what proof, which tree) is in the journal where\n  nobody looks.\n- Lesson: the moment of \"done\" is when evidence must be shown: a 📋 table (Check | Kind | State |\n  Proof | Proven at) in the terminal AND persisted per-task in LEDGER.\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/task-report.test.ts (HARDENED via FEAT-REPORT-01 — 📋 table at task done\n  + persisted per-task in LEDGER, stale-honest, tree-stamped)\n\n## 2026-06-12 Emoji are an event-type grammar — central map with a plain fallback\n- Trigger: Pratiyush: \"Use more emojis, at least 6-10 more types.\" Current emoji are scattered\n  string literals; adding types means hunting call sites, and CI logs can't opt out.\n- Lesson: one emoji map keyed by event type (≥10 new: 🧪📋🧭✍️📦⏱️♻️🧰🔍🚀📝🧹), every renderer\n  reads it, and !TTY / NO_EMOJI=1 / --plain degrade to ASCII labels so logs stay greppable.\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/emoji.test.ts (HARDENED via FEAT-EMOJI-01 — central map, 10 new types,\n  --plain/NO_EMOJI/TTY degradation, LEDGER legend)\n\n## 2026-06-12 Init must seed standards, not just folders — per-platform law packs\n- Trigger: Pratiyush: \"If project is initialized, add best practices for different types of\n  projects — TypeScript and Electron, and multiple langs can be used in a project.\" Today\n  `dev-spec-kit init` writes config + an empty laws file; quality standards stay in the human's head.\n- Lesson: `init --platforms` seeds scoped law packs (TypeScript/Electron/Java/Python/\n  quality-gates/polyglot), 100% free/OSS tools, each ending with \"Bind these as dev-spec-kit checks\"\n  wiring — standards arrive pre-wired to enforcement, and platforms is an ARRAY (polyglot is\n  normal, not an edge case).\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/init-practices.test.ts (HARDENED via FEAT-INITPACKS-01 — init --platforms\n  seeds scoped law packs (ts/electron/java/python/quality-gates/polyglot), free/OSS-only, check\n  wiring included; this repo self-adopted: ESLint+Prettier+lint-staged, lint as a verify kind)\n\n## 2026-06-12 The graph layer must not depend on someone else's pip package\n- Trigger: Pratiyush: clone github.com/safishamsi/graphify and create a modular TS counterpart\n  named **revitify**. Root cause chain: doctor's graphify hint already burned us twice\n  (typosquat-looking install auto-DENIED; star count rotted) — the dependency itself is the\n  liability, not just its hint.\n- Lesson: anything moat-adjacent (the visual/queryable graph) needs a native, in-repo provider.\n  revitify = packages/revitify workspace pkg, same output contract as graphify (graph.json /\n  graph.html / GRAPH_REPORT.md) so the engine swaps providers invisibly; external graphify stays\n  available behind config for those who want its full multi-modal power.\n- Confidence: high (two prior lessons + direct instruction) · Scope: project\n- Promoted to: check:packages/revitify/test/revitify.test.ts (HARDENED via FEAT-REVITIFY-01 —\n  native TS provider, graphify output contract proven against loadCodeGraph, provider config,\n  445 code nodes self-hosted; upstream pinned in packages/revitify/.track @ 0.8.38/#1271)\n\n## 2026-06-12 Depth on one harness beats breadth — say it out loud\n- Trigger: Pratiyush: \"Focus it for only Claude Code now, later we extend it.\"\n- Lesson: docs/skills are already Claude-Code-only by construction; the README must SAY so\n  (\"Built for Claude Code first; other assistants later.\") so contributors don't generalize\n  early and dilute the hook/skill integration that is the moat.\n- Confidence: high (direct user feedback) · Scope: project\n- Promoted to: check:test/readme.test.ts::declares the Claude-Code-first focus explicitly\n  (HARDENED via FEAT-CCFIRST-01)\n\n## 2026-06-12 Piped CLI output swallows the exit code the gate depends on  ⟨P2⟩\n- Trigger: this batch — `dev-spec-kit check run … | tail -1` let a && chain continue past a FAILING\n  check (tail exits 0), committing a broken test that only the done-gate caught one step later.\n- Lesson: every scripted/agent invocation of gate-bearing commands must run with `set -o pipefail`\n  (or capture status explicitly) — a gate whose exit code is eaten by a pipe is decoration.\n- Confidence: high (reproduced live this session) · Scope: global (any shell automation)\n- Promoted to: skills/dev-spec-kit-workflow hard rule (\"Scripted check runs MUST preserve exit codes\") —\n  HARDENED; the done-gate caught the slipped commit, the rule prevents the next one\n\n## 2026-06-12 The done-gate accepted STALE evidence  ⟨P1 · found by our own 📋 table⟩\n- Trigger: closing FEAT-REVITIFY-01 this batch — the new per-task evidence table printed the bound\n  proof as 🟣 stale (tree had moved between the run and `task done`) yet the gate said DONE:\n  markDone only asks \"is there a passing run\", never \"does that run vouch for the CURRENT code\".\n- Lesson: worst-of must hold at the done-gate too — a pass recorded on an older tree is NOT green\n  evidence for the code being declared done. Block (or done-with-warnings under\n  verify.blockDoneOnFail=false) and tell the human exactly which refs to re-run.\n- Confidence: high (observed live in this session's own output) · Scope: project\n- Promoted to: check:test/stale-done.test.ts (FIX-STALEDONE-01, this session)\n\n## 2026-06-12 Untracked reference material must be gitignored the moment it lands  ⟨P2⟩\n- Trigger: a routine `git add -A` swept `_ref/` (9 embedded reference repos!) and `.claude/` into a\n  release commit; caught by the embedded-repo warnings and amended out.\n- Lesson: \"untracked but precious\" is a trap — anything meant to stay out of history gets its\n  .gitignore line in the SAME change that creates it, never later.\n- Confidence: high (live near-miss) · Scope: global\n- Promoted to: .gitignore (_ref/, .claude/worktrees/, .claude/settings.local.json) — structural;\n  the class is covered by this entry + memory note for future sessions.\n\n## 2026-06-12 A relative file: dependency breaks every worktree  ⟨P2 · found mid-fix⟩\n- Trigger: pnpm install inside the batch worktree failed — `file:../revitify` resolves relative to\n  the INSTALLING dir, so from `.claude/worktrees/\u003cname>/` it points at a void. dev-spec-kit's own wave\n  dispatch (one worktree per task) would hit this on every parallel task.\n- Lesson: location-relative dependencies and worktree-based parallelism are structurally at odds;\n  a machine-local sibling dep must be an ABSOLUTE file: path (it was already machine-local by\n  choice — the relative form only pretended to be portable).\n- Confidence: high (reproduced live) · Scope: global (any repo pairing file: deps with worktrees)\n- Promoted to: package.json (link:/Users/pratiyush/Github/revitify — pnpm's link: protocol; bare\n  absolute file: mis-parses) + this entry; revisit at\n  Phase E packaging when revitify ships to npm and the file: dep disappears entirely.\n\n## 2026-06-12 The commit-time formatter stales every pre-commit proof  ⟨P2⟩\n- Trigger: cockpit batch — lint-staged's `prettier --write` reformatted 4 staged files INSIDE the\n  commit, so the committed tree differed from the tree drift had just proved; main landed with\n  21/21 proofs stale despite an all-green pre-commit gauntlet.\n- Lesson: prove against the bytes that will actually land — format BEFORE the final prove/verify\n  (`npx prettier --write src test` then drift/verify), or expect one post-commit drift pass.\n  A formatter in the commit path is a tree-mover like any other edit.\n- Confidence: high (observed live; mechanism certain) · Scope: global (any repo with staged formatters)\n- Promoted to: skills/dev-spec-kit-workflow hard rule (this entry) — \"format before the final prove:\n  commit-time formatters move the tree and stale fresh proofs\"\n\n## 2026-06-12 The adversarial review found a LAN-exposed config-write server the checks could not see  ⟨P1⟩\n- Trigger: cockpit's `dev-spec-kit web` shipped through 9 green bound checks; the deferred adversarial\n  review (laws.md hard rule) then found 12 issues — including TWO P1 security holes the checks\n  structurally could not catch: the server bound 0.0.0.0 (LAN-exposed, unauthenticated\n  GET /api/state leaking specs/laws/journal + POST /api/config writing disk), and the GATE-PROTECT\n  unlock over-matched so `dev-spec-kit unlock tsconfig.json` opened the .dev-spec-kit/config.json gate.\n- Lesson: \"verification and review catch different bug classes\" applies hardest to NETWORK surfaces\n  — bound tests prove behavior, only an adversary's eye proves the absence of a bypass. Any feature\n  that opens a socket or a gate MUST get the adversarial pass BEFORE merge, not after. Run it at the\n  feature boundary, never defer it past the PR.\n- Confidence: high (both P1s reproduced + pinned) · Scope: project\n- Promoted to: check:test/cockpit-hardening.test.ts (FIX-COCKPIT-SEC-01 — loopback bind, exact\n  unlock match, schema-clean write, body cap, CSRF/Origin check, + 5 robustness fixes; the two\n  browser-asset findings (#4 json control, #9 view-state) verified by inspection, browser-only)\n"
      },
      {
        "name": "DEFER.md",
        "content": "# DEFER — consciously postponed (each entry: why + when to revisit)\n\n## Intake adapters: GitHub / GitLab issues + Jira (P6)\n- **Why deferred:** Pratiyush (2026-06-12): intake comes from user input via Claude Code CLI for now\n  (\"we will do GitHub and GitLab issues and Jira integration later, it is not really required at this\n  moment\"). The raw path (`.dev-spec-kit/intake/*.md` + `dev-spec-kit route --file`) covers the actual workflow.\n- **To revisit:** when dev-spec-kit is used on a project whose work actually arrives as tickets, or at the\n  public launch when team usage begins. Config groundwork (`intake.sources`, `intake.jiraEpic`,\n  `intake.writeBack`) already exists — only the adapters are missing.\n\n## Packaging & publish: npm + plugin marketplace listing (P7)\n- **Why deferred:** Pratiyush (2026-06-12): \"defer packaging… we can do it later, and plugin\n  marketplace listing later.\" First: build real apps WITH dev-spec-kit, learn, and improve from those\n  lessons before freezing a public artifact.\n- **Dogfood trigger MET (2026-06-19):** revitify was built end-to-end *with* dev-spec-kit (the first real\n  app dogfood), so the \"≥1 app built with dev-spec-kit\" condition to revisit packaging is satisfied.\n- **Public-brand DECIDED (2026-06-19): `dev-spec-kit`.** An availability sweep (npm + GitHub +\n  .ai/.dev/.io) showed the **\"Rivet/RivetKit\" brand is already occupied** — `rivet` on npm is Pact's\n  API-contract tool, and `rivetkit` + rivet.io/.ai/.dev belong to **rivet.gg** (active company,\n  product literally \"RivetKit\"). So the originally-planned `rivet-kit` name was dropped. `dev-spec-kit`\n  is free on every surface (npm `dev-spec-kit` & `devspeckit`, GitHub `devspeckit`, devspeckit.ai/.dev/.io).\n- **FULL rename DONE (2026-06-19, PR #5):** to fully escape the collision, the tool was renamed\n  end-to-end — command `rivet`→`dev-spec-kit`, state dir `.rivet/`→`.dev-spec-kit/`, 12 skills, plugin,\n  env vars `RIVET_*`→`DEV_SPEC_KIT_*`, npm name+bin, hooks. (NOT renamed, separate follow-ups:\n  `website/**` tagline rework, the verbatim cockpit-assets/`.design` dashboard shell, internal type\n  symbols.)\n- **Still human-gated (your explicit action):** registering devspeckit.ai/.dev/.io (paid), claiming\n  the GitHub `devspeckit` org/handle, the actual `npm publish` as `dev-spec-kit`, docs pass,\n  marketplace listing.\n\n## Durable journal snapshot+tail folding\n- **Why deferred:** per-process (size,mtime) read cache covers current scale; snapshotting adds\n  invalidation risk with no measured need. (Ledger: SCALE-01.)\n- **To revisit:** when a real journal measurably slows commands (>~50k events).\n\n## LLM-judged skill compliance scenarios\n- **Why deferred:** structural skill-QA (commands/artifacts must exist) ships; judged compliance\n  needs an eval budget and stable scenarios. (Ledger: SKILL-QA-01.)\n- **To revisit:** pre-publish hardening, alongside the docs pass.\n\n## Live Spring `withApp` e2e showcase\n- **Why deferred:** Pratiyush (2026-06-12): showcase only; the lifecycle is already proven in-suite\n  against a real HTTP server (RUNNERS-01). Spinning Spring adds demo value, not verification value.\n- **To revisit:** before the public launch demo reel, or first real api/e2e-kind project.\n\n## Sonnet-driven temporary e2e demo (master-prompt dry run)\n- **Why deferred:** Pratiyush (2026-06-12): the REAL app-dogfood phase (him + master prompt)\n  supersedes a synthetic dry run.\n- **To revisit:** only if the app phase stalls and we need a cheap rehearsal first.\n\n## Behavioral cockpit e2e (Playwright against `dev-spec-kit web`)\n- **Why deferred:** the cockpit shell is browser-only vanilla JS; FIX-COCKPIT-ASSETS-01 pins the\n  json-control (#4) and auto-reload-state (#9) wiring with a source-presence regression guard, which\n  covers the regression risk. A true behavioral test needs a browser driver.\n- **To revisit:** Phase D pre-publish hardening, alongside the docs pass — add Playwright (already\n  the recommended E2E tool in the electron/init best-practice pack) and drive a real `dev-spec-kit web`.\n"
      },
      {
        "name": "specs/cli-ux.md",
        "content": "# Feature: CLI audit trail & progress visibility\n\n> User story: As the user, I want every dev-spec-kit action audit-logged and a progress view after each\n> completed task, so that I can always see what was done and what remains.\n> Intake: Pratiyush, 2026-06-11 — \"add jsonl logging for dev-spec-kit as audit logs so we can see what all\n> is done; after completing one task dev-spec-kit should show pending tasks or features with progress with emoji.\"\n\n## Requirement REQUIREMENT_AUDIT-01 — every CLI invocation is audit-logged\n\nWHEN any dev-spec-kit command runs inside a dev-spec-kit project THEN the system SHALL append a `cli.run` event\n(command path + arguments + timestamp) to the append-only journal `.dev-spec-kit/journal.jsonl`.\n\n@check kind=unit ref=test/cli-ux.test.ts::audits cli invocations into the journal\n\nIF dev-spec-kit runs outside a dev-spec-kit project THEN the system SHALL NOT write any audit event.\n\n@check kind=unit ref=test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects\n\n## Requirement REQUIREMENT_AUDIT-02 — the audit trail is readable\n\nWHEN `dev-spec-kit log` runs THEN the system SHALL print the journal events in chronological order with\ntimestamps and per-type emoji, and WHEN `--json` is passed THEN the system SHALL emit raw JSONL.\n\n@check kind=unit ref=test/cli-ux.test.ts::renders the audit trail with per-type emoji\n\nIF the journal contains an event missing its data payload THEN the system SHALL render the audit trail without crashing.\n\n@check kind=unit ref=test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold\n\n## Requirement REQUIREMENT_PROG-01 — progress with emoji after completing a task\n\nWHEN a task transitions to done THEN the system SHALL display the remaining tasks and features with\nper-task emoji status, per-check proof lights, an overall progress bar with percentage, and the\nsuggested next task.\n\n@check kind=unit ref=test/cli-ux.test.ts::renders progress with emoji, bar, and next-up\n\nScenario: empty board shows an explicit empty state, not a broken bar\n  Given a project with no tasks\n  When the progress view renders\n  Then it states there are no tasks instead of rendering an empty bar\n\n@check kind=unit ref=test/cli-ux.test.ts::renders an explicit empty state when there are no tasks\n\n## Requirement NFR_AUDIT-03 — auditing never breaks the CLI\n\nIF dev-spec-kit runs outside a dev-spec-kit project THEN the system SHALL NOT create a journal or write any audit event.\n\n@check kind=unit ref=test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects\n"
      },
      {
        "name": "specs/cockpit.md",
        "content": "# Feature: dev-spec-kit Cockpit — the web UI (dashboard + config studio)\n\n> User story: As Pratiyush, I want one cockpit rendering my project's evidence and configuration\n> from a single machine-written data file, so that truth is always one glance (and one save) away.\n> Intake: .dev-spec-kit/intake/config-studio-and-live-dashboard.md · Design: .design/dev-spec-kit-cockpit/\n> Architecture: STATIC SHELL (written once, version-stamped) + `rivet.data.js` sidecar\n> (window.RIVET, rewritten by the CLI) — file:// cannot fetch JSON, script tags work.\n\n## Requirement REQUIREMENT_COCKPIT-01 — config manifest generated from the schema\n\nScenario: every knob arrives explained\n  Given the zod config schema\n  When the manifest is generated for a project\n  Then every leaf knob carries section, path, type, default, current value, changed flag, and a non-empty description\n\n@check kind=unit ref=test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)\n\nScenario: enum and record knobs carry their vocabulary\n  Given knobs like spec.criteriaFormat and verify.kindRunners\n  When the manifest is generated\n  Then enums list their allowed values and command-records expose the cmd/args record shape\n\n@check kind=unit ref=test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape\n\nScenario: an undescribed or unsupported knob fails loudly, never silently\n  Given a schema node the walker does not understand or a leaf without a description\n  When the manifest is generated\n  Then generation throws naming the offending path instead of silently dropping the knob\n\n@check kind=unit ref=test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path\n\n## Requirement REQUIREMENT_COCKPIT-02 — the RIVET data sidecar is the project's truth\n\nScenario: the sidecar carries every surface the cockpit renders\n  Given a project with tasks, requirements, approvals, journal events, and .dev-spec-kit markdown artifacts\n  When the sidecar builds\n  Then window.RIVET contains meta (refreshSeconds, inFlightTasks), dashboard (completion, validates, drift, tasks with failure tails, requirements with per-criterion proofs, approvals, governance, activity) and config (sections + manifest)\n\n@check kind=unit ref=test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest\n\nScenario: stale evidence renders stale, not green\n  Given a task whose passing result was recorded on an older code tree\n  When the sidecar builds\n  Then that check result is marked stale so the cockpit shows 🟣, never 🟢\n\n@check kind=unit ref=test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar\n\nScenario: hostile artifact content cannot escape the script tag\n  Given a .dev-spec-kit markdown file containing a closing script tag\n  When the sidecar is written\n  Then the payload escapes it so the document cannot be broken or scripted\n\n@check kind=unit ref=test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar\n\n## Requirement REQUIREMENT_COCKPIT-03 — static shell emission, written once\n\nScenario: the cockpit emits shell plus sidecar\n  Given a dev-spec-kit project\n  When the cockpit is emitted\n  Then .dev-spec-kit/cockpit/ contains index.html, rivet.css, the four JS modules, and rivet.data.js, and index.html loads the sidecar via a script tag\n\n@check kind=unit ref=test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar\n\nScenario: re-emission refreshes data but never rewrites an unchanged shell\n  Given a cockpit emitted at the current shell version\n  When the cockpit is emitted again\n  Then rivet.data.js is rewritten while the shell files are left untouched\n  And a bumped shell version rewrites the shell\n\n@check kind=unit ref=test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes\n\n## Requirement REQUIREMENT_COCKPIT-04 — live updates after every proof event\n\nScenario: live mode keeps the open cockpit current\n  Given dashboard.updates is \"live\"\n  When a task completes or a check records\n  Then the sidecar is rewritten so the auto-reloading shell shows the new truth within refreshSeconds\n\n@check kind=unit ref=test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run\n\nScenario: on-demand mode stays quiet\n  Given dashboard.updates is \"on-demand\"\n  When a task completes\n  Then no sidecar write happens outside dev-spec-kit dashboard\n\n@check kind=unit ref=test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events\n\n## Requirement REQUIREMENT_COCKPIT-05 — the config save server\n\nScenario: a valid save lands in config.json\n  Given the cockpit server is running with no tasks in flight\n  When a valid config posts to /api/config\n  Then .dev-spec-kit/config.json is rewritten with the merged config and the save is journaled as governance\n\n@check kind=unit ref=test/cockpit-server.test.ts::a valid POST saves config.json and journals governance\n\nScenario: an invalid save returns field errors and writes nothing\n  Given the cockpit server is running\n  When a config with an invalid enum value posts to /api/config\n  Then the response carries the offending path and message and config.json is unchanged\n\n@check kind=unit ref=test/cockpit-server.test.ts::an invalid POST returns field errors and never writes\n\nScenario: GATE-PROTECT refuses saves while tasks are in flight\n  Given a task is in progress and no unlock window is active\n  When any config posts to /api/config\n  Then the save is refused with GATE-PROTECT-01 and the dev-spec-kit unlock hint and config.json is unchanged\n\n@check kind=unit ref=test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint\n\nScenario: the state endpoint serves fresh truth\n  Given the cockpit server is running\n  When GET /api/state is requested\n  Then the full RIVET object returns with serverMode true\n\n@check kind=unit ref=test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode\n"
      },
      {
        "name": "specs/docs-refresh.md",
        "content": "# Feature: Documents that cannot go stale\n\n> User story: As Pratiyush, I want every generated document refreshed whenever anything changes,\n> so that no surface — board, resume, graph, cockpit — can ever show yesterday's truth.\n> Intake: \"everytime we change anything here it should update the documents\" (Pratiyush, 2026-06-12,\n> after the stale-dashboard investigation). Generalizes BOARDS-01's \"boards cannot lie\" to ALL\n> generated documents.\n\n## Requirement REQUIREMENT_DOCS-01 — every mutation refreshes every generated document\n\nScenario: a task mutation refreshes all truth surfaces\n  Given a project whose dashboard updates live\n  When a mutating command runs\n  Then LEDGER.md, TRACKING.md, RESUME.md, graph.json and the cockpit sidecar all reflect the new state\n\n@check kind=unit ref=test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar\n\nScenario: drift re-proofs refresh the documents\n  Given a stale proof that dev-spec-kit drift re-greens\n  When the drift re-runs complete\n  Then the cockpit sidecar and the boards show the re-greened truth\n\n@check kind=unit ref=test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving\n\nScenario: read-only queries never write documents\n  Given a project where no cockpit was ever emitted\n  When a read-only query runs\n  Then no document is created or modified — read-only stays read-only\n\n@check kind=unit ref=test/docs-refresh.test.ts::read-only queries never create or touch documents\n\nScenario: on-demand opts the sidecar out while boards still refresh\n  Given dashboard.updates is \"on-demand\"\n  When a mutating command runs\n  Then the boards refresh while no sidecar is written\n\n@check kind=unit ref=test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar\n"
      },
      {
        "name": "specs/proof-integrity.md",
        "content": "# Feature: Proof-layer integrity — the green light cannot lie\n\n> User story: As a dev-spec-kit user, I want a \"green\" check to mean a test actually executed and passed —\n> never a vacuous pass from a name that matched nothing, and never a crash from a flag-like test\n> name — so that the Verified Traceability Graph's edges are trustworthy by construction.\n> Intake: dogfood feedback 2026-06-13 — \"a bad -t match can silently pass with 0 tests, which is\n> worse than failing\"; \"vitest -t swallows ---prefixed names (CACError) … I had to rename the test.\"\n\n## Requirement REQUIREMENT_TRUST-01 — a name-filtered run that matches zero tests is never a pass\n\nWHEN a bound check runs a JS test runner (vitest/jest) with a `::name` selector AND the name matches\nno test THEN the system SHALL record the proof as FAILED, because a run in which zero tests executed\nproves nothing — an exit-0 \"no test matched\" is the most corrosive possible false-green.\n\n@check kind=unit ref=test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0\n@check kind=unit ref=test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof\n\nWHEN the named test exists and passes THEN the system SHALL record the proof as PASSED.\n\n@check kind=unit ref=test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof\n\nIF the JS runner exits 0 but writes no JSON report THEN the system SHALL refuse to record a proof\n(treat it as a tooling failure) rather than infer a green it cannot confirm.\n\n@check kind=unit ref=test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)\n\n## Requirement REQUIREMENT_TRUST-02 — flag-like and regex-special test names bind to exactly that test\n\nWHEN a check ref names a test whose name begins with `-` or contains regex metacharacters THEN the\nsystem SHALL pass it to the runner as an escaped `--testNamePattern=\u003cvalue>` (equals form) so the\nrunner's CLI parser binds that exact test and never reads the name as an option.\n\n@check kind=unit ref=test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern\n\nIF a test name begins with `-` THEN the system SHALL NOT crash the runner CLI (the old `-t \u003cname>`\nform raised \"Unknown option\"); the bound check SHALL still resolve to a passing proof.\n\n@check kind=unit ref=test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI\n\n## Requirement REQUIREMENT_STAMP-01 — one suite run stamps every bound criterion (kills the depth tax)\n\nWHEN `dev-spec-kit verify --stamp` runs THEN the system SHALL execute the test suite ONCE and record a\npassing/failing `check.run` proof for every bound criterion whose test appears in the run, stamped\nwith the same code tree the suite ran on — so `trace` reads them green without a per-criterion\nre-run (proving N criteria must cost one run, not N cold `check run`s).\n\n@check kind=unit ref=test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind\n@check kind=unit ref=test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)\n\nIF a bound ref names a test NOT present in the run (another runner, or renamed away) THEN the system\nSHALL leave that ref's existing proof untouched rather than fabricate or clear it.\n\n@check kind=unit ref=test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)\n\nIF a matched test only SKIPPED THEN the system SHALL NOT stamp a proof — skipped is not evidence.\n\n@check kind=unit ref=test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence\n\n## Requirement REQUIREMENT_LINT-01 — static drift check flags orphaned refs before any run\n\nWHEN `dev-spec-kit spec lint` runs THEN the system SHALL resolve every `@check` ref (from specs AND task\nbindings) against the test files and report any whose file is missing, or whose test name no longer\nappears in the file, as ORPHANED — exiting non-zero so a Stop/pre-commit hook can refuse the drift.\n\n@check kind=unit ref=test/spec-lint.test.ts::flags a ref whose file is missing\n@check kind=unit ref=test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)\n\nWHEN every `@check` ref resolves THEN the system SHALL report a resolvable ref as clean.\n\n@check kind=unit ref=test/spec-lint.test.ts::passes a ref whose file and name both resolve\n\nIF a ref is a selector-only form the linter cannot statically resolve (e.g. maven `Class#method`)\nTHEN the system SHALL NOT report it as orphaned — no false positives.\n\n@check kind=unit ref=test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)\n\n## Requirement REQUIREMENT_DONE-01 — the done-gate tells a stale binding apart from a missing proof\n\nWHEN a task's bound `@check` refs no longer match its requirement's current spec refs THEN the\nsystem SHALL report the binding as out of sync — so the done-gate points at `dev-spec-kit spec tasks`\n(re-sync) instead of telling the user to re-run a ref that no longer exists.\n\n@check kind=unit ref=test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)\n@check kind=unit ref=test/done-msg.test.ts::is out of sync when the counts differ\n\nWHEN a task's bound refs match the spec (order aside) THEN the system SHALL report them in sync, so\na genuinely-unproven task is NOT misreported as a binding problem.\n\n@check kind=unit ref=test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)\n\n## Requirement REQUIREMENT_DRAFT-01 — draft-tests scaffolds a failing, bound stub per unbound criterion\n\nWHEN `dev-spec-kit spec draft-tests` runs on a requirement with an unbound criterion THEN the system SHALL\nemit a FAILING test stub (named from the criterion's clause, carrying the criterion text + the\nedge-case mandate) plus the `@check` ref that binds it — the rule→test→proof loop the config's\n`acceptanceCriteria: \"tool-drafts\"` mode promises but never delivered.\n\n@check kind=unit ref=test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate\n@check kind=unit ref=test/draft.test.ts::takes the SHALL clause and drops 'the system'\n\nIF a criterion already binds a check (or the requirement is an ADR decision record) THEN the system\nSHALL NOT draft a stub for it — drafting is only for unmet obligations.\n\n@check kind=unit ref=test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records\n\n## Requirement REQUIREMENT_RECONCILE-01 — verify --stamp --advance reconciles trace with status\n\nWHEN `dev-spec-kit verify --stamp --advance` runs AND a not-done task has a fresh passing proof for every\nbound check THEN the system SHALL advance that task to done, so `trace` (criteria) and `status`\n(tasks) stop disagreeing (feedback #7: \"trace green while 34 tasks TODO\").\n\n@check kind=unit ref=test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree\n@check kind=unit ref=test/done-msg.test.ts::never re-advances an already-done task\n\nIF any bound check is missing, failing, or proven on an OLDER tree THEN the system SHALL NOT advance\nthe task — only fully and freshly proven work qualifies (it reuses the done-gate's own evidence).\n\n@check kind=unit ref=test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)\n\n## Requirement REQUIREMENT_JUDGE-01 — an LLM judge verdict is a recorded, second-class proof\n\nWHEN a `judge` check records a verdict THEN the system SHALL stamp it `kind=judge` carrying the model\nand reason — labelled distinctly so it is never rendered or counted as an executed green.\n\n@check kind=unit ref=test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)\n@check kind=unit ref=test/judge.test.ts::respects an explicit mode regardless of the key\n\nIF no Anthropic API key is present THEN the system SHALL default `auto` mode to harness (the agent\nsupplies the verdict, free) — the common path never requires a key.\n\n@check kind=unit ref=test/judge.test.ts::auto resolves to api when a key is present, harness when not\n@check kind=unit ref=test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set\n\n## Requirement REQUIREMENT_CYCLE-01 — a circular dependency is flagged, not silently built\n\nWHEN the graph holds a circular `dependsOn` chain THEN the system SHALL report each cycle as a node\npath and fail the build — a proof loop with no entry point cannot resolve.\n\n@check kind=unit ref=test/cycles.test.ts::finds a simple A→B→A cycle\n@check kind=unit ref=test/cycles.test.ts::finds a longer A→B→C→A cycle\n\nWHEN the `dependsOn` edges are acyclic THEN the system SHALL report no cycle, and a non-dependsOn\nedge SHALL never be mistaken for a dependency cycle — no false positives.\n\n@check kind=unit ref=test/cycles.test.ts::returns nothing for an acyclic chain\n@check kind=unit ref=test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)\n\n## Requirement REQUIREMENT_PRBLAST-01 — the PR body shows the change's blast radius\n\nWHEN a PR body is generated for a set of changed files THEN the system SHALL list, per changed file,\nthe proven graph edges it touches — a changed test file via the `validates` edge it proves, a changed\nsource file via its code node — so a reviewer sees the diff's traceability impact without the graph.\n\n@check kind=unit ref=test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves\n@check kind=unit ref=test/pr-blast.test.ts::renders the touched edges for changed files that map\n\nIF none of the changed files map to a graph node THEN the system SHALL say so honestly rather than\nclaim zero impact, and IF the change set is unknown or empty THEN the system SHALL NOT render the\nsection at all.\n\n@check kind=unit ref=test/pr-blast.test.ts::notes honestly when changed files map to no graph node\n@check kind=unit ref=test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)\n\n## Requirement REQUIREMENT_IMPL-01 — proven implements edges tie changed source files to their requirements\n\nWHEN the Verified Traceability Graph is built with a code graph THEN the system SHALL emit a proven\n`implements` edge from each source file a requirement's bound test imports to that requirement — so a\nchanged SOURCE file's blast radius and the `unimplementedRequirements` check stop being empty\n(closing the gap FEAT-BLAST-01 left: source files mapped to nothing because only `validates` edges\nexisted).\n\n@check kind=unit ref=test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof\n@check kind=unit ref=test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live\n@check kind=unit ref=test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge\n\nWHEN a requirement is not fully proven THEN the system SHALL carry the WORST criterion proof onto its\nimplements edges, so an `implements` edge is never greener than the executed checks behind it.\n\n@check kind=unit ref=test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green\n\nIF a requirement's tests import only a TEST file, or import nothing the code graph indexes THEN the\nsystem SHALL NOT fabricate an implements edge — a test is never an implementation, and an unanchored\nrequirement stays flagged as unimplemented.\n\n@check kind=unit ref=test/implements-edges.test.ts::never links a test→test import as an implementation\n@check kind=unit ref=test/implements-edges.test.ts::does not link a source the requirement's tests never import\n"
      },
      {
        "name": "LEDGER.md",
        "content": "# LEDGER — generated from the journal; do not edit\n\n> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven\n\n## Progress board\n\n**70/73 done (96%)**\n\n- ✅ **FIX-ROUTE-01** route: build-intent must veto research keywords 🟢\n  📋 Evidence — FIX-ROUTE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/workflow.test.ts::want-signals veto research routing` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **R-AUDIT-01** every CLI invocation is audit-logged 🟢\n  📋 Evidence — R-AUDIT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **R-AUDIT-02** the audit trail is readable 🟢\n  📋 Evidence — R-AUDIT-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **R-PROG-01** progress with emoji after completing a task 🟢\n  📋 Evidence — R-PROG-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PRMATH-01** PR coverage uses worst-of obligation semantics 🟢\n  📋 Evidence — FIX-PRMATH-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/workflow.test.ts::worst-of coverage in the PR body` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PROOF-01** proof identity = tested tree hash, not commit SHA 🟢\n  📋 Evidence — FIX-PROOF-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/proof-identity.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-ROBUST-01** inputs never crash; infra errors are not proofs 🟢\n  📋 Evidence — FIX-ROBUST-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/robust.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-SPECSYNC-01** spec re-derive syncs bindings; evidence unclobberable 🟢\n  📋 Evidence — FIX-SPECSYNC-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/spec-sync.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-GATE-01** one not-green-blocks predicate; missing graph blocks 🟢\n  📋 Evidence — FIX-GATE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/gate.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **GATE-PROTECT-01** in-flight specs/tests/config need human unlock 🟢\n  📋 Evidence — GATE-PROTECT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/protect.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PARSE-01** parser respects markdown reality 🟢\n  📋 Evidence — FIX-PARSE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/parse-fix.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-QUERY-01** read-only queries; no retry burn; deterministic ties 🟢\n  📋 Evidence — FIX-QUERY-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/query-fix.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **AUDIT-META-01** journal meta (actor/model) + governance events 🟢\n  📋 Evidence — AUDIT-META-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/audit-meta.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FINISH-RITUAL-01** rivet-finish skill: evidence gate, fixed menu, typed confirm 🟢\n  📋 Evidence — FINISH-RITUAL-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/finish-skill.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **GATE-FACTS-01** DENY-FORCE-ALLOW investigative gate (opt-in) 🟢\n  📋 Evidence — GATE-FACTS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/gate-facts.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **GATE-PACKS-01** config gate packs: sections+kinds+security floor 🟢\n  📋 Evidence — GATE-PACKS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/gate-packs.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **COMPACT-01** phase-aware checkpoints + PreCompact resume save 🟢\n  📋 Evidence — COMPACT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/compact.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **SKILL-QA-01** mechanical QA: skills reference only real commands/artifacts 🟢\n  📋 Evidence — SKILL-QA-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/skill-qa.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **SCALE-01** P3: locking, fold cache, failure tails, anchor-by-path, audit gating 🟢\n  📋 Evidence — SCALE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/scale.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **RUNNERS-01** multi-kind verification: kind-aware runs + app lifecycle + kind runners 🟢\n  📋 Evidence — RUNNERS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/runners-kind.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **RENAME-LAWS-01** rename constitution → laws (user term) 🟢\n  📋 Evidence — RENAME-LAWS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/skill-qa.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **BOARDS-01** generated LEDGER.md + TRACKING.md boards 🟢\n  📋 Evidence — BOARDS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/boards.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **WAVE-01** worktree wave dispatcher: plan + fetch-first start 🟢\n  📋 Evidence — WAVE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/wave.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **STEER-01** laws engine: 3 scopes + personal inheritance + file injection 🟢\n  📋 Evidence — STEER-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/steering.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **LEARN-01** warn-on-repeat: open lessons surface at task start 🟢\n  📋 Evidence — LEARN-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/learnwarn.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **WAVE-02** wave done: provenance-checked worktree cleanup after merge 🟢\n  📋 Evidence — WAVE-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/wave-done.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **DASH-01** dashboard v1: emoji + completion % + traffic lights + graph embed 🟢\n  📋 Evidence — DASH-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/dashboard.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FILES-01** dashboard files plumbing: collect .rivet md + safe renderer 🟢\n  📋 Evidence — FILES-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/files-tab.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **README-01** README refresh: match the real tool surface 🟢\n  📋 Evidence — README-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/readme.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PROOF-02** proof identity excludes .rivet state (journal must not stale its own proofs) 🟢\n  📋 Evidence — FIX-PROOF-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/proof-identity.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **TRAIL-01** per-task gate trail: minute-level done/blocked/skipped/pending 🟢\n  📋 Evidence — TRAIL-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/trail.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **DASH-02** port design.html as the dashboard template with live data injection 🟢\n  📋 Evidence — DASH-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/dashboard.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-DOCTOR-01** graphify optional in doctor + provenance hint (classifier-safe) 🟢\n  📋 Evidence — FIX-DOCTOR-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/doctor-fix.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-STACKNAMES-01** project.platforms rename + runner-stack disambiguation error 🟢\n  📋 Evidence — FIX-STACKNAMES-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/stacknames.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PROOF-03** check-run stamp shows tree identity, not commit sha 🟢\n  📋 Evidence — FIX-PROOF-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/proof-display.test.ts::stamps the tree identity, not the commit sha` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PROOF-04** every proof surface stamps the tree identity (PR body, approvals, ledger log) 🟢\n  📋 Evidence — FIX-PROOF-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/proof-display.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-PROV-01** provenance hint carries no rotting vanity metrics (star count) 🟢\n  📋 Evidence — FIX-PROV-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/doctor-fix.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-IDS-01** fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint 🟢\n  📋 Evidence — FEAT-IDS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/qualified-ids.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- 🔨 **REQUIREMENT_AUDIT-01** every CLI invocation is audit-logged 🟢🟢\n  📋 Evidence — REQUIREMENT_AUDIT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_AUDIT-02** the audit trail is readable 🟢🟢\n  📋 Evidence — REQUIREMENT_AUDIT-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_PROG-01** progress with emoji after completing a task 🟢🟢\n  📋 Evidence — REQUIREMENT_PROG-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cli-ux.test.ts::renders an explicit empty state when there are no tasks` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-GHERKIN-01** gherkin first-class + default format + mechanical negative floor 🟢\n  📋 Evidence — FEAT-GHERKIN-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/gherkin.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- 🔨 **NFR_AUDIT-03** auditing never breaks the CLI 🟢\n  📋 Evidence — NFR_AUDIT-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-STACK-01** verify.defaultStack + platform inference; --stack optional 🟢\n  📋 Evidence — FEAT-STACK-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/default-stack.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-REPORT-01** tabular post-task evidence report (terminal + LEDGER) 🟢\n  📋 Evidence — FEAT-REPORT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/task-report.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-EMOJI-01** central emoji vocabulary (>=10 new) + plain mode for CI 🟢\n  📋 Evidence — FEAT-EMOJI-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/emoji.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-VERIFY-01** rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate 🟢\n  📋 Evidence — FEAT-VERIFY-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/verify-cmd.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-PLATFORM-01** electron platform; platforms is an ARRAY (polyglot normal) 🟢\n  📋 Evidence — FEAT-PLATFORM-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/stacknames.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-INITPACKS-01** init --platforms seeds free/OSS best-practice law packs, pre-wired to checks 🟢\n  📋 Evidence — FEAT-INITPACKS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/init-practices.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-CCFIRST-01** README states Claude-Code-first explicitly 🟢\n  📋 Evidence — FEAT-CCFIRST-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/readme.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-FLUSH-01** pr learnings-flush warn + doctor stale-worktree visibility 🟢🟢\n  📋 Evidence — FEAT-FLUSH-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/pr-flush-warn.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/doctor-fix.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-REVITIFY-01** revitify: native TS knowledge graph, graphify output contract, default provider 🟢\n  📋 Evidence — FEAT-REVITIFY-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/revitify-contract.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FEAT-REVITIFY-02** revitify extracted to its own repo; consumer-side contract pinned 🟢\n  📋 Evidence — FEAT-REVITIFY-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/revitify-contract.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-STALEDONE-01** done-gate refuses stale evidence (pass on an older tree is not green) 🟢\n  📋 Evidence — FIX-STALEDONE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/stale-done.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_COCKPIT-01** config manifest generated from the schema 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_COCKPIT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_COCKPIT-02** the RIVET data sidecar is the project's truth 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_COCKPIT-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_COCKPIT-03** static shell emission, written once 🟢🟢\n  📋 Evidence — REQUIREMENT_COCKPIT-03\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_COCKPIT-04** live updates after every proof event 🟢🟢\n  📋 Evidence — REQUIREMENT_COCKPIT-04\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_COCKPIT-05** the config save server 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_COCKPIT-05\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_DOCS-01** every mutation refreshes every generated document 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_DOCS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/docs-refresh.test.ts::read-only queries never create or touch documents` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-COCKPIT-SEC-01** cockpit hardening: 12 adversarial-review findings (localhost bind, unlock match, parsed-write, body cap, CSRF, etc.) 🟢\n  📋 Evidence — FIX-COCKPIT-SEC-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit-hardening.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **FIX-COCKPIT-ASSETS-01** regression guard for browser-asset findings #4 (json control) + #9 (auto-reload state) 🟢\n  📋 Evidence — FIX-COCKPIT-ASSETS-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cockpit-assets.test.ts` | — | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_TRUST-01** a name-filtered run that matches zero tests is never a pass 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_TRUST-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_TRUST-02** flag-like and regex-special test names bind to exactly that test 🟢🟢\n  📋 Evidence — REQUIREMENT_TRUST-02\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_STAMP-01** one suite run stamps every bound criterion (kills the depth tax) 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_STAMP-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_LINT-01** static drift check flags orphaned refs before any run 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_LINT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/spec-lint.test.ts::flags a ref whose file is missing` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/spec-lint.test.ts::passes a ref whose file and name both resolve` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_DONE-01** the done-gate tells a stale binding apart from a missing proof 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_DONE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/done-msg.test.ts::is out of sync when the counts differ` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_DRAFT-01** draft-tests scaffolds a failing, bound stub per unbound criterion 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_DRAFT-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/draft.test.ts::takes the SHALL clause and drops 'the system'` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_RECONCILE-01** verify --stamp --advance reconciles trace with status 🟢🟢🟢\n  📋 Evidence — REQUIREMENT_RECONCILE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/done-msg.test.ts::never re-advances an already-done task` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_JUDGE-01** an LLM judge verdict is a recorded, second-class proof 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_JUDGE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/judge.test.ts::respects an explicit mode regardless of the key` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/judge.test.ts::auto resolves to api when a key is present, harness when not` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_CYCLE-01** a circular dependency is flagged, not silently built 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_CYCLE-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/cycles.test.ts::finds a simple A→B→A cycle` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cycles.test.ts::finds a longer A→B→C→A cycle` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cycles.test.ts::returns nothing for an acyclic chain` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ✅ **REQUIREMENT_PRBLAST-01** the PR body shows the change's blast radius 🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_PRBLAST-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/pr-blast.test.ts::renders the touched edges for changed files that map` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/pr-blast.test.ts::notes honestly when changed files map to no graph node` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n- ⬜ **REQUIREMENT_IMPL-01** proven implements edges tie changed source files to their requirements 🟢🟢🟢🟢🟢🟢\n  📋 Evidence — REQUIREMENT_IMPL-01\n  | Check | Kind | State | Proof | Proven at |\n  |---|---|---|---|---|\n  | `test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/implements-edges.test.ts::never links a test→test import as an implementation` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n  | `test/implements-edges.test.ts::does not link a source the requirement's tests never import` | unit | ✅ green | tree 39ed9aba | 2026-06-20T07:52:39.532Z |\n\n\n## Approvals & governance\n\n- 🛡️ 2026-06-11T23:25:31.905Z — unlock\n- 🛡️ 2026-06-11T23:29:29.462Z — unlock\n- 🛡️ 2026-06-11T23:34:24.469Z — unlock\n- 🛡️ 2026-06-11T23:41:27.273Z — unlock\n- 🛡️ 2026-06-11T23:55:10.102Z — unlock\n- 🛡️ 2026-06-11T23:58:14.741Z — unlock\n- 🛡️ 2026-06-11T23:58:59.298Z — unlock\n- 🛡️ 2026-06-12T04:48:57.051Z — unlock\n- 🛡️ 2026-06-12T04:51:20.884Z — unlock\n- 🛡️ 2026-06-12T05:01:36.612Z — unlock\n- 🛡️ 2026-06-12T07:00:16.579Z — unlock\n- 🛡️ 2026-06-12T07:20:18.537Z — unlock\n- 🔏 2026-06-12T07:21:29.214Z — Pratiyush Kumar Singh approved REQUIREMENT_COCKPIT-01, REQUIREMENT_COCKPIT-02, REQUIREMENT_COCKPIT-03, REQUIREMENT_COCKPIT-04, REQUIREMENT_COCKPIT-05, REQUIREMENT_DOCS-01\n- 🔏 2026-06-12T07:21:29.913Z — Pratiyush Kumar Singh approved FEAT-VERIFY-01, FEAT-GHERKIN-01, FEAT-IDS-01, FEAT-REPORT-01, FEAT-EMOJI-01, FEAT-INITPACKS-01, FEAT-PLATFORM-01, FEAT-STACK-01, FEAT-CCFIRST-01, FEAT-FLUSH-01, FEAT-REVITIFY-01, FEAT-REVITIFY-02\n\n## Recent activity\n\n- 2026-06-20 07:52:40  ✅ check test/pr-blast.test.ts::renders the touched edges for changed files that map @ tree 39ed9aba → REQUIREMENT_PRBLAST-01\n- 2026-06-20 07:52:40  ✅ check test/pr-blast.test.ts::notes honestly when changed files map to no graph node @ tree 39ed9aba → REQUIREMENT_PRBLAST-01\n- 2026-06-20 07:52:40  ✅ check test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat) @ tree 39ed9aba → REQUIREMENT_PRBLAST-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::never links a test→test import as an implementation @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:40  ✅ check test/implements-edges.test.ts::does not link a source the requirement's tests never import @ tree 39ed9aba → REQUIREMENT_IMPL-01\n- 2026-06-20 07:52:45  🧾 graph build  [Pratiyush Kumar Singh]\n"
      },
      {
        "name": "TRACKING.md",
        "content": "# TRACKING — per-requirement Definition of Done (generated; do not edit)\n\n| Requirement | Title | Criteria | Proof | Task | Approved |\n|---|---|---|---|---|---|\n| REQUIREMENT_AUDIT-01 | every CLI invocation is audit-logged | 2 | 🟢🟢 | in_progress | — |\n| REQUIREMENT_AUDIT-02 | the audit trail is readable | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_PROG-01 | progress with emoji after completing a task | 2 | 🟢🟢 | done | — |\n| NFR_AUDIT-03 | auditing never breaks the CLI | 1 | 🟢 | in_progress | — |\n| REQUIREMENT_COCKPIT-01 | config manifest generated from the schema | 3 | 🟢🟢🟢 | done | ✅ |\n| REQUIREMENT_COCKPIT-02 | the RIVET data sidecar is the project's truth | 3 | 🟢🟢🟢 | done | ✅ |\n| REQUIREMENT_COCKPIT-03 | static shell emission, written once | 2 | 🟢🟢 | done | ✅ |\n| REQUIREMENT_COCKPIT-04 | live updates after every proof event | 2 | 🟢🟢 | done | ✅ |\n| REQUIREMENT_COCKPIT-05 | the config save server | 4 | 🟢🟢🟢🟢 | done | ✅ |\n| REQUIREMENT_DOCS-01 | every mutation refreshes every generated document | 4 | 🟢🟢🟢🟢 | done | ✅ |\n| REQUIREMENT_TRUST-01 | a name-filtered run that matches zero tests is never a pass | 3 | 🟢🟢🟢 | done | — |\n| REQUIREMENT_TRUST-02 | flag-like and regex-special test names bind to exactly that test | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_STAMP-01 | one suite run stamps every bound criterion (kills the depth tax) | 3 | 🟢🟢🟢 | done | — |\n| REQUIREMENT_LINT-01 | static drift check flags orphaned refs before any run | 3 | 🟢🟢🟢 | done | — |\n| REQUIREMENT_DONE-01 | the done-gate tells a stale binding apart from a missing proof | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_DRAFT-01 | draft-tests scaffolds a failing, bound stub per unbound criterion | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_RECONCILE-01 | verify --stamp --advance reconciles trace with status | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_JUDGE-01 | an LLM judge verdict is a recorded, second-class proof | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_CYCLE-01 | a circular dependency is flagged, not silently built | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_PRBLAST-01 | the PR body shows the change's blast radius | 2 | 🟢🟢 | done | — |\n| REQUIREMENT_IMPL-01 | proven implements edges tie changed source files to their requirements | 3 | 🟢🟢🟢 | pending | — |\n"
      },
      {
        "name": "RESUME.md",
        "content": "# RESUME — state-only handoff (generated from the journal; do not edit)\n\nBoard: 70/73 task(s) done.\n\n## THE ONE OPEN ACTION\n\n→ **REQUIREMENT_AUDIT-01** — every CLI invocation is audit-logged (in_progress)\n\n## Rebuild truth\n\n`dev-spec-kit status` · `dev-spec-kit graph build` · `dev-spec-kit log -n 10`\n"
      },
      {
        "name": "approvals/2026-06-12-FEAT-VERIFY-01-FEAT-GHERKIN-01-FEAT-IDS-01-FEAT-REPORT-01-FEAT-EMOJI-01-FEAT-INITPACKS-01-FEAT-PLATFORM-01-FEAT-STACK-01-FEAT-CCFIRST-01-FEAT-FLUSH-01-FEAT-REVITIFY-01-FEAT-REVITIFY-02.md",
        "content": "# Approval — FEAT-VERIFY-01, FEAT-GHERKIN-01, FEAT-IDS-01, FEAT-REPORT-01, FEAT-EMOJI-01, FEAT-INITPACKS-01, FEAT-PLATFORM-01, FEAT-STACK-01, FEAT-CCFIRST-01, FEAT-FLUSH-01, FEAT-REVITIFY-01, FEAT-REVITIFY-02\n\n- **Approved by:** Pratiyush Kumar Singh\n- **At:** 2026-06-12T07:21:29.913Z\n- **Code tree:** tree f0a70718\n- **Note:** Pratiyush 2026-06-12: feedback batch directives (locked in 28 Q&A) — retroactive recorded gate\n\n## Evidence\n\n### FEAT-VERIFY-01 — rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate (done)\n- ✅ `test/verify-cmd.test.ts` @ tree d9d37e49* (2026-06-11T23:54:53.789Z)\n\n### FEAT-GHERKIN-01 — gherkin first-class + default format + mechanical negative floor (done)\n- ✅ `test/gherkin.test.ts` @ tree bda82c18* (2026-06-11T23:40:54.391Z)\n\n### FEAT-IDS-01 — fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint (done)\n- ✅ `test/qualified-ids.test.ts` @ tree af88bfd0* (2026-06-11T23:33:58.426Z)\n\n### FEAT-REPORT-01 — tabular post-task evidence report (terminal + LEDGER) (done)\n- ✅ `test/task-report.test.ts` @ tree 95e2a25a* (2026-06-11T23:47:39.111Z)\n\n### FEAT-EMOJI-01 — central emoji vocabulary (>=10 new) + plain mode for CI (done)\n- ✅ `test/emoji.test.ts` @ tree fb84c373* (2026-06-11T23:50:19.284Z)\n\n### FEAT-INITPACKS-01 — init --platforms seeds free/OSS best-practice law packs, pre-wired to checks (done)\n- ✅ `test/init-practices.test.ts` @ tree 47c4f9b2* (2026-06-12T04:46:02.585Z)\n\n### FEAT-PLATFORM-01 — electron platform; platforms is an ARRAY (polyglot normal) (done)\n- ✅ `test/stacknames.test.ts` @ tree 255f2e33* (2026-06-11T23:59:51.330Z)\n\n### FEAT-STACK-01 — verify.defaultStack + platform inference; --stack optional (done)\n- ✅ `test/default-stack.test.ts` @ tree f667aa68* (2026-06-11T23:45:42.780Z)\n\n### FEAT-CCFIRST-01 — README states Claude-Code-first explicitly (done)\n- ✅ `test/readme.test.ts` @ tree cdec907f* (2026-06-12T04:50:02.948Z)\n\n### FEAT-FLUSH-01 — pr learnings-flush warn + doctor stale-worktree visibility (done)\n- ✅ `test/pr-flush-warn.test.ts` @ tree d434b3db* (2026-06-12T04:53:32.732Z)\n- ✅ `test/doctor-fix.test.ts` @ tree d434b3db* (2026-06-12T04:53:33.680Z)\n\n### FEAT-REVITIFY-01 — revitify: native TS knowledge graph, graphify output contract, default provider (done)\n- ✅ `packages/revitify/test/revitify.test.ts` @ tree 60ee0b6a* (2026-06-12T05:05:39.506Z)\n\n### FEAT-REVITIFY-02 — revitify extracted to its own repo; consumer-side contract pinned (done)\n- ✅ `test/revitify-contract.test.ts` @ tree 76a8f022* (2026-06-12T05:10:39.529Z)\n\n"
      },
      {
        "name": "approvals/2026-06-12-REQUIREMENT_COCKPIT-01-REQUIREMENT_COCKPIT-02-REQUIREMENT_COCKPIT-03-REQUIREMENT_COCKPIT-04-REQUIREMENT_COCKPIT-05-REQUIREMENT_DOCS-01.md",
        "content": "# Approval — REQUIREMENT_COCKPIT-01, REQUIREMENT_COCKPIT-02, REQUIREMENT_COCKPIT-03, REQUIREMENT_COCKPIT-04, REQUIREMENT_COCKPIT-05, REQUIREMENT_DOCS-01\n\n- **Approved by:** Pratiyush Kumar Singh\n- **At:** 2026-06-12T07:21:29.214Z\n- **Code tree:** tree f0a70718\n- **Note:** Pratiyush 2026-06-12: 'design has come... think and refine and implement' + 'fix all' — cockpit and docs-refresh approved\n\n## Evidence\n\n### REQUIREMENT_COCKPIT-01 — config manifest generated from the schema (done)\n- ✅ `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` @ tree c6c5cfce (2026-06-12T07:05:27.210Z)\n- ✅ `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` @ tree c6c5cfce (2026-06-12T07:05:27.791Z)\n- ✅ `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` @ tree c6c5cfce (2026-06-12T07:05:28.371Z)\n\n### REQUIREMENT_COCKPIT-02 — the RIVET data sidecar is the project's truth (done)\n- ✅ `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` @ tree c6c5cfce (2026-06-12T07:05:29.309Z)\n- ✅ `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` @ tree c6c5cfce (2026-06-12T07:05:30.247Z)\n- ✅ `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` @ tree c6c5cfce (2026-06-12T07:05:31.180Z)\n\n### REQUIREMENT_COCKPIT-03 — static shell emission, written once (done)\n- ✅ `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` @ tree c6c5cfce (2026-06-12T07:05:32.250Z)\n- ✅ `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` @ tree c6c5cfce (2026-06-12T07:05:33.485Z)\n\n### REQUIREMENT_COCKPIT-04 — live updates after every proof event (done)\n- ✅ `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` @ tree c6c5cfce (2026-06-12T07:05:34.978Z)\n- ✅ `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` @ tree bad3adce* (2026-06-12T07:20:23.464Z)\n\n### REQUIREMENT_COCKPIT-05 — the config save server (done)\n- ✅ `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` @ tree c6c5cfce (2026-06-12T07:05:36.908Z)\n- ✅ `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` @ tree c6c5cfce (2026-06-12T07:05:37.758Z)\n- ✅ `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` @ tree c6c5cfce (2026-06-12T07:05:38.670Z)\n- ✅ `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` @ tree c6c5cfce (2026-06-12T07:05:39.606Z)\n\n### REQUIREMENT_DOCS-01 — every mutation refreshes every generated document (done)\n- ✅ `test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar` @ tree d8177340* (2026-06-12T07:19:24.555Z)\n- ✅ `test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving` @ tree d8177340* (2026-06-12T07:19:26.608Z)\n- ✅ `test/docs-refresh.test.ts::read-only queries never create or touch documents` @ tree d8177340* (2026-06-12T07:19:28.353Z)\n- ✅ `test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar` @ tree d8177340* (2026-06-12T07:19:30.138Z)\n\n"
      }
    ]
  },
  "config": {
    "sections": [
      {
        "id": "project",
        "icon": "📦",
        "blurb": "Identity the boards and journal read from."
      },
      {
        "id": "mode",
        "icon": "🧭",
        "blurb": "How a request is routed into a workflow."
      },
      {
        "id": "intake",
        "icon": "📥",
        "blurb": "Where new work is ingested from."
      },
      {
        "id": "spec",
        "icon": "📐",
        "blurb": "How specs and acceptance criteria are shaped."
      },
      {
        "id": "build",
        "icon": "🔨",
        "blurb": "Coding discipline: tests, fences, retries, deps."
      },
      {
        "id": "verify",
        "icon": "✅",
        "blurb": "The proof engine — checks, stacks, runners."
      },
      {
        "id": "review",
        "icon": "🔎",
        "blurb": "Second-pass review before merge."
      },
      {
        "id": "pr",
        "icon": "🔀",
        "blurb": "Branching, CI and merge policy."
      },
      {
        "id": "memory",
        "icon": "🧠",
        "blurb": "Resume, journaling and drift detection."
      },
      {
        "id": "parallel",
        "icon": "⚡",
        "blurb": "Concurrent worktree execution."
      },
      {
        "id": "dashboard",
        "icon": "📊",
        "blurb": "The cockpit + notifications."
      },
      {
        "id": "rules",
        "icon": "⚖️",
        "blurb": "Laws, conflicts and id hygiene."
      },
      {
        "id": "learning",
        "icon": "🌱",
        "blurb": "Capturing and promoting learnings."
      },
      {
        "id": "gates",
        "icon": "🛡️",
        "blurb": "The moat: what must hold before done."
      },
      {
        "id": "graphify",
        "icon": "🕸️",
        "blurb": "The code-graph provider."
      }
    ],
    "manifest": [
      {
        "section": "project",
        "key": "name",
        "path": "project.name",
        "type": "string",
        "value": "untitled",
        "default": "untitled",
        "changed": false,
        "description": "Human-readable project name used in board headers and journal metadata."
      },
      {
        "section": "project",
        "key": "platforms",
        "path": "project.platforms",
        "type": "enum[]",
        "allowed": [
          "java-maven",
          "java-gradle",
          "spring",
          "quarkus",
          "node",
          "typescript",
          "electron",
          "react",
          "next",
          "angular",
          "python"
        ],
        "value": [
          "typescript",
          "node"
        ],
        "default": [],
        "changed": true,
        "description": "Codebase platforms (an ARRAY — polyglot is normal). Drives stack inference and `init --platforms` best-practice packs. NOT runner ids like `node-vitest`."
      },
      {
        "section": "mode",
        "key": "routing",
        "path": "mode.routing",
        "type": "enum",
        "allowed": [
          "auto",
          "pick",
          "auto-override"
        ],
        "value": "auto-override",
        "default": "auto-override",
        "changed": false,
        "description": "How requests become workflows. `auto` picks the lane; `pick` always asks; `auto-override` routes automatically but lets you veto."
      },
      {
        "section": "mode",
        "key": "confirmFirst",
        "path": "mode.confirmFirst",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Show the chosen mode and reasoning, then pause for confirmation before proceeding."
      },
      {
        "section": "mode",
        "key": "researchMode",
        "path": "mode.researchMode",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Offer a research-only `investigate and report` mode that never changes code."
      },
      {
        "section": "mode",
        "key": "custom",
        "path": "mode.custom",
        "type": "record",
        "recordShape": {
          "generic": true
        },
        "value": {},
        "default": {},
        "changed": false,
        "description": "User-defined custom modes: name → description or workflow reference."
      },
      {
        "section": "intake",
        "key": "sources",
        "path": "intake.sources",
        "type": "enum[]",
        "allowed": [
          "raw",
          "github",
          "gitlab",
          "jira"
        ],
        "value": [
          "raw",
          "github"
        ],
        "default": [
          "raw",
          "github"
        ],
        "changed": false,
        "description": "Where new work is ingested from. `raw` = freeform prompts/files; the rest mirror external trackers."
      },
      {
        "section": "intake",
        "key": "jiraEpic",
        "path": "intake.jiraEpic",
        "type": "enum",
        "allowed": [
          "mirror",
          "replan",
          "ask"
        ],
        "value": "ask",
        "default": "ask",
        "changed": false,
        "description": "When a Jira epic lands: `mirror` it 1:1, `replan` into dev-spec-kit's own breakdown, or `ask` each time."
      },
      {
        "section": "intake",
        "key": "writeBack",
        "path": "intake.writeBack",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Push status and links back to the originating tracker as tasks complete."
      },
      {
        "section": "spec",
        "key": "style",
        "path": "spec.style",
        "type": "enum",
        "allowed": [
          "checklist",
          "stories",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Shape of the spec: terse `checklist`, user `stories`, or `both` side by side."
      },
      {
        "section": "spec",
        "key": "acceptanceCriteria",
        "path": "spec.acceptanceCriteria",
        "type": "enum",
        "allowed": [
          "tool-drafts",
          "user-writes"
        ],
        "value": "tool-drafts",
        "default": "tool-drafts",
        "changed": false,
        "description": "Who authors acceptance criteria — the tool drafts and you edit, or you write from scratch."
      },
      {
        "section": "spec",
        "key": "criteriaFormat",
        "path": "spec.criteriaFormat",
        "type": "enum",
        "allowed": [
          "gherkin",
          "ears",
          "plain",
          "mixed"
        ],
        "value": "mixed",
        "default": "gherkin",
        "changed": true,
        "description": "Criteria syntax. `gherkin` (default): Scenario / Scenario Outline + Examples. Both grammars always parse and bind; off-format criteria lint (warn-only). `mixed` accepts both silently."
      },
      {
        "section": "spec",
        "key": "breakdownDepth",
        "path": "spec.breakdownDepth",
        "type": "enum",
        "allowed": [
          "feature-story-task-subtask",
          "task-subtask"
        ],
        "value": "feature-story-task-subtask",
        "default": "feature-story-task-subtask",
        "changed": false,
        "description": "How deep work is decomposed: full feature→story→task→subtask, or just task→subtask."
      },
      {
        "section": "spec",
        "key": "estimates",
        "path": "spec.estimates",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Attach effort estimates to derived tasks."
      },
      {
        "section": "spec",
        "key": "autoDependencies",
        "path": "spec.autoDependencies",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Infer dependencies between tasks automatically while planning."
      },
      {
        "section": "spec",
        "key": "diagram",
        "path": "spec.diagram",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate a diagram alongside the spec when it helps comprehension."
      },
      {
        "section": "spec",
        "key": "gapHunting",
        "path": "spec.gapHunting",
        "type": "enum",
        "allowed": [
          "off",
          "propose",
          "auto"
        ],
        "value": "propose",
        "default": "propose",
        "changed": false,
        "description": "Actively hunt missing edge cases. `propose` surfaces gaps for review; `auto` files them as criteria."
      },
      {
        "section": "spec",
        "key": "riskWarn",
        "path": "spec.riskWarn",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Warn and suggest splitting big or risky changes before any work starts."
      },
      {
        "section": "spec",
        "key": "livingPlan",
        "path": "spec.livingPlan",
        "type": "enum",
        "allowed": [
          "frozen",
          "update-ask",
          "update-auto"
        ],
        "value": "update-ask",
        "default": "update-ask",
        "changed": false,
        "description": "Whether the plan may evolve mid-build: frozen after approval, update with approval, or update freely."
      },
      {
        "section": "spec",
        "key": "onVague",
        "path": "spec.onVague",
        "type": "enum",
        "allowed": [
          "clarify",
          "guess-flag"
        ],
        "value": "clarify",
        "default": "clarify",
        "changed": false,
        "description": "When a request is vague: stop and `clarify`, or `guess-flag` — proceed and mark every assumption."
      },
      {
        "section": "build",
        "key": "tests",
        "path": "build.tests",
        "type": "enum",
        "allowed": [
          "tdd",
          "code-first",
          "either"
        ],
        "value": "tdd",
        "default": "tdd",
        "changed": false,
        "description": "Test discipline. `tdd` writes the failing check first; `code-first` tests after; `either` lets the agent choose."
      },
      {
        "section": "build",
        "key": "fileFence",
        "path": "build.fileFence",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Confine each task's writes to its declared file set; out-of-fence edits are blocked."
      },
      {
        "section": "build",
        "key": "retryLimit",
        "path": "build.retryLimit",
        "type": "number",
        "min": 0,
        "value": 3,
        "default": 3,
        "changed": false,
        "description": "How many times a failing check may be retried before escalating to you."
      },
      {
        "section": "build",
        "key": "checkFrequency",
        "path": "build.checkFrequency",
        "type": "enum",
        "allowed": [
          "per-change",
          "per-task"
        ],
        "value": "per-task",
        "default": "per-task",
        "changed": false,
        "description": "Run bound checks after every change, or once per task before done."
      },
      {
        "section": "build",
        "key": "whenStuck",
        "path": "build.whenStuck",
        "type": "enum",
        "allowed": [
          "ask",
          "grind",
          "bounded-then-ask"
        ],
        "value": "bounded-then-ask",
        "default": "bounded-then-ask",
        "changed": false,
        "description": "When blocked: ask immediately, grind on, or grind within a bound and then ask."
      },
      {
        "section": "build",
        "key": "codeStyle",
        "path": "build.codeStyle",
        "type": "enum",
        "allowed": [
          "match-repo",
          "style-guide",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Match the surrounding repo style, follow the style guide, or both."
      },
      {
        "section": "build",
        "key": "reuse",
        "path": "build.reuse",
        "type": "enum",
        "allowed": [
          "prefer",
          "fresh-ok",
          "prefer-flag"
        ],
        "value": "prefer",
        "default": "prefer",
        "changed": false,
        "description": "Prefer existing code before writing new (`prefer-flag` also reports what was reused)."
      },
      {
        "section": "build",
        "key": "comments",
        "path": "build.comments",
        "type": "enum",
        "allowed": [
          "minimal",
          "moderate",
          "heavy"
        ],
        "value": "moderate",
        "default": "moderate",
        "changed": false,
        "description": "Comment density for generated code."
      },
      {
        "section": "build",
        "key": "commitCadence",
        "path": "build.commitCadence",
        "type": "enum",
        "allowed": [
          "per-step",
          "per-task"
        ],
        "value": "per-task",
        "default": "per-task",
        "changed": false,
        "description": "Commit after each step or once per completed task."
      },
      {
        "section": "build",
        "key": "newDeps",
        "path": "build.newDeps",
        "type": "enum",
        "allowed": [
          "ask",
          "auto",
          "ask-big"
        ],
        "value": "ask-big",
        "default": "ask-big",
        "changed": false,
        "description": "Adding a dependency: always `ask`, `auto`-approve, or only ask for big ones (`ask-big`)."
      },
      {
        "section": "verify",
        "key": "kinds",
        "path": "verify.kinds",
        "type": "enum[]",
        "allowed": [
          "unit",
          "integration",
          "api",
          "e2e",
          "visual",
          "parity",
          "judge"
        ],
        "value": [
          "unit",
          "integration",
          "api",
          "e2e"
        ],
        "default": [
          "unit",
          "integration",
          "api",
          "e2e"
        ],
        "changed": false,
        "description": "Which proof kinds criteria may bind to. Custom kinds wired in kindRunners run too."
      },
      {
        "section": "verify",
        "key": "defaultStack",
        "path": "verify.defaultStack",
        "type": "string",
        "value": null,
        "default": null,
        "changed": false,
        "description": "Stack used when `--stack` is omitted. Resolution: flag → this → inferred from platforms → error."
      },
      {
        "section": "verify",
        "key": "buildAll",
        "path": "verify.buildAll",
        "type": "json",
        "value": [],
        "default": [],
        "changed": false,
        "description": "Build steps `dev-spec-kit verify` runs before the test kinds (`Build ALL`). Empty → node-ish platforms fall back to package.json build/typecheck scripts. Edited as JSON: an array of { cmd, args }."
      },
      {
        "section": "verify",
        "key": "coverage",
        "path": "verify.coverage",
        "type": "number",
        "min": 0,
        "max": 100,
        "nullable": true,
        "value": null,
        "default": null,
        "changed": false,
        "description": "Minimum coverage percentage gate; null = judge by criteria coverage, not a number."
      },
      {
        "section": "verify",
        "key": "blockDoneOnFail",
        "path": "verify.blockDoneOnFail",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "A task cannot be marked done while bound checks fail — or while a passing proof is STALE (recorded on an older code tree)."
      },
      {
        "section": "verify",
        "key": "everyCriterionNeedsCheck",
        "path": "verify.everyCriterionNeedsCheck",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Every acceptance criterion must bind to at least one executable check."
      },
      {
        "section": "verify",
        "key": "runApp",
        "path": "verify.runApp",
        "type": "boolean",
        "value": false,
        "default": false,
        "changed": false,
        "description": "Boot the app for api/e2e checks using verify.app's lifecycle."
      },
      {
        "section": "verify",
        "key": "ui",
        "path": "verify.ui",
        "type": "enum",
        "allowed": [
          "off",
          "screenshot",
          "browser",
          "both"
        ],
        "value": "off",
        "default": "off",
        "changed": false,
        "description": "Visual/UI verification method for ui-flavored checks."
      },
      {
        "section": "verify",
        "key": "sandbox",
        "path": "verify.sandbox",
        "type": "enum",
        "allowed": [
          "sandbox",
          "local"
        ],
        "value": "local",
        "default": "local",
        "changed": false,
        "description": "Run checks in an isolated sandbox or directly on this machine."
      },
      {
        "section": "verify",
        "key": "security",
        "path": "verify.security",
        "type": "enum",
        "allowed": [
          "off",
          "pre-pr",
          "on-demand"
        ],
        "value": "on-demand",
        "default": "on-demand",
        "changed": false,
        "description": "When security review runs: never, before every PR, or on demand."
      },
      {
        "section": "verify",
        "key": "lintTypes",
        "path": "verify.lintTypes",
        "type": "enum",
        "allowed": [
          "part-of-done",
          "separate"
        ],
        "value": "part-of-done",
        "default": "part-of-done",
        "changed": false,
        "description": "Lint/type checks count as part of done, or run as a separate concern."
      },
      {
        "section": "verify",
        "key": "flaky",
        "path": "verify.flaky",
        "type": "enum",
        "allowed": [
          "retry-flag",
          "quarantine"
        ],
        "value": "retry-flag",
        "default": "retry-flag",
        "changed": false,
        "description": "Flaky checks: retry and flag the flakiness, or quarantine them."
      },
      {
        "section": "verify",
        "key": "runners",
        "path": "verify.runners",
        "type": "record",
        "recordShape": {
          "cmd": "string",
          "args": "string[]"
        },
        "value": {},
        "default": {},
        "changed": false,
        "description": "Custom check-runner commands keyed by STACK name. Args support {ref}/{file}/{name} placeholders; matching keys override built-ins, new keys define new stacks."
      },
      {
        "section": "verify",
        "key": "kindRunners",
        "path": "verify.kindRunners",
        "type": "record",
        "recordShape": {
          "cmd": "string",
          "args": "string[]"
        },
        "value": {
          "lint": {
            "cmd": "npx",
            "args": [
              "eslint",
              "."
            ]
          }
        },
        "default": {},
        "changed": true,
        "description": "Kind-level runner templates (lint, audit, visual…) with the same placeholders. Precedence: kindRunners > runners > builtin."
      },
      {
        "section": "verify",
        "key": "app",
        "path": "verify.app",
        "type": "object",
        "fields": [
          {
            "key": "start",
            "type": "string[]"
          },
          {
            "key": "readyUrl",
            "type": "string"
          },
          {
            "key": "readyTimeoutMs",
            "type": "number",
            "min": 1
          }
        ],
        "value": {
          "start": [],
          "readyUrl": null,
          "readyTimeoutMs": 30000
        },
        "default": {
          "start": [],
          "readyUrl": null,
          "readyTimeoutMs": 30000
        },
        "changed": false,
        "description": "How to boot the app for runApp checks: start argv, readiness URL polled until it answers, and the wait budget."
      },
      {
        "section": "verify",
        "key": "judge",
        "path": "verify.judge",
        "type": "object",
        "fields": [
          {
            "key": "mode",
            "type": "enum",
            "allowed": [
              "harness",
              "api",
              "auto"
            ]
          },
          {
            "key": "model",
            "type": "string"
          },
          {
            "key": "allowForObligations",
            "type": "boolean"
          }
        ],
        "value": {
          "mode": "harness",
          "model": "claude-haiku-4-5",
          "allowForObligations": false
        },
        "default": {
          "mode": "harness",
          "model": "claude-haiku-4-5",
          "allowForObligations": false
        },
        "changed": false,
        "description": "The LLM `judge` kind (a second-class proof for the unmeasurable): mode (harness=the agent supplies the verdict free, api=the engine calls Anthropic headlessly, auto), the api model, and whether judge is allowed on full obligations (off by default)."
      },
      {
        "section": "review",
        "key": "separateReviewer",
        "path": "review.separateReviewer",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Review with a fresh agent that didn't write the code, to avoid author bias."
      },
      {
        "section": "review",
        "key": "angles",
        "path": "review.angles",
        "type": "enum[]",
        "allowed": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "value": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "default": [
          "correctness",
          "security",
          "performance",
          "style"
        ],
        "changed": false,
        "description": "Which review angles run on every change."
      },
      {
        "section": "review",
        "key": "passes",
        "path": "review.passes",
        "type": "enum",
        "allowed": [
          "blind",
          "context",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Blind diff-only pass, full-context pass, or both."
      },
      {
        "section": "review",
        "key": "fixFindings",
        "path": "review.fixFindings",
        "type": "enum",
        "allowed": [
          "auto",
          "list",
          "auto-small"
        ],
        "value": "list",
        "default": "list",
        "changed": false,
        "description": "What happens to findings: auto-fix, list for the human, or auto-fix only small ones."
      },
      {
        "section": "pr",
        "key": "autoBody",
        "path": "pr.autoBody",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate the PR body from the Verified Traceability Graph."
      },
      {
        "section": "pr",
        "key": "branchPattern",
        "path": "pr.branchPattern",
        "type": "string",
        "value": "{type}/{slug}",
        "default": "{type}/{slug}",
        "changed": false,
        "description": "Branch name template; {type} and {slug} interpolate per change."
      },
      {
        "section": "pr",
        "key": "merge",
        "path": "pr.merge",
        "type": "enum",
        "allowed": [
          "auto-on-green",
          "manual"
        ],
        "value": "manual",
        "default": "manual",
        "changed": false,
        "description": "Merge policy: automatically once green, or wait for the human."
      },
      {
        "section": "pr",
        "key": "waitForCI",
        "path": "pr.waitForCI",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Block merge until remote CI is green, not just local checks."
      },
      {
        "section": "pr",
        "key": "commitAuthor",
        "path": "pr.commitAuthor",
        "type": "enum",
        "allowed": [
          "user",
          "co-author"
        ],
        "value": "user",
        "default": "user",
        "changed": false,
        "description": "Commits are authored by the human; `co-author` adds the agent as a trailer. Default: human only."
      },
      {
        "section": "pr",
        "key": "cleanupAfterMerge",
        "path": "pr.cleanupAfterMerge",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Delete branches/worktrees after a merged PR."
      },
      {
        "section": "memory",
        "key": "crashResume",
        "path": "memory.crashResume",
        "type": "enum",
        "allowed": [
          "exact",
          "restart"
        ],
        "value": "exact",
        "default": "exact",
        "changed": false,
        "description": "After a crash: resume exactly mid-task, or restart the task cleanly."
      },
      {
        "section": "memory",
        "key": "journal",
        "path": "memory.journal",
        "type": "enum",
        "allowed": [
          "full",
          "milestones"
        ],
        "value": "full",
        "default": "full",
        "changed": false,
        "description": "Journal verbosity. `full` records every CLI run; `milestones` keeps only state-changing events."
      },
      {
        "section": "memory",
        "key": "driftDetection",
        "path": "memory.driftDetection",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Mark passing proofs STALE when the code they ran against has since changed."
      },
      {
        "section": "parallel",
        "key": "enabled",
        "path": "parallel.enabled",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Run independent tasks concurrently in isolated worktrees."
      },
      {
        "section": "parallel",
        "key": "waveSize",
        "path": "parallel.waveSize",
        "type": "number",
        "min": 1,
        "value": 6,
        "default": 6,
        "changed": false,
        "description": "Max concurrent worktree tasks (~6 avoids rate-limit wipeouts)."
      },
      {
        "section": "parallel",
        "key": "isolation",
        "path": "parallel.isolation",
        "type": "enum",
        "allowed": [
          "worktree",
          "shared"
        ],
        "value": "worktree",
        "default": "worktree",
        "changed": false,
        "description": "Each parallel task gets its own worktree, or they share the checkout."
      },
      {
        "section": "parallel",
        "key": "onFileClash",
        "path": "parallel.onFileClash",
        "type": "enum",
        "allowed": [
          "serialize",
          "warn",
          "both"
        ],
        "value": "serialize",
        "default": "serialize",
        "changed": false,
        "description": "When two tasks want the same file: serialize them, warn, or both."
      },
      {
        "section": "parallel",
        "key": "coordinator",
        "path": "parallel.coordinator",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Run a coordinator that sequences merges and resolves conflicts between waves."
      },
      {
        "section": "dashboard",
        "key": "enabled",
        "path": "dashboard.enabled",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Generate the cockpit (dashboard + config studio)."
      },
      {
        "section": "dashboard",
        "key": "refreshSeconds",
        "path": "dashboard.refreshSeconds",
        "type": "number",
        "min": 5,
        "max": 300,
        "value": 15,
        "default": 15,
        "changed": false,
        "description": "How often the open cockpit reloads its data sidecar, in seconds."
      },
      {
        "section": "dashboard",
        "key": "form",
        "path": "dashboard.form",
        "type": "enum",
        "allowed": [
          "web",
          "editor",
          "both"
        ],
        "value": "web",
        "default": "web",
        "changed": false,
        "description": "Cockpit form factor: web page, editor panel, or both."
      },
      {
        "section": "dashboard",
        "key": "updates",
        "path": "dashboard.updates",
        "type": "enum",
        "allowed": [
          "live",
          "on-demand"
        ],
        "value": "live",
        "default": "live",
        "changed": false,
        "description": "`live`: the data sidecar is rewritten automatically after every task done / check run, so the open cockpit stays current."
      },
      {
        "section": "dashboard",
        "key": "notify",
        "path": "dashboard.notify",
        "type": "object",
        "fields": [
          {
            "key": "channels",
            "type": "enum[]",
            "allowed": [
              "desktop",
              "slack",
              "email"
            ]
          },
          {
            "key": "on",
            "type": "enum[]",
            "allowed": [
              "gates",
              "done"
            ]
          }
        ],
        "value": {
          "channels": [],
          "on": []
        },
        "default": {
          "channels": [],
          "on": []
        },
        "changed": false,
        "description": "Where and when to send notifications about run events."
      },
      {
        "section": "rules",
        "key": "laws",
        "path": "rules.laws",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Load the laws files (.dev-spec-kit/laws.md + scoped laws) into every run."
      },
      {
        "section": "rules",
        "key": "onConflict",
        "path": "rules.onConflict",
        "type": "enum",
        "allowed": [
          "refuse",
          "warn"
        ],
        "value": "warn",
        "default": "warn",
        "changed": false,
        "description": "When an instruction conflicts with a law: refuse, or warn and continue."
      },
      {
        "section": "rules",
        "key": "inheritPersonal",
        "path": "rules.inheritPersonal",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Layer your personal ~/.dev-spec-kit laws underneath the project's."
      },
      {
        "section": "rules",
        "key": "requireQualifiedIds",
        "path": "rules.requireQualifiedIds",
        "type": "enum",
        "allowed": [
          "warn",
          "error",
          "off"
        ],
        "value": "warn",
        "default": "warn",
        "changed": false,
        "description": "Requirement ids must self-describe: REQUIREMENT_/NFR_/ADR_. Legacy `R-` ids still parse but lint at this severity."
      },
      {
        "section": "learning",
        "key": "capture",
        "path": "learning.capture",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Record lessons into learnings.md as work proceeds."
      },
      {
        "section": "learning",
        "key": "promoteToRules",
        "path": "learning.promoteToRules",
        "type": "enum",
        "allowed": [
          "off",
          "ask",
          "auto"
        ],
        "value": "ask",
        "default": "ask",
        "changed": false,
        "description": "Turn confirmed lessons into enforced laws: never, with approval, or automatically."
      },
      {
        "section": "learning",
        "key": "bugToTest",
        "path": "learning.bugToTest",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Every fixed bug must leave behind a regression check that would have caught it."
      },
      {
        "section": "learning",
        "key": "scope",
        "path": "learning.scope",
        "type": "enum",
        "allowed": [
          "project",
          "global",
          "both"
        ],
        "value": "both",
        "default": "both",
        "changed": false,
        "description": "Where lessons apply: this project, globally, or both."
      },
      {
        "section": "learning",
        "key": "retro",
        "path": "learning.retro",
        "type": "enum",
        "allowed": [
          "per-feature",
          "on-demand"
        ],
        "value": "per-feature",
        "default": "per-feature",
        "changed": false,
        "description": "Run the retro loop after every feature, or only on demand."
      },
      {
        "section": "learning",
        "key": "warnOnRepeat",
        "path": "learning.warnOnRepeat",
        "type": "boolean",
        "value": true,
        "default": true,
        "changed": false,
        "description": "Surface matching OPEN lessons when a task starts — before the mistake repeats."
      },
      {
        "section": "learning",
        "key": "share",
        "path": "learning.share",
        "type": "enum",
        "allowed": [
          "personal",
          "team"
        ],
        "value": "personal",
        "default": "personal",
        "changed": false,
        "description": "Keep learnings personal or share them with the team."
      },
      {
        "section": "gates",
        "key": "facts",
        "path": "gates.facts",
        "type": "enum",
        "allowed": [
          "off",
          "on"
        ],
        "value": "off",
        "default": "off",
        "changed": false,
        "description": "DENY→FORCE→ALLOW investigative gate: the first edit is blocked until named facts are gathered."
      },
      {
        "section": "gates",
        "key": "negativeFloor",
        "path": "gates.negativeFloor",
        "type": "enum",
        "allowed": [
          "on",
          "off"
        ],
        "value": "on",
        "default": "on",
        "changed": false,
        "description": "Every requirement needs ≥1 negative/failure criterion or graph build flags it. Prose mandates are ignorable; floors aren't."
      },
      {
        "section": "gates",
        "key": "require",
        "path": "gates.require",
        "type": "string[]",
        "value": [],
        "default": [],
        "changed": false,
        "description": "Gate packs enforced on every spec (empty by default — ceremony stays proportional)."
      },
      {
        "section": "gates",
        "key": "packs",
        "path": "gates.packs",
        "type": "record",
        "recordShape": {
          "generic": true
        },
        "value": {
          "security": {
            "sections": [
              "Security"
            ],
            "kinds": [],
            "triggers": [
              "auth",
              "login",
              "password",
              "token",
              "secret",
              "payment",
              "crypt",
              "session",
              "permission",
              "sql"
            ]
          },
          "contracts": {
            "sections": [
              "API Contract"
            ],
            "kinds": [
              "api"
            ],
            "triggers": []
          },
          "nfr": {
            "sections": [
              "NFR"
            ],
            "kinds": [],
            "triggers": []
          },
          "rollback": {
            "sections": [
              "Rollback"
            ],
            "kinds": [],
            "triggers": []
          }
        },
        "default": {
          "security": {
            "sections": [
              "Security"
            ],
            "kinds": [],
            "triggers": [
              "auth",
              "login",
              "password",
              "token",
              "secret",
              "payment",
              "crypt",
              "session",
              "permission",
              "sql"
            ]
          },
          "contracts": {
            "sections": [
              "API Contract"
            ],
            "kinds": [
              "api"
            ],
            "triggers": []
          },
          "nfr": {
            "sections": [
              "NFR"
            ],
            "kinds": [],
            "triggers": []
          },
          "rollback": {
            "sections": [
              "Rollback"
            ],
            "kinds": [],
            "triggers": []
          }
        },
        "changed": false,
        "description": "Named gate packs: required spec sections, required check kinds, and routing triggers. Edited as JSON per entry."
      },
      {
        "section": "graphify",
        "key": "provider",
        "path": "graphify.provider",
        "type": "enum",
        "allowed": [
          "revitify",
          "graphify"
        ],
        "value": "revitify",
        "default": "revitify",
        "changed": false,
        "description": "Who builds the code graph. `revitify` (bundled TS, zero installs) or the external Python `graphify` (multi-modal, opt-in)."
      },
      {
        "section": "graphify",
        "key": "outDir",
        "path": "graphify.outDir",
        "type": "string",
        "value": "graphify-out",
        "default": "graphify-out",
        "changed": false,
        "description": "Directory the code-graph artifacts are written to (gitignored, derived)."
      },
      {
        "section": "graphify",
        "key": "freshness",
        "path": "graphify.freshness",
        "type": "enum",
        "allowed": [
          "post-commit-hook",
          "update-on-run",
          "watch",
          "manual"
        ],
        "value": "update-on-run",
        "default": "update-on-run",
        "changed": false,
        "description": "How the code graph is kept fresh."
      }
    ]
  }
};
