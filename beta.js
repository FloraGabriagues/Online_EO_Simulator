// ============================================================================
// Bandeau « version bêta » — un seul fichier pour tout le site Nysa.
//
// POUR LE RETIRER à la fin de l'essai : mettre BETA_ACTIVE à false, ci-dessous,
// et pousser ce fichier. Le bandeau disparaît de toutes les pages d'un coup,
// sans toucher à aucune autre.
//
// Option : BETA_END permet de le faire disparaître tout seul à une date
// donnée (format "AAAA-MM-JJ", dernier jour d'affichage inclus). Laisser ""
// pour ne pas fixer de date.
// ============================================================================
var BETA_ACTIVE = true;
var BETA_END = "";
// Les textes du bandeau sont dans i18n.js (clés beta.chip, beta.text, beta.feedback),
// en français et en anglais. Sans i18n.js, le bandeau ne s'affiche pas.
var BETA_CONTACT = "contact@nysa-imaging.com";

(function(){
  if(!BETA_ACTIVE) return;
  if(typeof t !== "function") return;
  if(BETA_END && new Date() > new Date(BETA_END + "T23:59:59")) return;

  var css =
    "#betaBar{position:fixed;top:0;left:0;right:0;z-index:40;display:flex;align-items:center;justify-content:center;"+
      "gap:10px;flex-wrap:wrap;padding:6px 16px;background:#1D1810;border-bottom:1px solid rgba(245,172,87,.45);"+
      "font-family:var(--body,system-ui,sans-serif);font-size:12.5px;line-height:1.35;color:var(--paper,#C4D6D4);text-align:center}"+
    "#betaBar .betachip{position:static;display:inline-block;margin:0;border:none;text-transform:none;font-family:var(--mono,monospace);font-size:10.5px;letter-spacing:.08em;color:#0B1116;"+
      "background:var(--photon,#F5AC57);border-radius:3px;padding:1px 7px;font-weight:600}"+
    "#betaBar a{color:var(--photon,#F5AC57);text-decoration:none;white-space:nowrap}"+
    "#betaBar a:hover{text-decoration:underline}"+
    "@media(max-width:640px){#betaBar .betalong{display:none}}"+
    // La page se décale de la hauteur du bandeau (mesurée, car il peut passer sur deux lignes sur un petit écran).
    "html.beta-on body{padding-top:var(--beta-h,32px)}"+
    "html.beta-on .app,html.beta-on .main{height:calc(100vh - var(--beta-h,32px))}"+
    "html.beta-on .col-r,html.beta-on .leftcol{top:calc(20px + var(--beta-h,32px))}"+
    "html.beta-on .leftcol{max-height:calc(100vh - 40px - var(--beta-h,32px))}"+
    "@media(max-width:900px){html.beta-on .sidebar{top:var(--beta-h,32px)}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "betaBar";
  bar.setAttribute("role", "note");
  var chip = document.createElement("span"); chip.className = "betachip"; chip.textContent = t("beta.chip");
  // Sur un petit écran, seule la partie « Une remarque ? » reste, pour que le bandeau tienne sur une ligne.
  var txt = document.createElement("span");
  var long = document.createElement("span"); long.className = "betalong"; long.textContent = t("beta.text") + " ";
  txt.appendChild(long); txt.appendChild(document.createTextNode(t("beta.feedback") + " "));
  var link = document.createElement("a"); link.href = "mailto:" + BETA_CONTACT; link.textContent = BETA_CONTACT;
  txt.appendChild(link);
  bar.appendChild(chip); bar.appendChild(txt);

  function place(){
    if(!bar.parentNode) document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.classList.add("beta-on");
    document.documentElement.style.setProperty("--beta-h", bar.offsetHeight + "px");
  }
  if(document.body) place(); else document.addEventListener("DOMContentLoaded", place);
  window.addEventListener("resize", place);
  window.addEventListener("load", place); // après chargement des polices, la hauteur peut changer
})();
