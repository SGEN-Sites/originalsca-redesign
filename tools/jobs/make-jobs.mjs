// make-jobs.mjs: build the fal job files for the redesign's generated imagery from named prompt blocks.
//   node tools/jobs/make-jobs.mjs        -> tools/jobs/stills.json (FLUX1.1 [pro] ultra)
// Blocks, in a fixed order: STYLE anchor, scene, NEGATIVE-SPACE note, EMPTY block, NO-TEXT block.
// Generated media is mood and illustration only: never the store, staff, customers, products or a real place.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const STYLE = 'Cinematic fine-art photograph for a Los Angeles lowrider and street-culture gallery: deep black shadows, polished chrome highlights, one hard key light, high contrast, rich blacks, fine 35mm film grain, shot on a full-frame camera.';
const STAGE = 'A faint purple and hot pink stage-light glow only at the very edges of the frame.';
const EMPTY = 'No people, no hands, no arms, no faces and no body parts anywhere in the frame.';
const NOTEXT = 'No text, no letters, no numbers, no words, no logos, no signs, no license plates, no labels, no watermark.';
const BW = 'Black and white fine-art gallery print, silver gelatin look, deep blacks, soft paper grain.';

const ultra = (name, aspect, parts, extra = {}) => ({
  name,
  endpoint: 'fal-ai/flux-pro/v1.1-ultra',
  input: { prompt: parts.filter(Boolean).join(' '), aspect_ratio: aspect, num_images: 1, output_format: 'png', safety_tolerance: '2', raw: false, enable_safety_checker: true, ...extra },
});

const stills = [
  // ---- hero and environment (the showroom) ----
  ultra('warehouse-hero', '21:9', [STYLE,
    'The interior of a vast old red-brick warehouse at dusk, seen straight on from the middle of the room: a back wall of very tall arched windows with black steel mullions pours dramatic shafts of hazy golden light down into the room, heavy dark timber roof trusses cross overhead, and a mirror-polished grey concrete floor reflects the arched windows like still water.',
    'The middle third of the frame and the whole lower half are open, calm and uncluttered: an empty floor waiting for a large sculpture, with soft haze in the light shafts.',
    STAGE, EMPTY, NOTEXT, 'No furniture, no shelves, no products, no sculptures.'], { raw: true }),
  ultra('warehouse-arches', '3:4', [STYLE,
    'Close view of two very tall arched warehouse windows in an old red-brick wall, black steel mullions, low sun streaming through them in solid shafts of dusty light that fall across a polished concrete floor, floating dust motes caught in the beams, deep shadow around the windows.',
    'The lower 40 percent of the frame is calm dark floor for a headline.', EMPTY, NOTEXT], { raw: true }),
  // ---- the cruise ----
  ultra('lowrider-side', '21:9', [STYLE,
    'A classic early-1960s American lowrider convertible with the top down, painted in deep candy-apple red with metal-flake sparkle, long chrome side trim, chrome wire-spoke wheels with thin whitewall tires, the body sitting very low over the wheels, shown in an exact side profile facing to the right, centered with space on both ends.',
    'It stands on a pure black seamless studio background with a glossy black floor giving a clean mirror reflection under the car; a long soft strip light rakes along the chrome and the candy paint.',
    EMPTY, 'No driver, no passengers, nobody inside the car.', NOTEXT, 'No badges, no emblems, no plates.']),
  ultra('la-boulevard-sunset', '21:9', [STYLE,
    'A wide, empty Los Angeles boulevard at the end of a golden-hour sunset, rows of very tall skinny palm trees silhouetted against a sky that grades from deep orange at the horizon through hot pink to violet, low flat-roofed stucco storefronts and telephone wires in silhouette, the asphalt glowing with reflected sunset light, long shadows.',
    'The lower third of the frame is open, empty road, clear for a car to drive across.',
    EMPTY, 'No cars, no traffic.', NOTEXT], { raw: true }),
  ultra('sd-palms-sunset', '16:9', [STYLE,
    'A quiet San Diego neighborhood street at sunset lined on both sides with tall palm trees, the sun low at the far end of the street throwing warm orange light and long shadows down the road, hazy pink and purple sky, a calm, warm feeling.',
    'The left half of the frame is darker and calmer for text.', EMPTY, 'No cars.', NOTEXT], { raw: true }),
  ultra('la-night-street', '16:9', [STYLE,
    'A Los Angeles industrial side street at night after rain: brick warehouse walls, a chain-link fence, wet black asphalt reflecting a deep red and violet glow from somewhere off frame, a single sodium streetlight, mist.',
    'The right half of the frame is dark and calm for text.', EMPTY, 'No cars.', NOTEXT], { raw: true }),
  // ---- from the farm ----
  ultra('grow-room', '21:9', [STYLE,
    'Inside a spotless indoor cannabis cultivation room: long, even rows of tall, healthy flowering cannabis plants under ranks of LED grow lights that cast a soft magenta and white glow, symmetrical one-point perspective straight down the center aisle, the far end fading into darkness, deep shadows at the edges.',
    'The center of the frame stays calm for a headline.', EMPTY, NOTEXT, 'No equipment labels, no screens.'], { raw: true }),
  ultra('bud-macro-a', '4:5', [STYLE,
    'Extreme macro photograph of one dense, frosty cannabis flower covered in glistening trichomes, deep forest green leaves with purple edges and bright orange pistils, lit by a single hard rim light from the upper left, set against a pure black background with nothing else in frame.',
    EMPTY, NOTEXT]),
  ultra('bud-macro-b', '1:1', [STYLE,
    'Extreme macro photograph of one lime-green cannabis flower with lavender tips, heavily frosted with sparkling trichomes and copper pistils, a cool white rim light from the right, isolated on a pure black background.',
    EMPTY, NOTEXT]),
  ultra('bud-macro-c', '1:1', [STYLE,
    'Extreme macro photograph of one very dark purple, almost black cannabis flower dusted with bright white trichome frost and a few amber pistils, a single magenta rim light from behind, isolated on a pure black background.',
    EMPTY, NOTEXT]),
  ultra('trichome-field', '21:9', [STYLE,
    'Ultra macro view across the surface of a cannabis flower: a forest of crystal-clear trichome heads like tiny glass mushrooms, shallow depth of field, amber and violet light, the background melting into black.',
    'The left half is darker and calmer for text.', EMPTY, NOTEXT]),
  // ---- events ----
  ultra('stage-crown', '16:9', [STYLE,
    'An empty concert stage at night seen from the middle of an empty floor: purple and hot pink moving-head spotlights cut through thick haze in sharp beams that converge at center stage, a glossy black stage floor reflects the beams, a truss rig of lights across the top of the frame.',
    'The center of the stage is open and glowing, empty, as if waiting for the headliner.', EMPTY, 'No crowd, no performers, no instruments.', NOTEXT, 'No screens.'], { raw: true }),
  ultra('stage-beams-wide', '21:9', [STYLE,
    'A very wide view of a dark festival stage with a fan of purple, magenta and white light beams sweeping up and out through haze from a low row of spotlights, the beams forming a crown-like silhouette of rays, black sky above, a glossy floor below.',
    'The middle of the frame is calm for a headline.', EMPTY, 'No crowd, no performers.', NOTEXT], { raw: true }),
  // ---- textures ----
  ultra('bandana-red', '16:9', [
    'Flat-lay textile macro photograph of a classic red cotton paisley bandana filling the entire frame edge to edge: the traditional white and black paisley teardrop, flower and dot motif, soft natural folds, even soft studio light, rich deep red, crisp printed pattern.',
    EMPTY, NOTEXT], { raw: true }),
  ultra('bandana-black', '16:9', [
    'Flat-lay textile macro photograph of a classic black cotton paisley bandana filling the entire frame edge to edge: the traditional white paisley teardrop, flower and dot motif printed on black, gentle folds, low raking studio light so the folds show, deep blacks.',
    EMPTY, NOTEXT], { raw: true }),
  // ---- the family wall: symbolic still lifes in black and white (no portraits, nobody's likeness) ----
  ...[
    ['wall-gloves', 'a pair of worn leather boxing gloves hanging by their laces from a nail on a whitewashed brick wall, dramatic side light, long shadow'],
    ['wall-mic', 'a vintage chrome stage microphone on a tall stand, caught in a single hard spotlight on a dark stage'],
    ['wall-basketball', 'a worn leather basketball resting on the painted line of an outdoor court at dusk, a long low shadow'],
    ['wall-wheel', 'a gleaming chrome wire-spoke lowrider wheel with a whitewall tire, close up, studio light tracing every spoke'],
    ['wall-trumpet', 'a well-used brass trumpet resting on a wooden chair in an empty club, a single soft spotlight'],
    ['wall-brushes', 'paint brushes and spray paint cans standing in a dented coffee can on a scaffold board, paint drips, a blank wall behind'],
    ['wall-typewriter', 'a vintage manual typewriter on a wooden desk with a blank sheet of paper in it, window light'],
    ['wall-crown', 'a simple antique metal crown resting on a folded velvet cloth, one hard key light, deep shadow'],
    ['wall-camera', 'a vintage rangefinder film camera with a worn leather strap on a dark table, raking light'],
    ['wall-records', 'a stack of vinyl records in paper sleeves leaning against a turntable, soft lamp light'],
  ].map(([name, scene]) => ultra(name, '4:5', [BW, 'Fine-art still life photograph: ' + scene + '.', 'Calm, honest, monumental, like a portrait of an object in a museum.', EMPTY, NOTEXT, 'The record sleeves and paper are plain.'])),
  // ---- shop by category: chrome-lit still lifes on black (no packaging, no labels) ----
  ...[
    ['cat-flower', 'a single large frosty cannabis flower resting on a black mirror surface, its reflection below'],
    ['cat-preroll', 'three hand-rolled cannabis cones lying side by side on black glass, made of plain unbleached rolling paper twisted at the tip, the open wide end of each showing green ground cannabis flower, clearly cannabis cones and not cigarettes, no filters'],
    ['cat-vape', 'a single blank clear-glass vape cartridge with a black mouthpiece, filled with golden amber oil, standing on a black mirror surface, no markings'],
    ['cat-extract', 'a few translucent amber shards of cannabis resin, glassy like stained glass, on a matte black slate, backlit so the amber glows'],
    ['cat-edible', 'four squares of plain dark chocolate stacked loosely on a black slate, a dusting of cocoa, nothing written on them'],
    ['cat-drink', 'a single plain matte black aluminum beverage can with cold condensation droplets, standing on a black mirror surface, completely blank'],
    ['cat-tincture', 'a single small amber glass dropper bottle with a black dropper top, a drop of golden oil on the glass beside it, completely unlabeled'],
    ['cat-topical', 'a small round black glass jar of balm with its lid set beside it, the balm smooth and pale gold, completely unlabeled'],
  ].map(([name, scene]) => ultra(name, '1:1', [STYLE, 'Product-free studio still life: ' + scene + '.', 'One hard key light from the upper left, a thin chrome rim light, a pure black background, the object centered with generous black space around it.', EMPTY, NOTEXT])),
];

fs.writeFileSync(path.join(HERE, 'stills.json'), JSON.stringify(stills, null, 2));
console.log(stills.length, 'still jobs ->', path.join(HERE, 'stills.json'), '| list-price estimate $' + (stills.length * 0.06).toFixed(2));
