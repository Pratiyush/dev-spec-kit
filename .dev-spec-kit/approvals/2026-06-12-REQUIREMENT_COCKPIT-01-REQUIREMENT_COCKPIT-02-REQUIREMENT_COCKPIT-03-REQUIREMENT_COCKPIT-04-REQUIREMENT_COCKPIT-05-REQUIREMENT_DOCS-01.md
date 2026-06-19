# Approval — REQUIREMENT_COCKPIT-01, REQUIREMENT_COCKPIT-02, REQUIREMENT_COCKPIT-03, REQUIREMENT_COCKPIT-04, REQUIREMENT_COCKPIT-05, REQUIREMENT_DOCS-01

- **Approved by:** Pratiyush Kumar Singh
- **At:** 2026-06-12T07:21:29.214Z
- **Code tree:** tree f0a70718
- **Note:** Pratiyush 2026-06-12: 'design has come... think and refine and implement' + 'fix all' — cockpit and docs-refresh approved

## Evidence

### REQUIREMENT_COCKPIT-01 — config manifest generated from the schema (done)
- ✅ `test/config-manifest.test.ts::every leaf knob is fully described (type, default, value, changed, description)` @ tree c6c5cfce (2026-06-12T07:05:27.210Z)
- ✅ `test/config-manifest.test.ts::enums carry allowed values; runner records carry the cmd-args shape` @ tree c6c5cfce (2026-06-12T07:05:27.791Z)
- ✅ `test/config-manifest.test.ts::unsupported or undescribed schema nodes throw with the offending path` @ tree c6c5cfce (2026-06-12T07:05:28.371Z)

### REQUIREMENT_COCKPIT-02 — the RIVET data sidecar is the project's truth (done)
- ✅ `test/cockpit.test.ts::the RIVET sidecar carries meta, dashboard truth, and the config manifest` @ tree c6c5cfce (2026-06-12T07:05:29.309Z)
- ✅ `test/cockpit.test.ts::passing results from an older tree are marked stale in the sidecar` @ tree c6c5cfce (2026-06-12T07:05:30.247Z)
- ✅ `test/cockpit.test.ts::a closing script tag in artifact content is escaped in the sidecar` @ tree c6c5cfce (2026-06-12T07:05:31.180Z)

### REQUIREMENT_COCKPIT-03 — static shell emission, written once (done)
- ✅ `test/cockpit.test.ts::emission writes the shell once plus a fresh sidecar` @ tree c6c5cfce (2026-06-12T07:05:32.250Z)
- ✅ `test/cockpit.test.ts::re-emission touches only the sidecar until the shell version changes` @ tree c6c5cfce (2026-06-12T07:05:33.485Z)

### REQUIREMENT_COCKPIT-04 — live updates after every proof event (done)
- ✅ `test/cockpit.test.ts::live mode rewrites the sidecar on task done and check run` @ tree c6c5cfce (2026-06-12T07:05:34.978Z)
- ✅ `test/cockpit.test.ts::on-demand mode never rewrites the sidecar on task events` @ tree bad3adce* (2026-06-12T07:20:23.464Z)

### REQUIREMENT_COCKPIT-05 — the config save server (done)
- ✅ `test/cockpit-server.test.ts::a valid POST saves config.json and journals governance` @ tree c6c5cfce (2026-06-12T07:05:36.908Z)
- ✅ `test/cockpit-server.test.ts::an invalid POST returns field errors and never writes` @ tree c6c5cfce (2026-06-12T07:05:37.758Z)
- ✅ `test/cockpit-server.test.ts::in-flight tasks refuse the save with GATE-PROTECT-01 and the unlock hint` @ tree c6c5cfce (2026-06-12T07:05:38.670Z)
- ✅ `test/cockpit-server.test.ts::GET /api/state returns the RIVET object in server mode` @ tree c6c5cfce (2026-06-12T07:05:39.606Z)

### REQUIREMENT_DOCS-01 — every mutation refreshes every generated document (done)
- ✅ `test/docs-refresh.test.ts::task mutations refresh boards, resume, graph, and the sidecar` @ tree d8177340* (2026-06-12T07:19:24.555Z)
- ✅ `test/docs-refresh.test.ts::drift refreshes the sidecar and boards after re-proving` @ tree d8177340* (2026-06-12T07:19:26.608Z)
- ✅ `test/docs-refresh.test.ts::read-only queries never create or touch documents` @ tree d8177340* (2026-06-12T07:19:28.353Z)
- ✅ `test/docs-refresh.test.ts::on-demand keeps boards fresh without writing the sidecar` @ tree d8177340* (2026-06-12T07:19:30.138Z)

