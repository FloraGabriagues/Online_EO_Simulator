// ============================================================================
// Nysa — traduction de l'interface (français / anglais).
//
// Un seul fichier pour tous les textes du site. Chaque texte a une clé et ses
// deux versions côte à côte :
//
//     "login.h1": { fr: "Accès au simulateur complet", en: "Access the full simulator" },
//
// Dans une page :
//   - texte fixe :      <h1 data-i18n="login.h1">Accès au simulateur complet</h1>
//   - attribut :        data-i18n-ph (placeholder), data-i18n-title, data-i18n-aria
//   - texte construit en JavaScript :  t("login.msg.created")
//   - avec une valeur :                t("auth.err.other", { msg: "…" })   →  « {msg} » dans le texte
//
// Les termes scientifiques (MTF, SNR, GSD, QE, PRNU, DSNU, WFE, iFoV, Nyquist…)
// et les unités ne sont pas traduits : ils s'écrivent pareil dans les deux langues.
//
// ----------------------------------------------------------------------------
// ÉTAT ACTUEL : mise en place progressive, page par page.
// Tant que toutes les pages ne sont pas traduites, le site reste en français
// et le sélecteur de langue est masqué, pour ne jamais mélanger les deux
// langues à l'écran. Pour prévisualiser l'anglais sur une page déjà traduite :
// ajouter ?lang=en à son adresse (et ?lang=fr pour revenir).
//
// LE JOUR DU BASCULEMENT, deux lignes à changer ci-dessous :
//     I18N_DEFAULT = "en"      l'anglais devient la langue des nouveaux visiteurs
//     I18N_SWITCH  = true      le sélecteur EN / FR s'affiche
// ============================================================================
var I18N_DEFAULT = "fr";
var I18N_SWITCH = false;
var I18N_LANGS = ["en", "fr"];
var I18N_STORAGE_KEY = "nysa_lang";

var I18N = {
  // ---------------- commun ----------------
  "brand.tagline":       { fr: "EO Imaging Engineering", en: "EO Imaging Engineering" },
  "lang.switch.label":   { fr: "Langue", en: "Language" },

  // ---------------- bandeau bêta (beta.js) ----------------
  "beta.chip":           { fr: "BÊTA", en: "BETA" },
  "beta.text":           { fr: "Nysa est en phase d'essai : certaines fonctions peuvent encore évoluer.",
                           en: "Nysa is in beta: some features may still change." },
  "beta.feedback":       { fr: "Une remarque ?", en: "Any feedback?" },

  // ---------------- fenêtre d'aide (aide.js) ----------------
  "help.general.title":  { fr: "Besoin d'aide ?", en: "Need help?" },
  "help.general.line1":  { fr: "Une question, un blocage, un résultat qui vous surprend ? Écrivez à l'adresse ci-dessous.",
                           en: "A question, a blocker, a result that surprises you? Write to the address below." },
  "help.general.line2":  { fr: "Vous pouvez également demander un accompagnement pour configurer votre premier instrument.",
                           en: "You can also ask for hands-on support to configure your first instrument." },
  "help.instrument.title": { fr: "Besoin d'aide pour configurer votre instrument ?",
                             en: "Need help configuring your instrument?" },
  "help.instrument.line1": { fr: "Je peux vous accompagner pendant une à deux heures pour construire votre première configuration dans Nysa.",
                             en: "I can work with you for an hour or two to build your first configuration in Nysa." },
  "help.instrument.line2": { fr: "Cet accompagnement est proposé à la demande : il n'est pas nécessaire pour utiliser le simulateur.",
                             en: "This support is available on request: it is not required to use the simulator." },
  "help.write":          { fr: "Écrire à {email}", en: "Email {email}" },
  "help.close":          { fr: "Fermer", en: "Close" },

  // ---------------- erreurs d'authentification (supabase-client.js) ----------------
  "auth.err.credentials": { fr: "E-mail ou mot de passe incorrect.", en: "Incorrect email or password." },
  "auth.err.exists":      { fr: "Un compte existe déjà avec cette adresse e-mail.",
                            en: "An account already exists with this email address." },
  "auth.err.pwd_short":   { fr: "Le mot de passe doit faire au moins 6 caractères.",
                            en: "The password must be at least 6 characters long." },
  "auth.err.email":       { fr: "Adresse e-mail invalide.", en: "Invalid email address." },
  "auth.err.unconfirmed": { fr: "Confirmez d'abord votre adresse e-mail (lien envoyé à l'inscription) avant de vous connecter.",
                            en: "Please confirm your email address first (link sent at sign-up) before signing in." },
  "auth.err.other":       { fr: "Une erreur est survenue : {msg}", en: "An error occurred: {msg}" },

  // ---------------- page de connexion (login.html) ----------------
  "login.doc_title":     { fr: "Connexion — Nysa", en: "Sign in — Nysa" },
  "login.h1":            { fr: "Accès au simulateur complet", en: "Access the full simulator" },
  "login.sub":           { fr: "Connectez-vous ou créez un compte pour accéder à vos instruments et résultats.",
                           en: "Sign in or create an account to access your instruments and results." },
  "login.tab.login":     { fr: "Se connecter", en: "Sign in" },
  "login.tab.signup":    { fr: "Créer un compte", en: "Create account" },
  "login.email":         { fr: "E-mail", en: "Email" },
  "login.password":      { fr: "Mot de passe", en: "Password" },
  "login.password2":     { fr: "Confirmer le mot de passe", en: "Confirm password" },
  "login.btn.login":     { fr: "Se connecter", en: "Sign in" },
  "login.btn.signup":    { fr: "Créer mon compte", en: "Create my account" },
  "login.msg.other_device": { fr: "Vous avez été déconnecté car ce compte a été utilisé sur un autre appareil. Une seule connexion à la fois est autorisée.",
                              en: "You were signed out because this account was used on another device. Only one session at a time is allowed." },
  "login.msg.deleted":   { fr: "Votre compte et vos données ont été supprimés.",
                           en: "Your account and your data have been deleted." },
  "login.msg.mismatch":  { fr: "Les deux mots de passe ne sont pas identiques.",
                           en: "The two passwords do not match." },
  "login.msg.created":   { fr: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
                           en: "Account created. Check your inbox to confirm your address before signing in." }
};

// ============================================================================
// Moteur — rien à modifier en dessous pour ajouter ou corriger un texte.
// ============================================================================
(function(){
  function stored(){ try { return localStorage.getItem(I18N_STORAGE_KEY); } catch(e){ return null; } }
  function store(v){ try { localStorage.setItem(I18N_STORAGE_KEY, v); } catch(e){ /* navigation privée stricte */ } }

  // ?lang=en ou ?lang=fr dans l'adresse : choix mémorisé, puis retiré de l'adresse.
  var fromUrl = null;
  try {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("lang") || "").toLowerCase();
    if(I18N_LANGS.indexOf(q) >= 0){
      fromUrl = q; store(q);
      params.delete("lang");
      var rest = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (rest ? "?" + rest : "") + window.location.hash);
    }
  } catch(e){ /* adresse non lisible : on garde la langue mémorisée */ }

  var saved = stored();
  var lang = fromUrl || (I18N_LANGS.indexOf(saved) >= 0 ? saved : I18N_DEFAULT);
  // Tant que le basculement n'a pas eu lieu, seul un choix explicite par
  // ?lang= active l'anglais : un visiteur ordinaire reste en français.
  var explicit = !!fromUrl || (I18N_LANGS.indexOf(saved) >= 0);

  window.nysaLang = function(){ return lang; };
  window.nysaLocale = function(){ return lang === "fr" ? "fr-FR" : "en-GB"; };

  var missing = {};
  window.t = function(key, vars){
    var entry = I18N[key];
    var s = entry ? (entry[lang] != null ? entry[lang] : entry.fr) : null;
    if(s == null){
      if(!missing[key]){ missing[key] = true; console.warn("Texte manquant dans i18n.js :", key); }
      return key;
    }
    if(vars){
      s = s.replace(/\{(\w+)\}/g, function(m, name){ return vars[name] != null ? vars[name] : m; });
    }
    return s;
  };

  // Applique les textes aux éléments marqués. Sans effet sur le reste de la page.
  window.applyI18n = function(root){
    root = root || document;
    var each = function(sel, fn){ Array.prototype.forEach.call(root.querySelectorAll(sel), fn); };
    each("[data-i18n]",       function(el){ el.textContent = t(el.getAttribute("data-i18n")); });
    each("[data-i18n-ph]",    function(el){ el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    each("[data-i18n-title]", function(el){ el.setAttribute("title", t(el.getAttribute("data-i18n-title"))); });
    each("[data-i18n-aria]",  function(el){ el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
  };

  window.setNysaLang = function(next){
    if(I18N_LANGS.indexOf(next) < 0 || next === lang) return;
    store(next);
    // Rechargement : tous les textes construits en JavaScript repartent dans la bonne langue.
    window.location.reload();
  };

  // Sélecteur EN / FR : inséré dans tout élément portant data-lang-switch.
  function mountSwitch(){
    if(!I18N_SWITCH && !explicit) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-switch]"), function(host){
      host.textContent = "";
      host.classList.add("langswitch");
      host.setAttribute("role", "group");
      host.setAttribute("aria-label", t("lang.switch.label"));
      I18N_LANGS.forEach(function(code){
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = code.toUpperCase();
        b.setAttribute("aria-pressed", code === lang ? "true" : "false");
        b.addEventListener("click", function(){ setNysaLang(code); });
        host.appendChild(b);
      });
    });
  }

  var css = document.createElement("style");
  css.textContent =
    // La page reste invisible le temps d'appliquer la langue : pas d'éclair de texte dans l'autre langue.
    "html.i18n-pending body{visibility:hidden}"+
    ".langswitch{display:inline-flex;gap:2px;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.04em}"+
    ".langswitch button{background:transparent;border:1px solid transparent;border-radius:4px;padding:3px 7px;"+
      "color:var(--muted-2,#8497AA);cursor:pointer;font:inherit}"+
    ".langswitch button:hover{color:var(--paper,#C4D6D4)}"+
    ".langswitch button[aria-pressed='true']{color:var(--paper,#C4D6D4);border-color:var(--line,#2E4152)}";
  document.head.appendChild(css);

  document.documentElement.lang = lang;
  var html = document.documentElement;
  html.classList.add("i18n-pending");
  var done = false;
  function ready(){
    if(done) return; done = true;
    try { applyI18n(document); mountSwitch(); }
    finally { html.classList.remove("i18n-pending"); }
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
  setTimeout(ready, 1500);   // filet de sécurité : la page ne reste jamais masquée
})();
