/* ============================================================================
 * rivet.core.js — shell, router, theme, shared helpers
 * Globals exposed: $, $$, esc, clone, eq, RT (runtime), helpers on window.Rivet
 * ==========================================================================*/
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clone = (v) => JSON.parse(JSON.stringify(v));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---- runtime state shared across modules ---- */
const RT = {
  mode: "dashboard", // 'dashboard' | 'config'
  page: "overview", // active dashboard tab or config section id
  lastSynced: new Date(window.RIVET.meta.generatedAt),
  serverMode: window.RIVET.meta.serverMode,
  gateLocked: window.RIVET.meta.inFlightTasks.length > 0,
};

/* ---- time helpers ---- */
const NOW = () => new Date(window.RIVET.meta.generatedAt).getTime();
function rel(iso) {
  const d = Math.max(0, NOW() - new Date(iso).getTime());
  const m = Math.round(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  return Math.round(h / 24) + "d ago";
}
const pad = (n) => String(n).padStart(2, "0");
const clockUTC = (iso) => {
  const d = new Date(iso);
  return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
};
const clockLocal = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());

/* ---- proof + status vocab ---- */
const PROOF = {
  green: { e: "🟢", cls: "green", label: "proven" },
  red: { e: "🔴", cls: "red", label: "failing" },
  stale: { e: "🟣", cls: "purple", label: "stale" },
  unproven: { e: "⚪", cls: "gray", label: "unproven" },
};
const STATUS = { done: "✅", in_progress: "🔨", blocked: "🚧", pending: "⬜" };

/* ---- toast ---- */
function toast(msg, kind) {
  const wrap = $("#toast");
  const el = document.createElement("div");
  el.className = "t" + (kind ? " " + kind : "");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

/* ---- minimal markdown renderer (escapes raw HTML; no libraries) ---- */
function renderMarkdown(src) {
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const lines = src.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push("<pre><code>" + esc(buf.join("\n")) + "</code></pre>");
    } else if (/^#{1,4} /.test(l)) {
      const n = l.match(/^#+/)[0].length;
      out.push("<h" + n + ">" + inline(l.replace(/^#+ /, "")) + "</h" + n + ">");
      i++;
    } else if (/^\s*---+\s*$/.test(l)) {
      out.push("<hr></hr>");
      i++;
    } else if (/^\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) =>
        r
          .replace(/^\|/, "")
          .replace(/\|\s*$/, "")
          .split("|")
          .map((c) => inline(c.trim()));
      let t =
        "<table><thead><tr>" +
        cells(rows[0])
          .map((c) => "<th>" + c + "</th>")
          .join("") +
        "</tr></thead><tbody>";
      for (let r = 1; r < rows.length; r++) {
        if (/^[\s|:-]+$/.test(rows[r])) continue;
        t +=
          "<tr>" +
          cells(rows[r])
            .map((c) => "<td>" + c + "</td>")
            .join("") +
          "</tr>";
      }
      out.push(t + "</tbody></table>");
    } else if (/^> ?/.test(l)) {
      const buf = [];
      while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, ""));
      out.push("<blockquote>" + buf.map(inline).join("<br></br>") + "</blockquote>");
    } else if (/^[-*] /.test(l)) {
      const buf = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) buf.push(lines[i++]);
      out.push(
        "<ul>" + buf.map((x) => "<li>" + inline(x.replace(/^[-*] /, "")) + "</li>").join("") + "</ul>",
      );
    } else if (/^\d+\. /.test(l)) {
      const buf = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) buf.push(lines[i++]);
      out.push(
        "<ol>" + buf.map((x) => "<li>" + inline(x.replace(/^\d+\. /, "")) + "</li>").join("") + "</ol>",
      );
    } else if (/^@\w+/.test(l)) {
      out.push('<span class="directive">' + esc(l) + "</span>");
      i++;
    } else if (/^\s*$/.test(l)) {
      i++;
    } else {
      const buf = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,4} |```|\||> |[-*] |\d+\. |@\w)/.test(lines[i])
      )
        buf.push(lines[i++]);
      out.push("<p>" + buf.map(inline).join("<br></br>") + "</p>");
    }
  }
  return out.join("\n");
}

/* ---- empty state ---- */
const emptyState = (icon, text) =>
  '<div class="empty"><span class="e-ic">' + icon + "</span>" + text + "</div>";

/* ============================ shell / sidebar ============================ */
function buildSidebar() {
  const cfg = window.RIVET.config;
  const groups = window.RIVET.nav.map((g) => {
    const items =
      g.items === "@sections" ? cfg.sections.map((s) => ({ id: s.id, label: s.id, icon: s.icon })) : g.items;
    return { ...g, items };
  });

  const railHtml = groups
    .map((g) => {
      const gcount =
        g.mode === "config"
          ? '<span class="gcount">' + Config.totalChanged() + "</span>"
          : Dashboard.openTaskCount()
            ? '<span class="gcount" style="color:var(--red);background:var(--red-soft)">' +
              Dashboard.openTaskCount() +
              "</span>"
            : "";
      const search =
        g.mode === "config"
          ? '<div class="rail-search"><span class="si">🔍</span><input id="cfgSearch" placeholder="Search knobs…" autocomplete="off" spellcheck="false"></input><span class="sk">/</span></div>'
          : "";
      const items = g.items
        .map((it) => {
          const badge = g.mode === "config" ? Config.sectionBadge(it.id) : Dashboard.tabBadge(it.id);
          return (
            '<button class="rail-item" data-mode="' +
            g.mode +
            '" data-page="' +
            it.id +
            '">' +
            '<span class="ric">' +
            it.icon +
            '</span><span class="rlb">' +
            esc(it.label) +
            "</span>" +
            badge +
            "</button>"
          );
        })
        .join("");
      return (
        '<div class="rail-group" data-group="' +
        g.mode +
        '">' +
        '<div class="rail-glabel">' +
        g.group +
        gcount +
        "</div>" +
        search +
        items +
        "</div>"
      );
    })
    .join("");

  $("#rail").innerHTML =
    '<div class="brand">' +
    '<div class="logo">🔩</div>' +
    '<div class="bt"><span class="bn">rivet<em>_</em></span><span class="bs">' +
    esc(window.RIVET.meta.tagline) +
    "</span></div>" +
    "</div>" +
    '<div class="rail-scroll">' +
    railHtml +
    "</div>" +
    '<div class="rail-foot" id="railFoot"></div>';

  // wire nav
  $$(".rail-item").forEach((b) =>
    b.addEventListener("click", () => {
      go(b.dataset.mode, b.dataset.page);
      closeRail();
    }),
  );
  const cs = $("#cfgSearch");
  if (cs) cs.addEventListener("input", (e) => Config.onSearch(e.target.value));
}

function refreshRailBadges() {
  $$(".rail-item").forEach((b) => {
    const isCfg = b.dataset.mode === "config";
    const badge = isCfg ? Config.sectionBadge(b.dataset.page) : Dashboard.tabBadge(b.dataset.page);
    const lb = b.querySelector(".rlb");
    b.querySelectorAll(".rail-badge").forEach((x) => x.remove());
    if (badge) lb.insertAdjacentHTML("afterend", badge);
  });
  const gc = $$(".rail-glabel .gcount");
  if (gc[1]) gc[1].textContent = Config.totalChanged();
  if (gc[0]) gc[0].textContent = Dashboard.openTaskCount() || "";
}

/* ---- router ---- */
function go(mode, page) {
  RT.mode = mode;
  RT.page = page;
  $$(".rail-item").forEach((b) =>
    b.classList.toggle("on", b.dataset.mode === mode && b.dataset.page === page),
  );
  $$(".view").forEach((v) => v.classList.remove("active"));
  // crumb
  const meta =
    mode === "config"
      ? window.RIVET.config.sections.find((s) => s.id === page)
      : window.RIVET.nav[0].items.find((i) => i.id === page);
  $("#crumb").innerHTML =
    '<span class="cmode">' +
    (mode === "config" ? "Config" : "Dashboard") +
    "</span>" +
    '<span class="csep">/</span><span class="cpage"><span class="cic">' +
    (meta ? meta.icon : "") +
    "</span>" +
    (mode === "config" ? page : meta ? meta.label : page) +
    "</span>";
  // save bar only in config
  $("#savebar").classList.toggle("show", mode === "config" && (RT.serverMode || true));
  if (mode === "config") Config.renderSaveBar();
  else $("#savebar").classList.remove("show");
  // render
  if (mode === "dashboard") Dashboard.render(page);
  else Config.render(page);
  try {
    location.hash = mode + "/" + page;
  } catch (e) {}
  $(".scroll").scrollTop = 0;
}

/* ---- mobile rail ---- */
function openRail() {
  $("#rail").classList.add("open");
  $("#railScrim").classList.add("open");
}
function closeRail() {
  $("#rail").classList.remove("open");
  $("#railScrim").classList.remove("open");
}

/* ---- sync indicator ---- */
function renderSync() {
  const rs = Config.liveRefreshSeconds();
  $("#sync").innerHTML =
    '<span class="beat"></span><span class="txt-when">synced <b>' +
    clockLocal(RT.lastSynced) +
    "</b> · every " +
    rs +
    "s</span>";
}

/* ---- theme ---- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  const b = $("#themeToggle");
  if (b) {
    b.textContent = t === "dark" ? "☀️" : "🌙";
    b.title = t === "dark" ? "Switch to light" : "Switch to dark";
  }
}
let theme = (function () {
  try {
    return localStorage.getItem("rivet-theme") || "light";
  } catch (e) {
    return "light";
  }
})();

/* ---- JSON drawer (shared; Config owns the payload) ---- */
let drawerOpen = false;
function jsonHighlight(obj) {
  return esc(JSON.stringify(obj, null, 2))
    .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="jk">$1</span>$2')
    .replace(/:\s(&quot;[^&]*?&quot;)/g, ': <span class="jstr">$1</span>')
    .replace(/:\s(-?\d+\.?\d*)/g, ': <span class="jnum">$1</span>')
    .replace(/:\s(true|false)/g, ': <span class="jbool">$1</span>')
    .replace(/:\s(null)/g, ': <span class="jnull">$1</span>');
}
function renderDrawer() {
  if (!drawerOpen) return;
  $("#drPre").innerHTML = jsonHighlight(Config.buildConfig());
  const n = Config.dirtyPaths().length;
  $("#drFoot").innerHTML =
    "⧉ exact bytes written to " +
    window.RIVET.meta.configPath +
    (n ? ' · <b style="color:var(--accent)">' + n + " pending</b>" : " · clean");
}
function openDrawer() {
  drawerOpen = true;
  $("#drawer").classList.add("open");
  $("#scrim").classList.add("open");
  $("#drPath").textContent = window.RIVET.meta.configPath;
  renderDrawer();
}
function closeDrawer() {
  drawerOpen = false;
  $("#drawer").classList.remove("open");
  $("#scrim").classList.remove("open");
}

/* ---- expose shared bits ---- */
window.Rivet = {
  rel,
  clockUTC,
  clockLocal,
  PROOF,
  STATUS,
  toast,
  renderMarkdown,
  emptyState,
  refreshRailBadges,
  renderSync,
  renderDrawer,
  RT,
};
