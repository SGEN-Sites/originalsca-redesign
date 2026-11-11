# process-images.py: turn the generated renders and the client's own media into shippable WebP, with labels.
#   python3 -I tools/process-images.py
# Generated stills (private/gen/*-0.png): WebP q90 at the render's full width plus a 1200 px variant, IPTC digital
# source type trainedAlgorithmicMedia embedded as XMP. Client media (private/client-media/*): resized only
# (never AI-altered), q88. Writes src/assets/img/*.webp and src/content/images.json (id -> files, size, alt, ai).
import json, os, sys
from PIL import Image, ImageFilter, ImageOps, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
GEN = os.path.join(ROOT, 'private/gen')
CM = os.path.join(ROOT, 'private/client-media')
OUT = os.path.join(ROOT, 'src/assets/img'); os.makedirs(OUT, exist_ok=True)
REG = os.path.join(ROOT, 'src/content/images.json')

XMP_AI = ('<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF '
          'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" '
          'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
          'Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/>'
          '</rdf:RDF></x:xmpmeta><?xpacket end="w"?>').encode()

reg = {}

def save(im, name, widths, q=90, ai=False, alpha=False):
    files = []
    for w in widths:
        if w >= im.width: w = im.width
        h = round(im.height * w / im.width)
        r = im if w == im.width else im.resize((w, h), Image.LANCZOS)
        fn = '%s-%d.webp' % (name, w)
        kw = dict(quality=q, method=6)
        if alpha: kw['alpha_quality'] = 92
        if ai: kw['xmp'] = XMP_AI
        r.save(os.path.join(OUT, fn), 'WEBP', **kw)
        files.append({'file': 'img/' + fn, 'w': w, 'h': h, 'bytes': os.path.getsize(os.path.join(OUT, fn))})
        if w == im.width: break
    return files

def gen(name, alt, widths=(2400, 1200), mode=None, src=None, crop=None, fix=None):
    p = os.path.join(GEN, (src or name) + '-0.png')
    im = Image.open(p)
    alpha = im.mode in ('RGBA', 'LA') and (src or name).endswith('-cut')
    im = im.convert('RGBA' if alpha else 'RGB')
    if crop: im = im.crop(crop(im))
    if fix: im = fix(im)
    if mode == 'bw': im = ImageOps.grayscale(im).convert('RGB')
    reg[name] = {'alt': alt, 'ai': True, 'kind': 'generated', 'files': save(im, name, widths, ai=True, alpha=alpha), 'source': 'private/gen/' + (src or name) + '.result.json'}

def ink_box(im, pad=0.08):
    # bounding box of the logo's ink on a white sheet (pixels darker than 240), padded
    g = ImageOps.grayscale(im.convert('RGB'))
    box = g.point(lambda v: 255 if v < 240 else 0).getbbox()
    if not box: return (0, 0, im.width, im.height)
    w, h = box[2] - box[0], box[3] - box[1]; px, py = int(w * pad), int(h * pad)
    return (max(0, box[0] - px), max(0, box[1] - py), min(im.width, box[2] + px), min(im.height, box[3] + py))

def client(name, file, alt, widths=(1600, 800), q=88, crop=None, grade=None, trim=False):
    im = Image.open(os.path.join(CM, file))
    alpha = im.mode in ('RGBA', 'LA', 'P') and 'transparency' in im.info or im.mode in ('RGBA', 'LA')
    im = im.convert('RGBA' if alpha else 'RGB')
    if crop: im = im.crop(crop(im))
    if trim: im = im.crop(ink_box(im))
    reg[name] = {'alt': alt, 'ai': False, 'kind': 'client', 'files': save(im, name, widths, q=q, alpha=alpha), 'source': 'private/client-media/' + file}

def blur_cap(im):
    # wall-wheel: the model painted a pseudo-logo on the centre cap; blur that disc only (small incidental mark)
    w, h = im.size
    box = (int(w * 0.40), int(h * 0.42), int(w * 0.60), int(h * 0.58))
    region = im.crop(box).filter(ImageFilter.GaussianBlur(radius=w * 0.012))
    m = Image.new('L', (box[2] - box[0], box[3] - box[1]), 0)
    ImageDraw.Draw(m).ellipse((0, 0, m.width, m.height), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(8))
    im.paste(region, box, m)
    return im

# ---- generated scenes (mood only; never the store, staff, customers or a real place) ----
gen('warehouse', 'Illustration: an empty brick warehouse at dusk, tall arched windows glowing gold above a mirror-polished concrete floor', src='warehouse-hero', widths=(3136, 1600))
gen('arches', 'Illustration: shafts of light through tall arched warehouse windows onto a concrete floor', src='warehouse-arches', widths=(1856, 900))
gen('boulevard', 'Illustration: a palm-lined Los Angeles boulevard at sunset under an orange, pink and violet sky', src='la-boulevard-sunset', widths=(3136, 1600))
gen('sd-palms', 'Illustration: a palm-lined San Diego street at sunset', src='sd-palms-sunset', widths=(2400, 1200))
gen('night-street', 'Illustration: a Los Angeles warehouse street at night, wet asphalt glowing red and violet', src='la-night-street', widths=(2400, 1200))
gen('grow-room', 'Illustration: rows of flowering cannabis plants under magenta grow lights', widths=(3136, 1600))
gen('trichomes', 'Illustration: macro view of cannabis trichomes in amber and violet light', src='trichome-field', widths=(2400, 1200))
gen('stage', 'Illustration: an empty stage lit by purple and pink spotlights through haze', src='stage-crown', widths=(2400, 1200))
gen('stage-wide', 'Illustration: an empty festival stage under a fan of purple and pink light beams', src='stage-wide-b', widths=(3136, 1600))
# cut-outs (transparent): the lowrider and three buds
gen('lowrider', 'Illustration: a candy-red lowrider convertible with chrome trim and wire wheels', src='lowrider-cut', widths=(2400, 1200, 640))
gen('bud-a', 'Illustration: a frosty cannabis flower', src='bud-a-cut', widths=(1200, 600))
gen('bud-b', 'Illustration: a lime-green cannabis flower with lavender tips', src='bud-b-cut', widths=(1200, 600))
gen('bud-c', 'Illustration: a deep purple cannabis flower dusted with frost', src='bud-c-cut', widths=(1200, 600))
# shop by category stills (on black)
for n, alt in [('cat-flower', 'a frosty cannabis flower on a black mirror'), ('cat-preroll', 'three cannabis pre-roll cones on black glass'),
               ('cat-vape', 'a blank vape cartridge of amber oil'), ('cat-extract', 'amber cannabis resin shards on slate'),
               ('cat-edible', 'squares of dark chocolate on slate'), ('cat-drink', 'a plain black beverage can with condensation'),
               ('cat-tincture', 'an amber dropper bottle'), ('cat-topical', 'an open jar of balm')]:
    gen(n, 'Illustration: ' + alt, widths=(1200, 600))
# family wall: symbolic black-and-white still lifes (no portraits, nobody's likeness)
for n, alt in [('wall-gloves', 'boxing gloves hanging on a brick wall'), ('wall-mic', 'a vintage microphone in a spotlight'),
               ('wall-basketball', 'a basketball on an outdoor court'), ('wall-wheel', 'a chrome wire-spoke wheel'),
               ('wall-trumpet', 'a trumpet resting on a chair'), ('wall-brushes', 'paint brushes in a paint can'),
               ('wall-typewriter', 'a vintage typewriter'), ('wall-crown', 'an antique crown on velvet'),
               ('wall-records', 'vinyl records leaning on a turntable')]:
    gen(n, 'Black-and-white illustration: ' + alt, widths=(1200, 600), mode='bw', fix=blur_cap if n == 'wall-wheel' else None)
gen('wall-reels', 'Black-and-white illustration: vintage film reels on a table', src='wall-reels-a', widths=(1200, 600), mode='bw')
gen('wall-reels-alt', 'Black-and-white illustration: vintage film reels on a table', src='wall-reels-b', widths=(1200, 600), mode='bw')

# ---- the client's own media (from the live site; resized only) ----
client('store-la-interior', 'intailbox-new.jpeg', 'Inside Originals Los Angeles: arched windows, timber trusses, glass cases and the black-and-white wall', widths=(854,))
client('store-la-floor', 'originals-factory-weed-shop-dispensary-2-1980x1320.jpeg', 'The sales floor at Originals Los Angeles', widths=(1920, 960))
client('store-la-front', 'Originals-dispensary.jpeg', 'Originals Los Angeles storefront with its giant ORIGINALS letters', widths=(730,))
client('store-sd-building', 'Picture-of-Originals-SD-Building.png', 'The Originals San Diego building on Federal Blvd', widths=(483,))
client('sd-banner', '443775029_blob.jpg', 'Originals San Diego banner: sunset palms, the crown and 50% off for first-time customers', widths=(1605, 800))
client('sd-script', 'Screen-Shot-2021-09-01-at-8.37.28-AM.png', 'Originals San Diego graphic', widths=(1900, 950))
client('flyer-carshow', 'carshowflyerlowrider.jpg', 'Lowrider car show flyer: Los Angeles 2026 Finale', widths=(1880, 940))
client('hof-graphic', 'HOF-ORIGINALS-AND-CURE-.jpeg', 'Hall of Flowers Palm Springs 2021 graphic with Originals and The Cure Company', widths=(1920, 960))
client('hof-mixer', 'liteupthenight.png', 'Lite Up The Nite: Hall of Flowers welcome mixer graphic', widths=(617,))
client('farmers-cup', 'Farmers-Cup-768x779.png', 'Farmers Cup 2021: first place, licensed flower, Originals Gelato', widths=(768,))
client('gelato-box', 'Originals-Flower---Gelato---3.5g.png', 'Originals Gelato 3.5g packaging', widths=(1200, 600))
client('gelato-jar', 'originals_ca-Gelato.png', 'Originals Gelato flower with its jar', widths=(599,))
client('preroll-3', 'originalspreroll1-768x768.jpeg', 'Originals pre-roll three-pack', widths=(768,))
client('preroll-1', 'originalspreroll2-768x768.jpeg', 'Originals single pre-roll pack', widths=(768,))
client('bud-box', 'E37C5D9A-82DE-4421-872E-366E773BA15E-1980x1286.jpeg', 'Originals Family Farms flower beside its box', widths=(1920, 960))
client('grow-real', 'Screen-Shot-2022-04-08-at-2.46.50-PM-640w.webp', 'Cannabis plants in an indoor grow room', widths=(640,))
client('backdrop', 'Originals-Backdrop-copy.jpg', 'The Originals crown and leaf pattern', widths=(1920,))
client('clothing-shop', 'originals-clothings-new-img.jpeg', 'The Originals Clothing online store', widths=(854,))
client('award-badge', 'awardwinning_vers2.png', 'Award Winning', widths=(1000, 500))
client('crown-black', 'blackhero-logo-copy.png', 'Originals crown', widths=(600,))
client('la-lockup', 'big_la_wm_logo-3f6e9e31-74c97722.png', 'Originals Los Angeles logo', widths=(800,))
client('film-poster', 'N62qIsrLQZSRHSbiwQof_video-new.v2.0000000-1920w.jpg', 'Originals brand film', widths=(1280,))
for n, f in [('logo-jeeter', 'jeeter.jpg'), ('logo-stiiizy', 'STIIIZY-copy.jpg'), ('logo-wcc', 'wcc_logo-copy.jpg'), ('logo-lime', 'lime2.0_logo-1-copy.jpg'), ('logo-roach', 'roach.jpg'), ('logo-cbx', 'cannabiotic-lowres.jpg')]:
    client(n, f, n.replace('logo-', '').upper() + ' logo', widths=(400,), trim=True)

json.dump(reg, open(REG, 'w'), indent=1)
tot = sum(f['bytes'] for v in reg.values() for f in v['files'])
print(len(reg), 'images,', sum(len(v['files']) for v in reg.values()), 'files,', round(tot / 1048576, 1), 'MB')
