// ===================== INSTRUMENTS "QUICK START" =====================
// Chaque preset décrit un satellite : id (interne), label (affiché), et le
// jeu de valeurs v{...} appliqué aux curseurs de l'instrument.
//
// Unités et bornes des curseurs (pour rester dans les plages valides) :
//   D    Diamètre de pupille        m       0.08 – 1.30
//   I    iFoV                       µrad    0.25 – 20
//   W    WFE RMS (aberration)       nm      0 – 150
//   E    Obscuration centrale       ε       0 – 0.55
//   T    Transmission optique       τ       0.15 – 0.95
//   R    Bruit de lecture           e⁻      1 – 80
//   TI   Temps d'intégration        µs      5 – 2000
//   TDI  Étages TDI                 ×       1 – 64
//   P    PRNU                       %       0 – 5
//   K    Courant d'obscurité        e⁻/s    0 – 4000
//   H    Altitude                   km      380 – 900
//   S    Élévation solaire          °       8 – 80
//   Z    Mode d'aberration          id      "none" | "defoc" | "astig" | "coma" | "spher" | "trefo"
//
// Pour ajouter un satellite : copier un bloc {id, label, v:{...}}, changer
// l'id (unique, sans espace) et le label (affiché dans l'interface), puis
// ajuster les valeurs. Pas besoin de toucher à index.html.

// Chaque preset a aussi un champ "src" : sources/hypothèses affichées via
// le bouton "?" à côté du preset sur le site — brève, factuelle, distingue
// ce qui est confirmé (specs publiées) de ce qui est estimé (jamais
// publié pour aucun système commercial : WFE, bruit détecteur, PRNU,
// courant d'obscurité).

var PRESETS = [
  {id:"pneo", label:"Pléiades Neo",
   v:{D:0.91,E:0.35,W:25,T:0.62,I:1.905,R:12,P:1.60,K:150,H:620,S:45,TI:160,TDI:20,Z:"none",FW:190000},
   src:"D=0.91m et H=620km confirmés (Airbus, ESA). iFoV correspond au canal multispectral publié (1.2m GSD — le 30cm concerne le canal panchromatique, non simulé ici). WFE, bruit détecteur, PRNU : estimations plausibles, non publiées."},
  {id:"newsat", label:"Satellogic NewSat IV",
   v:{D:0.25,E:0.30,W:35,T:0.55,I:2.084,R:18,P:1.50,K:350,H:475,S:45,TI:140,TDI:6,Z:"none",FW:3200},
   src:"H=475km et GSD=0.99m confirmés (Satellogic, eoPortal — NewSat Mark-IV). Diamètre de pupille : estimation (jamais publié officiellement). WFE, bruit détecteur : estimations plausibles."},
  {id:"s2", label:"Sentinel-2",
   v:{D:0.15,E:0.00,W:20,T:0.65,I:12.72,R:8,P:0.60,K:80,H:786,S:45,TI:1505,TDI:1,Z:"none"},
   src:"D=0.15m et H=786km confirmés (ESA, Airbus — télescope TMA 150mm). GSD=10m correspond aux bandes B2/B3/B4/B8 publiées. Bandes spectrales simulées reprennent celles de Pléiades Neo (simplification). Bruit détecteur : estimation."},
  {id:"skysat", label:"Planet SkySat",
   v:{D:0.35,E:0.33,W:30,T:0.60,I:1.806,R:15,P:1.40,K:200,H:475,S:45,TI:100,TDI:1,Z:"none",FW:30000},
   src:"D=0.35m, focale=3.6m, pixel=6.5µm et H=475km confirmés (Planet, eoPortal — télescope Ritchey-Chretien Cassegrain). GSD dérivé ≈0.86m, cohérent avec les ~0.8m publiés. Capture par trames courtes empilées (pas un vrai TDI push-broom) — modélisé ici en TDI=1. Obscuration centrale, WFE, bruit détecteur : estimations plausibles, non publiées."}
];
