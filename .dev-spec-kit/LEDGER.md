# LEDGER — generated from the journal; do not edit

> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven

## Progress board

**70/74 done (95%)**

- ✅ **FIX-ROUTE-01** route: build-intent must veto research keywords 🟢
  📋 Evidence — FIX-ROUTE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/workflow.test.ts::want-signals veto research routing` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **R-AUDIT-01** every CLI invocation is audit-logged 🟢
  📋 Evidence — R-AUDIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **R-AUDIT-02** the audit trail is readable 🟢
  📋 Evidence — R-AUDIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **R-PROG-01** progress with emoji after completing a task 🟢
  📋 Evidence — R-PROG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PRMATH-01** PR coverage uses worst-of obligation semantics 🟢
  📋 Evidence — FIX-PRMATH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/workflow.test.ts::worst-of coverage in the PR body` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PROOF-01** proof identity = tested tree hash, not commit SHA 🟢
  📋 Evidence — FIX-PROOF-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-identity.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-ROBUST-01** inputs never crash; infra errors are not proofs 🟢
  📋 Evidence — FIX-ROBUST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/robust.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-SPECSYNC-01** spec re-derive syncs bindings; evidence unclobberable 🟢
  📋 Evidence — FIX-SPECSYNC-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/spec-sync.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-GATE-01** one not-green-blocks predicate; missing graph blocks 🟢
  📋 Evidence — FIX-GATE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **GATE-PROTECT-01** in-flight specs/tests/config need human unlock 🟢
  📋 Evidence — GATE-PROTECT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/protect.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PARSE-01** parser respects markdown reality 🟢
  📋 Evidence — FIX-PARSE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/parse-fix.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-QUERY-01** read-only queries; no retry burn; deterministic ties 🟢
  📋 Evidence — FIX-QUERY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query-fix.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **AUDIT-META-01** journal meta (actor/model) + governance events 🟢
  📋 Evidence — AUDIT-META-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/audit-meta.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FINISH-RITUAL-01** rivet-finish skill: evidence gate, fixed menu, typed confirm 🟢
  📋 Evidence — FINISH-RITUAL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/finish-skill.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **GATE-FACTS-01** DENY-FORCE-ALLOW investigative gate (opt-in) 🟢
  📋 Evidence — GATE-FACTS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate-facts.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **GATE-PACKS-01** config gate packs: sections+kinds+security floor 🟢
  📋 Evidence — GATE-PACKS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate-packs.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **COMPACT-01** phase-aware checkpoints + PreCompact resume save 🟢
  📋 Evidence — COMPACT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/compact.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **SKILL-QA-01** mechanical QA: skills reference only real commands/artifacts 🟢
  📋 Evidence — SKILL-QA-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/skill-qa.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **SCALE-01** P3: locking, fold cache, failure tails, anchor-by-path, audit gating 🟢
  📋 Evidence — SCALE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/scale.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **RUNNERS-01** multi-kind verification: kind-aware runs + app lifecycle + kind runners 🟢
  📋 Evidence — RUNNERS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/runners-kind.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **RENAME-LAWS-01** rename constitution → laws (user term) 🟢
  📋 Evidence — RENAME-LAWS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/skill-qa.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **BOARDS-01** generated LEDGER.md + TRACKING.md boards 🟢
  📋 Evidence — BOARDS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/boards.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **WAVE-01** worktree wave dispatcher: plan + fetch-first start 🟢
  📋 Evidence — WAVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/wave.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **STEER-01** laws engine: 3 scopes + personal inheritance + file injection 🟢
  📋 Evidence — STEER-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/steering.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **LEARN-01** warn-on-repeat: open lessons surface at task start 🟢
  📋 Evidence — LEARN-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/learnwarn.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **WAVE-02** wave done: provenance-checked worktree cleanup after merge 🟢
  📋 Evidence — WAVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/wave-done.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **DASH-01** dashboard v1: emoji + completion % + traffic lights + graph embed 🟢
  📋 Evidence — DASH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/dashboard.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FILES-01** dashboard files plumbing: collect .rivet md + safe renderer 🟢
  📋 Evidence — FILES-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/files-tab.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **README-01** README refresh: match the real tool surface 🟢
  📋 Evidence — README-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/readme.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PROOF-02** proof identity excludes .rivet state (journal must not stale its own proofs) 🟢
  📋 Evidence — FIX-PROOF-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-identity.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **TRAIL-01** per-task gate trail: minute-level done/blocked/skipped/pending 🟢
  📋 Evidence — TRAIL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/trail.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **DASH-02** port design.html as the dashboard template with live data injection 🟢
  📋 Evidence — DASH-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/dashboard.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-DOCTOR-01** graphify optional in doctor + provenance hint (classifier-safe) 🟢
  📋 Evidence — FIX-DOCTOR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/doctor-fix.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-STACKNAMES-01** project.platforms rename + runner-stack disambiguation error 🟢
  📋 Evidence — FIX-STACKNAMES-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stacknames.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PROOF-03** check-run stamp shows tree identity, not commit sha 🟢
  📋 Evidence — FIX-PROOF-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-display.test.ts::stamps the tree identity, not the commit sha` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PROOF-04** every proof surface stamps the tree identity (PR body, approvals, ledger log) 🟢
  📋 Evidence — FIX-PROOF-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-display.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-PROV-01** provenance hint carries no rotting vanity metrics (star count) 🟢
  📋 Evidence — FIX-PROV-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/doctor-fix.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-IDS-01** fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint 🟢
  📋 Evidence — FEAT-IDS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/qualified-ids.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- 🔨 **REQUIREMENT_AUDIT-01** every CLI invocation is audit-logged 🟢🟢
  📋 Evidence — REQUIREMENT_AUDIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_AUDIT-02** the audit trail is readable 🟢🟢
  📋 Evidence — REQUIREMENT_AUDIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_PROG-01** progress with emoji after completing a task 🟢🟢
  📋 Evidence — REQUIREMENT_PROG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cli-ux.test.ts::renders an explicit empty state when there are no tasks` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-GHERKIN-01** gherkin first-class + default format + mechanical negative floor 🟢
  📋 Evidence — FEAT-GHERKIN-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gherkin.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- 🔨 **NFR_AUDIT-03** auditing never breaks the CLI 🟢
  📋 Evidence — NFR_AUDIT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::does not create journals outside dev-spec-kit projects` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-STACK-01** verify.defaultStack + platform inference; --stack optional 🟢
  📋 Evidence — FEAT-STACK-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/default-stack.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-REPORT-01** tabular post-task evidence report (terminal + LEDGER) 🟢
  📋 Evidence — FEAT-REPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/task-report.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-EMOJI-01** central emoji vocabulary (>=10 new) + plain mode for CI 🟢
  📋 Evidence — FEAT-EMOJI-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/emoji.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-VERIFY-01** rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate 🟢
  📋 Evidence — FEAT-VERIFY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/verify-cmd.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-PLATFORM-01** electron platform; platforms is an ARRAY (polyglot normal) 🟢
  📋 Evidence — FEAT-PLATFORM-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stacknames.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-INITPACKS-01** init --platforms seeds free/OSS best-practice law packs, pre-wired to checks 🟢
  📋 Evidence — FEAT-INITPACKS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/init-practices.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-CCFIRST-01** README states Claude-Code-first explicitly 🟢
  📋 Evidence — FEAT-CCFIRST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/readme.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-FLUSH-01** pr learnings-flush warn + doctor stale-worktree visibility 🟢🟢
  📋 Evidence — FEAT-FLUSH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/pr-flush-warn.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/doctor-fix.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-REVITIFY-01** revitify: native TS knowledge graph, graphify output contract, default provider 🟢
  📋 Evidence — FEAT-REVITIFY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify-contract.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FEAT-REVITIFY-02** revitify extracted to its own repo; consumer-side contract pinned 🟢
  📋 Evidence — FEAT-REVITIFY-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify-contract.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-STALEDONE-01** done-gate refuses stale evidence (pass on an older tree is not green) 🟢
  📋 Evidence — FIX-STALEDONE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stale-done.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_COCKPIT-01** config manifest generated from the schema 🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_COCKPIT-02** the RIVET data sidecar is the project's truth 🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_COCKPIT-03** static shell emission, written once 🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_COCKPIT-04** live updates after every proof event 🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_COCKPIT-05** the config save server 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-05
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_DOCS-01** every mutation refreshes every generated document 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_DOCS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/docs-refresh.test.ts::read-only queries never create or touch documents` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-COCKPIT-SEC-01** cockpit hardening: 12 adversarial-review findings (localhost bind, unlock match, parsed-write, body cap, CSRF, etc.) 🟢
  📋 Evidence — FIX-COCKPIT-SEC-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit-hardening.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **FIX-COCKPIT-ASSETS-01** regression guard for browser-asset findings #4 (json control) + #9 (auto-reload state) 🟢
  📋 Evidence — FIX-COCKPIT-ASSETS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit-assets.test.ts` | — | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_TRUST-01** a name-filtered run that matches zero tests is never a pass 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_TRUST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/report.test.ts::treats a run where 0 tests executed as failed, even on exit 0` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/runner-trust.test.ts::records a real vitest check whose name matches no test as a FAILED proof` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/runner-trust.test.ts::records a real vitest check whose name DOES match as a passing proof` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/report.test.ts::fails on a non-zero exit even if the report shows no failures (e.g. a crash)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_TRUST-02** flag-like and regex-special test names bind to exactly that test 🟢🟢
  📋 Evidence — REQUIREMENT_TRUST-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/runner.test.ts::vitest: a flag-like or regex-special name is escaped into the pattern` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/runner-trust.test.ts::binds a test whose name begins with '-' without crashing the runner CLI` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_STAMP-01** one suite run stamps every bound criterion (kills the depth tax) 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_STAMP-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stamp-batch.test.ts::stamps a file::name ref green from its matching passing test, carrying tree/sha/stack/kind` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/stamp-batch.test.ts::stamps every binding in one pass (the whole point — N criteria, one run)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/stamp-batch.test.ts::leaves a ref absent from the report UNSTAMPED (it belongs to another runner / run)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/stamp-batch.test.ts::does NOT stamp a ref whose only match was skipped — skipped is not evidence` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_LINT-01** static drift check flags orphaned refs before any run 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_LINT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/spec-lint.test.ts::flags a ref whose file is missing` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/spec-lint.test.ts::flags a ref whose test NAME no longer appears in the file (a rename)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/spec-lint.test.ts::passes a ref whose file and name both resolve` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/spec-lint.test.ts::skips a selector-only ref it cannot statically resolve (e.g. maven Class#method)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_DONE-01** the done-gate tells a stale binding apart from a missing proof 🟢🟢🟢
  📋 Evidence — REQUIREMENT_DONE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/done-msg.test.ts::is OUT OF sync when a test was renamed (task holds the old ref, spec the new)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/done-msg.test.ts::is out of sync when the counts differ` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/done-msg.test.ts::is in sync when the task's refs match the spec's (order-independent)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_DRAFT-01** draft-tests scaffolds a failing, bound stub per unbound criterion 🟢🟢🟢
  📋 Evidence — REQUIREMENT_DRAFT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/draft.test.ts::emits a stub that FAILS until implemented and carries the criterion + edge-case mandate` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/draft.test.ts::takes the SHALL clause and drops 'the system'` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/draft.test.ts::drafts only the unbound criterion, skipping bound ones and ADR records` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_RECONCILE-01** verify --stamp --advance reconciles trace with status 🟢🟢🟢
  📋 Evidence — REQUIREMENT_RECONCILE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/done-msg.test.ts::advances a not-done task whose every check is green on the current tree` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/done-msg.test.ts::never re-advances an already-done task` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/done-msg.test.ts::does NOT advance a task proven on an OLDER tree (stale)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_JUDGE-01** an LLM judge verdict is a recorded, second-class proof 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_JUDGE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/judge.test.ts::records kind=judge with provenance + reason in the tail (never an executed green)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/judge.test.ts::respects an explicit mode regardless of the key` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/judge.test.ts::auto resolves to api when a key is present, harness when not` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/judge.test.ts::is true only when ANTHROPIC_API_KEY is set` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_CYCLE-01** a circular dependency is flagged, not silently built 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_CYCLE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cycles.test.ts::finds a simple A→B→A cycle` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cycles.test.ts::finds a longer A→B→C→A cycle` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cycles.test.ts::returns nothing for an acyclic chain` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/cycles.test.ts::ignores non-dependsOn edges (a validates/implements edge is never a dependency cycle)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ✅ **REQUIREMENT_PRBLAST-01** the PR body shows the change's blast radius 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_PRBLAST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/pr-blast.test.ts::maps a changed TEST file to the validates edge it proves` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/pr-blast.test.ts::renders the touched edges for changed files that map` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/pr-blast.test.ts::notes honestly when changed files map to no graph node` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/pr-blast.test.ts::omits the section entirely when changedFiles is undefined (back-compat)` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ⬜ **REQUIREMENT_IMPL-01** proven implements edges tie changed source files to their requirements 🟢🟢🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_IMPL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/implements-edges.test.ts::links a source file a bound test imports to the requirement, carrying its rollup proof` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::buildVTG emits a green implements edge that makes unimplementedRequirements live` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::lights up a changed source file's blast radius through the implements edge` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::inherits the requirement's worst criterion proof — green only when every criterion is green` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::never links a test→test import as an implementation` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::does not link a source the requirement's tests never import` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |

- ⬜ **REQUIREMENT_INCR-01** affected-aware staleness keeps unrelated proofs green 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_INCR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/implements-edges.test.ts::relaxes a stale proof to green when the change misses its covered files` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::keeps it stale when an imported source changed` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::stays conservative (stale) when the proof's tree isn't diffable` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |
  | `test/implements-edges.test.ts::never touches non-stale edges, nor a stale edge missing a ref/tree identity` | unit | ✅ green | tree 5408e7dd | 2026-06-26T21:05:15.952Z |


## Approvals & governance

- 🛡️ 2026-06-11T23:25:31.905Z — unlock
- 🛡️ 2026-06-11T23:29:29.462Z — unlock
- 🛡️ 2026-06-11T23:34:24.469Z — unlock
- 🛡️ 2026-06-11T23:41:27.273Z — unlock
- 🛡️ 2026-06-11T23:55:10.102Z — unlock
- 🛡️ 2026-06-11T23:58:14.741Z — unlock
- 🛡️ 2026-06-11T23:58:59.298Z — unlock
- 🛡️ 2026-06-12T04:48:57.051Z — unlock
- 🛡️ 2026-06-12T04:51:20.884Z — unlock
- 🛡️ 2026-06-12T05:01:36.612Z — unlock
- 🛡️ 2026-06-12T07:00:16.579Z — unlock
- 🛡️ 2026-06-12T07:20:18.537Z — unlock
- 🔏 2026-06-12T07:21:29.214Z — Pratiyush Kumar Singh approved REQUIREMENT_COCKPIT-01, REQUIREMENT_COCKPIT-02, REQUIREMENT_COCKPIT-03, REQUIREMENT_COCKPIT-04, REQUIREMENT_COCKPIT-05, REQUIREMENT_DOCS-01
- 🔏 2026-06-12T07:21:29.913Z — Pratiyush Kumar Singh approved FEAT-VERIFY-01, FEAT-GHERKIN-01, FEAT-IDS-01, FEAT-REPORT-01, FEAT-EMOJI-01, FEAT-INITPACKS-01, FEAT-PLATFORM-01, FEAT-STACK-01, FEAT-CCFIRST-01, FEAT-FLUSH-01, FEAT-REVITIFY-01, FEAT-REVITIFY-02

## Recent activity

- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::never links a test→test import as an implementation @ tree 5408e7dd → REQUIREMENT_IMPL-01
- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::does not link a source the requirement's tests never import @ tree 5408e7dd → REQUIREMENT_IMPL-01
- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::relaxes a stale proof to green when the change misses its covered files @ tree 5408e7dd → REQUIREMENT_INCR-01
- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::keeps it stale when an imported source changed @ tree 5408e7dd → REQUIREMENT_INCR-01
- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::stays conservative (stale) when the proof's tree isn't diffable @ tree 5408e7dd → REQUIREMENT_INCR-01
- 2026-06-26 21:05:16  ✅ check test/implements-edges.test.ts::never touches non-stale edges, nor a stale edge missing a ref/tree identity @ tree 5408e7dd → REQUIREMENT_INCR-01
- 2026-06-26 21:05:17  🧾 graph build  [Pratiyush Kumar Singh]
- 2026-06-26 21:06:01  🧾 graph build  [Pratiyush Kumar Singh]
- 2026-06-26 21:06:01  🧾 graph build  [Pratiyush Kumar Singh]
- 2026-06-26 21:06:02  🧾 graph build  [Pratiyush Kumar Singh]
