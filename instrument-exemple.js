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
// le même jour.
// ============================================================================
var NYSA_EXAMPLE_INSTRUMENT = {
  name: {
    fr: "Exemple : instrument de référence",
    en: "Example: reference instrument"
  },
  description: {
    fr: "Instrument d'exemple, du type satellite à très haute résolution. Ouvrez-le pour voir comment il est décrit, ou lancez directement une simulation.",
    en: "Example instrument, of the very-high-resolution satellite type. Open it to see how it is described, or run a simulation right away."
  },
  config: {
    // --- Optique ---
    I: "2.2",            // iFoV                    [µrad]
    D: "0.35",           // Diamètre de pupille     [m]
    E: "0.1",            // Obscuration centrale    [m]
    NSUP: "3",           // Nombre de supports               À VALIDER
    ESUP: "0.005",       // Épaisseur des supports  [m]      À VALIDER
    T: "0.80",           // Transmission optique    [0 à 1]
    // --- Détecteur ---
    DET_TYPE: "CMOS",
    PX: "4.6",           // Largeur pixel           [µm]
    QE: "0.75",          // Rendement quantique     [0 à 1]
    P: "1.6",            // PRNU                    [%]
    K: "150",            // Courant d'obscurité     [e⁻/s]
    // --- Électronique ---
    ADC: "12",           // Résolution ADC          [bits]
    FW: "50000",         // Full well               [e⁻]
    R: "12",             // Bruit de lecture        [e⁻]
    electronics_mode: "full_scale",   // pleine échelle ADC = full well : aucun autre champ requis
    // --- Performance WFE ---
    W: "25",             // WFE RMS                 [nm]
    // --- Marqueurs internes ---
    _example: true,      // instrument d'exemple : vignette orange dans la page Simulations
    _draft: false,
    _missing: [],
    _pct: 100
  }
};
