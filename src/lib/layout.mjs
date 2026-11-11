// layout.mjs: the document shell every page shares (head, header + mega panels, drawer, footer, store dash, 21+ gate).
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

const preScript = `(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');try{var s=localStorage.getItem('og-store');if(s==='la'||s==='sd')h.setAttribute('data-store',s);var q=location.search.match(/[?&]store=(la|sd)/);if(q)h.setAttribute('data-store',q[1]);if(!localStorage.getItem('og-age'))h.classList.add('gate-pending')}catch(e){h.classList.add('gate-pending')}})(document);`;

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

function megaShop() {
  return h`<div class="mega" id="mega-shop" role="region" aria-label="Shop">
  <div class="mega__inner wrap">
    <div class="mega__col mega__col--stores">
      <p class="kicker">Shop a store</p>
      ${STORE_ORDER.map((id) => { const s = STORES[id]; return `<a class="mega__store" href="${esc(s.menu)}" target="_blank" rel="noopener" data-store-pick="${id}"><span class="mega__store-code">${s.code}</span><span><strong>${esc(s.name)}</strong><span class="mega__store-sub" data-hours-for="${id}">${esc(s.street)}</span></span>${icon('arrow-ne')}</a>`; })}
      <p class="mega__note">Every button opens the selected store's live menu with its cart.</p>
    </div>
    <div class="mega__col">
      <p class="kicker">Shop by category</p>
      <ul class="mega__cats">${CATEGORIES.map((c) => `<li><a href="${esc(catHref('la', c))}" target="_blank" rel="noopener" data-shop="${c.id}">${esc(c.label)}</a></li>`)}</ul>
    </div>
    <div class="mega__col">
      <p class="kicker">More ways in</p>
      <ul class="mega__list">
        <li>${link('/shop', 'All categories and brands')}</li>
        <li>${link('/brands', 'Shop by brand')}</li>
        <li>${link('/deals', 'Deals and happy hour')}</li>
        <li>${link('/strains', 'Strain library')}</li>
        <li>${link('/find-originals', 'Find Originals near you')}</li>
        <li>${link('/clothing', 'Originals Clothing')}</li>
      </ul>
    </div>
  </div>
</div>`;
}
function megaStores() {
  return h`<div class="mega" id="mega-stores" role="region" aria-label="Locations">
  <div class="mega__inner wrap mega__inner--stores">
    ${STORE_ORDER.map((id) => { const s = STORES[id]; return h`<div class="mega__loc">
      <p class="kicker">${esc(s.short)}</p>
      <p class="mega__loc-name">${link(s.page, esc(s.name))}</p>
      <p>${esc(s.street)}<br>${esc(s.city)}, ${s.region} ${s.postal}</p>
      <p>${s.hoursText.map(([d, t]) => `<span class="mega__hrs"><span>${d}</span> ${t}</span>`).join('')}</p>
      <p class="mega__loc-links"><a href="tel:${s.tel}">${esc(s.phone)}</a> ${link(s.maps, 'Directions')}</p>
    </div>`; })}
    <div class="mega__loc">
      <p class="kicker">Online</p>
      <p class="mega__loc-name">${link('/clothing', 'Originals Clothing')}</p>
      <p>Shop merch, open 24/7.</p>
      <p class="mega__loc-links">${link('/retail', 'All locations')}</p>
    </div>
  </div>
</div>`;
}
function megaCulture() {
  return h`<div class="mega" id="mega-culture" role="region" aria-label="Culture">
  <div class="mega__inner wrap mega__inner--culture">
    ${CULTURE_LINKS.map((l) => `<a class="mega__tile" href="${u(l.href)}"><strong>${esc(l.label)}</strong><span>${esc(l.note)}</span></a>`)}
  </div>
</div>`;
}

export function header(active = '') {
  return h`<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="site-header__bar wrap">
    <a class="brand" href="${u('/')}" aria-label="Originals home">${crownMark('brand__crown')}${wordmark('brand__word')}</a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav__list">
        ${NAV.map((n) => `<li class="nav__item${n.mega ? ' has-mega' : ''}"><a class="nav__link${active === n.href ? ' is-active' : ''}" href="${u(n.href)}"${active === n.href ? ' aria-current="page"' : ''}${n.mega ? ` data-mega="${n.mega}" aria-expanded="false" aria-controls="mega-${n.mega}"` : ''}>${esc(n.label)}</a></li>`)}
      </ul>
    </nav>
    <div class="site-header__actions">
      <button class="store-chip" type="button" data-store-toggle aria-label="Change store">
        <span class="store-chip__dot" data-status-dot></span>
        <span class="store-chip__name" data-store-name>${esc(STORES.la.short)}</span>
        ${icon('swap')}
      </button>
      <a class="btn btn--red btn--sm site-header__shop" href="${esc(STORES.la.menu)}" target="_blank" rel="noopener" data-shop="menu">Shop Now</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer" data-drawer-open><span></span><span></span><span></span></button>
    </div>
  </div>
  ${megaShop()}${megaStores()}${megaCulture()}
</header>`;
}

function drawer() {
  return h`<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="drawer__panel">
    <div class="drawer__top"><a class="brand" href="${u('/')}" aria-label="Originals home">${crownMark('brand__crown')}${wordmark('brand__word')}</a><button class="drawer__close" type="button" aria-label="Close menu" data-drawer-close>${icon('x')}</button></div>
    <div class="drawer__stores" role="group" aria-label="Choose your store">
      ${STORE_ORDER.map((id) => `<button type="button" class="seg" data-store-set="${id}" aria-pressed="false">${esc(STORES[id].short)}</button>`)}
    </div>
    <a class="btn btn--red drawer__shop" href="${esc(STORES.la.menu)}" target="_blank" rel="noopener" data-shop="menu">Shop <span data-store-name>${esc(STORES.la.short)}</span> menu ${icon('arrow-ne')}</a>
    <ul class="drawer__cats">${CATEGORIES.map((c) => `<li><a href="${esc(catHref('la', c))}" target="_blank" rel="noopener" data-shop="${c.id}">${esc(c.label)}</a></li>`)}</ul>
    <ul class="drawer__nav">
      ${NAV.map((n) => `<li><a href="${u(n.href)}">${esc(n.label)}</a></li>`)}
      ${CULTURE_LINKS.map((n) => `<li><a href="${u(n.href)}">${esc(n.label)}</a></li>`)}
      ${MORE_LINKS.map((n) => `<li><a href="${u(n.href)}">${esc(n.label)}</a></li>`)}
    </ul>
  </div>
</div>`;
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
      <button type="button" class="btn btn--red" data-gate="21">I'm 21 or older</button>
      <button type="button" class="btn btn--chrome" data-gate="med">I'm 18+ with a medical recommendation</button>
      <button type="button" class="btn btn--ghost" data-gate="no">Not yet</button>
    </div>
    <p class="gate__no" data-gate-no hidden>Come back when you're 21. The family will be here.</p>
    <p class="gate__fine">By entering you agree to our ${link('/terms-of-service', 'Terms of Service')} and ${link('/privacy-policy', 'Privacy Policy')}.</p>
  </div>
</div>`;
}

export function footer() {
  const col = (title, links) => h`<div class="foot__col"><p class="foot__title">${title}</p><ul>${links.map((l) => `<li>${link(l.href, esc(l.label))}</li>`)}</ul></div>`;
  return h`<footer class="site-footer" data-footer>
  ${paisleyDefs()}
  <div class="bandana-trim" aria-hidden="true"></div>
  <div class="foot__sign wrap">
    ${crownMark('foot__crown')}
    <p class="foot__creed" data-reveal>${SITE.creed.map((c, i) => `<span>${esc(c)}${i === SITE.creed.length - 1 ? '.' : ''}</span>${i < SITE.creed.length - 1 ? '<span class="foot__sep">–</span>' : ''}`).join('')}</p>
    <p class="foot__tags">${SITE.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
  </div>
  <div class="foot__grid wrap">
    <div class="foot__col foot__col--stores">
      <p class="foot__title">Locations</p>
      ${STORE_ORDER.map((id) => { const s = STORES[id]; return `<div class="foot__store">${link(s.page, '<strong>' + esc(s.name.toUpperCase()) + '</strong>')}<span>${esc(s.street)}, ${esc(s.city)}, ${s.region} ${s.postal}</span><a href="tel:${s.tel}">${esc(s.phone)}</a><span class="foot__hrs">${s.hoursText.map(([d, t]) => d + ' ' + t).join(' · ')}</span></div>`; }).join('')}
      <div class="foot__store">${link(LINKS.clothing, '<strong>ORIGINALS CLOTHING</strong>')}<span>Online, open 24/7</span></div>
    </div>
    ${col('Shop', [{ label: 'Shop', href: '/shop' }, { label: 'Deals', href: '/deals' }, { label: 'Brands', href: '/brands' }, { label: 'Strains', href: '/strains' }, { label: 'Rewards', href: '/rewards-program-and-opt-in' }, { label: 'Find Originals', href: '/find-originals' }])}
    ${col('Culture', [{ label: 'Our Story', href: '/our-story' }, { label: 'Events', href: '/events' }, { label: 'Collabs', href: '/collabs' }, { label: 'Media', href: '/media' }, { label: 'Drops', href: '/drops' }, { label: 'Cannablog', href: '/blog' }])}
    ${col('Links', [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }, { label: 'Wholesale', href: '/wholesale' }, { label: 'Jobs', href: '/jobs' }, { label: 'FAQs', href: '/faqs' }, { label: 'Weedmaps', href: STORES.la.weedmaps }, { label: 'Leafly', href: 'https://www.leafly.com/dispensary-info/kvclosangeles' }])}
    ${col('Legal', LEGAL_LINKS)}
  </div>
  <div class="foot__social wrap">
    ${SOCIAL.map((s) => `<a class="foot__soc" href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon)}<span>${esc(s.short)}</span></a>`)}
  </div>
  <div class="foot__legal wrap">
    <p class="foot__p65">${confirm('Prop 65 wording: the live /prop-65-warning page says only "Need info"; confirm this California warning text with compliance counsel.')}<span class="foot__p65-icon" aria-hidden="true">⚠</span>${esc(PROP65)}</p>
    <p class="foot__age"><strong>21+</strong> only, or 18+ with a valid medical recommendation. Keep cannabis out of reach of children and pets. Do not drive or operate machinery after use.</p>
    <p class="foot__copy">${esc(SITE.copyright)}</p>
    <p class="foot__preview">${PREVIEW ? 'Redesign preview for Originals, not the live site. Menu and cart buttons open the live Originals store menus. ' : ''}Some scene photography on this site is AI-generated illustration; store, product and event photos are Originals' own.</p>
  </div>
  <div class="foot__word" aria-hidden="true" data-reveal>${wordmark('foot__wordmark')}</div>
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
${header(active)}
<main id="main" tabindex="-1">
${main}
</main>
${footer()}
${dash()}
${drawer()}
${gate()}
<script type="application/json" id="og-data">${data}</script>
<script src="${a('js/site.js')}?v=${VERSION}" defer></script>
</body>
</html>
`;
}
