// supabase/functions/purge-lapsed-accounts/index.ts
//
// Tâche quotidienne (appelée par pg_cron, cf. abonnement-fin.sql) pour les
// comptes dont l'abonnement a pris fin. Règle décidée le 04/10/2026 :
//   - après une résiliation, le compte reste utilisable sans simulation
//     pendant 12 mois ;
//   - 30 jours avant la fin de ces 12 mois, un e-mail prévient l'utilisateur ;
//   - au bout des 12 mois, le compte et toutes ses données sont supprimés,
//     comme avec le bouton « Supprimer mon compte ».
//
// Deux garde-fous :
//   - aucun compte n'est supprimé sans qu'un e-mail d'alerte lui ait été
//     envoyé AVEC SUCCÈS au moins 30 jours avant. Si l'envoi d'e-mails est en
//     panne, rien n'est supprimé ;
//   - un compte qui a de nouveau un abonnement n'est jamais concerné : le
//     webhook Stripe efface alors la date de fin (subscription_ended_at).
//
// Mode essai : ajouter ?dry_run=1 à l'adresse. La fonction liste ce qu'elle
// ferait, sans envoyer d'e-mail ni rien supprimer.
//
// Réglage dans Supabase : « Verify JWT » sur OFF (c'est pg_cron qui appelle,
// pas un utilisateur). L'accès est protégé par le secret CRON_SECRET.
//
// Secrets nécessaires :
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (fournis par Supabase)
//   SITE_URL                                  (déjà défini)
//   CRON_SECRET        une longue chaîne aléatoire, la même que dans pg_cron
//   BREVO_API_KEY      clé d'API du compte Brevo (envoi des e-mails)
//   MAIL_FROM_EMAIL    adresse d'expéditeur, validée dans Brevo
//   MAIL_FROM_NAME     nom d'expéditeur affiché (« Nysa »)

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "results";
const KEEP_DAYS = 365;   // durée de conservation après la fin de l'abonnement
const WARN_DAYS = 30;    // délai entre l'e-mail d'alerte et la suppression
const MAX_PER_RUN = 50;  // plafond d'actions par exécution, par prudence
const DAY_MS = 24 * 3600 * 1000;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Liste tous les fichiers sous un dossier du bucket, sous-dossiers compris
// (même fonction que dans delete-account).
async function listAllFiles(admin: SupabaseClient, root: string): Promise<string[]> {
  const files: string[] = [];
  const folders: string[] = [root];
  while (folders.length) {
    const dir = folders.pop()!;
    let offset = 0;
    while (true) {
      const { data, error } = await admin.storage.from(BUCKET).list(dir, { limit: 1000, offset });
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

// Supprime les images du compte, puis l'utilisateur (la base efface alors en
// cascade accounts, instruments, saved_results et account_entitlements).
async function deleteAccount(admin: SupabaseClient, accountId: string): Promise<void> {
  const files = await listAllFiles(admin, accountId);
  for (let i = 0; i < files.length; i += 100) {
    const { error } = await admin.storage.from(BUCKET).remove(files.slice(i, i + 100));
    if (error) throw new Error(`suppression d'images : ${error.message}`);
  }
  const left = await listAllFiles(admin, accountId);
  if (left.length) throw new Error(`${left.length} fichier(s) encore présent(s)`);
  const { error } = await admin.auth.admin.deleteUser(accountId);
  if (error) throw new Error(`suppression de l'utilisateur : ${error.message}`);
}

// Envoi de l'e-mail d'alerte par l'API de Brevo. Lève une erreur si Brevo
// ne confirme pas l'envoi : l'alerte n'est alors pas marquée comme faite.
async function sendWarning(to: string, deletionDate: Date): Promise<void> {
  const site = Deno.env.get("SITE_URL")!;
  const dateTxt = formatDateFr(deletionDate);
  const subject = `Votre compte sera supprimé le ${dateTxt}`;
  const text =
    `Bonjour,\n\n` +
    `Votre abonnement à Nysa a pris fin il y a bientôt un an. ` +
    `Conformément à nos conditions, votre compte et toutes ses données ` +
    `(instruments, résultats et images) seront supprimés le ${dateTxt}.\n\n` +
    `Pour les conserver, il suffit de vous réabonner avant cette date :\n` +
    `${site}/espace-personnel.html?settings=1\n\n` +
    `Vous pouvez aussi vous connecter pour exporter vos instruments avant la suppression.\n\n` +
    `Si vous ne faites rien, la suppression sera définitive et vous n'avez aucune démarche à effectuer.\n\n` +
    `${Deno.env.get("MAIL_FROM_NAME") ?? ""}`;
  const html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, "<br>");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": Deno.env.get("BREVO_API_KEY")!,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { email: Deno.env.get("MAIL_FROM_EMAIL")!, name: Deno.env.get("MAIL_FROM_NAME") ?? undefined },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: `<p>${html}</p>`,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status} : ${await res.text()}`);
}

Deno.serve(async (req) => {
  // ---- Accès réservé à la tâche planifiée ----
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return json({ error: "non autorisé" }, 401);
  }
  const dryRun = new URL(req.url).searchParams.get("dry_run") === "1";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Comptes dont l'abonnement a pris fin et qui n'en ont pas repris.
  const { data: rows, error } = await admin
    .from("account_entitlements")
    .select("account_id, subscription_status, subscription_ended_at, deletion_warned_at")
    .not("subscription_ended_at", "is", null)
    .neq("subscription_status", "active")
    .neq("subscription_status", "past_due")
    .order("subscription_ended_at", { ascending: true });
  if (error) {
    console.error("purge-lapsed-accounts : lecture impossible :", error);
    return json({ error: "lecture impossible" }, 500);
  }

  const now = Date.now();
  const report = { dry_run: dryRun, examined: rows?.length ?? 0, warned: [] as string[], deleted: [] as string[], errors: [] as string[] };
  let actions = 0;

  for (const row of rows ?? []) {
    if (actions >= MAX_PER_RUN) break;
    const endedAt = new Date(row.subscription_ended_at).getTime();
    const deletionAt = endedAt + KEEP_DAYS * DAY_MS;
    const warnedAt = row.deletion_warned_at ? new Date(row.deletion_warned_at).getTime() : null;

    try {
      if (warnedAt === null) {
        // Pas encore prévenu : on prévient à partir de 30 jours avant l'échéance.
        if (now < deletionAt - WARN_DAYS * DAY_MS) continue;
        // La suppression aura lieu au plus tôt 30 jours après CET envoi,
        // même si l'échéance théorique est plus proche (alerte en retard).
        const effectiveDeletion = new Date(Math.max(deletionAt, now + WARN_DAYS * DAY_MS));
        actions++;
        if (dryRun) { report.warned.push(row.account_id); continue; }

        const { data: u, error: uErr } = await admin.auth.admin.getUserById(row.account_id);
        if (uErr || !u?.user?.email) throw new Error(`e-mail introuvable : ${uErr?.message ?? "aucune adresse"}`);
        await sendWarning(u.user.email, effectiveDeletion);
        const { error: upErr } = await admin
          .from("account_entitlements")
          .update({ deletion_warned_at: new Date().toISOString() })
          .eq("account_id", row.account_id);
        if (upErr) throw new Error(`alerte envoyée mais non enregistrée : ${upErr.message}`);
        report.warned.push(row.account_id);
      } else {
        // Déjà prévenu : suppression quand les 12 mois sont écoulés ET que
        // l'alerte date d'au moins 30 jours.
        if (now < deletionAt || now < warnedAt + WARN_DAYS * DAY_MS) continue;
        actions++;
        if (dryRun) { report.deleted.push(row.account_id); continue; }
        await deleteAccount(admin, row.account_id);
        report.deleted.push(row.account_id);
      }
    } catch (err) {
      console.error(`purge-lapsed-accounts : compte ${row.account_id} :`, err);
      report.errors.push(`${row.account_id} : ${(err as Error).message}`);
    }
  }

  console.log("purge-lapsed-accounts :", JSON.stringify(report));
  return json(report, report.errors.length ? 207 : 200);
});
