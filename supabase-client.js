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

/**
 * Garde d'authentification — à appeler en haut de chaque page protégée
 * (espace-personnel.html, creer-instrument.html, simulations.html).
 * Redirige vers login.html si personne n'est connecté ; sinon renvoie la
 * session (contient session.user.email, session.user.id, etc.).
 */
async function requireAuth() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

/** Déconnexion — à brancher sur le bouton correspondant dans chaque page. */
async function signOut() {
  await supabaseClient.auth.signOut();
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
