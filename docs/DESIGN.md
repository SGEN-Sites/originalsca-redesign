# Originals redesign: art direction "Sunday Cruise"

Phase B decision record (site-reforge, redesign lane). Written before any page code. Every moment below traces to a
client fact: the live site, `facts/client-facts.json` (the operator brief of 2026-11-11) or the store itself as
described in that brief. Nothing here licenses new facts.

## 1. The idea

**A Sunday in LA, from golden hour to lights-out.** Originals is a family from one Los Angeles block that built a
grower, a warehouse store with a wall of legends, a car-show culture and a stage. The site is staged like that
store and lit like those events: chrome, candy paint and black-and-white portraiture on concrete.

The page moves through one continuous evening instead of stacked tiles (cohesive flow): the ground stays black and
concrete, and the light changes as you scroll.

| scroll | light | where it comes from |
|---|---|---|
| hero | the brand film's own grow-room light, seen through the giant ORIGINALS letters on black until it fills the screen | the brand film |
| shop | dusk shafts through tall arched windows, gold on polished concrete | the LA store: brick warehouse, arched windows, wood trusses, reflective floor |
| story, family wall | warm gallery light on white walls and black-and-white frames | the family wall of cultural originals, signed by the legends who visit |
| farm | magenta and white grow light | "they grow their own flower in-house" |
| cruise | candy-paint sunset over a palm-lined boulevard | the Lowrider Magazine Super Show in the brief's events; the sunset palms on the client's own San Diego banner |
| events (and the creed, removed 2026-11-12) | purple and pink stage spotlights through haze | their event stages |
| footer | night: the crown, the bandana trim, the creed signed off in script (since 2026-11-12 the editorial footer, option C, with no creed) | the creed and hashtags |

In the default flat look (section 2) these light effects are off: the photography and video carry the scene's
colour, and the brand (logo, lettering, buttons) stays flat black and white on top of it.

Name in the token file header: **Sunday Cruise**.

## 2. Palette (tokens.css; colours named, measured values kept)

The live site measures as monochrome (computed style, 64 captures): ink #282828, white, black, warm dark #463939,
greys, grounds #000000 / #0E0E0E / #F5F5F5, and the logo files it serves carry no colour. **The brand follows that:
flat black and white.** The logo, the lettering, buttons, rims, plaques and tapes are solid white on ink (ink on
paper), with no chrome, glow, neon, shine or coloured light (`src/styles/flat.css`). Photography and video keep
their own colour. One exception, at the owner's request: the award badge in the hero turns metallic gold and
glows once the hero has revealed (`--gold*` tokens). The brief proposed Originals red
#E11D2C with candy paint and coloured stage light; that palette is kept as one switch, `:root[data-accent='red']` in
`tokens.css`, until the client confirms whether they want an accent [CONFIRM WITH CLIENT]. Preview it by adding
`?accent=red` to any URL (it stays on for that browser tab; `?accent=mono` turns it off).

| token | black and white (default) | red (brief's proposal) | use | contrast (default) |
|---|---|---|---|---|
| `--ink` | #0A0A0B | same | main ground | --text (#F4F4F2) on it 17.97:1 |
| `--concrete` | #2B2B2F | same | concrete bands, cards | |
| `--steel` | #A3A3AB | same | secondary text on ink | 7.90:1 on --ink |
| `--paper` | #F3F1EC | same | the one "lights on" band (family wall) | --text-on-paper on it 15.99:1 |
| `--warm-dark` | #463939 | same | measured live tone: hairlines and muted text on paper | 9.77:1 on --paper |
| `--accent` / `--on-accent` | white / ink | #E11D2C / white | primary buttons, active segments, crowns, dots | ink on white 19.79:1 |
| `--accent-hi` / `--accent-deep` | white / #16161A | #FF3B47 / #9E0F1B | accent text and links on ink / on paper (links stay underlined) | 19.79:1 / 15.99:1 |
| `--accent-fabric` | black | #E11D2C | the bandana trim and the drop-list bandana (white paisley) | white on black 21:1 |
| `--candy-*`, `--sheen-*` | greys and light chrome | red, candy pink, candy violet | hover shifts only, never body text | ink on the darkest sheen 11.85:1 |
| `--stage-*`, `--dusk` | steel and white light | violet and pink; gold | light pools, beams and window shafts only | |
| `--ai-photo` | grayscale(0) | grayscale(0) | generated scenes and loops keep their colour; grayscale(1) would render them black and white (off) | |
| `--chrome-*` | white to steel to near-black horizon line | same | gradient fill for display words, rims and edges | display only |

Rules: light never sits under body text; one accent per heading; photography and video keep their colour (the family
wall stays black and white because the brief describes the real wall that way); the open/closed status dots keep
green and red because they carry meaning. The brief's look (red, chrome lettering, coloured light) skips
`flat.css` and the default tokens when `data-accent="red"` is set.

## 3. Type

| role | face | why | live equivalent |
|---|---|---|---|
| chrome display word | UnifrakturCook 700 | the Old English of lowrider plaques and chrome car-club lettering | (new) |
| headline | League Gothic | open stand-in for News Gothic Extra Condensed Bold (commercial, cannot ship in a public repo) | ParaType News Gothic Extra Cond Bold |
| UI, kickers, buttons | Barlow Condensed 600/700 | stand-in for News Gothic Condensed Bold | ParaType News Gothic Cond Bold |
| body | Source Sans 3 | the open successor of the live site's Source Sans Pro | Source Sans Pro |
| script accent | Yellowtail | lowrider plaque script for the hashtags (and for the creed sign-off until the creed was removed on 2026-11-12) | (new) |
| autographs | Mrs Saint Delafield | was the signatures that wrote themselves onto the family wall; no longer used since the 2026-11-12 wall rebuild (still declared in tokens.css and base.css, never downloaded) | (new) |

Open decision for the client: licensing ParaType News Gothic for web would let the headline and UI faces return to
the brand's own (see PITCH-NOTES).

Scale: display clamp up to about 9rem for the chrome word (once per page), headlines clamp 2.4 to 5.6rem at line
height 0.92, body 17px at 1.65, kickers 13px caps tracked .16em. Nothing visible under 13px on a phone.

## 4. The three planes

- **Back plane, bands.** `.band` (isolation, visible overflow) with a clipped `.band__clip` holding stills, film,
  haze and light pools. One key light per band, positioned by `--lx/--ly`. Grain is an inline SVG turbulence at
  about 6%. Real client media is graded into the palette with a filter; generated stills are shot on black so they
  screen onto the grounds.
- **Mid plane, chrome and glass.** Chrome rims (gradient borders) frame plates, cards and the store dash; frosted
  smoked glass only where something varied sits behind it (film, stage light, photos). Long reading sits on plain
  ink or paper.
- **Front plane, depth objects.** Generated bud cut-outs and the lowrider cross band seams, at most one or two per
  screen, smaller on phones, never causing sideways scroll.

## 5. Signature moments (each traced to a fact)

| moment | what it does | fact it carries | motion idea (built from scratch in vanilla JS and CSS) |
|---|---|---|---|
| Shop bar (header) | the crown alone is the logo; the menu categories sit in the bar as quick links to the chosen store's live menu, beside the LA/SD switch with live hours and Shop Now; More opens the pages, both stores, culture and the rest | shop by category; both stores' menus and hours | own build |
| Into the film (home hero) | the brand film plays inside the giant arched ORIGINALS letters (the brand's own wordmark) with the crown beneath; scrolling grows the letters until the film fills the screen, then "The Brand Behind The Brands", the headline, the store switch and the Shop buttons arrive; a Pause film control; at its foot the film fades into the next band, so there is no seam; when the reveal completes, the award badge turns gold, a glint crosses it and a gold glow settles | the hero film, the wordmark and crown, family owned and operated since 2006, both stores, the award badge | a scroll-driven dive through the lettering into the film; a one-time gold glint |
| The Menu | the heading and its lede side by side; the categories as a bento box of nine photo cards packed close (owner's reference and requests, 2026-11-12): four interlocking columns on wide screens (one screen tall), three on tablets, two on phones with merch across both; each card has a thin frame, its number, name, a short description and a Shop Now for the selected store's menu; at rest the photos are black and white and the frame and number white; on hover, keyboard focus or a press the photo takes its colour, the frame and number turn gold, the card grows a little and the others dim (the fan of 2026-11-11 is retired) | shop by category; LA Tymber and San Diego menus | colour, gold, grow and dim on hover (no grow with reduced motion) |
| Happy Hour | the deals as a spotlight reel (owner-approved lab option B): the band opens on its titles (the neon "Happy Hour / All Day Sunday" sign, "Cannabis deals" and the lede) filling a sticky stage. A short scroll (80vh, reversible: owner, 2026-11-12) docks them small in the upper right above the tabs, and deal 01 takes the stage as a title card (its photo opens like a shutter and slowly zooms, its texts smoke in, the button's sheen sweeps). The tabs pick the other deals, and no zoom or card motion follows the scroll. The band fades from ink at both edges. The Happy Hour card is the owner's lowrider photo, AI-extended to fill the card, with both heads clear of the text and the number. Phones get a swipeable stack with tabs; reduced motion and no JS get a grid of four cards | all-day Sunday happy hour, first-time patient deals, San Diego daily deals | the titles dock on scroll; opening titles per deal; a tablist picks; pointer tilt and glare |
| The block (story) | polaroids develop like darkroom prints as they enter; handwritten captions | elementary school friends from one LA block; family since 2006 | darkroom develop on reveal |
| The Family Wall | rebuilt 2026-11-12 (owner): the text on the left; on the right "the wall", a digital replica of the store's black-and-white portrait wall: one seamless repeat of the wall print (`family-wall-unit`, rebuilt flat from the store's own photos, no AI) repeated edge to edge in a sideways-scrolling strip that bleeds off the right edge with soft edge fades; native sideways scroll, drag, prev/next buttons; a light gallery spotlight in the red accent | the living family wall that legends sign | native overflow-x scroll (no snap) + drag, mask-image edge fades |
| From the farm | merged into the Sunday Cruise section on 2026-11-12 (owner); before that, its own band: magenta grow-room film, frosted buds crossing the seams with parallax | in-house cultivation, over half a million square feet indoor (live FAQ) | parallax depth objects (retired with the band) |
| Sunday Cruise | "The Roadside Sign" since 2026-11-12 (owner-picked lab option B, with From the farm merged in): the copy (From the farm, "Grown by OGs, for OGs", the 2006 lede) beside a roadside sign whose white letter board lists the ten house strains and the Strain library; the lowrider (black and white by default, candy red in the red alternate) rolls in as you scroll and parks under the sign with a hydraulic hop; reduced motion and no script get the still, complete scene. Before: a lowrider rolling across a sunset boulevard, wheels turning, a hydraulic hop at the end | lowrider culture; grown by OGs for OGs; the house strains | own build |
| The Creed | removed everywhere on 2026-11-12 (owner: "I don't think we need the creed at all"). It was: stage beams rise from the floor; a spotlight drifts across the creed and lights one line at a time | Mastering Our Craft, Always Room For Improvement, Good, Better, Best, California's Best | a drifting spotlight over dimmed text; beams rising from the floor |
| Store dash | the sticky bottom bar: store switch, Shop Now, Call, Directions, Today's hours with live open/closed | both stores' real hours and phones | sticky pickup bar pattern |
| Footer finale | since 2026-11-12 the editorial footer (owner pick, the section lab's option C): a giant ORIGINALS wordmark with the same 39 links and the legal lines, no creed. Before: bandana trim (white paisley on black; red in the red alternate), crown, the creed in script, the chrome wordmark on a reflective edge | the brand's own lines | own build |

Inner pages reuse the same vocabulary: Events opens with a neon tube that pours stage light down and flyers that
trail the pointer; Collabs drops the partner names as chips into a physics pile; Rewards shows a chrome VIP card that
tilts with a sheen.

## 6. Motion rules

- Everything off under `prefers-reduced-motion`: final states shown, film replaced by its poster, the cruise a
  still, complete scene (and, until its removal on 2026-11-12, the creed fully lit).
- Visible without JS: hidden states are gated on `html.js`; a 2.5 s fail-safe reveals everything.
- Animate transform, opacity and filter only; one shared rAF loop; IntersectionObserver gates every loop; nothing
  runs in a hidden tab.
- Pointer effects only for `(pointer: fine)`; touch gets a gentle autoplay where the moment needs motion.
- Easing `cubic-bezier(.16,1,.3,1)`; durations .25 / .5 / 1 s; ambient loops 9 to 60 s.

## 7. Imagery

- Kept from the client (never altered by AI): the hero film, the logo marks, the crown pattern backdrop, the award
  badge, event flyers.
- Replaced: the live site's stock photos (Shutterstock, Unsplash, Pexels) on the category tiles and posts' hero
  images where they are generic.
- Generated with fal (FLUX1.1 [pro] ultra stills, BiRefNet cut-outs, Kling image-to-video loops): mood and
  illustration only. No people, no faces, no hands, no text, no logos, no smoking. The family wall used to hold
  symbolic black-and-white still lifes (gloves, microphone, basketball, wire wheel, trumpet, brushes, typewriter,
  crown, camera, records); since 2026-11-12 it shows the store's own wall photos (PITCH-NOTES #30) and the still
  lifes are on no page. Labelled in metadata and `data-ai="generated"`, with one footer line; no visible tag on the
  image.

## 8. Home section order mapped to the narrative slots

| # | section | slot |
|---|---|---|
| 1 | Into the film hero: H1 "Best Cultivators in California", "The Brand Behind The Brands", store switch, Shop Now, Our Story | value-proposition |
| 2 | The Menu (shop by category, per store) | benefits-solution |
| 3 | Happy Hour deals | strategic-cta |
| 4 | The block (our story teaser, stats) | trust-positioning |
| 5 | The Family Wall | trust-positioning |
| 6 | Sunday Cruise, "The Roadside Sign", with From the farm (house strains) merged in on 2026-11-12 | benefits-solution |
| 7 | Stores, "Editorial" (LA, San Diego, Clothing) | trust-positioning |
| 8 | Culture: events (a lenticular carousel) and collabs | trust-positioning |
| 9 | Brands we carry, Cannablog | benefits-solution |
| 10 | Drop list sign-up, FAQ preview | strategic-cta / objection-handling |
| 11 | Footer | footer |

Until 2026-11-12 the order also had From the farm as its own section (benefits-solution) and The Creed
(trust-positioning); the owner merged the first into the Sunday Cruise and removed the second. The slots above are
the change-control ledger's (`audit/change-control.json`), which the gate's narrative check reads.

Social proof stays empty: the live site carries no testimonials and none are invented.
