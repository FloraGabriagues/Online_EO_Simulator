// ============================================================================
// Aide — une petite fenêtre commune à toutes les pages de l'espace connecté.
//
// Tout élément portant l'attribut data-nysa-help ouvre cette fenêtre :
//   data-nysa-help="general"     le lien « Aide » du menu
//   data-nysa-help="instrument"  le lien d'accompagnement de la page de création
// (06/10/2026 — l'attribut s'appelait data-help, déjà utilisé par les
// boutons « ? » des champs de la page de création : un clic sur l'aide d'un
// champ ouvrait cette fenêtre par erreur.)
//
// Ces éléments sont aussi de vrais liens mailto: : si ce fichier ne se charge
// pas, cliquer dessus ouvre quand même un e-mail vers l'adresse de contact.
// Sans i18n.js, ce fichier ne fait rien et les liens mailto: prennent le relais.
// ============================================================================
var HELP_CONTACT = "contact@nysa-imaging.com";
// Les textes sont dans i18n.js (clés help.*), en français et en anglais.
var HELP_KINDS = { general: true, instrument: true };

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
    var k = HELP_KINDS[kind] ? kind : "general";
    document.getElementById("helpTitle").textContent = t("help." + k + ".title");
    var host = document.getElementById("helpLines");
    host.textContent = "";
    ["line1", "line2"].forEach(function(line){
      var p = document.createElement("p"); p.textContent = t("help." + k + "." + line); host.appendChild(p);
    });
    var mail = document.getElementById("helpMail");
    mail.href = "mailto:" + HELP_CONTACT;
    mail.textContent = t("help.write", { email: HELP_CONTACT });
    document.getElementById("helpClose").textContent = t("help.close");
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
    if(typeof t !== "function") return;   // pas de traduction chargée : le lien mailto: s'ouvre normalement
    var el = e.target.closest ? e.target.closest("[data-nysa-help]") : null;
    if(!el) return;
    e.preventDefault();
    open(el.getAttribute("data-nysa-help"));
  });
})();
