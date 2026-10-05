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

  // ---------------- commun à l'espace connecté ----------------
  "common.close":        { fr: "Fermer", en: "Close" },
  "common.deleting":     { fr: "Suppression…", en: "Deleting…" },
  "common.error_msg":    { fr: "Erreur : {msg}", en: "Error: {msg}" },
  "time.today":          { fr: "aujourd'hui", en: "today" },
  "time.yesterday":      { fr: "hier", en: "yesterday" },
  "time.days_ago":       { fr: "il y a {n} jours", en: "{n} days ago" },

  // menu de gauche et barre du haut
  "nav.instruments":     { fr: "Instruments", en: "Instruments" },
  "nav.platform":        { fr: "Plateforme", en: "Platform" },
  "nav.simulations":     { fr: "Simulations", en: "Simulations" },
  "nav.results":         { fr: "Résultats", en: "Results" },
  "nav.compare":         { fr: "Comparateur", en: "Comparator" },
  "nav.compare.title":   { fr: "Comparateur d'architectures : à venir dans Nysa V1",
                           en: "Architecture comparator: coming in Nysa V1" },
  "nav.soon":            { fr: "à venir", en: "soon" },            // menu étroit : « coming soon » passait sur deux lignes
  "common.coming_soon":  { fr: "à venir", en: "coming soon" },
  "nav.help":            { fr: "Aide", en: "Help" },
  "nav.settings":        { fr: "Paramètres", en: "Settings" },
  "top.notifications":   { fr: "Notifications", en: "Notifications" },
  "top.signout":         { fr: "Se déconnecter", en: "Sign out" },

  // scènes (le nom français est celui enregistré avec chaque résultat)
  "scene.Ville":         { fr: "Ville", en: "City" },
  "scene.Avion":         { fr: "Avion", en: "Aircraft" },
  "scene.Port":          { fr: "Port", en: "Port" },

  // types d'instrument
  "inst.type.multi":     { fr: "Multispectral", en: "Multispectral" },
  "inst.type.hyper":     { fr: "Hyperspectral", en: "Hyperspectral" },

  // ---------------- espace personnel (espace-personnel.html) ----------------
  "home.doc_title":      { fr: "Espace personnel — Nysa", en: "My workspace — Nysa" },
  "home.eyebrow":        { fr: "Instruments", en: "Instruments" },
  "home.h1":             { fr: "Mes instruments", en: "My instruments" },
  "home.sub":            { fr: "Créez, configurez et gérez vos instruments d'imagerie.",
                           en: "Create, configure and manage your imaging instruments." },
  "home.delete_all":     { fr: "Tout supprimer", en: "Delete all" },
  "home.create":         { fr: "+ Créer un instrument", en: "+ Create instrument" },
  "home.tab.all":        { fr: "Tous", en: "All" },
  "home.activity":       { fr: "Activité récente", en: "Recent activity" },
  "home.doc":            { fr: "Documentation", en: "Documentation" },
  "home.hero.h2a":       { fr: "Analysez la performance de vos", en: "Analyze the performance of your" },
  "home.hero.h2b":       { fr: "instruments d'imagerie", en: "imaging instruments" },
  "home.hero.p":         { fr: "Créez vos instruments, configurez vos scénarios et obtenez des métriques détaillées sur la qualité de vos images.",
                           en: "Create your instruments, configure your scenarios and get detailed metrics on the quality of your images." },
  "home.hero.link":      { fr: "Voir les hypothèses physiques du modèle →", en: "See the model's physical assumptions →" },
  "home.confirm.delete_all":  { fr: "Supprimer les {n} instrument(s) de ce compte ?", en: "Delete the {n} instrument(s) in this account?" },
  "home.confirm.delete_all2": { fr: "Dernière confirmation : tous vos instruments disparaîtront de vos listes. Ils peuvent être restaurés sur demande pendant 30 jours. Continuer ?",
                                en: "Final confirmation: all your instruments will disappear from your lists. They can be restored on request for 30 days. Continue?" },
  "home.confirm.delete_one":  { fr: "Supprimer l'instrument « {name} » ? Il peut être restauré sur demande pendant 30 jours.",
                                en: "Delete the instrument “{name}”? It can be restored on request for 30 days." },
  "home.prompt.rename":  { fr: "Nouveau nom :", en: "New name:" },
  "home.copy_suffix":    { fr: " (copie)", en: " (copy)" },
  "home.err.delete":     { fr: "La suppression a échoué : {msg}", en: "Deletion failed: {msg}" },
  "home.err.rename":     { fr: "Le renommage a échoué : {msg}", en: "Renaming failed: {msg}" },
  "home.err.duplicate":  { fr: "La duplication a échoué.", en: "Duplication failed." },
  "home.err.duplicate_msg": { fr: "La duplication a échoué : {msg}", en: "Duplication failed: {msg}" },

  // cartes d'instrument
  "inst.empty.title":    { fr: "Aucun instrument", en: "No instrument yet" },
  "inst.empty.sub":      { fr: "Créez votre premier instrument pour commencer.", en: "Create your first instrument to get started." },
  "inst.missing":        { fr: "Il manque : {list}", en: "Missing: {list}" },
  "inst.draft.desc":     { fr: "Instrument à compléter avant de pouvoir lancer une simulation.",
                           en: "Complete this instrument before you can run a simulation." },
  "inst.configured":     { fr: "Instrument configuré.", en: "Instrument configured." },
  "inst.badge.draft":    { fr: "Brouillon", en: "Draft" },
  "inst.menu.options":   { fr: "Options", en: "Options" },
  "inst.menu.rename":    { fr: "Renommer", en: "Rename" },
  "inst.menu.duplicate": { fr: "Dupliquer", en: "Duplicate" },
  "inst.menu.delete":    { fr: "Supprimer", en: "Delete" },
  "inst.config.incomplete": { fr: "Configuration incomplète", en: "Configuration incomplete" },
  "inst.config.complete":   { fr: "Configuration complète", en: "Configuration complete" },
  "inst.modified":       { fr: "Modifié le {date}", en: "Modified {date}" },
  "inst.created":        { fr: "Créé le {date}", en: "Created {date}" },
  "inst.open":           { fr: "Ouvrir →", en: "Open →" },
  "inst.complete_cta":   { fr: "Compléter →", en: "Complete →" },

  // activité récente
  "activity.inst_saved":   { fr: "Instrument enregistré", en: "Instrument saved" },
  "activity.result_saved": { fr: "Résultat sauvegardé ({scene})", en: "Result saved ({scene})" },
  "activity.inst_deleted": { fr: " · instrument supprimé", en: " · instrument deleted" },
  "activity.none":         { fr: "Aucune activité ces {n} derniers jours", en: "No activity in the last {n} days" },

  // paramètres
  "settings.title":         { fr: "Paramètres", en: "Settings" },
  "settings.rail.account":  { fr: "Compte", en: "Account" },
  "settings.rail.pwd":      { fr: "Mot de passe", en: "Password" },
  "settings.rail.sub":      { fr: "Abonnement", en: "Subscription" },
  "settings.rail.delete":   { fr: "Suppression", en: "Delete account" },
  "settings.account.h":     { fr: "Compte", en: "Account" },
  "settings.account.p":     { fr: "Vos informations personnelles et votre adresse e-mail", en: "Your personal information and email address" },
  "settings.account.email": { fr: "E-mail", en: "Email" },
  "settings.account.since": { fr: "Membre depuis", en: "Member since" },
  "settings.pwd.h":         { fr: "Mot de passe", en: "Password" },
  "settings.pwd.p":         { fr: "Modifiez votre mot de passe pour sécuriser votre compte", en: "Change your password to keep your account secure" },
  "settings.pwd.new":       { fr: "Nouveau mot de passe", en: "New password" },
  "settings.pwd.ph":        { fr: "8 caractères minimum", en: "At least 8 characters" },
  "settings.pwd.confirm":   { fr: "Confirmer le nouveau mot de passe", en: "Confirm new password" },
  "settings.pwd.btn":       { fr: "Mettre à jour le mot de passe", en: "Update password" },
  "pwd.min":                { fr: "8 caractères minimum.", en: "At least 8 characters." },
  "pwd.mismatch":           { fr: "Les mots de passe ne correspondent pas.", en: "The passwords do not match." },
  "pwd.updating":           { fr: "Mise à jour…", en: "Updating…" },
  "pwd.done":               { fr: "Mot de passe mis à jour.", en: "Password updated." },
  "settings.sub.h":         { fr: "Abonnement", en: "Subscription" },
  "settings.sub.p":         { fr: "Votre offre et vos options d'abonnement", en: "Your plan and subscription options" },
  "settings.del.h":         { fr: "Supprimer mon compte", en: "Delete my account" },
  "settings.del.p":         { fr: "Effacement immédiat et définitif de toutes vos données", en: "Immediate and permanent erasure of all your data" },
  "settings.del.li1":       { fr: "Vos instruments, vos résultats et leurs images sont effacés immédiatement, sans récupération possible.",
                              en: "Your instruments, your results and their images are erased immediately, with no possible recovery." },
  "settings.del.li2":       { fr: "Votre abonnement est arrêté tout de suite : aucun nouveau prélèvement, et la période déjà payée n'est pas remboursée.",
                              en: "Your subscription is stopped right away: no further charge, and the period already paid is not refunded." },
  "settings.del.li3":       { fr: "Vos factures restent conservées par notre prestataire de paiement (Stripe), comme l'exigent nos obligations comptables.",
                              en: "Your invoices remain stored by our payment provider (Stripe), as required by our accounting obligations." },
  "settings.del.label":     { fr: "Pour confirmer, tapez {word}", en: "To confirm, type {word}" },
  "settings.del.word":      { fr: "SUPPRIMER", en: "DELETE" },
  "settings.del.btn":       { fr: "Supprimer définitivement mon compte", en: "Permanently delete my account" },
  "settings.del.busy":      { fr: "Suppression en cours, ne fermez pas cette page…", en: "Deletion in progress, do not close this page…" },
  "settings.del.fail":      { fr: "La suppression n'a pas pu aller au bout. Votre compte existe toujours : réessayez, et contactez-nous si l'erreur persiste.",
                              en: "The deletion could not be completed. Your account still exists: try again, and contact us if the error persists." },

  // abonnement et accès bêta
  "sub.badge.beta":        { fr: "Bêta", en: "Beta" },
  "sub.beta.name":         { fr: "Accès bêta", en: "Beta access" },
  "sub.beta.desc":         { fr: "Gratuit pendant la phase d'essai", en: "Free during the trial phase" },
  "sub.beta.until":        { fr: "Votre accès bêta est actif jusqu'au {date}.", en: "Your beta access is active until {date}." },
  "sub.beta.active":       { fr: "Votre accès bêta est actif.", en: "Your beta access is active." },
  "sub.beta.ended.name":   { fr: "Accès bêta terminé", en: "Beta access ended" },
  "sub.beta.ended.desc":   { fr: "La phase d'essai est terminée", en: "The trial phase is over" },
  "sub.beta.ended.note":   { fr: "Votre accès bêta a pris fin le {date}.", en: "Your beta access ended on {date}." },
  "sub.status.active":     { fr: "Actif", en: "Active" },
  "sub.status.inactive":   { fr: "Inactif", en: "Inactive" },
  "sub.badge.individual":  { fr: "Individuel", en: "Individual" },
  "sub.plan.individual":   { fr: "Plan Individuel", en: "Individual plan" },
  "sub.full":              { fr: "Accès complet", en: "Full access" },
  "sub.cancelled_until":   { fr: "Résilié : expire le {date}.", en: "Cancelled: expires on {date}." },
  "sub.renews":            { fr: "Renouvellement le {date}.", en: "Renews on {date}." },
  "sub.manage":            { fr: "Gérer mon abonnement", en: "Manage my subscription" },
  "sub.pending":           { fr: "Paiement en attente", en: "Payment pending" },
  "sub.failed":            { fr: "Paiement échoué", en: "Payment failed" },
  "sub.update_note":       { fr: "Mettez à jour votre moyen de paiement pour conserver l'accès.", en: "Update your payment method to keep your access." },
  "sub.update_btn":        { fr: "Mettre à jour le paiement", en: "Update payment" },
  "sub.badge.free":        { fr: "Gratuit", en: "Free" },
  "sub.none":              { fr: "Aucun abonnement", en: "No subscription" },
  "sub.none.desc":         { fr: "Passez au plan Individuel pour accéder au simulateur complet", en: "Switch to the Individual plan to access the full simulator" },
  "sub.ended":             { fr: "Votre abonnement a pris fin le {end}. Sans réabonnement, votre compte et vos données seront supprimés le {del}.",
                             en: "Your subscription ended on {end}. Unless you resubscribe, your account and your data will be deleted on {del}." },
  "sub.subscribe":         { fr: "S'abonner", en: "Subscribe" },
  "sub.redirect":          { fr: "Redirection…", en: "Redirecting…" },
  "sub.activating":        { fr: "Activation en cours…", en: "Activating…" },
  "sub.paid_wait":         { fr: "Paiement enregistré. L'activation peut prendre quelques instants : rechargez la page.",
                             en: "Payment recorded. Activation may take a few moments: reload the page." },
  "sub.pay_fail":          { fr: "Impossible d'ouvrir la page de paiement. Réessayez dans un instant.",
                             en: "Unable to open the payment page. Please try again in a moment." },

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

  // Nom de scène : la base enregistre le nom français (« Ville », « Port »…).
  window.tScene = function(name){
    return (name != null && I18N["scene." + name]) ? t("scene." + name) : name;
  };
  // Nom d'un champ manquant d'un brouillon : enregistré en français avec
  // l'instrument. La table I18N_FIELD_FR (libellé français → clé) sera
  // remplie avec la traduction de la page de création d'instrument.
  window.tField = function(frLabel){
    var key = (typeof I18N_FIELD_FR !== "undefined") ? I18N_FIELD_FR[frLabel] : null;
    return key ? t(key) : frLabel;
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
