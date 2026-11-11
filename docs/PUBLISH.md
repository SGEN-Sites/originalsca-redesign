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

## The gate

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
