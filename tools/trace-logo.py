# trace-logo.py: vectorise the client's own ORIGINALS lockup (WHITELOGOCROWN.png from the live site).
# Not an AI step: alpha threshold + potrace spline tracing, so every letter keeps its own drawn shape.
#
#   PYTHONPATH=private/pylib python3 -I tools/trace-logo.py
#
# Writes src/assets/brand/originals-letters.json (one path per letter, in the source pixel space, with bboxes),
# src/assets/brand/originals-wordmark.svg (letters only) and src/assets/brand/originals-lockup.svg (letters + crown),
# plus review PNGs in private/logo-trace/.
import json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(ROOT, 'private/pylib'))  # potracer, installed there as a build tool (python -I ignores PYTHONPATH)
import numpy as np
from PIL import Image
import cv2
import potrace

SRC = os.path.join(ROOT, 'private/client-media/WHITELOGOCROWN.png')
OUT = os.path.join(ROOT, 'private/logo-trace'); os.makedirs(OUT, exist_ok=True)
DST = os.path.join(ROOT, 'src/assets/brand'); os.makedirs(DST, exist_ok=True)
SCALE = 2

im = Image.open(SRC).convert('RGBA')
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
alpha = np.asarray(im)[:, :, 3]
mask = (alpha > 127).astype(np.uint8) * 255
mask = cv2.GaussianBlur(mask, (0, 0), 1.0)
_, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

n, lab, stats, cent = cv2.connectedComponentsWithStats(mask, 8)
comps = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 400]
# the wordmark sits above the crown: split by vertical position (the crown starts below the letters' lowest top)
tops = sorted(stats[i, cv2.CC_STAT_TOP] for i in comps)
letters, crown = [], []
H = mask.shape[0]
for i in comps:
    x, y, w, h, area = stats[i]
    (crown if y > H * 0.48 else letters).append(i)
letters.sort(key=lambda i: stats[i, cv2.CC_STAT_LEFT])

def trace(m):
    bm = potrace.Bitmap(m == 0)  # potracer fills the values below its blacklevel, i.e. the 0 (False) pixels
    plist = bm.trace(turdsize=8, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in plist:
        s = curve.start_point
        d.append('M%.1f %.1f' % (s.x / SCALE, s.y / SCALE))
        for seg in curve.segments:
            if seg.is_corner:
                d.append('L%.1f %.1fL%.1f %.1f' % (seg.c.x / SCALE, seg.c.y / SCALE, seg.end_point.x / SCALE, seg.end_point.y / SCALE))
            else:
                d.append('C%.1f %.1f %.1f %.1f %.1f %.1f' % (seg.c1.x / SCALE, seg.c1.y / SCALE, seg.c2.x / SCALE, seg.c2.y / SCALE, seg.end_point.x / SCALE, seg.end_point.y / SCALE))
        d.append('Z')
    return ''.join(d)

names = list('ORIGINALS')
out = {'source': 'private/client-media/WHITELOGOCROWN.png (live site, irp.cdn-website.com)', 'space': [im.width // SCALE, im.height // SCALE], 'letters': [], 'crown': None}
for k, i in enumerate(letters):
    m = (lab == i).astype(np.uint8) * 255
    x, y, w, h, area = stats[i]
    out['letters'].append({'ch': names[k] if k < len(names) else '?', 'bbox': [round(x / SCALE, 1), round(y / SCALE, 1), round(w / SCALE, 1), round(h / SCALE, 1)], 'd': trace(m)})
cm = np.zeros_like(mask)
for i in crown: cm[lab == i] = 255
ys, xs = np.nonzero(cm)
out['crown'] = {'bbox': [round(xs.min() / SCALE, 1), round(ys.min() / SCALE, 1), round((xs.max() - xs.min()) / SCALE, 1), round((ys.max() - ys.min()) / SCALE, 1)], 'd': trace(cm)}
Image.fromarray(255 - mask).save(os.path.join(OUT, 'mask.png'))

# tight viewBox around the letters, and around the whole lockup
lx0 = min(l['bbox'][0] for l in out['letters']); ly0 = min(l['bbox'][1] for l in out['letters'])
lx1 = max(l['bbox'][0] + l['bbox'][2] for l in out['letters']); ly1 = max(l['bbox'][1] + l['bbox'][3] for l in out['letters'])
out['wordBox'] = [lx0, ly0, round(lx1 - lx0, 1), round(ly1 - ly0, 1)]
cx0, cy0, cw, ch = out['crown']['bbox']
X0, Y0 = min(lx0, cx0), min(ly0, cy0); X1, Y1 = max(lx1, cx0 + cw), max(ly1, cy0 + ch)
out['lockupBox'] = [X0, Y0, round(X1 - X0, 1), round(Y1 - Y0, 1)]
json.dump(out, open(os.path.join(DST, 'originals-letters.json'), 'w'))

pad = 4
def svg(box, parts, title):
    x, y, w, h = box
    body = ''.join('<path d="%s"/>' % p for p in parts)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f" role="img" aria-label="%s"><title>%s</title><g fill="currentColor" fill-rule="nonzero">%s</g></svg>'
            % (x - pad, y - pad, w + 2 * pad, h + 2 * pad, title, title, body))
open(os.path.join(DST, 'originals-wordmark.svg'), 'w').write(svg(out['wordBox'], [l['d'] for l in out['letters']], 'Originals'))
open(os.path.join(DST, 'originals-lockup.svg'), 'w').write(svg(out['lockupBox'], [l['d'] for l in out['letters']] + [out['crown']['d']], 'Originals'))
open(os.path.join(DST, 'originals-crown.svg'), 'w').write(svg(out['crown']['bbox'], [out['crown']['d']], 'Originals crown'))
print('letters', len(out['letters']), ''.join(l['ch'] for l in out['letters']), 'crown parts', len(crown), 'wordBox', out['wordBox'])
for l in out['letters']: print(l['ch'], l['bbox'], len(l['d']))
