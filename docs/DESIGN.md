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
| hero, shop | dusk shafts through tall arched windows, gold on polished concrete | the LA store: brick warehouse, arched windows, wood trusses, reflective floor |
| story, family wall | warm gallery light on white walls and black-and-white frames | the family wall of cultural originals, signed by the legends who visit |
| farm | magenta and white grow light | "they grow their own flower in-house" |
| cruise | candy-paint sunset over a palm-lined boulevard | lowrider car shows; "sunset palms for San Diego" |
| creed, events | purple and pink stage spotlights through haze | their event stages |
| footer | night: the crown, the red bandana trim, the creed signed off in script | the creed and hashtags |

Name in the token file header: **Sunday Cruise**.

## 2. Palette (tokens.css; colours named, measured values kept)

The live site measures as monochrome (computed style, 64 captures): ink #282828, white, black, warm dark #463939,
greys, grounds #000000 / #0E0E0E / #F5F5F5. The operator brief adds **Originals red #E11D2C** as the one accent.

| token | value | use | contrast |
|---|---|---|---|
| `--ink` | #0A0A0B | main ground | --text (#F4F4F2) on it 17.97:1 |
| `--ink-2` | #141416 | raised ground | |
| `--concrete` | #2B2B2F | concrete bands, cards | |
| `--steel` | #A3A3AB | secondary text on ink | 7.90:1 on --ink |
| `--paper` | #F3F1EC | the one "lights on" band (family wall) | --text-on-paper on it 15.99:1 |
| `--warm-dark` | #463939 | measured live tone: hairlines and muted text on paper | 9.77:1 on --paper |
| `--red` | #E11D2C | CTAs, the crown, one accent per heading | 4.16:1 on --ink, so large text and fills only; white button label on red 4.76:1 |
| `--candy-*` | red, candy pink #FF3D6E, candy violet #7B2CBF | candy-paint hover shifts only, never body text | |
| `--stage-violet`, `--stage-pink` | #8B3DFF, #FF2E93 | stage light pools and beams only | |
| `--dusk` | #F2B15C | window light shafts only, never text | |
| `--chrome-*` | white to steel to near-black horizon line | gradient fill for display words, rims and edges | display only |

Rules: light never sits under body text; one accent per heading; candy and stage colour stay at the edges.

## 3. Type

| role | face | why | live equivalent |
|---|---|---|---|
| chrome display word | UnifrakturCook 700 | the Old English of lowrider plaques and chrome car-club lettering | (new) |
| headline | League Gothic | open stand-in for News Gothic Extra Condensed Bold (commercial, cannot ship in a public repo) | ParaType News Gothic Extra Cond Bold |
| UI, kickers, buttons | Barlow Condensed 600/700 | stand-in for News Gothic Condensed Bold | ParaType News Gothic Cond Bold |
| body | Source Sans 3 | the open successor of the live site's Source Sans Pro | Source Sans Pro |
| script accent | Yellowtail | lowrider plaque script for the creed sign-off and hashtags | (new) |
| autographs | Mrs Saint Delafield | the signatures that write themselves onto the family wall | (new) |

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
| The Showroom (home hero) | the brand film plays inside a tall arched window; giant chrome ORIGINALS (the brand's own wordmark, extruded in stacked plates) stands on a mirror floor and reflects; letters lift toward the pointer; dusk shafts sweep; scrolling pushes through the arch | giant freestanding ORIGINALS letters, arched windows, reflective polished concrete, the hero film | letters that lift toward the pointer in stacked plates; a chrome shine sweep |
| Hashtag tape | a chrome tape and a red tape cross the hero seam, scrolling with scroll velocity | #beoriginal #comingforthecrown #grownbyogsforogs #yourockthecrown | marquee speed follows scroll velocity |
| The Menu | chrome category badges, candy-paint colour shift and a chrome shine on hover, the store switch above | shop by category; LA Tymber and San Diego menus | shine sweep and colour shift on hover |
| Happy Hour | a neon sign flickers on; deals hang as chrome chain-link car-club plaques | all-day Sunday happy hour, first-time patient deals, San Diego daily deals | neon switch-on flicker |
| The block (story) | polaroids develop like darkroom prints as they enter; handwritten captions | elementary school friends from one LA block; family since 2006 | darkroom develop on reveal |
| The Family Wall | a salon hang of black-and-white frames on white brick; a gallery spotlight follows the pointer and frames near it lean forward; autographs write themselves on as you scroll | the living family wall that legends sign | a pointer lens over a portrait grid |
| From the farm | magenta grow-room film, frosted buds crossing the seams with parallax | in-house cultivation, over half a million square feet indoor (live FAQ) | parallax depth objects |
| Sunday Cruise | a candy-red lowrider rolls across a sunset boulevard as you scroll, wheels turning, a hydraulic hop at the end | lowrider culture; grown by OGs for OGs | own build |
| The Creed | stage beams rise from the floor; a spotlight drifts across the creed and lights one line at a time | Mastering Our Craft, Always Room For Improvement, Good, Better, Best, California's Best | a drifting spotlight over dimmed text; beams rising from the floor |
| Store dash | the sticky bottom bar: store switch, Shop Now, Call, Directions, Today's hours with live open/closed | both stores' real hours and phones | sticky pickup bar pattern |
| Footer finale | red bandana trim, crown, the creed in script, the chrome wordmark on a reflective edge | the brand's own lines | own build |

Inner pages reuse the same vocabulary: Events opens with a neon tube that pours stage light down and flyers that
trail the pointer; Collabs drops the partner names as chips into a physics pile; Rewards shows a chrome VIP card that
tilts with a sheen.

## 6. Motion rules

- Everything off under `prefers-reduced-motion`: final states shown, film replaced by its poster, the lowrider
  parked mid-street, the creed fully lit.
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
  illustration only. No people, no faces, no hands, no text, no logos, no smoking. The family wall holds
  symbolic black-and-white still lifes (gloves, microphone, basketball, wire wheel, trumpet, brushes, typewriter,
  crown, camera, records), never anyone's likeness. Labelled in metadata and `data-ai="generated"`, with one
  footer line; no visible tag on the image.

## 8. Home section order mapped to the narrative slots

| # | section | slot |
|---|---|---|
| 1 | The Showroom hero: H1 "Best Cultivators in California", "The Brand Behind The Brands", store switch, Shop | value-proposition |
| 2 | Hashtag tape | value-proposition |
| 3 | The Menu (shop by category, per store) | benefits-solution |
| 4 | Happy Hour deals | strategic-cta |
| 5 | The block (our story teaser, stats) | trust-positioning |
| 6 | The Family Wall | trust-positioning |
| 7 | From the farm (house strains) | benefits-solution |
| 8 | Sunday Cruise | value-proposition |
| 9 | The Creed | trust-positioning |
| 10 | Stores (LA, San Diego, Clothing) | strategic-cta |
| 11 | Culture: events and collabs | trust-positioning |
| 12 | Brands we carry, Cannablog | benefits-solution |
| 13 | Drop list sign-up, FAQ preview | strategic-cta / objection-handling |
| 14 | Footer | footer |

Social proof stays empty: the live site carries no testimonials and none are invented.
