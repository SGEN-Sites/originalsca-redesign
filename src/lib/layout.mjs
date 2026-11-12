// layout.mjs: the document shell every page shares (head, header (the shop bar and its More panel), footer, store dash, 21+ gate).
import { h, esc, u, a, attrs, link, confirm } from './html.mjs';
import { SITE, STORES, STORE_ORDER, NAV, CULTURE_LINKS, MORE_LINKS, LEGAL_LINKS, SOCIAL, LINKS, PROP65, CATEGORIES, catHref, CONFIRM } from '../content/site.mjs';
import { icon, wordmark, crownMark, paisleyDefs } from './parts.mjs';

let PREVIEW = false;
let VERSION = String(Date.now());
export function setPreview(v) { PREVIEW = !!v; }
export function setVersion(v) { VERSION = v; }
// absolute origin for share cards (Open Graph and Twitter need absolute image URLs): the production site by
// default, the Pages host for the preview build (src/build.mjs --origin)
let ORIGIN = null;
export function setOrigin(o) { ORIGIN = o || null; }

// data the script reads (no URL is hard-coded in site.js; everything comes from here)
function siteData() {
  const stores = {};
  for (const id of STORE_ORDER) {
    const s = STORES[id];
    stores[id] = {
      id, name: s.name, short: s.short, code: s.code, phone: s.phone, tel: s.tel, maps: s.maps, menu: s.menu, page: u(s.page),
      address: s.street + ', ' + s.city + ', ' + s.region + ' ' + s.postal, hours: s.hours, deals: s.deals,
      cats: Object.fromEntries(CATEGORIES.map((c) => [c.id, catHref(id, c)])),
    };
  }
  return { stores, order: STORE_ORDER, tz: 'America/Los_Angeles' };
}

const preScript = `(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');try{var ac=location.search.match(/[?&]accent=(red|mono)(?:&|$)/);if(ac)sessionStorage.setItem('og-accent',ac[1]);if(sessionStorage.getItem('og-accent')==='red')h.setAttribute('data-accent','red')}catch(e){}try{var s=localStorage.getItem('og-store');if(s==='la'||s==='sd')h.setAttribute('data-store',s);var q=location.search.match(/[?&]store=(la|sd)/);if(q)h.setAttribute('data-store',q[1]);if(!localStorage.getItem('og-age'))h.classList.add('gate-pending')}catch(e){h.classList.add('gate-pending')}})(document);`;

export function head({ title, description, path, canonical, ogImage, jsonld = [], preload = [], extraHead = '' }) {
  const canon = canonical || (SITE.origin + (path === '/' ? '/' : path));
  const og0 = ogImage || a('img/og-default.webp');
  const og = /^https?:/.test(og0) ? og0 : (ORIGIN || SITE.origin) + og0;
  return h`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canon)}">
${PREVIEW ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta name="theme-color" content="#0a0a0b">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Originals">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canon)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(og)}">
<link rel="icon" href="${a('brand/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${a('fonts/league-gothic-normal-400.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${a('fonts/source-sans-3-normal-400-700.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${a('fonts/barlow-condensed-normal-700.woff2')}" as="font" type="font/woff2" crossorigin>
${preload.map((p) => `<link rel="preload" href="${esc(p.href)}" as="${p.as}"${p.type ? ` type="${p.type}"` : ''}${p.media ? ` media="${p.media}"` : ''}${p.fetchpriority ? ` fetchpriority="${p.fetchpriority}"` : ''}>`)}
<link rel="stylesheet" href="${a('css/site.css')}?v=${VERSION}">
<script>${preScript}</script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)}
${extraHead}
</head>`;
}

// ---- header: the shop bar (the owner's pick, "Nav 4: Shop bar", with the crown alone as the logo) ---------------------
// One bar: the crown, the category quick links (each opens the selected store's menu: the HTML carries Los Angeles and
// site.js swaps the hrefs), Deals, the LA | SD switch with what you are shopping and today's status, Shop Now, and More.
// Below 1280px the categories drop to a second row. More opens one flat panel with every other destination the site
// has. Every label and link comes from content/site.mjs. Styles: nav.css (nx- classes); behaviour: site.js "header".
const BAR_CATS = ['flower', 'preroll', 'cartridge', 'extract', 'edible', 'beverage']; // the other categories sit under More

export function header({ active = '', path = '' } = {}) {
  const deals = NAV.find((n) => n.href === '/deals');
  const locations = NAV.find((n) => n.mega === 'stores'); // its label heads the Locations column; its page is "All locations"
  const culture = NAV.find((n) => n.mega === 'culture'); // its label heads the Culture column
  const big = NAV.filter((n) => n !== deals && n !== locations && n !== culture); // Shop, Brands, Strains, Our Story
  const clothing = MORE_LINKS.find((l) => l.href === '/clothing'); // listed under Locations, so not again under More
  const more = MORE_LINKS.filter((l) => l !== clothing);
  const barCats = CATEGORIES.filter((c) => BAR_CATS.includes(c.id));
  const panelCats = CATEGORIES.filter((c) => !BAR_CATS.includes(c.id));
  // aria-current="page": the nav link to this page; when the nav has none, the link to its section (page.active)
  const own = [deals, ...big, ...STORE_ORDER.map((id) => ({ href: STORES[id].page })), clothing, locations, ...CULTURE_LINKS, ...more].map((l) => l.href);
  const current = own.includes(path) ? path : own.includes(active) ? active : '';
  const go = (href, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${u(href)}"${href === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const shop = (c, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(catHref('la', c))}" target="_blank" rel="noopener" data-shop="${c.id}">${esc(c.label)}</a>`;
  const hrs = (s) => esc(s.hoursText[0].join(' ')); // shown until site.js writes the live status
  const la = STORES.la;
  const named = (tag = 'span') => `<${tag} class="nx-flashname" data-store-name>${esc(la.short)}</${tag}>`;
  return h`<a class="skip" href="#main">Skip to content</a>
<header class="nx" id="nx">
  <nav class="nx-nav" aria-label="Main">
    <div class="nx-bar">
      <a class="brand" href="${u('/')}" aria-label="Originals home">${crownMark('brand__crown')}</a>
      <div class="nx-cats" id="nx-cats">
        <p class="nx-cats__label"><span>Shopping</span> ${named('strong')}</p>
        <ul class="nx-cats__list" aria-label="Shop by category">
          ${barCats.map((c, i) => `<li style="--i:${i}">${shop(c, 'nx-cat')}</li>`)}
          <li class="nx-cats__deals" style="--i:${barCats.length}">${go(deals.href, deals.label, 'nx-cat')}</li>
        </ul>
      </div>
      <div class="nx-store">
        <div class="nx-switch" role="group" aria-label="Your store">
          ${STORE_ORDER.map((id) => `<button type="button" class="nx-seg" data-store-set="${id}" aria-pressed="${id === 'la'}">${STORES[id].code}<span class="sr-only"> ${esc(STORES[id].short)}</span><span class="nx-dot" data-status-dot="${id}" aria-hidden="true"></span></button>`)}
        </div>
        <p class="nx-store__text">
          <span><span class="nx-store__k">Shopping</span> ${named()}</span>
          <span class="nx-store__st"><span class="nx-dot" data-status-dot aria-hidden="true"></span>${STORE_ORDER.map((id) => `<span class="nx-st nx-st--${id}" data-status-for="${id}">${hrs(STORES[id])}</span>`)}</span>
        </p>
      </div>
      <a class="btn btn--accent btn--sm nx-now" href="${esc(la.menu)}" target="_blank" rel="noopener" data-shop="menu"><span>Shop Now</span>${icon('arrow-ne')}</a>
      <button type="button" class="nx-more" id="nx-more-btn" aria-expanded="false" aria-controls="nx-more"><span class="nx-more__label">More</span><span class="nx-more__icon" aria-hidden="true"></span></button>
    </div>
    <div class="nx-scrim" hidden></div>
    <div class="nx-panel" id="nx-more" role="region" aria-label="More" hidden>
      <div class="nx-panel__in">
        <div class="nx-col nx-col--big" style="--i:0">
          <ul class="nx-big">${big.map((n) => `<li>${go(n.href, n.label)}</li>`)}</ul>
        </div>
        <div class="nx-col nx-col--loc" style="--i:1">
          <p class="kicker nx-k" id="nx-k-loc">${esc(locations.label)}</p>
          ${STORE_ORDER.map((id) => { const s = STORES[id]; return h`<div class="nx-loc nx-loc--${id}">
            <p class="nx-loc__name">${go(s.page, s.name)}<span class="nx-tag">Your store</span></p>
            <p class="nx-loc__addr">${esc(s.street)}, ${esc(s.city)}, ${s.region} ${s.postal}</p>
            <p class="nx-loc__st"><span class="nx-dot" data-status-dot="${id}" aria-hidden="true"></span><span data-status-for="${id}">${hrs(s)}</span></p>
          </div>`; })}
          <ul class="nx-links nx-links--row" aria-labelledby="nx-k-loc">
            <li>${go(clothing.href, SITE.name + ' ' + clothing.label)}</li>
            <li>${go(locations.href, 'All locations')}</li>
          </ul>
        </div>
        <div class="nx-col nx-col--culture" style="--i:2">
          <p class="kicker nx-k" id="nx-k-cul">${esc(culture.label)}</p>
          <ul class="nx-links" aria-labelledby="nx-k-cul">${CULTURE_LINKS.map((l) => `<li>${go(l.href, l.label)}</li>`)}</ul>
        </div>
        <div class="nx-col nx-col--more" style="--i:3">
          <p class="kicker nx-k" id="nx-k-more">More</p>
          <ul class="nx-links" aria-labelledby="nx-k-more">${more.map((l) => `<li>${go(l.href, l.label)}</li>`)}</ul>
        </div>
        <div class="nx-col nx-col--shop" style="--i:4">
          <p class="kicker nx-k" id="nx-k-shop">Shopping ${named()}</p>
          <ul class="nx-links" aria-labelledby="nx-k-shop">${panelCats.map((c) => `<li>${shop(c)}</li>`)}</ul>
        </div>
      </div>
      <div class="nx-foot">
        <p class="nx-today"><span class="kicker nx-k">Your store</span><span class="nx-today__st"><span class="nx-dot" data-status-dot aria-hidden="true"></span><span data-today>${esc(la.short)} · ${hrs(la)}</span></span></p>
        <div class="nx-acts">
          <a class="btn btn--ghost btn--sm nx-act" href="tel:${la.tel}" data-store-tel>${icon('phone')}<span>Call</span></a>
          <a class="btn btn--ghost btn--sm nx-act" href="${esc(la.maps)}" target="_blank" rel="noopener" data-store-maps>${icon('pin')}<span>Directions</span></a>
        </div>
      </div>
    </div>
  </nav>
  <p class="sr-only" id="nx-live" aria-live="polite"></p>
</header>`;
}

// sticky store dash: store switch, Shop Now, Call, Directions, today's hours (whichever store is selected)
function dash() {
  const s = STORES.la;
  return h`<div class="dash" data-dash aria-label="Store quick actions" role="region">
  <div class="dash__inner">
    <div class="dash__store" role="group" aria-label="Choose your store">
      ${STORE_ORDER.map((id) => `<button type="button" class="dash__seg" data-store-set="${id}" aria-pressed="${id === 'la'}">${STORES[id].code}</button>`)}
    </div>
    <p class="dash__hours"><span class="dash__dot" data-status-dot></span><span data-today>${esc(s.hoursText[0][0] + ' ' + s.hoursText[0][1])}</span></p>
    <a class="dash__btn dash__btn--call" href="tel:${s.tel}" data-store-tel>${icon('phone')}<span>Call</span></a>
    <a class="dash__btn dash__btn--maps" href="${esc(s.maps)}" target="_blank" rel="noopener" data-store-maps>${icon('pin')}<span>Directions</span></a>
    <a class="dash__btn dash__btn--shop" href="${esc(s.menu)}" target="_blank" rel="noopener" data-shop="menu">${icon('bag')}<span>Shop Now</span></a>
  </div>
</div>`;
}

// 21+ gate, with the 18+ medical recommendation option the live menu allows (Tymber: minimum 21 recreational, 18 medical)
function gate() {
  return h`<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title" aria-describedby="gate-copy" hidden>
  <div class="gate__stage" aria-hidden="true"><div class="gate__beam gate__beam--l"></div><div class="gate__beam gate__beam--r"></div></div>
  <div class="gate__card">
    ${crownMark('gate__crown')}
    <p class="kicker">Welcome to the family</p>
    <h2 class="gate__title" id="gate-title"><span class="chrome-word">Originals</span></h2>
    <p class="gate__copy" id="gate-copy">You must be 21 or older to enter, or 18 or older with a valid medical recommendation.</p>
    <div class="gate__actions">
      <button type="button" class="btn btn--accent" data-gate="21">I'm 21 or older</button>
      <button type="button" class="btn btn--chrome" data-gate="med">I'm 18+ with a medical recommendation</button>
      <button type="button" class="btn btn--ghost" data-gate="no">Not yet</button>
    </div>
    <p class="gate__no" data-gate-no hidden>Come back when you're 21. The family will be here.</p>
    <p class="gate__fine">By entering you agree to our ${link('/terms-of-service', 'Terms of Service')} and ${link('/privacy-policy', 'Privacy Policy')}.</p>
  </div>
</div>`;
}

// the site footer (owner 2026-11-12: the section lab's option C, "Editorial", with no creed: "I don't think we need the
// creed at all"). A strict twelve-column grid from 720px: the hashtags and the social handles as one row, the stores as
// a three-line directory on the four group columns, the link groups as columns between hairlines, the legal notes set
// small in two columns, and the brand's own ORIGINALS wordmark across the bottom. Phones: one column, the link groups an
// accordion (real details/summary, open in the markup so nothing is hidden without JavaScript; the footer's own script
// closes them on phones and keeps them open as plain labels on wider screens). The blocks take the site's reveal and
// their rules draw in. site.js inerts .site-footer while the More panel is open; tools/lab.mjs reads class="site-footer".
// Styles: chrome.css (footer).
export function footer() {
  const group = (title, links) => h`<div class="foot__g"><details class="foot__grp" open><summary><h2 class="foot__h">${title}</h2></summary><ul class="foot__links">${links.map((l) => `<li>${link(l.href, esc(l.label))}</li>`)}</ul></details></div>`;
  const hours = (s) => s.hoursText.map(([d, t]) => `<span class="foot__keep">${esc(d + ' ' + t)}</span>`).join(' · ');   // a time never breaks at its dash
  return h`<footer class="site-footer" data-footer>
  ${paisleyDefs()}
  <div class="bandana-trim" aria-hidden="true"></div>
  <div class="foot wrap">
    <div class="foot__sig" data-reveal>
      <p class="foot__tags">${SITE.tags.map((t) => `<span>${esc(t)}</span>`).join(' ')}</p>
      <ul class="foot__social">${SOCIAL.map((s) => `<li><a href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon, 'foot__ico')}<span>${esc(s.short)}</span></a></li>`)}</ul>
    </div>
    <div class="foot__loc foot__ruled" data-reveal>
      <h2 class="foot__h">Locations</h2>
      <div class="foot__stores">
        ${STORE_ORDER.map((id) => { const s = STORES[id]; return `<div class="foot__store">${link(s.page, '<strong>' + esc(s.name.toUpperCase()) + '</strong>', { class: 'foot__name' })}<span class="foot__addr">${esc(s.street)}, ${esc(s.city)}, ${s.region} ${s.postal}</span><a class="foot__tel" href="tel:${s.tel}">${esc(s.phone)}</a><span class="foot__hrs">${hours(s)}</span></div>`; }).join('')}
        <div class="foot__store">${link(LINKS.clothing, '<strong>ORIGINALS CLOTHING</strong>', { class: 'foot__name' })}<span class="foot__addr">Online, open 24/7</span></div>
      </div>
    </div>
    <div class="foot__cols foot__ruled" data-reveal>
      ${group('Shop', [{ label: 'Shop', href: '/shop' }, { label: 'Deals', href: '/deals' }, { label: 'Brands', href: '/brands' }, { label: 'Strains', href: '/strains' }, { label: 'Rewards', href: '/rewards-program-and-opt-in' }, { label: 'Find Originals', href: '/find-originals' }])}
      ${group('Culture', [{ label: 'Our Story', href: '/our-story' }, { label: 'Events', href: '/events' }, { label: 'Collabs', href: '/collabs' }, { label: 'Media', href: '/media' }, { label: 'Drops', href: '/drops' }, { label: 'Cannablog', href: '/blog' }])}
      ${group('Links', [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }, { label: 'Wholesale', href: '/wholesale' }, { label: 'Jobs', href: '/jobs' }, { label: 'FAQs', href: '/faqs' }, { label: 'Weedmaps', href: STORES.la.weedmaps }, { label: 'Leafly', href: 'https://www.leafly.com/dispensary-info/kvclosangeles' }])}
      ${group('Legal', LEGAL_LINKS)}
    </div>
    <div class="foot__legal foot__ruled" data-reveal>
      <p class="foot__p65">${confirm('Prop 65 wording: the live /prop-65-warning page says only "Need info"; confirm this California warning text with compliance counsel.')}<span class="foot__p65-icon" aria-hidden="true">⚠</span>${esc(PROP65)}</p>
      <div class="foot__fine">
        <p class="foot__age"><strong>21+</strong> only, or 18+ with a valid medical recommendation. Keep cannabis out of reach of children and pets. Do not drive or operate machinery after use.</p>
        <p class="foot__copy">${esc(SITE.copyright)}</p>
        <p class="foot__preview">${PREVIEW ? 'Redesign preview for Originals, not the live site. Menu and cart buttons open the live Originals store menus. ' : ''}Some scene photography on this site is AI-generated illustration; store, product and event photos are Originals' own.</p>
      </div>
    </div>
    <div class="foot__word" aria-hidden="true" data-reveal>${wordmark('foot__wordmark')}</div>
  </div>
  <script>(function(){try{var f=document.currentScript&&document.currentScript.parentElement;if(!f||!window.matchMedia)return;var mq=matchMedia('(max-width: 719.98px)'),ds=[].slice.call(f.querySelectorAll('details.foot__grp'));var sync=function(){ds.forEach(function(d){var s=d.querySelector('summary');d.open=!mq.matches;if(mq.matches)s.removeAttribute('tabindex');else s.setAttribute('tabindex','-1');});};ds.forEach(function(d){d.querySelector('summary').addEventListener('click',function(e){if(!mq.matches)e.preventDefault();});});sync();if(mq.addEventListener)mq.addEventListener('change',sync);else if(mq.addListener)mq.addListener(sync);}catch(e){}})();</script>
</footer>`;
}

export function page({ path, title, description, canonical, ogImage, jsonld, preload, bodyClass = '', main, active, extraHead }) {
  const data = JSON.stringify(siteData()).replace(/</g, '\\u003c');
  return '<!doctype html>\n<html lang="en" class="no-js" data-store="la">\n' +
    head({ title, description, path, canonical, ogImage, jsonld, preload, extraHead }) + '\n' +
    h`<body class="${bodyClass}">
${confirm(CONFIRM.mirasol)}
${confirm(CONFIRM.massachusetts)}
${confirm(CONFIRM.sdMenu)}
${confirm(CONFIRM.laHours)}
${confirm(CONFIRM.accent)}
${header({ active, path })}
<main id="main" tabindex="-1">
${main}
</main>
${footer()}
${dash()}
${gate()}
<script type="application/json" id="og-data">${data}</script>
<script src="${a('js/site.js')}?v=${VERSION}" defer></script>
</body>
</html>
`;
}
