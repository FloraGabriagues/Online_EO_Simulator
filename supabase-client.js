// ============================================================================
// Client Supabase partagé + fonctions d'authentification communes.
// Chargé par toutes les pages nécessitant un compte (espace-personnel.html,
// creer-instrument.html, simulations.html, login.html).
//
// Clé publique : elle est faite pour être visible dans les pages d'un site
// (c'est ainsi que fonctionne Supabase — la vraie protection vient des règles
// d'accès en base, pas du secret de cette clé). Rien de sensible ici.
//
// 06/10/2026 — déménagement de la base de Londres vers Paris.
//   Ancien projet (Londres, eu-west-2) : hmnlxbpcfqxdezucxsep
//   Nouveau projet (Paris,  eu-west-3) : szosbxkhnsjmbrzivlsb
// Le nouveau projet utilise une clé « publishable » (sb_publishable_…), qui
// remplace l'ancienne clé « anon ». Le nom de la constante est conservé parce
// que les pages l'utilisent.
//
// 16/10/2026 : mode invité (essai sans compte).
//   Un lien « ?invite=1 » vers l'espace personnel ouvre le simulateur complet sans
//   inscription : instrument d'exemple en lecture seule, trois résultats
//   pré-calculés (dossier demo/). Il n'y a ni compte, ni jeton, ni appel au
//   serveur de calcul : isGuest() ne sert qu'à l'AFFICHAGE. Toute requête vers
//   Supabase partirait avec la seule clé publique et serait refusée par les
//   règles d'accès, comme pour n'importe quel visiteur anonyme, à une seule
//   exception : le comptage anonyme du tutoriel (voir trackTuto plus bas).
//
// 19/10/2026 : statistiques anonymes du tutoriel.
//   trackTuto() ajoute une ligne (type d'événement, invité ou compte) dans la
//   table tuto_events. Ni identifiant, ni adresse IP, ni cookie : la date est
//   posée par la base. Les règles d'accès autorisent seulement l'ajout, la
//   lecture est réservée à l'administrateur (page admin, onglet Statistiques).
//
// 20/10/2026 : exclusion de son propre navigateur du comptage.
//   Ouvrir une page du site avec « ?notrack=1 » (par exemple login.html?notrack=1) pose un
//   drapeau local dans ce navigateur : plus rien n'y est compté. « ?notrack=0 » le retire.
//   Le drapeau reste dans le navigateur (localStorage), il survit à l'arrêt de l'ordinateur ;
//   il disparaît si les données du site sont effacées, et il n'existe pas en navigation privée
//   (il faut alors rouvrir le lien dans la fenêtre). Rien n'est envoyé nulle part.
// ============================================================================

const SUPABASE_URL = "https://szosbxkhnsjmbrzivlsb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KvMrQXbFT-UtAgIFtG2GNQ_Ab5YlFvB";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Clé localStorage du marqueur de session locale — cf. registerSessionMarker
// et la vérification dans requireAuth() ci-dessous (une seule session
// active par compte, cf. échange du 14/09/2026).
const SESSION_MARKER_KEY = "eo_session_marker";

// ---------------------------------------------------------------------------
// Mode invité (16/10/2026).
//   - GUEST_KEY (sessionStorage) : l'onglet est en mode invité. Posé par l'arrivée
//     avec ?invite=1, effacé dès qu'une vraie session existe ou à la déconnexion.
//     Il disparaît avec l'onglet.
//   - GUEST_TOUR_KEY (localStorage) : ce navigateur a déjà vu le tutoriel en
//     invité, pour ne pas le reproposer pendant la bêta. Aucune donnée n'est
//     envoyée nulle part ; un autre navigateur le reverra.
// ---------------------------------------------------------------------------
const GUEST_KEY = "nysa_guest";
const GUEST_TOUR_KEY = "nysa_guest_tour_seen";

function _readStore(store, key) {
  try { return store.getItem(key); } catch (e) { return null; }
}
function _writeStore(store, key, value) {
  try { if (value === null) store.removeItem(key); else store.setItem(key, value); } catch (e) { /* stockage bloqué : sans gravité */ }
}

/** Cet onglet est-il en mode invité ? (à tester après requireAuth(), qui efface le drapeau si une vraie session existe) */
function isGuest() { return _readStore(sessionStorage, GUEST_KEY) === "1"; }

/** Ce navigateur a-t-il déjà vu le tutoriel en mode invité ? */
function guestTourSeen() { return _readStore(localStorage, GUEST_TOUR_KEY) === "1"; }
function markGuestTourSeen() { _writeStore(localStorage, GUEST_TOUR_KEY, "1"); }

// ---------------------------------------------------------------------------
// Statistiques anonymes du tutoriel (19/10/2026).
//   Chaque événement n'est compté qu'une fois par navigateur : un drapeau local
//   (localStorage, jamais envoyé) retient qu'il l'a déjà été. L'envoi ne doit
//   jamais gêner le tutoriel : en cas d'échec (réseau, stockage bloqué), rien
//   ne s'affiche, et l'envoi sera retenté à la prochaine occasion.
//   Un navigateur piloté par un robot (tests automatiques, certains robots
//   d'exploration) n'est jamais compté : il fausserait les chiffres de la bêta.
// ---------------------------------------------------------------------------
const TUTO_EVENTS = ["tuto_ouvert", "tuto_demarre", "tuto_termine"];
const _tutoPending = {};

// Exclusion de ce navigateur (20/10/2026) : posée ou retirée par « ?notrack=1 » / « ?notrack=0 ».
const TUTO_OPTOUT_KEY = "nysa_notrack";
(function () {
  try {
    const v = new URLSearchParams(window.location.search).get("notrack");
    if (v === "1") _writeStore(localStorage, TUTO_OPTOUT_KEY, "1");
    else if (v === "0") _writeStore(localStorage, TUTO_OPTOUT_KEY, null);
  } catch (e) { /* sans gravité */ }
})();

/** Compte un événement du tutoriel, une seule fois par navigateur. invite : true en mode invité. */
async function trackTuto(event, invite) {
  try {
    if (navigator.webdriver) return;   // navigateur piloté par un robot : non compté
    if (_readStore(localStorage, TUTO_OPTOUT_KEY) === "1") return;   // navigateur exclu par « ?notrack=1 »
    if (TUTO_EVENTS.indexOf(event) === -1) return;
    const key = "nysa_tuto_" + event;
    if (_readStore(localStorage, key) === "1" || _tutoPending[event]) return;
    _tutoPending[event] = true;   // évite un double envoi si l'appel est répété pendant l'envoi
    try {
      const { error } = await supabaseClient.from("tuto_events").insert({ event: event, guest: !!invite });
      if (!error) _writeStore(localStorage, key, "1");
    } finally {
      delete _tutoPending[event];
    }
  } catch (e) { /* sans gravité */ }
}

/** Fausse session renvoyée à un invité : même forme qu'une vraie, sans jeton. */
function _guestSession() {
  const lang = (typeof nysaLang === "function") ? nysaLang() : "en";
  return { guest: true, access_token: null, user: { id: "guest", email: null, user_metadata: { lang: lang }, app_metadata: {} } };
}

/**
 * À appeler juste après une connexion réussie (login.html) — génère un
 * nouveau marqueur aléatoire, l'enregistre en base (accounts.active_session_id)
 * ET dans ce navigateur (localStorage). Toute AUTRE session déjà ouverte sur
 * ce compte se fera déconnecter au prochain chargement d'une page protégée
 * (cf. requireAuth), puisque son marqueur local ne correspondra plus à
 * celui, plus récent, enregistré en base par CETTE connexion-ci.
 */
async function registerSessionMarker(userId) {
  const marker = crypto.randomUUID();
  const { error } = await supabaseClient
    .from("accounts")
    .update({ active_session_id: marker })
    .eq("id", userId);
  if (error) {
    console.error("Erreur enregistrement du marqueur de session :", error);
    return; // best-effort — une session non enregistrée reste utilisable,
             // juste sans la protection anti-partage pour cette connexion
  }
  localStorage.setItem(SESSION_MARKER_KEY, marker);
}

/**
 * Garde d'authentification — à appeler en haut de chaque page protégée
 * (espace-personnel.html, creer-instrument.html, simulations.html).
 * Redirige vers login.html si personne n'est connecté ; sinon renvoie la
 * session (contient session.user.email, session.user.id, etc.).
 *
 * Vérifie aussi qu'aucune connexion plus récente n'a eu lieu ailleurs sur
 * ce même compte (une seule session active à la fois) — si le marqueur
 * local ne correspond plus à celui enregistré en base, déconnecte cette
 * session et redirige avec une explication.
 *
 * 16/10/2026 : sans session, un visiteur arrivé par un lien « ?invite=1 » (ou
 * dont l'onglet est déjà en mode invité) reçoit une fausse session invité
 * (session.guest === true) au lieu d'être renvoyé vers la connexion. Une vraie
 * session l'emporte toujours : le drapeau invité est alors effacé. Sans lien
 * d'invitation, rien ne change : on est renvoyé vers login.html.
 */
async function requireAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (!error && session) {
    _writeStore(sessionStorage, GUEST_KEY, null);
  } else {
    const invited = new URLSearchParams(window.location.search).get("invite") === "1";
    if (!error && (invited || isGuest())) {
      _writeStore(sessionStorage, GUEST_KEY, "1");
      return _guestSession();   // ni vérification de session unique, ni langue de compte
    }
    window.location.href = "login.html";
    return null;
  }

  const localMarker = localStorage.getItem(SESSION_MARKER_KEY);
  const { data: account, error: acctError } = await supabaseClient
    .from("accounts")
    .select("active_session_id")
    .eq("id", session.user.id)
    .single();

  if (!acctError && account && account.active_session_id && localMarker !== account.active_session_id) {
    await supabaseClient.auth.signOut();
    localStorage.removeItem(SESSION_MARKER_KEY);
    window.location.href = "login.html?reason=other_device";
    return null;
  }

  // 06/10/2026 — langue de préférence du compte (user_metadata.lang).
  // Elle sert aussi à choisir la langue des e-mails envoyés à l'utilisateur.
  //   - préférence enregistrée, différente de la langue affichée : la page
  //     se recharge dans la langue du compte (cas d'un autre navigateur) ;
  //   - compte sans préférence, ou langue choisie à l'instant par ?lang= :
  //     la langue affichée devient la préférence du compte.
  try {
    if (typeof nysaLang === "function") {
      const pref = session.user.user_metadata ? session.user.user_metadata.lang : null;
      const shown = nysaLang();
      if ((pref === "en" || pref === "fr") && pref !== shown && !window.__nysaLangFromUrl) {
        nysaStoreLang(pref);
        window.location.reload();
        return null;
      }
      if (pref !== shown) {
        const { error: langErr } = await supabaseClient.auth.updateUser({ data: { lang: shown } });
        if (langErr) console.warn("Préférence de langue non enregistrée :", langErr.message);
      }
    }
  } catch (e) {
    console.warn("Préférence de langue non synchronisée :", e);
  }

  return session;
}

/** Déconnexion — à brancher sur le bouton correspondant dans chaque page. */
async function signOut() {
  _writeStore(sessionStorage, GUEST_KEY, null);   // mode invité : rien d'autre à fermer
  await supabaseClient.auth.signOut();
  localStorage.removeItem(SESSION_MARKER_KEY);
  window.location.href = "login.html";
}

/**
 * Rôle administrateur et plan simulé du compte connecté, lus dans sa ligne d'abonnement avec son
 * propre jeton (la RLS ne lui rend que sa ligne) et gardée le temps de la page.
 * ATTENTION : sert seulement à AFFICHER. Le vrai contrôle est fait par le serveur de calcul
 * (_require_admin et _require_active_plan dans main.py) et par la base (is_admin() dans les règles d'accès).
 */
let _entRowPromise = null;
function _myEntitlementRow() {
  if (!_entRowPromise) {
    _entRowPromise = (async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;
        const { data } = await supabaseClient
          .from("account_entitlements")
          .select("is_admin, simulated_plan")
          .eq("account_id", session.user.id).maybeSingle();
        return data || null;
      } catch (e) { return null; }
    })();
  }
  return _entRowPromise;
}

// Même règle que is_admin() en SQL et _is_admin_row dans main.py : colonne is_admin.
function _isAdminRow(row) {
  return !!row && row.is_admin === true;
}

/** Le compte connecté a-t-il le rôle administrateur ? (indépendant du plan et de la simulation) */
async function isAdminAccount() { return _isAdminRow(await _myEntitlementRow()); }

/** Plan simulé par l'administrateur : "free", "beta", "individuel", ou null (pas de simulation). */
async function simulatedPlan() {
  const row = await _myEntitlementRow();
  return _isAdminRow(row) ? (row.simulated_plan || null) : null;
}

/** Choisit le plan simulé (null = arrêter la simulation). Renvoie l'erreur, ou null si c'est bon. */
async function setSimulatedPlan(plan) {
  const { error } = await supabaseClient.rpc("set_simulated_plan", { p: plan });
  _entRowPromise = null;
  return error || null;
}

/**
 * Ligne d'abonnement « effective » : pour un administrateur qui simule un plan (page Administration,
 * « Voir comme »), la ligne est remplacée par celle d'un compte de ce plan, comme le fait le serveur
 * (main.py, _require_active_plan). Sans simulation, la ligne est inchangée. Ajoute isAdmin et simulated.
 */
function applySimulatedPlan(row) {
  if (!row) return row;
  const isAdmin = _isAdminRow(row);
  const sim = isAdmin ? (row.simulated_plan || null) : null;
  const base = Object.assign({}, row, { isAdmin: isAdmin, simulated: sim });
  if (!sim) return base;
  const none = { stripe_subscription_id: null, current_period_end: null, cancel_at_period_end: false, subscription_ended_at: null };
  if (sim === "free") return Object.assign(base, none, { plan: "free", subscription_status: "inactive", beta_access: false });
  if (sim === "beta") return Object.assign(base, none, { plan: "individuel", subscription_status: "active", beta_access: true });
  return Object.assign(base, none, { plan: "individuel", subscription_status: "active", beta_access: false });
}

/** Bandeau « Vue simulée » en bas de l'écran, avec un bouton pour quitter la simulation. */
function showSimulationBanner(plan) {
  const old = document.getElementById("simBar");
  if (old) old.remove();
  if (!plan) return;
  const bar = document.createElement("div");
  bar.id = "simBar";
  bar.setAttribute("role", "status");
  bar.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:90;display:flex;gap:12px;align-items:center;padding:8px 14px;border-radius:999px;background:var(--photon,#F5AC57);color:#0B1116;font:600 12px/1.2 var(--mono,monospace);box-shadow:0 4px 18px rgba(0,0,0,.4)";
  const txt = document.createElement("span");
  txt.textContent = t("sim.banner", { plan: t("sim.plan." + plan) });
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = t("sim.exit");
  btn.style.cssText = "border:1px solid #0B1116;background:transparent;color:inherit;border-radius:999px;padding:3px 10px;cursor:pointer;font:inherit";
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    if (!(await setSimulatedPlan(null))) window.location.reload(); else btn.disabled = false;
  });
  bar.append(txt, btn);
  document.body.appendChild(bar);
}

/**
 * Message d'erreur lisible pour les erreurs Supabase Auth les plus courantes,
 * dans la langue de l'interface (textes dans i18n.js, clés auth.err.*).
 * Le nom historique frenchAuthError est conservé : les pages l'appellent.
 */
function frenchAuthError(error) {
  if (!error) return "";
  const msg = error.message || "";
  const tr = (typeof t === "function") ? t : function(key, vars){ return (vars && vars.msg) || key; };
  if (msg.includes("Invalid login credentials")) return tr("auth.err.credentials");
  if (msg.includes("User already registered")) return tr("auth.err.exists");
  if (msg.includes("Password should be at least")) return tr("auth.err.pwd_short");
  if (msg.includes("Unable to validate email address")) return tr("auth.err.email");
  if (msg.includes("Email not confirmed")) return tr("auth.err.unconfirmed");
  if (msg.includes("should be different from the old password")) return tr("auth.err.same_password");
  return tr("auth.err.other", { msg: msg });
}
