"""
Génère les petits JPG d'aperçu du site (assets/scenes/*.jpg + vignettes)
à partir des mêmes fichiers TIF que ceux utilisés côté serveur — recadrés
au CENTRE GÉOMÉTRIQUE du TIF, exactement comme le fait eo_adapter.py par
défaut (row_center=h//2, col_center=w//2). Ça garantit que "image source"
affichée sur le site et l'image réellement utilisée par l'API montrent la
même zone au sol.

Usage (depuis n'importe quel dossier, avec rasterio/Pillow installés) :

    python3 generate_scene_previews.py

Ajuste SCENES ci-dessous si les chemins locaux ou les noms diffèrent.
"""

import os

import numpy as np
import rasterio
from rasterio.windows import Window
from PIL import Image

# URL publique R2 (cf. échanges précédents du projet) — pas de chemin local :
# les TIF sources font 1-2 Go chacun, pas forcément présents sur la machine
# qui lance ce script. rasterio lit en HTTP via /vsicurl/ (lecture fenêtrée
# par plage d'octets, ne télécharge que la zone du crop, pas le fichier
# entier) — corrigé le 01/09/2026, la version précédente supposait un
# fichier local.
R2_BASE_URL = "https://pub-0ded545d97af48d39c393173a8570073.r2.dev"

# (nom_scene, nom_fichier_sur_R2, centre_x_fraction, centre_y_fraction)
# Les fractions par défaut (0.5, 0.5) supposent un export IGN centré sur le
# point d'intérêt — pas toujours vrai (constaté sur "port", décentré) :
# repérer la vraie position avec preview_full_scene.py si l'aperçu généré
# ici tombe à côté, puis ajuster la fraction correspondante ci-dessous.
#
# IMPORTANT : ces fractions doivent rester EXACTEMENT synchronisées avec
# SCENE_CENTER_FRAC dans eo_adapter.py (côté serveur) — sinon l'aperçu généré
# ici et le crop réellement utilisé par l'API ne montrent plus la même zone.
# Corrigé le 01/09/2026 : "port" utilisait (0.486, 0.508) ici contre
# (0.48, 0.5) côté serveur — écart minime mais réel, aligné maintenant.
SCENES = [
    ("aix",   "2023_IGN_RGB_AIX_5km.tif",   0.5,  0.5),
    ("avion", "2023_IGN_RGB_AVION_5km.tif", 0.5,  0.5),
    ("port",  "2023_IGN_RGB_PORT_5km.tif",  0.48, 0.5),
]

OUT_DIR = "assets/scenes"  # relatif au dossier Online_EO_Simulator

# Emprise 200.0 x 200.0 m — DOIT correspondre exactement à CORE_FOOTPRINT_M
# dans eo_adapter.py (empreinte physique fixe côté serveur pour le mode
# public, quels que soient les curseurs). Corrigé le 01/09/2026 : cette
# constante valait 258.0 x 188.6 auparavant, ne correspondant à rien de
# précis côté serveur — d'où le décalage entre l'image source affichée et
# le résultat /simulate (deux crops différents de la même scène).
EXT_W_M = 200.0
EXT_H_M = 200.0
RES_M = 0.2  # résolution native IGN, m/px — doit rester synchronisée avec GSD_SOURCE côté serveur
THUMB_PX = 200  # vignette carrée, un peu plus grande que les 38-92px affichés, pour rester nette


def export_scene(name, filename, cx_frac=0.5, cy_frac=0.5):
    url = f"/vsicurl/{R2_BASE_URL}/{filename}"

    crop_w_px = int(round(EXT_W_M / RES_M))
    crop_h_px = int(round(EXT_H_M / RES_M))

    print(f"[...] {name} : lecture distante depuis {R2_BASE_URL}/{filename}")
    with rasterio.open(url) as src:
        cx, cy = int(cx_frac * src.width), int(cy_frac * src.height)
        col_off = max(0, cx - crop_w_px // 2)
        row_off = max(0, cy - crop_h_px // 2)
        col_off = min(col_off, src.width - crop_w_px)
        row_off = min(row_off, src.height - crop_h_px)

        window = Window(col_off, row_off, crop_w_px, crop_h_px)
        data = src.read([1, 2, 3], window=window)  # RGB, ignore une éventuelle 4e bande (alpha/NIR)

    # (bands, H, W) -> (H, W, bands), en uint8
    arr = np.transpose(data, (1, 2, 0))
    if arr.dtype != np.uint8:
        # normalisation min/max simple si la source n'est pas déjà en 8 bits
        arr = arr.astype(np.float64)
        lo, hi = np.percentile(arr, (1, 99))
        arr = np.clip((arr - lo) / max(hi - lo, 1e-6) * 255, 0, 255).astype(np.uint8)

    img = Image.fromarray(arr, mode="RGB")

    os.makedirs(OUT_DIR, exist_ok=True)
    full_path = os.path.join(OUT_DIR, f"{name}.jpg")
    thumb_path = os.path.join(OUT_DIR, f"{name}_thumb.jpg")

    img.save(full_path, quality=90)

    # vignette carrée centrée (crop, pas d'écrasement de l'aspect ratio)
    side = min(img.width, img.height)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
    thumb = img.crop((left, top, left + side, top + side)).resize(
        (THUMB_PX, THUMB_PX), Image.LANCZOS
    )
    thumb.save(thumb_path, quality=88)

    print(f"[OK] {name} : {full_path} ({img.width}x{img.height}), {thumb_path}")


if __name__ == "__main__":
    for scene_name, filename, cx_frac, cy_frac in SCENES:
        export_scene(scene_name, filename, cx_frac, cy_frac)
