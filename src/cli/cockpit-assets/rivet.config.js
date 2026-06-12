/* ============================================================================
 * rivet.config.js — config studio, all from window.RIVET.config.manifest
 * ==========================================================================*/
const Config = (function(){
  const manifest = () => window.RIVET.config.manifest;
  const sections = () => window.RIVET.config.sections;
  const byPath = {};
  window.RIVET.config.manifest.forEach(k => byPath[k.path]=k);

  /* edited (state) vs disk (loaded) */
  const loaded={}, state={};
  manifest().forEach(k=>{ loaded[k.path]=clone(k.value); state[k.path]=clone(k.value); });

  let query='', errorMap={}, banners={ disk:false, gate:false };

  /* ---- derived ---- */
  const isChanged = p => !eq(state[p], byPath[p].default);
  const isDirty   = p => !eq(state[p], loaded[p]);
  const dirtyPaths = () => manifest().filter(k=>isDirty(k.path)).map(k=>k.path);
  const sectionChanged = sec => manifest().filter(k=>k.section===sec && isChanged(k.path)).length;
  const totalChanged = () => manifest().filter(k=>isChanged(k.path)).length;
  const liveRefreshSeconds = () => state['dashboard.refreshSeconds'];
  function sectionBadge(sec){ const n=sectionChanged(sec); return n?'<span class="rail-badge copper">'+n+'</span>':''; }
  function fmtVal(v){
    if(v===null||v===undefined) return 'null';
    if(Array.isArray(v)) return v.length?'['+v.map(fmtVal).join(', ')+']':'[ ]';
    if(typeof v==='object') return '{…}';
    if(typeof v==='string') return v===''?'""':v;
    return String(v);
  }

  /* ============================ render ============================ */
  function render(page){
    const v=$('#view-config'); v.classList.add('active');
    let html='<div class="banners" id="cfgBanners"></div>';
    if(query){
      const q=query.toLowerCase();
      const hits=manifest().filter(k=>k.key.toLowerCase().includes(q)||k.path.toLowerCase().includes(q)||k.section.toLowerCase().includes(q)||k.description.toLowerCase().includes(q));
      html+='<div class="page-head"><span class="ph-ic">🔍</span><div><h1>Search <span class="ph-count">'+hits.length+' / '+manifest().length+'</span></h1>'+
        '<p>Matches for “<b style="color:var(--text)">'+esc(query)+'</b>” across key, path &amp; description.</p></div></div>';
      html+= hits.length ? '<div class="knobs">'+hits.map(k=>knobCard(k,true)).join('')+'</div>'
                         : Rivet.emptyState('🫥','no knob matches “'+esc(query)+'”');
    } else {
      const meta=sections().find(s=>s.id===page)||sections()[0];
      const knobs=manifest().filter(k=>k.section===meta.id);
      html+='<div class="page-head"><span class="ph-ic">'+meta.icon+'</span><div>'+
        '<h1>'+meta.id+' <span class="ph-count">'+knobs.length+' knob'+(knobs.length>1?'s':'')+'</span> <span class="pathchip">'+meta.id+'.*</span></h1>'+
        '<p>'+esc(meta.blurb)+'</p></div></div>';
      html+='<div class="knobs">'+knobs.map(k=>knobCard(k,false)).join('')+'</div>';
    }
    v.innerHTML=html;
    renderBanners(); wireKnobs(); renderSaveBar(); Rivet.renderDrawer();
  }

  function knobCard(k,showSec){
    const changed=isChanged(k.path), err=errorMap[k.path];
    return '<div class="knob'+(changed?' changed':'')+(err?' error':'')+'" data-card="'+k.path+'" id="knob-'+k.path.replace(/\./g,'-')+'">'+
      '<div class="k-top"><span class="k-key">'+k.key+'</span><span class="k-type">'+k.type+'</span>'+
      (showSec?'<span class="k-sectag">'+k.section+'</span>':'')+
      (changed?'<span class="k-changed"><span class="dot"></span>changed</span>':'')+
      (changed?'<button class="k-reset" data-act="reset" data-path="'+k.path+'">↺ reset to default</button>':'')+'</div>'+
      '<div class="k-desc">'+inlineCode(k.description)+'</div>'+
      '<div class="k-control" data-ctl="'+k.path+'">'+control(k)+'</div>'+
      (err?'<div class="k-err"><span>⛔</span>'+esc(err)+'</div>':'')+'</div>';
  }
  const inlineCode = s => esc(s).replace(/`([^`]+)`/g,'<code>$1</code>');

  /* ---- controls ---- */
  function control(k){
    const v=state[k.path], def='<span class="k-default">default: <b>'+esc(fmtVal(k.default))+'</b></span>';
    switch(k.type){
      case 'boolean': return boolCtl(k,v);
      case 'enum':    return enumCtl(k,v)+def;
      case 'enum[]':  return chipsCtl(k.path,k.allowed,v)+def;
      case 'number':  return numCtl(k,v)+def;
      case 'string':  return strCtl(k,v)+def;
      case 'record':  return recordCtl(k,v);
      case 'object':  return objectCtl(k,v);
      default:        return '<span class="null-tag">unsupported</span>';
    }
  }
  function boolCtl(k,v){ return '<span class="sw-wrap"><button class="sw'+(v?' on':'')+'" data-act="bool" data-path="'+k.path+'" role="switch" aria-checked="'+!!v+'"><i></i></button><span class="sw-state">'+(v?'enabled':'disabled')+'</span></span>'; }
  function enumCtl(k,v){
    const tone=a=>(a==='on'||a==='auto'||a==='live'||a==='tdd'||a==='full')?'green':(a==='off'||a==='error'||a==='fail'||a==='manual'||a==='frozen')?'red':'';
    if(k.allowed.length<=4 && k.allowed.every(a=>a.length<=13))
      return '<div class="seg">'+k.allowed.map(a=>'<button class="'+(a===v?'on':'')+'" data-tone="'+tone(a)+'" data-act="enum" data-path="'+k.path+'" data-v="'+esc(a)+'">'+esc(a)+'</button>').join('')+'</div>';
    return '<select class="sel" data-act="enumsel" data-path="'+k.path+'">'+k.allowed.map(a=>'<option'+(a===v?' selected':'')+' value="'+esc(a)+'">'+esc(a)+'</option>').join('')+'</select>';
  }
  function numCtl(k,v){
    const isNull=v===null||v===undefined, unit=k.unit?'<span class="unit">'+k.unit+'</span>':'';
    return '<span class="step"><button data-act="step" data-path="'+k.path+'" data-d="-1">−</button>'+
      '<input type="text" inputmode="numeric" data-act="numinput" data-path="'+k.path+'" value="'+(isNull?'':v)+'" placeholder="'+(k.nullable?'null':'0')+'"></input>'+
      '<button data-act="step" data-path="'+k.path+'" data-d="1">+</button>'+unit+'</span>'+
      (k.nullable?'<button class="chip-btn" data-act="setnull" data-path="'+k.path+'">'+(isNull?'✓ null':'set null')+'</button>':'');
  }
  function strCtl(k,v){
    const isNull=v===null||v===undefined;
    return '<input class="txt" type="text" data-act="strinput" data-path="'+k.path+'" value="'+(isNull?'':esc(v))+'" placeholder="'+esc(k.placeholder||k.default||'')+'" spellcheck="false"></input>'+(isNull?'<span class="null-tag">null</span>':'');
  }
  function chipsCtl(path,allowed,arr){
    const set=new Set(arr||[]);
    return '<div class="chips" data-chips="'+path+'">'+allowed.map(a=>{ const on=set.has(a); return '<button class="chip-btn'+(on?' on':'')+'" data-act="chip" data-path="'+path+'" data-v="'+esc(a)+'">'+(on?'<span class="ck">✓</span>':'')+esc(a)+'</button>'; }).join('')+'</div>';
  }
  function freeChips(path,arr){
    return '<div class="chips" data-chips="'+path+'">'+(arr||[]).map((a,i)=>'<span class="chip-btn free-chip">'+esc(a)+'<span class="x" data-act="freedel" data-path="'+path+'" data-i="'+i+'">✕</span></span>').join('')+'<button class="chip-btn chip-add" data-act="freeadd" data-path="'+path+'">＋ add</button></div>';
  }
  function recordCtl(k,v){
    const entries=Object.entries(v||{});
    let rows=entries.map(([name,val])=>{
      if(k.recordShape&&k.recordShape.cmd){
        return '<div class="rec-row"><input class="rkey" data-act="reckey" data-path="'+k.path+'" data-k="'+esc(name)+'" value="'+esc(name)+'"></input>'+
          '<div class="rec-sub"><span class="rl">cmd</span><input data-act="reccmd" data-path="'+k.path+'" data-k="'+esc(name)+'" value="'+esc(val.cmd||'')+'" placeholder="npx"></input>'+
          '<span class="rl" style="margin-top:4px">args</span>'+freeChips(k.path+'::args::'+name,val.args||[])+'</div>'+
          '<button class="rec-del" data-act="recdel" data-path="'+k.path+'" data-k="'+esc(name)+'">🗑</button></div>';
      }
      return '<div class="rec-row"><input class="rkey" data-act="reckey" data-path="'+k.path+'" data-k="'+esc(name)+'" value="'+esc(name)+'"></input>'+
        '<input data-act="recjson" data-path="'+k.path+'" data-k="'+esc(name)+'" value="'+esc(JSON.stringify(val))+'" spellcheck="false"></input>'+
        '<button class="rec-del" data-act="recdel" data-path="'+k.path+'" data-k="'+esc(name)+'">🗑</button></div>';
    }).join('');
    if(!entries.length) rows='<div class="null-tag" style="padding:4px 2px">empty record — <b>{ }</b></div>';
    return '<div class="rec">'+rows+'<button class="rec-add" data-act="recadd" data-path="'+k.path+'">＋ add entry</button><span class="k-default" style="margin-top:2px">default: <b>{ }</b></span></div>';
  }
  function objectCtl(k,v){
    let html='<div class="obj">';
    k.fields.forEach(f=>{
      const fv=(v||{})[f.key];
      html+='<div class="obj-field"><span class="ofl">'+f.key+'</span>';
      if(f.type==='boolean') html+='<span class="sw-wrap"><button class="sw'+(fv?' on':'')+'" data-act="objbool" data-path="'+k.path+'" data-f="'+f.key+'"><i></i></button><span class="sw-state">'+(fv?'on':'off')+'</span></span>';
      else if(f.type==='number') html+='<span class="step"><button data-act="objstep" data-path="'+k.path+'" data-f="'+f.key+'" data-d="-1">−</button><input type="text" inputmode="numeric" data-act="objnum" data-path="'+k.path+'" data-f="'+f.key+'" value="'+(fv==null?'':fv)+'"></input><button data-act="objstep" data-path="'+k.path+'" data-f="'+f.key+'" data-d="1">+</button>'+(f.unit?'<span class="unit">'+f.unit+'</span>':'')+'</span>';
      else if(f.type==='string') html+='<input class="txt" data-act="objstr" data-path="'+k.path+'" data-f="'+f.key+'" value="'+(fv==null?'':esc(fv))+'" placeholder="'+esc(f.placeholder||'')+'" spellcheck="false"></input>';
      else if(f.type==='string[]') html+=freeChips(k.path+'::field::'+f.key,fv||[]);
      else if(f.type==='enum[]') html+=chipsCtl(k.path+'::field::'+f.key,f.allowed,fv||[]);
      html+='</div>';
    });
    return html+'</div>';
  }

  /* ============================ events ============================ */
  let refocus=null;
  function snapshotFocus(){
    const el=document.activeElement;
    if(el&&el.dataset&&el.dataset.act&&/input|str|num|cmd|key|json/.test(el.dataset.act))
      refocus={act:el.dataset.act,path:el.dataset.path,k:el.dataset.k,f:el.dataset.f,pos:el.selectionStart};
    else refocus=null;
  }
  function restoreFocus(){
    if(!refocus) return;
    const sel='[data-act="'+refocus.act+'"][data-path="'+CSS.escape(refocus.path)+'"]'+(refocus.k!=null?'[data-k="'+CSS.escape(refocus.k)+'"]':'')+(refocus.f!=null?'[data-f="'+CSS.escape(refocus.f)+'"]':'');
    const el=document.querySelector(sel);
    if(el){ el.focus(); try{ el.setSelectionRange(refocus.pos,refocus.pos);}catch(e){} }
    refocus=null;
  }
  function wireKnobs(){
    const root=$('#view-config');
    root.querySelectorAll('[data-act]').forEach(el=>{
      const act=el.dataset.act, path=el.dataset.path;
      if(act==='reset') el.onclick=()=>{ state[path]=clone(byPath[path].default); delete errorMap[path]; after(); Rivet.toast('↺ '+byPath[path].key+' reset to default'); };
      else if(act==='bool') el.onclick=()=>{ state[path]=!state[path]; touch(path); after(); };
      else if(act==='enum') el.onclick=()=>{ state[path]=el.dataset.v; touch(path); after(); };
      else if(act==='enumsel') el.onchange=()=>{ state[path]=el.value; touch(path); after(); };
      else if(act==='chip'&&!el.dataset.path.includes('::')) el.onclick=()=>{ toggleArr(path,el.dataset.v); touch(path); after(); };
      else if(act==='step') el.onclick=()=>{ stepNum(path,+el.dataset.d); after(); };
      else if(act==='setnull') el.onclick=()=>{ state[path]=(state[path]===null?(byPath[path].min||0):null); touch(path); after(); };
      else if(act==='numinput') el.oninput=()=>{ snapshotFocus(); const n=el.value.trim(); state[path]=n===''?(byPath[path].nullable?null:0):(isNaN(+n)?state[path]:+n); soft(path); };
      else if(act==='strinput') el.oninput=()=>{ snapshotFocus(); state[path]=el.value===''?(byPath[path].default===null?null:''):el.value; soft(path); };
      else if(act==='recadd') el.onclick=()=>{ recAdd(path); after(); };
      else if(act==='recdel') el.onclick=()=>{ delete state[path][el.dataset.k]; touch(path); after(); };
      else if(act==='reckey') el.onchange=()=>{ recRename(path,el.dataset.k,el.value); after(); };
      else if(act==='reccmd') el.oninput=()=>{ snapshotFocus(); state[path][el.dataset.k].cmd=el.value; soft(path); };
      else if(act==='recjson') el.onchange=()=>{ try{ state[path][el.dataset.k]=JSON.parse(el.value); delete errorMap[path]; }catch(e){ errorMap[path]='invalid JSON for “'+el.dataset.k+'”'; } touch(path); after(); };
      else if(act==='objbool') el.onclick=()=>{ state[path][el.dataset.f]=!state[path][el.dataset.f]; touch(path); after(); };
      else if(act==='objstr') el.oninput=()=>{ snapshotFocus(); state[path][el.dataset.f]=el.value===''?null:el.value; soft(path); };
      else if(act==='objnum') el.oninput=()=>{ snapshotFocus(); const n=el.value.trim(); state[path][el.dataset.f]=n===''?null:(isNaN(+n)?state[path][el.dataset.f]:+n); soft(path); };
      else if(act==='objstep') el.onclick=()=>{ objStep(path,el.dataset.f,+el.dataset.d); after(); };
    });
    root.querySelectorAll('[data-chips]').forEach(box=>{
      box.querySelectorAll('[data-act="chip"]').forEach(b=>{ if(b.dataset.path.includes('::field::')) b.onclick=()=>{ fieldChipToggle(b.dataset.path,b.dataset.v); after(); }; });
      box.querySelectorAll('[data-act="freeadd"]').forEach(b=>{ if(b.dataset.path.includes('::')) b.onclick=()=>{ const v=prompt('Add value'); if(v){ pushComposite(b.dataset.path,v); after(); } }; });
      box.querySelectorAll('[data-act="freedel"]').forEach(b=>{ if(b.dataset.path.includes('::')) b.onclick=()=>{ delComposite(b.dataset.path,+b.dataset.i); after(); }; });
      box.querySelectorAll('[data-act="freeadd"]').forEach(b=>{ if(!b.dataset.path.includes('::')) b.onclick=()=>{ const v=prompt('Add value'); if(v!=null&&v!==''){ pushFree(b.dataset.path,v); after(); } }; });
      box.querySelectorAll('[data-act="freedel"]').forEach(b=>{ if(!b.dataset.path.includes('::')) b.onclick=()=>{ delFree(b.dataset.path,+b.dataset.i); after(); }; });
    });
  }

  /* ---- mutations ---- */
  function touch(p){ delete errorMap[p]; }
  function soft(p){ delete errorMap[p]; Rivet.refreshRailBadges(); renderSaveBar(); Rivet.renderDrawer(); const c=document.querySelector('[data-card="'+CSS.escape(p)+'"]'); if(c) c.classList.toggle('changed',isChanged(p)); }
  function toggleArr(p,v){ const a=state[p]||[]; const i=a.indexOf(v); if(i>=0)a.splice(i,1); else a.push(v); state[p]=a; }
  function stepNum(p,d){ const k=byPath[p]; let v=state[p]; if(v==null)v=k.min||0; v+=d*(k.step||1); if(k.min!=null)v=Math.max(k.min,v); if(k.max!=null)v=Math.min(k.max,v); state[p]=v; touch(p); }
  function objStep(p,f,d){ const k=byPath[p], fd=k.fields.find(x=>x.key===f); let v=state[p][f]; if(v==null)v=fd.min||0; v+=d*(fd.step||(fd.unit==='ms'?1000:1)); if(fd.min!=null)v=Math.max(fd.min,v); if(fd.max!=null)v=Math.min(fd.max,v); state[p][f]=v; touch(p); }
  function pushFree(p,v){ const a=state[p]||[]; a.push(v); state[p]=a; touch(p); }
  function delFree(p,i){ const a=state[p]||[]; a.splice(i,1); state[p]=a; touch(p); }
  function recAdd(p){ const k=byPath[p]; let name='new',n=1; while(state[p][name]) name='new'+(++n); state[p][name]=(k.recordShape&&k.recordShape.cmd)?{cmd:'',args:[]}:{}; touch(p); }
  function recRename(p,o,nw){ if(!nw||nw===o||state[p][nw]) return; const obj={}; Object.keys(state[p]).forEach(key=>obj[key===o?nw:key]=state[p][key]); state[p]=obj; touch(p); }
  function compositeGet(cp){ if(cp.includes('::field::')){ const [p,,f]=cp.split('::'); return [state[p],f,p]; } if(cp.includes('::args::')){ const [p,,name]=cp.split('::'); return [state[p][name],'args',p]; } return [null,null,null]; }
  function fieldChipToggle(cp,v){ const [o,f,p]=compositeGet(cp); const a=o[f]||[]; const i=a.indexOf(v); if(i>=0)a.splice(i,1); else a.push(v); o[f]=a; touch(p); }
  function pushComposite(cp,v){ const [o,f,p]=compositeGet(cp); const a=o[f]||[]; a.push(v); o[f]=a; touch(p); }
  function delComposite(cp,i){ const [o,f,p]=compositeGet(cp); const a=o[f]||[]; a.splice(i,1); o[f]=a; touch(p); }

  function after(){ snapshotFocus(); Rivet.refreshRailBadges(); render(RT.page); restoreFocus(); }

  /* ============================ save bar ============================ */
  function renderSaveBar(){
    if(RT.mode!=='config'){ $('#savebar').classList.remove('show'); return; }
    $('#savebar').classList.add('show');
    const n=dirtyPaths().length; let right;
    if(!RT.serverMode){
      right='<span class="sb-hint">read-only — run <code style="color:var(--accent)">rivet web</code> to edit</span><button class="sbtn save" disabled>🔒 Save</button>';
    } else {
      right=(n?'<button class="sbtn" data-sb="discard">Discard <span class="kbd">⇧X</span></button>':'')+
        '<button class="sbtn save" data-sb="save"'+(n?'':' disabled')+'>'+(RT.gateLocked?'🛡 Save':'💾 Save')+' '+(n?'('+n+') ':'')+'<span class="kbd">⌘S</span></button>';
    }
    $('#savebar').innerHTML='<div class="sb-inner"><span class="sb-status"><span class="sb-dot '+(n?'dirty':'clean')+'"></span>'+
      (n?'<b>'+n+'</b><span class="muted">unsaved '+(n===1?'change':'changes')+'</span>':'<b>All saved</b><span class="muted">in sync with '+window.RIVET.meta.configPath+'</span>')+
      '</span><span class="sb-right">'+right+'</span></div>';
    const sv=$('#savebar [data-sb="save"]'); if(sv&&RT.serverMode) sv.onclick=doSave;
    const dc=$('#savebar [data-sb="discard"]'); if(dc) dc.onclick=discard;
  }
  function discard(){ manifest().forEach(k=>state[k.path]=clone(loaded[k.path])); errorMap={}; after(); Rivet.toast('Edits discarded'); }

  function validate(){
    const e={};
    if(typeof state['project.name']!=='string'||!state['project.name'].trim()) e['project.name']='project name is required';
    const ws=state['parallel.waveSize']; if(!(Number.isInteger(ws)&&ws>=1)) e['parallel.waveSize']='waveSize must be an integer ≥ 1';
    const cov=state['verify.coverage']; if(cov!==null&&(cov<0||cov>100)) e['verify.coverage']='coverage must be 0–100, or null';
    const rs=state['dashboard.refreshSeconds']; if(!(Number.isInteger(rs)&&rs>=5)) e['dashboard.refreshSeconds']='refreshSeconds must be an integer ≥ 5';
    return e;
  }
  function doSave(){
    if(!RT.serverMode) return;
    const e=validate();
    if(Object.keys(e).length){ errorMap=e; after(); const first=manifest().find(k=>e[k.path]); scrollToKnob(first.path); Rivet.toast('⛔ '+Object.keys(e).length+' validation error'+(Object.keys(e).length>1?'s':''),'warn'); return; }
    errorMap={};
    // port: the REAL save — POST to the rivet server; zod field errors and GATE-PROTECT come back as data
    fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(buildConfig())})
      .then(r=>r.json())
      .then(res=>{
        if(res.blocked){ RT.gateLocked=true; banners.gate=true; renderBanners(); Rivet.toast('🛡 Save refused — '+res.blocked,'warn'); return; }
        if(res.errors&&res.errors.length){ errorMap={}; res.errors.forEach(er=>{ errorMap[er.path]=er.message; }); after(); const first=manifest().find(k=>errorMap[k.path]); if(first) scrollToKnob(first.path); Rivet.toast('⛔ '+res.errors.length+' validation error'+(res.errors.length>1?'s':''),'warn'); return; }
        manifest().forEach(k=>loaded[k.path]=clone(state[k.path]));
        RT.lastSynced=new Date(); banners.disk=false; banners.gate=false; renderBanners(); Rivet.renderSync(); after();
        Rivet.toast('✅ Saved to '+window.RIVET.meta.configPath,'ok');
      })
      .catch(()=>Rivet.toast('save failed — server unreachable','warn'));
  }
  function scrollToKnob(path){
    const go2=()=>{ const el=document.getElementById('knob-'+path.replace(/\./g,'-')); if(el) $('.scroll').scrollTo({top:el.offsetTop-12,behavior:'smooth'}); };
    if(byPath[path].section!==RT.page){ query=''; const cs=$('#cfgSearch'); if(cs)cs.value=''; window.go('config',byPath[path].section); requestAnimationFrame(go2); }
    else go2();
  }

  /* ============================ banners ============================ */
  function renderBanners(){
    const box=$('#cfgBanners'); if(!box) return;
    let html='';
    if(!RT.serverMode) html+='<div class="banner ro"><span class="b-ic">🔒</span><div class="b-msg"><b>Read-only mode</b> — opened from disk with no server.<span class="sub">Run <span class="cmd">rivet web</span> to start the local editor and enable Save.</span></div></div>';
    if(banners.disk) html+='<div class="banner disk"><span class="b-ic">🟣</span><div class="b-msg"><b>config.json changed on disk</b> — the CLI (or another editor) rewrote it under you.<span class="sub">Your '+dirtyPaths().length+' unsaved edit(s) are safe. Reload to take the disk version, or keep editing — nothing is overwritten until you Save.</span></div><div class="b-acts"><button class="bbtn" data-bn="keep">Keep my edits</button><button class="bbtn primary" data-bn="reload">⟳ Reload from disk <span class="kbd">⇧D</span></button></div></div>';
    if(banners.gate) html+='<div class="banner gate"><span class="b-ic">🛡️</span><div class="b-msg"><b>Save refused · GATE-PROTECT-01</b> — config is locked while <b>'+window.RIVET.meta.inFlightTasks.join(', ')+'</b> '+(window.RIVET.meta.inFlightTasks.length>1?'are':'is')+' in flight.<span class="sub">The moat can\u2019t be edited by the thing it gates. Release the lock to save:</span></div><div class="b-acts"><span class="unlock">rivet unlock '+window.RIVET.meta.configPath+' --minutes 30</span><button class="bbtn primary" data-bn="unlock">🔓 Run unlock</button><button class="bbtn" data-bn="gatex">Dismiss</button></div></div>';
    box.innerHTML=html;
    box.querySelector('[data-bn="reload"]')?.addEventListener('click',reloadDisk);
    box.querySelector('[data-bn="keep"]')?.addEventListener('click',()=>{ banners.disk=false; renderBanners(); Rivet.toast('Keeping your edits'); });
    box.querySelector('[data-bn="unlock"]')?.addEventListener('click',()=>{ const cmd='rivet unlock '+window.RIVET.meta.configPath+' --minutes 30'; (navigator.clipboard?navigator.clipboard.writeText(cmd):Promise.reject()).then(()=>Rivet.toast('⧉ unlock command copied — run it in the terminal','ok'),()=>Rivet.toast(cmd,'warn')); });  // port: unlock is a HUMAN escape hatch — the browser only hands you the command
    box.querySelector('[data-bn="gatex"]')?.addEventListener('click',()=>{ banners.gate=false; renderBanners(); });
  }
  function reloadDisk(){ location.reload(); }  // port: the sidecar/server regenerates with fresh disk truth

  /* ---- JSON payload for the drawer ---- */
  function buildConfig(){
    const root={};
    manifest().forEach(k=>{ const parts=k.path.split('.'); let o=root; for(let i=0;i<parts.length-1;i++){ o[parts[i]]=o[parts[i]]||{}; o=o[parts[i]]; } o[parts[parts.length-1]]=state[k.path]; });
    return root;
  }

  /* ---- search ---- */
  function onSearch(q){ query=q.trim(); if(RT.mode!=='config') window.go('config',RT.page); else render(RT.page); }

  return {
    render, sectionBadge, totalChanged, liveRefreshSeconds, renderSaveBar,
    buildConfig, dirtyPaths, onSearch, doSave, discard, reloadDisk,
    hasDirty(){ return dirtyPaths().length>0; },
    diskActive(){ return banners.disk; },
    clearSearch(){ query=''; const cs=$('#cfgSearch'); if(cs)cs.value=''; }
  };  // port: demo simulators (disk/gate/server toggles) removed — production states come from data
})();
window.Config = Config;
