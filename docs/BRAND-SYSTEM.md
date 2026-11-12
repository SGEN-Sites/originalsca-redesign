# Brand system: Sunday Cruise

Derived from the live site by `sr-tokens.mjs` (the measured layer at the top of `src/styles/tokens.css`), then
extended with the Sunday Cruise layer below it (docs/DESIGN.md). Change values in `tokens.css`, never at a call site.

## Evidence

`audit/design-baseline.json` evidence: **computed (browser capture)**: 64 captures (16 live pages x 390/768/1024/1440)
plus a scroll pass on the home page. The live site measures monochrome: ink #282828, white, black, warm dark #463939,
greys, grounds #000000 / #0E0E0E / #F5F5F5, and its logo files carry no colour. The build follows it: **black and
white, with a white accent**. The operator brief proposed Originals red #E11D2C; it is one switch away,
`:root[data-accent='red']` at the end of `tokens.css` (`?accent=red` previews it), until the client decides
[CONFIRM WITH CLIENT].

## Colour

| token | default (black and white) | red alternate | role |
|---|---|---|---|
| `--ink`, `--ink-2`, `--ink-3` | #0A0A0B, #121214, #1B1B1F | same | grounds, raised grounds, cards |
| `--concrete`, `--concrete-2` | #2B2B2F, #3A3A40 | same | concrete bands |
| `--paper` | #F3F1EC | same | the one "lights on" band (the family wall) |
| `--text`, `--steel`, `--steel-2` | #F4F4F2, #A3A3AB, #7D7D86 | same | text on dark |
| `--text-on-paper`, `--muted-on-paper`, `--warm-dark` | #16161A, #4D4646, #463939 (live) | same | text on paper |
| `--accent`, `--on-accent`, `--accent-hover` | white, ink, #E4E8ED | #E11D2C, white, #FF3B47 | primary buttons, active segments, crowns, dots |
| `--accent-hi`, `--accent-deep` | white, #16161A | #FF3B47, #9E0F1B | accent text and links on ink, on paper |
| `--accent-tint`, `--accent-glow` | white at 40%, a soft white glow | red | hazes and glows |
| `--accent-fabric` | black | #E11D2C | the bandana trim and the drop-list bandana |
| `--accent-panel`, `--plaque-face` | concrete gradients | red gradients | the San Diego deal panel, the deal plaques (white text) |
| `--sheen-1..3`, `--candy-1..4` | light chrome; greys | red, #FF3D6E, #7B2CBF (#FF8A3D) | hover shifts only |
| `--stage-1..3`, `--dusk`, `--dusk-2`, `--grow` | steel and white light | #8B3DFF, #FF2E93, #3D5CFF; #F2B15C, #FFD9A0; #E04BFF | light pools, beams, window shafts, the Prop 65 frame |
| `--ai-photo`, `--film-filter` | grayscale(0); the film in colour, darkened | same | generated scenes and loops, the hero film (images keep their colour) |
| `--focus` | white (ink on paper) | #FFD166 | the focus ring |
| `--gold`, `--gold-hi`, `--gold-deep`, `--gold-glow` | #F3C34F, #FFF4C8, #A8740F; a three-layer gold glow | same | the hero's award badge, gold once the hero has revealed, and the thin frames and numbers on the category cards (owner requests, 2026-11-11) |
| `--chrome-1..7`, `--plate-1..2` | white to #2B2F35 horizon | same | chrome display lettering and rims |

**The brand is flat** (`src/styles/flat.css`, the default look): the logo, chrome lettering, buttons, rims, plaques
and tapes render as solid white on ink or ink on paper, and every glow, neon, shine sweep, light beam and haze is
off. Photography and video keep their own colour in both looks; the open/closed status dots stay green and red
because the colour carries meaning. One exception, at the owner's request: the award badge in the home hero turns
metallic gold and glows once the hero has revealed (`--gold*`, `src/styles/hero.css`).

Measured contrast (WCAG 2.x relative luminance, computed for this file):

| foreground | background | ratio | use |
|---|---|---|---|
| #F4F4F2 `--text` | #0A0A0B `--ink` | 17.97:1 | body text |
| #A3A3AB `--steel` | #0A0A0B `--ink` | 7.90:1 | secondary text |
| #A3A3AB `--steel` | #1B1B1F `--ink-3` | 6.85:1 | text on cards |
| #7D7D86 `--steel-2` | #0A0A0B `--ink` | 4.85:1 | tertiary, large text only |
| #0A0A0B `--on-accent` | #FFFFFF `--accent` | 19.79:1 | button and badge labels (default) |
| #0A0A0B | #C3C9CF darkest button sheen | 11.85:1 | button label on hover (default) |
| #FFFFFF | #3A3A40 / #2B2B2F concrete | 11.30:1 / 14.10:1 | the deal panel and plaques (default) |
| #FFFFFF | #000000 `--accent-fabric` | 21.00:1 | the paisley bandana (default) |
| #16161A `--text-on-paper` | #F3F1EC `--paper` | 15.99:1 | text and links on paper |
| #4D4646 `--muted-on-paper` | #F3F1EC `--paper` | 8.16:1 | secondary text on paper |
| #0A0A0B `--ink` | #E4E8ED `--chrome-2` | 16.08:1 | chrome button labels |
| #FFFFFF | #E11D2C red | 4.76:1 | red button labels, bold 16px+ (red alternate) |
| #E11D2C red | #0A0A0B `--ink` | 4.16:1 | large text and fills only (red alternate) |
| #FF3B47 / #9E0F1B | ink / paper | 5.62:1 / 7.33:1 | links (red alternate) |

## Type

| role | face | file | live equivalent |
|---|---|---|---|
| chrome display word | UnifrakturCook 700 | `unifrakturcook-normal-700.woff2` | (new) |
| headline | League Gothic | `league-gothic-normal-400.woff2` | ParaType News Gothic Extra Cond Bold (commercial) |
| UI, kickers, buttons | Barlow Condensed 600/700 | `barlow-condensed-normal-600/700.woff2` | ParaType News Gothic Cond Bold (commercial) |
| body | Source Sans 3 | `source-sans-3-normal-400-700.woff2` + italic | Source Sans Pro |
| script | Yellowtail | `yellowtail-normal-400.woff2` | (new) |
| autographs | Mrs Saint Delafield | `mrs-saint-delafield-normal-400.woff2` | (new) |

All SIL Open Font License, self-hosted (`src/assets/fonts/fonts.json` records each source URL). Scale: display
`--fs-mega` up to 11rem (once per page), `--fs-h1` up to 6.6rem, `--fs-h2` up to 5.4rem, body 17px at 1.65, kickers
13px caps tracked .16em. Nothing visible under 13px.

## Space, shape, layout

Wrap 1320px with a 16 to 56px gutter; band padding clamp(72px, 9vw, 150px); radii 12px buttons, 14px media, 22 to
26px cards, pill chips; header 76px (118px from 760 to 1279px, where the category row moves under the bar; 114px on phones); sticky store
dash 64px (72px on phones). Breakpoints used: 1280 and 760 (the shop bar), 1440, 1100, 1000, 960, 900, 860, 834,
720, 640, 620, 600, 560, 520, 390. Shadows: `--shadow-deep`, `--shadow-card`,
`--shadow-paper`, `--accent-glow`.

## Motion

`src/styles/motion.css` keeps the live site's keyframes verbatim as the record (sr-motion); the redesign's own
motion lives in `signature.css`, `hero.css`, `nav.css` and `site.js`: reveals (fade up with a blur lift), the hero's
dive through the ORIGINALS letters into the film, the award badge's gold glint, the collab tape, neon switch-on, polaroids
developing, the family-wall gallery light (the autographs written by scroll were retired with the 2026-11-12 wall
rebuild), the lowrider cruise and hydraulic hop, count-ups, parallax buds, tilt and magnetic buttons (fine pointers
only), the events' lenticular cards, the events flyer trail and the collab chip pile (the creed spotlight went with
the creed on 2026-11-12). Easing `cubic-bezier(.16,1,.3,1)`. Every one of them is off under
`prefers-reduced-motion` (final states shown, no film, no loops) and the page is complete without JavaScript.
