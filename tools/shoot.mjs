// shoot.mjs: serve a build locally (no network beyond 127.0.0.1) and screenshot pages for review / pixel diff.
//   node tools/shoot.mjs --dir dist --paths /,/deals --widths 1440,390 [--full] [--gate] [--rm] [--scroll] [--out private/shots]
//   [--at 0.35]  scroll to a fraction of the page before a viewport shot      [--name suffix]
//   [--pixeldiff] write audit/screens/rebuild/<slug>.<w>.png (full page, reduced motion, gate answered)
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium, sleep } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(n);
const DIR = path.join(ROOT, val('--dir', 'dist'));
const BASE = val('--base', '/');
const PATHS = val('--paths', '/').split(',');
const WIDTHS = val('--widths', '1440,390').split(',').map(Number);
const OUT = path.join(ROOT, has('--pixeldiff') ? 'audit/screens/rebuild' : val('--out', 'private/shots'));
const FULL = has('--full') || has('--pixeldiff');
const RM = has('--rm') || has('--pixeldiff');
const AT = val('--at', null);
const TO = val('--to', null); // '<selector>:<fraction of its scroll span>' e.g. '[data-cruise]:0.6'
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (BASE !== '/' && p.startsWith(BASE)) p = '/' + p.slice(BASE.length);
  let f = path.join(DIR, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f = f + '.html';
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(fs.existsSync(path.join(DIR, '404.html')) ? fs.readFileSync(path.join(DIR, '404.html')) : 'not found'); return; }
  const stat = fs.statSync(f);
  const range = req.headers.range;
  const type = TYPES[path.extname(f)] || 'application/octet-stream';
  if (range && type === 'video/mp4') {
    const [s, e] = range.replace('bytes=', '').split('-'); const start = +s, end = e ? +e : stat.size - 1;
    res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${stat.size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
    fs.createReadStream(f, { start, end }).pipe(res); return;
  }
  res.writeHead(200, { 'content-type': type, 'content-length': stat.size, 'accept-ranges': 'bytes' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch({ headless: true });
const slug = (p) => (p === '/' ? 'index' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-'));
const report = [];
for (const w of WIDTHS) {
  const h = w <= 400 ? 844 : w <= 800 ? 1024 : w <= 1100 ? 768 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w <= 400 ? 2 : 1, reducedMotion: RM ? 'reduce' : 'no-preference', hasTouch: w <= 800, isMobile: w <= 400, timezoneId: 'America/Los_Angeles' });
  if (!has('--gate')) await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  await ctx.route(/^(?!http:\/\/127\.0\.0\.1).*/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/net::ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  for (const p of PATHS) {
    await page.goto(`http://127.0.0.1:${port}${BASE === '/' ? '' : BASE.replace(/\/$/, '')}${p}`, { waitUntil: 'load' });
    await sleep(900);
    if (has('--scroll') || FULL) {
      await page.evaluate(async () => { const s = Math.floor(innerHeight * 0.6); for (let y = 0; y < document.documentElement.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 110)); } scrollTo(0, 0); });
      await sleep(1100);
    }
    if (AT) { await page.evaluate((f) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), Number(AT)); await sleep(1300); }
    if (TO) { const [sel, fr] = TO.split(':'); await page.evaluate(([s, f]) => { const el = document.querySelector(s); if (!el) return; const top = el.getBoundingClientRect().top + scrollY; scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * Number(f || 0)); }, [sel, fr]); await sleep(1500); }
    const metrics = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth, sh: document.documentElement.scrollHeight }));
    const file = has('--pixeldiff') ? `${slug(p)}.${w}.png` : `${slug(p)}${val('--name', '')}-${w}${AT ? '-at' + AT : ''}${TO ? '-to' + TO.replace(/[^a-z0-9.]+/gi, '') : ''}.png`;
    await page.screenshot({ path: path.join(OUT, file), fullPage: FULL });
    report.push({ path: p, w, overflowX: metrics.sw > metrics.vw ? metrics.sw - metrics.vw : 0, height: metrics.sh, file, errors: errors.splice(0) });
  }
  await ctx.close();
}
await browser.close();
server.close();
for (const r of report) console.log(`${r.path} @${r.w}: h=${r.height} overflowX=${r.overflowX} errors=${r.errors.length}${r.errors.length ? ' ' + r.errors.slice(0, 2).join(' | ') : ''} -> ${r.file}`);
