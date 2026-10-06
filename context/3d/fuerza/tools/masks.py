"""Clean binary silhouettes for Tier-1: the skill's mask extractor reads the photo's beige gradient
backdrop as foreground (verified: whole-frame mask), so masks are built here and fed to it instead.
usage: masks.py <ref.jpg> <aligned-render.png> <out-prefix>"""
import sys, colorsys
import numpy as np
from PIL import Image
ref_p, ren_p, out = sys.argv[1:4]
ref = np.asarray(Image.open(ref_p).convert("RGB")).astype(float) / 255
ren = np.asarray(Image.open(ren_p).convert("RGB")).astype(float)
hsv = np.vectorize(colorsys.rgb_to_hsv)
h, s, v = hsv(ref[..., 0], ref[..., 1], ref[..., 2])
red = ((h < 0.05) | (h > 0.93)) & (s > 0.35)
orange = (h >= 0.03) & (h < 0.11) & (s > 0.55)
neutral = (s < 0.13) & (v > 0.15)
dark = v < 0.42
ref_mask = red | orange | neutral | dark
ren_mask = np.abs(ren - 230).max(axis=2) > 3
# Lab canvas footprint inside the aligned frame (the side preset crops the front wheel): compare
# only where the render actually has pixels.
footprint = np.asarray(Image.open(ren_p).convert("RGB")).astype(int)
visible = ~((footprint[..., 0] == 230) & (footprint[..., 1] == 230) & (footprint[..., 2] == 230))
cols = np.nonzero(visible.any(axis=0))[0]
ref_mask[:, : cols.min() + 2] = False
ref_mask[:, cols.max() - 2 :] = False
ren_mask[:, cols.max() - 2 :] = False
ren_mask[:, : cols.min() + 2] = False
ren_mask[:400] = False
ren_mask[1100:] = False
ref_mask[1030:] = False  # ground shadow band in the photo
for name, m in (("ref", ref_mask), ("render", ren_mask)):
    Image.fromarray(np.where(m, 0, 255).astype(np.uint8)).convert("RGB").save(f"{out}-mask-{name}.png")
inter = (ref_mask & ren_mask).sum(); union = (ref_mask | ren_mask).sum()
print("fullres IoU", round(inter / union, 4))
# Thin-structure tolerant variant (spokes/cables are 1-2 px; a 1 px registration error zeroes them):
# both masks dilated by 2 px. Reported alongside the raw IoU, never instead of it.
from PIL import ImageFilter
for name, m in (("ref", ref_mask), ("render", ren_mask)):
    img = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    Image.fromarray(255 - np.asarray(img)).convert("RGB").save(f"{out}-mask-{name}-d2.png")
