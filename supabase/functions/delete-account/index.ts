// supabase/functions/delete-account/index.ts
//
// Supprime DÉFINITIVEMENT le compte de l'utilisateur connecté, et tout ce
// qui lui appartient. Appelée par le bouton « Supprimer définitivement mon
// compte » (espace-personnel.html, Paramètres > Suppression).
//
// Trois étapes, dans cet ordre :
//   1. Stripe  : arrêt immédiat de tout abonnement en cours (aucun nouveau
//                prélèvement, pas de remboursement ni de prorata). Le client
//                Stripe et ses factures sont CONSERVÉS (obligation comptable).
//   2. Images  : suppression de tous les fichiers du bucket "results" rangés
//                sous le dossier du compte (<account_id>/...), puis contrôle
//                qu'il n'en reste aucun.
//   3. Compte  : suppression de l'utilisateur dans l'authentification. La
//                base efface alors en cascade accounts, instruments,
//                saved_results et account_entitlements.
//
// Pourquoi cet ordre : Stripe d'abord pour qu'aucun prélèvement ne puisse
// survenir si la suite échoue ; l'utilisateur en dernier pour qu'en cas
// d'échec il puisse encore se connecter et relancer la suppression. Chaque
// étape peut être rejouée sans dégât : la fonction est relançable.
// (Supabase refuse aussi de supprimer un utilisateur qui possède encore des
// fichiers : l'étape 2 doit donc précéder l'étape 3.)
//
// Secrets nécessaires (déjà définis pour les autres fonctions) :
//   STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from "npm:stripe@17.7.0";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

// 07/10/2026 : deux buckets à vider. « reports » contient les copies de résultats que l'utilisateur a choisi de
// signaler (voir 4-signalements.sql) : elles doivent disparaître avec le compte.
const BUCKETS = ["results", "reports"];
// Mot que l'utilisateur doit taper ; revérifié ici, pas seulement dans la page.
const CONFIRM_WORD = "SUPPRIMER";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Liste tous les fichiers sous un dossier du bucket, sous-dossiers compris.
// Dans la réponse de l'API, un dossier se reconnaît à son id nul.
async function listAllFiles(admin: SupabaseClient, bucket: string, root: string): Promise<string[]> {
  const files: string[] = [];
  const folders: string[] = [root];
  while (folders.length) {
    const dir = folders.pop()!;
    let offset = 0;
    while (true) {
      const { data, error } = await admin.storage
        .from(bucket)
        .list(dir, { limit: 1000, offset });
      if (error) throw new Error(`liste de ${dir} : ${error.message}`);
      if (!data || data.length === 0) break;
      for (const item of data) {
        const path = `${dir}/${item.name}`;
        if (item.id === null) folders.push(path);
        else files.push(path);
      }
      if (data.length < 1000) break;
      offset += data.length;
    }
  }
  return files;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "méthode non autorisée" }, 405);

  // ---- Qui appelle ? Uniquement l'utilisateur lui-même, via son jeton. ----
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "non authentifié" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "non authentifié" }, 401);

  // ---- Confirmation explicite ----
  let body: { confirm?: string } = {};
  try { body = await req.json(); } catch (_) { /* corps absent ou invalide */ }
  if (body.confirm !== CONFIRM_WORD) {
    return json({ error: "confirmation manquante" }, 400);
  }

  // service_role : nécessaire pour vider le dossier d'images et supprimer
  // l'utilisateur. Le compte visé est TOUJOURS user.id (celui du jeton),
  // jamais un identifiant reçu dans la requête.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  let step = "stripe";
  try {
    // ---- 1. Stripe : arrêt immédiat des abonnements ----
    const { data: ent, error: entErr } = await admin
      .from("account_entitlements")
      .select("stripe_customer_id")
      .eq("account_id", user.id)
      .maybeSingle();
    if (entErr) throw new Error(`lecture de l'abonnement : ${entErr.message}`);

    if (ent?.stripe_customer_id) {
      // On part du client Stripe, pas de l'identifiant d'abonnement stocké :
      // on arrête ainsi tout ce qui est encore en cours, même si la base
      // n'était pas à jour.
      const subs = await stripe.subscriptions.list({
        customer: ent.stripe_customer_id,
        status: "all",
        limit: 100,
      });
      for (const sub of subs.data) {
        if (sub.status === "canceled" || sub.status === "incomplete_expired") continue;
        await stripe.subscriptions.cancel(sub.id);
      }
    }

    // ---- 2. Images : tout le dossier du compte ----
    step = "images";
    for (const bucket of BUCKETS) {
      const files = await listAllFiles(admin, bucket, user.id);
      for (let i = 0; i < files.length; i += 100) {
        const { error } = await admin.storage.from(bucket).remove(files.slice(i, i + 100));
        if (error) throw new Error(`suppression d'images (${bucket}) : ${error.message}`);
      }
      const left = await listAllFiles(admin, bucket, user.id);
      if (left.length) throw new Error(`${left.length} fichier(s) encore présent(s) dans ${bucket}`);
    }

    // ---- 3. Compte : l'utilisateur, et tout le reste en cascade ----
    step = "compte";
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw new Error(`suppression de l'utilisateur : ${delErr.message}`);
  } catch (err) {
    console.error(`delete-account : échec à l'étape « ${step} » pour le compte ${user.id} :`, err);
    return json({ error: "suppression incomplète", step }, 500);
  }

  console.log(`delete-account : compte ${user.id} supprimé`);
  return json({ deleted: true });
});
