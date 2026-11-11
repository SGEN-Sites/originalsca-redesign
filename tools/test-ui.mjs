// test-ui.mjs: drive the built site's interactive parts and assert results (gate, store dash, store switch, drawer, mega).
//   node tools/test-ui.mjs [--dir dist]
// Serves the build on 127.0.0.1 (no other network), runs each check in a fresh browser context, writes audit/ui-test.json.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium, sleep } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DIR = path.join(ROOT, args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let f = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' | ' + detail : '')); };
const ctxFor = async (w, h, opts = {}) => { const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: w < 800, isMobile: w < 800, timezoneId: 'America/Los_Angeles', ...opts }); await c.route(/^(?!http:\/\/127\.0\.0\.1).*/, (r) => r.abort()); return c; };

// 1. gate: shown first, remembered, never blocks the 18+ medical path, "Not yet" keeps it closed
{
  const ctx = await ctxFor(390, 844); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(800);
  check('gate shows on first visit', await p.isVisible('#gate'));
  check('gate copy offers 18+ medical option', await p.isVisible('[data-gate="med"]'), await p.textContent('[data-gate="med"]'));
  await p.click('[data-gate="no"]'); await sleep(300);
  check('"Not yet" keeps the gate up with a message', (await p.isVisible('#gate')) && (await p.isVisible('[data-gate-no]')));
  await p.click('[data-gate="21"]'); await sleep(400);
  check('21+ answer closes the gate', !(await p.isVisible('#gate')));
  await p.reload(); await sleep(800);
  check('gate answer remembered on reload', !(await p.isVisible('#gate')));
  check('no script errors (home, phone)', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
  const c2 = await ctxFor(390, 844); const p2 = await c2.newPage(); await p2.goto(origin + '/'); await sleep(600); await p2.click('[data-gate="med"]'); await sleep(300);
  check('18+ medical answer enters the site', !(await p2.isVisible('#gate')));
  await c2.close();
}
// 2. phone: the store dash appears past the hero and follows the selected store
for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto(origin + '/'); await sleep(800);
  const hiddenAtTop = await p.evaluate(() => { const d = document.querySelector('[data-dash]'); return !d.classList.contains('is-on'); });
  await p.evaluate(() => scrollTo(0, innerHeight * 1.6)); await sleep(900);
  const box = await p.evaluate(() => { const r = document.querySelector('.dash__inner').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight, on: document.querySelector('[data-dash]').classList.contains('is-on') }; });
  check(`dash hidden over the hero, shown past it (${w}px)`, hiddenAtTop && box.on && box.bottom <= box.vh + 1 && box.top > box.vh * 0.6, JSON.stringify(box));
  const targets = await p.evaluate(() => [...document.querySelectorAll('.dash__inner button, .dash__inner a')].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '), w: Math.round(r.width), h: Math.round(r.height) }; }));
  check(`dash tap targets at least 44x44 (${w}px)`, targets.every((t) => t.w >= 44 && t.h >= 44), JSON.stringify(targets));
  await p.click('.dash [data-store-set="sd"]'); await sleep(400);
  const sd = await p.evaluate(() => ({ store: document.documentElement.getAttribute('data-store'), shop: document.querySelector('.dash__btn--shop').getAttribute('href'), tel: document.querySelector('[data-store-tel]').getAttribute('href'), maps: document.querySelector('[data-store-maps]').getAttribute('href'), today: document.querySelector('[data-today]').textContent, flower: document.querySelector('.cat__link[data-shop="flower"]').getAttribute('href'), chip: document.querySelector('.store-chip [data-store-name]').textContent }));
  check(`switching to San Diego rewires Shop/Call/Directions/hours/categories (${w}px)`, sd.store === 'sd' && /weedmaps\.com\/dispensaries\/originals-san-diego$/.test(sd.shop) && sd.tel === 'tel:+16193105232' && /6220%20Federal/.test(sd.maps) && /San Diego/.test(sd.today) && /originals-san-diego\/flower$/.test(sd.flower) && sd.chip === 'San Diego', JSON.stringify(sd));
  await p.reload(); await sleep(700);
  const kept = await p.evaluate(() => document.documentElement.getAttribute('data-store'));
  check(`store choice remembered on reload (${w}px)`, kept === 'sd', kept);
  await p.click('.dash [data-store-set="la"]'); await sleep(300);
  const la = await p.evaluate(() => ({ shop: document.querySelector('.dash__btn--shop').getAttribute('href'), tel: document.querySelector('[data-store-tel]').getAttribute('href') }));
  check(`switching back to Los Angeles (${w}px)`, la.shop === 'https://originalsca.com/menu/los-angeles/' && la.tel === 'tel:+13236969680', JSON.stringify(la));
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(`no sideways scroll on the home page (${w}px)`, ov <= 0, 'overflow ' + ov + 'px');
  await p.evaluate(() => scrollTo(0, 0)); await sleep(300);
  await p.click('[data-drawer-open]'); await sleep(400);
  check(`drawer opens (${w}px)`, await p.isVisible('#drawer'));
  check(`dash hides while the drawer is open (${w}px)`, await p.evaluate(() => document.documentElement.classList.contains('drawer-open')));
  await p.click('[data-drawer-close]'); await sleep(300);
  check(`drawer closes (${w}px)`, !(await p.isVisible('#drawer')));
  await ctx.close();
}
// 3. desktop: mega panel, store chip, store page fixed links stay on their store
{
  const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); localStorage.setItem('og-store', 'la'); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto(origin + '/'); await sleep(700);
  await p.hover('[data-mega="shop"]'); await sleep(500);
  check('Shop mega panel opens on hover', await p.evaluate(() => document.getElementById('mega-shop').classList.contains('is-open')));
  await p.click('[data-store-toggle]'); await sleep(300);
  check('header store chip toggles the store', await p.evaluate(() => document.documentElement.getAttribute('data-store') === 'sd'));
  await p.goto(origin + '/los-angeles-store'); await sleep(600);
  const fixed = await p.evaluate(() => [...document.querySelectorAll('.cats .cat__link')].map((a) => a.getAttribute('href')));
  check('LA store page category tiles stay on the LA menu even with San Diego selected', fixed.length === 9 && fixed.every((h) => h.startsWith('https://originalsca.com/menu/los-angeles/')), fixed.slice(0, 2).join(' , '));
  await ctx.close();
}
await browser.close(); server.close();
const out = { at: new Date().toISOString(), build: path.relative(ROOT, DIR), pass: results.filter((r) => r.ok).length, total: results.length, results };
fs.writeFileSync(path.join(ROOT, 'audit/ui-test.json'), JSON.stringify(out, null, 2));
console.log(`\nUI: ${out.pass}/${out.total} PASS`);
process.exit(out.pass === out.total ? 0 : 1);
