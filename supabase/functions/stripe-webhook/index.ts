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

import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
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

// 04/10/2026 — fin de la période en cours. Selon la version de l'API Stripe
// de l'événement, la date est sur l'abonnement ou sur sa première ligne :
// on lit les deux (avant, seule la première était lue et la base restait
// vide). Pour un abonnement résilié, c'est la date où l'accès s'arrête.
function periodEndOf(sub: Stripe.Subscription): number | null {
  // deno-lint-ignore no-explicit-any
  const s = sub as any;
  return s.cancel_at ?? s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
}

// L'abonnement a-t-il été résilié, avec arrêt à la fin de la période payée ?
function willCancel(sub: Stripe.Subscription): boolean {
  // deno-lint-ignore no-explicit-any
  const s = sub as any;
  return s.cancel_at_period_end === true || s.cancel_at != null;
}

// Statuts d'un abonnement « en cours » (même liste que create-checkout-session).
const CURRENT_STATUSES = ["active", "trialing", "past_due", "unpaid"];

async function upsertEntitlement(params: {
  accountId: string;
  plan: string;
  status: string;
  customerId: string | null;
  subscriptionId: string | null;
  periodEnd: number | null;
  cancelAtPeriodEnd?: boolean;
  // 04/10/2026 — fin d'abonnement, point de départ des 12 mois de
  // conservation (cf. fonction purge-lapsed-accounts) :
  //   true  -> l'abonnement vient de prendre fin : on date la fin ;
  //   false -> un abonnement est en cours : on efface la date et l'alerte.
  ended?: boolean;
}) {
  const row: Record<string, unknown> = {
    account_id: params.accountId,
    plan: params.plan,
    subscription_status: params.status,
    stripe_customer_id: params.customerId,
    stripe_subscription_id: params.subscriptionId,
    current_period_end: params.periodEnd
      ? new Date(params.periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: params.cancelAtPeriodEnd === true,
    subscription_ended_at: params.ended ? new Date().toISOString() : null,
    deletion_warned_at: null,
  };

  let { error } = await supabase
    .from("account_entitlements")
    .upsert(row, { onConflict: "account_id" });

  // Sécurité : si l'une des colonnes ajoutées après coup n'a pas encore été
  // créée en base, on réessaie sans elles plutôt que de bloquer l'activation
  // d'un abonnement payé.
  if (error && /cancel_at_period_end|subscription_ended_at|deletion_warned_at/.test(error.message ?? "")) {
    console.warn("colonne(s) récente(s) absente(s) : écriture sans elles");
    delete row.cancel_at_period_end;
    delete row.subscription_ended_at;
    delete row.deletion_warned_at;
    ({ error } = await supabase
      .from("account_entitlements")
      .upsert(row, { onConflict: "account_id" }));
  }

  if (error) {
    // 04/10/2026 — 23503 = violation de clé étrangère : le compte n'existe
    // plus (il a été supprimé par la fonction delete-account, qui arrête
    // l'abonnement juste avant). Il n'y a rien à mettre à jour, et il ne
    // faut pas renvoyer d'erreur, sinon Stripe réessaie pendant des jours.
    if (error.code === "23503") {
      console.log(`compte ${params.accountId} supprimé, événement ignoré`);
      return;
    }
    throw new Error(`upsert entitlement: ${error.message}`);
  }
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
          periodEnd: periodEndOf(sub),
          cancelAtPeriodEnd: willCancel(sub),
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

        // 04/10/2026 — un abonnement prend fin, mais le client en a peut-être
        // un autre encore en cours (cas d'un abonnement en double) : dans ce
        // cas le compte garde son accès, aligné sur celui qui reste. Avant,
        // le compte passait en « résilié » dès la première suppression.
        if (canceled) {
          const others = await stripe.subscriptions.list({
            customer: sub.customer as string,
            status: "all",
            limit: 100,
          });
          const remaining = others.data.find(
            (s) => s.id !== sub.id && CURRENT_STATUSES.includes(s.status),
          );
          if (remaining) {
            await upsertEntitlement({
              accountId,
              plan: planForSubscription(remaining),
              status: mapStatus(remaining.status),
              customerId: sub.customer as string,
              subscriptionId: remaining.id,
              periodEnd: periodEndOf(remaining),
              cancelAtPeriodEnd: willCancel(remaining),
            });
            break;
          }
        }

        await upsertEntitlement({
          accountId,
          plan: canceled ? "free" : planForSubscription(sub),
          status: canceled ? "canceled" : mapStatus(sub.status),
          customerId: sub.customer as string,
          subscriptionId: canceled ? null : sub.id,
          periodEnd: canceled ? null : periodEndOf(sub),
          cancelAtPeriodEnd: canceled ? false : willCancel(sub),
          ended: canceled, // plus aucun abonnement en cours : la fin est datée
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
