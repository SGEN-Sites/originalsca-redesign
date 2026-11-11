// fetch-fonts.mjs: self-host open-licence (OFL) families from Google Fonts, latin subset, woff2.
//   node tools/fetch-fonts.mjs [--out src/assets/fonts] [--families "UnifrakturCook:wght@700|League+Gothic"]
// Writes <out>/*.woff2 and <out>/fonts.json (family, style, weight, file, bytes, source URL).
// Google Fonts picks the file format from the User-Agent; a current Chrome UA string is how a
// self-hosting tool asks for woff2. That is format negotiation, not access to anything restricted.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const OUT = path.join(ROOT, val('--out', 'src/assets/fonts'));
fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const families = val('--families', [
  'UnifrakturCook:wght@700',
  'Pirata+One',
  'Grenze+Gotisch:wght@400..900',
  'League+Gothic',
  'Oswald:wght@400..700',
  'Barlow+Condensed:wght@500;600;700;800',
  'Source+Sans+3:ital,wght@0,400..700;1,400',
  'Bebas+Neue',
  'Yellowtail',
  'Sedgwick+Ave+Display',
  'Mrs+Saint+Delafield',
].join('|')).split('|').map((f) => 'family=' + f);

const css = await (await fetch('https://fonts.googleapis.com/css2?' + families.join('&') + '&display=swap', { headers: { 'User-Agent': UA } })).text();
if (!/@font-face/.test(css)) { console.log('no @font-face returned:\n' + css.slice(0, 400)); process.exit(1); }
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
const out = [];
for (const [, subset, body] of blocks) {
  if (subset !== 'latin') continue;
  const fam = /font-family:\s*'([^']+)'/.exec(body)[1];
  const style = /font-style:\s*(\w+)/.exec(body)[1];
  const weight = /font-weight:\s*([\d ]+)/.exec(body)[1].trim();
  const url = /src:\s*url\(([^)]+)\)/.exec(body)[1];
  const range = /unicode-range:\s*([^;]+)/.exec(body)[1].trim();
  const file = `${fam.toLowerCase().replace(/\s+/g, '-')}-${style}-${weight.replace(' ', '-')}.woff2`;
  if (out.find((o) => o.file === file)) continue;
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.writeFileSync(path.join(OUT, file), buf);
  out.push({ family: fam, style, weight, file, bytes: buf.length, unicodeRange: range, source: url });
  console.log(file, buf.length);
}
fs.writeFileSync(path.join(OUT, 'fonts.json'), JSON.stringify({ fetched: new Date().toISOString(), licence: 'SIL Open Font License 1.1 (every family listed)', fonts: out }, null, 2));
console.log(out.length, 'files');
