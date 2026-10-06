"""Diff map of the two masks: red = reference only, blue = render only, black = both."""
import sys
import numpy as np
from PIL import Image, ImageFilter
pre = sys.argv[1]
a = np.asarray(Image.open(f"{pre}-mask-ref.png").convert("L")) < 128
b = np.asarray(Image.open(f"{pre}-mask-render.png").convert("L")) < 128
out = np.full(a.shape + (3,), 255, np.uint8)
out[a & ~b] = (220, 30, 30); out[b & ~a] = (30, 60, 220); out[a & b] = (0, 0, 0)
Image.fromarray(out).save(f"{pre}-xor.png")
def dil(m, r): return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * r + 1))) > 0
for r in (1, 2, 3):
    da, db = dil(a, r), dil(b, r)
    print(f"IoU tolerant r={r}px:", round(((a & db).sum() + (b & da).sum()) / (a.sum() + b.sum()), 4))
