// ============================================================================
// Nysa — menu de gauche repliable sur petit écran (06/10/2026).
//
// Sur un écran de moins de 900 px de large (téléphone, tablette tenue
// verticalement), le menu de gauche sort de la page : il est remplacé par un
// bouton en haut à gauche, qui le fait glisser par-dessus le contenu.
// Sur un écran plus large, rien ne change.
//
// Fichier commun aux pages qui ont le menu de gauche : espace personnel,
// simulations, résultats. À charger en fin de page, après i18n.js.
// ============================================================================
(function(){
  var sidebar = document.querySelector(".sidebar");
  var topbar = document.querySelector(".topbar");
  if(!sidebar || !topbar) return;
  // 07/10/2026 : le lien « Administration » du menu n'est révélé qu'au compte administrateur.
  if(typeof isAdminAccount === "function"){
    isAdminAccount().then(function(ok){ var li = document.getElementById("navAdminItem"); if(li && ok) li.hidden = false; });
  }
  // Un administrateur qui simule un plan (page Administration, « Voir comme ») le voit sur toutes les pages à menu.
  if(typeof simulatedPlan === "function"){
    simulatedPlan().then(function(p){ if(p) showSimulationBanner(p); });
  }
  var tr = (typeof t === "function") ? t : function(k){ return k === "nav.menu" ? "Menu" : "Fermer le menu"; };
  var NARROW = "(max-width: 900px)";

  var css = document.createElement("style");
  css.textContent =
    ".menutoggle{display:none}"+
    ".menuscrim{display:none}"+
    "@media " + NARROW + "{"+
      ".menutoggle{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;flex:none;"+
        "margin-right:auto;background:transparent;border:1px solid var(--line);border-radius:6px;color:var(--paper);cursor:pointer}"+
      ".menutoggle:hover{border-color:var(--pixel);color:var(--pixel)}"+
      ".sidebar{position:fixed;left:0;top:var(--menu-top,0px);bottom:0;z-index:70;width:248px;max-width:84vw;"+
        "transform:translateX(-102%);visibility:hidden;"+
        "box-shadow:8px 0 30px rgba(0,0,0,.45);overflow-y:auto}"+
      "body.menu-open .sidebar{transform:none;visibility:visible}"+
      // L'animation ne sert qu'à l'ouverture et à la fermeture du menu : classe ajoutée au premier clic sur le bouton.
      // Sans cela, le menu glissait hors de l'écran à chaque chargement de page (le style qui le range arrive après l'affichage).
      "body.menu-anim .sidebar{transition:transform .2s ease, visibility 0s linear .2s}"+
      "body.menu-anim.menu-open .sidebar{transition:transform .2s ease, visibility 0s}"+
      ".menuscrim{position:fixed;inset:0;z-index:65;background:rgba(5,8,11,.62)}"+
      "body.menu-open .menuscrim{display:block}"+
      ".topbar .userchip #userEmail{max-width:38vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:bottom}"+
    "}"+
    "@media (prefers-reduced-motion: reduce){.sidebar{transition:none !important}}";
  document.head.appendChild(css);

  if(!sidebar.id) sidebar.id = "sideMenu";
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "menutoggle";
  btn.setAttribute("aria-controls", sidebar.id);
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", tr("nav.menu"));
  btn.innerHTML = "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'><path d='M4 7h16M4 12h16M4 17h16'/></svg>";
  topbar.insertBefore(btn, topbar.firstChild);

  var scrim = document.createElement("div");
  scrim.className = "menuscrim";
  document.body.appendChild(scrim);

  function isNarrow(){ return window.matchMedia(NARROW).matches; }
  function placeBelowBanner(){
    // le bandeau bêta, s'il est affiché, reste visible au-dessus du menu
    var bar = document.getElementById("betaBar");
    document.documentElement.style.setProperty("--menu-top", (bar ? bar.offsetHeight : 0) + "px");
  }
  function open(){
    placeBelowBanner();
    document.body.classList.add("menu-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", tr("nav.menu.close"));
    var first = sidebar.querySelector("a[href]:not(.soon), button");
    if(first) first.focus();
  }
  function close(giveFocusBack){
    if(!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", tr("nav.menu"));
    if(giveFocusBack) btn.focus();
  }
  btn.addEventListener("click", function(){
    document.body.classList.add("menu-anim");
    if(document.body.classList.contains("menu-open")) close(true); else open();
  });
  scrim.addEventListener("click", function(){ close(false); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(true); });
  // un clic sur une entrée du menu le referme (changement de page, aide, paramètres)
  sidebar.addEventListener("click", function(e){
    if(isNarrow() && e.target.closest("a, button")) close(false);
  });
  // retour sur grand écran : le menu reprend sa place normale
  window.addEventListener("resize", function(){ if(!isNarrow()) close(false); else placeBelowBanner(); });
})();
