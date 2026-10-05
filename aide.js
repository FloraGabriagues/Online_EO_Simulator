// ============================================================================
// Aide — une petite fenêtre commune à toutes les pages de l'espace connecté.
//
// Tout élément portant l'attribut data-help ouvre cette fenêtre :
//   data-help="general"     le lien « Aide » du menu
//   data-help="instrument"  le lien d'accompagnement de la page de création
//
// Ces éléments sont aussi de vrais liens mailto: : si ce fichier ne se charge
// pas, cliquer dessus ouvre quand même un e-mail vers l'adresse de contact.
// Les textes sont regroupés ci-dessous, à un seul endroit.
// ============================================================================
var HELP_CONTACT = "contact@nysa-imaging.com";
var HELP_TEXTS = {
  general: {
    title: "Besoin d'aide ?",
    lines: [
      "Une question, un blocage, un résultat qui vous surprend ? Écrivez à l'adresse ci-dessous.",
      "Vous pouvez également demander un accompagnement pour configurer votre premier instrument."
    ]
  },
  instrument: {
    title: "Besoin d'aide pour configurer votre instrument ?",
    lines: [
      "Je peux vous accompagner pendant une journée pour construire votre première configuration dans Nysa.",
      "Cet accompagnement est proposé à la demande : il n'est pas nécessaire pour utiliser le simulateur."
    ]
  }
};
var HELP_CLOSE_LABEL = "Fermer";
var HELP_WRITE_LABEL = "Écrire à ";

(function(){
  var overlay = null, lastFocus = null;

  function build(){
    var style = document.createElement("style");
    style.textContent =
      "#helpOverlay{position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;"+
        "padding:20px;background:rgba(5,9,13,.72)}"+
      "#helpOverlay.open{display:flex}"+
      "#helpBox{width:min(440px,100%);background:var(--panel,#131E27);border:1px solid var(--line,#2E4152);"+
        "border-radius:8px;padding:24px 24px 20px;box-shadow:0 18px 50px rgba(0,0,0,.5)}"+
      "#helpBox h2{margin:0 0 12px;font-family:var(--display,sans-serif);font-weight:600;font-size:18px;"+
        "line-height:1.3;color:var(--paper,#C4D6D4)}"+
      "#helpBox p{margin:0 0 10px;font-family:var(--body,sans-serif);font-size:13.5px;line-height:1.55;color:var(--muted,#9BADBD)}"+
      "#helpBox .helpmail{display:inline-block;margin:8px 0 4px;font-family:var(--mono,monospace);font-size:13px;"+
        "color:var(--pixel,#5FDCD0);text-decoration:none;border-bottom:1px solid rgba(95,220,208,.4);padding-bottom:1px}"+
      "#helpBox .helpmail:hover{border-bottom-color:var(--pixel,#5FDCD0)}"+
      "#helpBox .helpactions{display:flex;justify-content:flex-end;margin-top:16px}"+
      "#helpBox button{background:transparent;border:1px solid var(--line,#2E4152);color:var(--paper,#C4D6D4);"+
        "font-family:var(--mono,monospace);font-size:12px;padding:8px 14px;border-radius:5px;cursor:pointer}"+
      "#helpBox button:hover{border-color:var(--pixel,#5FDCD0);color:var(--pixel,#5FDCD0)}";
    document.head.appendChild(style);

    overlay = document.createElement("div");
    overlay.id = "helpOverlay";
    overlay.innerHTML =
      '<div id="helpBox" role="dialog" aria-modal="true" aria-labelledby="helpTitle">'+
        '<h2 id="helpTitle"></h2><div id="helpLines"></div>'+
        '<a class="helpmail" id="helpMail"></a>'+
        '<div class="helpactions"><button type="button" id="helpClose"></button></div>'+
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function(e){ if(e.target === overlay) close(); });
    document.getElementById("helpClose").addEventListener("click", close);
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && overlay.classList.contains("open")) close();
    });
  }

  function open(kind){
    if(!overlay) build();
    var t = HELP_TEXTS[kind] || HELP_TEXTS.general;
    document.getElementById("helpTitle").textContent = t.title;
    var host = document.getElementById("helpLines");
    host.textContent = "";
    t.lines.forEach(function(line){
      var p = document.createElement("p"); p.textContent = line; host.appendChild(p);
    });
    var mail = document.getElementById("helpMail");
    mail.href = "mailto:" + HELP_CONTACT;
    mail.textContent = HELP_WRITE_LABEL + HELP_CONTACT;
    document.getElementById("helpClose").textContent = HELP_CLOSE_LABEL;
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    document.getElementById("helpClose").focus();
  }
  function close(){
    overlay.classList.remove("open");
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Un seul écouteur pour toute la page : fonctionne aussi pour les liens
  // ajoutés après le chargement.
  document.addEventListener("click", function(e){
    var el = e.target.closest ? e.target.closest("[data-help]") : null;
    if(!el) return;
    e.preventDefault();
    open(el.getAttribute("data-help"));
  });
})();
