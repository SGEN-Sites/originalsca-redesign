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
| Store pages, home stores band, story | until 2026-11-12: `intailbox-new.jpeg` (LA interior, 854 px), `originals-factory-weed-shop-dispensary-2` (LA sales floor, 1920 px), `Originals-dispensary.jpeg` (registered as the LA storefront, but it is the **San Diego** store's back wall), `Picture of Originals SD Building.png`, the San Diego sunset banner. The LA slots now use the business's own Google Maps listing photos (below); `Originals-dispensary.jpeg` is now `store-sd-interior` |
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
type `trainedAlgorithmicMedia` in each WebP's XMP, `data-ai="generated"` on every generated `<img>` and loop
`<video>`, and one line in every footer. No visible tag on the image.

Display: every image and loop shows in its own colour; only the brand around it is flat black and white. A switch
exists (`--ai-photo: grayscale(1)` in `tokens.css`) to render generated imagery black and white; it is off by owner
decision. The family-wall frames are black and white because the brief describes the real wall that way.

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

## The brand film (enhanced 2026-11-11, owner request)

The client's own film (1920x1080, 30 fps, 20 s, about 3.7 Mbit/s) was restored and upscaled once with Topaz
(fal-ai/topaz/upscale/video, Proteus, 2x, compression 0.5, recover detail 0.6, noise 0.25, halo 0.1; request
01a1c8bf-a0de-77d2-98c1-6d1010a0ce34, about $0.20). Proteus is a restoration model, not a generative one: the ORIGINALS
lettering in the footage was checked frame-to-frame and is unchanged. The grade is the owner's "rich" look after a
reference clip they supplied (a vivid teal-and-orange music-video grade): saturation with vibrance, cool hues pulled
toward teal and warm hues toward orange, teal shadows, near-neutral highlights, punchy filmic contrast, light vignette and
sharpening (`grade_rich` in `private/film-grade/grade.py`; an earlier "bold" grade is kept in `private/film-grade/out/`); encodes: film-1920 (5.5 Mbit/s), film-1280 (2.6), film-640 (0.8) and new posters. The
original encodes are kept in `private/film-grade/orig/`.

## Owner-supplied photos, 2026-11-12

- **Happy Hour deal card** (`happy-hour-lowrider`): the owner's photo of a woman holding a leashed bulldog in front of
  a red 1963 Impala (1220x2000, `private/client-media/happy-hour-lowrider.png`). The card is wide and the photo tall,
  so the owner asked for an AI generative extension. The photo was placed on the right of a 2640x1760 canvas, and Bria
  Expand (`bria/fibo-edit-1.5/expand`, request 01a1cdc8-5acb-7180-b93e-fa6fc120ebfb, seed 288698243, $0.04) filled
  only the left side with the building, sky and lot; the photo's own pixels were kept. A second variant (01a1cdc8-5c45…,
  $0.04) was not used. The seam was blended locally (`private/gen/happy-hour-lowrider/seam_fix.py`). Then Topaz
  upscaled it 1.5x (`topaz/upscale/image/precision`, High Fidelity V2, face enhancement off, request
  01a1cdca-4fa0-7123-be3b-a255fbb33b0b) and `grade_rich` graded it (s 0.8). The image is labelled as generated
  because of the extension. An independent review failed that version (the upscaler garbled the plate lettering; a
  seam showed). The owner approved a fix round: Bria re-run with the same seed and `return_model_output`
  (01a1cdf0-c0ea-7b70-86ef-bab2925d2a8e, $0.04), a 200 px cross-fade into the photo (28 px at the car's rows,
  `crossfade.py`), Topaz again (01a1cdf1-b032-7e23-8555-5b59050eee00), the plate, sign and emblem pasted back from
  the source with Lanczos only, and `grade_rich` s 0.7 with highlight protection (`post_v5.py`). The re-review rated
  it MINOR (`review/review-2-report.json`). Every step is in `private/gen/happy-hour-lowrider/jobs.json`;
  PITCH-NOTES #25 has the client questions. It replaces the 2026-11-11 car-show photo of two people
  (`happy-hour-meet`, no longer used).
- **"Our story" home album** (`story-family-wall`, `story-grower-bud`, `story-family-farms`, `story-pouch`): four
  owner-supplied photos the owner has not confirmed are the client's (PITCH-NOTES #29). There was no AI: each photo's
  light was moved part way to the set's average and to a slightly warm neutral (Lab mean/std), then graded with
  `grade_rich` s 0.7 (`private/gen/our-story/grade_set.py`). They replace the album's storefront, flower box,
  Farmers Cup and San Diego images on the home page, which are still used elsewhere.

- **San Diego deals card** (`store-sd-front`): the owner's golden-hour photo of the San Diego storefront (1448x1086,
  `private/client-media/sd-front/sd-storefront-golden.png`), for the deals reel's San Diego card in place of the AI
  `sd-palms` illustration ("make it a bit golden hour vibe"). Labelled as generated until confirmed: the door
  lettering is garbled pseudo-text, and the building number read 6240 (the store is 6220 Federal Blvd, and the
  business's own Sep 2022 listing photo shows 6220 on that column). The third digit was replaced locally by a copy of
  the photo's own "2". Graded locally (warm highlights, cool deep shadows, amber bloom, a faint warm glow from the sun
  side, `grade_rich` s 0.3) by `private/gen/sd-front/process.py`. The owner OK'd an upscale: the number-fixed photo
  went through Topaz High Fidelity V2 at 2x, face enhancement off (request 01a1ce42-1b65-7b32-8035-297572015a8b), and
  was then graded (`process.py --topaz`), giving 2400/1600/960 px. The deals card keeps its smaller "50%" so the
  storefront stays beside the text (owner: "keep the 50% as is"). PITCH-NOTES #23; spend in
  `private/gen/sd-front/jobs.json`.

- **San Diego Daily deals card** (`daily-jar`): the owner's photo of an ORIGINALS glass jar of flower on a reflective
  counter (1672x941, `private/client-media/jar/originals-jar.png`), in place of the AI trichome close-up on the Daily
  card of the home deals reel and the /deals carousel. Light grade only (`private/gen/store-photos/daily_jar.py`), no
  AI. Provenance unconfirmed (PITCH-NOTES #32). The owner OK'd a Topaz upscale: 2x, High Fidelity V2, face
  enhancement off (request 01a1cf0a-579e-70b0-99d9-a3e60895b046), giving 2400/1600/1280/960/640
  (`daily_jar_topaz.py`).
- **The Daily card's vertical version** (`daily-jar-tall`, 2026-11-12): the owner's vertical photo of the same jar
  (1024x1536, `private/client-media/jar/originals-jar-vertical-2.png`; owner: "use this and replace all the vertical
  versions", then this second version, whose jar stands higher and smaller; the first, `originals-jar-vertical.png`,
  is kept unused). It replaces the 16:9 band wherever the Daily card is taller than wide: every /deals slide, the home
  phone stack and the still grid's cards under 520px; the wide stage and wider cards keep `daily-jar`. Marked
  generated until the owner confirms its source, because 1024x1536 is a standard AI image-generator size; checked at
  full size first: the ORIGINALS lettering is correct and the crown matches the brand's mark. Same light grade as
  `daily-jar` (`private/gen/store-photos/daily_jar_tall.py`), 1024/800/640, no upscale, no AI by us (PITCH-NOTES #32).
- **Gelato strain card** (`gelato-bud`): the owner asked for it to look like the other strain cards (a single bud on
  black). The client's own Gelato photo (`originals_ca-Gelato.png`, 599x599, live site) was cut out with macOS
  Vision's on-device foreground segmentation (`private/gen/strain-gelato/cutout.swift`), then GrabCut separated the
  bud from the jar and box (`bud.py`). The cut-out generates no pixels. It sits on black, graded (`grade_rich` s 0.8),
  then, with the owner's OK, upscaled 4x by Topaz High Fidelity V2, face enhancement off (request
  01a1cf0a-54af-75e3-a7a4-8e6e2f786db1; `bud_topaz.py`): real trichome and pistil detail, checked at 1:1. The
  original `gelato-jar` photo is still used in the culture galleries. Spend: `private/gen/topaz-jobs-2026-11-12b.json`.

Spend on 2026-11-12: about $0.16-0.40 at fal list price (three Bria expansions at $0.04, two Topaz upscales for the
Happy Hour photo and two for the San Diego photos; the unit Topaz bills is not stated), not checked against an
invoice.

## The stores' own listing photos, 2026-11-12 (owner request)

The owner: "you may use some of the LA store interior images from here [the Originals Factory Google Maps listing]
... enhance em and make them clear and crisp so you are not using a placeholder image. additionally ensure SD
interior images are enhanced as well". Only the listings' **"By owner"** photos were used (posted by the business
itself; visitor photos were not), downloaded at their original size into `private/client-media/maps-la/` and
`maps-sd/`. Crispness comes from the resolution: every web size is an area-average downscale from the 5900-7000 px
original, sharpened lightly at that size; colour photos get a light pass of the site grade (`grade_rich` s 0.4), and
the photographer's black-and-white shots stay black and white (`private/gen/store-photos/process.py`, registered
by `register.mjs`). No AI. Rights: PITCH-NOTES #30.

| id | photo | where |
|---|---|---|
| `store-la-floor` | the sales floor, cases, trusses, the ORIGINALS sign (`la-60.jpg`, 6695x4243, 2022) | LA page hero, home LA deals card |
| `store-la-interior` | the ORIGINALS letters before the arched brick windows (`la-05.jpg`, 6231x4154, 2022) | store cards (home, /retail, find-originals), story |
| `store-la-wall` | the letters before the black-and-white portrait wall (`la-21.jpg`, 7008x4672, 2022) | LA page photo stack |
| `store-la-window` | an arched window over a table of hats and tees, square (`la-206.jpg`, 2022) | LA page photo stack |
| `store-la-front` | the storefront at night, black and white, square (`la-35.jpg`, 6000x4000, 2022) | the story's "Stanford Ave" polaroid |
| `store-la-letters-bw` | the letters and the wall, black and white (`la-304.jpg`, 7008x4672, 2022) | /retail hero (decorative) |
| `store-sd-interior` | the San Diego back wall: letters, plants, shelving, crowns (`Originals-dispensary.jpeg`, 730x439) | San Diego store cards and photo stack |
| `wall-strip-1..3` | the letters before the wall (`la-photo-b.jpg`, 7008x4672, 2022) | the Family Wall's first three panels |

- `Originals-dispensary.jpeg` was registered as the LA storefront; it is the San Diego store's back wall (it matches
  the San Diego listing's own interior photo). It is now `store-sd-interior`, and `store-la-front` holds the real LA
  storefront. It is only 730 px wide. A local enhancement came first (gentle denoise, 2x Lanczos, unsharp mask);
  then, with the owner's OK, Topaz High Fidelity V2 upscaled the original 2x, face enhancement off (request
  01a1ce42-21d9-7ae1-9385-d4d549ce7532), followed by the light store grade (`sd_interior_topaz.py`).
- **The digital wall** (`family-wall-unit`, 2862x1120 and 1431x560; owner, 2026-11-12: "create a replica of the
  wall ... I can already see a pattern"). The owner sent a target look: a flat, edge-to-edge collage. That reference
  looks AI-made with look-alike faces, so it was used for the look only and never copied.
  - **Method:** one repeat of the wall print (period 3069 px in the base photo) was rebuilt by
    `private/gen/family-wall-digital/build_unit.py`. The wall was rectified with vanishing points and its own repeat
    shift, every wall photo was registered per repeat (SIFT/RANSAC plus optical flow), and the letters, props, plants
    and cases were masked. The visible pixels were composited, mostly from `la-13.jpg` (99.7%), with `la-photo-b` and
    `la-317` filling where a prop hid the wall.
  - **Crop:** the top 62% of the wall. The lowest rows are behind the letters in every photo, so they were cropped,
    not invented.
  - **Rules kept:** no AI, no inpainting, no swapped prints. The build is byte-for-byte reproducible.
  - **Known patch:** about 70x75 px in row 4 comes from other photos, slightly lighter.
  - **Display:** the home strip shows three seamless copies.

  `wall-strip-1..6` stay registered but are no longer on the page.
- `wall-strip-1..3` were cut from the owner's 1432x816 screenshot of the listing photo; they are now cut from its
  original. ORB features + RANSAC map the screenshot onto it as a pure 4.63x scale, so the framing and panel shapes
  are unchanged; the panels are now 1120 px tall instead of 816 (`private/gen/family-wall/slice_wall.py`).
  `wall-strip-4..6` still come from the owner's seated-man photo (1432x878, source unconfirmed).
- Replaced by these: the 854 px `intailbox-new.jpeg` and the 1920 px blog photo on the LA slots, the AI `warehouse`
  illustration on the /retail hero (still used on /jobs and /shop), and the San Diego banner and script graphics on
  the San Diego store cards (the banner is still in the events and media galleries; the script graphic is still in
  those and in the San Diego page's photo stack).
