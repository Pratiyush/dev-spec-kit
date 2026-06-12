# Handoff: Rivet Cockpit (Dashboard + Config)

## Overview
The **Rivet Cockpit** is the web UI for *Rivet*, a spec-driven development tool whose state and policy live in a `.rivet/` folder. It unifies two surfaces in one app shell:

- **Dashboard** — read-only evidence views: Overview, Tasks, Requirements, Graph, Activity, Artifacts. Answers "how much is *riveted* (evidence-bound done), where does proof stand, what just happened."
- **Config** — an editor for `.rivet/config.json` (~55 knobs across 15 sections): discoverable, explained, safely editable. The same file is read/written by the CLI, so **disk is the source of truth**.

Both render from **one JSON object** (`window.RIVET`). The real tool injects the same shape over HTTP:
- `GET /api/state` → the `RIVET` object
- `POST /api/config` → saves `config.manifest` values to `.rivet/config.json` after zod validation; returns `{ errors:[{path,message}] }`, or `{ blocked:"GATE-PROTECT-01", reason, unlockHint }` when tasks are in flight.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/vanilla JS** — a working prototype showing intended look and behavior, **not production code to copy directly**. The task is to **recreate these designs in the target codebase's environment** (React/Vue/Svelte/etc.) using its established patterns, component library, router, and state management. If no front-end environment exists yet, pick the most appropriate framework (a small React + Vite SPA fits well) and implement there. The vanilla-JS module split here (`data / core / dashboard / config / app`) maps cleanly onto components + a store.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, motion, and interaction states are all intentional and specified below. Recreate pixel-faithfully using the codebase's primitives. Light is the default theme; dark is a full parity theme toggled via a class on `<html>` (`data-theme="dark"`).

---

## Screens / Views

The shell is a **fixed left rail (248px) + topbar (60px) + scrollable content**. The rail, its groups, badges, and the page list are all **built from `RIVET.nav`** — not hard-coded.

### Shell — Left Rail
- **Brand block** (top): 32×32 copper gradient tile with 🔩, wordmark `rivet_` (JetBrains Mono 700, the `_` is copper), tagline below in faint 10.5px.
- **Two groups** from `RIVET.nav`: "Dashboard" (6 items) and "Config" (15 section items + a search input). Group label is mono 10px uppercase, letter-spacing .16em, with a right-aligned count pill (Dashboard = open-task count in red; Config = total changed-from-default in copper).
- **Rail item**: icon (20px slot) + capitalized label + optional badge pill. Hover → `--rail-2` bg; active → white bg + shadow + a 3px copper left-edge bar (`::before`).
- **Config search**: rounded input, 🔍 prefix, `/` kbd hint suffix; focus ring `0 0 0 3px rgba(189,106,44,.16)`.
- **Rail foot**: keyboard legend in mono 10px.

### Shell — Topbar
- Sticky, 60px, blurred translucent bg, 1px bottom border.
- **Breadcrumb**: `<mode> / <page>` — mode in `--dim`, separator `--faint`, page bold + capitalized with its icon.
- **Right cluster**: sync indicator (`synced HH:MM:SS · every {refreshSeconds}s` with a pulsing green dot), `{ } JSON` button (kbd `J`), theme toggle (🌙/☀️). On ≤1020px a ☰ menu button appears at the left to open the rail as a drawer.

### Dashboard / Overview
- Optional **drift banner** (violet): `🟣 N proofs red/stale — code moved or checks failed since last verify` + `$ rivet drift`.
- **2-col grid (1.55fr / 1fr)**:
  - **Hero card** (min-height 312px): label `🔩 Riveted · evidence-bound done`; giant mono percentage (clamp 74–120px, tabular, -.05em) that **counts up 0→89% over 1050ms (ease-out cubic)**; sub-line `24 of 27 tasks riveted… · 3 open`; a `██████░░` block-bar (28 cells) that fills in sync, plus a thin gradient fill-bar with copper glow. A soft copper blurred circle bleeds from the top-right corner.
  - **Side column**: Proof-states card (2×2 pills: proven/failing/stale/unproven, each tinted), Latest-approval card (🔏 approver + task ids + relative time), and a "Last N events" sparkline (mini bars colored by event type).
- **Legend** row explaining the four proof colors; **stale is violet and explicitly captioned "code moved, re-verify (not broken)"** — never styled like red.

### Dashboard / Tasks
- Toolbar: segmented filter **All / 🔴 Failing / 🔨 In progress** (counts inline) + glyph legend.
- **Task rows** (cards): status emoji (✅🔨🚧⬜), mono task id (copper, 96px col), title (done = dimmed), right-aligned check chips each with a proof light. Failing tasks are **expandable**: caret rotates, row toggles `.open`, and a **terminal block** slides open (grid-rows 0fr→1fr, 280ms) showing `✗ FAIL`, the check ref/kind/time, and the captured `tail` in red mono on near-black.

### Dashboard / Requirements
- A table: **Requirement** (mono id + title) · **Criteria** (chips w/ proof lights) · **Proof (worst-of)** (emoji + label, computed as the worst proof across criteria, order red<stale<unproven<green) · **Definition of done** (`● PROVEN` green badge / `○ UNPROVEN` gray badge) · **Approved** (✅ / —). Row hover tint. Same proof legend below.

### Dashboard / Graph
- Placeholder card (min-height 430px) with diagonal hairline stripes and a centered mono caption describing the injected `<iframe srcdoc>` requirement→check graph. **Edge legend**: green solid (proven), red solid (failing), violet dashed (stale), gray dotted (unproven).

### Dashboard / Activity
- A **journal feed**: each event = icon + text (path/ref tokens auto-wrapped in copper `<code>`) + actor/model chips + `HH:MM · Nago` timestamp. Separate **🛡️ Governance** section below (lock/unlock events).

### Dashboard / Artifacts
- 2-col (236px sidebar / content). Sidebar groups files by directory (`.rivet/`, `specs/`, `approvals/`); active item gets a copper left-edge. Content pane = a file header + the markdown rendered by the in-house renderer (headings, lists, **real styled tables**, fenced code on near-black, blockquotes, and `@check …` directive callouts in violet). Raw HTML in content is escaped.

### Config / Section pages (×15)
- **Page head**: section icon + name + knob-count pill + `section.*` path chip + blurb.
- **Knob card** per setting: key (mono 600) + type tag + (if changed) `● changed` copper flag + `↺ reset to default` button; description (inline `code`); the control; and `default: <value>`. Changed cards get a copper-tinted border; error cards get a red border + `⛔ message`.
- **Controls by type**:
  - `boolean` → 46×26 switch (green when on) + state word.
  - `enum` → segmented control if ≤4 short options (on/off tinted green/red), else a styled `<select>`.
  - `enum[]` → toggle chip multi-select (copper when on, ✓ prefix).
  - `number` → stepper `− [input] +` with optional unit; nullable numbers get a `set null` chip.
  - `string` → mono text input; placeholder = default; empty → `null` with a tag.
  - `record` → editable rows. `kindRunners` shape = key + `cmd` + `args` free-chips; generic (`packs`) = key + JSON value. Add/remove per row.
  - `object` → nested field group (`verify.app`: start string[] + readyUrl + readyTimeoutMs; `dashboard.notify`: channels[] + on[]).
- **Search** (in rail): fuzzy over key/path/section/description → flat results list with section tags.

### Config — global elements
- **Save bar** (fixed, offset by rail width; slides up only in Config): dirty-dot + `N unsaved changes` (vs **disk**, not vs default) + Discard + Save (shows count, kbd ⌘S; shield icon 🛡 when gate-locked). Read-only mode → Save disabled with the `rivet config --web` hint.
- **JSON drawer** (right, 560px, slides in): live syntax-highlighted exact bytes of `config.json`, Copy button, footer with pending count.
- **Three live states** (banners atop the Config view):
  1. **Disk-changed** (violet): "config.json changed on disk" + Reload / Keep-my-edits — never clobbers unsaved edits.
  2. **GATE-PROTECT-01** (red): "Save refused — locked while FEAT-X-01 is in flight" + `rivet unlock .rivet/config.json --minutes 30` + Run-unlock action (releases lock → Save works).
  3. **Read-only** (gray): file:// with no server.

---

## Interactions & Behavior
- **Routing**: `mode/page` reflected in `location.hash` (e.g. `#config/verify`); deep-linkable; invalid hash → `dashboard/overview`.
- **Hero animation**: count-up + block-bar fill, ease-out cubic, 1050ms, runs once; **final state is rendered synchronously first** with a 320ms fallback so it never sticks at 0 (and respects `prefers-reduced-motion`).
- **Task expand**: `grid-template-rows 0fr→1fr` 280ms ease.
- **View enter**: `translateY(8px)+opacity` 300ms `cubic-bezier(.22,.8,.3,1)`; disabled under reduced-motion.
- **Drawer/save bar/rail-drawer**: transform-based slides, ~260–280ms `cubic-bezier(.3,.8,.3,1)`.
- **Config edit loop**: edit → mark dirty (vs disk) + changed (vs default) → Save runs client validation (mirrors zod) → on error, inline `⛔` at the knob + smooth scroll-to + toast → else gate check → else write to "disk", update synced time, toast. Text inputs re-render but **focus + caret are preserved** via a snapshot/restore.
- **Keyboard**: `/` search · `J` JSON drawer · `⌘/Ctrl+S` save · `Esc` close/clear · `G` cycle dashboard tabs · `⇧D` simulate disk-change/reload · `⇧G` toggle GATE-PROTECT · `⇧R` toggle read-only · `⇧X` discard.
- **Responsive**: ≤1020px rail becomes an off-canvas drawer (☰ + scrim); ≤760px grids collapse to one column, some table/columns hide.
- **Polling**: the real app polls `GET /api/state` every `refreshSeconds` (default 15); if disk changed, show the non-destructive disk-changed banner. Never silently overwrite.

## State Management
- **Single source**: `window.RIVET` (`meta`, `nav`, `dashboard`, `config`).
- **Runtime** (`RT`): `mode`, `page`, `lastSynced`, `serverMode`, `gateLocked`.
- **Config store**: `loaded` (disk snapshot) vs `state` (edited) keyed by knob `path`; `errorMap` (path→message); `banners {disk,gate}`; `query`. Derived: `isChanged` (state≠default), `isDirty` (state≠loaded), per-section + total changed counts, dirty paths.
- **In a real app**: fetch `RIVET` into a store on mount; POST `buildConfig()` (nested object rebuilt from flat paths) on Save; reconcile poll responses into `loaded`, diffing against `state` to raise the disk banner.

## Design Tokens
**Colors — light (default):** bg `#f3efe6` · surface `#faf8f2` · panel `#ffffff` · panel-2 `#f6f2ea` · panel-3 `#efe9dc` · rail `#ece6d8` · border `#e6e1d4` · border-2 `#d6cfbd` · text `#1f1b14` · dim `#6b6557` · faint `#9a9384` · **accent (copper) `#bd6a2c`** / accent-2 `#a2581f`.
**Truth palette (both themes, reserved):** green `#13935a` · red `#d4453a` · violet `#7a5bf0` · gray `#a39b8a` (+ matching `-soft` ~10–13% alpha tints).
**Colors — dark:** bg `#0b0a08` · panel `#15120d` · border `#28231a` · text `#ece7dc` · accent `#e09a52`; truth palette brightens (green `#3fd68f`, red `#f4604e`, violet `#b88ff5`); proof-light glow scales up via `--glow` (.20 light / .7 dark).
**Type:** UI = **Space Grotesk** (400/500/600/700); numbers, ids, code, paths, terminal = **JetBrains Mono**. Hero % is mono tabular, clamp 74–120px, -.05em.
**Radii:** `--r` 13px · `--r-sm` 9px · pills 99px. **Spacing:** rail 248px, topbar 60px, content max-width 1180px, card gap 12–18px, card pad 16–22px.
**Shadows:** sm `0 1px 2px rgba(60,45,15,.05), 0 4px 14px rgba(60,45,15,.045)` · lg `0 2px 8px …,(.07) 0 18px 46px …(.09)` (light); dark uses deep soft shadows. **Focus ring:** `0 0 0 3px rgba(189,106,44,.16)`.
**Motion:** view-enter 300ms, hero 1050ms ease-out-cubic, slides 260–280ms `cubic-bezier(.3,.8,.3,1)`. All decorative motion gated on `prefers-reduced-motion`.

## Assets
No external images or icon fonts. The brand mark and all glyphs are **Unicode emoji** (🔩 brand; ✅🔨🚧⬜ task status; 🟢🔴🟣⚪ proof; section icons 📦🧭📥📐🔨✅🔎🔀🧠⚡📊⚖️🌱🛡️🕸️). Only one webfont link (Google Fonts: Space Grotesk + JetBrains Mono). The block-bar uses `█`/`░` box-drawing characters. Swap emoji for the codebase's icon set if preferred, but keep the proof-color semantics.

## Files
In the project root:
- `rivet.html` — shell markup + script load order.
- `rivet.css` — the full design system (tokens, shell, both view families, controls, drawer, banners, responsive).
- `rivet.data.js` — **the single JSON source** (`window.RIVET`). The contract to replicate server-side.
- `rivet.core.js` — helpers (time, markdown, toast), sidebar builder, router, theme, shared JSON drawer.
- `rivet.dashboard.js` — the 6 dashboard views.
- `rivet.config.js` — the config studio (controls, edit loop, save/validate, banners).
- `rivet.app.js` — bootstrap: theme, routing, keyboard, polling stub.

Open `rivet.html` in a browser to explore every state (use the keyboard shortcuts to reach the three live Config states).
