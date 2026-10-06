"""Rescale a lab side render (FOV 14, cam z 7.5, target y 0.45) into reference pixel space.
Writes <out>-aligned.png (render in ref frame), <out>-overlay.png (50% blend), <out>-sbs.png (side by side)."""
import math, sys
from PIL import Image
ref_path, render_path, out = sys.argv[1:4]
ref = Image.open(ref_path).convert("RGB")
ren = Image.open(render_path).convert("RGB")
W, H = ren.size
px_per_m_render = H / (2 * 7.5 * math.tan(math.radians(7)))
px_per_m_ref, ref_ground, ref_bb_x = 579.0, 1017.0, 485.0
s = px_per_m_ref / px_per_m_render
ren_s = ren.resize((round(W * s), round(H * s)), Image.LANCZOS)
cx, cy = ref_bb_x, ref_ground - 0.45 * px_per_m_ref
canvas = Image.new("RGB", ref.size, (230, 230, 230))
canvas.paste(ren_s, (round(cx - W * s / 2), round(cy - H * s / 2)))
canvas.save(out + "-aligned.png")
Image.blend(ref, canvas, 0.5).save(out + "-overlay.png")
sbs = Image.new("RGB", (ref.width * 2 + 10, ref.height), "white")
sbs.paste(ref, (0, 0)); sbs.paste(canvas, (ref.width + 10, 0)); sbs.save(out + "-sbs.png")
