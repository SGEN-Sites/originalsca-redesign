// shop.mjs: /shop (hub), /brands, /deals, /clothing.
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, shopBtn, storeSwitch, categoryGrid, plaque, img, form, icon } from '../lib/parts.mjs';
import { STORES, BRANDS, LINKS, STRAINS } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

const dropForm = (id) => form({ id, fields: [{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider' });
const brandWall = (list) => `<ul class="brand-wall" role="list">${list.map((b, i) => `<li data-reveal style="--i:${i % 5}"><a class="brand-tile${b.logo ? ' brand-tile--logo' : ''}" href="${esc(b.la)}" target="_blank" rel="noopener">${b.logo ? img('logo-' + b.logo, { sizes: '160px', alt: b.name + ' logo' }) : `<span>${esc(b.name)}</span>`}</a></li>`).join('')}</ul>`;

export function pages() {
  const shop = {
    path: '/shop', title: 'Shop Cannabis | Originals', description: 'Shop Originals Los Angeles or Originals San Diego: flower, pre-rolls, cartridges, extracts, edibles, drinks, tinctures, topicals and merch, straight to the live menu.',
    jsonld: [crumbsLd([{ name: 'Shop', path: '/shop' }])], active: '/shop', bodyClass: 'is-shop',
    main: h`${pageHero({ kicker: 'Shop', title: 'Shop <span class="chrome-word">Originals</span>', crumbs: [{ label: 'Shop', href: '/shop' }], lede: '<p>Pick your store, then pick your category. Every button opens that store\'s live menu with its cart.</p>', media: img('warehouse', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo', actions: storeSwitch() + shopBtn('Shop Now') })}
<section class="band" aria-labelledby="sc-h">
  <div class="wrap">
    <div class="section-head">${kicker('By category')}<h2 id="sc-h">SHOP BY <span class="chrome-word">category</span></h2><p class="lede">Our online and in-store menu is robust and full of all your favorite products from extracts, edibles, flower, tinctures and more.</p></div>
    ${categoryGrid()}
  </div>
</section>
<section class="band band--concrete" aria-labelledby="sb-h">
  <div class="wrap">
    <div class="section-head section-head--row"><div>${kicker('By brand')}<h2 id="sb-h">SHOP BY <span class="chrome-word">brand</span></h2></div><p class="lede">Originals carries some of the top-rated brands throughout California. We strive to offer the widest selection possible. So stop in or browse online.</p></div>
    ${brandWall(BRANDS.slice(0, 10))}
    <p class="center">${btn('SHOP ALL BRANDS', '/brands', { kind: 'chrome' })}</p>
  </div>
</section>
<section class="band" aria-labelledby="ss-h">
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
    <div class="plaques">
      ${confirm('All-day Sunday happy hour: which store(s) and the discount, to confirm with the client.')}
      ${plaque({ store: 'Sundays', big: 'Happy<br>Hour', small: 'All day', title: 'All-day Sunday happy hour', body: 'Sunday is happy hour from open to close.', href: la.menu, cta: 'Shop Sunday' })}
      ${plaque({ store: 'LOS ANGELES STORE DEALS', big: '30%', small: 'OFF FTP', title: '30% OFF FTP', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: la.menu, cta: 'Shop LA' })}
      ${plaque({ store: 'SAN DIEGO Store Deals', big: '50%', small: 'OFF FTP', title: '50% OFF FTP', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: sd.menu, cta: 'Shop San Diego' })}
      ${confirm('San Diego daily deals: the day-by-day list is on the store\'s live deals page; confirm which deals to feature here.')}
      ${plaque({ store: 'San Diego', big: 'Daily', small: 'Deals', title: 'San Diego daily deals', body: 'A deal for every day of the week at Originals San Diego.', href: sd.deals, cta: 'See today\'s deals' })}
    </div>
  </div>
</section>
<section class="band" aria-labelledby="save-h">
  <div class="wrap split">
    <div class="stack">
      ${kicker('Save now')}
      <h2 id="save-h">SAVE <span class="chrome-word">now</span></h2>
      <p class="lede">We offer deals for every situation and lifestyle from veteran discounts, to deals based on different days of the week. Browse our offerings below to find out all the ways you can save on your favorite cannabis products.</p>
    </div>
    <div class="deal-cards">
      <article class="deal-card"><p class="kicker">First Time Patient Deals</p><h3>30% - excludes Originals, Flight, &amp; Dodi</h3>${shopBtn('SHOP NOW', { size: 'sm' })}</article>
      <article class="deal-card"><p class="kicker">WEEDMAPS DEALS</p><h3>Check out weekly deals on Weedmaps</h3><p>Changing weekly!</p><p class="btn-row">${btn('SHOP NOW · LA', la.deals, { size: 'sm', kind: 'chrome' })}${btn('San Diego', sd.deals, { size: 'sm', kind: 'ghost' })}</p></article>
    </div>
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
<section class="band" aria-labelledby="cl-h">
  <div class="wrap split">
    <figure class="media-frame">${img('clothing-shop', { sizes: '(min-width: 900px) 46vw, 92vw' })}</figure>
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
