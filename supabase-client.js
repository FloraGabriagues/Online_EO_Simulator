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
// ============================================================================

const SUPABASE_URL = "https://szosbxkhnsjmbrzivlsb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KvMrQXbFT-UtAgIFtG2GNQ_Ab5YlFvB";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Clé localStorage du marqueur de session locale — cf. registerSessionMarker
// et la vérification dans requireAuth() ci-dessous (une seule session
// active par compte, cf. échange du 14/09/2026).
const SESSION_MARKER_KEY = "eo_session_marker";

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
 */
async function requireAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) {
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
  await supabaseClient.auth.signOut();
  localStorage.removeItem(SESSION_MARKER_KEY);
  window.location.href = "login.html";
}

/**
 * Le compte connecté a-t-il le rôle administrateur (plan « admin » actif) ?
 * Lu avec son propre jeton (la RLS ne lui rend que sa ligne), gardé le temps de la page.
 * ATTENTION : sert seulement à AFFICHER les outils d'administration. Le vrai contrôle est fait par le
 * serveur de calcul (_require_admin dans main.py) et par la base (is_admin() dans les règles d'accès).
 */
let _isAdminCache = null;
async function isAdminAccount() {
  if (_isAdminCache !== null) return _isAdminCache;
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return (_isAdminCache = false);
    const { data } = await supabaseClient
      .from("account_entitlements").select("plan, subscription_status").eq("account_id", session.user.id).maybeSingle();
    _isAdminCache = !!(data && data.plan === "admin" && data.subscription_status === "active");
  } catch (e) {
    _isAdminCache = false;
  }
  return _isAdminCache;
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
