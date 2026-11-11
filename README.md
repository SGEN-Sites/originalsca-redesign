# Originals: website redesign concept

A complete redesign concept for [originalsca.com](https://originalsca.com), prepared for Originals (Originals Factory
& Weed Shop and Originals Family Farms). **This is a pitch preview, not the live site.**

**Preview:** https://sgen-sites.github.io/originalsca-redesign/ (noindex). Shop Now, category and brand buttons
open the live Originals store menus.

## What is in it

- 53 pages: every live content page at its live URL (the Cannablog posts word for word, the legal and
  opt-in pages, the FAQs, both stores), plus Our Story, Strain Library, Collabs, Media, Drops, Events, Wholesale and
  Find Originals.
- Pick **Los Angeles** or **San Diego** anywhere; every Shop, category and brand button then opens that store's live
  menu, with its products and cart (Los Angeles: the Tymber menu; San Diego: its Weedmaps menu).
- A sticky store bar on every page (store switch, Shop Now, Call, Directions, today's hours with open/closed status),
  a 21+ gate with the 18+ medical option, and a California compliance footer.
- Every visible fact traces to the live site or to the client brief (`facts/client-facts.json`). Open questions are
  `[CONFIRM WITH CLIENT]` comments in the page source, never visible copy; the list is in `docs/PITCH-NOTES.md`.

## Build

Node 18+ and nothing else: no framework, no dependencies.

```bash
node src/build.mjs                                                          # dist/ (production URLs)
node src/build.mjs --preview --out dist-preview --base /originalsca-redesign/  # the Pages preview (noindex)
```

The build reads the live site's words from `src/content/capture.json` (recorded from the capture by the build).

## Verification on record

| check | result | evidence |
|---|---|---|
| every shop, category and brand destination shows products with add-to-cart and a cart | 33/33 pass, cart reacted in both stores | `audit/menu-verification.json`, `audit/menu-cart-*.png` |
| 21+ gate, store bar, store switch, drawer (phone and desktop) | 28/28 pass | `audit/ui-test.json` |
| site-reforge gate | 21 pass, 8 fail, 0 unproven | `audit/gate.json`, `docs/PUBLISH.md` |
| the live preview: every page answers with noindex; on a phone the gate, store bar and store switch work | 11/11 pass | `audit/preview-smoke.json` |


The verification tools drive headless Chromium through `playwright-core`: set `PW_CORE` to an install of it, or
install it next to `tools/`.

## Docs

`docs/DESIGN.md` (the design direction), `docs/BRAND-SYSTEM.md`, `docs/PITCH-NOTES.md` (kept, new, live-site
defects, every [CONFIRM WITH CLIENT] question), `docs/CHANGE-LOG.md` (a decision for every section of the old site),
`docs/DEPLOY.md`, `docs/MEDIA.md`, `docs/PUBLISH.md` (what was published and the checks run before it).

## Imagery and marks

Some scene photography is AI-generated; every such file is labelled (`data-ai="generated"` and IPTC
"trainedAlgorithmicMedia" in its metadata) and listed in `docs/MEDIA.md`. No AI image depicts a real person. The
Originals names, marks, photography and copy belong to Originals.
