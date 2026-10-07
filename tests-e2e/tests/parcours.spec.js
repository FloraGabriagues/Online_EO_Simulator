// ============================================================================
// Nysa : test automatique du parcours utilisateur.
//
// Ce que le test vérifie, sur le vrai site :
//   PAGES PUBLIQUES (aucun compte nécessaire)
//     - la démo s'affiche en anglais par défaut, puis en français ;
//     - aucune page n'appelle un service tiers (polices, bibliothèques) ;
//     - les pages Hypothèses, mentions légales et confidentialité s'affichent ;
//     - aucun tiret long « — » n'est affiché ;
//     - une adresse inconnue donne la page « introuvable » de Nysa.
//   PARCOURS CONNECTÉ (compte de test nécessaire)
//     - connexion ; instrument d'exemple présent ; accès bêta actif ;
//     - simulation complète, du lancement à la sauvegarde ;
//     - page du résultat : image, onglets, téléchargement de la composition RGB
//       et d'une bande, avec le bon nom de fichier ;
//     - suppression du résultat créé (rien ne s'accumule dans le compte).
//
// Les étapes du parcours connecté ont besoin de deux variables :
//   NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD
// Sans elles, seules les pages publiques sont testées.
//
// IMPORTANT : utiliser un compte réservé aux tests, créé EN ANGLAIS. Une seule
// session est permise par compte : ce test déconnecte toute autre session du
// même compte.
// ============================================================================
const { test, expect } = require("@playwright/test");

const EMAIL = process.env.NYSA_TEST_EMAIL;
const PASSWORD = process.env.NYSA_TEST_PASSWORD;
const BASE_URL = process.env.NYSA_URL || "https://nysa-imaging.com";

// Erreurs JavaScript de la page, et textes de traduction manquants (le site écrit alors « Texte manquant »
// dans la console : c'est le signe qu'une page est plus récente que son fichier i18n.js, ou l'inverse).
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (/Texte manquant/.test(m.text())) errors.push("traduction manquante : " + m.text()); });
  return errors;
}

// Nom interne d'un texte non traduit, tel qu'il s'afficherait à l'écran (par exemple « res.download.rgb »).
const RAW_KEY = /\b(?:home|res|sim|login|nav|field|settings|sub|inst|common|time|help|beta|menu|paywall|api|demo|band|block|lang|pwd|activity|top|pwd|auth|block)\.[a-z0-9_]+(?:\.[a-z0-9_]+)*\b/;

// ---------------------------------------------------------------------------
// Pages publiques
// ---------------------------------------------------------------------------
test.describe("Pages publiques @public", () => {
  test("la démo s'affiche en anglais par défaut, puis en français", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/index.html");
    await expect(page.locator("h1")).toContainText("imaging simulator");
    await expect(page.locator("#simBtn")).toHaveText("Run simulation");
    await expect(page.locator("[data-lang-switch] button")).toHaveCount(2);
    await page.locator("[data-lang-switch] button", { hasText: "FR" }).click();
    await expect(page.locator("h1")).toContainText("Simulateur d'imagerie");
    await expect(page.locator("#simBtn")).toHaveText("Lancer la simulation");
    expect(errors, "erreurs JavaScript sur la démo").toEqual([]);
  });

  test("les polices et les bibliothèques viennent du site, pas d'un tiers", async ({ page }) => {
    const outside = [];
    page.on("request", (r) => {
      const host = new URL(r.url()).host;
      if (/fonts\.googleapis|fonts\.gstatic|jsdelivr|unpkg|cdnjs/.test(host)) outside.push(host);
    });
    for (const p of ["/login.html", "/index.html", "/hypotheses.html"]) {
      await page.goto(p);
      await page.waitForLoadState("networkidle");
    }
    expect(outside, "appels à un service tiers").toEqual([]);
  });

  test("la page Hypothèses et sources s'affiche dans les deux langues", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/hypotheses.html?lang=en");
    await expect(page.locator("h1 [lang='en']")).toHaveText("Assumptions and sources");
    await expect(page.locator("h1 [lang='fr']")).toBeHidden();
    await expect(page.locator("section")).toHaveCount(8);
    await page.goto("/hypotheses.html?lang=fr");
    await expect(page.locator("h1 [lang='fr']")).toBeVisible();
    await expect(page.locator("#donnees")).toContainText("BD ORTHO");
    expect(errors).toEqual([]);
  });

  test("les mentions légales et la politique de confidentialité sont complètes", async ({ page }) => {
    for (const lang of ["fr", "en"]) {
      await page.goto(`/conditions.html?lang=${lang}`);
      const terms = page.locator("main");
      await expect(terms).toContainText("989 424 403 00016");
      await expect(terms).toContainText("Croix Nivert");
      await expect(page.locator(".todo"), "passage à compléter resté dans la page").toHaveCount(0);
      await page.goto(`/confidentialite.html?lang=${lang}`);
      await expect(page.locator("main")).toContainText("contact@nysa-imaging.com");
      await expect(page.locator(".todo")).toHaveCount(0);
      await expect(page.locator(".draft"), "bandeau « projet » resté dans la page").toHaveCount(0);
    }
  });

  test("la page de connexion propose le mot de passe oublié, la langue et les conditions", async ({ page }) => {
    await page.goto("/login.html?lang=en");
    await expect(page.locator("#forgotLink")).toHaveText("Forgot your password?");
    await page.locator(".tab[data-view='signup']").click();
    await expect(page.locator("#signupLang")).toHaveValue("en");
    await expect(page.locator("#signupPassword2")).toBeVisible();
    await expect(page.locator(".legalnote a")).toHaveCount(2);
  });

  test("aucun texte de traduction manquant, dans aucune langue", async ({ page }) => {
    const pages = ["/index.html", "/login.html", "/hypotheses.html", "/conditions.html", "/confidentialite.html", "/404.html"];
    for (const lang of ["fr", "en"]) {
      for (const p of pages) {
        const errors = watchErrors(page);
        await page.goto(`${p}?lang=${lang}`);
        await page.waitForLoadState("networkidle");
        const text = await page.evaluate(() => document.body.innerText);
        expect(text.match(RAW_KEY), `nom interne de texte affiché sur ${p} (${lang})`).toBeNull();
        expect(errors.filter((e) => e.startsWith("traduction")), `traduction manquante sur ${p} (${lang})`).toEqual([]);
        page.removeAllListeners("console");
        page.removeAllListeners("pageerror");
      }
    }
  });

  test("aucun tiret long n'est affiché, dans aucune langue", async ({ page }) => {
    const pages = ["/index.html", "/login.html", "/hypotheses.html", "/conditions.html", "/confidentialite.html", "/404.html"];
    for (const lang of ["fr", "en"]) {
      for (const p of pages) {
        await page.goto(`${p}?lang=${lang}`);
        const found = await page.evaluate(() => (document.body.innerText + " " + document.title).includes("\u2014"));
        expect(found, `tiret long affiché sur ${p} (${lang})`).toBe(false);
      }
    }
  });

  test("une adresse inconnue affiche la page « introuvable » de Nysa", async ({ page }) => {
    const response = await page.goto("/cette-page-n-existe-pas");
    expect(response.status()).toBe(404);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("a.btn.main")).toHaveAttribute("href", "/index.html");
  });
});

// ---------------------------------------------------------------------------
// Parcours connecté
// ---------------------------------------------------------------------------
test.describe.serial("Parcours connecté", () => {
  test.skip(!EMAIL || !PASSWORD, "NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD ne sont pas définis");

  /** @type {import('@playwright/test').Page} */
  let page;
  let errors;
  let resultId = null;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: BASE_URL, acceptDownloads: true, viewport: { width: 1440, height: 900 } });
    page = await context.newPage();
    errors = watchErrors(page);
    page.on("dialog", (d) => d.accept());      // confirmation de suppression d'un résultat
  });

  test.afterAll(async () => {
    // Nettoyage : si une étape a échoué après la création du résultat, on le supprime quand même.
    if (resultId) {
      try {
        await page.goto("/resultats.html");
        const row = page.locator(`.resultrow[data-id="${resultId}"]`);
        if (await row.count()) {
          await row.locator(".menubtn").click();
          await row.locator("[data-act='delete']").click();
          await expect(row).toHaveCount(0);
        }
      } catch (e) {
        console.warn("Nettoyage du résultat de test impossible :", e.message);
      }
    }
    await page.context().close();
  });

  test("connexion", async () => {
    await page.goto("/login.html?lang=en");
    await page.locator("#loginEmail").fill(EMAIL);
    await page.locator("#loginPassword").fill(PASSWORD);
    await page.locator("#loginForm .submitbtn").click();
    await page.waitForURL("**/espace-personnel.html*");
    await expect(page.locator("h1")).toHaveText("My instruments");
    await expect(page.locator("#userEmail")).toHaveText(EMAIL);
  });

  test("l'espace personnel liste l'instrument d'exemple, accès bêta actif", async () => {
    // un compte neuf reçoit l'instrument d'exemple à sa première visite : on laisse le temps de le créer
    const complete = page.locator(".instcard:not(.empty):not(.draft)");
    await expect(complete.first(), "le compte de test doit avoir au moins un instrument complet").toBeVisible({ timeout: 30 * 1000 });
    await page.goto("/espace-personnel.html?settings=1");
    await expect(page.locator("#settingsSubStatusText")).toHaveText("Active");
  });

  test("simulation complète", async () => {
    await page.goto("/simulations.html");
    await expect(page.locator("h1")).toHaveText("New simulation");

    await expect(page.locator(".scenecard").first()).toBeVisible();     // étape 1 : la première scène est sélectionnée
    // La page charge ses instruments et l'abonnement en arrière-plan : on attend la fin du chargement
    // (instruments présents, bouton « Suivant » actif) avant de cliquer, comme le ferait un utilisateur patient.
    await expect(page.locator("#instList .instoption").first()).toBeAttached({ timeout: 30 * 1000 });
    await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
    await page.locator("#panelActionBtn").click();

    const instrument = page.locator("#instList .instoption:not(.draft)").first();   // étape 2
    await expect(instrument).toBeVisible();
    await instrument.click();
    await page.locator("#panelActionBtn").click();

    // étape 3 : conditions par défaut (temps d'intégration au minimum, FMC = 1), donc le bouton doit être actif
    await expect(page.locator("#fmcVal")).toContainText("1.00");
    await expect(page.locator("#panelActionBtn")).toBeEnabled();
    await expect(page.locator("#panelActionBtn")).toContainText("Run simulation");
    await page.locator("#panelActionBtn").click();

    // étape 4 : on attend la fin du calcul, puis le lien vers le résultat
    const link = page.locator("a.viewresultsbtn");
    await expect(link, "la simulation doit se terminer et se sauvegarder").toBeVisible({ timeout: 6 * 60 * 1000 });
    await expect(page.locator("#statText")).toHaveText("Simulation complete");
    resultId = new URL(await link.getAttribute("href"), page.url()).searchParams.get("id");
    expect(resultId, "identifiant du résultat sauvegardé").toBeTruthy();
    await link.click();
  });

  test("la page du résultat affiche l'image, les mesures et la date", async () => {
    await page.waitForURL("**/resultats.html?id=*");
    await expect(page.locator("#resTitle")).not.toHaveText("Result");
    await expect(page.locator("#resSub")).toContainText("20");          // date écrite en clair sous le titre
    await expect
      .poll(async () => page.locator("#imgSim").evaluate((img) => img.complete && img.naturalWidth), { timeout: 30 * 1000 })
      .toBeGreaterThan(0);
    const tabs = page.locator("#restabsHost button");
    await expect(tabs).toHaveCount(4);
    await tabs.nth(1).click();
    await expect(page.locator(".tabpanel.current")).toContainText("MTF");
    await tabs.nth(3).click();
    await expect(page.locator("#entInstConfig")).toContainText("iFoV");
    await tabs.nth(0).click();
  });

  test("téléchargement de la composition RGB et d'une bande", async () => {
    const readHeader = async (download) => {
      const fs = require("fs");
      const buf = fs.readFileSync(await download.path());
      return { size: buf.length, signature: Array.from(buf.subarray(0, 4)) };
    };
    // composition RGB
    await expect(page.locator("#downloadLabel")).toHaveText("Download RGB image");
    let [download] = await Promise.all([page.waitForEvent("download"), page.locator("#downloadBtn").click()]);
    expect(download.suggestedFilename()).toMatch(/^RGB_.+_\d{4}-\d{2}-\d{2}_\d{4}\.png$/);
    let h = await readHeader(download);
    expect(h.signature, "le fichier doit être un PNG").toEqual([137, 80, 78, 71]);
    expect(h.size).toBeGreaterThan(1000);
    // bande rouge
    await page.locator(".bandthumb[data-key='R']").click();
    await expect(page.locator("#downloadLabel")).toHaveText("Download Red band");
    [download] = await Promise.all([page.waitForEvent("download"), page.locator("#downloadBtn").click()]);
    expect(download.suggestedFilename()).toMatch(/^Red_.+_\d{4}-\d{2}-\d{2}_\d{4}\.png$/);
    h = await readHeader(download);
    expect(h.signature).toEqual([137, 80, 78, 71]);
    expect(h.size).toBeGreaterThan(500);
  });

  test("le résultat apparaît dans la liste, puis il est supprimé", async () => {
    await page.goto("/resultats.html");
    const row = page.locator(`.resultrow[data-id="${resultId}"]`);
    await expect(row).toBeVisible();
    await row.locator(".menubtn").click();
    await row.locator("[data-act='delete']").click();
    await expect(row).toHaveCount(0);
    resultId = null;
  });

  test("aucun texte non traduit sur les pages de l'espace connecté", async () => {
    for (const p of ["/espace-personnel.html", "/simulations.html", "/resultats.html", "/creer-instrument.html"]) {
      await page.goto(p);
      await page.waitForLoadState("networkidle");
      const text = await page.evaluate(() => document.body.innerText);
      expect(text.match(RAW_KEY), `nom interne de texte affiché sur ${p}`).toBeNull();
    }
  });

  test("aucune erreur JavaScript pendant le parcours", async () => {
    expect(errors).toEqual([]);
  });
});
