// make-jobs-2.mjs: round 2 of the generated media (replacements, cut-outs, motion loops).
//   node tools/jobs/make-jobs-2.mjs   -> tools/jobs/round2.json
// Replacements for the round-1 rejects (review record: docs/MEDIA.md):
//   wall-camera   garbled pseudo-text on the camera body -> new subject: metal film reels (two variants)
//   stage-beams-wide   human silhouettes on the riser -> re-briefed empty stage
// Cut-outs (BiRefNet v2 heavy) for the depth objects; loops (Kling 2.5 Turbo Pro) start and end on the same frame.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const STYLE = 'Cinematic fine-art photograph for a Los Angeles lowrider and street-culture gallery: deep black shadows, polished chrome highlights, one hard key light, high contrast, rich blacks, fine 35mm film grain, shot on a full-frame camera.';
const EMPTY = 'No people, no hands, no arms, no faces, no silhouettes of people and no body parts anywhere in the frame.';
const NOTEXT = 'No text, no letters, no numbers, no words, no logos, no signs, no labels, no engraving, no watermark.';
const BW = 'Black and white fine-art gallery print, silver gelatin look, deep blacks, soft paper grain.';
const ultra = (name, aspect, prompt, raw = false) => ({ name, endpoint: 'fal-ai/flux-pro/v1.1-ultra', input: { prompt, aspect_ratio: aspect, num_images: 1, output_format: 'png', safety_tolerance: '2', raw, enable_safety_checker: true } });
const cut = (name, from) => ({ name, endpoint: 'fal-ai/birefnet/v2', input: { image_url: 'result:' + from + '#0', model: 'General Use (Heavy)', operating_resolution: '2048x2048', output_format: 'png', refine_foreground: true } });
const NEG = 'people, person, crowd, silhouettes of people, hands, faces, text, letters, logos, camera shake, strobing, morphing objects, distortion, blur, low quality';
const loop = (name, from, prompt) => ({ name, endpoint: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', input: { prompt, image_url: 'result:' + from + '#0', tail_image_url: 'result:' + from + '#0', duration: '5', negative_prompt: NEG, cfg_scale: 0.5 } });

const jobs = [
  ...['a', 'b'].map((v) => ultra('wall-reels-' + v, '4:5', [BW, 'Fine-art still life photograph: two vintage aluminium film reels, one half spooled with dark film that curls loosely across a dark wooden table, raking window light, deep shadow.', 'Calm, honest, monumental, like a portrait of an object in a museum.', EMPTY, NOTEXT, 'The reels are plain metal with no markings.'].join(' '))),
  ultra('stage-wide-b', '21:9', [STYLE, 'A very wide view of an empty, dark festival stage: a fan of purple, magenta and white light beams sweeps up and out through thick haze from a low row of spotlights along the front edge, black sky above, a glossy black floor below reflecting the beams.', 'The stage platform is completely empty: no performers, no crew, no crowd, no equipment cases, nobody standing anywhere.', 'The middle of the frame is calm for a headline.', EMPTY, NOTEXT].join(' '), true),
  cut('lowrider-cut', 'lowrider-side'),
  cut('bud-a-cut', 'bud-macro-a'),
  cut('bud-b-cut', 'bud-macro-b'),
  cut('bud-c-cut', 'bud-macro-c'),
  loop('vid-stage', 'stage-crown', 'The purple and pink spotlights sweep slowly and smoothly through drifting haze over the empty stage, panning gently left and right and pulsing softly; thin haze rolls across the glossy floor; the camera stays completely still; nobody appears; the shot ends exactly as it began.'),
  loop('vid-grow', 'grow-room', 'The leaves of the cannabis plants stir very slightly in a gentle airflow while the magenta and white grow lights stay steady; the camera stays still; nobody appears; the shot ends exactly as it began.'),
  loop('vid-arches', 'warehouse-arches', 'Dust motes drift slowly upward through the shafts of light from the tall arched windows, and the light breathes very softly as if a thin cloud passes the sun; the camera stays completely still; nobody appears; the shot ends exactly as it began.'),
];
fs.writeFileSync(path.join(HERE, 'round2.json'), JSON.stringify(jobs, null, 2));
console.log(jobs.length, 'jobs -> tools/jobs/round2.json | list price ~$' + (3 * 0.06 + 3 * 5 * 0.07 + 0.01).toFixed(2));
