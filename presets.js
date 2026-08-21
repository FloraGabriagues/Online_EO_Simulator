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

var PRESETS = [
  {id:"pneo", label:"Pléiades Neo",
   v:{D:0.91,E:0.35,W:25,T:0.62,I:1.905,R:12,P:1.60,K:150,H:620,S:45,TI:160,TDI:20,Z:"none",FW:190000}},
  {id:"newsat", label:"Satellogic NewSat IV",
   v:{D:0.25,E:0.30,W:35,T:0.55,I:2.084,R:18,P:1.50,K:350,H:475,S:45,TI:140,TDI:6,Z:"none",FW:3200}},
  {id:"s2", label:"Sentinel-2",
   v:{D:0.15,E:0.00,W:20,T:0.65,I:12.72,R:8,P:0.60,K:80,H:786,S:45,TI:1505,TDI:1,Z:"none"}},
  {id:"defocus", label:"Défocus en orbite",
   v:{D:0.91,E:0.35,W:110,T:0.62,I:1.905,R:12,P:1.60,K:150,H:620,S:45,TI:160,TDI:20,Z:"defoc",FW:190000}},
  {id:"lowsun", label:"Angle solaire faible",
   v:{D:0.91,E:0.35,W:25,T:0.62,I:1.905,R:12,P:1.60,K:150,H:620,S:12,TI:160,TDI:20,Z:"none",FW:190000}}
];
