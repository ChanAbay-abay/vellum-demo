import sys
from PIL import Image, ImageChops
ref=Image.open('reference.jpg').convert('RGBA'); tag=sys.argv[1]
r=Image.open(f'renders/{tag}-solved.png').convert('RGBA')
# 1) render over reference at 60% 2) side-by-side
over=ref.copy(); faded=r.copy(); a=faded.split()[3].point(lambda v:int(v*0.6)); faded.putalpha(a); over.alpha_composite(faded)
over.convert('RGB').save(f'renders/{tag}-overlay.png')
bg=Image.new('RGBA',ref.size,(230,230,230,255)); bg.alpha_composite(r)
sheet=Image.new('RGB',(ref.width*2,ref.height)); sheet.paste(ref.convert('RGB'),(0,0)); sheet.paste(bg.convert('RGB'),(ref.width,0)); sheet.save(f'renders/{tag}-sheet.png')
