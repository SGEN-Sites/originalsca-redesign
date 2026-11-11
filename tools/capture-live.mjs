// capture-live.mjs: polite browser capture of the live originalsca.com content pages (the BASELINE side).
//
// One headless browser, one page at a time, GAP_MS between pages, and the run stops on the first
// 401/403/429/451/503 document response. No retries, no UA spoofing, no parallelism.
//
//   node tools/capture-live.mjs [--pages /,/deals] [--widths 1440,390]
//
// Writes audit/capture/<slug>.<w>.json (sr-capture payloads), audit/capture/index.1440.scroll.json,
// audit/sweeps-raw/baseline/<slug>.<w>.json (sr-sweep payloads), audit/pages/<slug>/{text.txt,links.json},
// audit/screens/baseline/<slug>.<w>.png (full document height) and audit/live-capture-log.json.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium, sleep } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(process.env.HOME, '.claude/skills/site-reforge/scripts');
const ORIGIN = 'https://originalsca.com';
const GAP_MS = Number(process.env.GAP_MS || 4000);
const STOP_CODES = new Set([401, 403, 429, 451, 503]);
const args = process.argv.slice(2);
const val = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const PAGES = val('--pages', [
  '/', '/retail', '/deals', '/brands', '/blog', '/faqs', '/contact', '/jobs', '/los-angeles',
  '/los-angeles-store', '/san-diego-store', '/bussin-merch', '/rewards-program-and-opt-in', '/privacy-policy',
  '/originals-gelato-strain-profile', '/originals-hall-of-flowers-palm-springs-recap',
].join(',')).split(',');
const SIZES = { 1440: 900, 1024: 768, 768: 1024, 390: 844 };
const WIDTHS = val('--widths', '1440,1024,768,390').split(',').map(Number);

const slugOf = (p) => (p === '/' ? 'index' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-'));
const mk = (...p) => { const d = path.join(ROOT, ...p); fs.mkdirSync(d, { recursive: true }); return d; };
const logFile = path.join(ROOT, 'audit', 'live-capture-log.json');
const runLog = { at: new Date().toISOString(), gapMs: GAP_MS, origin: ORIGIN, visits: [] };

const capIIFE = execFileSync('node', [path.join(SKILL, 'sr-capture.mjs'), '--emit'], { encoding: 'utf8' });
const scrollIIFE = execFileSync('node', [path.join(SKILL, 'sr-capture.mjs'), '--emit-scroll'], { encoding: 'utf8' });
const sweepIIFE = execFileSync('node', [path.join(SKILL, 'sr-sweep.mjs'), '--emit'], { encoding: 'utf8' });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', timezoneId: 'America/Los_Angeles' });
const page = await context.newPage();

async function settle() {
  await page.waitForTimeout(2500);
  // Duda lazy-loads its background video and images: walk the page once so they are requested
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

let first = true;
for (const p of PAGES) {
  if (!first) await sleep(GAP_MS);
  first = false;
  const slug = slugOf(p);
  await page.setViewportSize({ width: 1440, height: 900 });
  let resp;
  try { resp = await page.goto(ORIGIN + p, { waitUntil: 'load', timeout: 60000 }); } catch (e) { runLog.visits.push({ url: ORIGIN + p, error: e.message.split('\n')[0] }); console.log(p, 'ERR', e.message.split('\n')[0]); continue; }
  const status = resp ? resp.status() : 0;
  runLog.visits.push({ url: ORIGIN + p, status, finalUrl: page.url(), at: new Date().toISOString() });
  if (STOP_CODES.has(status)) { console.log('STOP: ' + p + ' answered HTTP ' + status + ', no retry.'); break; }
  await settle();
  const dir = mk('audit', 'pages', slug);
  fs.writeFileSync(path.join(dir, 'text.txt'), await page.evaluate(() => document.body.innerText));
  fs.writeFileSync(path.join(dir, 'links.json'), JSON.stringify(await page.$$eval('a[href]', (as) => as.map((a) => ({ text: (a.innerText || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), href: a.href }))), null, 2));
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: SIZES[w] || 900 });
    await page.waitForTimeout(1400);
    const cap = await page.evaluate((src) => (0, eval)(src), capIIFE);
    if (!cap || !cap.viewport || cap.viewport.w !== w) throw new Error('capture not at ' + w + ': ' + (cap && cap.viewport && cap.viewport.w));
    fs.writeFileSync(path.join(mk('audit', 'capture'), `${slug}.${w}.json`), JSON.stringify(cap));
    const sw = await page.evaluate((src) => (0, eval)(src), sweepIIFE);
    if (!sw || !sw.viewport || sw.viewport.w !== w) throw new Error('sweep not at ' + w);
    fs.writeFileSync(path.join(mk('audit', 'sweeps-raw', 'baseline'), `${slug}.${w}.json`), JSON.stringify(sw));
    await page.screenshot({ path: path.join(mk('audit', 'screens', 'baseline'), `${slug}.${w}.png`), fullPage: true });
  }
  if (p === '/') {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(900);
    const sc = await page.evaluate((src) => (0, eval)(src), scrollIIFE);
    fs.writeFileSync(path.join(mk('audit', 'capture'), 'index.1440.scroll.json'), JSON.stringify(sc));
  }
  console.log(p, status, '->', page.url());
}
fs.writeFileSync(logFile, JSON.stringify(runLog, null, 2));
await browser.close();
console.log('done');
