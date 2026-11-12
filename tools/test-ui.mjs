// test-ui.mjs: drive the built site's interactive parts and assert results (gate, store dash, store switch, the header's
// shop bar and More panel, the home hero's store switch and film toggle).
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
// the header (#nx): every visible link and button, and the ones under 44x44
const navTargets = (p) => p.evaluate(() => {
  const all = [...document.querySelectorAll('#nx a[href], #nx button')].filter((e) => e.getClientRects().length > 0);
  const small = all.map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((t) => t.w < 44 || t.h < 44);
  return { n: all.length, small };
});
const moreState = (p) => p.evaluate(() => {
  const btn = document.getElementById('nx-more-btn'), panel = document.getElementById('nx-more'), a = document.activeElement, html = document.documentElement;
  return { expanded: btn.getAttribute('aria-expanded'), controls: btn.getAttribute('aria-controls'), shown: !panel.hidden && panel.getBoundingClientRect().height > 0,
    focus: a ? (a.id || (a.textContent || '').trim().slice(0, 20)) : null, focusInPanel: panel.contains(a), menuOpen: html.classList.contains('nx-menu-open'), locked: html.classList.contains('nx-lock') };
});
const dashBox = (p) => p.evaluate(() => { const r = document.querySelector('.dash__inner').getBoundingClientRect(); return { top: Math.round(r.top), vh: innerHeight, on: document.querySelector('[data-dash]').classList.contains('is-on'), menuOpen: document.documentElement.classList.contains('nx-menu-open') }; });

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
// 2. phone: the store dash appears past the hero and follows the selected store; the header's More panel
for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(800);
  const hiddenAtTop = await p.evaluate(() => { const d = document.querySelector('[data-dash]'); return !d.classList.contains('is-on'); });
  await p.evaluate(() => scrollTo(0, innerHeight * 1.6)); await sleep(900);
  const box = await p.evaluate(() => { const r = document.querySelector('.dash__inner').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight, on: document.querySelector('[data-dash]').classList.contains('is-on') }; });
  check(`dash hidden over the hero, shown past it (${w}px)`, hiddenAtTop && box.on && box.bottom <= box.vh + 1 && box.top > box.vh * 0.6, JSON.stringify(box));
  const targets = await p.evaluate(() => [...document.querySelectorAll('.dash__inner button, .dash__inner a')].map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '), w: Math.round(r.width), h: Math.round(r.height) }; }));
  check(`dash tap targets at least 44x44 (${w}px)`, targets.every((t) => t.w >= 44 && t.h >= 44), JSON.stringify(targets));
  await p.click('.dash [data-store-set="sd"]'); await sleep(400);
  const sd = await p.evaluate(() => ({ store: document.documentElement.getAttribute('data-store'), shop: document.querySelector('.dash__btn--shop').getAttribute('href'), tel: document.querySelector('[data-store-tel]').getAttribute('href'), maps: document.querySelector('[data-store-maps]').getAttribute('href'), today: document.querySelector('[data-today]').textContent, flower: document.querySelector('#shop [data-shop="flower"]').getAttribute('href'), header: document.querySelector('.nx-cats__label [data-store-name]').textContent }));
  check(`switching to San Diego rewires Shop/Call/Directions/hours/categories (${w}px)`, sd.store === 'sd' && /weedmaps\.com\/dispensaries\/originals-san-diego$/.test(sd.shop) && sd.tel === 'tel:+16193105232' && /6220%20Federal/.test(sd.maps) && /San Diego/.test(sd.today) && /originals-san-diego\/flower$/.test(sd.flower) && sd.header === 'San Diego', JSON.stringify(sd));
  await p.reload(); await sleep(700);
  const kept = await p.evaluate(() => document.documentElement.getAttribute('data-store'));
  check(`store choice remembered on reload (${w}px)`, kept === 'sd', kept);
  await p.click('.dash [data-store-set="la"]'); await sleep(300);
  const la = await p.evaluate(() => ({ shop: document.querySelector('.dash__btn--shop').getAttribute('href'), tel: document.querySelector('[data-store-tel]').getAttribute('href') }));
  check(`switching back to Los Angeles (${w}px)`, la.shop === 'https://originalsca.com/menu/los-angeles/' && la.tel === 'tel:+13236969680', JSON.stringify(la));
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(`no sideways scroll on the home page (${w}px)`, ov <= 0, 'overflow ' + ov + 'px');
  // the category wall (home): nine cards, each one link to its category on the selected store's menu, in a new tab
  const wall = await p.evaluate(() => [...document.querySelectorAll('.cwall__card')].map((a) => { const cta = a.querySelector('.cwall__cta'), q = cta && cta.getBoundingClientRect(), c = a.getBoundingClientRect();
    return { shop: a.dataset.shop, href: a.getAttribute('href'), blank: a.target === '_blank', cta: cta && cta.textContent.trim(), ctaInside: !!q && q.left >= c.left + 8 && q.right <= c.right - 8 && q.bottom <= c.bottom - 8, gray: /grayscale\(1\)/.test(getComputedStyle(a.querySelector('.cwall__photo img')).filter) }; }));
  check(`the category wall: 9 cards, each opening its category on the LA menu in a new tab, a Shop Now inside each, photos black and white at rest (${w}px)`, wall.length === 9 && wall.every((c) => c.shop && /^https:\/\/originalsca\.com\/menu\/los-angeles\//.test(c.href) && c.blank && c.cta === 'Shop Now' && c.ctaInside && c.gray) && /flower/.test(wall[0].href), JSON.stringify(wall.slice(0, 2)));
  // the header's More panel, opened past the hero (where the store bar is up)
  await p.evaluate(() => scrollTo(0, innerHeight * 1.6)); await sleep(900);
  const before = await dashBox(p);
  await p.click('#nx-more-btn'); await sleep(800);
  const opened = await moreState(p);
  check(`More opens the panel and moves focus into it (${w}px)`, opened.expanded === 'true' && opened.controls === 'nx-more' && opened.shown && opened.focusInPanel && opened.locked, JSON.stringify(opened));
  const hid = await dashBox(p);
  check(`store bar hides while More is open (${w}px)`, before.on && before.top < before.vh && hid.menuOpen && hid.top >= hid.vh, JSON.stringify({ before, hid }));
  const t = await navTargets(p);
  check(`header targets at least 44x44, More open (${w}px)`, t.n >= 30 && t.small.length === 0, `${t.n} targets; under 44: ${JSON.stringify(t.small)}`);
  await p.keyboard.press('Escape'); await sleep(800);
  const closed = await moreState(p);
  check(`Escape closes More and returns focus to it (${w}px)`, closed.expanded === 'false' && !closed.shown && closed.focus === 'nx-more-btn' && !closed.menuOpen && !closed.locked, JSON.stringify(closed));
  const back = await dashBox(p);
  check(`store bar returns once More closes (${w}px)`, back.on && back.top < back.vh, JSON.stringify(back));
  check(`no script errors (home and header, ${w}px)`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
// 3. desktop: the header's store switch and More panel, the current-page mark, store page fixed links stay on their store
{
  const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); if (!localStorage.getItem('og-store')) localStorage.setItem('og-store', 'la'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(700);
  await p.click('.nx-switch [data-store-set="sd"]'); await sleep(400);
  const sw = await p.evaluate(() => {
    const data = JSON.parse(document.getElementById('og-data').textContent), sd = data.stores.sd, la = data.stores.la;
    const links = [...document.querySelectorAll('#nx [data-shop]')].map((a) => ({ k: a.getAttribute('data-shop'), href: a.getAttribute('href'), cat: a.classList.contains('nx-cat') }));
    const want = (k, s) => (k === 'menu' ? s.menu : s.cats[k] || s.menu);
    return {
      store: document.documentElement.getAttribute('data-store'),
      pressed: [...document.querySelectorAll('.nx-switch [data-store-set]')].map((b) => b.getAttribute('data-store-set') + ':' + b.getAttribute('aria-pressed')).join(' '),
      dash: { pressed: document.querySelector('.dash [data-store-set="sd"]').getAttribute('aria-pressed'), shop: document.querySelector('.dash__btn--shop').getAttribute('href') === sd.menu, today: document.querySelector('.dash [data-today]').textContent },
      name: document.querySelector('.nx-store__text [data-store-name]').textContent,
      barCats: links.filter((l) => l.cat).length,
      onSd: links.every((l) => l.href === want(l.k, sd)),
      changed: links.filter((l) => l.cat).every((l) => want(l.k, sd) !== want(l.k, la)),
      notSd: links.filter((l) => l.href !== want(l.k, sd)).map((l) => l.k + ' ' + l.href),
    };
  });
  check('header store switch sets San Diego: html[data-store], aria-pressed, the store bar, the category links (1440px)', sw.store === 'sd' && sw.pressed === 'la:false sd:true' && sw.dash.pressed === 'true' && sw.dash.shop && /San Diego/.test(sw.dash.today) && sw.name === 'San Diego' && sw.barCats === 6 && sw.onSd && sw.changed, JSON.stringify(sw));
  await p.click('#nx-more-btn'); await sleep(700);
  const opened = await moreState(p);
  const tag = await p.evaluate(() => [...document.querySelectorAll('#nx-more .nx-loc')].filter((l) => l.querySelector('.nx-tag').getClientRects().length > 0).map((l) => l.className));
  check('More opens the panel and marks San Diego as your store (1440px)', opened.expanded === 'true' && opened.controls === 'nx-more' && opened.shown && !opened.locked && tag.length === 1 && /nx-loc--sd/.test(tag[0]), JSON.stringify({ opened, tag }));
  const t = await navTargets(p);
  check('header targets at least 44x44, More open (1440px)', t.n >= 30 && t.small.length === 0, `${t.n} targets; under 44: ${JSON.stringify(t.small)}`);
  await p.keyboard.press('Escape'); await sleep(500);
  const closed = await moreState(p);
  check('Escape closes More and returns focus to it (1440px)', closed.expanded === 'false' && !closed.shown && closed.focus === 'nx-more-btn' && !closed.menuOpen, JSON.stringify(closed));
  await p.click('#nx-more-btn'); await sleep(600);
  await p.mouse.click(720, 820); await sleep(500);
  const outside = await moreState(p);
  check('a click outside the panel closes More (1440px)', outside.expanded === 'false' && !outside.shown, JSON.stringify(outside));
  const current = {};
  for (const path of ['/deals', '/collabs', '/los-angeles-store']) {
    await p.goto(origin + path); await sleep(400);
    current[path] = await p.evaluate(() => [...document.querySelectorAll('#nx [aria-current="page"]')].map((a) => a.textContent.trim()));
  }
  check('header marks the current page with aria-current="page"', current['/deals'].join() === 'Deals' && current['/collabs'].join() === 'Collabs' && current['/los-angeles-store'].join() === 'Originals Los Angeles', JSON.stringify(current));
  await p.goto(origin + '/los-angeles-store'); await sleep(600);
  const fixed = await p.evaluate(() => ({ store: document.documentElement.getAttribute('data-store'), hrefs: [...document.querySelectorAll('.cats .cat__link')].map((a) => a.getAttribute('href')) }));
  check('LA store page category tiles stay on the LA menu even with San Diego selected', fixed.store === 'sd' && fixed.hrefs.length === 9 && fixed.hrefs.every((h) => h.startsWith('https://originalsca.com/menu/los-angeles/')), 'store ' + fixed.store + ' | ' + fixed.hrefs.slice(0, 2).join(' , '));
  check('no script errors (desktop pages)', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
// 4. the home hero ("Into the film"): one H1; at the end of the dive its store switch sets html[data-store] and moves its
//    Shop Now to the San Diego menu in #og-data; its film toggle pauses and plays the film
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); localStorage.setItem('og-store', 'la'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(1200);
  const h1 = await p.evaluate(() => [...document.querySelectorAll('h1')].map((e) => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), inHero: !!e.closest('#hx') })));
  check(`home has one H1, the hero's (${w}px)`, h1.length === 1 && h1[0].inHero && h1[0].t === 'Best Cultivators in California.', JSON.stringify(h1));
  await p.evaluate(() => { const hx = document.getElementById('hx'), st = hx.querySelector('.hx-stage'); scrollTo(0, hx.getBoundingClientRect().top + scrollY + hx.offsetHeight - st.offsetHeight); });
  await p.waitForFunction(() => document.getElementById('hx').classList.contains('hx--done'), null, { timeout: 5000 }).catch(() => {});
  await sleep(1600);
  await p.click('#hx [data-store-set="sd"]'); await sleep(400);
  const sw = await p.evaluate(() => {
    const data = JSON.parse(document.getElementById('og-data').textContent);
    return { done: document.getElementById('hx').classList.contains('hx--done'), store: document.documentElement.getAttribute('data-store'),
      pressed: [...document.querySelectorAll('#hx [data-store-set]')].map((b) => b.getAttribute('data-store-set') + ':' + b.getAttribute('aria-pressed')).join(' '),
      shop: document.querySelector('#hx [data-shop="menu"]').getAttribute('href'), sd: data.stores.sd.menu, la: data.stores.la.menu };
  });
  check(`hero store switch sets html[data-store] to San Diego and moves the hero's Shop Now to the San Diego menu (${w}px)`, sw.done && sw.store === 'sd' && sw.pressed === 'la:false sd:true' && sw.shop === sw.sd && sw.sd !== sw.la, JSON.stringify(sw));
  const film = () => p.evaluate(() => { const t = document.querySelector('#hx .hx-toggle'), v = document.querySelector('#hx .hx-film'); return { shown: !t.hidden && t.getClientRects().length > 0, state: t.getAttribute('data-state'), label: t.textContent.trim(), paused: v.paused }; });
  await p.waitForFunction(() => !document.querySelector('#hx .hx-film').paused, null, { timeout: 6000 }).catch(() => {});
  const f0 = await film();
  await p.click('#hx .hx-toggle'); await sleep(500);
  const f1 = await film();
  await p.click('#hx .hx-toggle'); await sleep(800);
  const f2 = await film();
  check(`hero film toggle pauses and plays the film (${w}px)`, f0.shown && !f0.paused && f0.state === 'playing' && f0.label === 'Pause film' && f1.paused && f1.state === 'paused' && f1.label === 'Play film' && !f2.paused && f2.state === 'playing' && f2.label === 'Pause film', JSON.stringify({ f0, f1, f2 }));
  check(`no script errors (home hero, ${w}px)`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
// 5. the category wall on a desktop pointer (owner requests 2026-11-12): a bento box (three interlocking columns with
//    flat outer edges, cards packed close, no seam running across all three); hovering a card grows it a little and
//    dims the others, with nothing leaving its card; moving away puts everything back
{
  const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); localStorage.setItem('og-store', 'la'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(700);
  await p.evaluate(() => { const f = document.querySelector('.cwall'); scrollTo(0, f.getBoundingClientRect().top + scrollY - 120); }); await sleep(900);
  const box = await p.evaluate(() => {
    const r = [...document.querySelectorAll('.cwall__card')].map((a) => { const q = a.getBoundingClientRect(); return { l: Math.round(q.left), t: Math.round(q.top), r: Math.round(q.right), b: Math.round(q.bottom) }; });
    const cols = [...new Set(r.map((q) => q.l))].sort((x, y) => x - y).map((l) => r.filter((q) => q.l === l).sort((x, y) => x.t - y.t));
    const tops = cols.map((c) => c[0].t), bottoms = cols.map((c) => c[c.length - 1].b);
    const gaps = cols.flatMap((c) => c.slice(1).map((q, i) => q.t - c[i].b)).concat(cols.slice(1).map((c, i) => c[0].l - cols[i][0].r));
    const seams = cols.map((c) => c.slice(0, -1).map((q) => q.b));
    const shared = seams.slice(1).reduce((n, col, i) => n + col.filter((s) => seams[i].some((x) => Math.abs(x - s) < 2)).length, 0);   // seams two neighbouring columns share
    return { cols: cols.map((c) => c.length), flatTop: Math.max(...tops) - Math.min(...tops), flatBottom: Math.max(...bottoms) - Math.min(...bottoms), maxGap: Math.max(...gaps), sharedSeams: shared, height: Math.max(...bottoms) - Math.min(...tops), vh: innerHeight };
  });
  check('the category wall is a bento box: four interlocking columns (2,2,2,3), flat edges, gaps of 12px or less, no seam shared by neighbours, one screen tall (1440x900)',
    box.cols.join() === '2,2,2,3' && box.flatTop <= 1 && box.flatBottom <= 1 && box.maxGap <= 12 && box.sharedSeams === 0 && box.height <= 640, JSON.stringify(box));
  const state = () => p.evaluate(() => { const cards = [...document.querySelectorAll('.cwall__card')], a = cards[4], gray = (x) => /grayscale\(1\)/.test(getComputedStyle(x.querySelector('.cwall__photo img')).filter);
    const tok = (v) => { const s = document.createElement('span'); s.style.color = `var(${v})`; document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; }, white = tok('--white'), gold = tok('--gold');
    const no = (x) => getComputedStyle(x.querySelector('.cwall__no')).color;
    return { scale: getComputedStyle(a).scale, dimmed: cards.filter((x) => x !== a).every((x) => /brightness/.test(getComputedStyle(x).filter)), escapes: [...a.querySelectorAll('img')].some((i) => { const c = a.getBoundingClientRect(), q = i.getBoundingClientRect(); return q.top < c.top - 1 || q.bottom > c.bottom + 1; }),
      gray: gray(a), othersGray: cards.filter((x) => x !== a).every(gray), noWhite: no(a) === white, noGold: no(a) === gold && white !== gold, othersNoWhite: cards.filter((x) => x !== a).every((x) => no(x) === white), frame: getComputedStyle(a, '::after').boxShadow }; });
  await p.mouse.move(4, 4); await sleep(900);
  const rest = await state();
  await p.hover('.cwall__item:nth-child(5) .cwall__card'); await sleep(1200);
  const on = await state();
  await p.mouse.move(4, 4); await sleep(1200);
  const back = await state();
  check('the category wall: photos black and white, frames and numbers white at rest; hovering a card colours its photo, turns its frame and number gold, grows it and dims the others, nothing leaves its card; it settles back (1440px)',
    rest.scale === 'none' && !rest.dimmed && rest.gray && rest.othersGray && rest.noWhite && rest.othersNoWhite
      && on.scale !== 'none' && on.dimmed && !on.gray && on.othersGray && on.noGold && on.othersNoWhite && on.frame !== rest.frame && !on.escapes
      && back.scale === 'none' && !back.dimmed && back.gray && back.noWhite && back.frame === rest.frame,
    JSON.stringify({ rest, on, back }));
  check('no script errors (category wall, 1440px)', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
// 6. the home deals reel (wide; owner requests 2026-11-12): a short pin. At its start the opening titles fill the stage,
//    centred, the tabs and the card area hidden; at its end the titles have docked in the rail above the tabs and deal 01
//    plays; scrolling back returns the same opening screen. Tabs pick without moving the page; arrows move, Enter picks,
//    Tab enters the deal; the Happy Hour photo fills its card, faces clear; the section's background fades in from ink.
//    Then the deal photos (the San Diego sign and the Daily jar whole and clear of the words at every card shape; the
//    words' contrast; the eased gradients; the /deals wall's slides framed like the home cards) and the phone's file cap
{
  const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(origin + '/'); await sleep(800);
  const st = () => p.evaluate(() => { const s = document.querySelector('[data-reel]'), a = document.activeElement, op = (e) => +getComputedStyle(e).opacity;
    const r = (e) => { const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)]; };
    return { act: s.getAttribute('data-act'), y: Math.round(scrollY), vw: innerWidth, focus: a && (a.id || (a.closest('.dl-card') || {}).id),
      sign: r(s.querySelector('.dl-intro .dl-sign')), h2: r(s.querySelector('.dl-intro h2')), rail: r(s.querySelector('.dl-rail')), tab1: r(s.querySelector('[role="tab"]')),
      tabsOp: op(s.querySelector('.dl-rail ol')), cardsOp: op(s.querySelector('.dl-reel')),
      tabs: [...s.querySelectorAll('[role="tab"]')].map((t) => t.getAttribute('aria-selected') + ':' + t.tabIndex).join(' ') }; });
  const pin = await p.evaluate(() => { const s = document.querySelector('[data-reel]'), g = s.querySelector('.dl-stage'), top = Math.round(s.getBoundingClientRect().top + scrollY);
    return { top, end: Math.ceil(top + s.offsetHeight - g.offsetHeight), run: s.offsetHeight - g.offsetHeight, vh: innerHeight }; });
  await p.evaluate((y) => scrollTo(0, y), pin.top); await sleep(900); const a0 = await st();
  const mid = (b) => (b[0] + b[2]) / 2;
  check('deals reel: a short pin (70-90vh of scroll); at its start the titles fill the stage, centred, tabs and cards hidden (1440px)',
    pin.run >= 0.7 * pin.vh && pin.run <= 0.9 * pin.vh && a0.act === '-1' && Math.abs(mid(a0.h2) - a0.vw / 2) <= 24 && Math.abs(mid(a0.sign) - a0.vw / 2) <= 24 && a0.tabsOp === 0 && a0.cardsOp === 0, JSON.stringify({ pin, a0 }));
  await p.evaluate((y) => scrollTo(0, y), pin.end); await sleep(3300); const a1 = await st();
  const inRail = (b) => b[0] >= a1.rail[0] - 1 && b[2] <= a1.rail[2] + 1 && b[1] >= a1.rail[1] - 1 && b[3] <= a1.tab1[1];
  check('deals reel: at its end the titles have docked in the rail above the tabs, the tabs show and deal 01 plays (1440px)', inRail(a1.sign) && inRail(a1.h2) && a1.act === '0' && a1.tabsOp === 1 && a1.cardsOp === 1, JSON.stringify(a1));
  await p.evaluate((y) => scrollTo(0, y), pin.top); await sleep(900); const a2 = await st();
  const same = (x, y) => x.every((v, i) => Math.abs(v - y[i]) <= 1);
  check('deals reel: scrolling back to its start returns the same opening screen (1440px)', same(a2.sign, a0.sign) && same(a2.h2, a0.h2) && a2.act === '-1' && a2.tabsOp === 0 && a2.cardsOp === 0, JSON.stringify({ a0, a2 }));
  const mask = await p.evaluate(() => getComputedStyle(document.querySelector('[data-reel] .dl-back')).maskImage);
  check('deals reel: its background layers fade in from ink at the top edge and back out at the foot (1440px)', /^linear-gradient\(rgba\(0, 0, 0, 0\)/.test(mask) && /rgba\(0, 0, 0, 0\)\)$/.test(mask), mask);
  await p.evaluate((y) => scrollTo(0, y), pin.end); await sleep(3300);
  const hh = await p.evaluate(() => {
    const c = document.getElementById('deal-sun'); c.style.setProperty('transform', 'none', 'important');   // read in the card's plane
    const cr = c.getBoundingClientRect(), im = c.querySelector('.dl-photo img'), ir = im.getBoundingClientRect(), op = getComputedStyle(im).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const k = Math.max(ir.width / im.naturalWidth, ir.height / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k, x0 = ir.left + (ir.width - w) * op[0], y0 = ir.top + (ir.height - h) * op[1];
    const head = { l: x0 + 0.805 * w, t: y0 + 0.185 * h, r: x0 + 0.92 * w, b: y0 + 0.31 * h };   // the woman's head, hair to chin (happy-hour-lowrider, padded)
    const gap = (a, b) => { const dx = Math.max(b.left - a.r, a.l - b.right), dy = Math.max(b.top - a.b, a.t - b.bottom); return dx < 0 && dy < 0 ? Math.max(dx, dy) : dx >= 0 && dy >= 0 ? Math.hypot(dx, dy) : Math.max(dx, dy); };
    const rg = document.createRange(); rg.selectNodeContents(c.querySelector('.dl-big'));
    const words = Math.min(...[...rg.getClientRects()].map((q) => gap(head, q))), number = gap(head, c.querySelector('.dl-idx').getBoundingClientRect());
    c.style.removeProperty('transform');
    return { photo: im.currentSrc.split('/').pop(), covers: ir.left <= cr.left + .5 && ir.top <= cr.top + .5 && ir.right >= cr.right - .5 && ir.bottom >= cr.bottom - .5, words: Math.round(words), number: Math.round(number) };
  });
  check('deals reel: the Happy Hour photo fills its card; the woman\'s head clears the giant words by 40px+ and the deal number by 24px+ (1440px)',
    /^happy-hour-lowrider-/.test(hh.photo) && hh.covers && hh.words >= 40 && hh.number >= 24, JSON.stringify(hh));
  const picks = [];
  for (const i of [2, 1, 3, 0]) {
    const pt = await p.evaluate((i) => { const b = document.querySelectorAll('[role="tab"]')[i].getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, i);
    const y0 = (await st()).y; await p.mouse.click(pt.x, pt.y); await sleep(200); const s = await st();
    picks.push({ i, act: s.act, dy: s.y - y0, tab: s.tabs.split(' ')[i] });
  }
  check('deals reel: each tab picks its deal, aria-selected and roving tabindex follow, the page does not move (1440px)', picks.every((k) => k.act === String(k.i) && k.dy === 0 && k.tab === 'true:0'), JSON.stringify(picks));
  await p.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]').focus());
  await p.keyboard.press('ArrowDown'); await sleep(150); const k1 = await st();
  await p.keyboard.press('Enter'); await sleep(150); const k2 = await st();
  await p.keyboard.press('Tab'); await sleep(150); const k3 = await st();
  check('deals reel: arrows move between tabs, Enter picks, Tab enters the deal on stage (1440px)', k1.act === '0' && k1.focus === 'deal-la-tab' && k2.act === '1' && k3.act === '1' && k3.focus === 'deal-la', JSON.stringify({ k1, k2, k3 }));
  // the San Diego card: the storefront photo covers its whole card
  await p.evaluate(() => document.getElementById('deal-sd-tab').click()); await p.mouse.move(2, 2); await sleep(3800);
  const sd = await p.evaluate(() => {
    const c = document.getElementById('deal-sd'), cr = c.getBoundingClientRect(), im = c.querySelector('.dl-photo img'), ir = im.getBoundingClientRect();
    return { act: document.querySelector('[data-reel]').getAttribute('data-act'), photo: im.currentSrc.split('/').pop(),
      covers: ir.left <= cr.left + .5 && ir.top <= cr.top + .5 && ir.right >= cr.right - .5 && ir.bottom >= cr.bottom - .5 };
  });
  check('deals reel: the San Diego card shows the storefront photo (store-sd-front) over its whole card (1440px)', sd.act === '2' && /^store-sd-front-/.test(sd.photo) && sd.covers, JSON.stringify(sd));
  check('no script errors (deals reel, 1440px)', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
  // ---- shared reads for the checks below (owner requests 2026-11-12: the eased gradients, the jar photo, the wall's framing)
  const age = () => { try { localStorage.setItem('og-age', '21'); } catch (e) {} };
  const DL_TXT = { store: '.dl-store', big: '.dl-big', small: '.dl-small', title: '.dl-title', body: '.dl-body' };
  const CAVE_TXT = { store: '.cave__store', big: '.cave__big', small: '.cave__small', title: '.cave__head', body: '.cave__body' };
  // the jar, lid to base, by the photo the card draws: daily-jar (16:9) or its vertical version daily-jar-tall (2:3, owner
  // 2026-11-12: "use this and replace all the vertical versions"); the SD sign; the woman's head
  const JAR = { 'daily-jar': [0.655, 0.18, 0.90, 0.72], 'daily-jar-tall': [0.60, 0.365, 0.89, 0.625] }, SIGN = [0.27, 0.28, 0.50, 0.43], HEAD = [0.805, 0.185, 0.92, 0.31];
  const toDeal = async (pg, id) => {   // the deal on stage: the reel docked (or the stack in view), its tab picked, its sequence played
    await pg.evaluate(() => { const s = document.querySelector('[data-reel]'), g = s.querySelector('.dl-stage');
      if (!s.dataset.at) { s.dataset.at = '1'; scrollTo(0, s.classList.contains('is-reel') ? Math.ceil(s.getBoundingClientRect().top + scrollY + s.offsetHeight - g.offsetHeight) : s.querySelector('.dl-rail').getBoundingClientRect().top + scrollY - 130); } });
    await sleep(1600); await pg.evaluate((id) => document.getElementById(id + '-tab').click(), id); await pg.mouse.move(1, 1); await sleep(2600);
  };
  const zoomAt = (pg, id, phase) => pg.evaluate(({ id, phase }) => {   // the slow zoom's first or last frame
    let z = document.getElementById('__zoom'); if (!z) { z = document.createElement('style'); z.id = '__zoom'; document.head.appendChild(z); }
    z.textContent = `#${id} .dl-photo img { transition: none !important;${phase === 'start' ? ' scale: var(--z0, 1) !important;' : ''} }`;
  }, { id, phase });
  const toWall = async (pg) => {   // /deals: the wall in view, every slide's photo loaded (the hidden ones too)
    await pg.evaluate(() => document.querySelector('[data-cave]').scrollIntoView({ block: 'center' })); await sleep(1200);
    await pg.evaluate(() => Promise.all([...document.querySelectorAll('.cave__panel img')].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
  };
  const wallTurn = async (pg) => { await pg.evaluate(() => document.querySelector('[data-cave-next]').click()); await sleep(1500); };
  const wallOn = (pg) => pg.evaluate(() => document.querySelector('.cave__panel[aria-current]').className.match(/cave__panel--(\w+)/)[1]);
  const decode = (cx, b64, fn, arg) => cx.newPage().then(async (blank) => { const r = await blank.evaluate(fn, { b64, arg }); await blank.close(); return r; });
  // a card's texts against the brightest photo pixel behind their line boxes (the texts hidden for the read; the smoke
  // split's sr-only copy, which lays out unclipped, is skipped): the eyebrow, the title and the body 4.5:1, the numerals
  // 3:1, the small line by its size
  const textContrast = async (pg, cx, sel, T) => {
    const info = await pg.evaluate(({ sel, T }) => {
      const c = document.querySelector(sel); c.style.setProperty('transform', 'none', 'important');
      const cr = c.getBoundingClientRect(), lines = {};
      for (const [n, s] of Object.entries(T)) {
        const e = c.querySelector(s); if (!e) continue;
        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), rects = []; let t;
        while ((t = w.nextNode())) { if (!t.textContent.trim() || t.parentElement.closest('.sr-only')) continue; const rg = document.createRange(); rg.selectNodeContents(t); for (const q of rg.getClientRects()) if (q.width > 1) rects.push([q.left - cr.left, q.top - cr.top, q.right - cr.left, q.bottom - cr.top]); }
        const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
        lines[n] = { rects, color: cs.color, floor: n === 'big' || (n === 'small' && large) ? 3 : 4.5 };
      }
      c.style.removeProperty('transform');
      return { card: [cr.left, cr.top, cr.width, cr.height], lines };
    }, { sel, T });
    const hide = await pg.addStyleTag({ content: `${sel} :is(${Object.values(T).join(', ')}) { visibility: hidden !important; } ${sel} { transform: none !important; }` });
    await sleep(150);
    const [x, y, w, h] = info.card, shot = await pg.screenshot({ clip: { x: Math.max(0, x), y: Math.max(0, y), width: w, height: h }, scale: 'css' });
    await hide.evaluate((s) => s.remove());
    return decode(cx, shot.toString('base64'), async ({ b64, arg: lines }) => {
      const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))], { type: 'image/png' }));
      const cv = new OffscreenCanvas(bmp.width, bmp.height), g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
      const px = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width, H = bmp.height;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }, L = (r, gg, b) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
      const out = {}; let ok = true;
      for (const [n, { rects, color, floor }] of Object.entries(lines)) {
        const t = L(...color.match(/[\d.]+/g).slice(0, 3).map(Number)); let hi = 0;
        for (const [l, tp, r, b] of rects) for (let yy = Math.max(0, Math.floor(tp)); yy < Math.min(H, Math.ceil(b)); yy++) for (let xx = Math.max(0, Math.floor(l)); xx < Math.min(W, Math.ceil(r)); xx++) { const i = (yy * W + xx) * 4; hi = Math.max(hi, L(px[i], px[i + 1], px[i + 2])); }
        out[n] = +((Math.max(t, hi) + 0.05) / (Math.min(t, hi) + 0.05)).toFixed(2); if (out[n] < floor) ok = false;
      }
      return { ...out, ok };
    }, info.lines);
  };
  // a card's gradient alone over a flat ground (its photo, texts, deal number, glare and rim hidden): over a 47% grey, its
  // samples every 8px along lines across it (each a 5x5 mean): the largest step between neighbours and the largest change
  // of step (a bend: a sudden change of slope), in L*; over white, the most ink on a subject's box (fractions of the card)
  const gradRead = async (pg, cx, sel, ground, fn, arg) => {
    const st = await pg.addStyleTag({ content: `${sel} :is(.dl-photo, .cave__photo, .dl-copy, .dl-idx, .dl-glare, .dl-rim, .cave__copy) { visibility: hidden !important; }
      ${sel} .dl-media, ${sel}.cave__panel { background: ${ground} !important; } ${sel} { transform: none !important; }` });
    await sleep(200);
    const r = await pg.evaluate((sel) => { const q = document.querySelector(sel).getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; }, sel);
    const shot = await pg.screenshot({ clip: { x: Math.max(0, r[0]), y: Math.max(0, r[1]), width: r[2], height: r[3] }, scale: 'css' });
    await st.evaluate((s) => s.remove());
    return decode(cx, shot.toString('base64'), fn, arg);
  };
  const gradSteps = (pg, cx, sel, lines) => gradRead(pg, cx, sel, 'color-mix(in srgb, var(--white) 47%, var(--black))', async ({ b64, arg: lines }) => {
    const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))], { type: 'image/png' }));
    const cv = new OffscreenCanvas(bmp.width, bmp.height), g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    const px = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width, H = bmp.height;
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const Ls = (x, y) => { let s = 0, n = 0; for (let yy = y - 2; yy <= y + 2; yy++) for (let xx = x - 2; xx <= x + 2; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const i = (yy * W + xx) * 4; s += 0.2126 * lin(px[i]) + 0.7152 * lin(px[i + 1]) + 0.0722 * lin(px[i + 2]); n++; } const Y = s / n; return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
    let step = 0, bend = 0;
    for (const [dir, f] of lines) {
      const pts = [], len = dir === 'x' ? W : H;
      for (let k = 12; k < len - 12; k += 8) pts.push(dir === 'x' ? Ls(k, Math.round(f * H)) : Ls(Math.round(f * W), k));
      for (let i = 1; i < pts.length; i++) { step = Math.max(step, Math.abs(pts[i] - pts[i - 1])); if (i > 1) bend = Math.max(bend, Math.abs(pts[i] - 2 * pts[i - 1] + pts[i - 2])); }
    }
    return { step: +step.toFixed(2), bend: +bend.toFixed(2) };
  }, lines);
  const inkOn = (pg, cx, sel, box) => gradRead(pg, cx, sel, 'var(--white)', async ({ b64, arg: box }) => {
    const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))], { type: 'image/png' }));
    const cv = new OffscreenCanvas(bmp.width, bmp.height), g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
    const px = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width; let ink = 0;
    for (let y = Math.max(0, Math.ceil(box[1])); y < Math.min(bmp.height, Math.floor(box[3])); y++) for (let x = Math.max(0, Math.ceil(box[0])); x < Math.min(W, Math.floor(box[2])); x++) ink = Math.max(ink, (255 - px[(y * W + x) * 4 + 1]) / 245);
    return +ink.toFixed(3);   // the ink's share over white (its green channel: 10 of 255)
  }, box);
  // a subject's box on a card's photo (fractions of the photo; object-fit: cover, its object-position and its scale), in
  // the card's plane (the card's 3D tilt off for the read): how far inside the card it sits (and, where the photo is a
  // band that fades from 73% down, above the fade), how many text lines, buttons and deal numbers cross it, and the box.
  // The photo read is the one the card draws (the Daily card holds two, one shown), its box by its name when f is a map
  const subject = (pg, sel, f0, txt) => pg.evaluate(({ sel, f0, txt }) => {
    const c = document.querySelector(sel); c.style.setProperty('transform', 'none', 'important');
    const imgs = [...c.querySelectorAll('.dl-photo img, .cave__photo img')], im = imgs.find((i) => i.getClientRects().length) || imgs[0] || c.querySelector('img');
    const f = Array.isArray(f0) ? f0 : f0[(im.currentSrc || im.src).split('/').pop().replace(/-\d+\.webp$/, '')];
    const cr = c.getBoundingClientRect(), ir = im.getBoundingClientRect(), op = getComputedStyle(im).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const k = Math.max(ir.width / im.naturalWidth, ir.height / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k, x0 = ir.left + (ir.width - w) * op[0], y0 = ir.top + (ir.height - h) * op[1];
    const box = { l: x0 + f[0] * w, t: y0 + f[1] * h, r: x0 + f[2] * w, b: y0 + f[3] * h }, band = im.parentElement, bb = band.getBoundingClientRect();
    const fade = getComputedStyle(band).maskImage !== 'none' && !c.closest('.is-reel') ? bb.top + 0.73 * bb.height - box.b : Infinity;
    const rects = [];
    for (const e of c.querySelectorAll(txt)) { const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let t; while ((t = tw.nextNode())) { if (!t.textContent.trim() || t.parentElement.closest('.sr-only')) continue; const rg = document.createRange(); rg.selectNodeContents(t); rects.push(...rg.getClientRects()); } }
    for (const e of c.querySelectorAll('.btn, .dl-idx')) rects.push(e.getBoundingClientRect());
    const over = rects.filter((b) => b.width > 1 && b.right > box.l && b.left < box.r && b.bottom > box.t && b.top < box.b).length;
    c.style.removeProperty('transform');
    return { photo: im.currentSrc.split('/').pop(), alt: im.alt, inside: Math.round(Math.min(box.l - cr.left, box.t - cr.top, cr.right - box.r, cr.bottom - box.b, fade)), over,
      box: [box.l - cr.left, box.t - cr.top, box.r - cr.left, box.b - cr.top].map((v) => Math.round(v)),
      hidden: imgs.filter((i) => i !== im).map((i) => ({ src: (i.getAttribute('src') || '').split('/').pop(), fetched: !!i.currentSrc })) };
  }, { sel, f0, txt });
  const DL_WORDS = '.dl-store, .dl-big, .dl-small, .dl-title, .dl-body', CAVE_WORDS = '.cave__store, .cave__big, .cave__small, .cave__head, .cave__body';
  // the San Diego sign, ORIGINALS and DISPENSARY (x .27-.50, y .28-.43 of the photo), and the Daily card's jar (daily-jar,
  // x .655-.90, y .18-.72), each whole inside its card and clear of the copy (no text line or button over it) at every card
  // shape, wide and short to tall and the phone, at the start and the end of the slow zoom (owner requests: "this card
  // should show the logo"; the jar whole beside or above the words, on phones too)
  const signs = [], jars = [];
  for (const [vw, vh] of [[1565, 784], [1440, 760], [1366, 768], [1920, 1000], [1440, 900], [1280, 800], [1024, 768], [390, 844]]) {
    const c2 = await ctxFor(vw, vh); await c2.addInitScript(age);
    const q = await c2.newPage(); const errs2 = []; q.on('pageerror', (e) => errs2.push(String(e)));
    await q.goto(origin + '/'); await sleep(700);
    for (const [id, f, out] of [['deal-sd', SIGN, signs], ['deal-daily', JAR, jars]]) {
      await toDeal(q, id);
      for (const phase of ['start', 'end']) { await zoomAt(q, id, phase); await sleep(120); const { box, ...r } = await subject(q, '#' + id, f, DL_WORDS); out.push({ at: `${vw}x${vh}`, phase, ...r, errors: errs2.length }); }
    }
    await c2.close();
  }
  check('deals reel: the San Diego sign (ORIGINALS and DISPENSARY) is whole inside its card and clear of the copy at every card shape (1565x784 to 390x844), at the start and end of the zoom',
    signs.every((s) => s.inside >= 0 && s.over === 0 && s.errors === 0), JSON.stringify(signs.map(({ alt, photo, ...s }) => s)));
  check('deals reel: the Daily card shows the jar photo (daily-jar on the wide stage, its vertical version daily-jar-tall on the phone, with its alt), the whole jar inside its card and clear of the copy at every card shape (1565x784 to 390x844), at the start and end of the zoom',
    jars.every((s) => (s.at === '390x844' ? /^daily-jar-tall-\d+\.webp$/ : /^daily-jar-\d+\.webp$/).test(s.photo) && s.alt && s.inside >= 0 && s.over === 0 && s.errors === 0), JSON.stringify(jars.map(({ alt, hidden, ...s }) => s)));
  check('deals reel: the Daily card fetches only the photo it draws (its other version, hidden, is never requested), wide stage to phone',
    jars.length > 0 && jars.every((s) => s.hidden.length === 1 && !s.hidden[0].fetched), JSON.stringify(jars.map((s) => `${s.at} ${s.photo} hidden:${s.hidden.map((x) => x.src + (x.fetched ? ' FETCHED' : '')).join(',')}`)));
  // every card's words clear their floors over its photo, on the reel (1440x900: at the start and the end of the zoom)
  // and the phone stack (390x844), and on the /deals wall's slides
  for (const [vw, vh] of [[1440, 900], [390, 844]]) {
    const cx = await ctxFor(vw, vh); await cx.addInitScript(age); const pg = await cx.newPage(); await pg.goto(origin + '/'); await sleep(700);
    const rows = [];
    for (const id of ['deal-sun', 'deal-la', 'deal-sd', 'deal-daily']) {
      await toDeal(pg, id);
      for (const phase of ['start', 'end']) { await zoomAt(pg, id, phase); await sleep(120); rows.push({ id, phase, ...(await textContrast(pg, cx, '#' + id, DL_TXT)) }); }
    }
    check(`deals: every card's words clear their floors over its photo (eyebrow, title, body 4.5:1, numerals 3:1), at the start and end of the zoom (${vw}x${vh})`, rows.every((r) => r.ok), JSON.stringify(rows.map(({ ok, ...r }) => r)));
    await cx.close();
    const cw = await ctxFor(vw, vh); await cw.addInitScript(age); const pw = await cw.newPage(); await pw.goto(origin + '/deals'); await sleep(700); await toWall(pw);
    const slides = [];
    for (let i = 0; i < 4; i++) { if (i) await wallTurn(pw); const id = await wallOn(pw); slides.push({ id, ...(await textContrast(pw, cw, `.cave__panel--${id}`, CAVE_TXT)) }); }
    check(`deals wall: every slide's words clear their floors over its photo (${vw}x${vh})`, slides.length === 4 && slides.every((r) => r.ok), JSON.stringify(slides.map(({ ok, ...r }) => r)));
    await cw.close();
  }
  // the gradients (owner request, 2026-11-12: "fix the gradient in these cards to make it look more natural and
  // gradual"): each card's gradient alone over a flat 47% grey, sampled every 8px across it, steps no larger than its cap
  // and no sudden change of slope (a bend at most 45% of the cap, 0.6 L* at least). The caps are 1.5 L* where the words
  // leave room to fade; where a subject must stay clear of the gradient close to the words, the cap is that card's eased
  // minimum: the San Diego sign 24px from the reel copy (about 7 L*) and 20px over the phone eyebrow, the Happy Hour
  // faces beside the phone copy, and the slides' subjects in a 3:4 card. The Daily card's vertical version (the phone
  // and every slide, 2026-11-12) is a bright golden-hour photo: its words need 88% ink over the sunlit plant and counter
  // up to 34% of the card, and the ramp is gone at the jar's left edge (60%): about 5.6 L* on the phone card and the
  // 1440 slide, 6.6 on the 300px slide (measured 2026-11-12)
  const CAPS = { '1440x900': { 'deal-sun': 1.5, 'deal-la': 1.5, 'deal-sd': 8, 'deal-daily': 1.5, sun: 3.4, la: 2.3, sd: 3, daily: 6 },
    '390x844': { 'deal-sun': 4, 'deal-la': 1.5, 'deal-sd': 4.8, 'deal-daily': 6, sun: 4, la: 2.6, sd: 3.6, daily: 7 } };
  const REEL_LINES = [['x', 0.3], ['x', 0.55], ['x', 0.85]], LOW_LINES = [['y', 0.25], ['x', 0.8], ['x', 0.6]];
  for (const [vw, vh] of [[1440, 900], [390, 844]]) {
    const cap = CAPS[`${vw}x${vh}`], rows = [], ink = [];
    const cx = await ctxFor(vw, vh); await cx.addInitScript(age); const pg = await cx.newPage(); await pg.goto(origin + '/'); await sleep(700);
    for (const id of ['deal-sun', 'deal-la', 'deal-sd', 'deal-daily']) {
      await toDeal(pg, id); await zoomAt(pg, id, 'end'); await sleep(120);
      rows.push({ id, ...(await gradSteps(pg, cx, '#' + id, vw > 800 ? REEL_LINES : LOW_LINES)), cap: cap[id] });
      for (const [k, f, most] of { 'deal-sun': [['head', HEAD, 0.25]], 'deal-sd': [['sign', SIGN, 0.25]], 'deal-daily': [['jar', JAR, 0.06]] }[id] || []) { const s = await subject(pg, '#' + id, f, DL_WORDS); ink.push({ id, k, most, ink: await inkOn(pg, cx, '#' + id, s.box) }); }
    }
    await cx.close();
    const cw = await ctxFor(vw, vh); await cw.addInitScript(age); const pw = await cw.newPage(); await pw.goto(origin + '/deals'); await sleep(700); await toWall(pw);
    for (let i = 0; i < 4; i++) {
      if (i) await wallTurn(pw); const id = await wallOn(pw);
      rows.push({ id, ...(await gradSteps(pw, cw, `.cave__panel--${id}`, LOW_LINES)), cap: cap[id] });
      const f = { sun: HEAD, la: [0.05, 0.26, 0.25, 0.32], sd: SIGN, daily: JAR }[id], s = await subject(pw, `.cave__panel--${id}`, f, CAVE_WORDS);
      ink.push({ id, k: 'subject', most: 0.06, ink: await inkOn(pw, cw, `.cave__panel--${id}`, s.box) });
    }
    await cw.close();
    check(`deals gradients: eased, each card's steps within its cap (1.5 L* where its words leave room) and no sudden change of slope, home and the /deals wall (${vw}x${vh})`,
      rows.length === 8 && rows.every((r) => r.step <= r.cap && r.bend <= Math.max(0.6, 0.45 * r.cap)), JSON.stringify(rows));
    check(`deals gradients: each card's subject stays clear of its gradient (the slides' subjects, the jar 6% ink at most; the San Diego sign and the Happy Hour head 25%, at their edge on a phone) (${vw}x${vh})`,
      ink.length >= 7 && ink.every((r) => r.ink <= r.most), JSON.stringify(ink));
  }
  // the /deals wall's slides carry the home cards' photos, framed so each key subject (the woman's head, the Los Angeles
  // wall sign, the San Diego sign, the jar) sits whole inside its card and clear of its words, at four widths; each slide
  // is read in its own plane at every turn of the wall (centred, and as a turned neighbour) (owner request 2026-11-12:
  // "align images on these cards because we have already updated these on home")
  const homeIds = {};
  { const cx = await ctxFor(1440, 900); await cx.addInitScript(age); const pg = await cx.newPage(); await pg.goto(origin + '/'); await sleep(500);
    Object.assign(homeIds, await pg.evaluate(() => Object.fromEntries(['sun', 'la', 'sd', 'daily'].map((k) => [k, [...document.querySelectorAll('#deal-' + k + ' .dl-photo img')].map((i) => (i.getAttribute('src') || '').split('/').pop().replace(/-\d+\.webp$/, ''))]))));
    await cx.close(); }
  const SUBJ = { sun: HEAD, la: [0.05, 0.26, 0.25, 0.32], sd: SIGN, daily: JAR };   // store-la-floor: the ORIGINALS wall sign, crown to S
  const wall = [];
  for (const [vw, vh] of [[1440, 900], [1280, 800], [1024, 768], [390, 844]]) {
    const cx = await ctxFor(vw, vh); await cx.addInitScript(age); const pg = await cx.newPage(); await pg.goto(origin + '/deals'); await sleep(700); await toWall(pg);
    for (let turn = 0; turn < 4; turn++) {
      if (turn) await wallTurn(pg);
      // every slide is taller than wide: the Daily slide carries the home card's vertical version
      for (const k of Object.keys(SUBJ)) { const { box, hidden, ...r } = await subject(pg, '.cave__panel--' + k, SUBJ[k], CAVE_WORDS); const nm = r.photo.replace(/-\d+\.webp$/, ''); wall.push({ at: `${vw}x${vh}`, turn, k, ...r, same: k === 'daily' ? nm === 'daily-jar-tall' && homeIds.daily.includes(nm) : homeIds[k].includes(nm) }); }
    }
    await cx.close();
  }
  const offWall = wall.filter((j) => !(j.same && j.alt && j.inside >= 0 && j.over === 0));
  check('deals wall: each slide shows its home card\'s photo (the Daily slide the vertical version, daily-jar-tall) with its alt, and its key subject (the woman\'s head, the LA wall sign, the San Diego sign, the jar) is whole inside the card and clear of its words, at 1440, 1280, 1024 and 390, centred or turned',
    homeIds.daily.join() === 'daily-jar,daily-jar-tall' && wall.length === 64 && offWall.length === 0,
    JSON.stringify({ homeIds, off: offWall.slice(0, 6).map(({ alt, ...j }) => j), least: Object.fromEntries(Object.keys(SUBJ).map((k) => [k, Math.min(...wall.filter((j) => j.k === k).map((j) => j.inside))])) }));
  // a phone (390x844 at 3 device pixels a CSS px) fetches no deals photo wider than 1600w on its initial load (plus
  // 3 s), on the home page or /deals (owner performance brief, 2026-11-12)
  const phoneFiles = [];
  for (const path of ['/', '/deals']) {
    const c3 = await ctxFor(390, 844, { deviceScaleFactor: 3 }); await c3.addInitScript(age);
    const q = await c3.newPage();
    q.on('request', (r) => { const m = r.url().match(/\/(happy-hour-lowrider|store-la-floor|store-sd-front|daily-jar-tall|daily-jar|trichomes|night-street)-(\d+)\.webp/); if (m) phoneFiles.push({ path, file: m[1], w: +m[2] }); });
    await q.goto(origin + path, { waitUntil: 'load' }); await sleep(3000);
    await c3.close();
  }
  check('deals photos: a phone (390x844, 3x) fetches none wider than 1600w on its initial load, home or /deals', phoneFiles.length > 0 && phoneFiles.every((f) => f.w <= 1600),
    JSON.stringify(phoneFiles.map((f) => `${f.path} ${f.file}-${f.w}`)));
}
// 7. the family wall (home; owner requests 2026-11-12): the texts on the left and "the wall" on the right, a digital
//    replica of the store's portrait wall (one seamless unit of its print, family-wall-unit, repeated R times edge to
//    edge, R = clamp(3, ceil(3600 / its width at 560px tall), 8) from its registry size) that scrolls left to right.
//    Wide: beside the text, one screen tall, overflowing sideways, the R copies touching, all loaded; prev/next move it
//    and disable at its ends; a mouse drag, a sideways wheel and the arrow keys move it, a vertical wheel over it still
//    scrolls the page. Phone: under the text, full-bleed, a swipe moves it, a vertical swipe over it still scrolls the
//    page, the page never scrolls sideways. Without JS: a scrolling row, no buttons.
{
  const st = (p) => p.evaluate(() => {
    const s = document.getElementById('family-wall'), v = s.querySelector('[data-wall-view]'), bs = [...s.querySelectorAll('[data-wall-step]')];
    const r = (e) => { const q = e.getBoundingClientRect(); return { l: Math.round(q.left), t: Math.round(q.top), r: Math.round(q.right), b: Math.round(q.bottom) }; };
    return { view: r(v), copy: r(s.querySelector('.wall__copy')), x: Math.round(v.scrollLeft), max: v.scrollWidth - v.clientWidth, y: Math.round(scrollY), sx: scrollX, vw: innerWidth, vh: innerHeight,
      side: document.documentElement.scrollWidth - innerWidth, region: [v.getAttribute('role'), v.getAttribute('aria-label'), v.tabIndex].join('|'),
      btns: bs.map((b) => { const q = b.getBoundingClientRect(); return { tag: b.tagName, type: b.type, label: b.getAttribute('aria-label'), shown: b.getClientRects().length > 0, w: Math.round(q.width), h: Math.round(q.height) }; }),
      prevOff: bs[0].disabled, nextOff: bs[1].disabled,
      imgs: [...v.querySelectorAll('img')].map((i) => { const q = i.getBoundingClientRect(); return { unit: /\/family-wall-unit-\d+\.webp$/.test(i.currentSrc || i.src), ok: i.complete && i.naturalWidth > 0,
        h: Math.round(q.height), l: q.left, r: q.right, alt: i.getAttribute('alt'), hidden: i.getAttribute('aria-hidden'), k: +i.getAttribute('width') / +i.getAttribute('height') }; }) };
  });
  const toWall = (p) => p.evaluate(() => { const q = document.querySelector('#family-wall [data-wall-view]').getBoundingClientRect(); scrollTo(0, Math.round(q.top + scrollY - (innerHeight - q.height) / 2)); });
  const copies = (k) => Math.min(8, Math.max(3, Math.ceil(3600 / (560 * k))));   // the R the page must render, from the unit's registry size
  // R copies of the unit, each the full strip height, each touching the next within 1px (one continuous wall)
  const wall = (a, H) => a.imgs.length >= 3 && a.imgs.length === copies(a.imgs[0].k) && a.imgs.every((im, i) => im.unit && Math.abs(im.h - H) <= 1 && (!i || Math.abs(im.l - a.imgs[i - 1].r) <= 1));
  const wallInfo = (a) => JSON.stringify(a.imgs.map((im) => ({ unit: im.unit, ok: im.ok, h: im.h, l: +im.l.toFixed(2), r: +im.r.toFixed(2), alt: im.alt && im.alt.slice(0, 24), hidden: im.hidden })));
  // the white band (owner request 2026-11-12): its computed look, with contrast ratios worked out from the computed colours
  const look = (p) => p.evaluate(() => {
    const s = document.getElementById('family-wall'), sc = getComputedStyle(s), cta = s.querySelector('.wall__cta .btn'), cc = getComputedStyle(cta);
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number), k = /^color\(/.test(c) ? 255 : 1; return 0.2126 * lin(n[0] * k) + 0.7152 * lin(n[1] * k) + 0.0722 * lin(n[2] * k); };
    const ratio = (x, y) => { const a = lum(x), b = lum(y); return Math.round((Math.max(a, b) + .05) / (Math.min(a, b) + .05) * 100) / 100; };
    return { bg: sc.backgroundColor, bgImage: sc.backgroundImage, brick: !!s.querySelector('.wall__brick'),
      painted: [...s.querySelectorAll('*')].filter((e) => e.getClientRects().length && !e.closest('[data-wall-view]') && getComputedStyle(e).backgroundImage !== 'none').map((e) => e.className),
      cta: { kind: cta.className, bg: cc.backgroundColor, text: ratio(cc.color, cc.backgroundColor), icon: ratio(getComputedStyle(cta.querySelector('.ico')).stroke, cc.backgroundColor),
        box: ratio(cc.backgroundColor, sc.backgroundColor), ring: [cc.outlineStyle, cc.outlineWidth, ratio(cc.outlineColor, sc.backgroundColor)].join(' '), focus: cta.matches(':focus-visible') },
      btns: [...s.querySelectorAll('[data-wall-step]')].map((b) => ({ shown: b.getClientRects().length > 0, w: Math.round(b.getBoundingClientRect().width), ring: ratio(getComputedStyle(b).color, sc.backgroundColor) })) };
  });
  // the band's empty left gutter, down its height (clear of the strip, the header and the store dash), read as pixels from
  // a shot: every one white (no grid, no tint). Wide, the band has no top padding any more: its strip is its edge.
  const blankWhite = async (p) => {
    const clip = await p.evaluate(() => { const s = document.getElementById('family-wall'); scrollTo(0, Math.round(s.getBoundingClientRect().top + scrollY - 140));
      const r = s.getBoundingClientRect(), c = s.querySelector('.wall__copy').getBoundingClientRect(), v = s.querySelector('[data-wall-view]').getBoundingClientRect();
      const top = Math.max(r.top, 0) + 4, bottom = Math.min(v.left <= c.left ? v.top : r.bottom, innerHeight - 160) - 4;
      return { x: 0, y: Math.round(top), width: Math.max(1, Math.floor(c.left) - 4), height: Math.max(1, Math.round(bottom - top)) }; });
    await sleep(2600);   // the title's smoke-in and the reveals settle first: while they play, their blur spills into a phone's 16px gutter
    const png = (await p.screenshot({ clip, scale: 'css' })).toString('base64');
    return p.evaluate(async (png) => { const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height).data; let off = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] < 253 || d[i + 1] < 253 || d[i + 2] < 253) off++;
      return { w: cv.width, h: cv.height, off }; }, png);
  };
  // the band hugs the strip (owner request 2026-11-12): its edges, the controls' place in the text column, and whether
  // anything in that column touches the strip
  const edges = (p) => p.evaluate(() => {
    const s = document.getElementById('family-wall'), r = (e) => { const q = e.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom }; };
    const view = r(s.querySelector('[data-wall-view]')), parts = [...s.querySelectorAll('.wall__text > *, .wall__hint, .wall__btn')].filter((e) => e.getClientRects().length).map((e) => ({ c: e.className || e.tagName, ...r(e) }));
    const ctl = parts.filter((q) => /wall__(hint|btn)/.test(q.c)), rnd = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]));
    return { sec: rnd(r(s)), view: rnd(view), copy: rnd(r(s.querySelector('.wall__copy'))), cta: rnd(r(s.querySelector('.wall__cta .btn'))), ctrl: rnd(r(s.querySelector('.wall__ctrl'))),
      ctlTop: Math.round(Math.min(...ctl.map((q) => q.t)) * 10) / 10, ctlBottom: Math.round(Math.max(...ctl.map((q) => q.b)) * 10) / 10, n: parts.length,
      hits: parts.filter((q) => q.r > view.l && q.l < view.r && q.b > view.t && q.t < view.b).map((q) => q.c) };
  });
  {
    const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800); await toWall(p); await sleep(1400);
    const a = await st(p), H = a.view.b - a.view.t;
    check('family wall: the strip sits beside the text (right of it, level with it), one screen tall (380-560px), bleeding off the right edge and overflowing sideways; a labelled, focusable region (1440x900)',
      a.copy.r <= a.view.l && a.view.t < a.copy.b && a.copy.t < a.view.b && H >= 380 && H <= 560 && H <= a.vh && a.view.r === a.vw && a.max > 200
      && a.region === 'region|Photos of the Originals family wall|0', JSON.stringify({ ...a, imgs: a.imgs.length }));
    check('family wall: one continuous wall, R copies of family-wall-unit (R from its registry size), each the full strip height, each touching the next within 1px; the first carries the alt, the others are decorative (alt="", aria-hidden) (1440x900)',
      wall(a, H) && a.imgs[0].alt && a.imgs[0].hidden === null && a.imgs.slice(1).every((im) => im.alt === '' && im.hidden === 'true'), wallInfo(a));
    check('family wall: prev/next are real buttons with labels, 44x44 or larger; at the start prev is disabled and next is not (1440x900)',
      a.btns.length === 2 && a.btns.every((b) => b.tag === 'BUTTON' && b.type === 'button' && b.label && b.shown && b.w >= 44 && b.h >= 44) && a.prevOff && !a.nextOff && a.x === 0, JSON.stringify(a.btns));
    const fwd = []; let s = a;
    for (let k = 0; k < 20 && !s.nextOff; k++) { await p.click('[data-wall-step="1"]'); await sleep(1000); s = await st(p); fwd.push({ x: s.x, prevOff: s.prevOff }); }
    check('family wall: next moves the strip forward step by step (60px or more a click), prev wakes, and next disables at the end (1440x900)',
      fwd.length >= 2 && fwd.every((f, i) => f.x - (i ? fwd[i - 1].x : 0) >= 60 && !f.prevOff) && s.nextOff && Math.abs(s.x - s.max) <= 2, JSON.stringify({ fwd, max: s.max }));
    await sleep(1500); const ld = await st(p);
    check('family wall: all R copies of the wall unit load (1440x900)', ld.imgs.length === copies(ld.imgs[0].k) && ld.imgs.every((i) => i.unit && i.ok), wallInfo(ld));
    const back = []; const end = s;
    for (let k = 0; k < 20 && !s.prevOff; k++) { await p.click('[data-wall-step="-1"]'); await sleep(1000); s = await st(p); back.push({ x: s.x, nextOff: s.nextOff }); }
    check('family wall: prev moves it back step by step (60px or more a click), next wakes, and prev disables at the start (1440x900)',
      back.length >= 2 && back.every((f, i) => (i ? back[i - 1].x : end.x) - f.x >= 60 && !f.nextOff) && s.prevOff && s.x === 0, JSON.stringify({ back, from: end.x }));
    const px = s.view.l + 360, py = Math.round((s.view.t + s.view.b) / 2);
    await p.mouse.move(px, py); await p.mouse.down(); await p.mouse.move(px - 320, py, { steps: 16 }); await p.mouse.up(); await sleep(300); const dr = await st(p);
    check('family wall: a mouse drag moves the strip with the pointer and the page stays put (1440x900)', Math.abs(dr.x - 320) <= 12 && dr.y === s.y, JSON.stringify({ x: dr.x, y0: s.y, y1: dr.y }));
    await p.mouse.move(px, py); await p.mouse.wheel(240, 0); await sleep(800); const wx = await st(p);
    await p.focus('[data-wall-view]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await sleep(700); const kx = await st(p);
    await p.mouse.move(px, py); await p.mouse.wheel(0, 300); await sleep(900); const wy = await st(p);
    check('family wall: a sideways wheel (trackpad) and the arrow keys move the strip; a vertical wheel over it scrolls the page, not the strip (1440x900)',
      wx.x > dr.x && wx.y === dr.y && kx.x > wx.x && wy.y > kx.y && wy.x === kx.x, JSON.stringify({ drag: dr.x, wheel: wx.x, keys: kx.x, vertical: wy.x, y: [dr.y, wx.y, kx.y, wy.y] }));
    const lk = await look(p), bw = await blankWhite(p);
    check('family wall: the band is plain white edge to edge: a white background, no grid image or brick layer, its empty left gutter all white pixels down its height (1440x900)',
      lk.bg === 'rgb(255, 255, 255)' && lk.bgImage === 'none' && !lk.brick && !lk.painted.length && bw.w >= 10 && bw.h > 100 && bw.off === 0, JSON.stringify({ bg: lk.bg, bgImage: lk.bgImage, painted: lk.painted, pixels: bw }));
    check('family wall: the CTA is an ink button, its label and arrow 4.5:1 or more on it, its box 3:1 or more against the white band; prev/next shown and 3:1 or more on white (1440x900)',
      /\bbtn--ink\b/.test(lk.cta.kind) && lk.cta.text >= 4.5 && lk.cta.icon >= 4.5 && lk.cta.box >= 3 && lk.btns.length === 2 && lk.btns.every((b) => b.shown && b.w >= 44 && b.ring >= 3), JSON.stringify({ cta: lk.cta, btns: lk.btns }));
    await p.hover('.wall__cta .btn'); await sleep(700); const hv = await look(p);
    await p.mouse.move(5, 300); await p.focus('.wall__cta .btn'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(700); const fc = await look(p);
    check('family wall: the CTA under the pointer and in keyboard focus: its ink lightens, the label stays 4.5:1 or more, a solid focus ring 3:1 or more on white (1440x900)',
      hv.cta.bg !== lk.cta.bg && hv.cta.text >= 4.5 && fc.cta.focus && fc.cta.text >= 4.5 && /^solid /.test(fc.cta.ring) && +fc.cta.ring.split(' ')[2] >= 3, JSON.stringify({ rest: lk.cta.bg, hover: hv.cta, focus: fc.cta }));
    check('no script errors (family wall, 1440x900)', errs.length === 0, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(390, 844); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800); await toWall(p); await sleep(1400);
    const a = await st(p), H = a.view.b - a.view.t, mid = Math.round((a.view.t + a.view.b) / 2), cdp = await ctx.newCDPSession(p);
    check('family wall: under the text, full-bleed, 380-560px tall and within the screen, overflowing sideways, the R copies full height and touching (390x844)',
      a.copy.b <= a.view.t && a.view.l === 0 && a.view.r === a.vw && H >= 380 && H <= 560 && H <= a.vh && a.max > 200 && wall(a, H), JSON.stringify({ ...a, imgs: wallInfo(a) }));
    await cdp.send('Input.synthesizeScrollGesture', { x: 300, y: mid, xDistance: -240, yDistance: 0, gestureSourceType: 'touch', speed: 1200 }); await sleep(700); const s1 = await st(p);
    check('family wall: a swipe moves the strip (390x844)', s1.x - a.x > 60, JSON.stringify({ before: a.x, after: s1.x }));
    await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: mid, xDistance: 0, yDistance: -300, gestureSourceType: 'touch', speed: 1200 }); await sleep(700); const s2 = await st(p);
    check('family wall: a vertical swipe over the strip still scrolls the page; the page never scrolls sideways (390x844)',
      s2.y > s1.y && s2.x === s1.x && a.side <= 0 && s1.side <= 0 && s2.side <= 0 && s1.sx === 0 && s2.sx === 0, JSON.stringify({ y: [s1.y, s2.y], x: [s1.x, s2.x], side: [a.side, s1.side, s2.side], sx: [s1.sx, s2.sx] }));
    const lk = await look(p), bw = await blankWhite(p);
    check('family wall: the band is plain white (background, no grid image, its empty left gutter all white pixels); the ink CTA 4.5:1 or more and 3:1 or more against the band; prev/next shown and 3:1 or more on white (390x844)',
      lk.bg === 'rgb(255, 255, 255)' && lk.bgImage === 'none' && !lk.brick && !lk.painted.length && bw.w >= 10 && bw.h > 100 && bw.off === 0
      && /\bbtn--ink\b/.test(lk.cta.kind) && lk.cta.text >= 4.5 && lk.cta.icon >= 4.5 && lk.cta.box >= 3 && lk.btns.every((b) => b.shown && b.w >= 44 && b.ring >= 3), JSON.stringify({ bg: lk.bg, painted: lk.painted, pixels: bw, cta: lk.cta, btns: lk.btns }));
    await toWall(p); await sleep(600); const eg = await edges(p);
    check('family wall on a phone: the text, then the controls under the button, then the strip, flush with the band\'s foot (within 1px); nothing above it touches the strip (390x844)',
      Math.abs(eg.view.b - eg.sec.b) <= 1 && eg.ctlTop >= eg.cta.b && eg.ctlBottom <= eg.view.t && !eg.hits.length && eg.n >= 6, JSON.stringify(eg));
    check('no script errors (family wall, 390x844)', errs.length === 0, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // wide: the band is exactly the strip's height, at three screens (owner request 2026-11-12)
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768]]) {
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800); await toWall(p); await sleep(1400);
    const eg = await edges(p);
    check(`family wall: the band is exactly the strip's height, the strip's top and bottom its own (within 1px); the controls in the text column, under the button with clear space and above the band's foot; nothing in that column touches the strip (${w}x${h})`,
      Math.abs(eg.view.t - eg.sec.t) <= 1 && Math.abs(eg.view.b - eg.sec.b) <= 1 && eg.ctrl.l >= eg.copy.l - 1 && eg.ctrl.r <= eg.copy.r + 1 && eg.ctlTop >= eg.cta.b + 16 && eg.ctlBottom <= eg.sec.b
      && eg.copy.b <= eg.sec.b + 1 && !eg.hits.length && eg.n >= 6 && errs.length === 0, JSON.stringify({ ...eg, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p = await ctx.newPage();
    await p.goto(origin + '/'); await sleep(600);
    const nj = await p.evaluate(() => { const v = document.querySelector('#family-wall [data-wall-view]'), b = document.querySelector('#family-wall [data-wall-btns]'); v.scrollLeft = 200;
      return { js: document.documentElement.classList.contains('js'), ov: getComputedStyle(v).overflowX, max: v.scrollWidth - v.clientWidth, x: Math.round(v.scrollLeft), btns: b.getClientRects().length, side: document.documentElement.scrollWidth - innerWidth }; });
    check('family wall without JS: still a sideways scrolling row, the buttons hidden, no sideways page scroll (1440x900)', !nj.js && nj.ov === 'auto' && nj.max > 200 && nj.x === 200 && nj.btns === 0 && nj.side <= 0, JSON.stringify(nj));
    await ctx.close();
  }
}
// 8. the Sunday Cruise, "The Roadside Sign" (home section 7; owner-picked lab option B with the owner's two tweaks,
//    2026-11-12; "From the farm" merged in): #cruise holds the copy, the ten house-strain links (STRAINS, in order) and
//    the Strain library link, and #farm is gone. "House strains" is the white letter board's header row: dark text on
//    light, 4.5:1 or more. Each strain line's hover highlight (its focus highlight on a phone) sits 12px or more inside
//    the white board on every side, rounded, with clear space between the two columns. The copy and the sign (cabinet,
//    board, hanging panel) never touch the car at --p 0, .25, .5, .75 and 1, nor through the hops when it parks under
//    the sign (1440, 1280, 1024; a phone stacks the copy, the sign and the car in that order). Every text line in the
//    section reads 4.5:1 or more on the rendered pixels (the text hidden, the page shot, the pixels behind each line
//    read on a canvas, the worst 1% against the text's colour), and the copy's shade is seamless (over a flat tone, L*
//    read every 8px across the lede and down the copy column steps 1.5 or less and never bends more than 0.5, at 1440
//    and 390). Reduced motion and no script: a still, complete scene
//    (not pinned, the car parked under the sign, every bulb lit, all eleven links on screen). No sideways page scroll,
//    no script errors.
{
  const { STRAINS } = await import(new URL('../src/content/site.mjs', import.meta.url).href);
  const SCENE = '(min-width: 900px) and (min-height: 760px)';
  const PANELS = '#cruise :is(.cb-copy .kicker, .cb-h, .cb-lede, .cb-cab, .cb-board, .cb-lib)';
  const TEXTS = '#cruise :is(.cb-copy .kicker, .cb-h, .cb-lede, .cb-title, .cb-line, .cb-lib__face)';
  const open = async (w, h, opts = {}) => {
    const ctx = await ctxFor(w, h, opts); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800);
    return { ctx, p, errs };
  };
  // scroll the section to progress k: the pinned stage's scroll on wide screens, the road's trip up the screen otherwise
  const atP = async (p, k, wait = 450) => {
    await p.evaluate(({ k, SCENE }) => {
      const s = document.getElementById('cruise');
      if (matchMedia(SCENE).matches && document.documentElement.classList.contains('cb-live')) { const top = s.getBoundingClientRect().top + scrollY; scrollTo(0, Math.round(top + k * (s.offsetHeight - innerHeight))); }
      else { const top = s.querySelector('.cb-road').getBoundingClientRect().top + scrollY; scrollTo(0, Math.round(top - innerHeight + k * innerHeight * .9)); }
    }, { k, SCENE });
    await sleep(wait);
  };
  const boxes = (p) => p.evaluate((sel) => {
    const s = document.getElementById('cruise'), c = s.querySelector('[data-car]').getBoundingClientRect(), els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
    const hits = els.filter((e) => { const q = e.getBoundingClientRect(); return q.right > c.left && q.left < c.right && q.bottom > c.top && q.top < c.bottom; });
    return { p: +(s.style.getPropertyValue('--p') || 0), car: [c.left, c.top, c.right, c.bottom].map(Math.round), gap: Math.round(c.top - Math.max(...els.map((e) => e.getBoundingClientRect().bottom))), n: els.length, hits: hits.map((e) => e.className || e.tagName) };
  }, PANELS);
  // the rendered contrast of each text line fully in view (its own line boxes, so a kicker's dot or an arrow is not read
  // as text), against the worst 1% of the pixels behind it; "in view" is the band between the fixed header and the store
  // bar, so a line under either is read on another pass, never against the bar's own pixels
  const contrast = async (p, sel) => {
    const items = await p.evaluate((sel) => {
      const out = [], nx = document.getElementById('nx'), dash = document.querySelector('[data-dash].is-on .dash__inner');
      const top = nx ? Math.max(0, nx.getBoundingClientRect().bottom) : 0, bottom = dash ? Math.min(innerHeight, dash.getBoundingClientRect().top) : innerHeight;
      for (const e of document.querySelectorAll(sel)) {
        const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) {
          if (!n.textContent.trim() || n.parentElement.closest('[aria-hidden="true"], .sr-only')) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2 && q.left >= 0 && q.top >= top && q.right <= innerWidth && q.bottom <= bottom)
            out.push({ x: q.left, y: q.top, w: q.width, h: q.height, c: getComputedStyle(n.parentElement).color, t: n.textContent.trim().slice(0, 18) });
        }
      }
      return out;
    }, sel);
    await p.evaluate((sel) => { const st = document.createElement('style'); st.id = 'ct-hide'; st.textContent = sel + ', ' + sel + ' * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.append(st); }, sel);
    await sleep(120);
    const png = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('ct-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.floor(it.x), y = Math.floor(it.y), w = Math.min(cv.width - x, Math.ceil(it.w)), h = Math.min(cv.height - y, Math.ceil(it.h));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, ratio: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  // a strain line's highlight (hover, or keyboard focus on touch screens) against the white board's box; the focus
  // ring is counted where it is drawn (outline offset and width)
  const highlight = (p, i, how) => p.evaluate(({ i, how }) => {
    const a = document.querySelectorAll('#cruise .cb-line')[i], b = a.closest('.cb-panel').getBoundingClientRect(), cs = getComputedStyle(a);
    const out = how === 'focus' && cs.outlineStyle !== 'none' ? Math.max(0, parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth)) : 0;
    const q = a.getBoundingClientRect(), box = { l: q.left - out, t: q.top - out, r: q.right + out, b: q.bottom + out };
    const fill = cs.backgroundColor, on = !/rgba?\(0, 0, 0, 0\)|transparent/.test(fill);
    return { t: a.textContent.trim(), on, fill, radius: parseFloat(cs.borderTopLeftRadius), l: Math.round(box.l - b.left), r: Math.round(b.right - box.r), top: Math.round(box.t - b.top), bot: Math.round(b.bottom - box.b), x: [Math.round(q.left), Math.round(q.right)] };
  }, { i, how });
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [390, 844]]) {
    const tag = `${w}x${h}`, { ctx, p, errs } = await open(w, h);
    if (w === 1440 || w === 390) {
      const m = await p.evaluate(() => { const s = document.getElementById('cruise'), a = [...s.querySelectorAll('a')];
        return { farm: !!document.getElementById('farm'), cruise: !!s && s.hasAttribute('data-cruise'), lines: a.filter((x) => x.matches('.cb-line')).map((x) => [x.getAttribute('href'), x.textContent.trim()]),
          lib: a.filter((x) => x.getAttribute('href') === '/strains' && x.textContent.trim() === 'Strain library').length, links: a.length, kicker: s.querySelector('.kicker').textContent.trim(),
          h2: (() => { const c = s.querySelector('h2').cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); })(),   // the smoke titles add an aria-hidden animated copy
          lede: s.querySelector('.cb-lede').textContent.trim() }; });
      check(`cruise: #cruise holds the copy, the 10 house-strain links (STRAINS, in order, to /strains#<id>) and the Strain library link; #farm is gone (${tag})`,
        m.cruise && !m.farm && m.links === 11 && m.lib === 1 && m.lines.length === 10 && STRAINS.every((st, i) => m.lines[i][0] === '/strains#' + st.id && m.lines[i][1] === st.name) &&
        m.kicker === 'From the farm' && m.h2 === 'Grown by OGs, for OGs' && /^Originals was established in 2006/.test(m.lede), JSON.stringify(m).slice(0, 400));
    }
    // the header row is the white board's, dark on light
    const hd = await p.evaluate(() => { const t = document.querySelector('#cruise .cb-title'), panel = t && t.closest('.cb-panel'), lum = (c) => { const n = c.match(/[\d.]+/g).map(Number).slice(0, 3).map((v) => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * n[0] + .7152 * n[1] + .0722 * n[2]; };
      return { inBoard: !!panel, inCab: !!(t && t.closest('.cb-cab')), text: t && t.textContent.trim(), crowns: t ? t.querySelectorAll('svg.crown').length : 0, textLum: t ? +lum(getComputedStyle(t).color).toFixed(3) : 1 }; });
    check(`cruise: "House strains" (between two crowns) is the white board's header row, in dark letters, not in the dark cabinet (${tag})`, hd.inBoard && !hd.inCab && hd.text === 'House strains' && hd.crowns === 2 && hd.textLum < .05, JSON.stringify(hd));
    // never the car: the copy and the sign's panels at --p 0, .25, .5, .75, 1, sampled through the hops at .5
    const samples = [];
    for (const k of [0, 0.25, 0.5, 0.75, 1]) {
      await atP(p, k, k === 0.5 ? 60 : 450);
      for (let i = 0, n = k === 0.5 ? 26 : 1; i < n; i++) { samples.push({ k, ...(await boxes(p)) }); if (n > 1) await sleep(60); }
    }
    const worst = samples.reduce((a, s) => (s.gap < a.gap ? s : a), samples[0]);
    check(`cruise: the copy and the sign never touch the car, at --p 0, .25, .5, .75, 1 and through the hops (${tag})`,
      samples.every((s) => s.n >= 6 && !s.hits.length && Math.abs(s.p - s.k) < 0.03), `closest ${worst.gap}px at --p ${worst.k} (car top ${worst.car[1]}); ` + JSON.stringify(samples.filter((s, i) => i === 0 || s.k !== samples[i - 1].k).map((s) => ({ k: s.k, p: s.p, gap: s.gap, hits: s.hits }))));
    // the highlight insets: hover on wide screens, keyboard focus on the phone
    await atP(p, 0.5, 1600);
    if (w === 390) await p.evaluate(() => document.querySelector('#cruise .cb-board').scrollIntoView({ block: 'center' }));
    const hl = [];
    for (let i = 0; i < 10; i++) {
      if (w === 390) { await p.focus(`#cruise .cb-list > li:nth-child(${i + 1}) .cb-line`); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); }
      else await p.hover(`#cruise .cb-list > li:nth-child(${i + 1}) .cb-line`);
      await sleep(260); hl.push(await highlight(p, i, w === 390 ? 'focus' : 'hover'));
    }
    if (w === 390) await p.evaluate(() => document.activeElement.blur()); else await p.mouse.move(2, 2);
    const minIn = Math.min(...hl.map((x) => Math.min(x.l, x.r, x.top, x.bot))), colGap = Math.min(...hl.slice(0, 5).map((x) => Math.min(...hl.slice(5).map((y) => y.x[0] - x.x[1]))));
    check(`cruise: each strain line's ${w === 390 ? 'focus' : 'hover'} highlight is a rounded tile 12px or more inside the white board on every side, with 24px or more between the columns (${tag})`,
      hl.length === 10 && hl.every((x) => x.on && x.radius >= 6 && x.l >= 12 && x.r >= 12 && x.top >= 12 && x.bot >= 12) && colGap >= 24,
      `closest ${minIn}px, columns ${colGap}px apart; ` + JSON.stringify(hl.map((x) => [x.t, x.l, x.r, x.top, x.bot, x.on ? 'on' : 'OFF'])));
    // all text 4.5:1 or more: wide screens at two scroll positions; the phone with the copy, then the board, in view
    if (w === 1440 || w === 390) {
      await p.waitForFunction(() => !document.querySelector('#cruise h2').hasAttribute('data-smoke'), null, { timeout: 8000 }).catch(() => {});
      const seen = new Map(), keep = (list) => list.forEach((c) => { if (!seen.has(c.t) || c.ratio < seen.get(c.t)) seen.set(c.t, c.ratio); });
      if (w === 1440) for (const k of [0.3, 0.7]) { await atP(p, k, 900); keep(await contrast(p, TEXTS)); }
      else for (const sel of ['.cb-copy', '.cb-board', '.cb-hang']) { await p.evaluate((sel) => document.querySelector('#cruise ' + sel).scrollIntoView({ block: 'center' }), sel); await sleep(500); keep(await contrast(p, TEXTS)); }
      const all = [...seen].map(([t, ratio]) => ({ t, ratio }));
      check(`cruise: every text line reads 4.5:1 or more on the rendered pixels (kicker, title, lede, "House strains", the ten lines, Strain library) (${tag})`,
        all.length >= 16 && all.every((c) => c.ratio >= 4.5), JSON.stringify(all.sort((a, b) => a.ratio - b.ratio).slice(0, 5)) + ' of ' + all.length);
      // the copy shade is seamless (owner request 2026-11-12): over a flat mid-tone (the photo, copy, sign, car, header and
      // store bar hidden), L* read every 8px (a 5px box each) along a line through the lede and down the copy column
      // (to the bottom haze) never steps more than 1.5 between samples, and its slope never bends more than 0.5
      if (w === 1440) await atP(p, 0.5, 700); else { await p.evaluate(() => scrollTo(0, document.getElementById('cruise').getBoundingClientRect().top + scrollY)); await sleep(700); }
      const geo = await p.evaluate(() => {
        const s = document.getElementById('cruise'), lede = s.querySelector('.cb-lede').getBoundingClientRect(), copy = s.querySelector('.cb-copy').getBoundingClientRect(), stage = s.querySelector('.cb-stage').getBoundingClientRect();
        const st = document.createElement('style'); st.id = 'cb-flat';
        st.textContent = '#cruise .cb-sky img, #cruise .cb-scene, #cruise .cb-road, #nx, .nx, .dash, .gate { visibility: hidden !important; } #cruise .cb-sky { background: rgb(119, 119, 119) !important; }';
        document.head.append(st);
        return { y: Math.round(lede.top + lede.height / 2), x: Math.round(copy.left + copy.width / 2), top: Math.max(0, Math.round(stage.top)), bot: Math.min(innerHeight, Math.round(stage.top + stage.height * .84)), w: innerWidth };
      });
      await sleep(250);
      const flat = (await p.screenshot({ scale: 'css' })).toString('base64');
      await p.evaluate(() => document.getElementById('cb-flat').remove());
      const prof = await p.evaluate(async ({ png, geo }) => {
        const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
        const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const Ls = (r, gr, b) => { const Y = 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b); return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
        const at = (x, y) => { const d = g.getImageData(Math.max(0, x - 2), Math.max(0, y - 2), 5, 5).data; let r = 0, gr = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; } return Ls(r / n, gr / n, b / n); };
        const read = (pts) => { const L = pts.map(([x, y]) => at(x, y)), d1 = L.slice(1).map((v, i) => v - L[i]), d2 = d1.slice(1).map((v, i) => v - d1[i]);
          return { n: L.length, span: [+L[0].toFixed(1), +L[L.length - 1].toFixed(1)], step: +Math.max(...d1.map(Math.abs)).toFixed(2), bend: +Math.max(...d2.map(Math.abs)).toFixed(2) }; };
        const hx = [], vy = [];
        for (let x = 4; x <= geo.w - 4; x += 8) hx.push([x, geo.y]);
        for (let y = geo.top + 4; y <= geo.bot - 4; y += 8) vy.push([geo.x, y]);
        return { across: read(hx), down: read(vy) };
      }, { png: flat, geo });
      check(`cruise: the copy shade is seamless: over a flat tone its L* steps 1.5 or less per 8px and its slope bends 0.5 or less, across the lede and down the copy column (${tag})`,
        prof.across.n > 30 && prof.down.n > 30 && prof.across.step <= 1.5 && prof.down.step <= 1.5 && prof.across.bend <= 0.5 && prof.down.bend <= 0.5, JSON.stringify(prof));
    }
    if (w === 390) {
      await atP(p, 0.5, 1600);
      const o = await p.evaluate(() => { const s = document.getElementById('cruise'), r = (sel) => { const q = s.querySelector(sel).getBoundingClientRect(); return { t: Math.round(q.top), b: Math.round(q.bottom) }; };
        return { copy: r('.cb-copy'), sign: r('.cb-cab'), lib: r('.cb-lib'), car: r('[data-car]'), taps: [...s.querySelectorAll('a')].map((a) => { const q = a.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; }) }; });
      check('cruise on a phone: the copy, then the sign (a full-width board, tap targets 44px or more), then the car under its pole (390x844)',
        o.copy.b <= o.sign.t && o.lib.b <= o.car.t && o.taps.length === 11 && o.taps.every(([tw, th]) => tw >= 44 && th >= 44), JSON.stringify(o));
    }
    const side = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`cruise: no sideways page scroll and no script errors (${tag})`, side <= 0 && errs.length === 0, 'overflow ' + side + 'px ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // reduced motion and no script: the still, complete scene
  for (const [w, h, opts, label] of [[1440, 900, { reducedMotion: 'reduce' }, 'reduced motion'], [390, 844, { reducedMotion: 'reduce' }, 'reduced motion'], [1440, 900, { javaScriptEnabled: false }, 'no script']]) {
    const tag = `${w}x${h}`, { ctx, p, errs } = await open(w, h, opts);
    await p.evaluate(() => scrollTo(0, document.getElementById('cruise').getBoundingClientRect().top + scrollY)); await sleep(700);
    const st = await p.evaluate(() => {
      const s = document.getElementById('cruise'), stage = s.querySelector('.cb-stage'), car = s.querySelector('.cb-car'), c = s.querySelector('[data-car]').getBoundingClientRect(), pole = s.querySelector('.cb-pole').getBoundingClientRect();
      const bulbs = [...s.querySelectorAll('.cb-bulbs')].map((b) => getComputedStyle(b));
      return { live: document.documentElement.classList.contains('cb-live'), pinned: getComputedStyle(stage).position === 'sticky', tall: Math.round(s.offsetHeight - stage.offsetHeight),
        carMoved: getComputedStyle(car).transform !== 'none', carOn: c.left >= 0 && c.right <= innerWidth + 1 && c.width > 100, carToPole: Math.round(Math.abs((c.left + c.right) / 2 - (pole.left + pole.right) / 2)),
        bulbs: bulbs.length, still: bulbs.every((b) => b.animationName === 'none'), allLit: bulbs.every((b) => b.getPropertyValue('--cb-tile').trim() === b.getPropertyValue('--cb-pt').trim()),
        lit: getComputedStyle(s.querySelector('.cb-sign')).getPropertyValue('--cb-lit').trim(), links: [...s.querySelectorAll('a')].filter((a) => a.getBoundingClientRect().width > 0 && getComputedStyle(a).visibility === 'visible').length,
        side: document.documentElement.scrollWidth - innerWidth };
    });
    check(`cruise, ${label}: a still, complete scene (not pinned, the car parked under the sign, every bulb lit and still, all 11 links shown) (${tag})`,
      !st.live && !st.pinned && st.tall <= 0 && !st.carMoved && st.carOn && st.carToPole <= 60 && st.bulbs === 4 && st.still && st.allLit && +st.lit === 1 && st.links === 11 && st.side <= 0 && errs.length === 0, JSON.stringify(st) + ' ' + errs.slice(0, 1).join(''));
    await ctx.close();
  }
}
// 9. the home brand marquee (owner request 2026-11-12): "Shop by brand" is two rows of brand tiles rolling opposite ways
//    (row 1 left, row 2 right, 40-60 s a loop), each rail holding its track twice for a seamless loop. The 16 brands are
//    links in the accessibility tree once: the copies are aria-hidden with tabindex -1, Tab never reaches them, and a
//    tabbed tile is on screen. Every logo loads; hovering a row pauses it and moving away resumes it; reduced motion: no
//    animation, a sideways-scrolling row. Never a sideways page scroll, never a script error. The pause / play button
//    (WCAG 2.2.2, owner-approved 2026-11-12): one real button for both rows, named, 44x44 or more, a focus ring; a press
//    stops both rows, a second plays them, the name follows; the choice is kept; hidden under reduced motion and without JS.
//    No boxes, white marks (owner, 2026-11-12): no tile background, border or shadow at rest, every logo near-white on the
//    ink at 4.5:1 or more, the text items light; a hovered logo brightens. The home collab tape: real logos where found
//    (white, no box) with their with / collab lines, a seamless loop, its own pause button; static under reduced motion.
{
  const mq = (p) => p.evaluate(() => {
    const s = document.getElementById('brands');
    return {
      rows: [...s.querySelectorAll('.bmq__row')].map((row) => {
        const rail = row.querySelector('.bmq__rail'), tracks = [...rail.children];
        return { x: new DOMMatrixReadOnly(getComputedStyle(rail).transform).m41, w: tracks[0].getBoundingClientRect().width,
          play: rail.getAnimations().map((an) => an.playState), dur: parseFloat(getComputedStyle(rail).animationDuration),
          ovx: getComputedStyle(row).overflowX, scroll: row.scrollWidth - row.clientWidth,
          tracks: tracks.map((t) => ({ hidden: t.getAttribute('aria-hidden'), shown: t.getClientRects().length > 0,
            links: [...t.querySelectorAll('a')].map((l) => ({ href: l.href, tab: l.tabIndex, ext: l.target === '_blank' && /noopener/.test(l.rel) })) })) };
      }),
      imgs: [...s.querySelectorAll('.bmq img')].map((i) => ({ ok: i.complete && i.naturalWidth > 0, src: (i.currentSrc || i.src).split('/').pop() })),
      side: document.documentElement.scrollWidth - innerWidth, sx: scrollX,
    };
  });
  const step = (x1, x2, W) => { let d = x2 - x1; if (d > W / 2) d -= W; if (d < -W / 2) d += W; return d; };   // unwrapped across the loop seam
  const axLinks = async (p) => { const y = await p.locator('#brands .bmq').ariaSnapshot(); return { n: (y.match(/^\s*- link\b/gm) || []).length, urls: [...new Set((y.match(/\/url: \S+/g) || []).map((m) => m.slice(6)))] }; };
  const toMarquee = (p) => p.evaluate(() => { const q = document.querySelector('#brands .bmq').getBoundingClientRect(); scrollTo(0, Math.round(q.top + scrollY - (innerHeight - q.height) / 2)); });
  const menuUrl = (u) => /^https:\/\/originalsca\.com\/menu\/los-angeles\/brands\/[a-z0-9-]+\/$/.test(u);
  const { COLLABS } = await import('../src/content/site.mjs');
  // each mark as it renders: a logo at its own pixel size (its img reports the srcset's density-corrected size), drawn with its
  // computed filter and opacity over the first painted background behind it (the section's ink when there is no box); a text
  // item by its colour and opacity. noBox: the item has no background, border or shadow.
  const markTone = (p, sel) => p.evaluate(async (sel) => {
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (x, y) => { const p1 = lum(x), p2 = lum(y); return (Math.max(p1, p2) + 0.05) / (Math.min(p1, p2) + 0.05); };
    const rgba = (s) => { const n = (s.match(/[\d.]+/g) || []).map(Number); return n.length >= 4 ? n : [...n, 1]; };
    const paint = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) return c.slice(0, 3); } return [255, 255, 255]; };
    const out = [];
    for (const t of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(t), bg = paint(t.parentElement), Lb = lum(bg), im = t.querySelector('img');
      const noBox = rgba(cs.backgroundColor)[3] === 0 && (cs.borderTopStyle === 'none' || parseFloat(cs.borderTopWidth) === 0) && cs.boxShadow === 'none';
      if (!im) {
        const tx = t.querySelector('strong, span') || t, tcs = getComputedStyle(tx), op = parseFloat(tcs.opacity), col = rgba(tcs.color).slice(0, 3).map((v, k) => v * op + bg[k] * (1 - op));
        out.push({ name: tx.textContent.trim(), text: true, noBox, bgL: +Lb.toFixed(3), ratio: +ratio(col, bg).toFixed(1) }); continue;
      }
      const src = new Image(); src.src = im.currentSrc || im.src; await src.decode().catch(() => {});
      const W = src.naturalWidth, H = src.naturalHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const x = cv.getContext('2d', { willReadFrequently: true }); x.fillStyle = 'rgb(' + bg.join(',') + ')'; x.fillRect(0, 0, W, H);
      x.filter = getComputedStyle(im).filter; x.globalAlpha = parseFloat(getComputedStyle(im).opacity); x.drawImage(src, 0, 0, W, H);
      const px = x.getImageData(0, 0, W, H).data, sum = [0, 0, 0]; let ink = 0, light = 0;
      for (let i = 0; i < px.length; i += 4) { const q = [px[i], px[i + 1], px[i + 2]], L = lum(q); if (L - Lb > 0.3) { ink++; if (L >= 0.5) light++; sum[0] += q[0]; sum[1] += q[1]; sum[2] += q[2]; } }
      out.push({ name: im.alt, src: (im.currentSrc || im.src).split('/').pop(), noBox, bgL: +Lb.toFixed(3), ink, light: +(light / Math.max(1, ink)).toFixed(2), ratio: +ratio(sum.map((s) => s / Math.max(1, ink)), bg).toFixed(1) });
    }
    return out;
  }, sel);
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const tag = w + 'x' + h;
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(700); await toMarquee(p); await sleep(1500);
    const a = await mq(p); await sleep(1200); const b = await mq(p);
    const d = a.rows.map((r, i) => step(r.x, b.rows[i].x, r.w));
    check(`brand marquee: two rows rolling opposite ways, row 1 left and row 2 right, 40-60 s a loop (${tag})`,
      a.rows.length === 2 && d[0] < -5 && d[1] > 5 && a.rows.every((r) => r.play.join() === 'running' && r.dur >= 40 && r.dur <= 60), JSON.stringify({ d: d.map(Math.round), dur: a.rows.map((r) => r.dur), play: a.rows.map((r) => r.play) }));
    check(`brand marquee: each rail is its track twice, 8 tiles each, the copy aria-hidden with every link tabindex -1 (${tag})`,
      a.rows.length === 2 && a.rows.every((r) => r.tracks.length === 2 && r.tracks[0].hidden === null && r.tracks[1].hidden === 'true' && r.tracks[0].links.length === 8
        && r.tracks[1].links.map((l) => l.href).join() === r.tracks[0].links.map((l) => l.href).join() && r.tracks[0].links.every((l) => l.tab === 0 && l.ext) && r.tracks[1].links.every((l) => l.tab === -1)),
      JSON.stringify(a.rows.map((r) => r.tracks.map((t) => [t.hidden, t.links.length, [...new Set(t.links.map((l) => l.tab))].join('/')]))));
    const sg = await p.evaluate(() => [...document.querySelectorAll('#brands .bmq__row')].map((row) => { const r = [...row.querySelectorAll('.bmq__tile')].map((e) => e.getBoundingClientRect()); return [Math.round(r[1].left - r[0].right), Math.round(r[8].left - r[7].right)]; }));
    check(`brand marquee: even spacing across the loop seam (the gap from copy to copy equals the gap between tiles) (${tag})`, sg.length === 2 && sg.every(([inner, seam]) => inner > 0 && Math.abs(seam - inner) <= 1), JSON.stringify(sg));
    const ax = await axLinks(p);
    check(`brand marquee: 16 unique brand links in the accessibility tree, each to its LA menu page (${tag})`, ax.n === 16 && ax.urls.length === 16 && ax.urls.every(menuUrl), JSON.stringify({ links: ax.n, unique: ax.urls.length }));
    const srcs = new Set(a.imgs.map((i) => i.src));
    check(`brand marquee: every logo loaded, once per copy (${tag})`, a.imgs.length >= 26 && a.imgs.every((i) => i.ok) && srcs.size * 2 === a.imgs.length,
      JSON.stringify({ imgs: a.imgs.length, unique: srcs.size, broken: a.imgs.filter((i) => !i.ok).map((i) => i.src) }));
    // no boxes, white marks (owner 2026-11-12: "no containers please!"): every first-copy item has no background, border or
    // shadow at rest; each logo reads near-white on the ink behind it at 4.5:1 or more; the text items are light
    const tone = await markTone(p, '#brands .bmq__track:not([aria-hidden]) .bmq__tile');
    const logos = tone.filter((t) => !t.text), weak = tone.filter((t) => !(t.noBox && t.bgL <= 0.02 && t.ratio >= 4.5 && (t.text || (t.ink > 2000 && t.light >= 0.85))));
    check(`brand marquee: no tile boxes at rest; every logo near-white on the ink at 4.5:1 or more, the text items light; Wyld as its white badge (${tag})`,
      tone.length === 16 && logos.length >= 13 && !weak.length && logos.some((t) => /logo-wyld-white/.test(t.src)),
      JSON.stringify({ weak, items: tone.length, logos: logos.length, min: { ratio: Math.min(...tone.map((t) => t.ratio)), light: Math.min(...logos.map((t) => t.light)) } }));
    if (w >= 800) {
      const r1 = await p.locator('#brands .bmq__row--left').boundingBox();
      await p.mouse.move(r1.x + r1.width / 2, r1.y + r1.height / 2); await sleep(400);
      // the row is still now: put the pointer on the middle of the nearest logo; it brightens (its mark to full opacity) and no box appears
      const tc = await p.evaluate((mx) => { const ts = [...document.querySelectorAll('#brands .bmq__row--left .bmq__tile')].map((t) => t.getBoundingClientRect()).filter((q) => q.left >= 0 && q.right <= innerWidth);
        const q = ts.sort((u, v) => Math.abs(u.left + u.width / 2 - mx) - Math.abs(v.left + v.width / 2 - mx))[0]; return q ? [q.left + q.width / 2, q.top + q.height / 2] : null; }, r1.x + r1.width / 2);
      const rest = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#brands .bmq__tile > *')).opacity));
      if (tc) { await p.mouse.move(tc[0], tc[1]); await sleep(400); }
      const hv = tc ? await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); const e = t && t.closest('.bmq__tile'); if (!e) return null; const cs = getComputedStyle(e);
        return { op: parseFloat(getComputedStyle(e.firstElementChild).opacity), bg: cs.backgroundColor, shadow: cs.boxShadow, border: cs.borderTopStyle }; }, tc) : null;
      check(`brand marquee: a hovered logo brightens (rest ${rest}), and no box appears (${tag})`, !!hv && rest < 1 && hv.op === 1 && /rgba\(0, 0, 0, 0\)|transparent/.test(hv.bg) && hv.shadow === 'none' && hv.border === 'none', JSON.stringify({ rest, ...hv }));
      const h1 = await mq(p); await sleep(1000); const h2 = await mq(p);
      await p.mouse.move(r1.x + r1.width / 2, Math.max(2, r1.y - 160)); await sleep(300);
      const o1 = await mq(p); await sleep(1000); const o2 = await mq(p);
      const dh = h1.rows.map((r, i) => step(r.x, h2.rows[i].x, r.w)), dout = step(o1.rows[0].x, o2.rows[0].x, o1.rows[0].w);
      check(`brand marquee: hovering row 1 pauses it while row 2 keeps rolling; moving away resumes it (${tag})`,
        h1.rows[0].play.join() === 'paused' && Math.abs(dh[0]) < 0.5 && dh[1] > 5 && o2.rows[0].play.join() === 'running' && dout < -5,
        JSON.stringify({ hover: dh.map((x) => +x.toFixed(1)), play: h1.rows.map((r) => r.play.join()), after: +dout.toFixed(1) }));
    }
    // the pause / play button: reached by Tab after Shop All Brands, with a focus ring; a press (a tap on the phone) pauses both rows, a second plays them
    const TB = '#brands [data-marquee-toggle]', press = (sel) => (w < 800 ? p.tap(sel) : p.click(sel));
    const tb = () => p.evaluate(() => { const e = document.querySelector('#brands [data-marquee-toggle]'); if (!e) return null; const q = e.getBoundingClientRect();
      return { tag: e.tagName, type: e.type, name: e.getAttribute('aria-label'), state: e.getAttribute('data-state'), shown: e.getClientRects().length > 0, w: Math.round(q.width), h: Math.round(q.height), ctl: e.getAttribute('aria-controls') }; });
    await p.focus('#brands .bmq__cta .btn'); await p.keyboard.press('Tab'); await sleep(150);
    const ring = await p.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return { focused: e.matches('[data-marquee-toggle]'), fv: e.matches(':focus-visible'), ring: cs.outlineStyle + ' ' + parseFloat(cs.outlineWidth) }; });
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    const t0 = await tb(), named0 = await p.getByRole('button', { name: 'Pause brand logos' }).count();
    check(`brand marquee: one pause button for both rows, named "Pause brand logos", 44x44 or more, reached by Tab with a focus ring (${tag})`,
      !!t0 && t0.tag === 'BUTTON' && t0.type === 'button' && t0.name === 'Pause brand logos' && named0 === 1 && t0.state === 'playing' && t0.shown && t0.w >= 44 && t0.h >= 44 && t0.ctl === 'brands-marquee'
        && ring.focused && ring.fv && /^solid [2-9]/.test(ring.ring), JSON.stringify({ ...t0, named: named0, ...ring }));
    await press(TB); await sleep(300);
    const t1 = await tb(), named1 = await p.getByRole('button', { name: 'Play brand logos' }).count(), q1 = await mq(p); await sleep(1000); const q2 = await mq(p);
    const dp = q1.rows.map((r, i) => step(r.x, q2.rows[i].x, r.w));
    await press(TB); await sleep(300);
    const t2 = await tb(), q3 = await mq(p); await sleep(1000); const q4 = await mq(p);
    const dr = q3.rows.map((r, i) => step(r.x, q4.rows[i].x, r.w));
    check(`brand marquee: a press pauses both rows and the button reads "Play brand logos"; a second press plays both again (${tag})`,
      t1.name === 'Play brand logos' && t1.state === 'paused' && named1 === 1 && q1.rows.every((r) => r.play.join() === 'paused') && dp.every((x) => Math.abs(x) < 0.5)
        && t2.name === 'Pause brand logos' && t2.state === 'playing' && q3.rows.every((r) => r.play.join() === 'running') && dr[0] < -5 && dr[1] > 5,
      JSON.stringify({ paused: { name: t1.name, d: dp.map((x) => +x.toFixed(1)) }, played: { name: t2.name, d: dr.map((x) => +x.toFixed(1)) } }));
    if (w >= 800) {
      await press(TB); await sleep(200); await p.reload(); await sleep(900); await toMarquee(p); await sleep(700);
      const t3 = await tb(), k1 = await mq(p); await sleep(900); const k2 = await mq(p);
      const dk = k1.rows.map((r, i) => step(r.x, k2.rows[i].x, r.w));
      await press(TB); await sleep(300); const t4 = await tb();
      check(`brand marquee: the paused choice is kept on reload, and a press plays again (${tag})`, t3.name === 'Play brand logos' && dk.every((x) => Math.abs(x) < 0.5) && t4.name === 'Pause brand logos',
        JSON.stringify({ reload: t3.name, d: dk.map((x) => +x.toFixed(1)), after: t4.name }));
    }
    // the keyboard: Tab from the first tile walks the other 15 first-copy links in order, Shift+Tab walks back; never a copy, every tile on screen
    const order = a.rows.flatMap((r) => r.tracks[0].links.map((l) => l.href));
    const at = () => p.evaluate(() => { const e = document.activeElement, q = e.getBoundingClientRect(); return { href: e.href || null, copy: !!e.closest('[aria-hidden="true"]'), on: q.width > 0 && q.left >= -1 && q.right <= innerWidth + 1 }; });
    await p.focus('#brands .bmq__row--left .bmq__track a');
    const fwd = [], back = [];
    for (let k = 0; k < 15; k++) { await p.keyboard.press('Tab'); await sleep(120); fwd.push(await at()); }
    for (let k = 0; k < 15; k++) { await p.keyboard.press('Shift+Tab'); await sleep(120); back.push(await at()); }
    const walk = [...fwd, ...back];
    check(`brand marquee: Tab walks the 16 first-copy links in order and never a copy; every tabbed tile is fully on screen (${tag})`,
      fwd.map((f) => f.href).join() === order.slice(1).join() && back.map((f) => f.href).join() === order.slice(0, 15).reverse().join() && walk.every((f) => !f.copy && f.on),
      JSON.stringify({ off: walk.filter((f) => !f.on).map((f) => f.href && f.href.split('/').slice(-2, -1)[0]), copies: walk.filter((f) => f.copy).length, n: order.length }));
    await p.evaluate(() => document.activeElement && document.activeElement.blur());
    // the collab tape (home "LIT LIKE OUR events"; owner 2026-11-12: "use actual brand logos here"): the collabs once in order
    // (each its logo where one was found, else its name, over its with / collab line as in COLLABS), then all again aria-hidden
    // one half-track on (a seamless loop); its logos load and read white on the ink at 4.5:1 or more with no box; it rolls
    // left; its own pause button stops it and plays it again
    const TT = '[data-marquee-toggle][aria-controls="collab-tape"]';
    const tape = () => p.evaluate(() => { const tr = document.querySelector('#collab-tape .collab-tape__track');
      return { x: new DOMMatrixReadOnly(getComputedStyle(tr).transform).m41, play: tr.getAnimations().map((an) => an.playState), w: tr.getBoundingClientRect().width,
        items: [...tr.children].map((li) => { const im = li.querySelector('img'), s = li.querySelector(':scope > span'), n = li.querySelector('strong');
          return { hidden: li.getAttribute('aria-hidden'), logo: im ? im.alt : null, ok: !im || (im.complete && im.naturalWidth > 0), name: n ? n.textContent : null, line: s ? s.textContent : null, left: li.getBoundingClientRect().left }; }) }; });
    if (w >= 800) await p.mouse.move(2, 2);   // off the tape: hovering it pauses it
    await p.evaluate(() => { const q = document.getElementById('collab-tape').getBoundingClientRect(); scrollTo(0, Math.round(q.top + scrollY - (innerHeight - q.height) / 2)); }); await sleep(900);
    const k1 = await tape();
    const want = COLLABS.map((c) => ({ name: c.product || c.partner, line: c.product ? 'with ' + c.partner + (c.with ? ' and ' + c.with : '') : 'collab' }));
    const once = k1.items.filter((i) => !i.hidden), again = k1.items.filter((i) => i.hidden === 'true');
    const inOrder = once.length === want.length && once.every((i, k) => i.line === want[k].line && (i.logo ? i.logo === want[k].name + ' logo' : i.name === want[k].name));
    const seam = once.length && again.length ? Math.abs(again[0].left - once[0].left - k1.w / 2) : 99;
    check(`collab tape: the ${want.length} collabs in order, each its logo or its name over its with / collab line as in COLLABS, then all again aria-hidden one half-track on (${tag})`,
      inOrder && again.length === want.length && again.every((i, k) => i.line === want[k].line) && seam <= 1, JSON.stringify({ items: once.map((i) => [i.logo || i.name, i.line]), copies: again.length, seam: +seam.toFixed(1) }));
    const kt = await markTone(p, '#collab-tape .collab-tape__track > li:not([aria-hidden])');
    const kl = kt.filter((t) => !t.text), kw = kt.filter((t) => !(t.noBox && t.ratio >= 4.5 && (t.text || (t.ink > 2000 && t.light >= 0.85))));
    check(`collab tape: every collab logo loads and reads white on the ink at 4.5:1 or more with no box; the names light (${tag})`,
      kl.length >= 2 && k1.items.every((i) => i.ok) && !kw.length, JSON.stringify({ logos: kl.map((t) => t.name), weak: kw, min: Math.min(...kt.map((t) => t.ratio)) }));
    const kb = await p.evaluate((s) => { const e = document.querySelector(s), q = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label'), shown: e.getClientRects().length > 0, w: Math.round(q.width), h: Math.round(q.height) }; }, TT);
    const kx1 = await tape(); await sleep(1200); const kx2 = await tape();
    await press(TT); await sleep(300);
    const kp = await p.evaluate((s) => document.querySelector(s).getAttribute('aria-label'), TT), kq1 = await tape(); await sleep(1000); const kq2 = await tape();
    await press(TT); await sleep(300);
    const kr = await p.evaluate((s) => document.querySelector(s).getAttribute('aria-label'), TT), kz1 = await tape(); await sleep(1200); const kz2 = await tape();
    const half = k1.w / 2, dk = [step(kx1.x, kx2.x, half), step(kq1.x, kq2.x, half), step(kz1.x, kz2.x, half)];
    check(`collab tape: it rolls left; its pause button (named, 44x44 or more) stops it and reads "Play collabs", a second press plays it again (${tag})`,
      dk[0] < -3 && kb.name === 'Pause collabs' && kb.shown && kb.w >= 44 && kb.h >= 44 && kp === 'Play collabs' && Math.abs(dk[1]) < 0.5 && kq1.play.join() === 'paused' && kr === 'Pause collabs' && dk[2] < -3,
      JSON.stringify({ d: dk.map((x) => +x.toFixed(1)), btn: kb, paused: kp, played: kr }));
    const end = await mq(p);
    check(`brand marquee: no sideways page scroll and no script errors (${tag})`, a.side <= 0 && end.side <= 0 && end.sx === 0 && errs.length === 0,
      JSON.stringify({ side: [a.side, end.side], sx: end.sx, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const tag = w + 'x' + h;
    const ctx = await ctxFor(w, h, { reducedMotion: 'reduce' }); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(700); await toMarquee(p); await sleep(800);
    const a = await mq(p); await sleep(900); const b = await mq(p);
    const ax = await axLinks(p);
    check(`brand marquee, reduced motion: no animation; each row a sideways-scrolling row of its 8 tiles, the copies not shown; 16 links (${tag})`,
      a.rows.length === 2 && a.rows.every((r, i) => r.play.length === 0 && r.x === 0 && b.rows[i].x === 0 && r.ovx === 'auto' && r.scroll > 0 && r.tracks[0].shown && !r.tracks[1].shown) && ax.n === 16,
      JSON.stringify({ rows: a.rows.map((r) => ({ play: r.play.length, x: r.x, ovx: r.ovx, scroll: r.scroll, copy: r.tracks[1].shown })), links: ax.n }));
    check(`brand marquee, reduced motion: no sideways page scroll and no script errors (${tag})`, a.side <= 0 && a.sx === 0 && errs.length === 0, JSON.stringify({ side: a.side, errs: errs.slice(0, 2) }));
    const rb = await p.evaluate(() => { const e = document.querySelector('#brands [data-marquee-toggle]'); return e ? { shown: e.getClientRects().length > 0, hiddenAttr: e.hidden } : null; });
    check(`brand marquee, reduced motion: the pause button is hidden, nothing moves (${tag})`, !!rb && !rb.shown, JSON.stringify(rb));
    const kr0 = await p.evaluate(() => { const tr = document.querySelector('#collab-tape .collab-tape__track'), bt = document.querySelector('[data-marquee-toggle][aria-controls="collab-tape"]');
      return { anims: tr.getAnimations().length, x: new DOMMatrixReadOnly(getComputedStyle(tr).transform).m41, btn: bt ? bt.getClientRects().length : -1, copies: [...tr.children].filter((li) => li.getAttribute('aria-hidden') === 'true' && li.getClientRects().length > 0).length, items: tr.children.length }; });
    check(`collab tape, reduced motion: static (no animation), its pause button hidden, the copy not shown (${tag})`, kr0.anims === 0 && kr0.x === 0 && kr0.btn === 0 && kr0.copies === 0 && kr0.items > 0, JSON.stringify(kr0));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p = await ctx.newPage();
    await p.goto(origin + '/'); await sleep(600);
    const nj = await p.evaluate(() => { const e = document.querySelector('#brands [data-marquee-toggle]'), t = document.querySelector('[data-marquee-toggle][aria-controls="collab-tape"]');
      return { js: document.documentElement.classList.contains('js'), exists: !!e, shown: !!e && e.getClientRects().length > 0, rows: document.querySelectorAll('#brands .bmq__row').length, tape: !!t, tapeShown: !!t && t.getClientRects().length > 0 }; });
    check('brand marquee and collab tape without JS: both pause buttons stay hidden (they need the script); the marquee rows still show (1440x900)', !nj.js && nj.exists && !nj.shown && nj.rows === 2 && nj.tape && !nj.tapeShown, JSON.stringify(nj));
    await ctx.close();
  }
}
// 10. the deals wall (/deals; owner requests 2026-11-12): the four deal plaques, word for word, as tall cards on a concave
//    wall, ported from an earlier redesign's cave gallery (shop.mjs cave(), carousel.css, site.js [data-cave]).
//    The centred card faces front and sits furthest back; its neighbours turn in (each one's outer edge renders taller
//    than its inner edge) and step toward the viewer; the fourth hides behind; the ring is endless (modulo 4). Wide
//    screens show the centred card and both neighbours whole; on a phone the centred card is about 78vw and the
//    neighbours peek. Next, prev, the arrow keys, a drag (mouse) or a swipe (touch) and a sideways wheel turn it, and the
//    live region names the new deal; a drag snaps to the nearest card and a flick carries on; a click on a side card
//    centres it and opens nothing; the centred card's button opens its link; only that button is in the tab order; a
//    vertical wheel or swipe over the wall scrolls the page; the page never scrolls sideways. With reduced motion (also
//    switched live), and without JS: a flat sideways scroll-snap row, no 3D.
{
  const { STORES: S } = await import(new URL('../src/content/site.mjs', import.meta.url));
  const DEALS = [['All-day Sunday happy hour', 'Shop Sunday', S.la.menu], ['30% OFF FTP', 'Shop LA', S.la.menu], ['50% OFF FTP', 'Shop San Diego', S.sd.menu], ['San Diego daily deals', 'See today\'s deals', S.sd.deals]];
  const liveFor = (i) => `${i + 1} of 4: ${DEALS[i][0]}`;
  const cs = (p) => p.evaluate(() => {
    const cv = document.querySelector('[data-cave]'), stage = cv.querySelector('.cave__stage'), wall = cv.querySelector('.cave__wall'), panels = [...cv.querySelectorAll('.cave__panel')];
    // where a point of a card renders (3D included): a zero-size probe placed there for a moment
    const pt = (el, x, y) => { const s = document.createElement('i'); s.style.cssText = 'position:absolute;width:0;height:0;left:' + x + ';top:' + y; el.appendChild(s); const r = s.getBoundingClientRect(); s.remove(); return r.top; };
    const per = panels.map((el) => {
      const t = getComputedStyle(el).transform, m = new DOMMatrix(t === 'none' ? undefined : t), q = el.getBoundingClientRect(), a = el.querySelector('a[href]');
      return { ry: Math.atan2(-m.m13, m.m11) * 180 / Math.PI, tz: m.m43, flat: t === 'none', left: pt(el, '0', '100%') - pt(el, '0', '0'), right: pt(el, '100%', '100%') - pt(el, '100%', '0'), mid: pt(el, '50%', '100%') - pt(el, '50%', '0'),
        l: q.left, r: q.right, cx: (q.left + q.right) / 2, top: Math.round(q.top), w: el.offsetWidth, cur: el.getAttribute('aria-current') === 'true', op: +getComputedStyle(el).opacity, vis: getComputedStyle(el).visibility,
        role: el.getAttribute('role'), rd: el.getAttribute('aria-roledescription'), label: el.getAttribute('aria-label') || '', links: el.querySelectorAll('a[href]').length,
        href: a && a.getAttribute('href'), cta: a && a.textContent.trim(), tab: a ? a.tabIndex : null, target: a && a.getAttribute('target') };
    });
    const ws = getComputedStyle(wall), lab = document.getElementById(cv.getAttribute('aria-labelledby') || ''), live = cv.querySelector('[data-cave-live]');
    const shown = (sel) => { const e = cv.querySelector(sel); return !!e && e.getClientRects().length > 0; };
    return { on: cv.classList.contains('cave-on'), js: document.documentElement.classList.contains('js'), role: cv.getAttribute('role'), rd: cv.getAttribute('aria-roledescription'), label: lab ? lab.textContent.trim() : '',
      stage: { tab: stage.tabIndex, role: stage.getAttribute('role'), label: stage.getAttribute('aria-label') || '' }, focusIn: document.activeElement === stage,
      live: live ? live.textContent : null, polite: live ? live.getAttribute('aria-live') : null, n: (cv.querySelector('[data-cave-n]') || {}).textContent, cap: (cv.querySelector('.cave__title') || {}).textContent,
      chrome: shown('.cave__caption') && shown('.cave__controls'),
      btns: [...cv.querySelectorAll('[data-cave-prev], [data-cave-next]')].map((b) => { const q = b.getBoundingClientRect(); return { tag: b.tagName, type: b.type, label: b.getAttribute('aria-label'), w: Math.round(q.width), h: Math.round(q.height) }; }),
      active: per.findIndex((q) => q.cur), per, vw: innerWidth, sx: scrollX, y: Math.round(scrollY), side: document.documentElement.scrollWidth - innerWidth,
      wall: { ov: ws.overflowX, snap: ws.scrollSnapType, max: wall.scrollWidth - wall.clientWidth } };
  });
  const toCave = (p) => p.evaluate(() => { const c = document.querySelector('[data-cave]'), hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72; scrollTo(0, Math.round(c.getBoundingClientRect().top + scrollY - hh - 8)); });
  // the arc at rest around the centred card a: c centred, facing front, furthest back; r (a + 1) and l (a + 3) turned in and
  // nearer, their outer edges taller than their inner ones; b (a + 2) hidden behind. f() reports each card's rotateY, z
  // and scale (its middle line over the centred card's)
  const arc = (s) => {
    const a = s.active, P = s.per; if (a < 0) return { ok: false, detail: 'no centred card' };
    const c = P[a], r = P[(a + 1) % 4], l = P[(a + 3) % 4], b = P[(a + 2) % 4];
    const f = (q) => `rotateY ${q.ry.toFixed(1)}deg, z ${q.tz.toFixed(0)}px, scale ${(q.mid / c.mid).toFixed(3)} (left edge ${(q.left / c.mid).toFixed(3)}, right edge ${(q.right / c.mid).toFixed(3)})`;
    const ok = Math.abs(c.cx - s.vw / 2) <= 2 && Math.abs(c.ry) < 0.5 && Math.abs(c.tz) < 0.5 && c.op === 1
      && r.ry < -10 && l.ry > 10 && r.tz > c.tz + 10 && l.tz > c.tz + 10 && r.cx > c.cx && l.cx < c.cx
      && r.right > r.left * 1.02 && l.left > l.right * 1.02 && r.op === 1 && l.op === 1 && r.vis === 'visible' && l.vis === 'visible' && b.vis === 'hidden';
    return { ok, detail: `left: ${f(l)} | centre: ${f(c)} | right: ${f(r)}` };
  };
  const stagePt = (p, fx = 0.5, fy = 0.3) => p.evaluate(([x, y]) => { const q = document.querySelector('.cave__stage').getBoundingClientRect(); return { x: Math.round(q.left + q.width * x), y: Math.round(q.top + q.height * y) }; }, [fx, fy]);
  // after an action: give the wall a moment to start, then wait until it is still (two reads of every card's transform
  // alike, 150ms apart), so a busy machine's slower frames never catch it mid-settle
  const rest = async (p, first = 250) => {
    await sleep(first); let a = null;
    for (const t0 = Date.now(); Date.now() - t0 < 6000;) { const b = await p.evaluate(() => [...document.querySelectorAll('.cave__panel')].map((e) => e.style.transform).join('|')); if (b === a) return; a = b; await sleep(150); }
  };
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [390, 844]]) {
    const tag = `${w}x${h}`, full = w === 1440 || w === 390, phone = w < 800;
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const reqs = []; ctx.on('request', (r) => reqs.push(r.url()));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    const pops = []; ctx.on('page', (pg) => { if (pg !== p) pops.push(pg); });
    await p.goto(origin + '/deals'); await sleep(800); await toCave(p); await sleep(1500);
    const sides = [];
    const s = await cs(p); sides.push(s.side, s.sx);
    check(`deals wall: a carousel region (aria-roledescription carousel) labelled by the "Store deals" heading; four slides, each a group (aria-roledescription slide) labelled "n of 4: <deal>"; the wall focusable and labelled; a polite live region; prev/next real buttons with labels, 44x44 or larger; the 3D on (${tag})`,
      s.on && s.role === 'region' && s.rd === 'carousel' && s.label === 'Store deals' && s.per.length === 4
      && s.per.every((q, i) => q.role === 'group' && q.rd === 'slide' && q.label === liveFor(i)) && s.stage.tab === 0 && s.stage.role === 'group' && s.stage.label.length > 10
      && s.polite === 'polite' && s.btns.length === 2 && s.btns.every((b) => b.tag === 'BUTTON' && b.type === 'button' && b.label && b.w >= 44 && b.h >= 44) && s.chrome,
      JSON.stringify({ on: s.on, role: s.role, rd: s.rd, label: s.label, slides: s.per.map((q) => [q.role, q.rd, q.label]), stage: s.stage, polite: s.polite, btns: s.btns }));
    const g = arc(s);
    check(`deals wall: concave at rest, the first deal centred: it faces front (rotateY about 0) and sits furthest back; both neighbours turn in (outer edge taller than inner) and step toward the viewer; the fourth hides behind (${tag})`, s.active === 0 && g.ok, g.detail);
    const c = s.per[0], r = s.per[1], l = s.per[3];
    check(phone ? `deals wall: on a phone the centred card is about 78vw wide (74-80%) and both neighbours peek in from the edges (${tag})` : `deals wall: the centred card and both neighbours show whole within the window (${tag})`,
      phone ? c.w / s.vw >= 0.74 && c.w / s.vw <= 0.8 && r.l < s.vw - 12 && r.l > c.r && l.r > 12 && l.r < c.l : l.l >= 0 && r.r <= s.vw,
      JSON.stringify({ vw: s.vw, centre: [Math.round(c.l), Math.round(c.r), c.w], left: [Math.round(l.l), Math.round(l.r)], right: [Math.round(r.l), Math.round(r.r)] }));
    check(`deals wall: each card holds one button, a real link with its plaque's label and href (new tab); only the centred card's button is in the tab order (${tag})`,
      s.per.every((q, i) => q.links === 1 && q.cta === DEALS[i][1] && q.href === DEALS[i][2] && q.target === '_blank') && s.per.every((q, i) => q.tab === (i === s.active ? 0 : -1)),
      JSON.stringify(s.per.map((q) => [q.cta, q.href, q.tab])));
    await p.click('[data-cave-next]'); await rest(p); const n1 = await cs(p);
    await p.click('[data-cave-prev]'); await rest(p); const n2 = await cs(p);
    await p.click('[data-cave-prev]'); await rest(p); const n3 = await cs(p); sides.push(n1.side, n2.side, n3.side, n3.sx);
    check(`deals wall: next and prev turn it one card, the live region, the counter and the caption name the new deal, and prev from the first wraps to the fourth, concave again (endless ring) (${tag})`,
      n1.active === 1 && n1.live === liveFor(1) && n1.n === '02' && n1.cap === DEALS[1][0] && n2.active === 0 && n2.live === liveFor(0) && n3.active === 3 && n3.live === liveFor(3) && n3.n === '04' && arc(n1).ok && arc(n3).ok,
      JSON.stringify({ next: [n1.active, n1.live, n1.n, n1.cap], prev: [n2.active, n2.live], wrap: [n3.active, n3.live, n3.n], arc: arc(n3).detail }));
    if (full) {
      // the arrow keys while the wall has focus; Tab from the wall then reaches the centred card's button
      await toCave(p); await p.focus('.cave__stage'); await p.keyboard.press('ArrowRight'); await rest(p); const k1 = await cs(p);
      await p.keyboard.press('ArrowRight'); await rest(p); const k2 = await cs(p);
      await p.keyboard.press('ArrowLeft'); await rest(p); const k3 = await cs(p);
      await p.keyboard.press('Tab'); const tb = await p.evaluate(() => { const a = document.activeElement; return { inCentre: !!(a && a.closest && a.closest('.cave__panel[aria-current="true"]')), href: a && a.getAttribute('href') }; });
      check(`deals wall: with the wall focused, the arrow keys turn it (right, right, left) and the live region follows; Tab then reaches the centred card's button (${tag})`,
        k1.active === 0 && k1.live === liveFor(0) && k2.active === 1 && k2.live === liveFor(1) && k3.active === 0 && k3.live === liveFor(0) && k1.focusIn && k3.focusIn && tb.inCentre && tb.href === DEALS[0][2],
        JSON.stringify({ keys: [k1.active, k2.active, k3.active], live: k3.live, focus: [k1.focusIn, k3.focusIn], tab: tb }));
      // a drag (mouse) or a swipe (touch) from the centred card's photo: held still before letting go, 0.7 of a card turns it
      // to the next card and 0.3 snaps back; a quick flick of 0.35 carries on to a later card
      const cdp = phone ? await ctx.newCDPSession(p) : null;
      const move = async (dx, { pause = 220, steps = 14, gap = 16 } = {}) => {
        const o = await stagePt(p, phone ? 0.75 : 0.5, 0.3);
        if (phone) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: o.x, y: o.y }] });
          for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: o.x + dx * i / steps, y: o.y }] }); if (gap) await sleep(gap); }
          if (pause) await sleep(pause);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        } else {
          await p.mouse.move(o.x, o.y); await p.mouse.down();
          for (let i = 1; i <= steps; i++) { await p.mouse.move(o.x + dx * i / steps, o.y); if (gap) await sleep(gap); }
          if (pause) await sleep(pause);
          await p.mouse.up();
        }
        await rest(p); return cs(p);
      };
      await toCave(p); await sleep(300);
      const W0 = k3.per[k3.active].w;
      const d1 = await move(-0.7 * W0), d2 = await move(-0.3 * W0), d3 = await move(-0.35 * W0, { pause: 0, steps: 4, gap: 0 }); sides.push(d1.side, d2.side, d3.side, d3.sx);
      check(`deals wall: a ${phone ? 'swipe' : 'mouse drag'} of 0.7 of a card turns it to the next deal and the live region follows; 0.3 snaps back; a quick flick carries on to a later card; each settles concave on a card (${tag})`,
        d1.active === 1 && d1.live === liveFor(1) && d2.active === 1 && d3.active !== 1 && arc(d1).ok && arc(d2).ok && arc(d3).ok && pops.length === 0,
        JSON.stringify({ drag: [d1.active, d1.live], snapBack: d2.active, flick: d3.active, opened: pops.length }));
      // a click (a tap) on a side card centres it and opens nothing, on its photo or (wide) on its button; then the centred
      // card's button opens its link in a new tab (the route aborts the request; it is enough that it is made)
      await toCave(p); await sleep(300);
      const url0 = p.url(); let t = await cs(p);
      const hitSide = async (onButton) => {
        const a = t.active, k = (a + 1) % 4, q = t.per[k];
        const at = onButton ? await p.evaluate((i) => { const b = document.querySelectorAll('.cave__panel')[i].querySelector('a[href]').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; }, k)
          : { x: Math.round(phone ? (q.l + t.vw) / 2 : q.cx), y: (await stagePt(p)).y };
        if (phone) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y);
        await rest(p); const u = await cs(p); const ok = u.active === k && arc(u).ok; t = u; return { ok, at, active: u.active };
      };
      const h1 = await hitSide(false), h2 = phone ? { ok: true, skip: 'a phone peek is too narrow for its button' } : await hitSide(true);
      check(`deals wall: a ${phone ? 'tap' : 'click'} on a side card centres it${phone ? '' : ', on its photo or on its button,'} and opens nothing (${tag})`,
        h1.ok && h2.ok && pops.length === 0 && p.url() === url0, JSON.stringify({ photo: h1, button: h2, opened: pops.length, sameUrl: p.url() === url0 }));
      const go = await p.evaluate(() => { const b = document.querySelector('.cave__panel[aria-current="true"] a[href]').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) }; });
      // proof that it is followed: the navigation to its href is requested (the route aborts it) while this page stays put,
      // so it opened elsewhere (a new tab; whether Playwright reports that tab in time is not the point)
      const want = t.per[t.active].href, popup = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
      reqs.length = 0;
      if (phone) await p.touchscreen.tap(go.x, go.y); else await p.mouse.click(go.x, go.y);
      const pg = await popup; await sleep(500);
      check(`deals wall: the centred card's button is a working link: a ${phone ? 'tap' : 'click'} on it requests its href in a new tab and this page stays put (${tag})`,
        reqs.includes(want) && p.url() === url0, JSON.stringify({ want, requested: reqs.includes(want), samePage: p.url() === url0, popupSeen: !!pg }));
      if (pg) await pg.close().catch(() => {});
      await p.bringToFront(); await toCave(p); await sleep(400);
      // the page's vertical scroll over the wall is never taken over; a sideways wheel (a trackpad) turns it (wide only)
      const v0 = await cs(p), mid = await stagePt(p, 0.5, 0.5);
      if (phone) await cdp.send('Input.synthesizeScrollGesture', { x: mid.x, y: mid.y, xDistance: 0, yDistance: -300, gestureSourceType: 'touch', speed: 1200 });
      else { await p.mouse.move(mid.x, mid.y); await p.mouse.wheel(0, 300); }
      await sleep(900); const v1 = await cs(p);
      let hw = { ok: true, skip: 'touch' };
      if (!phone) {
        // 0.75 of a card (the wheel's delta reaches the page in CSS px: Playwright's value over the device pixel ratio; a
        // third of a card snaps back to the same card, as a drag does)
        await toCave(p); await sleep(300); const m2 = await stagePt(p, 0.5, 0.5); await p.mouse.move(m2.x, m2.y); const y0 = (await cs(p)).y;
        const dpr = await p.evaluate(() => devicePixelRatio);
        await p.mouse.wheel(Math.round(0.75 * v1.per[v1.active].w * dpr), 0); await rest(p, 400); const hv = await cs(p);
        hw = { ok: hv.active === (v1.active + 1) % 4 && hv.y === y0 && arc(hv).ok, active: [v1.active, hv.active], y: [y0, hv.y] };
      }
      sides.push(v1.side, v1.sx);
      check(`deals wall: a vertical ${phone ? 'swipe' : 'wheel'} over the wall scrolls the page and leaves the wall on its card${phone ? '' : '; a sideways wheel turns it one card and leaves the page'} (${tag})`,
        v1.y > v0.y + 100 && v1.active === v0.active && arc(v1).ok && hw.ok, JSON.stringify({ y: [v0.y, v1.y], active: [v0.active, v1.active], sideways: hw }));
      if (!phone) {
        // reduced motion switched on live: the flat row; and off again: the wall, on the same card
        const a0 = (await cs(p)).active;
        await p.emulateMedia({ reducedMotion: 'reduce' }); await sleep(500); const r1 = await cs(p);
        await p.emulateMedia({ reducedMotion: 'no-preference' }); await sleep(800); const r2 = await cs(p);
        check(`deals wall: turning reduced motion on live lays the cards flat in a row (no 3D, every button tabbable, no caption or controls), and turning it off restores the wall on the same card (${tag})`,
          !r1.on && r1.per.every((q) => q.flat && q.tab === 0) && new Set(r1.per.map((q) => q.top)).size === 1 && !r1.chrome && r1.stage.tab === -1 && r2.on && r2.active === a0 && arc(r2).ok,
          JSON.stringify({ reduce: { on: r1.on, flat: r1.per.map((q) => q.flat), tops: r1.per.map((q) => q.top), tabs: r1.per.map((q) => q.tab) }, again: { on: r2.on, active: [a0, r2.active] } }));
      }
    }
    check(`deals wall: no sideways page scroll and no script errors (${tag})`, sides.every((v) => v <= 0) && errs.length === 0, JSON.stringify({ sides, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
  // reduced motion and no JS: a flat sideways scroll-snap row (no 3D), every card and button in place
  for (const [w, h] of [[1440, 900], [390, 844]]) for (const mode of ['reduced motion', 'no JS']) {
    const tag = `${mode}, ${w}x${h}`;
    const ctx = await ctxFor(w, h, mode === 'no JS' ? { javaScriptEnabled: false } : { reducedMotion: 'reduce' }); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/deals'); await sleep(900);
    const f = await cs(p), lefts = f.per.map((q) => q.l);
    check(`deals wall (${tag}): a flat sideways scroll-snap row: no 3D, the four cards side by side in one line, each button a tabbable link with its plaque's label and href, no caption or controls, no sideways page scroll`,
      !f.on && f.js === (mode !== 'no JS') && f.per.length === 4 && f.per.every((q, i) => q.flat && q.cta === DEALS[i][1] && q.href === DEALS[i][2] && q.tab === 0)
      && new Set(f.per.map((q) => q.top)).size === 1 && lefts.every((x, i) => !i || x > lefts[i - 1]) && f.wall.ov === 'auto' && /x mandatory/.test(f.wall.snap) && !f.chrome && f.side <= 0 && errs.length === 0,
      JSON.stringify({ on: f.on, js: f.js, flat: f.per.map((q) => q.flat), tops: f.per.map((q) => q.top), lefts: lefts.map(Math.round), wall: f.wall, chrome: f.chrome, side: f.side, errs: errs.slice(0, 1) }));
    await ctx.close();
  }
}
// 11. the creed, retired everywhere (owner 2026-11-12: "I don't think we need the creed at all"): no [data-creed] or
//     #creed on the home page, where the Sunday Cruise and the stores, now neighbours, meet edge to edge with no gap; no
//     creed band on /our-story, where the chapters and the family-wall band now meet edge to edge
{
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800);
    const m = await p.evaluate(() => { const c = document.getElementById('cruise'), s = document.getElementById('stores');
      return { creed: document.querySelectorAll('[data-creed], #creed, .creed').length, next: c && c.nextElementSibling ? c.nextElementSibling.id : null,
        gap: c && s ? Math.round((s.getBoundingClientRect().top - c.getBoundingClientRect().bottom) * 10) / 10 : null }; });
    check(`the creed is gone from the home page (no [data-creed]); the Sunday Cruise and the stores meet edge to edge, no gap (${w}x${h})`,
      m.creed === 0 && m.next === 'stores' && m.gap !== null && Math.abs(m.gap) <= 1 && errs.length === 0, JSON.stringify({ ...m, errs: errs.slice(0, 2) }));
    await p.goto(origin + '/our-story'); await sleep(800);
    const o = await p.evaluate(() => { const ch = document.querySelector('main section.chapters'), nx = ch && ch.nextElementSibling;
      return { band: document.querySelectorAll('.creedband, #creed2-h, .creed-static, .creed__stop, [data-creed]').length, kicker: [...document.querySelectorAll('main .kicker')].some((k) => /^the creed$/i.test(k.textContent.trim())),
        next: nx ? nx.getAttribute('aria-labelledby') : null, gap: ch && nx ? Math.round((nx.getBoundingClientRect().top - ch.getBoundingClientRect().bottom) * 10) / 10 : null }; });
    check(`/our-story has no creed band; the chapters and the family-wall band meet edge to edge, no gap (${w}x${h})`,
      o.band === 0 && !o.kicker && o.next === 'fam-h' && o.gap !== null && Math.abs(o.gap) <= 1 && errs.length === 0, JSON.stringify({ ...o, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
}
// 11. the home Drop List (owner 2026-11-12: "let's use this but make it more compact and balanced"; droplist.css): at
//     1440x900 the section is 600px tall or less; from 900px the two columns start together (the two kickers within 8px)
//     and end together (the form card's bottom and the ALL FAQS row within 16px); at 1440 Name, Email and Phone share one
//     row and every input has its label; phones stack the columns; each FAQ opens and closes on a click; no sideways page
//     scroll and no script errors at 1440, 1024 and 390.
{
  const drop = (p) => p.evaluate(() => {
    document.documentElement.classList.add('reveal-all');   // the settled layout (no reveal offsets)
    const s = document.querySelector('section.droplist'), r = (el) => el.getBoundingClientRect();
    const join = s.querySelector('.droplist__join'), faqs = s.querySelector('.droplist__faqs');
    const k1 = r(join.querySelector('.kicker')), k2 = r(faqs.querySelector('.kicker'));
    const form = r(join.querySelector('form')), all = r(faqs.querySelector('.droplist__all'));
    const inputs = [...s.querySelectorAll('form input')];
    return { h: Math.round(r(s).height), tops: Math.round(Math.abs(k1.top - k2.top)), bottoms: Math.round(Math.abs(form.bottom - all.bottom)),
      twoCols: Math.abs(r(join).top - r(faqs).top) < 1 && r(faqs).left > r(join).right, n: inputs.length, rowTops: inputs.map((i) => Math.round(r(i).top)),
      labelled: inputs.map((i) => !!(i.labels && i.labels.length && i.labels[0].textContent.trim())), faqs: s.querySelectorAll('details.faq__item').length,
      side: document.documentElement.scrollWidth - innerWidth };
  });
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    const tag = `${w}x${h}`;
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800);
    await p.evaluate(() => document.querySelector('section.droplist').scrollIntoView({ block: 'start' })); await sleep(2500);
    const d = await drop(p);
    if (w >= 900) check(`drop list (${tag}): two columns that start together (kickers ${d.tops}px apart, 8 or less) and end together (form card and ALL FAQS ${d.bottoms}px apart, 16 or less)`, d.twoCols && d.tops <= 8 && d.bottoms <= 16, JSON.stringify(d));
    else check(`drop list (${tag}): the columns stack on a phone`, !d.twoCols, JSON.stringify({ twoCols: d.twoCols, h: d.h }));
    if (w === 1440) {
      check(`drop list (${tag}): the section is 600px tall or less`, d.h <= 600, 'height ' + d.h);
      check(`drop list (${tag}): Name, Email and Phone in one row, every input labelled`, d.n === 3 && Math.max(...d.rowTops) - Math.min(...d.rowTops) <= 1 && d.labelled.every(Boolean), JSON.stringify({ tops: d.rowTops, labelled: d.labelled }));
    }
    // each FAQ: a click opens it (its answer shows), a second click closes it
    const faq = [];
    for (let i = 0; i < d.faqs; i++) {
      const q = p.locator('section.droplist summary.faq__q').nth(i);
      await q.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
      await q.click(); await sleep(250);
      const open = await q.evaluate((el) => el.parentElement.open && el.parentElement.querySelector('.faq__a').getBoundingClientRect().height > 0);
      await q.click(); await sleep(250);
      faq.push([open, await q.evaluate((el) => el.parentElement.open)]);
    }
    check(`drop list (${tag}): each FAQ opens and closes on a click`, d.faqs === 4 && faq.every(([o, c]) => o && !c), JSON.stringify(faq));
    check(`drop list (${tag}): no sideways page scroll and no script errors`, d.side <= 0 && errs.length === 0, JSON.stringify({ side: d.side, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
}
// 12. the home stores, "Editorial" (owner-picked lab option C with the owner's tweaks, 2026-11-12: "merch should follow
//     the same large layout and make it scrollable"; home.mjs section 8, stores.css, site.js "the stores"). Three
//     numbered columns (01 Los Angeles, 02 San Diego, 03 Originals Clothing) sit in a sideways scroller with x mandatory
//     snap.
//     - Wide: two columns in view, lined up with the wrap. Prev/next are real labelled buttons, 44px or more, disabled at
//       the ends. They, a mouse drag and the arrow keys move the row, and it always comes to rest on a column. A
//       vertical wheel over it still scrolls the page.
//     - Phone: one column with the next peeking. A swipe moves it and it snaps; a vertical swipe still scrolls the page.
//     - Always: the live status is site.js's own, every store link is there, the text is 4.5:1 or more (3:1 large), and
//       the page never scrolls sideways.
//     - Without JS: a plain scrolling row, no buttons. Reduced motion: a step is instant and nothing is armed.
{
  const { STORES: S, LINKS: L } = await import(new URL('../src/content/site.mjs', import.meta.url));
  const st = (p) => p.evaluate(() => {
    const s = document.getElementById('stores'), v = s.querySelector('[data-stores-view]'), cols = [...v.querySelectorAll('.stores__col')], bs = [...s.querySelectorAll('[data-stores-step]')];
    const vr = v.getBoundingClientRect(), pad = parseFloat(getComputedStyle(v).scrollPaddingLeft) || 0, max = v.scrollWidth - v.clientWidth;
    const stops = [...new Set(cols.map((c) => Math.min(max, Math.max(0, Math.round(c.getBoundingClientRect().left - vr.left + v.scrollLeft - pad)))))];
    const r = (e) => { const q = e.getBoundingClientRect(); return { l: Math.round(q.left), r: Math.round(q.right), t: Math.round(q.top), b: Math.round(q.bottom) }; };
    return { x: Math.round(v.scrollLeft), max, stops, pad: Math.round(pad), y: Math.round(scrollY), vw: innerWidth, vh: innerHeight, side: document.documentElement.scrollWidth - innerWidth, sx: scrollX,
      sec: r(s), view: r(v), snap: getComputedStyle(v).scrollSnapType, align: cols.map((c) => getComputedStyle(c).scrollSnapAlign), cls: s.className,
      region: [v.getAttribute('role'), v.getAttribute('aria-label'), v.tabIndex].join('|'),
      cols: cols.map((c) => ({ ...r(c), no: (c.querySelector('.stores__no') || {}).textContent, name: c.querySelector('h3').textContent.replace(/\s+/g, ' ').trim(),
        status: c.querySelector('.stores__status').textContent.trim(), today: c.querySelectorAll('[data-hours] > .is-today').length, rows: c.querySelectorAll('[data-hours] > div').length,
        links: [...c.querySelectorAll('a[href]')].map((a) => { const q = a.getBoundingClientRect(); return { href: a.getAttribute('href'), blank: a.target === '_blank', shop: a.hasAttribute('data-shop'), w: Math.round(q.width), h: Math.round(q.height) }; }) })),
      dots: [...s.querySelectorAll('[data-status-dot]')].map((e) => e.getAttribute('data-status-dot') + '=' + e.getAttribute('data-open')),
      btns: bs.map((b) => { const q = b.getBoundingClientRect(); return { tag: b.tagName, type: b.type, label: b.getAttribute('aria-label'), controls: b.getAttribute('aria-controls'), shown: b.getClientRects().length > 0, w: Math.round(q.width), h: Math.round(q.height), off: b.disabled }; }),
      hint: (() => { const h = s.querySelector('.stores__hint'); return h && h.getClientRects().length > 0 ? h.textContent.trim() : null; })() };
  });
  const rest = (a) => a.stops.some((x) => Math.abs(x - a.x) <= 2);   // at rest on a column
  const brief = (a) => ({ x: a.x, max: a.max, stops: a.stops, y: a.y, btns: a.btns.map((b) => b.off), side: a.side });
  // walk down to the section (every observer on the way fires), then park it under the header
  const toStores = (p) => p.evaluate(async () => { const s = document.getElementById('stores'), top = s.getBoundingClientRect().top + scrollY;
    for (let y = 0; y < top; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, Math.round(top - 80)); });
  // contrast from the computed colours: each text run against its own background, composited up from the page (the
  // dateline tab over the photo is solid ink, so no text sits on a photo); the gradient title word is left out
  const contrast = (p) => p.evaluate(() => {
    const s = document.getElementById('stores');
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const rgba = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }; };
    const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
    const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const bgOf = (el) => { const chain = []; for (let e = el; e && e !== document.body; e = e.parentElement) chain.unshift(e);
      let bg = over(rgba(getComputedStyle(document.body).backgroundColor), { r: 255, g: 255, b: 255, a: 1 });
      for (const e of chain) { const c = rgba(getComputedStyle(e).backgroundColor); if (c.a > 0) bg = over(c, bg); } return bg; };
    const out = []; const tw = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement;
      if (!n.nodeValue.trim() || !el || el.closest('.sr-only, .chrome-word, .fx-split, style, script') || !el.getClientRects().length) continue;
      const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400, bg = bgOf(el), fg = over(rgba(cs.color), bg);
      const a = lum(fg), b = lum(bg), k = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      out.push({ t: n.nodeValue.trim().slice(0, 24), k: Math.round(k * 100) / 100, need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5 });
    }
    return out;
  });
  const lowest = (ct) => ct.reduce((m, r) => (!m || r.k / r.need < m.k / m.need ? r : m), null);
  {
    const ctx = await ctxFor(1440, 900); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800); await toStores(p); await sleep(1500);
    const a = await st(p), c = a.cols, edge = a.view.l + a.pad;
    check('home stores: three numbered columns (01 Los Angeles, 02 San Diego, 03 Originals Clothing, whose status slot says Online), two in view lined up with the wrap, the third past its right edge; x mandatory snap at each column\'s start; a labelled, focusable region; one screen tall (1440x900)',
      c.length === 3 && c.map((k) => k.no).join() === '01,02,03' && c[0].name === S.la.name && c[1].name === S.sd.name && c[2].name === 'Originals Clothing' && c[2].status === 'Online'
      && Math.abs(c[0].l - edge) <= 1 && c[1].l > c[0].r && c[1].r <= a.vw - a.pad + 1 && c[2].l >= a.vw - a.pad - 1 && a.snap === 'x mandatory' && a.align.every((x) => x === 'start')
      && a.region === 'region|Our stores|0' && a.max > 200 && a.x === 0 && a.sec.b - a.sec.t <= a.vh - 72 - 64,
      JSON.stringify({ cols: c.map(({ links, ...k }) => k), pad: a.pad, snap: a.snap, align: a.align, region: a.region, max: a.max, h: a.sec.b - a.sec.t }));
    const live = c.slice(0, 2).map((k) => k.status);
    check('home stores: the live status is site.js\'s own: each store\'s line filled in from its hours, its dot set to match, today\'s hours row marked (1440x900)',
      live.every((t) => /^(Open now · until \d{1,2}(:\d\d)? [AP]M|Closed · opens \d{1,2}(:\d\d)? [AP]M (today|tomorrow))$/.test(t)) && a.dots.length === 2
      && a.dots.every((d, i) => d === ['la', 'sd'][i] + '=' + (live[i].startsWith('Open') ? '1' : '0')) && c[0].rows === 2 && c[1].rows === 2 && c[0].today === 1 && c[1].today === 1,
      JSON.stringify({ live, dots: a.dots, today: c.map((k) => k.today) }));
    const want = [[S.la.page, false], ['tel:' + S.la.tel, false], [S.la.menu, true], [S.la.maps, true], [S.sd.page, false], ['tel:' + S.sd.tel, false], [S.sd.menu, true], [S.sd.maps, true], [L.clothing, true]];
    const links = c.flatMap((k) => k.links), missing = want.filter(([href, blank]) => !links.some((l) => (l.href === href || l.href.endsWith(href)) && l.blank === blank));
    check('home stores: every link is there (each store\'s page, phone, menu and directions; the clothing shop\'s name and Shop merch), external ones in a new tab, none following the selected store (no data-shop), each 44x44 or larger (1440x900)',
      !missing.length && links.filter((l) => l.href === L.clothing).length === 2 && links.every((l) => !l.shop && l.w >= 44 && l.h >= 44), JSON.stringify({ n: links.length, missing, small: links.filter((l) => l.w < 44 || l.h < 44) }));
    check('home stores: prev/next are real buttons with labels, controlling the row, 44x44 or larger; at the start prev is disabled and next is not; the Scroll hint is shown (1440x900)',
      a.btns.length === 2 && a.btns.every((b) => b.tag === 'BUTTON' && b.type === 'button' && b.label && b.controls === 'stores-view' && b.shown && b.w >= 44 && b.h >= 44) && a.btns[0].off && !a.btns[1].off && a.hint === 'Scroll',
      JSON.stringify({ btns: a.btns, hint: a.hint }));
    await p.click('[data-stores-step="1"]'); await sleep(1300); const n1 = await st(p);
    check('home stores: next moves the row on one column and it comes to rest there (two in view at 1440, so that is the end): next disables, prev wakes, the page stays put (1440x900)',
      n1.x > 200 && Math.abs(n1.x - n1.stops[1]) <= 2 && rest(n1) && n1.btns[1].off && !n1.btns[0].off && n1.y === a.y, JSON.stringify(brief(n1)));
    await p.click('[data-stores-step="-1"]'); await sleep(1300); const p1 = await st(p);
    check('home stores: prev moves it back to the first column, at rest, and disables at the start (1440x900)', p1.x === 0 && p1.btns[0].off && !p1.btns[1].off, JSON.stringify(brief(p1)));
    const px = p1.view.l + 700, py = Math.round((p1.view.t + p1.view.b) / 2);
    await p.mouse.move(px, py); await p.mouse.down(); await p.mouse.move(px - 300, py, { steps: 16 }); const held = await st(p); await p.mouse.up(); await sleep(1300); const dr = await st(p);
    check('home stores: a mouse drag moves the row with the pointer, then lets go onto the next column, at rest; the page stays put and no link opens (1440x900)',
      Math.abs(held.x - 300) <= 16 && Math.abs(dr.x - dr.stops[1]) <= 2 && dr.y === p1.y && p.url() === origin + '/' && ctx.pages().length === 1, JSON.stringify({ held: held.x, after: brief(dr), pages: ctx.pages().length }));
    await p.focus('[data-stores-view]'); await p.keyboard.press('ArrowLeft'); await sleep(1100); const k1 = await st(p);
    await p.keyboard.press('ArrowRight'); await sleep(1100); const k2 = await st(p);
    await p.mouse.move(px, py); await p.mouse.wheel(0, 300); await sleep(900); const wy = await st(p);
    check('home stores: with the row focused the arrow keys move it a column at a time, at rest on a column; a vertical wheel over it scrolls the page, not the row (1440x900)',
      k1.x === 0 && rest(k1) && Math.abs(k2.x - k2.stops[1]) <= 2 && k2.y === dr.y && wy.y > k2.y && wy.x === k2.x, JSON.stringify({ left: brief(k1), right: brief(k2), wheel: brief(wy) }));
    check('home stores: the page never scrolls sideways, at the start and with the row moved (1440x900)', [a, n1, p1, dr, k2, wy].every((s) => s.side <= 0 && s.sx === 0), JSON.stringify([a, n1, dr, wy].map((s) => s.side)));
    await toStores(p); await sleep(900); const ct = await contrast(p), low = ct.filter((r) => r.k < r.need);
    check('home stores: every text run 4.5:1 or more against its background (3:1 large), from the computed colours (1440x900)', ct.length >= 30 && !low.length, JSON.stringify({ n: ct.length, low: low.slice(0, 6), lowest: lowest(ct) }));
    check('no script errors (home stores, 1440x900)', errs.length === 0, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(390, 844); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(800); await toStores(p); await sleep(1500);
    const a = await st(p), c = a.cols, w0 = c[0].r - c[0].l, mid = Math.round((c[0].t + c[0].b) / 2), cdp = await ctx.newCDPSession(p);
    check('home stores on a phone: one column in view (84vw), lined up with the gutter, the next peeking past it (390x844)',
      c.length === 3 && Math.abs(c[0].l - (a.view.l + a.pad)) <= 1 && w0 >= a.vw * .8 && w0 <= a.vw * .9 && c[1].l > c[0].r && c[1].l <= a.vw - 12 && a.x === 0,
      JSON.stringify({ cols: c.map(({ links, ...k }) => ({ l: k.l, r: k.r })), vw: a.vw, pad: a.pad }));
    await cdp.send('Input.synthesizeScrollGesture', { x: 300, y: mid, xDistance: -200, yDistance: 0, gestureSourceType: 'touch', speed: 1200 }); await sleep(1300); const s1 = await st(p);
    check('home stores on a phone: a swipe moves the row and it comes to rest on a column further on (390x844)', s1.x >= s1.stops[1] - 2 && rest(s1), JSON.stringify(brief(s1)));
    await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: mid, xDistance: 0, yDistance: -300, gestureSourceType: 'touch', speed: 1200 }); await sleep(900); const s2 = await st(p);
    check('home stores on a phone: a vertical swipe over the row still scrolls the page; the page never scrolls sideways (390x844)',
      s2.y > s1.y && s2.x === s1.x && [a, s1, s2].every((s) => s.side <= 0 && s.sx === 0), JSON.stringify({ y: [s1.y, s2.y], x: [s1.x, s2.x], side: [a.side, s1.side, s2.side] }));
    await toStores(p); await sleep(900); const ct = await contrast(p), low = ct.filter((r) => r.k < r.need);
    check('home stores on a phone: every text run 4.5:1 or more against its background (3:1 large) (390x844)', ct.length >= 30 && !low.length, JSON.stringify({ n: ct.length, low: low.slice(0, 6), lowest: lowest(ct) }));
    check('no script errors (home stores, 390x844)', errs.length === 0, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(1440, 900, { reducedMotion: 'reduce' }); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(origin + '/'); await sleep(800); await toStores(p); await sleep(900);
    await p.click('[data-stores-step="1"]'); await sleep(90); const rm = await st(p);
    check('home stores with reduced motion: a step is instant (at rest on the next column straight away) and no reveal is armed (1440x900)',
      Math.abs(rm.x - rm.stops[1]) <= 2 && !/\bis-armed\b/.test(rm.cls), JSON.stringify({ ...brief(rm), cls: rm.cls }));
    await ctx.close();
  }
  {
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p = await ctx.newPage();
    await p.goto(origin + '/'); await sleep(600);
    await p.evaluate(() => { document.querySelector('#stores [data-stores-view]').scrollLeft = 500; }); await sleep(400);   // past halfway, so the snap takes it on
    const nj = await p.evaluate(() => { const s = document.getElementById('stores'), v = s.querySelector('[data-stores-view]'), b = s.querySelector('[data-stores-btns]');
      return { js: document.documentElement.classList.contains('js'), ov: getComputedStyle(v).overflowX, max: v.scrollWidth - v.clientWidth, x: Math.round(v.scrollLeft), btns: b.getClientRects().length,
        cols: v.querySelectorAll('.stores__col').length, status: [...s.querySelectorAll('[data-status-for]')].map((e) => e.textContent), side: document.documentElement.scrollWidth - innerWidth }; });
    check('home stores without JS: a plain sideways scrolling row of all three columns, the buttons hidden, the hours fallback line, no sideways page scroll (1440x900)',
      !nj.js && nj.ov === 'auto' && nj.max > 200 && nj.x > 0 && nj.btns === 0 && nj.cols === 3 && nj.status.every((t) => t === 'Hours below') && nj.side <= 0, JSON.stringify(nj));
    await ctx.close();
  }
}
// 13. the /deals Save now band (owner pick 2026-11-12: section lab option A "Bento" with the owner's tweaks; shop.mjs
//     save-h, save.css): the four tiles; the First Time Patient tile's counter photo loads with its registry alt; every
//     line of the band, the words over that photo included, clears AA on rendered pixels (large 3:1, the rest 4.5:1); the
//     bud's top rises above its tile's top border by 10%+ of the tile's height (the topmost row where the page changes
//     when the bud is hidden) and its clip box, which holds every bud pixel, meets no text box on the page; the three
//     links are the section's own, exact; no sideways page scroll.
{
  const { STORES: S } = await import(new URL('../src/content/site.mjs', import.meta.url));
  const SEC = 'section[aria-labelledby="save-h"]';
  const LINKS = [['SHOP NOW', S.la.menu, 'menu'], ['SHOP NOW · LA', S.la.deals, null], ['San Diego', S.sd.deals, null]];
  const MUST = ['Save now', 'SAVE', 'now', 'We offer deals', 'First Time Patient Deals', '30%', 'excludes Originals', 'SHOP NOW', 'WEEDMAPS DEALS', 'Check out weekly deals', 'Changing weekly!', 'SHOP NOW · LA', 'San Diego'];
  // the band's text lines fully in view (between the fixed header and the store bar), each against the worst 1% of the
  // pixels behind it with the band's words hidden; large text is 24px+, or 18.66px+ bold
  const lines = async (p) => {
    const items = await p.evaluate((SEC) => {
      const out = [], nx = document.getElementById('nx'), dash = document.querySelector('[data-dash].is-on .dash__inner');
      const top = nx ? Math.max(0, nx.getBoundingClientRect().bottom) : 0, bottom = dash ? Math.min(innerHeight, dash.getBoundingClientRect().top) : innerHeight;
      const tw = document.createTreeWalker(document.querySelector(SEC), NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        if (!n.textContent.trim() || n.parentElement.closest('[aria-hidden="true"], .sr-only')) continue;
        const cs = getComputedStyle(n.parentElement), fs = parseFloat(cs.fontSize), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2 && q.left >= 0 && q.top >= top && q.right <= innerWidth && q.bottom <= bottom)
          out.push({ x: q.left, y: q.top, w: q.width, h: q.height, c: cs.color, t: n.textContent.trim().slice(0, 24), large });
      }
      return out;
    }, SEC);
    await p.evaluate((SEC) => { const st = document.createElement('style'); st.id = 'sv-hide'; st.textContent = SEC + ' * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.append(st); }, SEC);
    await sleep(150);
    const png = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('sv-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.floor(it.x), y = Math.floor(it.y), w = Math.min(g.canvas.width - x, Math.ceil(it.w)), h = Math.min(g.canvas.height - y, Math.ceil(it.h));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, large: it.large, ratio: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  for (const [w, h] of [[1440, 900], [1280, 800], [1024, 768], [390, 844]]) {
    const tag = `${w}x${h}`;
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); localStorage.setItem('og-store', 'la'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/deals'); await sleep(800);
    // the heading smokes in once it is half in view (site.js); the photos load lazily
    await p.evaluate((SEC) => document.querySelector(SEC + ' h2').scrollIntoView({ block: 'center' }), SEC);
    await p.waitForFunction((SEC) => !document.querySelector(SEC + ' [data-smoke]'), SEC, { timeout: 12000 }).catch(() => {});
    for (const t of ['.save__pct', '.save__pic']) { await p.evaluate(({ SEC, t }) => document.querySelector(SEC + ' ' + t).scrollIntoView({ block: 'center' }), { SEC, t }); await sleep(300); }
    await p.waitForFunction((SEC) => [...document.querySelectorAll(SEC + ' img')].every((i) => i.complete && i.naturalWidth > 0), SEC, { timeout: 8000 }).catch(() => {});
    const t1 = await p.evaluate((SEC) => {
      const s = document.querySelector(SEC), im = s.querySelector('.save__pct .save__photo img');
      return { tiles: ['.save__head', '.save__pct', '.save__wm', '.save__pic'].filter((c) => { const e = s.querySelector(c); return e && e.getBoundingClientRect().height > 40; }).length,
        photo: !!im && im.complete && im.naturalWidth > 0 && /\/store-counter-\d+\.webp$/.test(im.currentSrc), file: im && im.currentSrc.split('/').pop(), alt: im && im.alt,
        cover: !!im && getComputedStyle(im).objectFit === 'cover', side: document.documentElement.scrollWidth - innerWidth };
    }, SEC);
    check(`save now (${tag}): the four tiles; the First Time Patient tile's counter photo (store-counter) loads, object-fit cover, with its registry alt`,
      t1.tiles === 4 && t1.photo && t1.cover && t1.alt === 'An Originals budtender helping customers at a store counter', JSON.stringify(t1));
    // contrast: each text tile in view in turn; the lowest ratio per line is kept
    const seen = new Map();
    for (const t of ['.save__head', '.save__pct', '.save__wm']) {
      await p.evaluate(({ SEC, t }) => document.querySelector(SEC + ' ' + t).scrollIntoView({ block: 'center' }), { SEC, t }); await sleep(400);
      for (const r of await lines(p)) { const k = r.t; if (!seen.has(k) || seen.get(k).ratio > r.ratio) seen.set(k, r); }
    }
    const all = [...seen.values()], low = all.filter((r) => r.ratio < (r.large ? 3 : 4.5)), missing = MUST.filter((m) => !all.some((r) => r.t.startsWith(m)));
    check(`save now (${tag}): every line clears AA on rendered pixels (large 3:1, the rest 4.5:1), the First Time Patient words over the counter photo included`,
      all.length >= MUST.length && !low.length && !missing.length, JSON.stringify({ n: all.length, low, missing, min: Math.min(...all.map((r) => r.ratio)), pct: all.filter((r) => /^(First Time|30%|excludes|SHOP NOW$)/.test(r.t)) }));
    // the bud: the topmost row above its tile where the page changes when the bud is hidden, and its clip box against every text box
    await p.evaluate((SEC) => document.querySelector(SEC + ' .save__pic').scrollIntoView({ block: 'center' }), SEC); await sleep(500);
    const a = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'sv-bud'; st.textContent = '.save__bud { visibility: hidden !important; }'; document.head.append(st); });
    await sleep(150);
    const b = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('sv-bud').remove());
    const bud = await p.evaluate(async ({ a, b, SEC }) => {
      const load = async (s) => { const im = new Image(); im.src = 'data:image/png;base64,' + s; await im.decode(); const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); return g; };
      const ga = await load(a), gb = await load(b);
      const t = document.querySelector(SEC + ' .save__pic').getBoundingClientRect(), nx = document.getElementById('nx');
      const x0 = Math.max(0, Math.floor(t.left)), x1 = Math.min(ga.canvas.width, Math.ceil(t.right)), y0 = Math.max(nx ? Math.ceil(nx.getBoundingClientRect().bottom) : 0, Math.floor(t.top - t.height * .4)), y1 = Math.ceil(t.top);
      const da = ga.getImageData(x0, y0, x1 - x0, y1 - y0).data, db = gb.getImageData(x0, y0, x1 - x0, y1 - y0).data;
      let top = null;
      for (let i = 0; i < da.length && top === null; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 48) top = y0 + Math.floor(i / 4 / (x1 - x0));
      const c = document.querySelector(SEC + ' .save__bud').getBoundingClientRect(), hits = [];
      const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        if (!n.textContent.trim() || n.parentElement.closest('.sr-only, .sr-defs')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0 && q.right > c.left && q.left < c.right && q.bottom > c.top && q.top < c.bottom) hits.push(n.textContent.trim().slice(0, 24));
      }
      return { tileTop: Math.round(t.top), tileH: Math.round(t.height), budTop: top, pop: top === null ? 0 : +((t.top - top) / t.height).toFixed(3), clip: [c.left, c.top, c.right, c.bottom].map(Math.round), scanFrom: y0, hits };
    }, { a, b, SEC });
    check(`save now (${tag}): the bud's top rises above its tile's top border by 10%+ of the tile's height, and its clip box meets no text on the page`,
      bud.budTop !== null && bud.pop >= 0.1 && bud.budTop > bud.scanFrom && !bud.hits.length, JSON.stringify(bud));
    const links = await p.evaluate((SEC) => [...document.querySelectorAll(SEC + ' a[href]')].map((a) => [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('data-shop'), a.target, a.rel]), SEC);
    const side = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`save now (${tag}): the three links are exact (labels, hrefs, data-shop="menu" on SHOP NOW, new tab); no sideways page scroll; no script errors`,
      links.length === 3 && LINKS.every(([t, href, shop], i) => links[i][0] === t && links[i][1] === href && links[i][2] === shop && links[i][3] === '_blank' && links[i][4] === 'noopener') && side <= 0 && errs.length === 0,
      JSON.stringify({ links, side, errs: errs.slice(0, 2) }));
    await ctx.close();
  }
}
// 13. the home events' lenticular carousel (home section 10; owner request 2026-11-12: "use this effect", with a
//     reference link, an original build): a labelled carousel region of
//     three slides ("n of 3") with real prev/next buttons and a live region; the card links, labels and image texts
//     exactly as before; a pointer sweep across a card turns its strips progressively (none at the near side, some mid-turn
//     on the way, all at the far side) and leaving turns it back; keyboard focus brings a card in front and turns it over;
//     the arrow keys, prev/next and a drag change the active slide, and a drag never follows a link; on a phone (fewer
//     strips) a swipe brings the next slide in front and a tap turns the card over without leaving the page; reduced motion
//     builds no strips (the colour face shown still); without JS, the plain row; no script errors and no sideways page
//     scroll (1440, 1024, 390).
{
  const LINKS = [['/events#lowrider-super-show', 'Lowrider Magazine Super Show', 'Lowrider car show flyer: Los Angeles 2026 Finale'],
    ['/originals-hall-of-flowers-palm-springs-recap', 'Hall of Flowers recap', 'Hall of Flowers Palm Springs 2021 graphic with Originals and The Cure Company'],
    ['/events', 'Coming to a city near you Originals Takeover Palm Springs', '']];
  const open = async (w, h, opts = {}) => {
    const ctx = await ctxFor(w, h, opts); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/'); await sleep(700);
    await p.evaluate(() => document.querySelector('#culture [data-lenticular]').scrollIntoView({ block: 'center' })); await sleep(900);
    return { ctx, p, errs };
  };
  const state = (p) => p.evaluate(() => {
    const r = document.querySelector('#culture [data-lenticular]'), sl = [...r.querySelectorAll('.ln-slide')];
    const ang = (el) => { const t = getComputedStyle(el).transform; if (!t || t === 'none') return 0; const v = t.slice(t.indexOf('(') + 1).match(/-?[\d.e]+/g).map(Number); return Math.round(Math.abs(Math.atan2(-v[2], v[0]) * 180 / Math.PI)); };
    return { live: r.classList.contains('is-live'), still: r.classList.contains('is-still'), active: sl.findIndex((s) => s.classList.contains('is-active')),
      angles: sl.map((s) => [...s.querySelectorAll('.ln-strip')].map(ang)), status: (r.querySelector('[data-ln-status]') || {}).textContent || '', side: document.documentElement.scrollWidth - innerWidth };
  });
  const turned = (a) => ({ n: a.length, turned: a.filter((x) => x >= 90).length, mid: a.filter((x) => x > 5 && x < 175).length, mean: a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0 });
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    const tag = `${w}x${h}`, { ctx, p, errs } = await open(w, h);
    const m = await p.evaluate(() => { const r = document.querySelector('#culture [data-lenticular]'), sl = [...r.querySelectorAll('.ln-slide')];
      return { role: r.getAttribute('role'), rd: r.getAttribute('aria-roledescription'), named: !!(r.getAttribute('aria-label') || (r.getAttribute('aria-labelledby') && document.getElementById(r.getAttribute('aria-labelledby')))),
        slides: sl.map((s) => [s.getAttribute('aria-roledescription'), s.getAttribute('aria-label')]),
        links: sl.map((s) => { const a = s.querySelector('a'), im = a.querySelector('img'); return [a.getAttribute('href'), [...a.querySelectorAll('.ln-label, .ln-type > span')].map((x) => x.textContent.trim()).join(' '), im ? im.getAttribute('alt') : null]; }),
        btns: [...r.querySelectorAll('[data-ln-prev], [data-ln-next]')].map((b) => { const q = b.getBoundingClientRect(); return [b.tagName, Math.round(q.width), Math.round(q.height), b.getAttribute('aria-label')]; }),
        live: !!r.querySelector('[aria-live]') }; });
    check(`events carousel: a labelled carousel region of 3 slides ("n of 3"), real prev/next buttons 44px or more, a live region (${tag})`,
      m.role === 'region' && m.rd === 'carousel' && m.named && m.slides.length === 3 && m.slides.every((s, i) => s[0] === 'slide' && s[1] === `${i + 1} of 3`) &&
      m.btns.length === 2 && m.btns.every((b) => b[0] === 'BUTTON' && b[1] >= 44 && b[2] >= 44 && b[3]) && m.live, JSON.stringify(m).slice(0, 400));
    check(`events carousel: the card links, labels and image texts exactly as before (${tag})`, JSON.stringify(m.links) === JSON.stringify(LINKS), JSON.stringify(m.links));
    let s = await state(p);
    if (w >= 1024) {
      await p.mouse.move(2, 2); await sleep(300);
      const r = await p.evaluate(() => { const sl = [...document.querySelectorAll('#culture .ln-slide')], i = sl.findIndex((x) => x.classList.contains('is-active')), q = sl[i].getBoundingClientRect(); return { l: q.left, w: q.width, y: q.top + q.height / 2, i }; });
      const sweep = [];
      for (const fx of [0.1, 0.35, 0.5, 0.65, 0.92]) { await p.mouse.move(r.l + r.w * fx, r.y, { steps: 4 }); await sleep(400); sweep.push(turned((await state(p)).angles[r.i])); }
      const up = sweep.every((x, i) => i === 0 || (x.mean >= sweep[i - 1].mean && x.turned >= sweep[i - 1].turned));
      check(`events carousel: a pointer sweep across a card turns its ${sweep[0].n} strips progressively (none at the near side, some mid-turn on the way, all at the far side) (${tag})`,
        sweep[0].n >= 40 && up && sweep[0].turned === 0 && sweep.slice(1, 4).some((x) => x.mid >= 8) && sweep[4].turned === sweep[4].n, JSON.stringify(sweep));
      await p.mouse.move(r.l + r.w / 2, 4); await sleep(1100);
      const back = turned((await state(p)).angles[r.i]);
      await p.focus('#culture .ln-slide:nth-child(2) .ln-card'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(1500);
      s = await state(p); const foc = turned(s.angles[1]);
      check(`events carousel: the pointer leaving turns the card back; keyboard focus brings a card in front and turns it over (${tag})`, back.turned === 0 && s.active === 1 && foc.n > 0 && foc.turned === foc.n, JSON.stringify({ back, active: s.active, foc }));
      await p.keyboard.press('ArrowRight'); await sleep(500); s = await state(p);
      const key = { active: s.active, focus: await p.evaluate(() => { const sl = document.activeElement.closest('.ln-slide'); return sl && sl.getAttribute('aria-label'); }), status: s.status };
      await p.evaluate(() => document.activeElement.blur());
      await p.click('#culture [data-ln-prev]'); await sleep(450); const prev = (await state(p)).active;
      await p.click('#culture [data-ln-next]'); await sleep(450); const next = (await state(p)).active;
      await p.click('#culture [data-ln-prev]'); await sleep(450);
      const before = (await state(p)).active, url = p.url();
      const v = await p.evaluate(() => { const q = document.querySelector('#culture .ln-viewport').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
      await p.mouse.move(v.x + 120, v.y); await p.mouse.down(); await p.mouse.move(v.x - 80, v.y, { steps: 10 }); await p.mouse.up(); await sleep(700);
      const after = (await state(p)).active;
      check(`events carousel: the arrow keys (moving the focus), prev/next and a drag change the active slide, and a drag never follows a link (${tag})`,
        key.active === 2 && key.focus === '3 of 3' && key.status === '3 of 3' && prev === 1 && next === 2 && before === 1 && after === 2 && p.url() === url, JSON.stringify({ key, prev, next, drag: [before, after], stayed: p.url() === url }));
    } else {
      const v = await p.evaluate(() => { const q = document.querySelector('#culture .ln-viewport').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
      await p.evaluate(({ x, y }) => {
        const vp = document.querySelector('#culture .ln-viewport'), ev = (t, cx) => new PointerEvent(t, { pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: y, bubbles: true, cancelable: true, buttons: t === 'pointerup' ? 0 : 1 });
        vp.dispatchEvent(ev('pointerdown', x + 90)); for (let i = 1; i <= 8; i++) window.dispatchEvent(ev('pointermove', x + 90 - i * 22)); window.dispatchEvent(ev('pointerup', x - 86));
      }, v);
      await sleep(800); s = await state(p); const swiped = s.active, said = s.status;
      const a = await p.evaluate(() => { const q = document.querySelector('#culture .ln-slide.is-active').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
      const url = p.url();
      await p.touchscreen.tap(a.x, a.y); await sleep(1500); s = await state(p);
      const tap = turned(s.angles[s.active]);
      check('events carousel on a phone: a swipe brings the next slide in front; a tap turns the card over (fewer strips than desktop) and stays on the page (390x844)',
        swiped === 1 && said === '2 of 3' && tap.n >= 16 && tap.n < 40 && tap.turned === tap.n && p.url() === url, JSON.stringify({ swiped, said, tap, stayed: p.url() === url }));
    }
    s = await state(p);
    check(`events carousel: no sideways page scroll and no script errors (${tag})`, s.side <= 0 && errs.length === 0, 'overflow ' + s.side + 'px ' + errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  {
    const { ctx, p, errs } = await open(1440, 900, { reducedMotion: 'reduce' });
    const r = await p.evaluate(() => { const q = document.querySelector('#culture .ln-slide').getBoundingClientRect(); return { x: q.left + q.width * .7, y: q.top + q.height / 2 }; });
    await p.mouse.move(r.x, r.y); await sleep(400);
    const st = await p.evaluate(() => { const root = document.querySelector('#culture [data-lenticular]');
      return { still: root.classList.contains('is-still'), strips: root.querySelectorAll('.ln-strip').length, art: [...root.querySelectorAll('.ln-art')].map((i) => +getComputedStyle(i).opacity),
        masks: [...root.querySelectorAll('.ln-reveal')].map((l) => { const cs = getComputedStyle(l); return cs.maskImage || cs.webkitMaskImage || 'none'; }) }; });
    await p.mouse.move(2, 2); await p.click('#culture [data-ln-next]'); await sleep(300); const nx = (await state(p)).active;
    check('events carousel, reduced motion: no strips and no turning, the colour face and its label shown still; prev/next still work (1440x900)',
      st.still && st.strips === 0 && st.art.every((o) => o === 1) && st.masks.every((mk) => mk === 'none') && nx === 1 && errs.length === 0, JSON.stringify({ ...st, next: nx }));
    await ctx.close();
    const c2 = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p2 = await c2.newPage(); await p2.goto(origin + '/'); await sleep(500);
    const nj = await p2.evaluate(() => { const root = document.querySelector('#culture [data-lenticular]'), cards = [...root.querySelectorAll('.ln-card')].map((a) => a.getBoundingClientRect());
      return { live: root.classList.contains('is-live'), ctrl: !!root.querySelector('[data-ln-ctrl]:not([hidden])'), cards: cards.length, row: cards.every((q) => Math.abs(q.top - cards[0].top) < 2 && q.width > 200), side: document.documentElement.scrollWidth - innerWidth }; });
    check('events carousel without JS: the plain row of three cards, no controls, no sideways page scroll (1440x900)', !nj.live && !nj.ctrl && nj.cards === 3 && nj.row && nj.side <= 0, JSON.stringify(nj));
    await c2.close();
  }
}
// 14. the site footer on every page (owner 2026-11-12: the section lab's option C, "Editorial", with no creed: "I don't
//     think we need the creed at all"; layout.mjs footer(), chrome.css). On five page types at 1440x900 and 390x844: the
//     39 links of the footer it replaced (read from the built footer before the change), in order, with the same text,
//     href and target; the four legal lines word for word; no creed text; the ORIGINALS wordmark drawn; every text line
//     4.5:1 or more against the worst 1% of the rendered pixels behind it (the text hidden for that pass); no sideways page
//     scroll; at the page end the last text line clears the store bar; phones: the link groups start closed and a tap
//     opens one; wide screens: a click on a group title leaves the group open; no script errors.
{
  const FOOT_LINKS = [['ORIGINALS LOS ANGELES', '/los-angeles-store', ''], ['(323) 696-9680', 'tel:+13236969680', ''], ['ORIGINALS SAN DIEGO', '/san-diego-store', ''], ['(619) 310-5232', 'tel:+16193105232', ''],
    ['ORIGINALS CLOTHING', 'https://www.originalsclothingshop.com/', '_blank'], ['Shop', '/shop', ''], ['Deals', '/deals', ''], ['Brands', '/brands', ''], ['Strains', '/strains', ''],
    ['Rewards', '/rewards-program-and-opt-in', ''], ['Find Originals', '/find-originals', ''], ['Our Story', '/our-story', ''], ['Events', '/events', ''], ['Collabs', '/collabs', ''], ['Media', '/media', ''],
    ['Drops', '/drops', ''], ['Cannablog', '/blog', ''], ['Home', '/', ''], ['Contact', '/contact', ''], ['Wholesale', '/wholesale', ''], ['Jobs', '/jobs', ''], ['FAQs', '/faqs', ''],
    ['Weedmaps', 'https://weedmaps.com/dispensaries/originalslashop', '_blank'], ['Leafly', 'https://www.leafly.com/dispensary-info/kvclosangeles', '_blank'], ['Terms of Service', '/terms-of-service', ''],
    ['Privacy Policy', '/privacy-policy', ''], ['Prop 65 Warning', '/prop-65-warning', ''], ['California Opt-in', '/california-opt-in', ''], ['Rewards Program and Opt-in', '/rewards-program-and-opt-in', ''],
    ['Disclaimer', '/disclaimer', ''], ['Cookie Policy', '/cookie-policy', ''], ['Membership Agreement', '/membership_agreement', ''],
    ['@originalsfamilyfarms', 'https://www.instagram.com/originalsfamilyfarms/', '_blank'], ['@la__originals__shop', 'https://www.instagram.com/la__originals__shop/', '_blank'],
    ['@originalssdshop', 'https://www.instagram.com/originalssdshop/', '_blank'], ['Facebook', 'https://www.facebook.com/OriginalsLAshop', '_blank'], ['Weedmaps LA', 'https://weedmaps.com/dispensaries/originalslashop', '_blank'],
    ['Weedmaps SD', 'https://weedmaps.com/dispensaries/originals-san-diego', '_blank'], ['Leafly', 'https://www.leafly.com/dispensary-info/kvclosangeles', '_blank']];
  const FOOT_LEGAL = ['⚠WARNING: Products sold here can expose you to chemicals including cannabis smoke, which is known to the State of California to cause cancer, and delta-9-tetrahydrocannabinol (THC), which is known to the State of California to cause birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.',
    '21+ only, or 18+ with a valid medical recommendation. Keep cannabis out of reach of children and pets. Do not drive or operate machinery after use.',
    '© 2026 All Rights Reserved | C10-0000367-LIC', "Some scene photography on this site is AI-generated illustration; store, product and event photos are Originals' own."];
  const CREED = /Mastering Our Craft|Always Room For Improvement|Good, Better, Best|California's Best/i;
  const footState = (p) => p.evaluate(() => {
    const f = document.querySelector('footer.site-footer'), n = (s) => s.replace(/\s+/g, ' ').trim(), dash = document.querySelector('[data-dash].is-on .dash__inner');
    const lines = [...f.querySelectorAll('a, p, h2, span, li')].filter((e) => e.getClientRects().length && e.textContent.trim() && !e.closest('[aria-hidden="true"], details:not([open]) > ul'));
    const word = f.querySelector('.foot__word svg.wordmark'), wr = word && word.getBoundingClientRect();
    return { links: [...f.querySelectorAll('a')].map((a) => [n(a.textContent), a.getAttribute('href'), a.getAttribute('target') || '']),
      legal: [...f.querySelectorAll('.foot__legal p')].map((x) => n(x.textContent)), text: f.textContent, word: !!wr && wr.width > 200 && wr.height > 40,
      side: document.documentElement.scrollWidth - innerWidth, atEnd: Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight) < 2,
      clear: dash ? Math.round(dash.getBoundingClientRect().top - Math.max(...lines.map((e) => e.getBoundingClientRect().bottom))) : null,
      groups: [...f.querySelectorAll('details.foot__grp')].map((d) => d.open) };
  });
  // the rendered contrast of every text line in the footer: its computed colour against the worst 1% of the pixels behind
  // it, read from a screenshot of the footer with its text made transparent (the fixed bars hidden, the reveal settled)
  const footContrast = async (p) => {
    await p.addStyleTag({ content: 'header.nx, .dash, .gate, .skip { visibility: hidden !important; }' });
    await p.evaluate(() => document.documentElement.classList.add('reveal-all')); await sleep(1400);
    const items = await p.evaluate(() => {
      const f = document.querySelector('footer.site-footer'), fr = f.getBoundingClientRect(), out = [], tw = document.createTreeWalker(f, NodeFilter.SHOW_TEXT); let t;
      while ((t = tw.nextNode())) {
        const el = t.parentElement;
        if (!t.textContent.trim() || el.closest('[aria-hidden="true"], script, style, details:not([open]) > ul')) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2) out.push({ x: q.left - fr.left, y: q.top - fr.top, w: q.width, h: q.height, c: getComputedStyle(el).color, t: t.textContent.trim().slice(0, 18) });
      }
      const st = document.createElement('style'); st.id = 'ft-hide'; st.textContent = 'footer.site-footer, footer.site-footer * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.appendChild(st);
      return out;
    });
    await sleep(150);
    const png = (await p.locator('footer.site-footer').screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('ft-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      let min = Infinity, worst = null;
      for (const it of items) {
        const x0 = Math.max(0, Math.floor(it.x)), y0 = Math.max(0, Math.floor(it.y)), w = Math.min(cv.width - x0, Math.ceil(it.w)), h = Math.min(cv.height - y0, Math.ceil(it.h));
        if (w < 2 || h < 2) continue;
        const d = g.getImageData(x0, y0, w, h).data, Lt = lum(...rgb(it.c)), rs = [];
        for (let i = 0; i < d.length; i += 4) { const Lb = lum(d[i], d[i + 1], d[i + 2]); rs.push((Math.max(Lt, Lb) + 0.05) / (Math.min(Lt, Lb) + 0.05)); }
        rs.sort((a, b) => a - b); const r = rs[Math.floor(rs.length * 0.01)];
        if (r < min) { min = r; worst = it.t; }
      }
      return { n: items.length, min: Math.round(min * 100) / 100, worst };
    }, { png, items });
  };
  for (const path of ['/', '/deals', '/retail', '/cannabis-edibles-guide-originals-la', '/strains']) for (const [w, h] of [[1440, 900], [390, 844]]) {
    const tag = `${path}, ${w}x${h}`, phone = w < 800;
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + path); await sleep(800);
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
    const s = await footState(p);
    // every link of the old footer, each with its own text, href and target, counted (the new layout puts the social
    // handles in the top row, so the order differs; nothing may be missing, added or changed)
    const key = (l) => JSON.stringify(l), pool = s.links.map(key), missing = [];
    FOOT_LINKS.map(key).forEach((k) => { const i = pool.indexOf(k); if (i < 0) missing.push(k); else pool.splice(i, 1); });
    check(`footer (${tag}): the 39 links of the old footer, each with the same text, href and target (none missing, none added)`, s.links.length === 39 && !missing.length && !pool.length,
      JSON.stringify({ n: s.links.length, missing: missing.slice(0, 3), extra: pool.slice(0, 3) }));
    check(`footer (${tag}): the legal lines word for word, no creed text, the ORIGINALS wordmark drawn`, JSON.stringify(s.legal) === JSON.stringify(FOOT_LEGAL) && !CREED.test(s.text) && s.word,
      JSON.stringify({ legal: s.legal.length, same: JSON.stringify(s.legal) === JSON.stringify(FOOT_LEGAL), creed: CREED.test(s.text), word: s.word }));
    // the link groups: closed on a phone, a tap opens one; open on wide screens, a click on a title leaves it open
    const q = p.locator('footer.site-footer summary').first();
    await q.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(200);
    await q.click(); await sleep(300);
    const g = await q.evaluate((el) => ({ open: el.parentElement.open, shown: [...el.parentElement.querySelectorAll('a')].filter((a) => a.getClientRects().length).length }));
    if (phone) { await q.click(); await sleep(200); }
    const groupsOk = phone ? s.groups.every((o) => !o) && g.open && g.shown > 0 : s.groups.every(Boolean) && g.open;
    check(`footer (${tag}): no sideways page scroll; at the page end the last text line clears the store bar (${s.clear}px); the link groups ${phone ? 'start closed and a tap opens one' : 'stay open'}; no script errors`,
      s.side <= 0 && s.atEnd && s.clear !== null && s.clear >= 0 && groupsOk && errs.length === 0, JSON.stringify({ side: s.side, atEnd: s.atEnd, clear: s.clear, groups: s.groups, tap: g, errs: errs.slice(0, 2) }));
    if (phone) await p.evaluate(() => document.querySelectorAll('footer.site-footer details').forEach((d) => { d.open = true; }));   // every link line is read, the grouped ones too
    const c = await footContrast(p);
    check(`footer (${tag}): every text line 4.5:1 or more on the rendered pixels (lowest ${c.min}, "${c.worst}")`, c.n > 30 && c.min >= 4.5, JSON.stringify(c));
    await ctx.close();
  }
}
// 15. the legal pages (legal.mjs + legal.css; owner brief 2026-11-12: one clean, readable legal template on the design
// language: a compact head, a reading measure, numbered section titles on hairlines, a sticky "On this page" list on wide
// screens). Every page keeps exactly the words saved before the redesign (audit/legal-parity.json: main's text nodes in
// order with JavaScript off, the contents list excluded; its links in order; no heading lost); no script errors, no
// sideways scroll, one h1; the contents links land on real section titles; the opt-in form keeps its labels and
// site.js's preview hooks; every text line reads 4.5:1 or more on the rendered pixels.
{
  const LEGAL = ['/privacy-policy', '/terms-of-service', '/cookie-policy', '/disclaimer', '/prop-65-warning', '/california-opt-in', '/rewards-program-and-opt-in', '/membership_agreement'];
  const DOCS = LEGAL.slice(0, 4);
  const age = (c) => c.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  let saved = null; try { saved = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/legal-parity.json'), 'utf8')).pages; } catch (e) {}
  check('legal pages: the parity copy saved before the redesign is present (audit/legal-parity.json)', !!saved && LEGAL.every((u) => saved[u] && saved[u].text));
  const snap = () => {
    const m = document.querySelector('main'), skip = (n) => n.parentElement.closest('[data-toc], script, style, noscript, template');
    const tw = document.createTreeWalker(m, NodeFilter.SHOW_TEXT), parts = []; let n;
    while ((n = tw.nextNode())) if (!skip(n)) parts.push(n.textContent);
    const c = m.cloneNode(true); c.querySelectorAll('[data-toc], script, style, noscript, template').forEach((e) => e.remove());
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    return { text: norm(parts.join(' ')), heads: [...c.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((x) => norm(x.textContent)), hrefs: [...c.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')) };
  };
  if (saved) {   // the words with JavaScript off: the authored page (site.js splits section titles into smoke letters at run time)
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p = await ctx.newPage();
    for (const u of LEGAL) {
      await p.goto(origin + u); const s = await p.evaluate(snap), b = saved[u];
      let i = 0; while (i < b.text.length && b.text[i] === s.text[i]) i++;
      const lost = b.heads.map((x) => x.replace(/^h\d /, '')).filter((t) => !s.heads.includes(t)), same = s.text === b.text, links = JSON.stringify(s.hrefs) === JSON.stringify(b.hrefs);
      check(`legal ${u}: every word as saved before the redesign (${b.text.length} characters), the same links in order, no heading lost (JavaScript off)`, same && links && !lost.length,
        same ? JSON.stringify({ heads: b.heads.length + ' -> ' + s.heads.length, links: s.hrefs.length + (links ? ' same' : ' CHANGED'), lost }) : JSON.stringify({ at: i, was: b.text.slice(Math.max(0, i - 40), i + 60), now: s.text.slice(Math.max(0, i - 40), i + 60) }));
    }
    await ctx.close();
  }
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, h); await age(ctx); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    const rows = [];
    for (const u of LEGAL) {
      const n0 = errs.length; await p.goto(origin + u); await sleep(400);
      const r = await p.evaluate(() => {
        const toc = document.querySelector('[data-toc]'), links = toc ? [...toc.querySelectorAll('a')] : [], shown = !!toc && toc.getClientRects().length > 0;
        return { side: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length,
          toc: toc ? { shown, n: links.length, h2: document.querySelectorAll('.legal__body h2').length,
            broken: links.filter((a) => { const t = document.getElementById(decodeURIComponent(a.hash.slice(1))); return !t || t.tagName !== 'H2'; }).length,
            minH: shown ? Math.min(...links.map((a) => Math.round(a.getBoundingClientRect().height))) : null } : null };
      });
      rows.push({ u, ...r, errs: errs.length - n0 });
    }
    const bad = rows.filter((r) => r.errs || r.side > 0 || r.h1 !== 1);
    check(`legal pages (${w}x${h}): no script errors, no sideways page scroll, one h1 on each of the ${LEGAL.length}`, rows.length === LEGAL.length && !bad.length, JSON.stringify(bad.length ? { bad, errs: errs.slice(0, 2) } : rows.map((r) => r.u + ' ' + r.side)));
    const docs = rows.filter((r) => DOCS.includes(r.u));
    check(`legal policies (${w}x${h}): ${w >= 1100 ? 'the "On this page" list is shown beside the text, one link per section title, each landing on its h2 and 44px or taller' : 'the "On this page" list is hidden on a narrow screen'}`,
      docs.every((r) => r.toc && r.toc.n >= 3 && r.toc.n === r.toc.h2 && r.toc.broken === 0 && (w >= 1100 ? r.toc.shown && r.toc.minH >= 44 : !r.toc.shown)), JSON.stringify(docs.map((r) => ({ u: r.u, ...r.toc }))));
    if (w === 1440) {   // deep in the longest text the list stays pinned under the header, above the store bar; a link takes its title below the header
      await p.goto(origin + '/privacy-policy'); await sleep(400); await p.evaluate(() => scrollTo(0, 9000)); await sleep(500);
      const st = await p.evaluate(() => { const t = document.querySelector('[data-toc]').getBoundingClientRect(), nx = document.getElementById('nx').getBoundingClientRect(), d = document.querySelector('[data-dash].is-on .dash__inner');
        return { y: Math.round(scrollY), top: Math.round(t.top), bottom: Math.round(t.bottom), head: Math.round(nx.bottom), dash: d ? Math.round(d.getBoundingClientRect().top) : innerHeight }; });
      const href = await p.getAttribute('[data-toc] li:nth-child(9) a', 'href'); await p.click('[data-toc] li:nth-child(9) a'); await sleep(400);
      const jump = await p.evaluate((href) => ({ hash: location.hash, top: Math.round(document.getElementById(href.slice(1)).getBoundingClientRect().top), head: Math.round(document.getElementById('nx').getBoundingClientRect().bottom) }), href);
      check('legal policy (1440x900): deep in the text the contents list stays pinned under the header and ends above the store bar; a contents link brings its title in just below the header',
        st.y > 8000 && st.top >= st.head && st.top <= st.head + 40 && st.bottom <= st.dash && jump.hash === href && jump.top >= jump.head && jump.top <= jump.head + 60, JSON.stringify({ st, jump }));
    }
    if (w === 390) {   // the opt-in form: labelled controls, 44px targets, site.js's preview hooks (never posts)
      await p.goto(origin + '/membership_agreement'); await sleep(400);
      const f0 = await p.evaluate(() => { const f = document.querySelector('main form'), ctl = [...f.querySelectorAll('input, select, textarea')];
        return { preview: f.hasAttribute('data-preview-form'), status: !!f.querySelector('[data-form-status]'), n: ctl.length,
          unlabelled: ctl.filter((e) => !(e.labels && [...e.labels].some((l) => l.textContent.trim()))).map((e) => e.name),
          small: ctl.map((e) => { const q = e.getBoundingClientRect(); return { n: e.name, w: Math.round(q.width), h: Math.round(q.height) }; }).filter((x) => x.w < 44 || x.h < 44) }; });
      await p.click('main form button[type="submit"]'); await sleep(200);
      const empty = await p.evaluate(() => ({ note: document.querySelector('main [data-form-status]').textContent.trim(), focus: document.activeElement && document.activeElement.name }));
      await p.fill('#optin-name', 'Test'); await p.fill('#optin-email', 'test@example.com'); await p.check('main form input[name="optin"]'); await p.click('main form button[type="submit"]'); await sleep(200);
      const sent = await p.evaluate(() => ({ sent: document.querySelector('main [data-form-status]').classList.contains('is-sent'), path: location.pathname }));
      check('legal opt-in form (390x844): 4 controls, each labelled and 44px or more; the preview hooks kept (an empty submit asks for the required box, a filled one is marked sent and stays on the page)',
        f0.preview && f0.status && f0.n === 4 && !f0.unlabelled.length && !f0.small.length && /required/.test(empty.note) && empty.focus === 'optin' && sent.sent && sent.path === '/membership_agreement', JSON.stringify({ f0, empty, sent }));
    }
    check(`legal pages (${w}x${h}): no script errors after the interactions`, errs.length === 0, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // the rendered contrast of every text line in main fully in view (between the header and the store bar), against the
  // worst 1% of the pixels behind it, at the top of each page and at each kind of block; reduced motion, so the titles
  // are at rest (their smoke-in ends in the same state)
  const lc = async (p) => {
    const items = await p.evaluate(() => {
      const out = [], nx = document.getElementById('nx'), dash = document.querySelector('[data-dash].is-on .dash__inner');
      const top = nx ? Math.max(0, nx.getBoundingClientRect().bottom) : 0, bottom = dash ? Math.min(innerHeight, dash.getBoundingClientRect().top) : innerHeight;
      // a line scrolled out of its own scroll box (the contents list's lower entries) is not on screen: never read
      const unclipped = (el, q) => { for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const r = a.getBoundingClientRect(); if (q.top < r.top || q.bottom > r.bottom || q.left < r.left || q.right > r.right) return false; } } return true; };
      const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        if (!n.textContent.trim() || n.parentElement.closest('[aria-hidden="true"], .sr-only')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2 && q.left >= 0 && q.top >= top && q.right <= innerWidth && q.bottom <= bottom && unclipped(n.parentElement, q))
          out.push({ x: q.left, y: q.top, w: q.width, h: q.height, c: getComputedStyle(n.parentElement).color, t: n.textContent.trim().slice(0, 18) });
      }
      return out;
    });
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'lc-hide'; st.textContent = 'main, main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.append(st); });
    await sleep(100);
    const png = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('lc-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.floor(it.x), y = Math.floor(it.y), w = Math.min(cv.width - x, Math.ceil(it.w)), h = Math.min(cv.height - y, Math.ceil(it.h));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, ratio: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, h, { reducedMotion: 'reduce' }); await age(ctx); const p = await ctx.newPage();
    const seen = new Map(); let views = 0;
    const keep = (list) => { views++; list.forEach((c) => { const k = c.t; if (!seen.has(k) || c.ratio < seen.get(k).ratio) seen.set(k, c); }); };
    for (const u of LEGAL) {
      await p.goto(origin + u); await sleep(300); keep(await lc(p));
      const stops = await p.evaluate(() => ['.legal__body h2', '.legal__body h3', '.legal__index', '.legal__facts', '.legal__table', '.legal__addr', '.p65', '.form', '.legal__terms', '.legal__actions', '.btn-row'].filter((s) => document.querySelector(s)));
      for (const s of stops) { await p.evaluate((s) => { const e = document.querySelector(s); scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * .3); }, s); await sleep(120); keep(await lc(p)); }
    }
    const all = [...seen.values()].sort((a, b) => a.ratio - b.ratio);
    check(`legal pages (${w}x${h}, reduced motion): every text line in view reads 4.5:1 or more on the rendered pixels (${all.length} lines over ${views} views, lowest ${all[0] && all[0].ratio} "${all[0] && all[0].t}")`,
      all.length > 100 && all.every((c) => c.ratio >= 4.5), JSON.stringify(all.slice(0, 4)));
    await ctx.close();
  }
}
// 16. /shop and /clothing in the design language (owner 2026-11-12: "apply those on the remaining pages";
//     docs/DESIGN-LANGUAGE.md; shop-pages.css). At 1440 and 390: one h1, every link and data-shop / data-store hook of
//     the version before (the snapshot below, from the build before the change), no sideways scroll, no script errors;
//     the hero photo (on /shop, the LA store's own, not the AI warehouse) and every image load; every text run 4.5:1 or
//     more on its rendered background, 3:1 when large (the text hidden, the page shot with the fixed chrome hidden, the
//     worst 1% of the pixels behind each run against its colour)
{
  const SHOP_LINKS = ['/', 'https://originalsca.com/menu/los-angeles/', ...['flower', 'preroll', 'cartridge', 'extract', 'edible', 'beverage', 'tincture', 'topical', 'merch'].map((c) => `https://originalsca.com/menu/los-angeles/categories/${c}/`),
    ...['originals-61320', 'jeeter-61405', 'stiiizy-61331', 'west-coast-cure-91619', 'the-cure-company-61318', 'raw-garden-61365', 'alien-labs-91626', 'caviar-gold-61396', 'kanha-61343', 'wyld-61369'].map((b) => `https://originalsca.com/menu/los-angeles/brands/${b}/`),
    '/brands', '/strains', '/deals', ...['originals-og', 'king-louie', 'gelato', 'oaksterdam-og', 'skywalker', 'sfv-og', 'paris-og', 'wedding-cake', 'jack-herer', 'bussin'].map((s) => '/strains#' + s)];
  const SHOP_HOOKS = { 'data-store-set=la': 1, 'data-store-set=sd': 1, 'data-shop=menu': 1, 'data-store-name': 9, ...Object.fromEntries(['flower', 'preroll', 'cartridge', 'extract', 'edible', 'beverage', 'tincture', 'topical', 'merch'].map((c) => ['data-shop=' + c, 1])) };
  const WANT = { shop: { links: SHOP_LINKS, hooks: SHOP_HOOKS }, clothing: { links: ['/', 'https://www.originalsclothingshop.com/', 'https://originalsca.com/menu/los-angeles/categories/merch/', '/bussin-merch'], hooks: {} } };
  const TEXT = 'main :is(h1, h2, h3, .kicker, .lede, .phero__lede p, .crumbs a, .crumbs span, .cat__name, .cat__go, .cats__note, .strain-chip__k, .strain-chip__n, .shop-mark span, .tags-line, .btn > span)';
  const runs = async (p) => {
    const items = await p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length && e.textContent.trim()).map((e) => {
      const q = e.getBoundingClientRect(), cs = getComputedStyle(e), size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      return { x: q.left + scrollX, y: q.top + scrollY, w: q.width, h: q.height, c: cs.color, t: e.textContent.trim().slice(0, 20), need: size >= 24 || (bold && size >= 18.66) ? 3 : 4.5 };
    }), TEXT);
    await p.evaluate((sel) => { const st = document.createElement('style'); st.id = 'ct-hide';
      st.textContent = `${sel}, ${sel} * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; } ${sel}::before, ${sel}::after { visibility: hidden !important; } #nx, .dash, [data-dash] { visibility: hidden !important; }`; document.head.append(st); }, TEXT);   // a run's own marks (the kicker's dot) are not its background
    await sleep(200);
    const png = (await p.screenshot({ fullPage: true, scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('ct-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.max(0, Math.floor(it.x)), y = Math.max(0, Math.floor(it.y)), w = Math.max(1, Math.min(cv.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(cv.height - y, Math.ceil(it.h)));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, need: it.need, ratio: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  for (const pg of ['shop', 'clothing']) for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, h); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(origin + '/' + pg); await sleep(700);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await p.evaluate((y) => scrollTo(0, y), y); await sleep(110); }   // every lazy image and reveal settles
    await p.evaluate(() => scrollTo(0, 0)); await sleep(1500);
    const m = await p.evaluate(() => {
      const main = document.querySelector('main'), hooks = {}, hero = main.querySelector('.phero__clip img');
      main.querySelectorAll('[data-shop], [data-store-name], [data-store-set]').forEach((e) => { for (const k of ['data-shop', 'data-store-name', 'data-store-set']) if (e.hasAttribute(k)) { const v = e.getAttribute(k), key = v ? k + '=' + v : k; hooks[key] = (hooks[key] || 0) + 1; } });
      return { h1: document.querySelectorAll('h1').length, links: [...main.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')), hooks, side: document.documentElement.scrollWidth - innerWidth,
        hero: hero ? { src: (hero.currentSrc || hero.src).split('/').pop(), ok: hero.complete && hero.naturalWidth > 0 } : null,
        broken: [...main.querySelectorAll('img')].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => (i.currentSrc || i.src).split('/').pop()) };
    });
    const want = WANT[pg], missLinks = want.links.filter((l) => !m.links.includes(l)), missHooks = Object.keys(want.hooks).filter((k) => (m.hooks[k] || 0) < want.hooks[k]);
    check(`/${pg}: one h1, every link and data-shop hook of the version before, no sideways scroll, no script errors (${w}x${h})`,
      m.h1 === 1 && !missLinks.length && !missHooks.length && m.side <= 0 && errs.length === 0, JSON.stringify({ h1: m.h1, links: m.links.length, missLinks, missHooks, side: m.side, errs: errs.slice(0, 2) }));
    check(`/${pg}: ${pg === 'shop' ? 'the hero is the LA store\'s own photo (not the AI warehouse) and it loads; ' : ''}every image loads (${w}x${h})`,
      (pg !== 'shop' || (m.hero && m.hero.ok && /^store-la-wall-/.test(m.hero.src))) && !m.broken.length, JSON.stringify({ hero: m.hero, broken: m.broken }));
    const cr = await runs(p), low = cr.filter((r) => r.ratio < r.need);
    check(`/${pg}: every text run 4.5:1 or more on its rendered background, 3:1 when large (${w}x${h})`,
      cr.length >= 8 && !low.length, JSON.stringify({ n: cr.length, low: low.slice(0, 5), lowest: cr.reduce((a, b) => (b.ratio / b.need < a.ratio / a.need ? b : a), cr[0]) }));
    await ctx.close();
  }
}
// 17. the culture inner pages, redesigned to the design language (owner 2026-11-12: "apply those on the remaining
//     pages"; culture.mjs /events /media /drops /find-originals, story.mjs /collabs /bussin-merch, culture-pages.css).
//     Each page at 1440x900 and 390x844: no script errors; no sideways scroll; one h1, its words; every link the page
//     had before the redesign still there and shown (with and without JS); every form control labelled; every visible
//     link and button 44x44 or larger (inline text links aside); every text line 4.5:1 or more (3:1 large) against the
//     worst 1% of the rendered pixels behind it, read with reduced motion so nothing is mid-animation (the lenticular
//     cards one by one, each as the active card). /drops: the preview form keeps its hooks (an empty submit stays on
//     the page and asks for the required fields). /events: the lenticular carousel goes live; every event keeps its id.
{
  const IG = ['https://www.instagram.com/originalsfamilyfarms/', 'https://www.instagram.com/la__originals__shop/', 'https://www.instagram.com/originalssdshop/'];
  // the links each page had before the redesign (its <main>, the build of 2026-11-12 before culture-pages.css)
  const CP = {
    events: { h1: 'Lit like our events', links: ['/', '/drops', '/collabs', '/retail', ...IG, '/originals-hall-of-flowers-palm-springs-recap', '/bussin-merch'] },
    media: { h1: 'The film', links: ['/', 'mailto:info@originalsca.com', ...IG] },
    drops: { h1: 'Don\'t miss the next drop', links: ['/', '/membership_agreement', '/bussin-merch'] },
    'find-originals': { h1: 'Find Originals', links: ['/', 'https://originalsca.com/menu/los-angeles/brands/originals-61320/', '/wholesale', '/los-angeles-store', 'tel:+13236969680', 'https://originalsca.com/menu/los-angeles/',
      'https://www.google.com/maps/search/?api=1&query=Originals%2C%206500%20Stanford%20Ave%2C%20Los%20Angeles%2C%20CA%2090001', '/san-diego-store', 'tel:+16193105232', 'https://weedmaps.com/dispensaries/originals-san-diego',
      'https://www.google.com/maps/search/?api=1&query=Originals%20San%20Diego%2C%206220%20Federal%20Blvd%2C%20San%20Diego%2C%20CA%2092114'] },
    collabs: { h1: 'The brand behind the brands', links: ['/', '/drops', '/events'] },
    'bussin-merch': { h1: 'Bussin\'', links: ['/', '/collabs', 'https://originalsca.com/menu/los-angeles/categories/flower/', 'https://www.originalsclothingshop.com/', '/events', '/drops'] },
  };
  const { EVENTS: EV } = await import(new URL('../src/content/site.mjs', import.meta.url));
  const facts = (p) => p.evaluate(() => {
    const shown = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const ctl = [...document.querySelectorAll('main input:not([type="hidden"]):not([type="submit"]), main select, main textarea')];
    return { h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), side: document.documentElement.scrollWidth - innerWidth,
      links: [...document.querySelectorAll('main a[href]')].map((a) => ({ href: a.getAttribute('href'), shown: shown(a) })),
      unlabelled: ctl.filter((c) => !(c.labels && c.labels.length) && !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby')).map((c) => c.name || c.type)
        .concat(ctl.filter((c) => c.type === 'radio' && !(c.closest('fieldset') && c.closest('fieldset').querySelector('legend'))).map((c) => c.name + ' (no legend)')),
      controls: ctl.length,
      small: [...document.querySelectorAll('main a[href], main button')].filter((e) => shown(e) && !e.disabled && getComputedStyle(e).display !== 'inline').map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((t) => t.w < 44 || t.h < 44) };
  });
  const missing = (want, got) => want.filter((href) => !got.some((l) => l.shown && (l.href === href || (href.startsWith('/') && href.length > 1 && l.href.endsWith(href)))));
  // the rendered contrast of every text line in <main> fully in view between the header and the store bar, against the
  // worst 1% of the pixels behind it (the page's text hidden for the shot); the lenticular's side cards are read as the
  // active card instead (a side card is dimmed under its overlay)
  const lines = (p) => p.evaluate(() => {
    const nx = document.getElementById('nx'), dash = document.querySelector('[data-dash].is-on .dash__inner');
    const top = nx ? Math.max(0, nx.getBoundingClientRect().bottom) : 0, bottom = dash ? Math.min(innerHeight, dash.getBoundingClientRect().top) : innerHeight, out = [];
    const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest('.sr-only, script, style, .ln-slide:not(.is-active)')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
      const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400, rg = document.createRange(); rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2 && q.left >= 0 && q.top >= top && q.right <= innerWidth && q.bottom <= bottom)
        out.push({ x: q.left, y: q.top, w: q.width, h: q.height, c: cs.color, t: n.textContent.trim().slice(0, 22), need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5 });
    }
    return out;
  });
  const measure = async (p) => {
    const items = await lines(p); if (!items.length) return [];
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'cp-hide'; st.textContent = 'main, main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.append(st); });
    await sleep(120);
    const png = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('cp-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.floor(it.x), y = Math.floor(it.y), w = Math.max(1, Math.min(cv.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(cv.height - y, Math.ceil(it.h)));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, need: it.need, k: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  const sweep = async (p) => {   // down the page a screen at a time; the lowest reading of each text kept
    const seen = new Map(), keep = (list) => list.forEach((c) => { const o = seen.get(c.t); if (!o || c.k / c.need < o.k / o.need) seen.set(c.t, c); });
    const H = await p.evaluate(() => { const m = document.querySelector('main'); return Math.ceil(m.getBoundingClientRect().bottom + scrollY); });
    for (let y = 0; ; y += 560) {
      await p.evaluate((y) => scrollTo(0, y), y); await sleep(450); keep(await measure(p));
      if (await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2) || y + 900 >= H) break;
    }
    if (await p.$('[data-lenticular] [data-ln-next]')) for (let k = 0; k < 2; k++) {   // each lenticular card in turn as the active card
      await p.evaluate(() => document.querySelector('[data-lenticular]').scrollIntoView({ block: 'center' })); await p.click('[data-lenticular] [data-ln-next]'); await sleep(700); keep(await measure(p));
    }
    return [...seen.values()];
  };
  for (const [w, hh] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, hh); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const rm = await ctxFor(w, hh, { reducedMotion: 'reduce' }); await rm.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    for (const [pg, want] of Object.entries(CP)) {
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
      await p.goto(origin + '/' + pg); await sleep(800);
      await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); }); await sleep(500);
      const f = await facts(p), miss = missing(want.links, f.links);
      check(`culture pages /${pg}: one h1 ("${want.h1}"), no sideways scroll (${w}x${hh})`, f.h1.length === 1 && f.h1[0] === want.h1 && f.side <= 0, JSON.stringify({ h1: f.h1, side: f.side }));
      check(`culture pages /${pg}: every link the page had before the redesign is still there and shown (${want.links.length}) (${w}x${hh})`, !miss.length, JSON.stringify({ missing: miss, n: f.links.length }));
      check(`culture pages /${pg}: every form control labelled (${f.controls}); every visible link and button 44x44 or larger (${w}x${hh})`, !f.unlabelled.length && !f.small.length, JSON.stringify({ unlabelled: f.unlabelled, small: f.small }));
      if (pg === 'events') {
        const ev = await p.evaluate((ids) => ({ ids: ids.filter((id) => !document.getElementById(id)), live: !!document.querySelector('[data-lenticular].is-live'), ctrl: !(document.querySelector('[data-ln-ctrl]') || {}).hidden, rows: document.querySelectorAll('.cp-list > li').length }), EV.map((e) => e.id));
        check(`culture pages /events: the lenticular carousel is live with its controls; every event keeps its id (/events#lowrider-super-show from the home) in the ruled list (${w}x${hh})`, !ev.ids.length && ev.live && ev.ctrl && ev.rows === EV.length, JSON.stringify(ev));
      }
      if (pg === 'drops') {
        const url = p.url(); await p.click('#drops [type="submit"]'); await sleep(400);
        const fm = await p.evaluate(() => { const f = document.getElementById('drops'); return { hook: f.hasAttribute('data-preview-form'), action: f.getAttribute('action'), method: f.getAttribute('method'), note: (f.querySelector('[data-form-status]') || {}).textContent, req: [...f.querySelectorAll('[required]')].map((e) => e.name) }; });
        check(`culture pages /drops: the preview form keeps its hooks: an empty submit stays on the page and asks for the required fields (${w}x${hh})`, fm.hook && /\/form-sent$/.test(fm.action) && fm.method === 'get' && fm.note === 'Please fill in the required fields.' && p.url() === url && fm.req.join() === 'email,optin', JSON.stringify(fm));
      }
      check(`no script errors (/${pg}, ${w}x${hh})`, errs.length === 0, errs.slice(0, 2).join(' | '));
      await p.close();
      const q = await rm.newPage(); await q.goto(origin + '/' + pg); await sleep(900);
      const ct = await sweep(q), low = ct.filter((c) => c.k < c.need);
      check(`culture pages /${pg}: every text line 4.5:1 or more (3:1 large) against the rendered pixels behind it (${w}x${hh})`, ct.length >= 8 && !low.length,
        JSON.stringify({ n: ct.length, low: low.slice(0, 6), lowest: ct.reduce((m, c) => (!m || c.k / c.need < m.k / m.need ? c : m), null) }));
      await q.close();
    }
    await ctx.close(); await rm.close();
  }
  {   // without JS the content is complete: the h1 and every link, shown, no sideways scroll
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false });
    for (const [pg, want] of Object.entries(CP)) {
      const p = await ctx.newPage(); await p.goto(origin + '/' + pg); await sleep(400);
      const f = await facts(p), miss = missing(want.links, f.links);
      check(`culture pages /${pg} without JS: the h1, every link shown, no sideways scroll (1440x900)`, f.h1.length === 1 && f.h1[0] === want.h1 && !miss.length && f.side <= 0, JSON.stringify({ h1: f.h1, missing: miss, side: f.side }));
      await p.close();
    }
    await ctx.close();
  }
}
// 18. the Cannablog (owner brief 2026-11-12, "apply those on the remaining pages"; blog.mjs, blog.css): the index leads
//     with the newest post as a large split (its photo beside the title), then the other twenty in a numbered editorial
//     grid over hairlines, no boxes (four columns at 1440; compact rows with a square thumbnail on a phone). An article:
//     a compact title band on a ruled dateline, the post's own lead image lifted into the hero figure, the title, the
//     hero and the body on one left edge, the body at a 65-75ch measure (75ch or less on a phone), its headings in the
//     display face, "More from the Cannablog" as numbered rows.
//     - The index and three posts (image-first with a gallery row, text-first, a small lead image) at 1440x900 and
//       390x844: no script errors, no sideways scroll (nor at 1280 and 1024), one h1, every image in main loaded, every
//       text run 4.5:1 or more (3:1 large) on the rendered pixels (the texts hidden, the viewport shot, the worst 1% of
//       the pixels behind each line against its colour) at the top, mid-page and the end; on a phone every link and
//       button in main 44px tall or more (and 44 wide unless it is a text link). Gold only on hover.
//     - Parity, every post and the index, without JS (the static page): one h1, the post's own title, head title,
//       description and JSON-LD; the article (hero + body) is the captured body tag for tag (the hero is the body's
//       first image, lifted; a gallery row is a wrapper only); "More from the Cannablog" is the live list (title, author
//       bar, excerpt, link and image, in order); the index lists every post in order with the same five; every entry
//       shows. Reduced motion: nothing hidden waiting for a reveal, no hover zoom.
{
  const { loadPosts } = await import(new URL('../src/pages/blog.mjs', import.meta.url));
  const { extractPostList } = await import(new URL('../src/lib/capture.mjs', import.meta.url));
  const { postLd, crumbsLd } = await import(new URL('../src/lib/seo.mjs', import.meta.url));
  const { u, a: asset } = await import(new URL('../src/lib/html.mjs', import.meta.url));
  const POSTS = loadPosts(), bySlug = new Map(POSTS.map((x) => [x.slug, x]));
  const SAMPLE = ['/gelato-strain-originals', '/thc-extract-for-fast-relief', '/originals-san-diego-cannabis-dispensary'];
  const sp = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const want = (p) => ({ href: u(p.path), meta: sp(p.meta || p.dateText), title: sp(p.title), excerpt: sp(p.excerpt), img: p.cardImage ? p.cardImage.src : null });
  const entries = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel + ' .ed')].map((e) => {
    const t = (s) => { const x = e.querySelector(s); return x ? x.textContent.replace(/\s+/g, ' ').trim() : ''; };
    const im = e.querySelector('img'), cs = getComputedStyle(e);
    return { href: e.querySelector('a').getAttribute('href'), meta: t('.ed__meta'), title: t('.ed__title'), excerpt: t('.ed__excerpt'), img: im ? im.getAttribute('src') : null,
      shown: cs.opacity === '1' && cs.visibility === 'visible' && e.getBoundingClientRect().height > 40 };
  }), sel);
  const bare = (list) => JSON.stringify(list.map(({ shown, ...e }) => e));
  // parity: the static pages against the captured posts (src/lib/capture.mjs), the words the template renders verbatim
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } }); await ctx.route(/^(?!http:\/\/127\.0\.0\.1).*/, (r) => r.abort());
    const p = await ctx.newPage(), bad = [], N = (s) => s.replace(/ (loading|fetchpriority|decoding)="[^"]*"/g, '').replace(/<div class="post__figs"[^>]*>|<\/div>/g, '');
    let lifted = 0;
    for (const q of POSTS) {
      await p.goto(origin + u(q.path));
      const got = await p.evaluate((src) => {
        const t = document.createElement('template'); t.innerHTML = src;
        const hero = document.querySelector('.post__hero img'), body = document.querySelector('.post__body');
        return { src: t.innerHTML, hero: hero ? hero.outerHTML : '', body: body ? body.innerHTML : '', h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
          title: document.title, desc: (document.querySelector('meta[name="description"]') || {}).content, canon: (document.querySelector('link[rel="canonical"]') || {}).href || '',
          ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent) };
      }, q.body.replace(/src="img\/posts\//g, 'src="' + asset('img/posts/')));
      const more = await entries(p, '.post-more'), m = /<img\b[^>]*>/.exec(got.src);
      const wantMore = extractPostList(q.path).filter((x) => x.slug !== q.slug).map((x) => want({ ...bySlug.get(x.slug), title: x.title, meta: x.authorBar, excerpt: x.excerpt }));
      const ld = [postLd(q), crumbsLd([{ name: 'Cannablog', path: '/blog' }, { name: q.title, path: q.path }])].map((j) => JSON.stringify(j).replace(/</g, '\\u003c'));
      const fails = [];
      if (got.h1.length !== 1 || got.h1[0] !== sp(q.title)) fails.push('h1');
      if (got.title !== (q.seoTitle || q.title) || got.desc !== q.description || !got.canon.endsWith(q.path)) fails.push('head');
      if (!ld.every((s) => got.ld.includes(s)) || got.ld.filter((s) => s.includes('"BlogPosting"')).length !== 1) fails.push('json-ld');
      if (!m || N(got.hero) !== N(m[0])) fails.push('hero'); else lifted++;
      if (!m || N(got.body) !== N(got.src.slice(0, m.index) + got.src.slice(m.index + m[0].length))) fails.push('body');
      if (bare(more) !== JSON.stringify(wantMore) || !more.every((e) => e.shown)) fails.push('more');
      if (fails.length) bad.push(q.slug + ': ' + fails.join('+'));
    }
    check(`blog parity: every post (${POSTS.length}), without JS: one h1, the post's own title, head title, description and JSON-LD; the hero is the body's first image, lifted, and the body is the captured post tag for tag (a gallery row a wrapper only); "More from the Cannablog" is the live list (title, author bar, excerpt, link, image, in order), every entry shown`,
      POSTS.length >= 21 && !bad.length && lifted === POSTS.length, JSON.stringify({ n: POSTS.length, lifted, bad: bad.slice(0, 6) }));
    await p.goto(origin + '/blog');
    const idx = await entries(p, '.blog-index'), ix = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, lead: (document.querySelector('.blog-index .ed--lead a') || {}).getAttribute?.('href') }));
    check('blog parity: the index, without JS: one h1; every post in order (the newest as the lead story) with its title, author bar, excerpt, link and image, every entry shown',
      ix.h1 === 1 && ix.lead === u(POSTS[0].path) && bare(idx) === JSON.stringify(POSTS.map(want)) && idx.every((e) => e.shown), JSON.stringify({ h1: ix.h1, lead: ix.lead, n: idx.length, hidden: idx.filter((e) => !e.shown).length }));
    await ctx.close();
  }
  // the rendered page
  const walk = (p) => p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * .8)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } });
  const settle = async (p) => {   // the reveals and the smoke titles in view have played
    for (let i = 0; i < 40; i++) {
      const busy = await p.evaluate(() => [...document.querySelectorAll('main [data-smoke], main [data-reveal]:not(.is-in)')].some((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.height > 0; }));
      if (!busy) break; await sleep(150);
    }
    await sleep(1100);
  };
  const toEl = (p, sel) => p.evaluate((sel) => { const e = sel === 'top' ? null : document.querySelector(sel); scrollTo(0, e ? Math.max(0, Math.round(e.getBoundingClientRect().top + scrollY - 100)) : 0); }, sel);
  const look = (p) => p.evaluate(() => {
    const main = document.querySelector('main'), imgs = [...main.querySelectorAll('img')];
    const chOf = (el) => { const s = document.createElement('span'); s.textContent = '0'; s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; el.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return w; };
    const ms = [...document.querySelectorAll('.post__body > p')].slice(1).filter((e) => e.textContent.length > 160).map((e) => e.getBoundingClientRect().width / chOf(e));
    const L = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().left) : null; };
    const small = [...main.querySelectorAll('a[href], button')].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height), inl: getComputedStyle(e).display === 'inline' }; }).filter((t) => t.h < 44 || (!t.inl && t.w < 44));
    return { side: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length, n: imgs.length, broken: imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')).slice(0, 3),
      measure: ms.length ? [Math.round(Math.min(...ms) * 10) / 10, Math.round(Math.max(...ms) * 10) / 10] : null, axis: [L('.phero--post .phero__title'), L('.post__hero img'), L('.post__body > p')], small: small.slice(0, 6), nSmall: small.length,
      heads: [...new Set([...document.querySelectorAll('.post__body :is(h2, h3, h4)')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()))] };
  });
  const grid = (p) => p.evaluate(() => {
    const r = (e) => e.getBoundingClientRect(), lead = document.querySelector('.ed--lead'), cards = [...document.querySelectorAll('.ed-grid > .ed')];
    const lm = r(lead.querySelector('.ed__media')), lt = r(lead.querySelector('.ed__title')), tops = cards.slice(0, 5).map((c) => Math.round(r(c).top));
    const cm = r(cards[0].querySelector('.ed__media')), ct = r(cards[0].querySelector('.ed__title'));
    return { split: lm.right < lt.left, cols: tops.filter((t) => t === tops[0]).length, row: cm.right < ct.left, thumb: Math.round(cm.width), n: cards.length,
      flat: cards.every((c) => getComputedStyle(c.querySelector('a')).backgroundColor === 'rgba(0, 0, 0, 0)'), rule: getComputedStyle(cards[0]).borderTopWidth };
  });
  // contrast on the rendered pixels: each text run in main (and each entry number) in view; the texts, the header and
  // the store dash hidden for the shot; the worst 1% of the pixels behind each line box against the text's colour
  const pix = async (p) => {
    const runs = await p.evaluate(() => {
      const out = [], vh = innerHeight, vw = innerWidth;
      const add = (el, rects, t) => {
        const cs = getComputedStyle(el); if (cs.visibility !== 'visible') return;
        const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
        // only the painted part of a line: a clamped excerpt's hidden lines are cut to its clipping box
        let clip = null; for (let e = el; e && e !== document.body; e = e.parentElement) { if (getComputedStyle(e).overflow !== 'visible') { clip = e.getBoundingClientRect(); break; } }
        if (clip) rects = rects.map((q) => new DOMRect(Math.max(q.left, clip.left), Math.max(q.top, clip.top), Math.min(q.right, clip.right) - Math.max(q.left, clip.left), Math.min(q.bottom, clip.bottom) - Math.max(q.top, clip.top))).filter((q) => q.width > 1 && q.height > 4);
        rects = rects.filter((q) => q.width > 1 && q.top >= 0 && q.bottom <= vh && q.left >= 0 && q.right <= vw).map((q) => [q.left, q.top, q.right, q.bottom]);
        if (rects.length) out.push({ t, color: cs.color, rects, need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5 });
      };
      const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        const el = n.parentElement;
        if (!n.nodeValue.trim() || !el || el.closest('.sr-only, .chrome-word, [aria-hidden="true"], script, style')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); add(el, [...rg.getClientRects()], n.nodeValue.trim().slice(0, 28));
      }
      document.querySelectorAll('main .ed__no').forEach((e) => add(e, [e.getBoundingClientRect()], 'no.'));
      return out;
    });
    const hide = await p.addStyleTag({ content: 'main, main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; } main .chrome-word, #nx, [data-dash] { visibility: hidden !important; }' });
    await sleep(150); const shot = await p.screenshot({ scale: 'css' }); await hide.evaluate((s) => s.remove());
    return p.evaluate(async ({ b64, runs }) => {
      const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))], { type: 'image/png' }));
      const cv = new OffscreenCanvas(bmp.width, bmp.height), g = cv.getContext('2d'); g.drawImage(bmp, 0, 0);
      const px = g.getImageData(0, 0, bmp.width, bmp.height).data, W = bmp.width, H = bmp.height;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }, L = (r, gg, b) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
      return runs.map(({ t, color, rects, need }) => {
        const c = color.match(/[\d.]+/g).map(Number), al = c.length > 3 ? c[3] : 1, ks = [];
        for (const [l, tp, r, b] of rects) for (let y = Math.max(0, Math.floor(tp)); y < Math.min(H, Math.ceil(b)); y++) for (let x = Math.max(0, Math.floor(l)); x < Math.min(W, Math.ceil(r)); x++) {
          const i = (y * W + x) * 4, bl = L(px[i], px[i + 1], px[i + 2]), tl = L(c[0] * al + px[i] * (1 - al), c[1] * al + px[i + 1] * (1 - al), c[2] * al + px[i + 2] * (1 - al));
          ks.push((Math.max(tl, bl) + .05) / (Math.min(tl, bl) + .05));
        }
        ks.sort((x, y) => x - y);
        return { t, k: Math.round((ks[Math.floor(ks.length * .01)] || 21) * 100) / 100, need };
      });
    }, { b64: shot.toString('base64'), runs });
  };
  const lowest = (ct) => ct.reduce((m, r) => (!m || r.k / r.need < m.k / m.need ? r : m), null);
  for (const [w, hh] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, hh); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    for (const path0 of ['/blog', ...SAMPLE]) {
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
      await p.goto(origin + path0); await p.evaluate(() => document.fonts.ready); await sleep(400); await walk(p); await sleep(600);
      const a = await look(p), post = path0 !== '/blog';
      const ct = [];
      for (const sel of post ? ['top', '.post__body > p:nth-of-type(3)', '.post-more'] : ['top', '.blog-index', '.ed-grid > .ed:nth-child(9)']) { await toEl(p, sel); await settle(p); ct.push(...await pix(p)); }
      const low = ct.filter((r) => r.k < r.need);
      const tag = `${path0} at ${w}x${hh}`;
      check(`blog: ${tag}: one h1, no sideways scroll, every image in main loaded${post ? `, the measure ${w > 800 ? '65-75ch' : '75ch or less'}, the title, the hero and the body on one left edge, the body headings in the display face` : ''}${w < 800 ? ', every link and button in main 44px tall or more' : ''}`,
        a.h1 === 1 && a.side <= 0 && a.n >= 11 && !a.broken.length && (!post || (a.measure && a.measure[1] <= 75 && (w < 800 || a.measure[0] >= 65) && Math.max(...a.axis) - Math.min(...a.axis) <= 1 && a.heads.every((f) => f === 'League Gothic'))) && (w > 800 || !a.nSmall),
        JSON.stringify({ h1: a.h1, side: a.side, imgs: a.n, broken: a.broken, measure: a.measure, axis: a.axis, heads: a.heads, small: w < 800 ? a.small : undefined }));
      check(`blog: ${tag}: every text run 4.5:1 or more (3:1 large) on the rendered pixels, at the top, mid-page and the end`, ct.length >= 20 && !low.length, JSON.stringify({ n: ct.length, low: low.slice(0, 5), lowest: lowest(ct) }));
      if (!post) {
        const gr = await grid(p);
        check(`blog: the index at ${w}x${hh}: the lead story ${w > 800 ? 'a split, its photo beside the title' : 'stacked'}, then ${gr.n} numbered entries over hairlines, no boxes, ${w > 800 ? 'four columns' : 'compact rows with a square thumbnail'}`,
          gr.n === POSTS.length - 1 && gr.flat && gr.rule === '1px' && (w > 800 ? gr.split && gr.cols === 4 && !gr.row : !gr.split && gr.row && gr.thumb <= 100), JSON.stringify(gr));
        if (w > 800) {
          const col = () => p.evaluate(() => { const s = document.createElement('span'); s.style.color = 'var(--gold)'; document.body.append(s); const gd = getComputedStyle(s).color; s.remove(); return { gold: gd, t: getComputedStyle(document.querySelector('.ed-grid .ed__title')).color }; });
          const c0 = await col(); await p.hover('.ed-grid .ed__link'); await sleep(600); const c1 = await col();
          check('blog: the index at 1440x900: gold only on interaction (an entry title white at rest, gold on hover)', c0.t !== c0.gold && c1.t === c1.gold, JSON.stringify({ rest: c0.t, hover: c1.t, gold: c0.gold }));
        }
      }
      check(`no script errors (${tag})`, errs.length === 0, errs.slice(0, 2).join(' | '));
      await p.close();
    }
    await ctx.close();
  }
  {
    const sides = [];
    for (const w of [1280, 1024]) {
      const ctx = await ctxFor(w, 800); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
      for (const path0 of ['/blog', ...SAMPLE]) { const p = await ctx.newPage(); await p.goto(origin + path0); await sleep(500); sides.push([w, path0, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)]); await p.close(); }
      await ctx.close();
    }
    check('blog: no sideways scroll at 1280 and 1024 (the index and the three posts)', sides.every((s) => s[2] <= 0), JSON.stringify(sides.filter((s) => s[2] > 0)));
  }
  {
    const ctx = await ctxFor(1440, 900, { reducedMotion: 'reduce' }); await ctx.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto(origin + '/blog'); await sleep(800);
    const rm = await p.evaluate(() => [...document.querySelectorAll('.ed')].filter((e) => getComputedStyle(e).opacity !== '1').length);
    await p.hover('.ed-grid .ed__link'); await sleep(1000);
    const sc = await p.evaluate(() => getComputedStyle(document.querySelector('.ed-grid .ed__media img')).scale);
    check('blog with reduced motion: every entry shown at once (none waiting for a reveal) and no hover zoom (1440x900)', rm === 0 && (sc === 'none' || sc === '1'), JSON.stringify({ hidden: rm, scale: sc }));
    await ctx.close();
  }
}
// 19. the info pages (2026-11-12 redesign to docs/DESIGN-LANGUAGE.md; info-pages.css): /contact and /los-angeles (stores.mjs:
//     a split head, the form beside CONTACT INFO as ruled rows, the stores' editorial fact grids), /faqs (the compact
//     numbered accordion, the newsletter band), 404 and /form-sent (small, flat), /jobs (the LA store's own photo in the
//     hero) and /wholesale (misc.mjs, business.mjs), and the /san-diego-store hero (the business's own storefront photo,
//     store-sd-exterior). For each page, at 1440x900 and 390x844:
//     - no script errors, no sideways scroll, one h1;
//     - every link and form field of the page as it was before the redesign (the dist build of 2026-11-12, listed in
//       BEFORE) is still there, the forms field for field (names, types, choices), every control labelled, each form still
//       the preview form with its status line (and the live form's ok / error messages where it had them);
//     - every text line fully in view is 4.5:1 or more (3:1 large) against the worst 1% of the pixels behind it, read on
//       the rendered page with reduced motion (static, every reveal shown), the page walked a screen at a time;
//     - on the phone, every link, button, FAQ row and choice is 44x44 or more.
//     Plus: the FAQs open and close (with and without JS); the stores' live status and today's hours row are site.js's;
//     the San Diego hero is store-sd-exterior, loaded, not AI, its big ORIGINALS sign whole in frame and clear of the
//     title; the /jobs hero is a real LA store photo; without JS every page is complete (nothing left hidden).
{
  const { CONFIRM: CF } = await import(new URL('../src/content/site.mjs', import.meta.url));
  const BEFORE = {"/404":{"links":["/","https://originalsca.com/menu/los-angeles/","/retail"],"fields":[],"forms":{}},"/contact":{"links":["/","tel:+13236969680","mailto:support@originalsca.com","/retail"],"fields":["contact:name:text","contact:email:email","contact:phone:tel","contact:message:textarea"],"forms":{"contact":"okerr"}},"/los-angeles":{"links":["/","tel:+13236969680","https://originalsca.com/menu/los-angeles/","https://www.google.com/maps/search/?api=1&query=Originals%2C%206500%20Stanford%20Ave%2C%20Los%20Angeles%2C%20CA%2090001","mailto:support@originalsca.com","/retail"],"fields":["la-contact:name:text","la-contact:email:email","la-contact:phone:tel","la-contact:message:textarea"],"forms":{"la-contact":"okerr"}},"/faqs":{"links":["/","/contact","https://originalsca.com/menu/los-angeles/","/deals","/rewards-program-and-opt-in","/jobs"],"fields":["faq-drop:email:email","faq-drop:phone:tel"],"forms":{"faq-drop":""}},"/form-sent":{"links":["/","/contact"],"fields":[],"forms":{}},"/jobs":{"links":["/","tel:+13236969680","tel:+16193105232","mailto:support@originalsca.com","/retail"],"fields":["jobs:positions:checkbox:Retail","jobs:positions:checkbox:Distribution","jobs:positions:checkbox:Cultivation","jobs:positions:checkbox:Manufacturing","jobs:name:text","jobs:email:email","jobs:phone:tel","jobs:dob:date","jobs:why:textarea","jobs:license:radio:Yes","jobs:license:radio:No","jobs:schedule:radio:Full-time","jobs:schedule:radio:Part-time","jobs:availability:text","jobs:start:text","jobs:employed:radio:Yes","jobs:employed:radio:No","jobs:current:textarea","jobs:education:radio:High School/GED","jobs:education:radio:College (Bachelors)","jobs:education:radio:Masters Degree","jobs:school:text","jobs:employer:text","jobs:duties:text","jobs:from:date","jobs:to:date","jobs:supervisor:text","jobs:supervisor-phone:tel","jobs:resume:file"],"forms":{"jobs":"okerr"}},"/wholesale":{"links":["/","/find-originals","/strains"],"fields":["wholesale:name:text","wholesale:company:text","wholesale:email:email","wholesale:phone:tel","wholesale:licence:text","wholesale:state:radio:California","wholesale:state:radio:Massachusetts","wholesale:message:textarea"],"forms":{"wholesale":""}},"/san-diego-store":{"links":["/","/retail","https://weedmaps.com/dispensaries/originals-san-diego","https://www.google.com/maps/search/?api=1&query=Originals%20San%20Diego%2C%206220%20Federal%20Blvd%2C%20San%20Diego%2C%20CA%2092114","tel:+16193105232","https://weedmaps.com/dispensaries/originals-san-diego/flower","https://weedmaps.com/dispensaries/originals-san-diego/pre-roll","https://weedmaps.com/dispensaries/originals-san-diego/vape-pens","https://weedmaps.com/dispensaries/originals-san-diego/concentrates","https://weedmaps.com/dispensaries/originals-san-diego/edibles","https://www.instagram.com/originalssdshop/","https://weedmaps.com/dispensaries/originals-san-diego/deals","/deals","/los-angeles-store","tel:+13236969680","https://originalsca.com/menu/los-angeles/"],"fields":[],"forms":{}}};
  const PAGES = Object.keys(BEFORE);
  const age = (c) => c.addInitScript(() => { try { localStorage.setItem('og-age', '21'); } catch (e) {} });
  // the page's inventory: links, fields (form:name:type[:choice]), controls without a label, forms, h1s, sideways scroll
  const inv = (p) => p.evaluate(() => {
    const m = document.querySelector('main');
    const name = (e) => ((e.labels && e.labels[0] && e.labels[0].textContent) || '').trim();
    const legend = (e) => { const f = e.closest('fieldset'); return f && f.querySelector('legend') ? f.querySelector('legend').textContent.trim() : ''; };
    const ctl = [...m.querySelectorAll('input, textarea, select')];
    return {
      links: [...m.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      fields: ctl.map((e) => [e.form ? e.form.id : '-', e.name, e.type].concat(/radio|checkbox/.test(e.type) ? [e.value] : []).join(':')),
      unlabelled: ctl.filter((e) => !name(e) || (/radio|checkbox/.test(e.type) && !legend(e))).map((e) => e.name + ':' + e.type),
      forms: [...m.querySelectorAll('form')].map((f) => ({ id: f.id, ok: f.matches('[data-preview-form]') && f.getAttribute('action') === '/form-sent' && !!f.querySelector('[data-form-status]'),
        msgs: (f.querySelector('[data-form-ok]') ? 'ok' : '') + (f.querySelector('[data-form-err]') ? 'err' : '') })),
      h1: [...document.querySelectorAll('h1')].filter((e) => e.getClientRects().length).map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
      side: document.documentElement.scrollWidth - innerWidth,
    };
  });
  const missing = (b, a) => b.links.filter((x) => !a.links.includes(x));
  const sameFields = (b, a) => JSON.stringify([...a.fields].sort()) === JSON.stringify([...b.fields].sort());
  // the rendered contrast of each text line fully in view (between the fixed header and the store bar) against the worst
  // 1% of the pixels behind it (the text hidden for the capture); the chrome-gradient title words are left out
  const contrast = async (p) => {
    const items = await p.evaluate(() => {
      const out = [], nx = document.getElementById('nx'), dash = document.querySelector('[data-dash].is-on .dash__inner');
      const top = nx ? Math.max(0, nx.getBoundingClientRect().bottom) : 0, bottom = dash ? Math.min(innerHeight, dash.getBoundingClientRect().top) : innerHeight;
      const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        const el = n.parentElement;
        if (!n.textContent.trim() || !el || el.closest('[aria-hidden="true"], .sr-only, .chrome-word, details:not([open]) > .faq__a, script, style')) continue;
        const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
        if (cs.visibility === 'hidden') continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2 && q.left >= 0 && q.top >= top && q.right <= innerWidth && q.bottom <= bottom)
          out.push({ x: q.left, y: q.top, w: q.width, h: q.height, c: cs.color, need: fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5, t: n.textContent.trim().slice(0, 22) });
      }
      return out;
    });
    if (!items.length) return [];
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'ct-hide'; st.textContent = 'main, main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }'; document.head.append(st); });
    await sleep(120);
    const png = (await p.screenshot({ scale: 'css' })).toString('base64');
    await p.evaluate(() => document.getElementById('ct-hide').remove());
    return p.evaluate(async ({ png, items }) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, gr, b) => 0.2126 * lin(r) + 0.7152 * lin(gr) + 0.0722 * lin(b);
      const rgb = (c) => { const n = (c.match(/[\d.]+/g) || []).map(Number); return /^color\(/.test(c) ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3); };
      return items.map((it) => {
        const x = Math.floor(it.x), y = Math.floor(it.y), w = Math.max(1, Math.min(cv.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(cv.height - y, Math.ceil(it.h)));
        const d = g.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(lum(d[i], d[i + 1], d[i + 2]));
        ls.sort((a, b) => a - b);
        const lt = lum(...rgb(it.c)), lo = ls[Math.floor(ls.length * .01)], hi = ls[Math.ceil(ls.length * .99) - 1];
        return { t: it.t, need: it.need, k: Math.round((lt >= hi ? (lt + .05) / (hi + .05) : lt <= lo ? (lo + .05) / (lt + .05) : 1) * 100) / 100 };
      });
    }, { png, items });
  };
  // walk the page a screen at a time, reading every line fully in view
  const walk = async (p) => {
    const all = [], H = await p.evaluate(() => document.querySelector('main').getBoundingClientRect().bottom + scrollY), vh = await p.evaluate(() => innerHeight);
    for (let y = 0; ; y += Math.round(vh * .55)) {
      await p.evaluate((y) => scrollTo(0, y), y); await sleep(220);
      for (const r of await contrast(p)) if (!all.some((q) => q.t === r.t && q.k === r.k)) all.push(r);
      if (y + vh >= H) break;
    }
    await p.evaluate(() => scrollTo(0, 0));
    return all;
  };
  // tap targets: every visible link, button, summary and choice in main
  const small = (p) => p.evaluate(() => [...document.querySelector('main').querySelectorAll('a[href], button, summary, input[type="radio"], input[type="checkbox"], input[type="file"]')]
    .filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && !e.closest('details:not([open]) > .faq__a'))
    .map((e) => { const r = [...e.getClientRects()].reduce((m, q) => (q.width * q.height > m.width * m.height ? q : m)); return { t: (e.textContent || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((r) => r.w < 44 || r.h < 44));
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await ctxFor(w, h, { reducedMotion: 'reduce' }); await age(ctx);
    for (const pg of PAGES) {
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
      await p.goto(origin + pg); await sleep(700);
      const a = await inv(p), b = BEFORE[pg];
      const formsOk = a.forms.length === Object.keys(b.forms).length && a.forms.every((f) => f.ok && b.forms[f.id] === f.msgs);
      check(`info pages ${pg}: no script errors, no sideways scroll, one h1; every link and form field from before the redesign is there, the forms field for field and still the preview forms, every control labelled (${w}x${h})`,
        !errs.length && a.side <= 0 && a.h1.length === 1 && !missing(b, a).length && sameFields(b, a) && !a.unlabelled.length && formsOk,
        JSON.stringify({ errs: errs.slice(0, 2), side: a.side, h1: a.h1, missing: missing(b, a), fields: sameFields(b, a) ? 'same' : a.fields, unlabelled: a.unlabelled, forms: a.forms }));
      const ct = await walk(p), low = ct.filter((r) => r.k < r.need);
      check(`info pages ${pg}: every text line in view 4.5:1 or more against the pixels behind it (3:1 large), the page walked top to bottom (${w}x${h})`,
        ct.length >= 3 && !low.length, JSON.stringify({ n: ct.length, low: low.slice(0, 6), lowest: ct.reduce((m, r) => (!m || r.k / r.need < m.k / m.need ? r : m), null) }));
      if (w < 800) { const s = await small(p); check(`info pages ${pg}: every link, button, FAQ row and choice is 44x44 or more (${w}x${h})`, !s.length, JSON.stringify(s.slice(0, 8))); }
      await p.close();
    }
    await ctx.close();
  }
  // the FAQs open and close; the store facts' live status from site.js
  {
    const ctx = await ctxFor(1440, 900); await age(ctx); const p = await ctx.newPage();
    await p.goto(origin + '/faqs'); await sleep(900);
    const faq = await p.evaluate(async () => {
      const its = [...document.querySelectorAll('.info-faqs .faq__item')], out = [];
      for (const d of its) {
        const q = d.querySelector('summary'), a = d.querySelector('.faq__a'); q.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 60));
        const h0 = d.getBoundingClientRect().height, closed0 = !d.open && !a.checkVisibility();
        q.click(); await new Promise((r) => setTimeout(r, 60)); const opened = d.open && a.checkVisibility() && d.getBoundingClientRect().height > h0 + 20 && a.innerText.trim().length > 10;
        q.click(); await new Promise((r) => setTimeout(r, 60)); out.push(closed0 && opened && !d.open && !a.checkVisibility() && Math.abs(d.getBoundingClientRect().height - h0) < 1);
      }
      return { n: its.length, ok: out, nums: its.map((d) => getComputedStyle(d.querySelector('summary'), '::before').content) };
    });
    check('info pages /faqs: all seven questions are numbered rows that open on a click, show their answer and close again (1440x900)', faq.n === 7 && faq.ok.every(Boolean) && faq.nums.every((c) => /counter|\d/.test(c)), JSON.stringify(faq));
    for (const pg of ['/contact', '/los-angeles']) {
      await p.goto(origin + pg); await sleep(900);
      const st = await p.evaluate(() => [...document.querySelectorAll('main [data-store-card]')].map((c) => ({ id: c.getAttribute('data-store-card'), status: c.querySelector('[data-status-for]').textContent.trim(),
        dot: c.querySelector('[data-status-dot]').getAttribute('data-open'), today: c.querySelectorAll('[data-hours] > .is-today').length, rows: c.querySelectorAll('[data-hours] > div').length,
        labels: [...c.querySelectorAll('.ifact__label')].map((e) => e.textContent.trim()).join('/') })));
      const want = pg === '/contact' ? ['la', 'sd'] : ['la'];
      check(`info pages ${pg}: the editorial fact grid for ${want.join(' and ')}: its live status line and dot from site.js, today's hours row marked, ADDRESS / HOURS / CALL ruled (1440x900)`,
        st.length === want.length && st.every((s, i) => s.id === want[i] && /^(Open now · until \d{1,2}(:\d\d)? [AP]M|Closed · opens \d{1,2}(:\d\d)? [AP]M (today|tomorrow))$/.test(s.status)
          && s.dot === (s.status.startsWith('Open') ? '1' : '0') && s.rows === 2 && s.today === 1 && s.labels === 'Address/Hours/Call'), JSON.stringify(st));
    }
    await ctx.close();
  }
  // the San Diego hero: store-sd-exterior, loaded, not AI, its big ORIGINALS sign (the photo's 59-74% x 30-52% box) whole
  // in frame and clear of the title's lines; the /jobs hero: one of the LA store's own photos
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    const ctx = await ctxFor(w, h); await age(ctx); const p = await ctx.newPage();
    await p.goto(origin + '/san-diego-store'); await sleep(900);
    const sd = await p.evaluate(() => {
      const hero = document.querySelector('[data-phero]'), im = hero.querySelector('.phero__clip img'), hb = hero.getBoundingClientRect(), ib = im.getBoundingClientRect();
      const [px, py] = getComputedStyle(im).objectPosition.split(' ').map((v) => parseFloat(v) / 100), s = Math.max(ib.width / im.naturalWidth, ib.height / im.naturalHeight);
      const rw = im.naturalWidth * s, rh = im.naturalHeight * s, ox = ib.left + (ib.width - rw) * px, oy = ib.top + (ib.height - rh) * py;
      const sign = { l: ox + .588 * rw, t: oy + .302 * rh, r: ox + .739 * rw, b: oy + .516 * rh };
      const rg = document.createRange(); rg.selectNodeContents(hero.querySelector('.phero__title'));
      const clear = [...rg.getClientRects()].every((q) => q.right <= sign.l || q.left >= sign.r || q.bottom <= sign.t || q.top >= sign.b);
      return { src: im.currentSrc.split('/').pop(), loaded: im.complete && im.naturalWidth > 0, ai: im.hasAttribute('data-ai'), inFrame: sign.l >= hb.left && sign.r <= hb.right && sign.t >= hb.top && sign.b <= hb.bottom, clear,
        sign: Object.fromEntries(Object.entries(sign).map(([k, v]) => [k, Math.round(v)])), hero: [Math.round(hb.width), Math.round(hb.height)] };
    });
    check(`info pages /san-diego-store: the hero is the business's own storefront photo (store-sd-exterior), loaded, not marked AI, its big ORIGINALS sign whole in frame and clear of the title (${w}x${h})`,
      /^store-sd-exterior-\d+\.webp$/.test(sd.src) && sd.loaded && !sd.ai && sd.inFrame && sd.clear, JSON.stringify(sd));
    if (w === 1440) {
      check('info pages /san-diego-store: the hero\'s CONFIRM note names the photo and no longer says the hero stays an illustration', /store-sd-exterior/.test(CF.sdPhoto) && !/stays an illustration/.test(CF.sdPhoto)
        && (await p.content()).includes('store-sd-exterior, a light grade'), CF.sdPhoto.slice(0, 160));
      await p.goto(origin + '/jobs'); await sleep(700);
      const jb = await p.evaluate(() => { const im = document.querySelector('[data-phero] .phero__clip img'); return { src: im.currentSrc.split('/').pop(), loaded: im.complete && im.naturalWidth > 0, ai: im.hasAttribute('data-ai'), filter: getComputedStyle(im).filter }; });
      check('info pages /jobs: the hero is a real LA store photo (not the AI warehouse), loaded, with the photo hero\'s dim (1440x900)',
        /^store-la-(wall|floor|letters-bw|interior)-\d+\.webp$/.test(jb.src) && jb.loaded && !jb.ai && /brightness\(0\.62\)/.test(jb.filter), JSON.stringify(jb));
    }
    await ctx.close();
  }
  // without JS: every page complete (one h1, every link and field), nothing left hidden by a reveal; a FAQ still opens;
  // the store facts show their fallback line
  {
    const ctx = await ctxFor(1440, 900, { javaScriptEnabled: false }); const p = await ctx.newPage(); const bad = [];
    for (const pg of PAGES) {
      await p.goto(origin + pg); await sleep(300);
      // a text line left faded or hidden: its own opacity times every ancestor's under .99
      const a = await inv(p), hidden = await p.evaluate(() => { const out = [], tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) { const el = n.parentElement; if (!n.textContent.trim() || !el.getClientRects().length || el.closest('[aria-hidden="true"], .sr-only, details:not([open]) > .faq__a')) continue;
          let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
          if (o < .99 || getComputedStyle(el).visibility === 'hidden') out.push(n.textContent.trim().slice(0, 20)); }
        return out.slice(0, 3); });
      if (a.h1.length !== 1 || missing(BEFORE[pg], a).length || !sameFields(BEFORE[pg], a) || hidden.length) bad.push({ pg, h1: a.h1, missing: missing(BEFORE[pg], a), hidden });
    }
    await p.goto(origin + '/faqs'); await p.click('.info-faqs .faq__item summary'); const open = await p.evaluate(() => document.querySelector('.info-faqs .faq__item').open);
    await p.goto(origin + '/contact'); const fb = await p.evaluate(() => [...document.querySelectorAll('main [data-status-for]')].map((e) => e.textContent.trim()));
    check('info pages without JS: every page complete (one h1, every link and field, nothing left hidden), a FAQ opens, the store facts show their fallback line (1440x900)',
      !bad.length && open && fb.length === 2 && fb.every((t) => t === 'See hours'), JSON.stringify({ bad, open, fb }));
    await ctx.close();
  }
}
await browser.close(); server.close();
const out = { at: new Date().toISOString(), build: path.relative(ROOT, DIR), pass: results.filter((r) => r.ok).length, total: results.length, results };
fs.writeFileSync(path.join(ROOT, 'audit/ui-test.json'), JSON.stringify(out, null, 2));
console.log(`\nUI: ${out.pass}/${out.total} PASS`);
process.exit(out.pass === out.total ? 0 : 1);
