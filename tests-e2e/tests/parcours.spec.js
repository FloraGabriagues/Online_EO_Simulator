// ============================================================================
// Nysa : tests automatiques du site, sur le vrai site.
//
// PAGES PUBLIQUES (aucun compte nécessaire)
//   - la démo : s'affiche, calcule une vraie simulation, en anglais et en français ;
//   - la connexion : mauvais mot de passe, mot de passe oublié, inscription (contrôles),
//     choix de la langue ;
//   - aucun appel à un service tiers, aucun texte non traduit, aucun tiret long ;
//   - mentions légales et confidentialité complètes ; page « introuvable ».
//
// PARCOURS CONNECTÉ, joué une fois en anglais puis une fois en français
//   - connexion, langue du compte, instrument d'exemple, accès bêta ;
//   - création d'instruments (les trois modes d'électronique, un brouillon), renommer,
//     dupliquer, supprimer ;
//   - conditions d'acquisition : bornes, temps minimal à FMC = 1, bulles d'aide ;
//   - simulation complète, avec l'avertissement quand on quitte la page pendant le calcul ;
//   - résultat : image, date, renommer, réglages d'affichage, téléchargement RGB et bande ;
//   - liste des résultats : recherche, suppression ;
//   - affichage sur téléphone (en anglais seulement) ;
//   - aucun texte non traduit, aucune erreur JavaScript.
//
// SESSION UNIQUE : une seconde connexion au même compte déconnecte la première.
//
// Les parties connectées ont besoin de deux variables : NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD.
// Sans elles, seules les pages publiques sont testées.
//
// IMPORTANT : le compte doit être réservé aux tests. Au début et à la fin de chaque parcours, le test
// EFFACE tous ses instruments (sauf l'exemple) et tous ses résultats. Garde-fou : l'adresse du compte
// doit contenir « test », sinon le test refuse de tourner.
// ============================================================================
const { test, expect } = require("@playwright/test");
const fs = require("fs");

const EMAIL = process.env.NYSA_TEST_EMAIL;
const PASSWORD = process.env.NYSA_TEST_PASSWORD;
const BASE_URL = process.env.NYSA_URL || "https://nysa-imaging.com";

// Textes attendus, dans chaque langue (repris de i18n.js).
const STR = {
  en: {
    myInstruments: "My instruments", newSim: "New simulation", myResults: "My results", resultDefault: "Result",
    simRunning: "Simulation running", simDone: "Simulation complete", demoDone: "Simulation complete.",
    runBtn: "Run simulation", leaveTitle: "Simulation in progress", stay: "Stay here",
    active: "Active", draft: "Draft", wrongPwd: "Incorrect email or password.", mismatch: "The two passwords do not match.",
    forgotSent: "If an account exists", otherDevice: "You were signed out because this account was used on another device",
    dlRgb: "Download RGB image", dlRed: "Download Red band", fileRed: "Red", fmcOne: "1.00", minFmc: "At least",
    tdiHelp: "1 = no TDI", between: "Between 380 and 900 km.", noResult: "No saved result yet", reportDone: "Thank you, it was sent",
  },
  fr: {
    myInstruments: "Mes instruments", newSim: "Nouvelle simulation", myResults: "Mes résultats", resultDefault: "Résultat",
    simRunning: "Simulation en cours", simDone: "Simulation terminée", demoDone: "Simulation terminée.",
    runBtn: "Lancer la simulation", leaveTitle: "Simulation en cours", stay: "Rester ici",
    active: "Actif", draft: "Brouillon", wrongPwd: "E-mail ou mot de passe incorrect.", mismatch: "Les deux mots de passe ne sont pas identiques.",
    forgotSent: "Si un compte existe", otherDevice: "Vous avez été déconnecté car ce compte a été utilisé sur un autre appareil",
    dlRgb: "Télécharger l'image RGB", dlRed: "Télécharger la bande Rouge", fileRed: "Rouge", fmcOne: "1,00", minFmc: "Au moins",
    tdiHelp: "1 = pas de TDI", between: "Entre 380 et 900 km.", noResult: "Aucun résultat sauvegardé", reportDone: "Merci, c'est envoyé",
  },
};

// ---------------------------------------------------------------------------
// Outils communs
// ---------------------------------------------------------------------------
// Erreurs JavaScript, et textes de traduction manquants (le site écrit « Texte manquant » dans la console).
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (/Texte manquant/.test(m.text())) errors.push("traduction manquante : " + m.text()); });
  return errors;
}

// Nom interne d'un texte non traduit, tel qu'il s'afficherait à l'écran (par exemple « res.download.rgb »).
const RAW_KEY = /\b(?:home|res|sim|login|nav|field|settings|sub|inst|common|time|help|beta|menu|paywall|api|demo|band|block|lang|pwd|activity|top|auth|onb)\.[a-z0-9_]+(?:\.[a-z0-9_]+)*\b/;

async function loginAs(page, lang) {
  await page.goto(`/login.html?lang=${lang}`);
  await page.locator("#loginEmail").fill(EMAIL);
  await page.locator("#loginPassword").fill(PASSWORD);
  await page.locator("#loginForm .submitbtn").click();
  await page.waitForURL("**/espace-personnel.html*");
}

// Met l'interface (et la préférence du compte) dans la langue voulue : ?lang= sur une page protégée
// enregistre cette langue comme préférence du compte.
async function useLang(page, lang) {
  await page.goto(`/espace-personnel.html?lang=${lang}`);
  await expect(page.locator("h1")).toHaveText(STR[lang].myInstruments);
}

// Efface tous les instruments (sauf l'exemple) et tous les résultats du compte de test.
async function wipeTestData(page) {
  expect(EMAIL, "garde-fou : l'adresse du compte de test doit contenir « test »").toMatch(/test/i);
  await page.evaluate(async () => {
    const { data: res } = await supabaseClient.from("saved_results").select("*");
    for (const r of res || []) {
      // les fichiers d'abord (image, image source, graphiques par bande), puis la ligne
      const paths = [r.image_path, r.source_image_path];
      for (const band of Object.values((r.diagnostics && r.diagnostics.bands) || {}))
        for (const [k, v] of Object.entries(band)) if (k.endsWith("_path")) paths.push(v);
      const files = paths.filter(Boolean);
      if (files.length) await supabaseClient.storage.from("results").remove(files);
      await supabaseClient.from("saved_results").delete().eq("id", r.id);
    }
    const { data: rep } = await supabaseClient.from("result_reports").select("id,files");
    for (const r of rep || []) {
      const files = (r.files || []).map((f) => f.to).filter(Boolean);
      if (files.length) await supabaseClient.storage.from("reports").remove(files);
      await supabaseClient.from("result_reports").delete().eq("id", r.id);
    }
    const { data: ins } = await supabaseClient.from("instruments").select("id,name");
    for (const i of ins || []) if (!/^(Exemple|Example)/.test(i.name)) await supabaseClient.from("instruments").delete().eq("id", i.id);
  });
}

// Remplit le formulaire de création d'instrument, du minimum nécessaire à un instrument complet.
// mode : "full_scale" (rien d'autre), "detailed" (facteur de conversion, plage ADC) ou "datasheet" (gain global).
async function fillInstrument(page, name, mode) {
  const setField = async (key, value) => {
    const el = page.locator(`#f-${key}`);
    if ((await el.evaluate((e) => e.tagName)) === "SELECT") await el.selectOption(value);
    else await el.fill(value);
    await el.press("Tab");
  };
  const goBlock = async (i) => { await page.locator(".blockbtn").nth(i).click(); };
  await page.locator("#instName").fill(name);
  await goBlock(0); await setField("I", "2.2"); await setField("D", "0.35");
  await goBlock(1); await setField("PX", "4.6");
  await goBlock(2); await setField("ADC", "12"); await setField("FW", "50000"); await setField("electronics_mode", mode);
  if (mode === "detailed") { await setField("CVF_uV_per_e", "60"); await setField("V_range", "1.2"); }
  if (mode === "datasheet") await setField("CWF", "0.012");
}

async function createInstrument(page, name, mode) {
  await page.goto("/creer-instrument.html");
  await fillInstrument(page, name, mode);
  await expect.poll(() => page.evaluate(() => overallPct())).toBe(100);
  await page.locator("#btnSave").click();
  await page.waitForURL("**/espace-personnel.html*");
}

const card = (page, name) => page.locator(".instcard", { hasText: name });

// Lit l'en-tête d'un fichier téléchargé : signature PNG et taille.
async function pngInfo(download) {
  const buf = fs.readFileSync(await download.path());
  return { size: buf.length, signature: Array.from(buf.subarray(0, 4)) };
}

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

  test("la démo n'a plus d'administration et mène au simulateur complet", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/index.html?lang=en");
    await expect(page.locator("#adminTrigger, #adminOverlay, #adminResultPage"), "reste d'administration dans la démo").toHaveCount(0);
    const link = page.locator("#fullSimLink");
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Full simulator →");
    await expect(link).toHaveAttribute("href", "espace-personnel.html");
    await link.click();
    await page.waitForURL(/login\.html|espace-personnel\.html/);          // connexion d'abord pour un visiteur
    await page.goto("/index.html?lang=fr");
    await expect(page.locator("#fullSimLink")).toHaveText("Simulateur complet →");
    expect(errors).toEqual([]);
  });

  for (const lang of ["en", "fr"]) {
    test(`la démo calcule une vraie simulation (${lang})`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(`/index.html?lang=${lang}`);
      await page.locator("#simBtn").click();
      await expect(page.locator(".prog-note").first(), "la démo doit annoncer la fin du calcul").toHaveText(STR[lang].demoDone, { timeout: 4 * 60 * 1000 });
      expect(errors).toEqual([]);
    });
  }

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
      await expect(page.locator("main")).toContainText("989 424 403 00016");
      await expect(page.locator("main")).toContainText("Croix Nivert");
      await expect(page.locator(".todo"), "passage à compléter resté dans la page").toHaveCount(0);
      await page.goto(`/confidentialite.html?lang=${lang}`);
      await expect(page.locator("main")).toContainText("contact@nysa-imaging.com");
      await expect(page.locator(".todo")).toHaveCount(0);
      await expect(page.locator(".draft"), "bandeau « projet » resté dans la page").toHaveCount(0);
    }
  });

  test("la connexion : langue, mot de passe oublié et conditions", async ({ page }) => {
    await page.goto("/login.html?lang=en");
    await expect(page.locator("#forgotLink")).toHaveText("Forgot your password?");
    await page.locator(".tab[data-view='signup']").click();
    await expect(page.locator("#signupLang")).toHaveValue("en");
    await expect(page.locator("#signupPassword2")).toBeVisible();
    await expect(page.locator(".legalnote a")).toHaveCount(2);
    // changer de langue sur la page, et la retrouver après rechargement
    await page.locator("[data-lang-switch] button", { hasText: "FR" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  for (const lang of ["en", "fr"]) {
    test(`la connexion refuse un mauvais mot de passe (${lang})`, async ({ page }) => {
      await page.goto(`/login.html?lang=${lang}`);
      await page.locator("#loginEmail").fill("personne-e2e@example.com");
      await page.locator("#loginPassword").fill("pas-le-bon-mot-de-passe");
      await page.locator("#loginForm .submitbtn").click();
      await expect(page.locator("#loginMsg")).toContainText(STR[lang].wrongPwd);
      await expect(page).toHaveURL(/login\.html/);
    });

    test(`l'inscription contrôle les mots de passe (${lang})`, async ({ page }) => {
      await page.goto(`/login.html?lang=${lang}`);
      await page.locator(".tab[data-view='signup']").click();
      await page.locator("#signupEmail").fill(`personne-${Date.now()}@example.com`);
      await page.locator("#signupPassword").fill("Premier-mot-de-passe-1");
      await page.locator("#signupPassword2").fill("Deuxieme-mot-de-passe-2");
      await page.locator("#signupForm .submitbtn").click();
      await expect(page.locator("#signupMsg")).toContainText(STR[lang].mismatch);
      await expect(page).toHaveURL(/login\.html/);
    });

    test(`le mot de passe oublié répond sans révéler si l'adresse existe (${lang})`, async ({ page }) => {
      await page.goto(`/login.html?lang=${lang}`);
      await page.locator("#forgotLink").click();
      await page.locator("#forgotEmail").fill(`personne-${Date.now()}@example.com`);   // adresse inconnue : aucun e-mail n'est envoyé
      await page.locator("#forgotForm .submitbtn").click();
      await expect(page.locator("#forgotMsg")).toContainText(STR[lang].forgotSent);
    });
  }

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
// Parcours connecté, joué en anglais puis en français
// ---------------------------------------------------------------------------
for (const lang of ["en", "fr"]) {
  const S = STR[lang];

  test.describe.serial(`Parcours connecté (${lang})`, () => {
    test.skip(!EMAIL || !PASSWORD, "NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD ne sont pas définis");

    /** @type {import('@playwright/test').Page} */
    let page;
    let errors;
    let resultId = null;
    let promptValue;                       // texte que le test saisit quand la page ouvre une boîte « renommer »
    const NAME = { full: `e2e-complet-${lang}`, detailed: "e2e-detaille", datasheet: "e2e-fiche", draft: "e2e-brouillon", renamed: `e2e-renomme-${lang}`, result: `e2e-resultat-${lang}` };

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({ baseURL: BASE_URL, acceptDownloads: true, viewport: { width: 1440, height: 900 } });
      page = await context.newPage();
      errors = watchErrors(page);
      page.on("dialog", async (d) => { await d.accept(d.type() === "prompt" ? (promptValue || "e2e") : undefined); });
    });

    test.afterAll(async () => {
      // Nettoyage : tout ce que le parcours a créé, même s'il s'est arrêté en route ; puis retour à l'anglais.
      try {
        await page.goto("/espace-personnel.html");
        await wipeTestData(page);
        if (lang !== "en") await useLang(page, "en");
      } catch (e) { console.warn("Nettoyage impossible :", e.message); }
      await page.context().close();
    });

    test("connexion, langue du compte et nettoyage", async () => {
      await loginAs(page, lang);
      await useLang(page, lang);
      await wipeTestData(page);
      await expect(page.locator("#userEmail")).toHaveText(EMAIL);
    });

    test("espace personnel : instrument d'exemple, accès bêta, réglages", async () => {
      await page.goto("/espace-personnel.html");
      await expect(page.locator(".instcard:not(.empty):not(.draft)").first(), "l'instrument d'exemple doit exister").toBeVisible({ timeout: 30 * 1000 });
      // filtre des instruments : une recherche sans résultat, puis retour à la liste ; plus de cloche, de comparateur ni de « tout supprimer »
      await page.locator("#fInstSearch").fill("zzz-aucun-instrument");
      await expect(page.locator(".instcard:not(.empty)")).toHaveCount(0);
      await expect(page.locator(".instcard.empty")).toBeVisible();
      await page.locator("#fInstSearch").fill("");
      await expect(page.locator(".instcard:not(.empty)").first()).toBeVisible();
      await expect(page.locator("[aria-label='Notifications'], #btnDeleteAllInst, #tabsHost")).toHaveCount(0);
      await expect(page.locator(".sidebar a[href='simulations.html']")).toBeVisible();
      await expect(page.locator(".sidebar a.soon", { hasText: /Comparat/i })).toHaveCount(0);
      await page.goto("/espace-personnel.html?settings=1");
      await expect(page.locator("#settingsSubStatusText")).toHaveText(S.active);
      await expect(page.locator("#settingsLang")).toHaveValue(lang);
      await page.locator("#settingsCloseBtn").click();
    });

    if (lang === "en") {
      test("changer de langue depuis les réglages, puis revenir", async () => {
        await page.goto("/espace-personnel.html?settings=1");
        await page.locator("#settingsLang").selectOption("fr");
        await expect(page.locator("h1")).toHaveText(STR.fr.myInstruments);
        await page.goto("/espace-personnel.html?settings=1");
        await expect(page.locator("#settingsLang")).toHaveValue("fr");
        await page.locator("#settingsLang").selectOption("en");
        await expect(page.locator("h1")).toHaveText(STR.en.myInstruments);
        // attendre que la langue soit bien enregistrée sur le compte
        await expect(async () => {
          await page.goto("/espace-personnel.html?settings=1");
          await expect(page.locator("#settingsLang")).toHaveValue("en");
        }).toPass({ timeout: 20000 });
      });
    }

    test("création d'instruments : un complet par mode d'électronique", async () => {
      await createInstrument(page, NAME.full, "full_scale");
      await expect(card(page, NAME.full)).toContainText("100");
      if (lang === "en") {
        await createInstrument(page, NAME.detailed, "detailed");
        await createInstrument(page, NAME.datasheet, "datasheet");
        await expect(card(page, NAME.detailed)).toContainText("100");
        await expect(card(page, NAME.datasheet)).toContainText("100");
      }
    });

    if (lang === "en") {
      test("création d'un brouillon : enregistré incomplet, retrouvé tel quel", async () => {
        await page.goto("/creer-instrument.html");
        await page.locator("#instName").fill(NAME.draft);
        await page.locator(".blockbtn").nth(0).click();
        await page.locator("#f-I").fill("3.1");
        await page.locator("#f-I").press("Tab");
        await page.locator("#btnSave").click();
        await page.waitForURL("**/espace-personnel.html*");
        const c = card(page, NAME.draft);
        await expect(c).toBeVisible();
        await expect(c).toContainText(S.draft);
        await c.click();                                         // rouvre le brouillon dans le formulaire
        await page.waitForURL("**/creer-instrument.html*");
        await page.locator(".blockbtn").nth(0).click();
        await expect(page.locator("#f-I")).toHaveValue("3.1");
      });

      test("menu d'un instrument : renommer, dupliquer, supprimer", async () => {
        await page.goto("/espace-personnel.html");
        promptValue = NAME.renamed;
        const c = card(page, NAME.full);
        await c.locator("[data-menu-toggle]").click();
        await c.locator("[data-action='rename']").click();
        await expect(card(page, NAME.renamed)).toBeVisible();
        await card(page, NAME.renamed).locator("[data-menu-toggle]").click();
        await card(page, NAME.renamed).locator("[data-action='duplicate']").click();
        await expect(page.locator(".instcard", { hasText: NAME.renamed })).toHaveCount(2);
        // suppression (avec confirmation) des deux
        for (let i = 0; i < 2; i++) {
          const first = page.locator(".instcard", { hasText: NAME.renamed }).first();
          await first.locator("[data-menu-toggle]").click();
          await first.locator("[data-action='delete']").click();
          await expect(page.locator(".instcard", { hasText: NAME.renamed })).toHaveCount(1 - i);
        }
        await expect(page.locator(".instcard", { hasText: NAME.renamed })).toHaveCount(0);
        promptValue = undefined;
      });
    }

    test("conditions d'acquisition : minimum à FMC = 1, bornes, frappe, bulles d'aide", async () => {
      await page.goto("/simulations.html");
      await expect(page.locator("h1")).toHaveText(S.newSim);
      await expect(page.locator("#instList .instoption").first()).toBeAttached({ timeout: 30 * 1000 });
      await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
      await page.locator("#panelActionBtn").click();
      await page.locator("#instList .instoption", { hasText: /Exemple|Example/ }).click();
      await page.locator("#panelActionBtn").click();
      // valeurs par défaut : temps minimal, donc FMC = 1, bouton actif
      await expect(page.locator("#fmcVal")).toContainText(S.fmcOne);
      await expect(page.locator("#panelActionBtn")).toBeEnabled();
      // temps d'intégration trop court : erreur et bouton grisé
      await page.locator("#fTI").fill("20");
      await page.locator("#fTI").press("Tab");
      await expect(page.locator("#errTI")).toContainText(S.minFmc);
      await expect(page.locator("#panelActionBtn")).toBeDisabled();
      // altitude hors bornes
      await page.locator("#fH").fill("5000");
      await page.locator("#fH").press("Tab");
      await expect(page.locator("#errH")).toContainText(S.between);
      await page.locator("#fH").fill("500");
      await page.locator("#fH").press("Tab");
      // la frappe est limitée aux chiffres
      await page.locator("#fTDI").fill("");
      await page.locator("#fTDI").click();
      await page.keyboard.type("a-e+3");
      await expect(page.locator("#fTDI")).toHaveValue("3");
      await page.locator("#fTDI").fill("1");
      await page.locator("#fTDI").press("Tab");
      // retour à un temps valide : le bouton se réactive
      await page.locator("#fTI").fill("400");
      await page.locator("#fTI").press("Tab");
      await expect(page.locator("#panelActionBtn")).toBeEnabled();
      // bulles d'aide
      await page.locator("[data-bubble='tdi']").click();
      await expect(page.locator(".bubble")).toContainText(S.tdiHelp);
      await page.keyboard.press("Escape");
      await expect(page.locator(".bubble")).toHaveCount(0);
      await page.locator("[data-bubble='fmc']").click();
      await expect(page.locator(".bubble")).toBeVisible();
      await page.keyboard.press("Escape");
    });

    test("administration : invisible et inutilisable pour un compte ordinaire", async () => {
      await page.goto("/simulations.html");
      await expect(page.locator("#instList .instoption").first()).toBeAttached({ timeout: 30 * 1000 });
      await expect(page.locator("#adminBox"), "les outils d'administration ne doivent pas apparaître").toBeHidden();
      // le contrôle qui compte est côté serveur : un jeton ordinaire est refusé sur la route d'administration
      const status = await page.evaluate(async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const r = await fetch(API_URL + "/simulate_admin", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.access_token },
          body: JSON.stringify({ scene: "x", paramFile: {}, perfoCsv: null }),
        });
        return r.status;
      });
      expect(status, "/simulate_admin doit refuser un compte ordinaire").toBe(403);
    });

    test("simulation complète, avec l'avertissement quand on quitte la page", async () => {
      await page.goto("/simulations.html");
      await expect(page.locator(".scenecard").first()).toBeVisible();
      await expect(page.locator("#instList .instoption").first()).toBeAttached({ timeout: 30 * 1000 });
      await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
      await page.locator("#panelActionBtn").click();
      await page.locator("#instList .instoption", { hasText: /Exemple|Example/ }).click();
      await page.locator("#panelActionBtn").click();
      await expect(page.locator("#fmcVal")).toContainText(S.fmcOne);
      await expect(page.locator("#panelActionBtn")).toBeEnabled();
      await expect(page.locator("#panelActionBtn")).toContainText(S.runBtn);
      await page.locator("#panelActionBtn").click();

      // pendant le calcul : un clic dans le menu ouvre la fenêtre de choix
      await expect(page.locator("#statText")).toHaveText(S.simRunning);
      await page.locator(".sidebar a[href='resultats.html']").click();
      await expect(page.locator(".leaveov")).toBeVisible();
      await expect(page.locator("#leaveTitle")).toHaveText(S.leaveTitle);
      await expect(page.locator(".leaveov button")).toHaveCount(3);
      await page.locator("#leaveStay").click();
      await expect(page.locator(".leaveov")).toHaveCount(0);
      // « nouvel onglet » : la page demandée s'ouvre à côté, le calcul continue ici
      await page.locator(".sidebar a[href='resultats.html']").click();
      const [popup] = await Promise.all([page.context().waitForEvent("page"), page.locator("#leaveNewTab").click()]);
      await popup.waitForLoadState();
      expect(popup.url()).toContain("resultats.html");
      await popup.close();

      // le calcul se termine et se sauvegarde dans l'onglet d'origine
      const link = page.locator("a.viewresultsbtn");
      await expect(link, "la simulation doit se terminer et se sauvegarder").toBeVisible({ timeout: 6 * 60 * 1000 });
      await expect(page.locator("#statText")).toHaveText(S.simDone);
      resultId = new URL(await link.getAttribute("href"), page.url()).searchParams.get("id");
      expect(resultId, "identifiant du résultat sauvegardé").toBeTruthy();
      await link.click();
    });

    test("page du résultat : image, date, réglages d'affichage, renommage", async () => {
      await page.waitForURL("**/resultats.html?id=*");
      await expect(page.locator("#resTitle")).not.toHaveText(S.resultDefault);
      await expect(page.locator("#resSub")).toContainText("20");              // date écrite en clair
      await expect.poll(async () => page.locator("#imgSim").evaluate((img) => img.complete && img.naturalWidth), { timeout: 30 * 1000 }).toBeGreaterThan(0);
      const tabs = page.locator("#restabsHost button");
      await expect(tabs).toHaveCount(4);
      await tabs.nth(1).click();
      await expect(page.locator(".tabpanel.current")).toContainText("MTF");
      await tabs.nth(2).click();
      await expect(page.locator(".tabpanel.current")).toContainText("SNR");
      await tabs.nth(3).click();
      await expect(page.locator("#entInstConfig")).toContainText("iFoV");
      await tabs.nth(0).click();
      // réglages d'affichage : ils ne doivent pas casser la page
      await page.locator("#satChk").check();
      await page.locator("#resetDisplayBtn").click();
      // renommer le résultat
      promptValue = NAME.result;
      await page.locator("#btnRenameResult").click();
      await expect(page.locator("#resTitle")).toHaveText(NAME.result);
      promptValue = undefined;
    });

    test("téléchargement de la composition RGB et d'une bande", async () => {
      await expect(page.locator("#downloadLabel")).toHaveText(S.dlRgb);
      let [download] = await Promise.all([page.waitForEvent("download"), page.locator("#downloadBtn").click()]);
      expect(download.suggestedFilename()).toMatch(/^RGB_e2e-resultat-\w+_\d{4}-\d{2}-\d{2}_\d{4}\.png$/);
      let h = await pngInfo(download);
      expect(h.signature, "le fichier doit être un PNG").toEqual([137, 80, 78, 71]);
      expect(h.size).toBeGreaterThan(1000);
      await page.locator(".bandthumb[data-key='R']").click();
      await expect(page.locator("#downloadLabel")).toHaveText(S.dlRed);
      [download] = await Promise.all([page.waitForEvent("download"), page.locator("#downloadBtn").click()]);
      expect(download.suggestedFilename()).toMatch(new RegExp(`^${S.fileRed}_e2e-resultat-\\w+_\\d{4}-\\d{2}-\\d{2}_\\d{4}\\.png$`));
      h = await pngInfo(download);
      expect(h.signature).toEqual([137, 80, 78, 71]);
      expect(h.size).toBeGreaterThan(500);
    });

    test("signaler un problème : consentement obligatoire, envoi, retrait", async () => {
      await page.goto(`/resultats.html?id=${resultId}`);
      await page.locator("#btnReport").click();
      await expect(page.locator("#reportOverlay")).toBeVisible();
      await expect(page.locator("#rptSend"), "l'envoi doit être impossible sans message ni consentement").toBeDisabled();
      await page.locator("#rptMsg").fill("e2e : la MTF me paraît trop haute");
      await expect(page.locator("#rptSend"), "un message ne suffit pas : la case de consentement est obligatoire").toBeDisabled();
      await page.locator("#rptConsent").check();
      await expect(page.locator("#rptSend")).toBeEnabled();
      await page.locator("#rptSend").click();
      await expect(page.locator("#rptDone")).toBeVisible({ timeout: 60 * 1000 });
      await expect(page.locator("#rptDone h3")).toHaveText(S.reportDone);
      const mine = await page.evaluate(async () => (await supabaseClient.from("result_reports").select("id")).data.length);
      expect(mine, "le signalement doit être enregistré").toBe(1);
      await page.locator("#rptWithdraw").click();
      await expect(page.locator("#rptWithdraw")).toBeHidden();
      await expect.poll(async () => page.evaluate(async () => (await supabaseClient.from("result_reports").select("id")).data.length)).toBe(0);
      await page.locator("#rptClose").click();
      await expect(page.locator("#reportOverlay")).toBeHidden();
    });

    test("la page d'administration est refusée à un compte ordinaire", async () => {
      await page.goto("/admin.html");
      await expect(page).toHaveURL(/espace-personnel\.html/);
      await expect(page.locator("#navAdminItem"), "le lien Administration ne doit pas apparaître").toBeHidden();
    });

    test("liste des résultats : recherche, puis suppression", async () => {
      await page.goto("/resultats.html");
      await expect(page.locator("#listView h1")).toHaveText(S.myResults);   // la page contient deux h1 : liste et détail
      const row = page.locator(`.resultrow[data-id="${resultId}"]`);
      await expect(row).toBeVisible();
      await expect(page.locator("#fCount")).toContainText("1");
      await page.locator("#fSearch").fill("zzz-introuvable-zzz");
      await expect(row).toBeHidden();                              // la recherche masque les lignes sans les retirer
      await expect(page.locator("#fCount")).toContainText("0");
      await page.locator("#fSearch").fill("e2e-resultat");
      await expect(row).toBeVisible();
      await page.locator("#fSearch").fill("");
      await row.locator(".menubtn").click();
      await row.locator("[data-act='delete']").click();
      await expect(row).toHaveCount(0);
      resultId = null;
      await expect(page.locator("#listView")).toContainText(S.noResult);
    });

    if (lang === "en") {
      test("affichage sur téléphone : menu repliable, pas de débordement", async () => {
        await page.setViewportSize({ width: 390, height: 800 });
        for (const p of ["/espace-personnel.html", "/simulations.html", "/resultats.html"]) {
          await page.goto(p);
          await expect(page.locator(".menutoggle")).toBeVisible();
          const sidebarRight = await page.locator(".sidebar").evaluate((e) => e.getBoundingClientRect().right);
          expect(sidebarRight, `le menu doit être hors de l'écran sur ${p}`).toBeLessThanOrEqual(0);
          await page.locator(".menutoggle").click();
          await expect(page.locator(".sidebar")).toBeInViewport();
          await page.keyboard.press("Escape");
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(overflow, `la page ${p} déborde en largeur sur téléphone`).toBeLessThanOrEqual(1);
        }
        await page.setViewportSize({ width: 1440, height: 900 });
      });
    }

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
}

// ---------------------------------------------------------------------------
// Session unique
// ---------------------------------------------------------------------------
test.describe("Session unique", () => {
  test.skip(!EMAIL || !PASSWORD, "NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD ne sont pas définis");

  test("une seconde connexion déconnecte la première", async ({ browser }) => {
    const open = async () => browser.newContext({ baseURL: BASE_URL, viewport: { width: 1440, height: 900 } });
    const ctxA = await open();
    const ctxB = await open();
    try {
      const a = await ctxA.newPage();
      await loginAs(a, "en");
      await useLang(a, "en");
      await expect(a.locator("h1")).toHaveText(STR.en.myInstruments);
      const b = await ctxB.newPage();
      await loginAs(b, "en");                                   // seconde connexion, ailleurs
      await useLang(b, "en");
      await expect(b.locator("h1")).toHaveText(STR.en.myInstruments);
      await a.goto("/espace-personnel.html");                    // la première session est refusée
      await expect(a).toHaveURL(/login\.html\?reason=other_device/);
      await expect(a.locator("#authArea .msg.err").first()).toContainText(STR.en.otherDevice);   // bandeau en haut de la zone de connexion
      await b.goto("/espace-personnel.html");                    // la seconde reste connectée
      await expect(b.locator("h1")).toHaveText(STR.en.myInstruments);
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});

// ---------------------------------------------------------------------------
// Tutoriel d'accueil (onboarding), joué une fois en anglais, avec une vraie simulation
// ---------------------------------------------------------------------------
test.describe.serial("Tutoriel d'accueil", () => {
  test.skip(!EMAIL || !PASSWORD, "NYSA_TEST_EMAIL et NYSA_TEST_PASSWORD ne sont pas définis");
  test.setTimeout(10 * 60 * 1000);

  /** @type {import('@playwright/test').Page} */
  let page;
  let errors;
  const bubble = () => page.locator(".onb-bubble");
  const step = (n) => expect(bubble()).toContainText(`Step ${n} of 12`);

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1440, height: 900 } });
    page = await context.newPage();
    errors = watchErrors(page);
    await loginAs(page, "en");
    await useLang(page, "en");
    await wipeTestData(page);
  });

  test.afterAll(async () => {
    try {
      await page.goto("/espace-personnel.html");
      await wipeTestData(page);
    } catch (e) { console.warn("Nettoyage impossible :", e.message); }
    await page.context().close();
  });

  test("on peut quitter le tutoriel à tout moment, et le relancer depuis les réglages", async () => {
    await page.goto("/espace-personnel.html?settings=1");
    await page.locator("#settingsTourBtn").click();
    await step(1);
    await page.locator(".onb-bubble .onb-link").click();
    await expect(bubble()).toHaveCount(0);
    // quitté : il ne revient pas tout seul au rechargement
    await page.reload();
    await expect(page.locator("h1")).toHaveText(STR.en.myInstruments);
    await expect(bubble()).toHaveCount(0);
  });

  test("parcours complet : instruments, simulation, résultat, curseur, onglets", async () => {
    await page.goto("/espace-personnel.html?settings=1");
    await page.locator("#settingsTourBtn").click();
    await step(1);                                                        // instruments : l'exemple est déjà créé
    await page.locator(".onb-bubble .onb-btn.primary").click();
    await step(2);                                                        // menu : Simulations
    await page.locator(".sidebar a[href='simulations.html']").click();
    await step(3);                                                        // l'utilisateur choisit sa scène
    await page.locator(".scenecard").nth(1).click();
    await expect(bubble()).toContainText("Next");
    await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
    await page.locator("#panelActionBtn").click();
    await step(4);                                                        // instrument (déjà sélectionné)
    await expect(page.locator("#panelActionBtn")).toBeEnabled({ timeout: 30 * 1000 });
    await page.locator("#panelActionBtn").click();
    await step(5);                                                        // conditions d'acquisition
    await page.locator(".onb-bubble .onb-btn.primary").click();
    await step(6);                                                        // lancement
    await expect(page.locator("#panelActionBtn")).toContainText(STR.en.runBtn);
    await page.locator("#panelActionBtn").click();
    await step(7);                                                        // calcul : explication pendant l'attente
    await expect(bubble()).toContainText("between 1 and 2 minutes");
    const link = page.locator("a.viewresultsbtn");
    await expect(link, "la simulation doit se terminer et se sauvegarder").toBeVisible({ timeout: 6 * 60 * 1000 });
    await step(8);
    await link.click();
    await step(9);                                                        // image simulée + curseur
    const box = await page.locator("#compareWrap").boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(2000);
    await step(9);                                                        // 5 s pour jouer avec le curseur : pas encore passé à la suite
    await step(10);                                                       // onglet MTF (après 5 s)
    await page.locator(".restab[data-tab='mtf']").click();
    await step(11);                                                       // onglet SNR
    await page.locator(".restab[data-tab='snr']").click();
    await step(12);                                                       // indicateurs : dernière étape
    await page.locator(".onb-bubble .onb-btn.primary").click();
    await expect(page.locator(".onb-modal h2")).toHaveText("First simulation complete!");
    await page.locator(".onb-modal .onb-btn").click();
    await expect(page.locator(".onb-modal")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("nysa_onb"))).toBeNull();
  });

  test("aucune erreur JavaScript pendant le tutoriel", async () => {
    expect(errors).toEqual([]);
  });
});
