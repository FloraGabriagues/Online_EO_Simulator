// supabase/functions/create-checkout-session/index.ts
//
// Appelée depuis le front par un utilisateur connecté.
// Crée une session Stripe Checkout et renvoie l'URL de redirection.
//
// Secrets nécessaires :
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_INDIVIDUEL
//   SITE_URL                (ex: https://tonsite.github.io/Online_EO_Simulator)
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get("SITE_URL")!;
const PRICE_ID = Deno.env.get("STRIPE_PRICE_INDIVIDUEL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // restreins à ton domaine en prod
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Identifier l'utilisateur à partir de son JWT.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { account_id: user.id },
      });
      customerId = customer.id;
    }

    // 3. Créer la session Checkout.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/#/compte?checkout=success`,
      cancel_url: `${SITE_URL}/#/compte?checkout=cancel`,
      // Indispensable : c'est ce qui permet au webhook de retrouver le compte.
      metadata: { account_id: user.id },
      subscription_data: { metadata: { account_id: user.id } },
      allow_promotion_codes: true,
      // TVA : à activer une fois Stripe Tax configuré côté dashboard.
      // automatic_tax: { enabled: true },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session:", err);
    return new Response(JSON.stringify({ error: "erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
