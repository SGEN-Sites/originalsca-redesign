// verify-menus.mjs: prove every shop / category / brand destination the build links lands on products with a cart.
//   node tools/verify-menus.mjs [--dir dist] [--no-cart-test]
// Reads the destinations from the BUILT pages (every href that is a store menu URL), visits each once in headless
// Chromium (one page at a time, 2.5 s apart), answers the menu's own age gate, and counts add-to-cart controls and a
// cart / bag control. One add-to-cart per store proves the cart reacts. Writes audit/menu-verification.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, sleep } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DIR = path.join(ROOT, args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []));
const MENU = /^https:\/\/(originalsca\.com\/menu\/|weedmaps\.com\/dispensaries\/originals-san-diego)/;
const found = new Map(); // url -> pages using it
for (const f of walk(DIR)) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) { const href = m[1].replace(/&amp;/g, '&'); if (MENU.test(href)) { if (!found.has(href)) found.set(href, new Set()); found.get(href).add(path.relative(DIR, f)); } }
  const data = /<script type="application\/json" id="og-data">([\s\S]*?)<\/script>/.exec(html);
  if (data) { const j = JSON.parse(data[1]); for (const s of Object.values(j.stores)) for (const href of [s.menu, s.deals, ...Object.values(s.cats)]) { if (MENU.test(href)) { if (!found.has(href)) found.set(href, new Set()); found.get(href).add('(store switch: ' + s.id + ')'); } } }
}
const urls = [...found.keys()].sort();
console.log(urls.length, 'distinct store-menu destinations linked by the build');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', timezoneId: 'America/Los_Angeles' });
const page = await ctx.newPage();
const gates = {};
async function answerGate(host) {
  const text = await page.evaluate(() => { const dlg = document.querySelector('[role="dialog"], [aria-modal="true"], .modal, [class*="age" i]'); return dlg ? dlg.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : ''; });
  if (text && !gates[host]) gates[host] = text;
  for (const re of [/^(yes|i am 21|i'm 21|i'm 21\+|i am over 21|enter|confirm|i'm over 21|yes, i am)/i]) {
    const cands = await page.$$('button, a, [role=button]');
    for (const c of cands) { const t = ((await c.innerText().catch(() => '')) || '').trim(); if (re.test(t) && t.length < 40) { try { await c.click({ timeout: 2000 }); await sleep(2500); return t; } catch {} } }
  }
  return null;
}
async function measure() {
  return page.evaluate(() => {
    const txt = (e) => ((e.getAttribute('aria-label') || '') + ' ' + (e.innerText || '')).replace(/\s+/g, ' ').trim();
    const ctl = [...document.querySelectorAll('button, a, [role=button]')];
    const add = ctl.filter((e) => /\badd\b.*\bto (cart|bag)\b|^add to (cart|bag)$|^\+?\s*add$/i.test(txt(e))).length;
    const cart = ctl.some((e) => /open cart|\bcart\b|\bbag\b|checkout/i.test(txt(e)));
    const prices = ((document.body && document.body.innerText) || '').match(/\$\s?\d+(\.\d{2})?/g) || [];
    const empty = /no products|0 results|no results|nothing here|not available/i.test((document.body && document.body.innerText) || '');
    return { add, cart, prices: prices.length, emptyText: empty, title: document.title };
  });
}
const results = [];
let lastHost = null;
for (const url of urls) {
  const host = new URL(url).host;
  if (lastHost) await sleep(2500);
  lastHost = host;
  let status = 0, err = null;
  try { const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); status = r ? r.status() : 0; } catch (e) { err = e.message.split('\n')[0]; }
  await sleep(5500);
  const gate = await answerGate(host);
  let m = await measure();
  if (m.add === 0) { await page.evaluate(() => scrollTo(0, 900)); await sleep(2500); m = await measure(); }
  const ok = !err && status < 400 && m.add > 0 && m.cart;
  results.push({ url, finalUrl: page.url(), status, ok, ...m, gateAnswered: gate, usedOn: [...found.get(url)].slice(0, 6), error: err });
  console.log((ok ? 'PASS ' : 'FAIL ') + url + ' | add-to-cart controls ' + m.add + ' | cart ' + m.cart + ' | prices ' + m.prices + (err ? ' | ' + err : ''));
}

// one real add-to-cart per store: the cart must react (count or drawer)
const cartTests = [];
if (!args.includes('--no-cart-test')) {
  for (const url of ['https://originalsca.com/menu/los-angeles/categories/flower/', 'https://weedmaps.com/dispensaries/originals-san-diego/flower']) {
    await sleep(2500);
    const t = { url, clicked: null, after: null, ok: false };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await sleep(5500); await answerGate(new URL(url).host);
      const before = await page.evaluate(() => (document.body.innerText.match(/(cart|bag)\s*\(?\s*(\d+)/i) || [])[2] || null);
      let btn = await page.$('button[aria-label^="Add"][aria-label$="to cart"]');
      if (!btn) { const loc = page.getByRole('button', { name: /add to (bag|cart)/i }).first(); if (await loc.count()) btn = await loc.elementHandle(); }
      if (!btn) { const loc = page.locator('[aria-label*="Add to bag" i], [data-testid*="add-to-bag" i]').first(); if (await loc.count()) btn = await loc.elementHandle(); }
      if (btn) {
        t.clicked = (await btn.getAttribute('aria-label')) || (await btn.innerText());
        await btn.click({ timeout: 4000 }); await sleep(3500);
        // a weight / quantity chooser may open first: take its first add button
        const second = await page.$('[role="dialog"] button:has-text("Add"), [role="dialog"] button[aria-label*="Add"]');
        if (second) { await second.click({ timeout: 4000 }).catch(() => {}); await sleep(3000); }
        t.after = await page.evaluate(() => ({ cartText: [...document.querySelectorAll('button, a, [role=button]')].map((e) => ((e.getAttribute('aria-label') || '') + ' ' + (e.innerText || '')).replace(/\s+/g, ' ').trim()).filter((s) => /cart|bag/i.test(s)).slice(0, 6), subtotal: (document.body.innerText.match(/subtotal[^\n]{0,40}/i) || [])[0] || null, count: (document.body.innerText.match(/(cart|bag)\s*\(?\s*(\d+)/i) || [])[2] || null }));
        t.before = before;
        // proof the cart reacted: the menu's own confirmation ("Added to bag"), a cart count ("Open cart 1"), a
        // "Remove ... from cart" control or a subtotal. A product name containing "bag" must not count.
        t.addedText = await page.evaluate(() => (document.body.innerText.match(/added to (bag|cart)[^\n]{0,60}/i) || [])[0] || null);
        t.ok = !!(t.addedText || (t.after && (t.after.subtotal || t.after.cartText.some((s) => /^open cart \d+$|^remove .+ from cart$/i.test(s)))));
        const shot = path.join(ROOT, 'audit/menu-cart-' + (url.includes('weedmaps') ? 'sd' : 'la') + '.png');
        await page.screenshot({ path: shot });
        t.screenshot = path.relative(ROOT, shot);
      }
    } catch (e) { t.error = e.message.split('\n')[0]; }
    cartTests.push(t);
    console.log('CART ' + (t.ok ? 'PASS ' : 'CHECK ') + url + ' | clicked: ' + t.clicked + ' | after: ' + JSON.stringify(t.after).slice(0, 200));
  }
}
await browser.close();
const out = { at: new Date().toISOString(), build: path.relative(ROOT, DIR), destinations: results.length, pass: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length, gates, results, cartTests };
fs.writeFileSync(path.join(ROOT, 'audit/menu-verification.json'), JSON.stringify(out, null, 2));
console.log(`\n${out.pass}/${out.destinations} destinations PASS (products with add-to-cart + a cart control)`);
console.log('age gates seen:', JSON.stringify(gates).slice(0, 600));
