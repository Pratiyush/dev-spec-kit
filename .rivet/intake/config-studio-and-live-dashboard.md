---
from: Pratiyush, 2026-06-12 (post-batch ideas)
---
Three improvements, sequenced behind the config-studio design session:

1. LIVE REPORTS (FEAT-LIVEDASH-01, small) — STATIC SHELL + DATA SIDECAR (Pratiyush 2026-06-12):
   dashboard.html becomes a stable shell written once (re-written only when the template version
   changes); every `task done` / `check run` (when dashboard.updates="live") rewrites ONLY
   `.rivet/dashboard-data.js` (`window.RIVET_DATA = {...}` — script sidecar because file:// blocks
   fetch of .json). Shell reloads every dashboard.refreshSeconds (default 15), persisting UI state
   in localStorage. `task done` already prints the 📋 evidence table.

2. CONFIG STUDIO (FEAT-CONFIGWEB-01, medium) — `rivet config` prints the effective config with
   changed-vs-default provenance; `rivet config --web` serves the designed UI on localhost with
   GET/POST /api/config (zod-validated, writes .rivet/config.json — the same file the CLI updates).
   POST must run the GATE-PROTECT predicate (config is locked while tasks are in flight; refusal
   carries the `rivet unlock` hint). Design prompt ready: .rivet/CONFIG-WEB-DESIGN-PROMPT.md —
   waiting on Pratiyush's design session to produce config-studio.html, then port (DASH-02 style).

3. ONE WEB SURFACE (later, after 1+2) — `rivet web` serves Dashboard | Config as tabs; the
   server's ONLY unique job is config saving (reads are static-sidecar everywhere). Static
   dashboard.html + dashboard-data.js remain the default serverless experience.

Schema groundwork to do during the port: migrate config comments → zod .describe() so the manifest
the UI renders, the docs page, and the schema are ONE source of truth.
