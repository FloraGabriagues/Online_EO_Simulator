// ============================================================================
// Nysa : onboarding des nouveaux comptes (09/10/2026).
//
//   1. Une fenêtre de bienvenue, à la première arrivée dans l'espace personnel
//      (comptes créés après la mise en place : l'instrument d'exemple vient
//      d'être ajouté, cf. espace-personnel.html).
//   2. Un tutoriel facultatif qui guide dans les vraies pages : instrument
//      d'exemple, simulation, résultat, curseur de comparaison. Il attend les
//      vraies actions de l'utilisateur et ne modifie rien dans le calcul.
//
// Parcours : présentation des instruments (espace personnel), puis Simulations
// (choix de la scène, instrument, conditions, lancement et explication pendant
// le calcul), puis la page du résultat (image, curseur de comparaison), puis un
// message de fin.
//
// ÉTAT
//   - Compte (user_metadata.onboarding) : "welcome" = fenêtre à montrer,
//     "started", "skipped" ou "done". Un compte existant n'a pas cette valeur :
//     il ne voit jamais la fenêtre, mais peut lancer le tutoriel depuis
//     Paramètres (bouton « Revoir le tutoriel »).
//   - Navigateur (localStorage, clé nysa_onb) : étape en cours du tutoriel, pour
//     le suivre d'une page à l'autre. Abandonné après 3 h sans activité.
//
// Les éléments surlignés sont repérés par des identifiants de la page, jamais
// par un texte. Le tutoriel ne bloque rien : tout est cliquable, et il se range
// si la page ne correspond plus (retour en arrière, autre page).
//
// À charger en fin de page, après menu.js (pages : espace personnel,
// simulations, résultats).
// ============================================================================
(function(){
  "use strict";

  var STORE_KEY = "nysa_onb";
  var EXPIRY_MS = 3 * 60 * 60 * 1000;
  var PAGE = (location.pathname.split("/").pop() || "").toLowerCase();
  var tr = (typeof t === "function") ? t : function(k){ return k; };

  // ------------------------------------------------------------------ état
  var uid = null;
  function loadState(){
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return null;
      var st = JSON.parse(raw);
      if(!st || !st.step || (uid && st.uid !== uid) || Date.now() - (st.ts || 0) > EXPIRY_MS){
        localStorage.removeItem(STORE_KEY);
        return null;
      }
      return st;
    } catch(e){ return null; }
  }
  function saveStep(step){
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ uid: uid, step: step, ts: Date.now() })); } catch(e){ /* sans gravité */ }
  }
  function clearState(){
    try { localStorage.removeItem(STORE_KEY); } catch(e){ /* sans gravité */ }
  }
  async function setAccountState(value){
    try {
      var r = await supabaseClient.auth.updateUser({ data: { onboarding: value } });
      if(r && r.error) console.warn("Onboarding : état non enregistré :", r.error.message);
    } catch(e){ console.warn("Onboarding : état non enregistré :", e); }
  }

  // ------------------------------------------------------------------ style
  var css = document.createElement("style");
  css.textContent =
    ".onb-dim{position:fixed;left:0;top:0;width:100%;height:100%;z-index:9970;pointer-events:none}"+
    ".onb-ring{box-sizing:border-box;position:fixed;z-index:9980;pointer-events:none;border-radius:8px;border:2px solid var(--photon,#F5AC57);"+
      "box-shadow:0 0 0 4px rgba(245,172,87,.22),0 0 26px rgba(245,172,87,.35);transition:left .15s,top .15s,width .15s,height .15s}"+
    ".onb-bubble{box-sizing:border-box;position:fixed;z-index:9990;width:min(340px,calc(100vw - 24px));padding:14px 16px 12px;border-radius:10px;"+
      "background:var(--panel,#131E27);color:var(--paper,#C4D6D4);border:1px solid var(--photon,#F5AC57);"+
      "box-shadow:0 10px 36px rgba(0,0,0,.55);font:400 13.5px/1.55 var(--body,system-ui,sans-serif)}"+
    ".onb-bubble.wide{width:min(440px,calc(100vw - 24px))}"+
    ".onb-bubble .onb-chain{margin:0 0 12px;padding:0 0 0 18px;font-size:12.5px;line-height:1.5;color:var(--muted,#9BADBD)}"+
    ".onb-bubble .onb-chain li{margin:0 0 3px}"+
    ".onb-bubble .onb-count{font:500 12px/1 var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--photon,#F5AC57);margin-bottom:8px}"+
    ".onb-bubble .onb-text{margin:0 0 12px}"+
    ".onb-bubble .onb-row{display:flex;align-items:center;gap:12px;justify-content:space-between}"+
    ".onb-btn{font:600 12.5px/1 var(--body,system-ui,sans-serif);padding:9px 14px;border-radius:6px;cursor:pointer;"+
      "border:1px solid var(--line,#2E4152);background:transparent;color:var(--paper,#C4D6D4)}"+
    ".onb-btn:hover{border-color:var(--pixel,#5FDCD0);color:var(--pixel,#5FDCD0)}"+
    ".onb-btn.primary{background:var(--photon,#F5AC57);border-color:var(--photon,#F5AC57);color:#0B1116}"+
    ".onb-btn.primary:hover{filter:brightness(1.08);color:#0B1116}"+
    ".onb-link{background:none;border:0;padding:0;cursor:pointer;color:var(--muted,#9BADBD);font:400 12px/1.2 var(--body,system-ui,sans-serif);text-decoration:underline}"+
    ".onb-link:hover{color:var(--paper,#C4D6D4)}"+
    ".onb-scrim{position:fixed;inset:0;z-index:9995;background:rgba(5,8,11,.72);display:flex;align-items:center;justify-content:center;padding:16px}"+
    ".onb-modal{box-sizing:border-box;width:min(560px,100%);max-height:calc(100vh - 32px);overflow:auto;border-radius:12px;padding:28px 28px 22px;"+
      "background:var(--panel,#131E27);color:var(--paper,#C4D6D4);border:1px solid var(--line,#2E4152);box-shadow:0 18px 60px rgba(0,0,0,.6)}"+
    ".onb-modal h2{margin:0 0 10px;font:600 24px/1.2 var(--display,system-ui,sans-serif)}"+
    ".onb-modal p{margin:0 0 18px;color:var(--muted,#9BADBD);font-size:14.5px;line-height:1.6}"+
    ".onb-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 22px;padding:0;list-style:none}"+
    ".onb-steps li{border:1px solid var(--line-soft,#22323F);border-radius:8px;padding:12px;background:var(--panel-2,#1A2833)}"+
    ".onb-steps .n{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;"+
      "border:1px solid var(--pixel,#5FDCD0);color:var(--pixel,#5FDCD0);font:600 12px/1 var(--mono,monospace);margin-bottom:8px}"+
    ".onb-steps .tt{display:block;font-weight:600;font-size:14px;color:var(--paper,#C4D6D4);margin-bottom:3px}"+
    ".onb-steps .dd{display:block;font-size:12.5px;line-height:1.45;color:var(--muted,#9BADBD)}"+
    ".onb-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}"+
    ".onb-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:9996;padding:10px 16px;border-radius:8px;"+
      "background:var(--panel,#131E27);border:1px solid var(--line,#2E4152);color:var(--paper,#C4D6D4);font:400 13px/1.4 var(--body,system-ui,sans-serif);"+
      "box-shadow:0 8px 28px rgba(0,0,0,.5)}"+
    "@media (max-width:640px){.onb-steps{grid-template-columns:1fr}.onb-modal{padding:22px 18px 18px}}"+
    "@media (prefers-reduced-motion:reduce){.onb-ring{transition:none}}";
  document.head.appendChild(css);

  function el(tag, cls, text){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text != null) e.textContent = text;
    return e;
  }
  function toast(msg){
    var old = document.getElementById("onbToast");
    if(old) old.remove();
    var d = el("div", "onb-toast", msg);
    d.id = "onbToast";
    d.setAttribute("role", "status");
    document.body.appendChild(d);
    setTimeout(function(){ if(d.parentNode) d.remove(); }, 5000);
  }

  // ------------------------------------------------------- fenêtres modales
  // Fenêtre simple (bienvenue, fin) : titre, texte, éventuellement une liste, boutons.
  function openModal(opts){
    var scrim = el("div", "onb-scrim");
    var box = el("div", "onb-modal");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    var h = el("h2", null, opts.title);
    h.id = "onbModalTitle";
    box.setAttribute("aria-labelledby", h.id);
    box.appendChild(h);
    box.appendChild(el("p", null, opts.text));
    if(opts.steps){
      var ul = el("ul", "onb-steps");
      opts.steps.forEach(function(s, i){
        var li = el("li");
        li.appendChild(el("span", "n", String(i + 1)));
        li.appendChild(el("span", "tt", s.title));
        li.appendChild(el("span", "dd", s.desc));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    var actions = el("div", "onb-actions");
    var buttons = [];
    opts.buttons.forEach(function(b){
      var btn = el("button", "onb-btn" + (b.primary ? " primary" : ""), b.label);
      btn.type = "button";
      btn.addEventListener("click", function(){ close(); b.onClick(); });
      actions.appendChild(btn);
      buttons.push(btn);
    });
    box.appendChild(actions);
    scrim.appendChild(box);
    document.body.appendChild(scrim);

    function onKey(e){
      if(e.key === "Escape" && opts.onEscape){ e.preventDefault(); close(); opts.onEscape(); }
      if(e.key === "Tab"){   // le focus reste dans la fenêtre
        var first = buttons[0], last = buttons[buttons.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    function close(){
      document.removeEventListener("keydown", onKey);
      if(scrim.parentNode) scrim.remove();
    }
    buttons[buttons.length - 1].focus();
    return close;
  }

  var welcomeOpen = false;
  async function maybeWelcome(){
    if(welcomeOpen || document.getElementById("onbWelcomeMarker")) return;
    try {
      var s = (await supabaseClient.auth.getSession()).data.session;
      if(!s || (s.user.user_metadata || {}).onboarding !== "welcome") return;
      uid = s.user.id;
    } catch(e){ return; }
    welcomeOpen = true;
    var marker = el("span"); marker.id = "onbWelcomeMarker"; marker.hidden = true; document.body.appendChild(marker);
    openModal({
      title: tr("onb.welcome.title"),
      text: tr("onb.welcome.text"),
      steps: [
        { title: tr("onb.welcome.s1.t"), desc: tr("onb.welcome.s1.d") },
        { title: tr("onb.welcome.s2.t"), desc: tr("onb.welcome.s2.d") },
        { title: tr("onb.welcome.s3.t"), desc: tr("onb.welcome.s3.d") }
      ],
      buttons: [
        { label: tr("onb.welcome.explore"), onClick: function(){ welcomeOpen = false; setAccountState("skipped"); } },
        { label: tr("onb.welcome.start"), primary: true, onClick: function(){ welcomeOpen = false; setAccountState("started"); start(); } }
      ],
      onEscape: function(){ welcomeOpen = false; setAccountState("skipped"); }
    });
  }

  // ------------------------------------------------------------ utilitaires
  function $(sel){ return document.querySelector(sel); }
  function visible(e){
    if(!e) return false;
    var r = e.getBoundingClientRect();
    if(r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(e);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }
  function simStep(){ return (typeof window.currentStep === "number") ? window.currentStep : 1; }
  function isDetail(){ return PAGE === "resultats.html" && !!new URLSearchParams(location.search).get("id"); }

  // ----------------------------------------------------------- les étapes
  // targets : éléments à surligner (le premier sert de repère à la bulle) ;
  // text : clé du texte ; next : bouton « Suivant » pour les étapes d'explication.
  var ORDER = ["inst0", "nav", "scene", "inst", "cond", "launch", "run", "viewres", "image", "mtf", "snr", "graphs"];
  var SIM_STEPS = { scene: 1, inst: 2, cond: 3, launch: 3, run: 4, viewres: 4 };

  var sliderMoved = false, sliderMovedAt = 0, sliderWired = false;
  function markMoved(){ if(!sliderMoved){ sliderMoved = true; sliderMovedAt = Date.now(); } }
  function wireSlider(){
    if(sliderWired) return;
    var wrap = $("#compareWrap");
    if(!wrap) return;
    sliderWired = true;
    var downX = null;
    wrap.addEventListener("pointerdown", function(e){ downX = e.clientX; });
    wrap.addEventListener("pointermove", function(e){
      if(downX !== null && Math.abs(e.clientX - downX) >= 12) markMoved();
    });
    wrap.addEventListener("pointerup", function(){ downX = null; });
    wrap.addEventListener("pointercancel", function(){ downX = null; });
    wrap.addEventListener("keydown", function(e){
      if(e.key === "ArrowLeft" || e.key === "ArrowRight") markMoved();
    });
  }

  function tabBtn(id){ return $("#restabsHost .restab[data-tab='" + id + "']"); }
  function tabSelected(id){ var b = tabBtn(id); return !!b && b.getAttribute("aria-selected") === "true"; }

  function navTargets(){
    var link = $(".sidebar a[href='simulations.html']");
    if(link && getComputedStyle(link).visibility !== "hidden" && visible(link)) return [link];
    var toggle = $(".menutoggle");   // petit écran : le menu est replié
    return toggle ? [toggle] : [];
  }

  // Texte de l'étape de lancement/suivi : suit l'état réel du calcul.
  function runTextKey(){
    var pulse = $("#statPulse");
    if($("#statusActions .retrybtn")) return "onb.s6.savefail";
    if(pulse && pulse.classList.contains("alert")) return "onb.s6.error";
    if(pulse && pulse.classList.contains("muted")) return "onb.s6.stopped";
    return "onb.s6";
  }

  // Étape de la scène : l'utilisateur choisit lui-même son image source. Tant qu'il n'a
  // pas cliqué sur une scène, seul le choix est surligné ; ensuite, le bouton « Suivant ».
  var scenePicked = false, sceneWired = false;
  function wireScene(){
    var grid = $("#sceneGrid");
    if(sceneWired || !grid) return;
    sceneWired = true;
    grid.addEventListener("click", function(e){
      if(e.target.closest && e.target.closest(".scenecard")) scenePicked = true;
    }, true);
  }

  var STEPS = {
    inst0:   { targets: function(){ return [$("a.simbtn[href='creer-instrument.html']"), $("#instList .instcard:not(.empty)")]; },
               text: function(){ return $("#instList .instcard:not(.empty)") ? "onb.s0" : "onb.s0.none"; }, next: "nav" },
    nav:     { targets: navTargets, text: function(){ return "onb.s1"; } },
    scene:   { targets: function(){ return scenePicked ? [$("#sceneGrid"), $("#panelActionBtn")] : [$("#sceneGrid")]; },
               text: function(){ return scenePicked ? "onb.s2b" : "onb.s2"; } },
    inst:    { targets: function(){ return [$("#instList"), $("#panelActionBtn")]; },
               text: function(){ return (typeof window.selectedInstIdx === "number" && window.selectedInstIdx < 0) ? "onb.s3.none" : "onb.s3"; } },
    cond:    { targets: function(){ return [$(".acq-fields")]; }, text: function(){ return "onb.s4"; }, next: "launch" },
    launch:  { targets: function(){ return [$("#panelActionBtn")]; }, text: function(){ return "onb.s5"; } },
    run:     { targets: function(){ return [$(".statuspanel")]; }, text: runTextKey,
               extra: function(key){ return key === "onb.s6" ? ["onb.s6.c1", "onb.s6.c2", "onb.s6.c3", "onb.s6.c4"] : null; } },
    viewres: { targets: function(){ return [$(".viewresultsbtn")]; }, text: function(){ return "onb.s7"; } },
    // Page du résultat : d'abord l'image (avec le curseur), puis les graphes, onglet par onglet.
    // protect : zones que la bulle ne doit pas recouvrir (les onglets restent cliquables, le graphe lisible).
    image:   { targets: function(){ return [$("#compareWrap")]; }, text: function(){ return "onb.s8"; },
               protect: function(){ return [$("#restabsHost")]; } },
    mtf:     { targets: function(){ return [tabBtn("mtf")]; }, text: function(){ return "onb.s9"; },
               protect: function(){ return [$("#restabsHost")]; } },
    snr:     { targets: function(){ return [tabBtn("snr")]; }, text: function(){ return "onb.s10"; },
               protect: function(){ return [$("#restabsHost"), $(".tabpanel.current")]; } },
    graphs:  { targets: function(){ return [$("#restabsHost")]; }, text: function(){ return "onb.s11"; },
               protect: function(){ return [$(".tabpanel.current")]; }, next: "finish", nextLabel: "onb.done" }
  };

  // ------------------------------------------------------------- l'affichage
  var rings = [], bubble = null, shownKey = "", scrolledFor = "", dim = null, holes = [];
  var SVGNS = "http://www.w3.org/2000/svg";
  // Voile sombre sur toute la page, percé d'une ouverture par élément visé : ce qui est à faire
  // ressort, le reste s'efface. Il ne reçoit aucun clic (tout reste utilisable).
  function updateDim(targets){
    if(!dim){
      dim = document.createElementNS(SVGNS, "svg");
      dim.setAttribute("class", "onb-dim");
      dim.setAttribute("aria-hidden", "true");
      dim.innerHTML = '<defs><mask id="onbMask"><rect width="100%" height="100%" fill="#fff"/></mask></defs>' +
        '<rect width="100%" height="100%" fill="rgba(5,8,11,0.62)" mask="url(#onbMask)"/>';
      document.body.appendChild(dim);
      holes = [];
    }
    var mask = dim.querySelector("mask");
    while(holes.length > targets.length){ holes.pop().remove(); }
    while(holes.length < targets.length){
      var h = document.createElementNS(SVGNS, "rect");
      h.setAttribute("fill", "#000"); h.setAttribute("rx", "8");
      mask.appendChild(h); holes.push(h);
    }
    targets.forEach(function(tg, i){
      var r = tg.getBoundingClientRect();
      holes[i].setAttribute("x", Math.round(r.left - 4));
      holes[i].setAttribute("y", Math.round(r.top - 4));
      holes[i].setAttribute("width", Math.round(r.width + 8));
      holes[i].setAttribute("height", Math.round(r.height + 8));
    });
  }

  function clearUi(){
    rings.forEach(function(r){ r.remove(); });
    rings = [];
    if(dim){ dim.remove(); dim = null; holes = []; }
    if(bubble){ bubble.remove(); bubble = null; }
    shownKey = ""; scrolledFor = "";
  }

  function quit(){
    clearUi();
    clearState();
    stopTick();
    setAccountState("skipped");
    toast(tr("onb.quit.toast"));
  }

  function goStep(id){ saveStep(id); tick(); }

  // La bulle ne recouvre jamais ce qu'il faut lire ou cliquer : les éléments visés, la chronologie
  // des étapes de l'assistant (#stepsHost) et, selon l'étape, d'autres zones (def.protect).
  // Parmi les emplacements possibles (autour de l'élément visé, puis tout l'écran), elle prend le
  // plus proche qui ne recouvre rien ; à défaut, celui qui recouvre le moins.
  function overlap(a, b){
    var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    var h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return (w > 0 && h > 0) ? w * h : 0;
  }
  function pad(r, n){ return { left: r.left - n, top: r.top - n, right: r.right + n, bottom: r.bottom + n }; }
  function placeBubble(primary, targets, def){
    var prot = targets.map(function(tg){ return pad(tg.getBoundingClientRect(), 8); });
    var extra = (def.protect ? def.protect() : []).concat([$("#stepsHost")]);
    extra.forEach(function(e){ if(e && visible(e)) prot.push(pad(e.getBoundingClientRect(), 4)); });

    var bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight, M = 12;
    var r = primary.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var cands = [];
    function add(x, y){
      x = Math.max(M, Math.min(vw - bw - M, x));
      y = Math.max(M, Math.min(vh - bh - M, y));
      cands.push({ x: x, y: y });
    }
    add(r.left, r.bottom + 14); add(r.right - bw, r.bottom + 14);
    add(r.left, r.top - bh - 14); add(r.right - bw, r.top - bh - 14);
    add(r.right + 14, r.top); add(r.left - bw - 14, r.top);
    for(var yy = M; yy <= vh - bh - M; yy += 24)
      for(var xx = M; xx <= vw - bw - M; xx += 24) cands.push({ x: xx, y: yy });
    if(!cands.length) add(M, M);

    var best = null;
    cands.forEach(function(c){
      var box = { left: c.x, top: c.y, right: c.x + bw, bottom: c.y + bh };
      var ov = 0;
      prot.forEach(function(p){ ov += overlap(box, p); });
      var d = Math.abs(c.x + bw / 2 - cx) + Math.abs(c.y + bh / 2 - cy);
      if(!best || ov < best.ov || (ov === best.ov && d < best.d)) best = { x: c.x, y: c.y, ov: ov, d: d };
    });
    bubble.style.left = Math.round(best.x) + "px";
    bubble.style.top = Math.round(best.y) + "px";
  }

  function show(id, targets){
    var def = STEPS[id];
    var textKey = def.text();
    var key = id + "|" + textKey;
    var primary = targets[0];

    // Cadres de surlignage (un par élément).
    while(rings.length > targets.length){ rings.pop().remove(); }
    while(rings.length < targets.length){ var rg = el("div", "onb-ring"); document.body.appendChild(rg); rings.push(rg); }
    targets.forEach(function(tg, i){
      var r = tg.getBoundingClientRect();
      var s = rings[i].style;
      s.left = Math.round(r.left - 4) + "px"; s.top = Math.round(r.top - 4) + "px";
      s.width = Math.round(r.width + 8) + "px"; s.height = Math.round(r.height + 8) + "px";
    });

    if(shownKey !== key){
      if(bubble) bubble.remove();
      var extra = def.extra ? def.extra(textKey) : null;
      bubble = el("div", "onb-bubble" + (extra ? " wide" : ""));
      bubble.setAttribute("role", "dialog");
      bubble.setAttribute("aria-label", tr("onb.aria"));
      bubble.appendChild(el("div", "onb-count", tr("onb.step", { n: ORDER.indexOf(id) + 1, total: ORDER.length })));
      bubble.appendChild(el("p", "onb-text", tr(textKey)));
      if(extra){
        var ol = el("ol", "onb-chain");
        extra.forEach(function(k){ ol.appendChild(el("li", null, tr(k))); });
        bubble.appendChild(ol);
      }
      var row = el("div", "onb-row");
      var quitBtn = el("button", "onb-link", tr("onb.quit"));
      quitBtn.type = "button";
      quitBtn.addEventListener("click", quit);
      row.appendChild(quitBtn);
      if(def.next){
        var nb = el("button", "onb-btn primary", tr(def.nextLabel || "onb.next"));
        nb.type = "button";
        nb.addEventListener("click", function(){ goStep(def.next); });
        row.appendChild(nb);
      }
      bubble.appendChild(row);
      document.body.appendChild(bubble);
      shownKey = key;
    }
    // L'élément visé est amené à l'écran une fois par étape.
    if(scrolledFor !== id){
      scrolledFor = id;
      var r0 = primary.getBoundingClientRect();
      if(r0.top < 0 || r0.bottom > window.innerHeight){
        try { primary.scrollIntoView({ block: "center", behavior: "smooth" }); } catch(e){ primary.scrollIntoView(); }
      }
    }
    updateDim(targets);
    placeBubble(primary, targets, def);
  }

  function finish(){
    clearUi();
    stopTick();
    if(document.getElementById("onbFinishMarker")) return;
    var marker = el("span"); marker.id = "onbFinishMarker"; marker.hidden = true; document.body.appendChild(marker);
    openModal({
      title: tr("onb.finish.title"),
      text: tr("onb.finish.text"),
      buttons: [{ label: tr("onb.finish.btn"), primary: true, onClick: function(){
        clearState(); marker.remove(); setAccountState("done");
      } }]
    });
  }

  // ------------------------------------------------------------ la boucle
  // Toutes les 300 ms : l'étape en cours est comparée à l'état réel de la page
  // (étape de l'assistant, bouton de résultat, curseur déplacé…). Une seule
  // boucle, très légère, qui s'arrête dès que le tutoriel est fini ou quitté.
  var timer = null;
  function startTick(){ if(!timer) timer = setInterval(tick, 300); }
  function stopTick(){ if(timer){ clearInterval(timer); timer = null; } }

  function tick(){
    var st = loadState();
    if(!st){ clearUi(); stopTick(); return; }
    var step = st.step;
    if(step === "finish"){ finish(); return; }
    if(!STEPS[step]){ clearState(); clearUi(); stopTick(); return; }

    // ---- recalage sur la page réellement affichée
    if(step === "inst0"){
      if(PAGE !== "espace-personnel.html"){ saveStep("nav"); step = "nav"; }
    } else if(step === "nav"){
      if(PAGE === "simulations.html"){ saveStep("scene"); step = "scene"; }
    } else if(SIM_STEPS[step]){
      if(PAGE !== "simulations.html"){
        // Le résultat vient d'être ouvert : on poursuit sur la page résultat.
        if(step === "viewres" && isDetail()){ saveStep("image"); step = "image"; }
        else { saveStep("nav"); step = "nav"; }
      } else {
        var cs = simStep();
        if(cs === 4 && step !== "run" && step !== "viewres"){ saveStep("run"); step = "run"; }
        else if(cs < 4 && (step === "run" || step === "viewres")){ var back = cs === 3 ? "launch" : (cs === 2 ? "inst" : "scene"); saveStep(back); step = back; }
        else if(cs === 3 && (step === "scene" || step === "inst")){ saveStep("cond"); step = "cond"; }
        else if(cs === 2 && step !== "inst"){ saveStep("inst"); step = "inst"; }
        else if(cs === 1 && step !== "scene"){ saveStep("scene"); step = "scene"; }
        if(step === "run" && $("#statusActions .viewresultsbtn")){ saveStep("viewres"); step = "viewres"; }
      }
    } else if(step === "image" || step === "mtf" || step === "snr" || step === "graphs"){
      if(!isDetail()){ clearUi(); return; }   // le tutoriel reprend quand le résultat est rouvert
    }

    if(step === "scene") wireScene();
    if(step === "image"){
      wireSlider();
      // on laisse 5 s pour jouer avec le curseur avant de passer à la suite
      if(sliderMoved && Date.now() - sliderMovedAt >= 5000){ saveStep("mtf"); step = "mtf"; }
    }
    // Les onglets : l'étape avance quand l'utilisateur a vraiment cliqué dessus.
    if(step === "mtf" && tabSelected("mtf")){ saveStep("snr"); step = "snr"; }
    if(step === "snr" && tabSelected("snr")){ saveStep("graphs"); step = "graphs"; }

    // ---- affichage (rien tant que les éléments visés ne sont pas là)
    var targets = STEPS[step].targets().filter(Boolean);
    if(!targets.length || !targets.every(visible)){ clearUi(); return; }
    show(step, targets);
  }

  // ------------------------------------------------------------- lancement
  async function start(){
    if(!uid){
      try { uid = (await supabaseClient.auth.getSession()).data.session.user.id; } catch(e){ return; }
    }
    saveStep(PAGE === "espace-personnel.html" ? "inst0" : "nav");
    startTick();
    tick();
  }

  async function init(){
    try {
      var s = (await supabaseClient.auth.getSession()).data.session;
      if(!s) return;
      uid = s.user.id;
    } catch(e){ return; }
    if(loadState()){ startTick(); tick(); }
  }

  window.NysaOnboarding = { maybeWelcome: maybeWelcome, start: start };
  window.addEventListener("resize", function(){ if(timer) tick(); });
  window.addEventListener("scroll", function(){ if(timer) tick(); }, true);
  if(typeof supabaseClient !== "undefined") init();
})();
