// ============================================================================
// Client Supabase partagé + fonctions d'authentification communes.
// Chargé par toutes les pages nécessitant un compte (espace-personnel.html,
// creer-instrument.html, simulations.html, login.html).
//
// Clé "anon" : publique par design (c'est ainsi que fonctionne Supabase —
// la vraie protection vient des règles RLS en base, pas du secret de cette
// clé). Rien de sensible à cacher ici.
// ============================================================================

const SUPABASE_URL = "https://hmnlxbpcfqxdezucxsep.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtbmx4YnBjZnF4ZGV6dWN4c2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNzAwNDIsImV4cCI6MjEwNDk0NjA0Mn0.6ZMkqiDdCcfXAJ9RphxHgd5UeAEyfjWic2Ch68J1rXs";

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

  return session;
}

/** Déconnexion — à brancher sur le bouton correspondant dans chaque page. */
async function signOut() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem(SESSION_MARKER_KEY);
  window.location.href = "login.html";
}

/**
 * Message d'erreur lisible en français pour les erreurs Supabase Auth les
 * plus courantes — Supabase renvoie ses messages en anglais par défaut.
 */
function frenchAuthError(error) {
  if (!error) return "";
  const msg = error.message || "";
  if (msg.includes("Invalid login credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (msg.includes("User already registered")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }
  if (msg.includes("Password should be at least")) {
    return "Le mot de passe doit faire au moins 6 caractères.";
  }
  if (msg.includes("Unable to validate email address")) {
    return "Adresse e-mail invalide.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Confirme d'abord ton adresse e-mail (lien envoyé à l'inscription) avant de te connecter.";
  }
  return "Une erreur est survenue : " + msg;
}
