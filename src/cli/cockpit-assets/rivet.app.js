/* ============================================================================
 * rivet.app.js — bootstrap: theme, sidebar, routing, keyboard, polling
 * Loaded last, after data/core/dashboard/config.
 * ==========================================================================*/
(function () {
  applyTheme(theme);

  // build shell from data
  buildSidebar();

  // topbar controls
  $("#themeToggle").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("rivet-theme", theme);
    } catch (e) {}
    applyTheme(theme);
  };
  $("#jsonBtn").onclick = () => (drawerOpen ? closeDrawer() : openDrawer());
  $("#drX").onclick = closeDrawer;
  $("#scrim").onclick = closeDrawer;
  $("#menuBtn").onclick = openRail;
  $("#railScrim").onclick = closeRail;
  $("#drCopy").onclick = () => {
    const txt = JSON.stringify(Config.buildConfig(), null, 2);
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
      () => Rivet.toast("⧉ JSON copied", "ok"),
      () => Rivet.toast("copy failed", "warn"),
    );
  };

  // expose router for cross-module calls
  window.go = go;

  // routing from hash (mode/page), default overview
  function initialRoute() {
    const h = (location.hash || "").replace(/^#/, "");
    const [mode, page] = h.split("/");
    const valid =
      mode === "config"
        ? window.RIVET.config.sections.some((s) => s.id === page)
        : mode === "dashboard" && window.RIVET.nav[0].items.some((i) => i.id === page);
    if (valid) go(mode, page);
    else go("dashboard", "overview");
  }
  initialRoute();

  // keyboard
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    const k = e.key.toLowerCase();
    if (e.key === "/" && !typing) {
      e.preventDefault();
      const cs = $("#cfgSearch");
      if (cs) {
        if (RT.mode !== "config") go("config", window.RIVET.config.sections[0].id);
        $("#cfgSearch").focus();
      }
    } else if ((e.metaKey || e.ctrlKey) && k === "s") {
      e.preventDefault();
      if (RT.mode === "config") {
        if (RT.serverMode) Config.doSave();
        else Rivet.toast("🔒 read-only — run rivet web", "warn");
      }
    } else if (k === "j" && !typing) {
      e.preventDefault();
      drawerOpen ? closeDrawer() : openDrawer();
    } else if (k === "g" && !typing && !e.shiftKey) {
      e.preventDefault();
      cycleDashboard();
    } else if (e.key === "Escape") {
      if (drawerOpen) closeDrawer();
      else if ($("#cfgSearch") && $("#cfgSearch").value) {
        Config.clearSearch();
        go("config", RT.page);
      } else closeRail();
    } else if (e.shiftKey && k === "d" && RT.mode === "config") {
      if (Config.diskActive()) Config.reloadDisk();
    } else if (e.shiftKey && k === "x" && RT.mode === "config") {
      if (RT.serverMode && Config.hasDirty()) Config.discard();
    }
  });
  // quick "g" cycles dashboard tabs for demo nav
  let dashIdx = 0;
  function cycleDashboard() {
    const items = window.RIVET.nav[0].items;
    dashIdx = (dashIdx + 1) % items.length;
    go("dashboard", items[dashIdx].id);
  }

  // sync stamp ticks every second; real poll cadence honored by label
  renderSync();
  setInterval(renderSync, 1000);

  // port (FEAT-COCKPIT): the shell auto-reloads to pick up the rewritten rivet.data.js sidecar.
  // Reload preserves the view (location.hash) and theme (localStorage); it pauses while you have
  // unsaved config edits or the JSON drawer open — nothing is ever yanked out from under you.
  // restore transient view state from the prior reload (finding #9: don't lose what you're reading)
  try {
    const vs = JSON.parse(sessionStorage.getItem("rivet-viewstate") || "null");
    if (vs && vs.scroll)
      requestAnimationFrame(() => {
        $(".scroll").scrollTop = vs.scroll;
      });
  } catch (e) {}
  const refreshMs = Math.max(5, window.RIVET.meta.refreshSeconds || 15) * 1000;
  setInterval(() => {
    if (RT.mode === "config" && Config.hasDirty()) return; // never reload over unsaved edits
    if (drawerOpen) return; // ...or an open JSON drawer
    try {
      sessionStorage.setItem("rivet-viewstate", JSON.stringify({ scroll: $(".scroll").scrollTop }));
    } catch (e) {}
    location.reload();
  }, refreshMs);

  // rail foot
  $("#railFoot").innerHTML =
    "<div><kbd>/</kbd> search · <kbd>J</kbd> json · <kbd>⌘S</kbd> save · <kbd>G</kbd> cycle</div>";
})();
