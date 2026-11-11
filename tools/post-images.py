# post-images.py: every client image that the live articles and pages use, as WebP, plus a URL map for the build.
#   python3 -I tools/post-images.py
# Reads private/client-media/provenance.json (what tools/fetch-client-media.mjs saved, with the pages that use it),
# writes src/assets/img/posts/<name>.webp (max 1600 px wide, q86, resized only) and src/content/post-images.json
# mapping the normalised live URL (no /opt/, no -NNNw, no query) -> {file, w, h}.
import json, os, re
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CM = os.path.join(ROOT, 'private/client-media')
OUT = os.path.join(ROOT, 'src/assets/img/posts'); os.makedirs(OUT, exist_ok=True)
prov = json.load(open(os.path.join(CM, 'provenance.json')))
norm = lambda u: re.sub(r'\?.*$', '', re.sub(r'-\d+w(?=\.[a-z]+)', '', u.replace('&amp;', '&').replace('/opt/', '/'), flags=re.I))
out = {}
for p in prov['files']:
    f = p.get('file')
    if not f or f.endswith(('.svg', '.mp4', '.ico')): continue
    try:
        im = Image.open(os.path.join(CM, f))
    except Exception as e:
        print('skip', f, e); continue
    alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alpha else 'RGB')
    if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    name = re.sub(r'\.[a-z0-9]+$', '', f, flags=re.I) + '.webp'
    im.save(os.path.join(OUT, name), 'WEBP', quality=86, method=6, **({'alpha_quality': 92} if alpha else {}))
    rec = {'file': name, 'w': im.width, 'h': im.height}
    out[norm(p['url'])] = rec
json.dump(out, open(os.path.join(ROOT, 'src/content/post-images.json'), 'w'), indent=1)
print(len(out), 'images mapped')
