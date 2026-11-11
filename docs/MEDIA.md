# Media record

Every image and film on the redesign, where it came from, and what was decided. Generated media is mood and
illustration only: it never stands in for the store, staff, customers, a product or a result.

## The client's own media (kept, never AI-altered)

Downloaded from the live site by `tools/fetch-client-media.mjs` (one request at a time, 400 ms apart, honest
user agent; provenance with URL and sha256 in `private/client-media/provenance.json`), then resized and converted
to WebP by `tools/process-images.py` and `tools/post-images.py`.

| use | asset |
|---|---|
| Home hero film, Media page player | the live hero video (`vid.cdn-website.com/.../video-new-v.mp4`), re-encoded at 1280x720 and 640x360 by `tools/encode-loops.py` (macOS VideoToolbox H.264), plus its own poster |
| Logo, header, gate, footer, favicon | `WHITELOGOCROWN.png` traced to SVG paths by `tools/trace-logo.py` (alpha threshold + potrace, no AI); every letter keeps its drawn shape |
| Store pages, home stores band, story | `intailbox-new.jpeg` (LA interior), `originals-factory-weed-shop-dispensary-2` (LA sales floor), `Originals-dispensary.jpeg` (LA storefront), `Picture of Originals SD Building.png`, the San Diego sunset banner |
| Events, culture band, media | the lowrider car show flyer (Los Angeles 2026 Finale), the Hall of Flowers Palm Springs 2021 graphic, the Lite Up The Nite mixer graphic |
| Story, strains, media | Farmers Cup 2021 graphic, Originals Gelato packaging and jar, pre-roll packs, Family Farms flower and box |
| Brands | the brand logos the live site shows (Jeeter, STIIIZY, West Coast Cure, Lime, Roach, Cannabiotix), trimmed to their ink |
| Textures | the Originals crown and leaf backdrop |
| Blog posts | every image the live articles use, at their article positions |

Not used, by decision: the live site's stock photos (Shutterstock, Unsplash, Pexels) on the category tiles; the
Dodi VIP flyer and event crowd photos (they show people, including artists; the brief asks for no artist photos);
the San Diego opening photo with a crowd; Halloween-hours flyers (out of date). The Hall of Flowers booth photos
stay only inside their own recap article.

## Generated media (fal)

Models: FLUX1.1 [pro] ultra (`fal-ai/flux-pro/v1.1-ultra`) for stills, BiRefNet v2 heavy for the cut-outs, Kling 2.5
Turbo Pro image-to-video for the loops (first and last frame set to the same still, then a 14-frame crossfade).
Job files: `tools/jobs/make-jobs.mjs` (round 1) and `tools/jobs/make-jobs-2.mjs` (round 2); every request id,
seed and prompt is in `private/gen/*.result.json` (kept out of the published site). Labels: IPTC digital source
type `trainedAlgorithmicMedia` in each WebP's XMP, `data-ai="generated"` on every generated `<img>`, and one line
in every footer. No visible tag on the image.

Prompt rules on every still: no people, hands or faces; no text, letters, numbers, logos, plates or labels; no
smoking; colours named in words; the negative space for type stated in the brief.

Review (full-resolution read, zoomed crops on anything suspicious):

| render | verdict | note |
|---|---|---|
| warehouse-hero | MINOR, used | trusses rendered as steel, the brief said timber; a rack at the left edge |
| warehouse-arches, la-boulevard-sunset, sd-palms-sunset, la-night-street, grow-room, trichome-field, stage-crown, stage-wide-b | PASS | |
| lowrider-side, lowrider-cut | PASS | clean cut-out for the cruise |
| bud-macro-a/b/c, bud-a/b/c-cut | MINOR, used | the cut-outs keep a hard crop edge and small leaf fragments at the bottom; the page fades their lower third |
| cat-flower, cat-preroll, cat-vape, cat-extract, cat-edible, cat-drink, cat-tincture, cat-topical | PASS | pre-rolls read as cannabis cones, not cigarettes; the edible is plain chocolate (no candy cues) |
| wall-gloves, wall-mic, wall-basketball, wall-trumpet, wall-brushes, wall-typewriter, wall-crown, wall-records, wall-reels-a | PASS | converted to true black and white |
| wall-wheel | MINOR, used | a pseudo-logo on the centre cap, blurred (small incidental mark) |
| wall-camera | REJECTED | garbled pseudo-text on the camera body; replaced by wall-reels-a |
| stage-beams-wide | REJECTED | human silhouettes on the riser; replaced by stage-wide-b |
| bandana-red, bandana-black | REJECTED | a teardrop-and-dot print, not a real paisley; the bandana is drawn as SVG instead (`src/assets/brand/paisley.svg`) |
| vid-stage, vid-grow, vid-arches | PASS | frames sampled across each loop: no people, no morphing |

## Spend (fal list price, not checked against an invoice)

43 requests: 36 stills x $0.06, 3 loops x 5 s x $0.07, 4 cut-outs (compute seconds, about $0.003 each).
**Total about $3.22.** Higgsfield was not used (not connected in this session).

## Not AI

The paisley tile, the crown and wordmark SVGs, the icons, the chrome lettering, light shafts, stage beams, grain,
neon and every effect on the page are drawn in code.
