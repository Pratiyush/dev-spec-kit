---
from: Pratiyush, 2026-06-12 (post-batch ideas)
---
Three improvements, sequenced behind the config-studio design session:

1. LIVE REPORTS (FEAT-LIVEDASH-01, small) — when dashboard.updates="live" (knob already exists,
   unwired): every `task done` / `check run` silently regenerates LEDGER/TRACKING + dashboard.html;
   `task done` already prints the 📋 evidence table. Add dashboard.refreshSeconds (default 15) and a
   reload tag in the generated HTML so an open dashboard stays current.

2. CONFIG STUDIO (FEAT-CONFIGWEB-01, medium) — `rivet config` prints the effective config with
   changed-vs-default provenance; `rivet config --web` serves the designed UI on localhost with
   GET/POST /api/config (zod-validated, writes .rivet/config.json — the same file the CLI updates).
   POST must run the GATE-PROTECT predicate (config is locked while tasks are in flight; refusal
   carries the `rivet unlock` hint). Design prompt ready: .rivet/CONFIG-WEB-DESIGN-PROMPT.md —
   waiting on Pratiyush's design session to produce config-studio.html, then port (DASH-02 style).

3. ONE WEB SURFACE (later, after 1+2) — `rivet web` serves Dashboard | Config as tabs with the
   shared 15s refresh; static dashboard.html generation stays for serverless use.

Schema groundwork to do during the port: migrate config comments → zod .describe() so the manifest
the UI renders, the docs page, and the schema are ONE source of truth.
