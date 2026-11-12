// build.mjs: render src/ into a static site. No dependencies.
//   node src/build.mjs                                   -> dist/ (base "/", production canonicals)
//   node src/build.mjs --preview --out dist-preview --base /originalsca-redesign/   -> noindex Pages preview
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setBase } from './lib/html.mjs';
import { page, setPreview, setVersion, setOrigin } from './lib/layout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (n, dflt) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : dflt; };
const OUT = path.resolve(ROOT, val('--out', 'dist'));
const BASE = val('--base', '/');
const PREVIEW = args.includes('--preview');
setBase(BASE); setPreview(PREVIEW);
// share-card origin: the Pages host for the preview, the production site otherwise (override with --origin)
setOrigin(val('--origin', PREVIEW ? 'https://sgen-sites.github.io' : ''));
const VERSION = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
setVersion(VERSION);

// ---- clean + assets ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const copyDir = (from, to) => { if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true }); };
for (const d of ['fonts', 'brand', 'img', 'video']) copyDir(path.join(ROOT, 'src/assets', d), path.join(OUT, 'assets', d));
fs.rmSync(path.join(OUT, 'assets/brand/originals-letters.json'), { force: true });
fs.rmSync(path.join(OUT, 'assets/fonts/fonts.json'), { force: true });

// ---- css (token layer first; one file) ----
const CSS = ['tokens.css', 'base.css', 'chrome.css', 'components.css', 'signature.css', 'cruise.css', 'pages.css', 'nav.css', 'flat.css', 'hero.css', 'home.css', 'deals.css', 'carousel.css', 'marquee.css', 'stores.css', 'save.css', 'droplist.css', 'lenticular.css', 'culture-pages.css', 'info-pages.css', 'blog.css', 'legal.css', 'shop-pages.css'];   // a file not created yet is skipped
const css = CSS.filter((f) => fs.existsSync(path.join(ROOT, 'src/styles', f)))
  .map((f) => fs.readFileSync(path.join(ROOT, 'src/styles', f), 'utf8')).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets/css/site.css'), css);
fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/scripts/site.js'), path.join(OUT, 'assets/js/site.js'));

// ---- pages ----
const mod = async (name) => {
  const f = path.join(ROOT, 'src/pages', name + '.mjs');
  if (!fs.existsSync(f)) { console.warn('skip: src/pages/' + name + '.mjs not written yet'); return null; }
  return import(pathToFileURL(f).href + '?v=' + VERSION);
};
const ctx = {};
const blog = await mod('blog');
ctx.posts = blog ? blog.loadPosts() : [];
const pages = [];
const add = (p) => { if (Array.isArray(p)) p.forEach(add); else if (p) pages.push(p); };
const home = await mod('home'); if (home) add(home.home(ctx));
if (blog) add(blog.pages(ctx));
for (const name of ['shop', 'stores', 'story', 'culture', 'business', 'legal', 'misc']) { const m = await mod(name); if (m) add(m.pages(ctx)); }

const seen = new Set();
for (const p of pages) {
  const file = p.file || (p.path === '/' ? 'index.html' : p.path.replace(/^\//, '') + '.html');
  if (seen.has(file)) throw new Error('two pages write ' + file);
  seen.add(file);
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(p));
}
// the live words this build used, so a clone of the published source rebuilds without the raw capture
const { writeCaptureSnapshot } = await import(pathToFileURL(path.join(ROOT, 'src/lib/capture.mjs')).href);
if (writeCaptureSnapshot()) console.log('capture snapshot: src/content/capture.json');
if (PREVIEW) fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
console.log(`built ${pages.length} pages into ${path.relative(ROOT, OUT)}/ (base ${BASE}${PREVIEW ? ', preview, noindex' : ''}), ${(size(OUT) / 1048576).toFixed(1)} MB, css ${(css.length / 1024).toFixed(0)} KB`);
