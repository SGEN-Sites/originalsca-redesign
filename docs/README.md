# Originals: developer README

The Originals website redesign ("Sunday Cruise"), rebuilt from originalsca.com with site-reforge. A static,
platform-free build: Node builtins only, no framework, no runtime dependency. `audit/` is the evidence behind it.

## Run it locally

```bash
node src/build.mjs                       # renders src/ into dist/
node ~/.claude/skills/site-reforge/scripts/sr-serve.mjs --root dist    # or any static server
# Pages preview (noindex, served under /originalsca-redesign/):
node src/build.mjs --preview --out dist-preview --base /originalsca-redesign/
```

## Structure

| path | what |
|---|---|
| `src/build.mjs` | the build: pages, one CSS file, one JS file, assets |
| `src/content/site.mjs` | every store fact, link, hours line and menu URL, with its source |
| `src/lib/` | `html.mjs` (escaping, base-aware URLs), `layout.mjs` (shell, header, footer, store dash, 21+ gate), `parts.mjs` (components), `seo.mjs` (JSON-LD), `capture.mjs` (the live words: read from `audit/raw/` where the capture exists and recorded to `src/content/capture.json`; a clone without the capture builds from that file) |
| `src/pages/` | home, blog (21 live posts), shop, stores, story, culture, business, legal, misc |
| `src/styles/tokens.css` | the brand system: change values HERE, never at a call site |
| `src/styles/flat.css` | the default flat black-and-white brand layer (the brief's red and chrome look skips it: `?accent=red`) |
| `src/styles/nav.css` | the header, the shop bar: the crown, the menu-category quick links, the LA/SD switch with live hours, Shop Now and the More panel |
| `src/styles/hero.css` | the home hero, Into the film: the film inside the giant ORIGINALS letters grows to full screen as you scroll, then the headline, store switch and Shop buttons arrive; the award badge turns gold (after flat.css, so it wins the cascade) |
| `src/styles/home.css` | owner-requested home pieces: the category wall (a bento box of photo cards) and its heading, the seam award emblem and the smoke text effect |
| `src/styles/motion.css` | the live site's keyframes, verbatim (the motion record) |
| `src/scripts/site.js` | all behaviour; every URL comes from the page |
| `src/assets/` | fonts, brand marks (traced from the client's lockup), WebP images, H.264 loops |
| `tools/` | capture, imagery, verification and publishing tools |
| `facts/client-facts.json` | the operator brief's facts; `confirm: true` items are [CONFIRM WITH CLIENT] in page source |
| `docs/` | this directory: DESIGN, BRAND-SYSTEM, CHANGE-LOG, MEDIA, PITCH-NOTES, DEPLOY |
| `audit/` | inventories, ledger, sweeps, verification reports and the gate record |

## Before you change anything

Read `docs/CHANGE-LOG.md`. Every section of the old site has a recorded decision; that file says which sections were
preserved, which were restructured and which were deliberately removed, with the reason.

Shop links: every Shop, category and brand button goes to the selected store's live menu (Los Angeles: the Tymber
menu at originalsca.com/menu/los-angeles/; San Diego: its live Weedmaps menu). `tools/verify-menus.mjs` proves each
destination shows products with add-to-cart and a cart (`audit/menu-verification.json`). Re-run it before launch.

## Known open items

- Every [CONFIRM WITH CLIENT] item in `docs/PITCH-NOTES.md` (hours conflicts, the San Diego store site, collabs,
  events, Prop 65 wording, wholesale, forms, the 1450 Mirasol St and Massachusetts items).
- Forms are previews: they submit to `/form-sent`, which says nothing was sent. Connect a provider before launch.
- The headline and UI faces are open stand-ins for ParaType News Gothic (commercial); license it to restore it.
- The gate verdict and its open checks are in `audit/gate.json` and summarised in `docs/PITCH-NOTES.md`.
