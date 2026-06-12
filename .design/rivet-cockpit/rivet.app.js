/* ============================================================================
 * rivet.app.js — bootstrap: theme, sidebar, routing, keyboard, polling
 * Loaded last, after data/core/dashboard/config.
 * ==========================================================================*/
(function(){
  applyTheme(theme);

  // build shell from data
  buildSidebar();

  // topbar controls
  $('#themeToggle').onclick = () => { theme = theme==='dark'?'light':'dark'; try{ localStorage.setItem('rivet-theme',theme); }catch(e){} applyTheme(theme); };
  $('#jsonBtn').onclick    = () => drawerOpen ? closeDrawer() : openDrawer();
  $('#drX').onclick        = closeDrawer;
  $('#scrim').onclick      = closeDrawer;
  $('#menuBtn').onclick     = openRail;
  $('#railScrim').onclick   = closeRail;
  $('#drCopy').onclick = () => {
    const txt = JSON.stringify(Config.buildConfig(),null,2);
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
      .then(()=>Rivet.toast('⧉ JSON copied','ok'), ()=>Rivet.toast('copy failed','warn'));
  };

  // expose router for cross-module calls
  window.go = go;

  // routing from hash (mode/page), default overview
  function initialRoute(){
    const h=(location.hash||'').replace(/^#/,'');
    const [mode,page]=h.split('/');
    const valid = mode==='config'
      ? window.RIVET.config.sections.some(s=>s.id===page)
      : (mode==='dashboard' && window.RIVET.nav[0].items.some(i=>i.id===page));
    if(valid) go(mode,page); else go('dashboard','overview');
  }
  initialRoute();

  // keyboard
  document.addEventListener('keydown', e=>{
    const typing=/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    const k=e.key.toLowerCase();
    if(e.key==='/' && !typing){ e.preventDefault(); const cs=$('#cfgSearch'); if(cs){ if(RT.mode!=='config') go('config',window.RIVET.config.sections[0].id); $('#cfgSearch').focus(); } }
    else if((e.metaKey||e.ctrlKey)&&k==='s'){ e.preventDefault(); if(RT.mode==='config'){ if(RT.serverMode) Config.doSave(); else Rivet.toast('🔒 read-only — run rivet config --web','warn'); } }
    else if(k==='j' && !typing){ e.preventDefault(); drawerOpen?closeDrawer():openDrawer(); }
    else if(k==='g' && !typing && !e.shiftKey){ e.preventDefault(); cycleDashboard(); }
    else if(e.key==='Escape'){ if(drawerOpen) closeDrawer(); else if($('#cfgSearch')&&$('#cfgSearch').value){ Config.clearSearch(); go('config',RT.page); } else closeRail(); }
    else if(e.shiftKey&&k==='d' && RT.mode==='config'){ Config.diskActive()?Config.reloadDisk():Config.simulateDisk(); }
    else if(e.shiftKey&&k==='g' && RT.mode==='config'){ Config.toggleGate(); }
    else if(e.shiftKey&&k==='r' && RT.mode==='config'){ Config.toggleServer(); }
    else if(e.shiftKey&&k==='x' && RT.mode==='config'){ if(RT.serverMode&&Config.hasDirty()) Config.discard(); }
  });
  // quick "g" cycles dashboard tabs for demo nav
  let dashIdx=0;
  function cycleDashboard(){ const items=window.RIVET.nav[0].items; dashIdx=(dashIdx+1)%items.length; go('dashboard',items[dashIdx].id); }

  // sync stamp ticks every second; real poll cadence honored by label
  renderSync();
  setInterval(renderSync, 1000);

  // rail foot
  $('#railFoot').innerHTML = '<div><kbd>/</kbd> search · <kbd>J</kbd> json · <kbd>⌘S</kbd> save · <kbd>G</kbd> cycle</div>'+
    '<div style="margin-top:6px;opacity:.8">⇧D disk · ⇧G gate · ⇧R read-only</div>';
})();
