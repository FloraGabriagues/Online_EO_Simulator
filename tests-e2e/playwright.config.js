// Réglages des tests automatiques de Nysa.
// Adresse testée : variable NYSA_URL, sinon le site en ligne.
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 8 * 60 * 1000,          // une simulation réelle peut prendre plusieurs minutes
  expect: { timeout: 15 * 1000 },
  fullyParallel: false,            // un seul compte de test, une seule session à la fois
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.NYSA_URL || "https://nysa-imaging.com",
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
