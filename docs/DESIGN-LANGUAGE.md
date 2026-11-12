# Design language (as applied through 2026-11-12)

The principles behind the owner-approved home page, store pages and /deals, written so the remaining inner pages can
follow them. Each principle names the shipped example to reuse. DESIGN.md holds the full system (tokens, type,
section catalogue); this is the short brief. Items marked *(landing)* were being built when this was written.

## 1. Brand and colour
- **The brand is flat black and white** (`src/styles/flat.css`, tokens in `tokens.css`): logo, lettering, buttons,
  rims. **Photos keep their colour.** The one colour accent is **gold**, and only on interaction: hover or focus
  frames and numbers (the category wall; brand marquee hover; Save now bento *(landing)*).
- **Black and white until interaction** is a deliberate exception, for image grids only (the home category wall: B&W
  at rest, colour on hover/focus, `(hover: hover)` gated).
- Dark bands by default. A **white "lights-on" band** is used for galleries (the Family Wall). No grid texture,
  no paper tint there.
- **Tokens only** in CSS (gate C13): no hex, rgb() or hsl().

## 2. Type
- Condensed display caps for headings and big numbers; **one Old English chrome word** per heading
  (`.chrome-word`, "Two stores. *One family.*"); the Yellowtail script accent sparingly (`.script.accent`).
  `font-kerning: none` on chrome words (UnifrakturCook's c+k pair).
- Big numerals carry deals (30%, 50%): huge, white, with a small caps line beside them ("OFF FTP").

## 3. Imagery
- **Real before AI.** The client's own photos first: the business's own Google Maps "By owner" photos at full size
  (`private/client-media/maps-la/`), owner-supplied photos, live-site media. AI stays for mood only and is labelled
  (`data-ai="generated"`). Never let AI stand in for the store, staff, customers or products.
- Every image is a factual claim: the alt describes the pixels; provenance lives in `src/content/images.json`
  `source`, `docs/MEDIA.md` and a `confirm()` + PITCH-NOTES item when unconfirmed (people, rights, prices shown).
- **Crop to the subject**: signs, faces and products stay whole beside the text at every card shape (the SD card's
  ORIGINALS sign rule; the Daily jar).
- **Pop-out**: a cut-out subject may break its frame (the Save now bud over its tile border *(landing)*).
- Grade: the site's light cinematic grade (`private/film-grade/grade.py grade_rich`, s 0.3-0.5 for store photos).

## 4. Layout patterns (reuse these, don't invent new ones)
| Pattern | Use it for | Shipped example |
|---|---|---|
| **Editorial grid**: numbered items (01, 02), hairline rules, huge display names, a ruled fact grid (ADDRESS / HOURS / CALL) | places, people, facts, the footer | home Stores *(landing)*, footer C *(landing)* |
| **Bento**: interlocking tiles, 12 px gaps, one clean rectangle, flat outer edges, about one screen tall | offers, categories, mixed content | home category wall; /deals Save now *(landing)* |
| **Sideways strip**: native scroll, snap, drag, prev/next buttons, "SCROLL →" hint, edge fades | long sets: photos, stores, items | Family Wall strip; Stores scroller *(landing)* |
| **Carousels with depth**: concave "cave", lenticular turn, spotlight reel | 3-6 featured items | /deals cave; events lenticular *(landing)*; home deals reel |
| **Signage**: a lit letter board / pole sign, at most one per page | a list that belongs to the scene | home Sunday Cruise "Roadside Sign" |
| **Marquee**: white logos on dark, **no containers**, two rows opposite directions, pause button | brands, partners | home brand marquee; collab tape *(landing)* |
| **Split head**: kicker + h2 left, lede beside it on one line at 900 px+ | section heads | home category head |

## 5. Rhythm and finish
- **Compact**: a section is about one screen tall at 1440x900; no tall empty padding; **a section hugs its content**
  (the Family Wall's band ends at the strip's edges).
- **No containers for their own sake**: no boxes around logos; cards only where they carry content.
- **Gradients are eased** (10-14 stops, smoothstep), never a hard scrim edge; check banding.
- **Effects**: smoke-in titles, reveal on scroll, hover lift/zoom with gold; every effect has a reduced-motion state
  (static, complete) and a no-JS state (complete content).

## 6. Non-negotiables (gates and tests)
- No new copy (B3): only the live site's words, the client facts, UI labels. Unconfirmed facts get `confirm()`.
- Contrast 4.5:1 (3:1 for large text) on rendered pixels; tap targets 44 px+; real links, buttons and labelled forms;
  one h1; sensible heading order; no sideways page scroll at 1440 / 1280 / 1024 / 390.
- Every change ships with a `tools/test-ui.mjs` block and screenshots at 1440x900 and 390x844; the full suite passes
  before the preview is updated.
