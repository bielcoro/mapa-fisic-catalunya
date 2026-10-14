"""
Genera public/mapa-sense-etiquetes.jpg a partir de public/mapa.jpg.

Detecta els píxels de text (més foscos que el seu entorn i poc saturats, o text blau
sobre el mar), els esborra i els omple amb el color dels voltants. Així el relleu i
els colors hipsomètrics es mantenen, però els noms desapareixen per als exercicis.

Ús:  python3 scripts/generar_mapa_sense_etiquetes.py public/mapa.jpg public/mapa-sense-etiquetes.jpg 14 150
     (els dos últims valors: contrast mínim respecte de l'entorn i saturació màxima del text)
Requereix: pillow i numpy.
"""
import numpy as np, sys
from PIL import Image, ImageFilter
im=Image.open(sys.argv[1]).convert('RGB')
a=np.asarray(im).astype(np.float32)
hsv=np.asarray(im.convert('HSV')).astype(np.float32)
L=a.mean(2); sat=hsv[...,1]
r,g,b=a[...,0],a[...,1],a[...,2]
def box(x,r):
  p=np.pad(x,((r+1,r),(r+1,r)),mode='edge')
  c=p.cumsum(0).cumsum(1)
  k=2*r+1
  return (c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,k:]*0-c[:-k,:-k]*-1)/(k*k) if False else (c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,:-k])/(k*k)
loc=box(L,9)
D=float(sys.argv[3]); SAT=float(sys.argv[4])
river=(b>r+8)&(b>g-5)&(L>110)   # light blue lines
sea=box(((b>r+15)).astype(np.float32),15)>0.7
mask=((loc-L)>D)&(sat<SAT)&~river
mask|=sea&((loc-L)>8)
mask|=(L<95)
m=Image.fromarray((mask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MaxFilter(3))
mk=np.asarray(m)>0
print('mask',mk.mean())
out=a.copy(); filled=~mk
for rad in [3,6,12,24,48]:
  w=filled.astype(np.float32)
  den=box(w,rad)
  sel=(~filled)&(den>0.1)
  for c in range(3):
    num=box(out[...,c]*w,rad)
    f=num/np.maximum(den,1e-4)
    out[...,c][sel]=f[sel]
  filled=filled|sel
res=Image.fromarray(np.clip(out,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
res.save(sys.argv[2],quality=86)
