// supabase/functions/stripe-webhook/index.ts
//
// Reçoit les événements Stripe et met à jour account_entitlements.
// C'est le SEUL chemin d'écriture vers cette table (service_role).
//
// Secrets nécessaires (voir README) :
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// service_role : contourne RLS, c'est voulu ici et nulle part ailleurs.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// Un seul plan payant pour l'instant. Quand tu ajouteras "equipe",
// il suffira d'ajouter une entrée ici (clé = price_id Stripe).
const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_INDIVIDUEL") ?? ""]: "individuel",
};

function planForSubscription(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price?.id ?? "";
  return PRICE_TO_PLAN[priceId] ?? "individuel";
}

// Statuts Stripe -> nos 4 valeurs autorisées par le check constraint.
function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}

async function upsertEntitlement(params: {
  accountId: string;
  plan: string;
  status: string;
  customerId: string | null;
  subscriptionId: string | null;
  periodEnd: number | null;
}) {
  const { error } = await supabase
    .from("account_entitlements")
    .upsert(
      {
        account_id: params.accountId,
        plan: params.plan,
        subscription_status: params.status,
        stripe_customer_id: params.customerId,
        stripe_subscription_id: params.subscriptionId,
        current_period_end: params.periodEnd
          ? new Date(params.periodEnd * 1000).toISOString()
          : null,
      },
      { onConflict: "account_id" },
    );

  if (error) throw new Error(`upsert entitlement: ${error.message}`);
}

// Retrouve l'account_id à partir du customer Stripe :
// 1) via les metadata (posées à la création de la session Checkout)
// 2) sinon via stripe_customer_id déjà stocké
async function resolveAccountId(
  customerId: string,
  metadataAccountId?: string | null,
): Promise<string | null> {
  if (metadataAccountId) return metadataAccountId;

  const { data } = await supabase
    .from("account_entitlements")
    .select("account_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.account_id ?? null;
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  // IMPORTANT : le corps brut, pas du JSON parsé — sinon la
  // vérification de signature échoue.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error("signature invalide:", err);
    return new Response("invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const accountId = session.metadata?.account_id ?? null;
        if (!accountId) {
          console.error("checkout sans account_id en metadata");
          break;
        }

        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await upsertEntitlement({
          accountId,
          plan: planForSubscription(sub),
          status: mapStatus(sub.status),
          customerId: session.customer as string,
          subscriptionId: sub.id,
          periodEnd: sub.current_period_end,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const accountId = await resolveAccountId(
          sub.customer as string,
          sub.metadata?.account_id,
        );
        if (!accountId) {
          console.error("compte introuvable pour customer", sub.customer);
          break;
        }

        const canceled = event.type === "customer.subscription.deleted";

        await upsertEntitlement({
          accountId,
          plan: canceled ? "free" : planForSubscription(sub),
          status: canceled ? "canceled" : mapStatus(sub.status),
          customerId: sub.customer as string,
          subscriptionId: canceled ? null : sub.id,
          periodEnd: canceled ? null : sub.current_period_end,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const accountId = await resolveAccountId(invoice.customer as string);
        if (!accountId) break;

        await supabase
          .from("account_entitlements")
          .update({ subscription_status: "past_due" })
          .eq("account_id", accountId);
        break;
      }

      default:
        // Les autres événements sont ignorés volontairement.
        break;
    }
  } catch (err) {
    console.error("erreur traitement webhook:", err);
    // 500 => Stripe réessaiera automatiquement.
    return new Response("handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
