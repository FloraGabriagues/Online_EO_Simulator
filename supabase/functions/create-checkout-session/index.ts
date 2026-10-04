// supabase/functions/create-checkout-session/index.ts
//
// Appelée depuis le front par un utilisateur connecté.
// Crée une session Stripe Checkout et renvoie l'URL de redirection.
//
// 04/10/2026 — garde-fou contre les abonnements en double : avant de créer
// une page de paiement, on demande à Stripe si le client a DÉJÀ un
// abonnement en cours. Si oui, on n'en crée pas un second : on remet la
// base d'accord avec Stripe et on répond { already_subscribed: true }.
// Stripe est la seule référence ; la valeur en base peut être en retard
// (webhook pas encore arrivé) ou fausse (modifiée à la main).
//
// Secrets nécessaires :
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_INDIVIDUEL
//   SITE_URL                (ex: https://tonsite.github.io/Online_EO_Simulator)
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get("SITE_URL")!;
const PRICE_ID = Deno.env.get("STRIPE_PRICE_INDIVIDUEL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // restreins à ton domaine en prod
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Statuts Stripe d'un abonnement « en cours » : il existe et il est (ou
// sera) facturé. Un abonnement "incomplete" (paiement jamais abouti) ou
// "canceled" n'en fait pas partie : on peut alors en créer un nouveau.
const CURRENT_STATUSES = ["active", "trialing", "past_due", "unpaid"];

// Mêmes correspondances que dans stripe-webhook.
function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "inactive";
  }
}

// Fin de la période payée. Selon la version de l'API Stripe, la date est
// sur l'abonnement ou sur sa première ligne : on lit les deux.
// Pour un abonnement résilié, c'est la date où l'accès s'arrête.
function periodEndOf(sub: Stripe.Subscription): string | null {
  // deno-lint-ignore no-explicit-any
  const s = sub as any;
  const ts = s.cancel_at ?? s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

// L'abonnement a-t-il été résilié, avec arrêt à la fin de la période payée ?
function willCancel(sub: Stripe.Subscription): boolean {
  // deno-lint-ignore no-explicit-any
  const s = sub as any;
  return s.cancel_at_period_end === true || s.cancel_at != null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Identifier l'utilisateur à partir de son JWT.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "non authentifié" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "non authentifié" }, 401);

    // 2. Récupérer un éventuel customer Stripe déjà créé pour ce compte.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: ent } = await admin
      .from("account_entitlements")
      .select("stripe_customer_id")
      .eq("account_id", user.id)
      .maybeSingle();

    let customerId = ent?.stripe_customer_id ?? undefined;

    // 3. Garde-fou : ce client a-t-il déjà un abonnement en cours ?
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 100,
      });
      const current = subs.data.find((s) => CURRENT_STATUSES.includes(s.status));

      if (current) {
        // On aligne la base sur Stripe (même écriture que le webhook), pour
        // que le site affiche tout de suite le bon état.
        const row: Record<string, unknown> = {
          account_id: user.id,
          plan: "individuel",
          subscription_status: mapStatus(current.status),
          stripe_customer_id: customerId,
          stripe_subscription_id: current.id,
          current_period_end: periodEndOf(current),
          cancel_at_period_end: willCancel(current),
          // Un abonnement est en cours : pas de fin datée, pas d'alerte en attente.
          subscription_ended_at: null,
          deletion_warned_at: null,
        };
        let { error: upErr } = await admin
          .from("account_entitlements")
          .upsert(row, { onConflict: "account_id" });
        // Colonnes pas encore créées en base : on réessaie sans elles.
        if (upErr && /cancel_at_period_end|subscription_ended_at|deletion_warned_at/.test(upErr.message ?? "")) {
          delete row.cancel_at_period_end;
          delete row.subscription_ended_at;
          delete row.deletion_warned_at;
          ({ error: upErr } = await admin
            .from("account_entitlements")
            .upsert(row, { onConflict: "account_id" }));
        }
        if (upErr) console.error("resynchronisation de l'abonnement :", upErr);

        console.log(`create-checkout-session : compte ${user.id} déjà abonné (${current.id}), pas de nouvelle session`);
        return json({ already_subscribed: true });
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { account_id: user.id },
      });
      customerId = customer.id;
    }

    // 4. Créer la session Checkout.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/espace-personnel.html?checkout=success`,
      cancel_url: `${SITE_URL}/espace-personnel.html?checkout=cancel`,
      // Indispensable : c'est ce qui permet au webhook de retrouver le compte.
      metadata: { account_id: user.id },
      subscription_data: { metadata: { account_id: user.id } },
      allow_promotion_codes: true,
      // TVA : à activer une fois Stripe Tax configuré côté dashboard.
      // automatic_tax: { enabled: true },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session:", err);
    return json({ error: "erreur serveur" }, 500);
  }
});
