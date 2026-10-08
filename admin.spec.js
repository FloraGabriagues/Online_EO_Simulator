// ============================================================================
// Nysa : outils d'administration. Ces tests ont besoin d'un compte AU PLAN « admin », donné par
// NYSA_ADMIN_EMAIL et NYSA_ADMIN_PASSWORD. Sans eux, ils sont ignorés (ce qui est le cas dans le test
// automatique quotidien : le compte de test est un compte ordinaire, et c'est voulu).
// Ils servent surtout à rejouer la suite en local ou à la main avant de modifier l'administration.
// ============================================================================
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const os = require("os");
const path = require("path");

const EMAIL = process.env.NYSA_ADMIN_EMAIL;
const PASSWORD = process.env.NYSA_ADMIN_PASSWORD;
const BASE_URL = process.env.NYSA_URL || "https://nysa-imaging.com";

test.describe.serial("Administration", () => {
  test.skip(!EMAIL || !PASSWORD, "NYSA_ADMIN_EMAIL et NYSA_ADMIN_PASSWORD ne sont pas définis");
  let page, ctx, resultUrl;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nysa-admin-"));
  const jsonOk = path.join(tmp, "params-ok.json");
  const jsonKo = path.join(tmp, "params-echec.json");
  const jsonBad = path.join(tmp, "casse.json");
  const csv = path.join(tmp, "zernike.csv");
  fs.writeFileSync(jsonOk, JSON.stringify({ D: 0.5, marque: "e2e-admin" }));
  fs.writeFileSync(jsonKo, JSON.stringify({ fail: true }));
  fs.writeFileSync(jsonBad, "{ ceci n'est pas du json");
  fs.writeFileSync(csv, "Detector_ID;Band;Column;Z1;Z2\n1;R;0;0.1;0.2\n");

  test.beforeAll(async ({ browser }) => {
    ctx = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1440, height: 900 } });
    page = await ctx.newPage();
    page.on("dialog", (d) => d.accept());
    await page.goto("/login.html?lang=en");
    await page.locator("#loginEmail").fill(EMAIL);
    await page.locator("#loginPassword").fill(PASSWORD);
    await page.locator("#loginForm .submitbtn").click();
    await page.waitForURL("**/espace-personnel.html*");
  });
  test.afterAll(async () => {
    try {
      await page.evaluate(async () => {
        const { data: res } = await supabaseClient.from("saved_results").select("id");
        for (const r of res || []) await supabaseClient.from("saved_results").delete().eq("id", r.id);
      });
    } catch (e) { /* le nettoyage est facultatif */ }
    await ctx.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  async function toStep3() {
    await page.goto("/simulations.html");
    await expect(page.locator("#instList .instoption").first()).toBeAttached({ timeout: 30 * 1000 });
    await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
    await page.locator("#panelActionBtn").click();
    await page.locator("#instList .instoption").first().click();
    await page.locator("#panelActionBtn").click();
  }

  test("le panneau d'administration est visible et le plan admin ouvre le simulateur", async () => {
    await toStep3();
    await expect(page.locator("#adminBox")).toBeVisible();
    await expect(page.locator("#panelActionBtn")).toBeEnabled();
  });

  test("fichiers refusés : JSON cassé", async () => {
    await page.locator("#adminBox summary").click();
    await page.locator("#admJson").setInputFiles(jsonBad);
    await expect(page.locator("#admErr")).toContainText("Invalid JSON");
    await expect(page.locator("#admState")).toHaveText("");
  });

  test("un JSON et un CSV chargés activent le mode admin, la simulation les envoie et les conserve", async () => {
    await page.locator("#admJson").setInputFiles(jsonOk);
    await page.locator("#admCsv").setInputFiles(csv);
    await expect(page.locator("#admState")).toContainText("params-ok.json + zernike.csv");
    await page.locator("#fTI").fill("1");                       // hors bornes : sans effet en mode admin
    await page.locator("#fTI").press("Tab");
    await expect(page.locator("#panelActionBtn")).toBeEnabled();
    await page.locator("#panelActionBtn").click();
    const link = page.locator("a.viewresultsbtn");
    await expect(link).toBeVisible({ timeout: 5 * 60 * 1000 });
    await link.click();
    await page.waitForURL("**/resultats.html?id=*");
    resultUrl = page.url();
  });

  test("le résultat admin a un onglet Logs avec les journaux et les entrées utilisées", async () => {
    const tabs = page.locator("#restabsHost button");
    await expect(tabs).toHaveCount(5);
    await tabs.nth(4).click();
    await expect(page.locator("#logsPre")).toContainText("LOGS ADMIN OK");
    await expect(page.locator("#logsPre")).toContainText("e2e-admin");           // le JSON reçu par le serveur
    await expect(page.locator("#admInputsPre")).toContainText("params-ok.json");
    await expect(page.locator("#admInputsPre")).toContainText("zernike.csv");
  });

  test("un signalement arrive dans la boîte de réception, avec ses données ; suivi et suppression", async () => {
    await page.goto(resultUrl);
    await page.locator("#btnReport").click();
    await page.locator("#rptMsg").fill("e2e-signalement : l'image me paraît trop sombre");
    await page.locator("#rptConsent").check();
    await page.locator("#rptSend").click();
    await expect(page.locator("#rptDone")).toBeVisible({ timeout: 60 * 1000 });
    await page.locator("#rptClose").click();
    await expect(page.locator("#navAdminItem")).toBeVisible();                       // le lien du menu est révélé à l'administrateur
    await page.locator("#navAdminItem a").click();
    await page.waitForURL("**/admin.html");
    const row = page.locator(".rptrow").first();
    await expect(row).toBeVisible();
    await row.click();
    const d = page.locator("#rptDetail");
    await expect(d).toContainText("e2e-signalement");                                  // le message
    await expect(d).toContainText("LOGS ADMIN OK");                                    // les journaux
    await expect(d).toContainText(/I authorize Nysa|J'autorise Nysa/);                // le texte de consentement exact, dans la langue de l'utilisateur
    await expect(d.locator(".imgs img")).toHaveCount(2, { timeout: 30 * 1000 });       // image simulée et image source
    await page.locator("#rptStatus").selectOption("closed");
    await page.locator("#rptNote").fill("traité par le test");
    await d.getByRole("button", { name: "Enregistrer le suivi" }).click();
    await expect(page.locator("#rptToast")).toContainText("enregistré");
    await expect(page.locator(".rptrow .badge").first()).toHaveText("Clos");
    await d.getByRole("button", { name: "Supprimer ce signalement" }).click();
    await expect(page.locator(".rptrow")).toHaveCount(0);
  });

  test("un échec admin affiche les journaux du serveur", async () => {
    await toStep3();
    await page.locator("#adminBox summary").click();
    await page.locator("#admJson").setInputFiles(jsonKo);
    await page.locator("#panelActionBtn").click();
    await expect(page.locator("#admSrvLogs")).toContainText("LOGS D'ÉCHEC", { timeout: 2 * 60 * 1000 });
  });

  test("retirer les fichiers ramène la simulation standard", async () => {
    await toStep3();
    await page.locator("#adminBox summary").click();
    await page.locator("#admJson").setInputFiles(jsonOk);
    await expect(page.locator("#admState")).toContainText("params-ok.json");
    await page.locator("#admJsonClear").click();
    await expect(page.locator("#admState")).toHaveText("");
    await page.locator("#fTI").fill("1");
    await page.locator("#fTI").press("Tab");
    await expect(page.locator("#panelActionBtn")).toBeDisabled();                  // les contrôles reviennent
  });
});
