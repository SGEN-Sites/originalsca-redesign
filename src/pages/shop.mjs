// shop.mjs: /shop (hub), /brands, /deals, /clothing.
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, shopBtn, storeSwitch, categoryGrid, plaque, img, form, icon } from '../lib/parts.mjs';
import { STORES, BRANDS, LINKS, STRAINS } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

const dropForm = (id) => form({ id, fields: [{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider' });
const brandWall = (list) => `<ul class="brand-wall" role="list">${list.map((b, i) => `<li data-reveal style="--i:${i % 5}"><a class="brand-tile${b.logo ? ' brand-tile--logo' : ''}" href="${esc(b.la)}" target="_blank" rel="noopener">${b.logo ? img('logo-' + b.logo, { sizes: '160px', alt: b.name + ' logo' }) : `<span>${esc(b.name)}</span>`}</a></li>`).join('')}</ul>`;

// ---- the deals wall (/deals; owner, 2026-11-12: "for deals page let's have the concave carousel here instead of just
// copying what we have in home page", then "we have already built the concave carousel ... perhaps you can take the
// code, replace images"): ported from an earlier redesign's cave gallery (its parts.mjs cave(), cinema.css
// .cave, site.js [data-cave]). The deal plaques, word for word, as tall cards (3:4) hung on a wall that curves round
// the viewer: each card is its deal photo, full-bleed under a dark gradient, with the plaque's words and its button on
// top. site.js [data-cave] hangs the cards on the arc and turns it (drag and flick with a settle, a click on a side
// card, the buttons, the arrow keys, a sideways swipe); without the script, or with reduced motion, they are a plain
// swipe row (carousel.css). The caption under the wall names the centred deal (as on the earlier build); a polite live region
// says it to screen readers. Each photo is drawn to cover its card's height, so its sizes are the card's width times
// the photo's aspect over the card's (zoom: a card that enlarges its photo, carousel.css). The Happy Hour and San Diego
// photos are the home reel's; their [CONFIRM WITH CLIENT] notes are at home.mjs DEALS.
// label: the id of the heading that names the wall; deals: [{ id, photo, zoom, decorative, pre, store, big, small, title, body, href, cta }]
function cave(label, deals) {
  const n = deals.length;
  // (a phone is held to the largest file up to 1600w, owner performance brief 2026-11-12: its value is at most that
  // file's width over three device pixels a CSS px; browsers that do not take min() in sizes use the cap itself. Wider,
  // the card is clamp(300px, 25vw, 380px) wide (site.js [data-cave]); browsers that do not take clamp() use its 380px)
  const sizes = (id, zoom = 1) => {
    const tag = img(id), [, iw, ih] = tag.match(/ width="(\d+)" height="(\d+)"/), k = Math.max(1, (4 / 3) * (iw / ih)) * zoom;   // a photo taller than 3:4 covers by the card's width
    const cap = Math.floor(Math.max(...[...tag.matchAll(/ (\d+)w(?=[,"])/g)].map((m) => +m[1]).filter((v) => v <= 1600)) / 3);
    return `(max-width: 759px) min(${Math.round(78 * k)}vw, ${cap}px), (max-width: 759px) ${cap}px, (min-width: 760px) calc(clamp(300px, 25vw, 380px) * ${+k.toFixed(3)}), ${Math.round(380 * k)}px`;
  };
  const panels = deals.map((x, i) => h`${x.pre || ''}
      <div class="cave__panel cave__panel--${x.id}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}: ${esc(x.title)}" data-title="${esc(x.title)}" data-sub="${esc(x.store)}">
        <span class="cave__photo">${img(x.photo, { sizes: sizes(x.photo, x.zoom), decorative: !!x.decorative })}</span>
        <span class="cave__shade"></span>
        <div class="cave__copy">
          <p class="cave__store">${esc(x.store)}</p>
          <div class="cave__fig"><p class="cave__big">${x.big}</p>${x.small ? `<p class="cave__small">${x.small}</p>` : ''}</div>
          <h3 class="cave__head">${x.title}</h3>
          ${x.body ? `<p class="cave__body">${x.body}</p>` : ''}
          ${btn(x.cta, x.href, { size: 'sm', kind: 'chrome' })}
        </div>
      </div>`);
  return h`<div class="cave" data-cave data-reveal role="region" aria-roledescription="carousel" aria-labelledby="${label}">
  <div class="cave__stage">
    <div class="cave__wall">${panels}
    </div>
  </div>
  <p class="cave__caption" aria-hidden="true"><b class="cave__title">${esc(deals[0].title)}</b><span class="cave__sub">${esc(deals[0].store)}</span></p>
  <div class="cave__controls">
    <button class="cave__btn" type="button" data-cave-prev aria-label="Previous deal">${icon('arrow')}</button>
    <span class="cave__count" aria-hidden="true"><b data-cave-n>01</b> / ${String(n).padStart(2, '0')}</span>
    <button class="cave__btn" type="button" data-cave-next aria-label="Next deal">${icon('arrow')}</button>
  </div>
  <p class="sr-only" aria-live="polite" aria-atomic="true" data-cave-live></p>
</div>`;
}

export function pages() {
  const shop = {
    path: '/shop', title: 'Shop Cannabis | Originals', description: 'Shop Originals Los Angeles or Originals San Diego: flower, pre-rolls, cartridges, extracts, edibles, drinks, tinctures, topicals and merch, straight to the live menu.',
    jsonld: [crumbsLd([{ name: 'Shop', path: '/shop' }])], active: '/shop', bodyClass: 'is-shop',
    // (2026-11-12, owner: "apply those on the remaining pages"; docs/DESIGN-LANGUAGE.md; styles shop-pages.css) the
    // hero is the LA store's own photo, not the AI warehouse; the categories are a bento of photo cards (black and white
    // at rest, colour and a gold frame on interaction); the brands are white marks on the ink with no boxes, as the home
    // marquee; the house strains are a numbered editorial list. Every word, link and data-shop hook is the same.
    main: h`${pageHero({ kicker: 'Shop', title: 'Shop <span class="chrome-word">Originals</span>', crumbs: [{ label: 'Shop', href: '/shop' }], lede: '<p>Pick your store, then pick your category. Every button opens that store\'s live menu with its cart.</p>', media: img('store-la-wall', { sizes: '(max-width: 900px) 200vw, 100vw', alt: '', decorative: true, eager: true, priority: true }), variant: 'photo', actions: storeSwitch() + shopBtn('Shop Now') })}
${confirm('The /shop hero (store-la-wall) is the business\'s own Google Maps listing photo (la-21); shoppers at the counter are small and seen from behind: confirm the photographer\'s licence covers the website (PITCH-NOTES #30).')}
<section class="band shop-cats" aria-labelledby="sc-h">
  <div class="wrap">
    <div class="section-head section-head--row"><div>${kicker('By category')}<h2 id="sc-h">SHOP BY <span class="chrome-word">category</span></h2></div><p class="lede">Our online and in-store menu is robust and full of all your favorite products from extracts, edibles, flower, tinctures and more.</p></div>
    ${categoryGrid()}
  </div>
</section>
<section class="band shop-brands" aria-labelledby="sb-h">
  <div class="wrap">
    <div class="section-head section-head--row"><div>${kicker('By brand')}<h2 id="sb-h">SHOP BY <span class="chrome-word">brand</span></h2></div><p class="lede">Originals carries some of the top-rated brands throughout California. We strive to offer the widest selection possible. So stop in or browse online.</p></div>
    <ul class="shop-marks" role="list">${BRANDS.slice(0, 10).map((b, i) => {
      // as the home marquee: logo-<b.logo>, else logo-<its menu slug without the number>, its -white version first when
      // one exists (every mark shows white on the ink); a brand with no logo keeps its name
      let mark = '';
      const slug = b.la.match(/brands\/([a-z0-9-]+?)-\d+\/$/), id = 'logo-' + (b.logo || (slug && slug[1]));
      for (const k of [id + '-white', id]) {
        try { mark = img(k, { sizes: '(max-width: 600px) 116px, 168px', alt: b.name + ' logo' }); break; }
        catch (e) { if (!/^unknown image/.test(e.message)) throw e; }
      }
      return `<li data-reveal style="--i:${i % 5}"><a class="shop-mark" href="${esc(b.la)}" target="_blank" rel="noopener">${mark || `<span>${esc(b.name)}</span>`}</a></li>`;
    }).join('')}</ul>
    <p class="center">${btn('SHOP ALL BRANDS', '/brands', { kind: 'chrome' })}</p>
  </div>
</section>
<section class="band shop-strains" aria-labelledby="ss-h">
  <div class="wrap split">
    <div>${kicker('House strains')}<h2 id="ss-h">Grown <span class="chrome-word">in-house</span></h2><p class="lede">The house genetics: OG cuts, Gelato and the rest of the family.</p><p class="btn-row">${btn('Strain library', '/strains', { kind: 'chrome' })}${btn('Deals', '/deals', { kind: 'ghost' })}</p></div>
    <ul class="strain-rail strain-rail--grid" role="list">${STRAINS.map((s) => `<li class="strain-chip"><a href="${u('/strains#' + s.id)}"><span class="strain-chip__k">House strain</span><span class="strain-chip__n">${esc(s.name)}</span>${icon('arrow')}</a></li>`).join('')}</ul>
  </div>
</section>`,
  };

  const brands = {
    path: '/brands', title: 'Cannabis Brands | Originals LA', description: 'Learn about our favorite cannabis brands that are being highlighted for their consistent product and ongoing customer satisfaction.',
    jsonld: [crumbsLd([{ name: 'Brands', path: '/brands' }])], active: '/brands', bodyClass: 'is-brands',
    main: h`${pageHero({ kicker: 'Shop by brand', title: '<span class="chrome-word">Brands</span>', crumbs: [{ label: 'Brands', href: '/brands' }], lede: '<p>Check out one of our dispensaries in Southern California. Our locations in Los Angeles and San Diego offer a relaxed atmosphere and excellent cannabis product selection.</p>', media: img('trichomes', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<section class="band" aria-labelledby="ob-h">
  <div class="wrap">
    <div class="section-head">${kicker('The brand behind the brands')}<h2 id="ob-h">OUR <span class="chrome-word">brands</span></h2><p class="lede">Originals carries some of the top-rated brands throughout California. We strive to offer the widest selection possible. So stop in or browse online.</p></div>
    ${brandWall(BRANDS)}
    <p class="note mt">Brand tiles open that brand on the Originals Los Angeles menu. In San Diego, browse brands on the ${link(STORES.sd.menu, 'San Diego online menu')}.</p>
    <p class="center btn-row btn-row--center">${btn('SHOP ALL BRANDS', STORES.la.menu, { kind: 'chrome' })}${btn('Shop San Diego', STORES.sd.menu, { kind: 'ghost' })}</p>
  </div>
</section>`,
  };

  const la = STORES.la, sd = STORES.sd;
  const deals = {
    path: '/deals', title: 'Cannabis Deals', description: 'We value our cannabis community and we want to show our appreciation for our fam by offering the best and boldest cannabis deals in California.',
    jsonld: [crumbsLd([{ name: 'Deals', path: '/deals' }])], active: '/deals', bodyClass: 'is-deals',
    main: h`${pageHero({ kicker: 'Happy hour', title: 'CANNABIS <span class="chrome-word">deals</span>', crumbs: [{ label: 'Deals', href: '/deals' }], lede: '<p>We value our cannabis community and we want to show our appreciation for our fam by offering the best and boldest cannabis deals in California. Check out the deals listed below and make sure you use the code at checkout to bring in the savings. We know you work hard, so let us help you find ways to relax and enjoy life with our cannabis service, deals, and offerings.</p>', media: img('night-street', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<section class="band happy happy--page" aria-labelledby="store-deals-h">
  <div class="wrap">
    <div class="happy__sign" aria-hidden="true"><span class="neon" data-neon>Happy Hour</span><span class="neon neon--sub" data-neon style="--d:.6s">All day Sunday</span></div>
    <h2 id="store-deals-h" class="sr-only">Store deals</h2>
  </div>
  ${cave('store-deals-h', [
    { id: 'sun', photo: 'happy-hour-lowrider', pre: confirm('All-day Sunday happy hour: which store(s) and the discount, to confirm with the client.'),
      store: 'Sundays', big: 'Happy<br>Hour', small: 'All day', title: 'All-day Sunday happy hour', href: la.menu, cta: 'Shop Sunday' },
    { id: 'la', photo: 'store-la-floor', zoom: 1.2, store: 'LOS ANGELES STORE DEALS', big: '30%', small: 'OFF FTP', title: '30% OFF FTP', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: la.menu, cta: 'Shop LA' },
    { id: 'sd', photo: 'store-sd-front', zoom: 1.3, store: 'SAN DIEGO Store Deals', big: '50%', small: 'OFF FTP', title: '50% OFF FTP', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: sd.menu, cta: 'Shop San Diego' },
    // the owner's ORIGINALS jar in its vertical version (daily-jar-tall, 2:3; owner, 2026-11-12: "use this and replace all
    // the vertical versions"): every slide is taller than wide, so the photo covers the slide (carousel.css)
    { id: 'daily', photo: 'daily-jar-tall', pre: confirm('San Diego daily deals: the day-by-day list is on the store\'s live deals page; confirm which deals to feature here.')
      + confirm('The Daily deals card photo (an ORIGINALS jar, the vertical version) is owner-supplied (2026-11-12): confirm it\'s the client\'s own photo. It is 1024x1536, a standard AI image-generator size, so it is marked generated until confirmed.'),
      store: 'San Diego', big: 'Daily', small: 'Deals', title: 'San Diego daily deals', body: 'A deal for every day of the week at Originals San Diego.', href: sd.deals, cta: 'See today\'s deals' },
  ])}
</section>
<section class="band save" aria-labelledby="save-h">
  <div class="wrap save__grid">
    <div class="save__tile save__head">
      ${kicker('Save now')}
      <h2 id="save-h">SAVE <span class="chrome-word">now</span></h2>
      <p class="lede">We offer deals for every situation and lifestyle from veteran discounts, to deals based on different days of the week. Browse our offerings below to find out all the ways you can save on your favorite cannabis products.</p>
    </div>
    <article class="save__tile save__deal save__pct">
      ${confirm('The Save now photo (a budtender helping customers at the counter) is owner-supplied (2026-11-12): confirm the client owns it and has the people\'s permission.')}
      <div class="save__photo">${img('store-counter', { sizes: '470px' })}</div>
      <div class="save__body">
        ${kicker('First Time Patient Deals')}
        <h3 class="save__offer"><span class="save__big">30%</span><span class="sr-only"> - </span><span class="save__ex">excludes Originals, Flight, &amp; Dodi</span></h3>
        <p class="save__act">${shopBtn('SHOP NOW', { size: 'sm' })}</p>
      </div>
    </article>
    <article class="save__tile save__deal save__wm">
      <div class="save__wm-in">
        <div>${kicker('WEEDMAPS DEALS')}<h3>Check out weekly deals on Weedmaps</h3><p class="save__note">Changing weekly!</p></div>
        <p class="save__act">${btn('SHOP NOW · LA', la.deals, { size: 'sm', kind: 'chrome' })}${btn('San Diego', sd.deals, { size: 'sm', kind: 'ghost' })}</p>
      </div>
    </article>
    <div class="save__tile save__pic" aria-hidden="true"><div class="save__bud">${img('bud-c', { sizes: '(min-width: 640px) 560px, 92vw', decorative: true })}</div></div>
  </div>
</section>
<section class="band droplist" aria-labelledby="deal-drop-h">
  <div class="band__clip"><div class="bandana droplist__bandana"></div><div class="droplist__scrim"></div></div>
  <div class="wrap wrap--narrow"><h2 id="deal-drop-h">SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS &amp; MORE</h2>${dropForm('deals-drop')}</div>
</section>`,
  };

  const clothing = {
    path: '/clothing', title: 'Originals Clothing | Originals', description: 'Originals Clothing: shop Originals merch online, open 24/7.',
    jsonld: [crumbsLd([{ name: 'Clothing', path: '/clothing' }])], bodyClass: 'is-clothing',
    main: h`${pageHero({ kicker: 'Originals Clothing', title: 'Rock the <span class="chrome-word">crown</span>', crumbs: [{ label: 'Clothing', href: '/clothing' }], lede: '<p>SHOP MERCH. OPEN 24/7. The Originals Clothing online store carries the crown, the pattern and the family colors.</p>', media: `<div class="phero__pattern bandana bandana--black"></div>`, variant: 'pattern', actions: btn('Shop Originals Clothing', LINKS.clothing) + btn('Merch at the LA store', STORES.la.cat('merch'), { kind: 'ghost' }) })}
<section class="band clothing-store" aria-labelledby="cl-h">
  <!-- 2026-11-12 (owner: "apply those on the remaining pages"; docs/DESIGN-LANGUAGE.md; styles shop-pages.css): no frame
       round the store's own graphic (no containers for their own sake); the text sits under a hairline, editorial. -->
  <div class="wrap split">
    <figure class="clothing-store__shot">${img('clothing-shop', { sizes: '(min-width: 900px) 46vw, 92vw' })}</figure>
    <div class="stack">
      ${kicker('Online store')}
      <h2 id="cl-h">VISIT NEW <span class="chrome-word">online store</span></h2>
      <p class="lede">Originals Clothing is open around the clock online, and merch is on the shelf at Originals Los Angeles too.</p>
      <p class="btn-row">${btn('originalsclothingshop.com', LINKS.clothing)}${btn('Bussin\' merch', '/bussin-merch', { kind: 'ghost' })}</p>
      <p class="tags-line">#yourockthecrown · #beoriginal</p>
    </div>
  </div>
</section>`,
  };
  return [shop, brands, deals, clothing];
}
