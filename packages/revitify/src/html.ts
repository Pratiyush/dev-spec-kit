import type { RevitifyGraph } from "./types.js";

/**
 * graph.html — self-contained interactive viewer: embedded data, vanilla canvas force layout,
 * search, kind filter, click-to-highlight neighbors. ZERO external resources (works offline,
 * embeds in the Rivet dashboard iframe srcdoc unchanged).
 */
export function renderHtml(graph: RevitifyGraph): string {
  const data = JSON.stringify({ nodes: graph.nodes, links: graph.links }).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Revitify — code knowledge graph</title>
<style>
  body { margin: 0; background: #0d1117; color: #c9d1d9; font: 13px/1.4 -apple-system, sans-serif; }
  #bar { position: fixed; top: 0; left: 0; right: 0; padding: 8px 12px; background: #161b22cc;
         backdrop-filter: blur(4px); display: flex; gap: 8px; align-items: center; z-index: 2; }
  #search { background: #0d1117; border: 1px solid #30363d; color: inherit; border-radius: 6px;
            padding: 4px 8px; width: 220px; }
  select { background: #0d1117; border: 1px solid #30363d; color: inherit; border-radius: 6px; padding: 4px; }
  #info { opacity: .7; margin-left: auto; }
  canvas { display: block; }
</style>
</head>
<body>
<div id="bar">
  <strong>revitify</strong>
  <input id="search" placeholder="search nodes…" aria-label="search"/>
  <select id="kind"><option value="">all kinds</option></select>
  <span id="info"></span>
</div>
<canvas id="c"></canvas>
<script>
const DATA = ${data};
const canvas = document.getElementById("c"), ctx = canvas.getContext("2d");
const W = () => canvas.width = innerWidth, H = () => canvas.height = innerHeight;
W(); H(); addEventListener("resize", () => { W(); H(); });
const COLORS = ["#58a6ff","#3fb950","#d29922","#f85149","#bc8cff","#39c5cf","#ff7b72","#7ee787"];
const nodes = DATA.nodes.map((n, i) => ({ ...n,
  x: innerWidth/2 + Math.cos(i*2.399) * (120 + (i%17)*14),
  y: innerHeight/2 + Math.sin(i*2.399) * (120 + (i%13)*14), vx: 0, vy: 0 }));
const byId = new Map(nodes.map(n => [n.id, n]));
const links = DATA.links.map(l => ({ s: byId.get(String(l.source)), t: byId.get(String(l.target)), r: l.relation }))
  .filter(l => l.s && l.t);
const kinds = [...new Set(nodes.map(n => n.kind).filter(Boolean))].sort();
const kindSel = document.getElementById("kind");
for (const k of kinds) { const o = document.createElement("option"); o.textContent = o.value = k; kindSel.append(o); }
let query = "", kindFilter = "", selected = null;
document.getElementById("search").addEventListener("input", e => query = e.target.value.toLowerCase());
kindSel.addEventListener("change", e => kindFilter = e.target.value);
canvas.addEventListener("click", e => {
  selected = nodes.find(n => visible(n) && Math.hypot(n.x - e.clientX, n.y - e.clientY) < 8) ?? null;
});
const visible = n => (!kindFilter || n.kind === kindFilter) && (!query || n.label.toLowerCase().includes(query));
const neighbors = n => new Set(links.flatMap(l => l.s === n ? [l.t.id] : l.t === n ? [l.s.id] : []));
function tick() {
  for (const l of links) { // springs
    const dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.hypot(dx, dy) || 1, f = (d - 90) * 0.002;
    l.s.vx += dx/d*f; l.s.vy += dy/d*f; l.t.vx -= dx/d*f; l.t.vy -= dy/d*f;
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) { // repulsion (sampled)
    if ((i + j) % 3 !== 0) continue;
    const a = nodes[i], b = nodes[j], dx = b.x-a.x, dy = b.y-a.y, d2 = dx*dx+dy*dy || 1;
    if (d2 < 40000) { const f = 240/d2; a.vx -= dx*f; a.vy -= dy*f; b.vx += dx*f; b.vy += dy*f; }
  }
  for (const n of nodes) {
    n.vx += (innerWidth/2 - n.x) * 0.0004; n.vy += (innerHeight/2 - n.y) * 0.0004;
    n.x += n.vx *= 0.85; n.y += n.vy *= 0.85;
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const hood = selected ? neighbors(selected) : null;
  ctx.strokeStyle = "#30363d";
  for (const l of links) {
    if (!visible(l.s) || !visible(l.t)) continue;
    ctx.globalAlpha = selected && !(l.s === selected || l.t === selected) ? 0.12 : 0.5;
    ctx.beginPath(); ctx.moveTo(l.s.x, l.s.y); ctx.lineTo(l.t.x, l.t.y); ctx.stroke();
  }
  for (const n of nodes) {
    if (!visible(n)) continue;
    const dim = selected && n !== selected && !hood.has(n.id);
    ctx.globalAlpha = dim ? 0.2 : 1;
    ctx.fillStyle = COLORS[(n.community ?? 0) % COLORS.length];
    ctx.beginPath(); ctx.arc(n.x, n.y, n.id.startsWith("file:") ? 6 : 4, 0, 7); ctx.fill();
    if (n === selected || (!dim && (query || nodes.length < 120))) {
      ctx.fillStyle = "#c9d1d9"; ctx.fillText(n.label, n.x + 8, n.y + 3);
    }
  }
  ctx.globalAlpha = 1;
  document.getElementById("info").textContent =
    (selected ? selected.label + " · " + (selected.source_location ?? selected.source_file) + " — " : "") +
    nodes.filter(visible).length + "/" + nodes.length + " nodes · " + links.length + " links";
}
(function loop() { tick(); draw(); requestAnimationFrame(loop); })();
</script>
</body>
</html>
`;
}
