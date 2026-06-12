/* ============================================================================
 * rivet.dashboard.js — 6 dashboard views, all from window.RIVET.dashboard
 * ==========================================================================*/
const Dashboard = (function(){
  const D = () => window.RIVET.dashboard;
  const approvedIds = () => new Set((D().approvals||[]).flatMap(a => a.taskIds));

  function checkProof(t, c){ const r = t.results && t.results[c]; if (!r) return 'unproven'; return r.passed ? 'green' : 'red'; }
  function hasRed(t){ return t.boundChecks.some(c => checkProof(t,c)==='red'); }
  function openTaskCount(){ return D().tasks.filter(t => t.status!=='done').length; }

  /* badges shown in the rail */
  function tabBadge(id){
    if (id==='tasks'){ const r = D().tasks.filter(hasRed).length; return r ? '<span class="rail-badge red">'+r+'</span>' : ''; }
    if (id==='requirements'){ const u = D().requirements.filter(r=>!r.proven).length; return u ? '<span class="rail-badge copper">'+u+'</span>' : ''; }
    if (id==='activity'){ return ''; }
    return '';
  }

  /* ---------- overview ---------- */
  let heroAnimated = false;
  function overview(v){
    const c=D().completion, pct=c.total?Math.round(c.done/c.total*100):0, open=c.total-c.done, val=D().validates;
    let html='';
    if (D().drift>0){
      html += '<div class="drift-banner"><span class="msg">🟣 <b>'+D().drift+' proofs red/stale</b> — code moved or checks failed since last verify</span>'+
        '<span class="cmd">$ rivet drift</span></div>';
    }
    html += '<div class="ov-grid"><div class="card card-pad hero">'+
      '<div><div class="card-label">🔩 Riveted · evidence-bound done</div>'+
      '<div class="hero-num"><span id="heroNum">0</span><span class="pct">%</span></div>'+
      '<div class="hero-sub"><b>'+c.done+'</b> of <b>'+c.total+'</b> tasks riveted to passing checks · '+open+' open</div></div>'+
      '<div><div class="blockbar" id="blockbar"></div><div class="fillbar"><i id="fillbar"></i></div></div></div>';
    html += '<div class="ov-side">'+
      '<div class="card card-pad"><div class="card-label">🚦 Proof states</div><div class="pills">'+
        pill('green',val.green,'proven')+pill('red',val.red,'failing')+pill('purple',val.stale,'stale')+pill('gray',val.unproven,'unproven')+
      '</div></div>';
    const ap=(D().approvals||[])[0];
    html += '<div class="card card-pad"><div class="card-label">🔏 Latest approval</div>'+
      (ap ? '<div class="approval-line"><span>🔏</span><span class="who">'+esc(ap.approver)+'</span><span class="ids">'+ap.taskIds.map(esc).join(' · ')+'</span><span class="when">'+Rivet.rel(ap.at)+'</span></div>'
          : '<div class="approval-line"><span style="color:var(--faint)">none yet — <code class="cmd">rivet approve</code></span></div>')+
      '</div>';
    html += '<div class="card card-pad"><div class="card-label">📈 Last '+D().activity.length+' events</div><div class="strip" id="strip"></div></div>';
    html += '</div></div>';
    html += '<div class="legend">'+
      '<span>🟢 <b>green</b> — proven</span><span>🔴 <b>red</b> — check failing</span>'+
      '<span>🟣 <b>stale</b> <span class="note">— code moved, re-verify (not broken)</span></span>'+
      '<span>⚪ <b>unproven</b> — no evidence yet</span></div>';
    v.innerHTML = '<div class="page-head"><span class="ph-ic">◎</span><div><h1>Overview</h1>'+
      '<p>One screen: how much is riveted, where the proof stands, and what just happened.</p></div></div>' + html;

    // sparkline
    const strip=$('#strip');
    const tone={ '✅':'var(--green)','❌':'var(--red)','🏁':'var(--accent)','🔏':'var(--purple)','🛡️':'var(--purple)' };
    [...D().activity].reverse().forEach((e,i)=>{
      const bar=document.createElement('i');
      bar.style.height=[58,100,72,44,86,52,68][i%7]+'%';
      bar.style.background=tone[e.icon]||'var(--border-2)';
      bar.style.opacity='.9'; bar.style.animationDelay=(i*60)+'ms';
      bar.title=e.icon+' '+e.text+' · '+Rivet.rel(e.at);
      strip.appendChild(bar);
    });
    animateHero();
  }
  function pill(cls,n,lb){ return '<div class="pill '+cls+'"><span class="light '+cls+'"></span><span class="n">'+n+'</span><span class="lb">'+lb+'</span></div>'; }
  function animateHero(){
    const c=D().completion, pct=c.total?Math.round(c.done/c.total*100):0;
    const numEl=$('#heroNum'),blockEl=$('#blockbar'),fillEl=$('#fillbar'); if(!numEl) return;
    const CELLS=28, target=Math.round(pct/100*CELLS);
    const setFinal=()=>{ numEl.textContent=pct; blockEl.innerHTML='█'.repeat(target)+'<span class="empty-c">'+'░'.repeat(CELLS-target)+'</span>'; fillEl.style.width=pct+'%'; };
    setFinal();
    if (heroAnimated || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroAnimated=true;
    let started=false; const t0=performance.now(), DUR=1050;
    numEl.textContent='0'; blockEl.innerHTML='<span class="empty-c">'+'░'.repeat(CELLS)+'</span>'; fillEl.style.width='0%';
    function frame(t){ started=true; const p=Math.min(1,(t-t0)/DUR), e=1-Math.pow(1-p,3);
      numEl.textContent=Math.round(e*pct); const f=Math.round(e*target);
      blockEl.innerHTML='█'.repeat(f)+'<span class="empty-c">'+'░'.repeat(CELLS-f)+'</span>';
      if(p<1) requestAnimationFrame(frame); else setFinal(); }
    requestAnimationFrame(()=>{ fillEl.style.width=pct+'%'; });
    requestAnimationFrame(frame);
    setTimeout(()=>{ if(!started) setFinal(); }, 320);
  }

  /* ---------- tasks ---------- */
  let taskFilter='all';
  function tasks(v){
    const counts={ all:D().tasks.length, red:D().tasks.filter(hasRed).length, in_progress:D().tasks.filter(t=>t.status==='in_progress').length };
    let html='<div class="toolbar"><div class="seg" id="taskSeg">'+
      seg('all','All',counts.all)+seg('red','🔴 Failing',counts.red)+seg('in_progress','🔨 In progress',counts.in_progress)+
      '</div><span class="summary">✅ done · 🔨 in progress · 🚧 blocked · ⬜ pending</span></div>';
    const list=D().tasks.filter(t=> taskFilter==='all'?true: taskFilter==='red'?hasRed(t): t.status==='in_progress');
    if(!D().tasks.length) html+='<div class="card">'+Rivet.emptyState('⬜','no tasks yet — <code>rivet spec tasks</code>')+'</div>';
    else if(!list.length) html+='<div class="card">'+Rivet.emptyState('🔍','nothing matches this filter')+'</div>';
    else html+='<div class="task-list">'+list.map(taskCard).join('')+'</div>';
    v.innerHTML='<div class="page-head"><span class="ph-ic">✅</span><div><h1>Tasks <span class="ph-count">'+D().tasks.length+'</span></h1>'+
      '<p>Each task is riveted to its checks. Failing tasks expand to the raw check output.</p></div></div>'+html;
    $$('#taskSeg button').forEach(b=>b.addEventListener('click',()=>{ taskFilter=b.dataset.f; tasks(v); }));
    $$('.task.expandable .task-row',v).forEach(r=>r.addEventListener('click',()=>r.parentElement.classList.toggle('open')));
  }
  function seg(f,lb,n){ return '<button data-f="'+f+'" class="'+(taskFilter===f?'on':'')+'">'+lb+' <span class="ct">'+n+'</span></button>'; }
  function taskCard(t){
    const failing=t.boundChecks.filter(c=>checkProof(t,c)==='red'); const expandable=failing.length>0;
    const chips=t.boundChecks.map(c=>{ const p=checkProof(t,c); return '<span class="check-chip"><span class="light '+Rivet.PROOF[p].cls+'"></span>'+esc(c)+'</span>'; }).join('');
    let tail='';
    if(expandable){
      tail='<div class="task-tail"><div>'+failing.map(c=>{ const r=t.results[c];
        return '<div class="terminal"><div class="t-head"><span class="fail">✗ FAIL</span><span>'+esc(c)+'</span><span>'+esc(r.kind)+'</span><span style="margin-left:auto">'+Rivet.rel(r.at)+'</span></div><pre>'+esc(r.tail||'(no output captured)')+'</pre></div>';
      }).join('')+'</div></div>';
    }
    return '<div class="card task status-'+t.status+(expandable?' expandable':'')+'"><div class="task-row">'+
      '<span class="st">'+(Rivet.STATUS[t.status]||'⬜')+'</span><span class="tid">'+esc(t.id)+'</span><span class="ttl">'+esc(t.title)+'</span>'+
      '<span class="checks">'+chips+'</span><span class="caret">'+(expandable?'▶':'')+'</span></div>'+tail+'</div>';
  }

  /* ---------- requirements ---------- */
  function requirements(v){
    if(!D().requirements.length){ v.innerHTML=head('📐','Requirements')+'<div class="card">'+Rivet.emptyState('📐','no requirements yet — <code>rivet spec requirements</code>')+'</div>'; return; }
    const order={red:0,stale:1,unproven:2,green:3}, appr=approvedIds();
    const rows=D().requirements.map(r=>{
      const worst=r.criteria.reduce((w,c)=> order[c.proof]<order[w]?c.proof:w,'green');
      const crits=r.criteria.map(c=>'<span class="crit"><span class="light '+Rivet.PROOF[c.proof].cls+'"></span>'+esc(c.id)+'</span>').join('');
      const ok=appr.has(r.id);
      return '<tr><td><div class="req-id">'+esc(r.id)+'</div><div class="req-title">'+esc(r.title)+'</div></td>'+
        '<td><div class="crit-chips">'+crits+'</div></td>'+
        '<td><div class="worst">'+Rivet.PROOF[worst].e+'<span class="wl">'+Rivet.PROOF[worst].label+'</span></div></td>'+
        '<td><span class="badge '+(r.proven?'proven':'unproven')+'">'+(r.proven?'● PROVEN':'○ UNPROVEN')+'</span></td>'+
        '<td class="appr-cell">'+(ok?'✅':'<span class="dash">—</span>')+'</td></tr>';
    }).join('');
    v.innerHTML=head('📐','Requirements',D().requirements.length)+
      '<div class="card"><table class="req"><thead><tr><th>Requirement</th><th>Criteria</th><th>Proof (worst-of)</th><th>Definition of done</th><th>Approved</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
      '<div class="legend"><span>🟢 <b>proven</b></span><span>🔴 <b>failing</b></span><span>🟣 <b>stale</b> <span class="note">— re-verify</span></span><span>⚪ <b>unproven</b></span></div>';
  }

  /* ---------- graph ---------- */
  function graph(v){
    const g=D().graphHtml;
    const inner=g ? '<div class="card graph-shell"><div class="stripes"></div><div class="graph-ph"><span class="big">🕸️</span><b>requirement → check graph</b><br>iframe panel · injected by <b>rivet dashboard</b><br>&lt;iframe srcdoc="'+esc(g)+'"&gt;</div></div>'
      : '<div class="card">'+Rivet.emptyState('🕸️','no graph yet — <code>rivet graph</code>')+'</div>';
    v.innerHTML=head('🕸️','Graph')+inner+
      '<div class="edge-legend"><span><span class="edge green"></span>proven edge</span><span><span class="edge red"></span>failing edge</span><span><span class="edge purple"></span>stale — re-verify</span><span><span class="edge gray"></span>unproven edge</span></div>';
  }

  /* ---------- activity ---------- */
  function activity(v){
    let html='';
    if(!D().activity.length) html='<div class="card">'+Rivet.emptyState('🧾','journal is empty — events appear as checks run')+'</div>';
    else html='<div class="card" style="padding:6px 18px"><div class="feed">'+D().activity.map(e=>{
      const meta=e.meta?e.meta.split('·').map(m=>'<span class="chip">'+esc(m.trim())+'</span>').join(''):'';
      return '<div class="evt"><span class="ic">'+e.icon+'</span><span class="tx">'+fmtEvent(e.text)+'</span><span class="meta">'+meta+'</span><span class="when">'+Rivet.clockUTC(e.at)+' · '+Rivet.rel(e.at)+'</span></div>';
    }).join('')+'</div></div>';
    if((D().governance||[]).length){
      html+='<div class="feed-section"><div class="card-label">🛡️ Governance</div><div class="card" style="padding:6px 18px"><div class="feed">'+
        D().governance.map(gov=>'<div class="evt"><span class="ic">🛡️</span><span class="tx">'+esc(gov.kind)+' — <code>'+esc(gov.detail)+'</code>'+(gov.who?' · '+esc(gov.who):'')+'</span><span class="when">'+Rivet.clockUTC(gov.at)+' · '+Rivet.rel(gov.at)+'</span></div>').join('')+
        '</div></div></div>';
    }
    v.innerHTML=head('🧾','Activity')+html;
  }
  function fmtEvent(text){ return esc(text).replace(/(\S+\/\S+|\S+#\S+)/g,'<code>$1</code>'); }

  /* ---------- artifacts (files) ---------- */
  let currentFile=(D().files[0]||{}).name;
  function files(v){
    if(!D().files.length){ v.innerHTML=head('📁','Artifacts')+'<div class="card">'+Rivet.emptyState('📁','no artifacts yet — <code>rivet init</code> scaffolds .rivet/')+'</div>'; return; }
    if(!D().files.find(f=>f.name===currentFile)) currentFile=D().files[0].name;
    const groups={};
    D().files.forEach(f=>{ const dir=f.name.includes('/')?f.name.split('/')[0]+'/':'.rivet/'; (groups[dir]=groups[dir]||[]).push(f); });
    const dirs=['.rivet/',...Object.keys(groups).filter(d=>d!=='.rivet/').sort()];
    const nav=dirs.map(dir=>'<div class="fgroup"><div class="fgroup-label">'+esc(dir)+'</div>'+
      (groups[dir]||[]).map(f=>'<button class="fitem'+(f.name===currentFile?' on':'')+'" data-file="'+esc(f.name)+'"><span class="fic">▤</span>'+esc(f.name.includes('/')?f.name.split('/').slice(1).join('/'):f.name)+'</button>').join('')+'</div>').join('');
    const file=D().files.find(f=>f.name===currentFile)||D().files[0];
    v.innerHTML=head('📁','Artifacts',D().files.length)+
      '<div class="files-grid"><div class="card file-nav">'+nav+'</div>'+
      '<div class="card file-pane"><div class="file-head">📄 <b>.rivet/'+esc(file.name)+'</b><span class="fh-r">'+file.content.split('\n').length+' lines · markdown</span></div><div class="md">'+Rivet.renderMarkdown(file.content)+'</div></div></div>';
    $$('.fitem',v).forEach(b=>b.addEventListener('click',()=>{ currentFile=b.dataset.file; files(v); }));
  }

  function head(ic,title,count){ return '<div class="page-head"><span class="ph-ic">'+ic+'</span><div><h1>'+title+(count!=null?' <span class="ph-count">'+count+'</span>':'')+'</h1></div></div>'; }

  /* ---------- dispatch ---------- */
  function render(page){
    const v=$('#view-dashboard'); v.classList.add('active');
    ({ overview, tasks, requirements, graph, activity, files }[page]||overview)(v);
  }

  return { render, tabBadge, openTaskCount };
})();
window.Dashboard = Dashboard;
