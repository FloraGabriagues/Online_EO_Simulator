// supabase/functions/notify-report/index.ts
//
// Prévient l'administrateur par e-mail à chaque nouveau signalement de résultat (08/10/2026).
// Appelée par la base (déclencheur sur result_reports, cf. demenagement/5-notification-signalement.sql).
//
// Réglage dans Supabase : « Verify JWT » sur OFF (c'est la base qui appelle, pas un utilisateur).
// L'accès est protégé par le secret NOTIFY_SECRET, envoyé dans l'en-tête x-notify-secret.
//
// Secrets nécessaires :
//   NOTIFY_SECRET      une longue chaîne aléatoire, la même que dans le déclencheur SQL
//   BREVO_API_KEY, MAIL_FROM_EMAIL, MAIL_FROM_NAME   (déjà définis pour purge-lapsed-accounts)
//   NOTIFY_TO          (facultatif) adresse destinataire ; par défaut contact@nysa-imaging.com
//   SITE_URL           (déjà défini) pour le lien vers admin.html

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cut = (s: unknown, n: number) => { const t = String(s ?? ""); return t.length > n ? t.slice(0, n) + "…" : t; };

Deno.serve(async (req) => {
  const secret = Deno.env.get("NOTIFY_SECRET");
  if (!secret || req.headers.get("x-notify-secret") !== secret) {
    return new Response(JSON.stringify({ error: "non autorisé" }), { status: 401 });
  }
  let rec: any;
  try { rec = (await req.json()).record; } catch { return new Response("corps invalide", { status: 400 }); }
  if (!rec) return new Response("pas de signalement", { status: 400 });

  const snap = rec.snapshot ?? {};
  const inst = snap.instrument_snapshot?.name ?? "";
  const site = (Deno.env.get("SITE_URL") ?? "https://nysa-imaging.com").replace(/\/$/, "");
  const link = `${site}/admin.html`;
  const text =
    `Nouveau signalement de résultat\n\n` +
    `Compte : ${rec.contact_email ?? "(inconnu)"}\n` +
    `Scène : ${snap.scene ?? ""}   Instrument : ${inst}\n` +
    `Date : ${rec.created_at}\n\n` +
    `Message :\n${cut(rec.message, 1500)}\n\n` +
    `À consulter : ${link}`;
  const html = `<p>${esc(text).replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>').replace(/\n/g, "<br>")}</p>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": Deno.env.get("BREVO_API_KEY")!, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      sender: { email: Deno.env.get("MAIL_FROM_EMAIL")!, name: Deno.env.get("MAIL_FROM_NAME") ?? undefined },
      to: [{ email: Deno.env.get("NOTIFY_TO") ?? "contact@nysa-imaging.com" }],
      subject: `Signalement Nysa : ${cut(snap.scene ?? "résultat", 30)} (${rec.contact_email ?? ""})`,
      textContent: text,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    console.error("notify-report : Brevo", res.status, await res.text());
    return new Response("envoi impossible", { status: 502 });
  }
  return new Response("ok");
});
