// parts.mjs: shared components. Lanes and pages compose these; nobody restyles them at a call site.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { h, esc, u, a, attrs, link, confirm, slugify } from './html.mjs';
import { STORES, STORE_ORDER, CATEGORIES, catHref, SITE } from '../content/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LETTERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/brand/originals-letters.json'), 'utf8'));
const IMAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/images.json'), 'utf8'));

// ---- icons (hand-drawn 24px line icons, currentColor) ---------------------------------------
const I = {
  'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-ne': '<path d="M7 17L17 7M9 7h8v8"/>',
  'phone': '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  'pin': '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  'bag': '<path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  'swap': '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  'x': '<path d="M6 6l12 12M18 6L6 18"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'play': '<path d="M8 5l11 7-11 7z"/>',
  'pause': '<path d="M8 5v14M16 5v14"/>',
  'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  'chev': '<path d="M6 9l6 6 6-6"/>',
  'ig': '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".9" fill="currentColor"/>',
  'fb': '<path d="M14 8h3V4.5h-3a4 4 0 0 0-4 4V11H7.5v3.5H10V20h3.5v-5.5h3l.5-3.5h-3.5V8.8c0-.5.3-.8.5-.8z"/>',
  'wm': '<path d="M4 7l3 10 2.5-7 2.5 7 2.5-7L17 17l3-10"/>',
  'lf': '<path d="M12 20c0-6 0-10 6-14-6 0-10 3-10 8 0 2 1 4 4 6z"/><path d="M12 20c-3-2-6-3-8-3"/>',
  'crown': '<path d="M4 17l1.5-8 4 4L12 6l2.5 7 4-4L20 17z"/><path d="M5 20h14"/>',
  'mail': '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
};
export const icon = (n, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[n] || ''}</svg>`;

// ---- brand marks (traced from the client's own lockup: tools/trace-logo.py) --------------------
const [wx, wy, ww, wh] = LETTERS.wordBox;
export function wordmark(cls = '') {
  return `<svg class="wordmark ${cls}" viewBox="${wx - 4} ${wy - 4} ${ww + 8} ${wh + 8}" aria-hidden="true" focusable="false"><g fill="currentColor">${LETTERS.letters.map((l) => `<path d="${l.d}"/>`).join('')}</g></svg>`;
}
const [cx, cy, cw, ch] = LETTERS.crown.bbox;
export function crownMark(cls = '') {
  return `<svg class="crown ${cls}" viewBox="${cx - 4} ${cy - 4} ${cw + 8} ${ch + 8}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${LETTERS.crown.d}"/></svg>`;
}
export function brandSymbols() {
  // one copy of every letter path, referenced by the 3D letters and the reflections (<use href="#ltr-n">)
  return `<svg class="sr-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>
<linearGradient id="chrome-face" x1="0" y1="0" x2="0" y2="1"><stop class="cs1" offset="0"/><stop class="cs2" offset=".2"/><stop class="cs3" offset=".44"/><stop class="cs4" offset=".5"/><stop class="cs5" offset=".57"/><stop class="cs6" offset=".75"/><stop class="cs7" offset="1"/></linearGradient>
<linearGradient id="chrome-shine" x1="0" y1="0" x2="1" y2=".35"><stop class="sh0" offset="0"/><stop class="sh1" offset=".45"/><stop class="sh2" offset=".5"/><stop class="sh1" offset=".55"/><stop class="sh0" offset="1"/></linearGradient>
<linearGradient id="chrome-plate" x1="0" y1="0" x2="0" y2="1"><stop class="pl1" offset="0"/><stop class="pl2" offset="1"/></linearGradient>
${LETTERS.letters.map((l, i) => `<path id="ltr-${i}" d="${l.d}"/>`).join('')}
</defs></svg>`;
}

// ---- 3D chrome letters (the hero): stacked plates per letter, chrome face, floor reflection ----------
export function letters3d({ plates = 9, cls = '' } = {}) {
  const pct = (v, o, s) => (((v - o) / s) * 100).toFixed(3) + '%';
  const letter = (l, i, withPlates) => {
    const [x, y, w, hh] = l.bbox;
    const vb = `${x} ${y} ${w} ${hh}`;
    const style = `left:${pct(x, wx, ww)};top:${pct(y, wy, wh)};width:${((w / ww) * 100).toFixed(3)}%;height:${((hh / wh) * 100).toFixed(3)}%;--i:${i}`;
    const pl = withPlates ? Array.from({ length: plates }, (_, k) => `<svg class="ltr__plate" style="--z:${plates - k}" viewBox="${vb}" preserveAspectRatio="none" focusable="false"><use href="#ltr-${i}"/></svg>`).join('') : '';
    return `<span class="ltr" style="${style}" data-ltr="${i}">${pl}<svg class="ltr__face" viewBox="${vb}" preserveAspectRatio="none" focusable="false"><use href="#ltr-${i}" fill="url(#chrome-face)"/><use class="ltr__shine" href="#ltr-${i}" fill="url(#chrome-shine)"/></svg></span>`;
  };
  return h`<div class="ltr3d ${cls}" data-letters aria-hidden="true" style="--ar:${ww}/${wh}">
  <div class="ltr3d__rig">
    <div class="ltr3d__word">${LETTERS.letters.map((l, i) => letter(l, i, true))}</div>
    <div class="ltr3d__reflect">${LETTERS.letters.map((l, i) => letter(l, i, false))}</div>
  </div>
</div>`;
}

// ---- images -------------------------------------------------------------------------------
export function img(id, { sizes = '100vw', cls = '', alt, eager = false, priority = false, style = '', decorative = false } = {}) {
  const r = IMAGES[id];
  if (!r) throw new Error('unknown image ' + id);
  const files = [...r.files].sort((x, y) => x.w - y.w);
  const big = files[files.length - 1];
  const srcset = files.map((f) => `${a(f.file)} ${f.w}w`).join(', ');
  return '<img' + attrs({
    src: a(files[Math.min(files.length - 1, files.length > 1 ? files.length - 2 : 0)].file),
    srcset, sizes, width: big.w, height: big.h,
    alt: decorative ? '' : (alt ?? r.alt), class: cls || false, style: style || false,
    loading: eager ? 'eager' : 'lazy', decoding: eager ? 'sync' : 'async', fetchpriority: priority ? 'high' : false,
    'data-ai': r.ai ? 'generated' : false,
  }) + '>';
}
export const imgFile = (id, w) => { const f = [...IMAGES[id].files].sort((x, y) => Math.abs(x.w - w) - Math.abs(y.w - w))[0]; return a(f.file); };
export const isAI = (id) => !!(IMAGES[id] && IMAGES[id].ai);

// ---- type ---------------------------------------------------------------------------------
export const kicker = (t, cls = '') => `<p class="kicker${cls ? ' ' + cls : ''}">${t}</p>`;
export const chrome = (t, tag = 'span', cls = '') => `<${tag} class="chrome-word${cls ? ' ' + cls : ''}">${t}</${tag}>`;

// ---- buttons --------------------------------------------------------------------------------
export function btn(label, href, { kind = 'red', size = '', shop = null, ext = null, cls = '', attrs: extra = {} } = {}) {
  const external = ext ?? /^https?:/.test(href);
  const arrow = external ? icon('arrow-ne') : icon('arrow');
  return '<a' + attrs({ class: ['btn', 'btn--' + kind, size ? 'btn--' + size : '', cls].filter(Boolean).join(' '), href: u(href), ...(external ? { target: '_blank', rel: 'noopener' } : {}), 'data-shop': shop || false, 'data-magnetic': true, ...extra }) + `><span>${label}</span>${arrow}</a>`;
}
// a shop button that follows the selected store (LA href in the HTML, swapped by site.js)
export const shopBtn = (label = 'Shop Now', opt = {}) => btn(label, STORES.la.menu, { shop: 'menu', ...opt });

// ---- the store switch (segmented) --------------------------------------------------------------
export function storeSwitch(cls = '') {
  return `<div class="store-switch ${cls}" role="group" aria-label="Choose your store">${STORE_ORDER.map((id) => `<button type="button" class="store-switch__btn" data-store-set="${id}" aria-pressed="${id === 'la'}"><span class="store-switch__code">${STORES[id].code}</span><span class="store-switch__name">${esc(STORES[id].short)}</span></button>`).join('')}</div>`;
}

// ---- category badges -------------------------------------------------------------------------
// store: null = follows the selected store (site.js swaps hrefs); 'la' | 'sd' = fixed to that store's menu
export function categoryGrid({ cls = '', note = true, store = null } = {}) {
  const sid = store || 'la';
  return h`<ul class="cats ${cls}" role="list">
${CATEGORIES.map((c, i) => h`<li class="cat" data-reveal style="--i:${i % 3}">
  <a class="cat__link" href="${esc(catHref(sid, c))}" target="_blank" rel="noopener"${store ? '' : ` data-shop="${c.id}"`} data-tilt>
    <span class="cat__media">${c.img === 'merch' ? img('backdrop', { sizes: '(min-width: 1100px) 260px, 45vw', alt: '' }) : img(c.img, { sizes: '(min-width: 1100px) 260px, 45vw', alt: '' })}</span>
    <span class="cat__name">${esc(c.label)}</span>
    <span class="cat__go">${store ? esc(STORES[store].short) : `<span data-store-name>${esc(STORES.la.short)}</span>`} menu ${icon('arrow-ne')}</span>
  </a>
</li>`)}
</ul>${note ? `<p class="cats__note">${store ? `Each tile opens that category on ${esc(STORES[store].menuLabel)}, with its cart.${store === 'sd' ? ' The San Diego menu has no drinks, tinctures, topicals or merch shelf, so those tiles open the full San Diego menu.' : ''}` : 'Each tile opens that category on the selected store\'s live menu, with its cart. The San Diego menu has no drinks, tinctures, topicals or merch shelf, so in San Diego those tiles open the full menu.'}</p>` : ''}`;
}

// ---- category wall (home; owner requests 2026-11-12, from the owner's reference; it replaces the 2026-11-11 fan, kept
// in private/retired/2026-11-12-category-fan/): the categories as a bento box of photo cards packed close, three
// interlocking columns (home.css "category wall" sets each card's height by its place: tall, square or short). Each card
// is one link to that category on the selected store's menu (data-shop: site.js swaps the href and the store name). On
// hover or keyboard focus the card grows a little and the other cards dim. The wall's order follows the menu's except
// that Drinks comes before Edibles, so the can (a tall product) gets a tall card and the edibles a short one.
const WALL_ORDER = ['flower', 'preroll', 'cartridge', 'extract', 'beverage', 'edible', 'tincture', 'topical', 'merch'];
export function categoryWall() {
  const sizes = '(min-width: 1180px) 330px, (min-width: 600px) 31vw, 46vw';
  const cats = [...CATEGORIES].sort((x, y) => WALL_ORDER.indexOf(x.id) - WALL_ORDER.indexOf(y.id));
  if (cats.some((c) => !WALL_ORDER.includes(c.id))) throw new Error('categoryWall: a category is missing from WALL_ORDER');
  return h`<div class="cwall-box"><ul class="cwall" role="list">
${cats.map((c, i) => { const n = String(i + 1).padStart(2, '0'); return h`<li class="cwall__item">
  <a class="cwall__card" href="${esc(catHref('la', c))}" target="_blank" rel="noopener" data-shop="${c.id}">
    <span class="cwall__photo">${img(c.img, { sizes, alt: '' })}</span>
    <span class="cwall__shade" aria-hidden="true"></span>
    <span class="cwall__no" aria-hidden="true">${n}</span>
    <span class="cwall__body"><span class="cwall__name">${esc(c.label)}</span><span class="cwall__desc">${esc(c.blurb || '')}</span><span class="cwall__cta btn btn--accent btn--sm"><span>Shop Now</span>${icon('arrow-ne')}</span></span>
    <span class="sr-only"> (opens in a new tab)</span>
  </a>
</li>`; })}
</ul></div>`;
}

// ---- store card -------------------------------------------------------------------------------
export function storeCard(id, { photo = null, headingTag = 'h3', cls = '' } = {}) {
  const s = STORES[id];
  return h`<article class="store-card ${cls}" data-store-card="${id}">
  ${photo ? `<div class="store-card__media">${photo}</div>` : ''}
  <div class="store-card__body">
    <p class="kicker">${esc(s.short)}</p>
    <${headingTag} class="store-card__name">${link(s.page, esc(s.name))}</${headingTag}>
    <p class="store-card__status"><span class="dash__dot" data-status-dot="${id}"></span><span data-status-for="${id}">Hours below</span></p>
    <address class="store-card__addr">${esc(s.street)}<br>${esc(s.city)}, ${s.region} ${s.postal}</address>
    <p class="store-card__phone"><a href="tel:${s.tel}">${esc(s.phone)}</a></p>
    <dl class="store-card__hours">${s.hoursText.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join('')}</dl>
    ${s.attributes.length ? `<p class="store-card__attrs">${s.attributes.map((t) => (t.confirm ? confirm(t.note) : '') + `<span class="chip">${esc(t.text)}</span>`).join('')}</p>` : ''}
    <p class="store-card__actions">${btn('Shop ' + s.short, s.menu, { size: 'sm' })}${btn('Directions', s.maps, { kind: 'ghost', size: 'sm' })}</p>
  </div>
</article>`;
}

// ---- deal plaque (a lowrider car-club plaque: chain-link rim, chrome) ----------------------------
export function plaque({ big, small = '', title, body = '', href = null, cta = 'Shop the deal', store = null, extra = '' }) {
  return h`<article class="plaque" data-reveal data-tilt>
  <div class="plaque__chain" aria-hidden="true"></div>
  <div class="plaque__face">
    ${store ? `<p class="plaque__store">${esc(store)}</p>` : ''}
    <p class="plaque__big">${big}</p>
    ${small ? `<p class="plaque__small">${small}</p>` : ''}
    <h3 class="plaque__title">${title}</h3>
    ${body ? `<p class="plaque__body">${body}</p>` : ''}
    ${extra}
    ${href ? btn(cta, href, { size: 'sm', kind: 'chrome' }) : ''}
  </div>
</article>`;
}

// ---- inner page hero (one shared hero with variants) -------------------------------------------
export function pageHero({ kicker: k, title, lede = '', crumbs = [], media = null, video = null, variant = 'ink', actions = '', cls = '' }) {
  return h`<section class="phero phero--${variant} ${cls}" data-phero>
  <div class="phero__clip" aria-hidden="true">${media || ''}${video || ''}<div class="phero__scrim"></div><div class="grain"></div></div>
  <div class="phero__inner wrap">
    ${crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${[{ label: 'Home', href: '/' }, ...crumbs].map((c, i, arr) => `<li>${i < arr.length - 1 || c.current === false ? link(c.href, esc(c.label)) : `<span aria-current="page">${esc(c.label)}</span>`}</li>`).join('')}</ol></nav>` : ''}
    ${k ? kicker(k) : ''}
    <h1 class="phero__title">${title}</h1>
    ${lede ? `<div class="phero__lede">${lede}</div>` : ''}
    ${actions ? `<div class="phero__actions">${actions}</div>` : ''}
  </div>
</section>`;
}

// ---- background video (poster first; source attached by site.js unless reduced motion / Save-Data) -----
export function bgVideo({ src, srcSmall = null, poster, cls = '', label = '', ai = false }) {
  return `<video class="bgvid ${cls}" muted loop playsinline preload="none" poster="${esc(poster)}" data-bgvid data-src="${esc(src)}"${srcSmall ? ` data-src-small="${esc(srcSmall)}"` : ''} aria-hidden="true"${ai ? ' data-ai="generated"' : ''}${label ? ` data-label="${esc(label)}"` : ''}></video>`;
}

// ---- post card -------------------------------------------------------------------------------
export function postCard(p, { headingTag = 'h3', variant = '' } = {}) {
  const im = p.cardImage ? `<img src="${esc(p.cardImage.src)}" width="${p.cardImage.w}" height="${p.cardImage.h}" alt="" loading="lazy" decoding="async">` : '';
  return h`<article class="post-card${variant ? ' post-card--' + variant : ''}" data-reveal>
  <a class="post-card__link" href="${u(p.path)}">
    <span class="post-card__media">${im}</span>
    <span class="post-card__meta">${esc(p.meta || p.dateText || '')}</span>
    <${headingTag} class="post-card__title">${esc(p.title)}</${headingTag}>
    ${p.excerpt ? `<span class="post-card__excerpt">${esc(p.excerpt)}</span>` : ''}
  </a>
</article>`;
}

// ---- FAQ (details/summary) -------------------------------------------------------------------------
export function faqList(items, { cls = '' } = {}) {
  return `<div class="faq ${cls}">${items.map((f, i) => `<details class="faq__item" data-reveal style="--i:${i}"><summary class="faq__q"><span>${esc(f.q)}</span>${icon('chev')}</summary><div class="faq__a prose">${f.a}</div></details>`).join('')}</div>`;
}

// ---- preview-safe form: renders the live form's fields, never posts. ok / err: the live form's own
// success and error messages, kept for the provider integration (hidden until a real submit reports back) ---------------------------------
export function form({ id, fields, submit = 'Submit', note = '', confirmNote = 'form provider', cls = '', ok = '', err = '' }) {
  const f = (x) => {
    const fid = id + '-' + slugify(x.name);
    if (x.type === 'textarea') return `<label class="field field--wide"><span>${esc(x.label)}</span><textarea id="${fid}" name="${esc(x.name)}" rows="${x.rows || 4}"${x.required ? ' required' : ''}></textarea></label>`;
    if (x.type === 'radio' || x.type === 'checkboxes') return `<fieldset class="field field--wide field--choices"><legend>${esc(x.label)}</legend>${x.options.map((o, k) => `<label class="choice"><input type="${x.type === 'radio' ? 'radio' : 'checkbox'}" name="${esc(x.name)}" value="${esc(o)}"${x.required && k === 0 && x.type === 'radio' ? ' required' : ''}><span>${esc(o)}</span></label>`).join('')}</fieldset>`;
    if (x.type === 'checkbox') return `<label class="field field--wide choice"><input type="checkbox" name="${esc(x.name)}"${x.required ? ' required' : ''}><span>${x.label}</span></label>`;
    if (x.type === 'file') return `<label class="field"><span>${esc(x.label)}</span><input id="${fid}" type="file" name="${esc(x.name)}"></label>`;
    return `<label class="field${x.wide ? ' field--wide' : ''}"><span>${esc(x.label)}</span><input id="${fid}" type="${x.type || 'text'}" name="${esc(x.name)}"${x.autocomplete ? ` autocomplete="${x.autocomplete}"` : ''}${x.required ? ' required' : ''}></label>`;
  };
  return h`${confirm('Form: preview build, no backend. Connect the ' + confirmNote + ' before launch.')}
<form class="form ${cls}" id="${id}" action="${u('/form-sent')}" method="get" data-preview-form novalidate>
  <div class="form__grid">${fields.map(f)}</div>
  <p class="form__actions"><button class="btn btn--accent" type="submit"><span>${esc(submit)}</span>${icon('arrow')}</button></p>
  <p class="form__note" role="status" data-form-status>${note || 'Preview build: this form does not send yet.'}</p>
  ${ok ? `<p class="form__msg form__msg--ok" role="status" data-form-ok hidden>${esc(ok)}</p>` : ''}${err ? `<p class="form__msg form__msg--err" role="alert" data-form-err hidden>${esc(err)}</p>` : ''}
</form>`;
}

// ---- paisley (drawn for this build; the bandana trim and textures) ----------------------------------
export function paisleyDefs() { return ''; }
export const grain = () => '<div class="grain" aria-hidden="true"></div>';
export { LETTERS, IMAGES };
