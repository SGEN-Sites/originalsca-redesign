# Brand system: Sunday Cruise

Derived from the live site by `sr-tokens.mjs` (the measured layer at the top of `src/styles/tokens.css`), then
extended with the Sunday Cruise layer below it (docs/DESIGN.md). Change values in `tokens.css`, never at a call site.

## Evidence

`audit/design-baseline.json` evidence: **computed (browser capture)**: 64 captures (16 live pages x 390/768/1024/1440)
plus a scroll pass on the home page. The live site measures monochrome: ink #282828, white, black, warm dark #463939,
greys, grounds #000000 / #0E0E0E / #F5F5F5. Originals red #E11D2C comes from the operator brief.

## Colour

| token | value | role |
|---|---|---|
| `--ink`, `--ink-2`, `--ink-3` | #0A0A0B, #121214, #1B1B1F | grounds, raised grounds, cards |
| `--concrete`, `--concrete-2` | #2B2B2F, #3A3A40 | concrete bands |
| `--paper` | #F3F1EC | the one "lights on" band (the family wall) |
| `--text`, `--steel`, `--steel-2` | #F4F4F2, #A3A3AB, #7D7D86 | text on dark |
| `--text-on-paper`, `--muted-on-paper`, `--warm-dark` | #16161A, #4D4646, #463939 (live) | text on paper |
| `--red`, `--red-hi`, `--red-deep` | #E11D2C, #FF3B47, #9E0F1B | the one accent: CTAs, the crown, one word per heading |
| `--candy-1..4` | red, #FF3D6E, #7B2CBF, #FF8A3D | candy-paint hover shifts only |
| `--stage-violet`, `--stage-pink`, `--stage-blue` | #8B3DFF, #FF2E93, #3D5CFF | stage light pools and beams only |
| `--dusk`, `--dusk-2` | #F2B15C, #FFD9A0 | window light shafts; the Prop 65 frame |
| `--chrome-1..7`, `--plate-1..2` | white to #2B2F35 horizon | chrome display lettering and rims |

Measured contrast (WCAG 2.x relative luminance, computed for this file):

| foreground | background | ratio | use |
|---|---|---|---|
| #F4F4F2 `--text` | #0A0A0B `--ink` | 17.97:1 | body text |
| #A3A3AB `--steel` | #0A0A0B `--ink` | 7.90:1 | secondary text |
| #A3A3AB `--steel` | #1B1B1F `--ink-3` | 6.85:1 | text on cards |
| #7D7D86 `--steel-2` | #0A0A0B `--ink` | 4.85:1 | tertiary, large text only |
| #FFFFFF | #E11D2C `--red` | 4.76:1 | red button labels (bold, 16px+) |
| #E11D2C `--red` | #0A0A0B `--ink` | 4.16:1 | large text and fills only (AA large) |
| #FF3B47 `--red-hi` | #0A0A0B `--ink` | 5.62:1 | links on dark |
| #16161A `--text-on-paper` | #F3F1EC `--paper` | 15.99:1 | text on paper |
| #4D4646 `--muted-on-paper` | #F3F1EC `--paper` | 8.16:1 | secondary text on paper |
| #9E0F1B `--red-deep` | #F3F1EC `--paper` | 7.33:1 | links on paper |
| #0A0A0B `--ink` | #E4E8ED `--chrome-2` | 16.08:1 | chrome button labels |

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
26px cards, pill chips; header 72px (62px on phones); sticky store dash 64px (72px on phones). Breakpoints
used: 1120 (nav to drawer), 1100, 1000, 900, 760, 640, 600, 520. Shadows: `--shadow-deep`, `--shadow-card`,
`--shadow-paper`, `--glow-red`.

## Motion

`src/styles/motion.css` keeps the live site's keyframes verbatim as the record (sr-motion); the redesign's own
motion lives in `signature.css` and `site.js`: reveals (fade up with a blur lift), the chrome shine sweep on the hero
letters, pointer lift of the 3D letters, the tapes (speed follows scroll velocity), neon switch-on, polaroids
developing, the family-wall gallery light and autographs written by scroll, the lowrider cruise and hydraulic hop,
the creed spotlight, count-ups, parallax buds, tilt and magnetic buttons (fine pointers only), the events flyer trail
and the collab chip pile. Easing `cubic-bezier(.16,1,.3,1)`. Every one of them is off under
`prefers-reduced-motion` (final states shown, no film, no loops) and the page is complete without JavaScript.
