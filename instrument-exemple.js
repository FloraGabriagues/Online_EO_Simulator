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
// VALEURS : reprises du préréglage « Pléiades Neo » de la démo (presets.js)
// pour l'optique et le bruit ; les autres sont des valeurs courantes, à
// valider.
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
    I: "1.905",          // iFoV                    [µrad]   préréglage Pléiades Neo
    D: "0.91",           // Diamètre de pupille     [m]      préréglage Pléiades Neo
    E: "0.3185",         // Obscuration centrale    [m]      préréglage Pléiades Neo
    T: "0.62",           // Transmission optique    [0 à 1]  préréglage Pléiades Neo
    // --- Détecteur ---
    DET_TYPE: "CMOS",
    PX: "10",            // Largeur pixel           [µm]     valeur par défaut de la démo
    QE: "0.65",          // Rendement quantique     [0 à 1]  À VALIDER
    P: "1.6",            // PRNU                    [%]      préréglage Pléiades Neo
    K: "150",            // Courant d'obscurité     [e⁻/s]   préréglage Pléiades Neo
    // --- Électronique ---
    ADC: "12",           // Résolution ADC          [bits]   À VALIDER
    FW: "190000",        // Full well               [e⁻]     préréglage Pléiades Neo
    R: "12",             // Bruit de lecture        [e⁻]     préréglage Pléiades Neo
    electronics_mode: "full_scale",   // pleine échelle ADC = full well : aucun autre champ requis
    // --- Performance WFE ---
    W: "25",             // WFE RMS                 [nm]     préréglage Pléiades Neo
    // --- État du formulaire : instrument complet ---
    _draft: false,
    _missing: [],
    _pct: 100
  }
};
