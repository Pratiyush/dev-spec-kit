# LEDGER — generated from the journal; do not edit

> Legend: ✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending — proofs: 🟢 green · 🔴 red · 🟣 stale · ⚪ unproven

## Progress board

**59/59 done (100%)**

- ✅ **FIX-ROUTE-01** route: build-intent must veto research keywords 🟢
  📋 Evidence — FIX-ROUTE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/workflow.test.ts::want-signals veto research routing` | — | ✅ green | d907fcfc | 2026-06-11T19:04:45.282Z |

- ✅ **R-AUDIT-01** every CLI invocation is audit-logged 🟢
  📋 Evidence — R-AUDIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:37.688Z |

- ✅ **R-AUDIT-02** the audit trail is readable 🟢
  📋 Evidence — R-AUDIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:39.299Z |

- ✅ **R-PROG-01** progress with emoji after completing a task 🟢
  📋 Evidence — R-PROG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:40.842Z |

- ✅ **FIX-PRMATH-01** PR coverage uses worst-of obligation semantics 🟢
  📋 Evidence — FIX-PRMATH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/workflow.test.ts::worst-of coverage in the PR body` | — | 🟣 stale | tree 821bc2c1* | 2026-06-11T19:40:40.285Z |

- ✅ **FIX-PROOF-01** proof identity = tested tree hash, not commit SHA 🟢
  📋 Evidence — FIX-PROOF-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-identity.test.ts` | — | 🟣 stale | tree 841d50fa* | 2026-06-11T19:40:41.463Z |

- ✅ **FIX-ROBUST-01** inputs never crash; infra errors are not proofs 🟢
  📋 Evidence — FIX-ROBUST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/robust.test.ts` | — | 🟣 stale | tree fa8bf773* | 2026-06-11T20:03:40.197Z |

- ✅ **FIX-SPECSYNC-01** spec re-derive syncs bindings; evidence unclobberable 🟢
  📋 Evidence — FIX-SPECSYNC-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/spec-sync.test.ts` | — | 🟣 stale | tree d8286eac* | 2026-06-11T20:03:40.850Z |

- ✅ **FIX-GATE-01** one not-green-blocks predicate; missing graph blocks 🟢
  📋 Evidence — FIX-GATE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate.test.ts` | — | 🟣 stale | tree 0680725c* | 2026-06-11T20:03:41.706Z |

- ✅ **GATE-PROTECT-01** in-flight specs/tests/config need human unlock 🟢
  📋 Evidence — GATE-PROTECT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/protect.test.ts` | — | 🟣 stale | tree ab79494d* | 2026-06-11T20:03:42.509Z |

- ✅ **FIX-PARSE-01** parser respects markdown reality 🟢
  📋 Evidence — FIX-PARSE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/parse-fix.test.ts` | — | 🟣 stale | tree 42b08be2* | 2026-06-11T20:14:00.842Z |

- ✅ **FIX-QUERY-01** read-only queries; no retry burn; deterministic ties 🟢
  📋 Evidence — FIX-QUERY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/query-fix.test.ts` | — | 🟣 stale | tree 980ef995* | 2026-06-11T20:14:01.590Z |

- ✅ **AUDIT-META-01** journal meta (actor/model) + governance events 🟢
  📋 Evidence — AUDIT-META-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/audit-meta.test.ts` | — | 🟣 stale | tree 3688bfe5* | 2026-06-11T20:14:02.272Z |

- ✅ **FINISH-RITUAL-01** rivet-finish skill: evidence gate, fixed menu, typed confirm 🟢
  📋 Evidence — FINISH-RITUAL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/finish-skill.test.ts` | — | 🟣 stale | tree 83d65b5d* | 2026-06-11T20:14:28.441Z |

- ✅ **GATE-FACTS-01** DENY-FORCE-ALLOW investigative gate (opt-in) 🟢
  📋 Evidence — GATE-FACTS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate-facts.test.ts` | — | 🟣 stale | tree f61961e3* | 2026-06-11T20:20:54.347Z |

- ✅ **GATE-PACKS-01** config gate packs: sections+kinds+security floor 🟢
  📋 Evidence — GATE-PACKS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gate-packs.test.ts` | — | 🟣 stale | tree 03742674* | 2026-06-11T20:20:55.029Z |

- ✅ **COMPACT-01** phase-aware checkpoints + PreCompact resume save 🟢
  📋 Evidence — COMPACT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/compact.test.ts` | — | 🟣 stale | tree 9e3b4787* | 2026-06-11T20:26:12.832Z |

- ✅ **SKILL-QA-01** mechanical QA: skills reference only real commands/artifacts 🟢
  📋 Evidence — SKILL-QA-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/skill-qa.test.ts` | — | 🟣 stale | tree 61fd35cb* | 2026-06-11T20:26:46.486Z |

- ✅ **SCALE-01** P3: locking, fold cache, failure tails, anchor-by-path, audit gating 🟢
  📋 Evidence — SCALE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/scale.test.ts` | — | 🟣 stale | tree 0a038ae6* | 2026-06-11T20:31:26.691Z |

- ✅ **RUNNERS-01** multi-kind verification: kind-aware runs + app lifecycle + kind runners 🟢
  📋 Evidence — RUNNERS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/runners-kind.test.ts` | unit | 🟣 stale | tree 53cbf304* | 2026-06-11T20:37:33.483Z |

- ✅ **RENAME-LAWS-01** rename constitution → laws (user term) 🟢
  📋 Evidence — RENAME-LAWS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/skill-qa.test.ts` | unit | 🟣 stale | tree 8953a0d0* | 2026-06-11T20:43:54.504Z |

- ✅ **BOARDS-01** generated LEDGER.md + TRACKING.md boards 🟢
  📋 Evidence — BOARDS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/boards.test.ts` | unit | 🟣 stale | tree ff4f153d* | 2026-06-11T20:47:10.950Z |

- ✅ **WAVE-01** worktree wave dispatcher: plan + fetch-first start 🟢
  📋 Evidence — WAVE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/wave.test.ts` | unit | 🟣 stale | tree 72272126* | 2026-06-11T20:48:33.481Z |

- ✅ **STEER-01** laws engine: 3 scopes + personal inheritance + file injection 🟢
  📋 Evidence — STEER-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/steering.test.ts` | unit | 🟣 stale | tree 6e83b58f* | 2026-06-11T21:02:48.986Z |

- ✅ **LEARN-01** warn-on-repeat: open lessons surface at task start 🟢
  📋 Evidence — LEARN-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/learnwarn.test.ts` | unit | 🟣 stale | tree 487cf5cd* | 2026-06-11T21:02:49.636Z |

- ✅ **WAVE-02** wave done: provenance-checked worktree cleanup after merge 🟢
  📋 Evidence — WAVE-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/wave-done.test.ts` | unit | 🟣 stale | tree 9f27b9ad* | 2026-06-11T21:02:51.136Z |

- ✅ **DASH-01** dashboard v1: emoji + completion % + traffic lights + graph embed 🟢
  📋 Evidence — DASH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/dashboard.test.ts` | unit | 🟣 stale | tree 04802fe3* | 2026-06-11T21:11:19.414Z |

- ✅ **FILES-01** dashboard files plumbing: collect .rivet md + safe renderer 🟢
  📋 Evidence — FILES-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/files-tab.test.ts` | unit | 🟣 stale | tree 62f3e904* | 2026-06-11T21:27:26.317Z |

- ✅ **README-01** README refresh: match the real tool surface 🟢
  📋 Evidence — README-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/readme.test.ts` | unit | 🟣 stale | tree 6185e94a* | 2026-06-11T21:27:27.007Z |

- ✅ **FIX-PROOF-02** proof identity excludes .rivet state (journal must not stale its own proofs) 🟢
  📋 Evidence — FIX-PROOF-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-identity.test.ts` | unit | 🟣 stale | tree f8ccd6b3* | 2026-06-11T21:29:15.431Z |

- ✅ **TRAIL-01** per-task gate trail: minute-level done/blocked/skipped/pending 🟢
  📋 Evidence — TRAIL-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/trail.test.ts` | unit | 🟣 stale | tree 61afc144* | 2026-06-11T21:47:11.693Z |

- ✅ **DASH-02** port design.html as the dashboard template with live data injection 🟢
  📋 Evidence — DASH-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/dashboard.test.ts` | unit | 🟣 stale | tree 61afc144* | 2026-06-11T21:47:12.413Z |

- ✅ **FIX-DOCTOR-01** graphify optional in doctor + provenance hint (classifier-safe) 🟢
  📋 Evidence — FIX-DOCTOR-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/doctor-fix.test.ts` | unit | 🟣 stale | tree 39bf63d7* | 2026-06-11T22:00:57.454Z |

- ✅ **FIX-STACKNAMES-01** project.platforms rename + runner-stack disambiguation error 🟢
  📋 Evidence — FIX-STACKNAMES-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stacknames.test.ts` | unit | 🟣 stale | tree 39bf63d7* | 2026-06-11T22:00:58.187Z |

- ✅ **FIX-PROOF-03** check-run stamp shows tree identity, not commit sha 🟢
  📋 Evidence — FIX-PROOF-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-display.test.ts::stamps the tree identity, not the commit sha` | unit | 🟣 stale | tree 5c1f03a7* | 2026-06-11T22:04:59.081Z |

- ✅ **FIX-PROOF-04** every proof surface stamps the tree identity (PR body, approvals, ledger log) 🟢
  📋 Evidence — FIX-PROOF-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/proof-display.test.ts` | unit | 🟣 stale | tree bfcd211e* | 2026-06-11T23:28:45.141Z |

- ✅ **FIX-PROV-01** provenance hint carries no rotting vanity metrics (star count) 🟢
  📋 Evidence — FIX-PROV-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/doctor-fix.test.ts` | unit | 🟣 stale | tree 13cbb36b* | 2026-06-11T23:30:11.511Z |

- ✅ **FEAT-IDS-01** fully-qualified requirement ids (REQUIREMENT_/NFR_/ADR_) with configurable lint 🟢
  📋 Evidence — FEAT-IDS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/qualified-ids.test.ts` | unit | 🟣 stale | tree af88bfd0* | 2026-06-11T23:33:58.426Z |

- ✅ **REQUIREMENT_AUDIT-01** every CLI invocation is audit-logged 🟢🟢
  📋 Evidence — REQUIREMENT_AUDIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::audits cli invocations into the journal` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:37.688Z |
  | `test/cli-ux.test.ts::does not create journals outside Rivet projects` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:38.486Z |

- ✅ **REQUIREMENT_AUDIT-02** the audit trail is readable 🟢🟢
  📋 Evidence — REQUIREMENT_AUDIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders the audit trail with per-type emoji` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:39.299Z |
  | `test/robust.test.ts::a structurally-valid event missing `data` does not brick log or the task fold` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:40.070Z |

- ✅ **REQUIREMENT_PROG-01** progress with emoji after completing a task 🟢🟢
  📋 Evidence — REQUIREMENT_PROG-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::renders progress with emoji, bar, and next-up` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:40.842Z |
  | `test/cli-ux.test.ts::renders an explicit empty state when there are no tasks` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:41.647Z |

- ✅ **FEAT-GHERKIN-01** gherkin first-class + default format + mechanical negative floor 🟢
  📋 Evidence — FEAT-GHERKIN-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/gherkin.test.ts` | unit | 🟣 stale | tree bda82c18* | 2026-06-11T23:40:54.391Z |

- ✅ **NFR_AUDIT-03** auditing never breaks the CLI 🟢
  📋 Evidence — NFR_AUDIT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cli-ux.test.ts::does not create journals outside Rivet projects` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:38.486Z |

- ✅ **FEAT-STACK-01** verify.defaultStack + platform inference; --stack optional 🟢
  📋 Evidence — FEAT-STACK-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/default-stack.test.ts` | unit | 🟣 stale | tree f667aa68* | 2026-06-11T23:45:42.780Z |

- ✅ **FEAT-REPORT-01** tabular post-task evidence report (terminal + LEDGER) 🟢
  📋 Evidence — FEAT-REPORT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/task-report.test.ts` | unit | 🟣 stale | tree 95e2a25a* | 2026-06-11T23:47:39.111Z |

- ✅ **FEAT-EMOJI-01** central emoji vocabulary (>=10 new) + plain mode for CI 🟢
  📋 Evidence — FEAT-EMOJI-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/emoji.test.ts` | unit | 🟣 stale | tree fb84c373* | 2026-06-11T23:50:19.284Z |

- ✅ **FEAT-VERIFY-01** rivet verify: build ALL + run ALL kinds, journaled; hard fresh-tree PR gate 🟢
  📋 Evidence — FEAT-VERIFY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/verify-cmd.test.ts` | unit | 🟣 stale | tree d9d37e49* | 2026-06-11T23:54:53.789Z |

- ✅ **FEAT-PLATFORM-01** electron platform; platforms is an ARRAY (polyglot normal) 🟢
  📋 Evidence — FEAT-PLATFORM-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stacknames.test.ts` | unit | 🟣 stale | tree 255f2e33* | 2026-06-11T23:59:51.330Z |

- ✅ **FEAT-INITPACKS-01** init --platforms seeds free/OSS best-practice law packs, pre-wired to checks 🟢
  📋 Evidence — FEAT-INITPACKS-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/init-practices.test.ts` | unit | 🟣 stale | tree 47c4f9b2* | 2026-06-12T04:46:02.585Z |

- ✅ **FEAT-CCFIRST-01** README states Claude-Code-first explicitly 🟢
  📋 Evidence — FEAT-CCFIRST-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/readme.test.ts` | unit | 🟣 stale | tree cdec907f* | 2026-06-12T04:50:02.948Z |

- ✅ **FEAT-FLUSH-01** pr learnings-flush warn + doctor stale-worktree visibility 🟢🟢
  📋 Evidence — FEAT-FLUSH-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/pr-flush-warn.test.ts` | unit | 🟣 stale | tree d434b3db* | 2026-06-12T04:53:32.732Z |
  | `test/doctor-fix.test.ts` | unit | 🟣 stale | tree d434b3db* | 2026-06-12T04:53:33.680Z |

- ✅ **FEAT-REVITIFY-01** revitify: native TS knowledge graph, graphify output contract, default provider 🟢
  📋 Evidence — FEAT-REVITIFY-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `packages/revitify/test/revitify.test.ts` | unit | 🟣 stale | tree 60ee0b6a* | 2026-06-12T05:05:39.506Z |

- ✅ **FEAT-REVITIFY-02** revitify extracted to its own repo; consumer-side contract pinned 🟢
  📋 Evidence — FEAT-REVITIFY-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/revitify-contract.test.ts` | unit | 🟣 stale | tree 76a8f022* | 2026-06-12T05:10:39.529Z |

- ✅ **FIX-STALEDONE-01** done-gate refuses stale evidence (pass on an older tree is not green) 🟢
  📋 Evidence — FIX-STALEDONE-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/stale-done.test.ts` | unit | 🟣 stale | tree e45f057f* | 2026-06-12T05:26:05.329Z |

- ✅ **REQUIREMENT_COCKPIT-01** config manifest generated from the schema 🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-01
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:42.270Z |
  | `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:42.886Z |
  | `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:43.492Z |

- ✅ **REQUIREMENT_COCKPIT-02** the RIVET data sidecar is the project's truth 🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-02
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:44.508Z |
  | `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:45.449Z |
  | `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:46.379Z |

- ✅ **REQUIREMENT_COCKPIT-03** static shell emission, written once 🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-03
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:47.464Z |
  | `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:48.708Z |

- ✅ **REQUIREMENT_COCKPIT-04** live updates after every proof event 🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-04
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:50.220Z |
  | `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:51.308Z |

- ✅ **REQUIREMENT_COCKPIT-05** the config save server 🟢🟢🟢🟢
  📋 Evidence — REQUIREMENT_COCKPIT-05
  | Check | Kind | State | Proof | Proven at |
  |---|---|---|---|---|
  | `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:52.164Z |
  | `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:53.019Z |
  | `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:53.932Z |
  | `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` | unit | 🟣 stale | tree 7ad8bef9 | 2026-06-12T07:04:54.858Z |


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

## Recent activity

- [2m2026-06-12 07:04:48[22m  ✅ check test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-03
- [2m2026-06-12 07:04:50[22m  ✅ check test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-04
- [2m2026-06-12 07:04:51[22m  ✅ check test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-04
- [2m2026-06-12 07:04:52[22m  ✅ check test/cockpit-server.test.ts::a valid POST saves config.json and journals governance @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-05
- [2m2026-06-12 07:04:53[22m  ✅ check test/cockpit-server.test.ts::an invalid POST returns field errors and never writes @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-05
- [2m2026-06-12 07:04:53[22m  ✅ check test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-05
- [2m2026-06-12 07:04:54[22m  ✅ check test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode @ tree 7ad8bef9 → REQUIREMENT_COCKPIT-05
- [2m2026-06-12 07:04:55[22m  🧾 verify  [Pratiyush Kumar Singh]
- [2m2026-06-12 07:05:00[22m  ✅ verify 4 step(s) @ tree 7ad8bef9
- [2m2026-06-12 07:05:00[22m  🧾 graph build  [Pratiyush Kumar Singh]
