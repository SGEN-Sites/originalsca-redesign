// smoke-preview.mjs: prove the DEPLOYED preview loads, and that its store bar works on a phone.
//   node tools/smoke-preview.mjs [--url https://sgen-sites.github.io/originalsca-redesign/] [--dir dist-preview]
// 1. Every page of the local preview build is requested from the live host at the URL the site links it by (no
//    .html): each must answer 200, be the same page (its <title>) and carry noindex. Also the CSS, JS and one font.
// 2. A phone (390x844, touch) on the live host: the 21+ gate shows and "21+" closes it; the store bar is hidden over
//    the hero and shown past it with Shop Now, Call, Directions and today's hours; switching to San Diego points
//    Shop Now, Call and Directions at the San Diego store; no script errors.
// Writes audit/preview-smoke.json. One request at a time; nothing but the preview host is contacted by the browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, sleep } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const URL0 = opt('--url', 'https://sgen-sites.github.io/originalsca-redesign/').replace(/\/?$/, '/');
const DIR = path.join(ROOT, opt('--dir', 'dist-preview'));
const host = new URL(URL0).origin;
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' | ' + String(detail).slice(0, 220) : '')); };

// 1. every page, as linked
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));
let okPages = 0;
const bad = [];
for (const f of files) {
  const rel = f === 'index.html' ? '' : f.replace(/\.html$/, '');
  const local = fs.readFileSync(path.join(DIR, f), 'utf8');
  const want = (/<title>([^<]*)<\/title>/.exec(local) || [])[1];
  try {
    const r = await fetch(URL0 + rel, { redirect: 'follow' });
    const body = await r.text();
    const title = (/<title>([^<]*)<\/title>/.exec(body) || [])[1];
    const good = r.status === 200 && title === want && /<meta name="robots" content="noindex, nofollow">/.test(body);
    if (good) okPages++; else bad.push(`${rel || '/'} ${r.status} ${title === want ? '' : 'title differs'}`);
  } catch (e) { bad.push(`${rel || '/'} ${e.message}`); }
}
check(`every page answers 200 with its own title and noindex (${files.length} pages)`, okPages === files.length, bad.slice(0, 5).join(' ; '));
for (const asset of ['assets/css/site.css', 'assets/js/site.js', 'assets/fonts/league-gothic-normal-400.woff2', 'robots.txt']) {
  const r = await fetch(URL0 + asset);
  const body = asset === 'robots.txt' ? await r.text() : '';
  check(`${asset} answers 200`, r.status === 200 && (asset !== 'robots.txt' || /Disallow:\s*\/\s*$/m.test(body)), r.status + (body ? ' ' + body.replace(/\s+/g, ' ') : ''));
}

// 2. the phone path
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, timezoneId: 'America/Los_Angeles' });
await ctx.route((u) => !String(u).startsWith(host), (r) => r.abort());
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(URL0, { waitUntil: 'load' }); await sleep(1200);
check('21+ gate shows on first visit', await p.isVisible('#gate'));
await p.click('[data-gate="21"]'); await sleep(500);
check('"21+" closes the gate', !(await p.isVisible('#gate')));
const atTop = await p.evaluate(() => document.querySelector('[data-dash]').classList.contains('is-on'));
await p.evaluate(() => scrollTo(0, innerHeight * 1.6)); await sleep(900);
const bar = await p.evaluate(() => {
  const d = document.querySelector('[data-dash]'); const r = document.querySelector('.dash__inner').getBoundingClientRect();
  const q = (s) => document.querySelector(s);
  return { on: d.classList.contains('is-on'), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight,
    shop: q('.dash__btn--shop') && q('.dash__btn--shop').getAttribute('href'), call: q('.dash__btn--call') && q('.dash__btn--call').getAttribute('href'),
    maps: q('.dash__btn--maps') && q('.dash__btn--maps').getAttribute('href'), hours: (q('[data-today]') || q('.dash__hours') || {}).innerText || '' };
});
check('store bar hidden over the hero, shown past it, inside the screen', !atTop && bar.on && bar.bottom <= bar.vh + 1 && bar.top > bar.vh * 0.6, JSON.stringify({ on: bar.on, top: bar.top, bottom: bar.bottom }));
check('store bar: Shop Now, Call, Directions and today\'s hours for Los Angeles', /originalsca\.com\/menu\/los-angeles/.test(bar.shop) && /^tel:\+13236969680$/.test(bar.call) && /6500%20Stanford/.test(bar.maps) && /Los Angeles/.test(bar.hours), JSON.stringify(bar));
await p.click('.dash [data-store-set="sd"]'); await sleep(500);
const sd = await p.evaluate(() => ({ store: document.documentElement.getAttribute('data-store'), shop: document.querySelector('.dash__btn--shop').getAttribute('href'), call: document.querySelector('.dash__btn--call').getAttribute('href'), maps: document.querySelector('.dash__btn--maps').getAttribute('href'), hours: (document.querySelector('[data-today]') || document.querySelector('.dash__hours')).innerText }));
check('switching to San Diego moves Shop Now, Call and Directions to San Diego', sd.store === 'sd' && /weedmaps\.com\/dispensaries\/originals-san-diego/.test(sd.shop) && /^tel:\+16193105232$/.test(sd.call) && /6220%20Federal/.test(sd.maps) && /San Diego/.test(sd.hours), JSON.stringify(sd));
check('no script errors on the live preview (phone)', errs.length === 0, errs.slice(0, 2).join(' | '));
await browser.close();

const out = { at: new Date().toISOString(), url: URL0, pass: results.filter((r) => r.ok).length, total: results.length, results };
fs.writeFileSync(path.join(ROOT, 'audit/preview-smoke.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`\n${out.pass}/${out.total} PASS -> audit/preview-smoke.json`);
process.exit(out.pass === out.total ? 0 : 1);
