// ============================================================================
// Nysa — instrument d'exemple ajouté à chaque nouveau compte.
//
// À sa première visite, un compte sans instrument reçoit celui-ci. Il sert
// de point de départ : l'utilisateur peut l'ouvrir, le modifier, et lancer
// une simulation sans rien saisir.
//
// Pour changer l'exemple : modifier les valeurs ci-dessous. Elles sont
// écrites comme dans le formulaire (mêmes unités, entre guillemets).
// Les comptes qui ont déjà reçu l'exemple ne sont pas modifiés.
// Pour ne plus distribuer d'exemple : retirer ce fichier du site.
//
// VALEURS : choisies par Flora le 06/10/2026 (instrument fictif de type
// très haute résolution). Les supports du miroir secondaire ont été ajoutés
// le même jour. Mis à jour le 09/10/2026 : iFoV 4 µrad, épaisseur des supports 0,05 m.
// Mis à jour le 11/10/2026 : PRNU 1 %, diamètre 0,3 m (aligné sur l'export exemple.json).
// Mis à jour le 12/10/2026 : valeurs de l'export test-1-signal-moyen.json (iFoV 4,2 µrad,
// pixel 4,4 µm, rendement quantique en courbe, full well 20 000 e⁻, bruit de lecture 10 e⁻,
// courant d'obscurité, PRNU et WFE à 0) et transmission du filtre à 1.
// ============================================================================
var NYSA_EXAMPLE_INSTRUMENT = {
  name: {
    fr: "Exemple",
    en: "Example"
  },
  // Pas de description : le nom suffit, et la carte de l'instrument reste sobre.
  config: {
    // --- Optique ---
    I: "4.2",            // iFoV                    [µrad]
    D: "0.3",            // Diamètre de pupille     [m]
    E: "0.1",            // Obscuration centrale    [m]
    NSUP: "3",           // Nombre de supports
    ESUP: "0.03",        // Épaisseur des supports  [m]
    T: "0.80",           // Transmission optique    [0 à 1]
    // --- Détecteur ---
    DET_TYPE: "CMOS",
    PX: "4.4",           // Largeur pixel           [µm]
    // Rendement quantique en courbe (mode « Courbe » : le champ scalaire n'est pas utilisé)
    QE_mode: "curve",
    qeSpectral: [
      { wl: "400", qe: "0.64" },
      { wl: "500", qe: "0.67" },
      { wl: "600", qe: "0.74" },
      { wl: "700", qe: "0.73" },
      { wl: "800", qe: "0.65" }
    ],
    T_filter: "1",       // Transmission du filtre  [0 à 1]
    P: "0",              // PRNU                    [%]
    K: "0",              // Courant d'obscurité     [e⁻/s]
    // --- Électronique ---
    ADC: "12",           // Résolution ADC          [bits]
    FW: "20000",         // Full well               [e⁻]
    R: "10",             // Bruit de lecture        [e⁻]
    electronics_mode: "full_scale",   // pleine échelle ADC = full well : aucun autre champ requis
    // --- Performance WFE ---
    W: "0",              // WFE RMS                 [nm]
    // --- Marqueurs internes ---
    _example: true,      // instrument d'exemple : vignette orange dans la page Simulations
    _draft: false,
    _missing: [],
    _pct: 100
  }
};
