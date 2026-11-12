# Publishing record

Repository: https://github.com/SGEN-Sites/originalsca-redesign (public)
Preview: https://sgen-sites.github.io/originalsca-redesign/ (GitHub Pages from the `gh-pages` branch; every page is
`noindex, nofollow` and robots.txt is `Disallow: /`)

## What is public

- `main`: `src/` (including `src/content/capture.json`, the live words the build used, so a clone rebuilds without
  the raw capture), `tools/` (build, imagery and verification tools), `docs/`, `facts/`, `project.json`, the evidence
  files in `audit/` and a README.
- `gh-pages`: the preview build, `node src/build.mjs --preview --out dist-preview --base /originalsca-redesign/`.
- Kept out: the raw capture of the live site (`audit/raw`, 724 pages of platform HTML), the downloaded source-site
  assets (`assets/`), generated renders and design references (`private/`), the large inventories, the research
  tools and the publish scanner (it names what it searches for). The handoff zip carries the full evidence set.

## Republish (2026-11-12)

The owner-approved batch of 2026-11-12: on the home page the category wall, the deals reel, the story album, the Family
Wall, the Sunday Cruise ("The Roadside Sign", with From the farm merged in), the stores ("Editorial"), the lenticular
events, the brand marquee, the compact drop list and the editorial footer, with the creed removed everywhere; on /deals
the concave deals wall and Save now; the inner pages (culture, info, blog, legal, shop) in the design language
(`docs/DESIGN-LANGUAGE.md`); and the Daily deals card's vertical jar photo on every card taller than wide
(`docs/MEDIA.md`). The decisions are rows in `audit/change-control.json` (`docs/CHANGE-LOG.md`).

### Checks run before publishing (2026-11-12)

| check | result | evidence |
|---|---|---|
| the built site's interactive parts (gate, store bar, store switch, header, home sections, /deals wall, footer, legal, shop, culture, blog and info pages) | 487/487 pass | `audit/ui-test.json` |
| every Shop, category and brand destination shows products with a cart | the build links the same 33 destinations verified on 2026-11-11 (0 added, 0 dropped); the live menus were not visited again | `audit/menu-verification.json` (2026-11-11) |
| tap targets at least 44 x 44 px | the sweep lists 5 under 44 px, all read while their entrance animation ran; settled, the deal card buttons are 50 px tall, the /deals buttons 46 px and the footer store links 44 px | `audit/sweep-findings.json`; settled measurement 2026-11-12 |
| no API key or credential in any published file | 0 hits in 714 files of both trees (110.4 MB): the fal key in use (whole and each half), and GitHub, `sk-`, Google, AWS, Slack, private-key and `KEY=value` shapes | publish scan |
| no reference brand or other client named, no operator identity or machine path | 0 hits (the other-client pattern widened on 2026-11-12 to catch spaced spellings) | publish scan |
| the preview stays out of search | 53/53 pages `noindex, nofollow`; robots.txt `Disallow: /` | publish scan |
| the public source rebuilds the preview without the raw capture | 335/335 files identical, apart from the build-time `?v=` stamp on the CSS and JS links of the 53 pages | clean-copy rebuild |

### The gate (2026-11-12)

site-reforge gate: **NOT-READY**, 21 PASS, 8 FAIL, 0 UNPROVEN, the same eight as on 2026-11-11 (C03, C04, C05, C07,
C16, C17, C22, C23; explained below). Parity is unchanged: the same counts and a mean recall of 78.0% (77.9% before),
no page worse than on 2026-11-11. C23 now counts 126 sweep majors: decoration and carousel panels that run past the
screen edge inside clipped bands (the deals reel's glow, the /deals wall's turned panels, the collab tape, the
lenticular cards, the cruise sky), 13 "control has no accessible name" on the brand marquee's duplicate loop track
(it is `aria-hidden` with `tabindex="-1"` links, so assistive technology never reaches it) and the 5 tap targets read
mid-animation above. The sweep finds no blocker: no page scrolls sideways at any width.

### Deploy (2026-11-12)

| step | result |
|---|---|
| repository | `main` commit 41c7af8, scanned clean before the push |
| preview | `gh-pages` commit e3ba7da; GitHub Pages built it in about 49 s |
| the live preview | 11/11 pass at https://sgen-sites.github.io/originalsca-redesign/: all 53 pages answer 200 with their own title and `noindex`; the CSS, JS, a font and robots.txt answer; on a phone the 21+ gate shows and closes, the store bar appears past the hero with Shop Now, Call, Directions and today's hours, and switching to San Diego moves all three; no script errors (`audit/preview-smoke.json`). /deals and the home page serve the vertical jar photo (`daily-jar-tall`, 3 sizes, 200) |
| the fal key in the public repository | a fresh mirror clone of both branches, 584 git objects scanned: 0 hits, whole or in part; no other credential shape; no operator identity or machine path in any file |

## Checks run before publishing (2026-11-11)

| check | result | evidence |
|---|---|---|
| every Shop, category and brand destination in the preview build shows products with add-to-cart and a cart | 33/33 pass; one real add-to-cart per store: Los Angeles "Open cart 1", San Diego "Added to bag from Originals San Diego" | `audit/menu-verification.json`, `audit/menu-cart-la.png`, `audit/menu-cart-sd.png` |
| sticky store bar on a phone, 21+ gate, store switch, drawer | 28/28 pass | `audit/ui-test.json` |
| tap targets at least 44 x 44 px on phones and tablets (every page at 390 and 768 px, no cap) | 0 under 44 px | `audit/sweep-findings.json` (the sweep caps its own list) |
| no API key or credential in any published file | 0 hits in every file of both branches: the fal key in use (whole and each half), and GitHub, `sk-`, Google, AWS, Slack, private-key and `KEY=value` shapes | publish scan |
| no reference brand or other client named, no operator identity or machine path | 0 hits | publish scan |
| the preview stays out of search | 53/53 pages `noindex, nofollow`; robots.txt `Disallow: /` | publish scan |
| the public source rebuilds the preview without the raw capture | 248/248 files identical | clean-clone rebuild |

## The gate (2026-11-11)

site-reforge gate: **NOT-READY**, 21 PASS, 8 FAIL, 0 UNPROVEN (`audit/gate.json`, `audit/reports/`). The eight:

- **C03**: the live site answers 404 for `/events` and `/wholesale`, which its own nav and footer link; both are real
  pages in the rebuild.
- **C04, C05**: the 668 Tymber menu pages render in the browser; they stay on Tymber (the store and its cart) and are
  not rebuilt.
- **C07**: two same-origin images the live site refuses (403) or no longer has (404).
- **C16**: 683 source pages are not rebuilt: the 668 Tymber menu pages and 15 template demo pages (bed linen, lamps).
- **C17**: the check compares the source page's whole body with the rebuild's `<main>`, so the nav and footer words
  (carried in the rebuild's own header and footer) count as lost; so do the generic footer filler dropped on
  purpose, the template placeholders ("Lorem ipsum", "This is paragraph text...") and the conflicting LA hours.
- **C22**: a redesign does not match the old design pixel for pixel.
- **C23**: 64 sweep majors, all on the home page, all decoration that bleeds past the screen edge inside a clipped
  band (the hashtag tapes, the light shafts, the collab tape, the cruise sky, a parallax bud). No page scrolls
  sideways at any width.

## Deploy (2026-11-11)

| step | result |
|---|---|
| repository | `SGEN-Sites/originalsca-redesign`, public; `main` holds the source tree above, scanned clean before every push |
| preview | `gh-pages` commit 0f00056; GitHub Pages built it in about 20 s |
| the live preview | 11/11 pass at https://sgen-sites.github.io/originalsca-redesign/: all 53 pages answer 200 with their own title and `noindex`; the CSS, JS, a font and robots.txt answer; on a phone the 21+ gate shows and closes, the store bar appears past the hero with Shop Now, Call, Directions and today's hours, and switching to San Diego moves all three to San Diego; no script errors (`audit/preview-smoke.json`) |
| the fal key in the public repository | a fresh mirror clone of both branches with every git object scanned: 0 hits, whole or in part; no other credential shape; no operator identity or machine path |

## The handoff zip

Not produced. `sr-package` writes zips without ZIP64 and refuses an archive over 4 GB (`lib/zip.mjs`). This
project's package would be 5.18 GB in 10,099 entries; 5.08 GB of that is the source site's downloaded images
(`assets/source`), nearly all product photos from the 668 Tymber menu pages, which stay on Tymber. Producing one
needs a decision: a ZIP64-capable packager, or a package that leaves those menu images out (they remain on disk as
the gate's evidence).
