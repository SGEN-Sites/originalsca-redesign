// home.mjs: the home page, in the order fixed in docs/DESIGN.md section 8.
import { h, esc, u, a, link, confirm } from '../lib/html.mjs';
import { SITE, STORES, STRAINS, COLLABS, EVENTS, BRANDS, LINKS } from '../content/site.mjs';
import { img, imgFile, kicker, chrome, btn, shopBtn, storeSwitch, categoryGrid, storeCard, plaque, bgVideo, postCard, faqList, form, letters3d, icon, crownMark, brandSymbols } from '../lib/parts.mjs';
import { extractFaqs } from '../lib/capture.mjs';
import { orgLd, storesLd, websiteLd } from '../lib/seo.mjs';

export function home({ posts }) {
  const faqs = extractFaqs();
  const pick = (q) => faqs.find((f) => f.q.startsWith(q));
  const recent = ['thc-extract-for-fast-relief', 'cannabis-books-for-handy-reference', 'cannabis-legal-states-and-economic-growth'].map((s) => posts.find((p) => p.slug === s)).filter(Boolean);
  // the creed rides the tapes as sentences, with the full stops the creed section and the brand line use
  const tags = [...SITE.tags, ...SITE.creed.map((c) => c + '.')];
  const tape = (items, rep = 4) => Array.from({ length: rep }, () => items.map((t) => `<span>${esc(t)}</span><span class="tape__dot" aria-hidden="true">${icon('crown')}</span>`).join('')).join('');

  const main = h`
${brandSymbols()}
<!-- 1. THE SHOWROOM: the brand film behind giant chrome ORIGINALS on a reflective floor -->
<section class="hero" data-hero>
  <div class="hero__clip" aria-hidden="true">
    ${bgVideo({ src: a('video/film-1280.mp4'), srcSmall: a('video/film-640.mp4'), poster: imgFile('film-poster', 1280), cls: 'hero__film', label: 'Originals brand film' })}
    <div class="hero__grade"></div>
    <div class="hero__shafts"><span></span><span></span><span></span><span></span></div>
    <div class="hero__motes"></div>
    <div class="hero__floor"></div>
    <div class="grain"></div>
  </div>
  <div class="hero__inner wrap">
    <div class="hero__copy">
      <p class="hero__award">${img('award-badge', { sizes: '180px', alt: 'Award Winning', eager: true })}</p>
      <h1 class="hero__h1" data-reveal>Best Cultivators in California.</h1>
      <p class="hero__script" data-reveal style="--i:1">${esc(SITE.brandBehind)}</p>
      <div class="hero__actions" data-reveal style="--i:2">
        ${storeSwitch('store-switch--hero')}
        ${shopBtn('Shop Now')}
        ${btn('Our Story', '/our-story', { kind: 'ghost' })}
      </div>
      <p class="hero__meta" data-reveal style="--i:3"><span>100% family owned and operated since 2006</span><span>Grown in-house</span><span>Los Angeles · San Diego</span></p>
    </div>
  </div>
  ${letters3d({ cls: 'hero__letters' })}
  <button class="film-toggle" type="button" data-video-toggle aria-pressed="false">${icon('pause')}<span>Pause film</span></button>
</section>

<!-- 2. HASHTAG TAPES crossing the seam -->
<div class="tapes" aria-hidden="true"><div class="tapes__clip">
  <div class="tape tape--chrome" data-tape="-1"><div class="tape__track">${tape(tags)}</div></div>
  <div class="tape tape--red" data-tape="1"><div class="tape__track">${tape([...SITE.tags].reverse())}</div></div>
</div></div>

<!-- 3. THE MENU: shop by category in the showroom -->
<section class="band showroom" id="shop" aria-labelledby="shop-h">
  <div class="band__clip">${img('warehouse', { sizes: '100vw', cls: 'cover showroom__bg', alt: '', decorative: true })}<div class="showroom__scrim"></div><div class="showroom__pool"></div><div class="grain"></div></div>
  <div class="wrap">
    <div class="section-head">
      ${kicker('The menu')}
      <h2 id="shop-h" data-reveal>Shop by <span class="chrome-word">category</span></h2>
      <p class="lede" data-reveal style="--i:1">Our online and in-store menu is robust and full of all your favorite products from extracts, edibles, flower, tinctures and more. Click on the pictures and browse our menu based on your favorite cannabis products.</p>
      <div class="section-head__tools" data-reveal style="--i:2"><span class="section-head__label">You're shopping</span>${storeSwitch()}</div>
    </div>
    ${categoryGrid()}
    <p class="center">${shopBtn('Shop All', { kind: 'chrome' })}</p>
  </div>
</section>

<!-- 4. HAPPY HOUR: neon sign and car-club plaques -->
<section class="band happy" id="deals" aria-labelledby="deals-h">
  <div class="band__clip">${img('night-street', { sizes: '100vw', cls: 'cover happy__bg', alt: '', decorative: true })}<div class="happy__scrim"></div><div class="grain"></div></div>
  <div class="wrap">
    <div class="happy__sign" aria-hidden="true"><span class="neon" data-neon>Happy Hour</span><span class="neon neon--sub" data-neon style="--d:.6s">All day Sunday</span></div>
    <div class="section-head section-head--center">
      ${kicker('Deals')}
      <h2 id="deals-h" data-reveal>Cannabis <span class="accent">deals</span></h2>
      <p class="lede" data-reveal style="--i:1">We value our cannabis community and we want to show our appreciation for our fam by offering the best and boldest cannabis deals in California.</p>
    </div>
    <div class="plaques">
      ${confirm('All-day Sunday happy hour: which store(s), and the discount, to confirm with the client.')}
      ${plaque({ store: 'Sundays', big: 'Happy<br>Hour', small: 'All day', title: 'All-day Sunday happy hour', body: 'Sunday is happy hour from open to close.', href: '/deals', cta: 'See the deal' })}
      ${plaque({ store: STORES.la.name, big: '30%', small: 'Off FTP', title: 'Los Angeles store deals', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: STORES.la.menu, cta: 'Shop LA' })}
      ${plaque({ store: STORES.sd.name, big: '50%', small: 'Off FTP', title: 'San Diego store deals', body: '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)', href: STORES.sd.menu, cta: 'Shop San Diego' })}
      ${confirm('San Diego daily deals: the day-by-day list lives on the store\'s live deals page; confirm the deals to feature.')}
      ${plaque({ store: STORES.sd.short, big: 'Daily', small: 'Deals', title: 'San Diego daily deals', body: 'Check out weekly deals on Weedmaps. Changing weekly!', href: STORES.sd.deals, cta: 'See today\'s deals' })}
    </div>
    <p class="center">${btn('All deals', '/deals', { kind: 'ghost' })}</p>
  </div>
</section>

<!-- 5. THE BLOCK: our story teaser as a family album -->
<section class="band block" id="story" aria-labelledby="story-h">
  <div class="wrap grid-2 block__grid">
    <div class="block__copy">
      ${kicker('Our story')}
      <h2 id="story-h" data-reveal>From the <span class="chrome-word">block</span></h2>
      <p class="lede" data-reveal style="--i:1">Originals started with a group of elementary school friends, many from the same Los Angeles block, who pooled what they had to build a proud, world-class company driven by their Mexican American family values. Brothers, parents and neighbors all pitched in.</p>
      <ul class="stats" role="list" data-reveal style="--i:2">
        <li class="stat"><span class="stat__n">2006</span><span class="stat__l">Family owned and operated since</span></li>
        <li class="stat"><span class="stat__n" data-count="47">47</span><span class="stat__l">Times award winners</span></li>
        <li class="stat"><span class="stat__n">½M+</span><span class="stat__l">More than half a million square feet of indoor cultivation</span></li>
        <li class="stat"><span class="stat__n" data-count="800">800</span><span class="stat__l">Over 800 employees</span></li>
      </ul>
      <p data-reveal style="--i:3">${btn('Our Story', '/our-story', { kind: 'chrome' })}</p>
    </div>
    <div class="album" aria-label="Family album" data-album>
      <figure class="polaroid" style="--r:-6deg;--x:2%;--y:4%" data-develop>${img('store-la-front', { sizes: '(min-width: 900px) 30vw, 70vw', alt: 'Originals Los Angeles storefront with its giant ORIGINALS letters' })}<figcaption>Stanford Ave, LA</figcaption></figure>
      <figure class="polaroid" style="--r:5deg;--x:44%;--y:0%" data-develop>${img('bud-box', { sizes: '(min-width: 900px) 26vw, 60vw', alt: 'Originals Family Farms flower beside its box' })}<figcaption>Grown in-house</figcaption></figure>
      <figure class="polaroid" style="--r:-2deg;--x:12%;--y:50%" data-develop>${img('farmers-cup', { sizes: '(min-width: 900px) 22vw, 50vw', alt: 'Farmers Cup 2021: first place, licensed flower, Originals Gelato' })}<figcaption>Farmers Cup 2021</figcaption></figure>
      <figure class="polaroid" style="--r:7deg;--x:52%;--y:46%" data-develop>${img('sd-script', { sizes: '(min-width: 900px) 26vw, 60vw', alt: 'Originals San Diego graphic' })}<figcaption>Then San Diego</figcaption></figure>
    </div>
  </div>
</section>

<!-- 6. THE FAMILY WALL -->
<section class="band band--paper wall" id="family-wall" aria-labelledby="wall-h" data-wall>
  <div class="band__clip"><div class="wall__brick"></div><div class="wall__light" data-wall-light></div></div>
  <div class="wrap">
    <div class="section-head section-head--center">
      ${kicker('The family wall')}
      <h2 id="wall-h" data-reveal>Honoring the <span class="chrome-word chrome-word--red">originals</span></h2>
      <p class="lede" data-reveal style="--i:1">Inside our Los Angeles store, giant ORIGINALS letters stand in front of a huge black-and-white wall of cultural originals: civil rights leaders, artists, athletes, icons. It's a living family wall. When legends visit, they sign it as another true original.</p>
    </div>
    <div class="wall__hang">
      ${/* every signature is the client's own line (client-facts.brandLines / story) */ [['wall-gloves', '#yourockthecrown'], ['wall-mic', 'Family owned and operated'], ['wall-basketball', '#comingforthecrown'], ['wall-wheel', "California's Best."], ['wall-crown', '#beoriginal'], ['wall-trumpet', 'Good, Better, Best.'], ['wall-brushes', 'Always Room For Improvement'], ['wall-typewriter', 'Mastering Our Craft'], ['wall-records', '#grownbyogsforogs'], ['wall-reels', 'The Brand Behind The Brands']].map(([id, sig], i) => h`<div class="wframe wframe--${i}" data-frame style="--i:${i}">
        <div class="wframe__mat">${img(id, { sizes: '(min-width: 1100px) 22vw, 44vw' })}</div>
        <p class="wframe__sig" data-sign aria-hidden="true"><span>${esc(sig)}</span></p>
      </div>`)}
    </div>
    <p class="wall__note">Frames shown here are illustrations made for this site. The real wall, and its signatures, live in the store.</p>
    <p class="center">${btn('Visit the wall', STORES.la.page, { kind: 'red' })}</p>
  </div>
</section>

<!-- 7. FROM THE FARM -->
<section class="band farm" id="farm" aria-labelledby="farm-h">
  <div class="band__clip">${bgVideo({ src: a('video/grow-1600.mp4'), poster: imgFile('loop-grow', 1600), cls: 'farm__vid' })}<div class="farm__scrim"></div><div class="grain"></div></div>
  <div class="farm__buds" aria-hidden="true">
    <span class="bud bud--a" data-depth=".18">${img('bud-a', { sizes: '300px', alt: '', decorative: true })}</span>
    <span class="bud bud--c" data-depth="-.12">${img('bud-c', { sizes: '260px', alt: '', decorative: true })}</span>
  </div>
  <div class="wrap">
    <div class="section-head">
      ${kicker('From the farm')}
      <h2 id="farm-h" data-reveal>Grown <span class="chrome-word">in-house</span></h2>
      <p class="lede" data-reveal style="--i:1">Originals was established in 2006, and specializes in premium quality indoor cannabis. We grow our own flower, and our OG cuts and Gelato built a cult following in LA.</p>
    </div>
    <ul class="strain-rail" role="list" data-rail>
      ${STRAINS.map((s, i) => h`<li class="strain-chip" data-reveal style="--i:${i}"><a href="${u('/strains#' + s.id)}" data-tilt><span class="strain-chip__k">House strain</span><span class="strain-chip__n">${esc(s.name)}</span>${icon('arrow')}</a></li>`)}
    </ul>
    <p>${btn('Strain library', '/strains', { kind: 'chrome' })}</p>
  </div>
</section>

<!-- 8. SUNDAY CRUISE: a lowrider rolls across the boulevard as you scroll -->
<section class="cruise" id="cruise" aria-labelledby="cruise-h" data-cruise>
  <div class="cruise__sticky">
    <div class="cruise__sky" aria-hidden="true">${img('boulevard', { sizes: '100vw', cls: 'cover', alt: '', decorative: true })}<div class="cruise__haze"></div></div>
    <div class="cruise__copy wrap">
      ${kicker('Sunday cruise')}
      <h2 id="cruise-h" class="cruise__h">Grown by OGs, <span class="script accent">for OGs</span></h2>
      <p class="cruise__line">${esc(SITE.sdMission)}</p>
    </div>
    <div class="cruise__road" aria-hidden="true">
      <div class="cruise__car" data-car>${img('lowrider', { sizes: '(min-width: 900px) 62vw, 92vw', alt: '', decorative: true })}<span class="cruise__shadow"></span></div>
      <div class="cruise__lines"></div>
    </div>
  </div>
</section>

<!-- 9. THE CREED: stage beams and a spotlight that lights one line at a time -->
<section class="creed" id="creed" aria-labelledby="creed-h" data-creed>
  <div class="creed__sticky">
    <div class="creed__stage" aria-hidden="true">${bgVideo({ src: a('video/stage-1280.mp4'), poster: imgFile('loop-stage', 1280), cls: 'creed__vid' })}<div class="creed__beams"><span></span><span></span><span></span><span></span><span></span></div><div class="creed__scrim"></div></div>
    <div class="creed__inner wrap">
      ${kicker('The creed')}
      <h2 class="sr-only" id="creed-h">${esc(SITE.creed.join(', ') + '.')}</h2>
      <ol class="creed__lines" role="list" aria-hidden="true">
        ${SITE.creed.map((c, i) => `<li class="creed__line" data-line="${i}"><span class="chrome-word">${esc(c)}</span><span class="creed__stop">.</span></li>`)}
      </ol>
      <p class="creed__crown" aria-hidden="true">${crownMark()}</p>
    </div>
    <div class="creed__spot" aria-hidden="true"></div>
  </div>
</section>

<!-- 10. STORES -->
<section class="band stores" id="stores" aria-labelledby="stores-h">
  <div class="wrap">
    <div class="section-head">
      ${kicker('Our stores')}
      <h2 id="stores-h" data-reveal>Two stores. <span class="chrome-word">One family.</span></h2>
    </div>
    <div class="stores__grid">
      ${storeCard('la', { photo: img('store-la-interior', { sizes: '(min-width: 900px) 40vw, 92vw', alt: 'Inside Originals Los Angeles: arched windows, timber trusses, glass cases and the black-and-white wall' }) })}
      ${storeCard('sd', { photo: img('sd-banner', { sizes: '(min-width: 900px) 40vw, 92vw', alt: 'Originals San Diego banner: sunset palms and the crown' }) })}
      <article class="store-card store-card--clothing">
        <div class="store-card__media">${img('clothing-shop', { sizes: '(min-width: 900px) 24vw, 92vw', alt: 'The Originals Clothing online store' })}</div>
        <div class="store-card__body">
          <p class="kicker">Online</p>
          <h3 class="store-card__name">${link(LINKS.clothing, 'Originals Clothing')}</h3>
          <p>SHOP MERCH. OPEN 24/7.</p>
          <p class="store-card__actions">${btn('Shop merch', LINKS.clothing, { size: 'sm', kind: 'chrome' })}</p>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- 11. CULTURE: events and collabs -->
<section class="band culture" id="culture" aria-labelledby="culture-h">
  <div class="band__clip">${img('stage-wide', { sizes: '100vw', cls: 'cover culture__bg', alt: '', decorative: true })}<div class="culture__scrim"></div></div>
  <div class="wrap">
    <div class="section-head">
      ${kicker('Culture')}
      <h2 id="culture-h" data-reveal>Lit like our <span class="chrome-word">events</span></h2>
      <p class="lede" data-reveal style="--i:1">Car shows, block parties, release nights and the family behind them.</p>
    </div>
    <div class="posters">
      <a class="poster poster--img" href="${u('/events#lowrider-super-show')}" data-tilt data-reveal>${img('flyer-carshow', { sizes: '(min-width: 900px) 34vw, 86vw', alt: 'Lowrider car show flyer: Los Angeles 2026 Finale' })}<span class="poster__cap">Lowrider Magazine Super Show</span></a>
      <a class="poster poster--img" href="${u('/originals-hall-of-flowers-palm-springs-recap')}" data-tilt data-reveal style="--i:1">${img('hof-graphic', { sizes: '(min-width: 900px) 34vw, 86vw', alt: 'Hall of Flowers Palm Springs 2021 graphic with Originals and The Cure Company' })}<span class="poster__cap">Hall of Flowers recap</span></a>
      <a class="poster poster--type" href="${u('/events')}" data-tilt data-reveal style="--i:2"><span class="poster__k">Coming to a city near you</span><span class="poster__t">Originals Takeover</span><span class="poster__s">Palm Springs</span></a>
    </div>
    <div class="collab-tape" aria-label="Collabs">
      ${confirm('Collab partners and product names (Chris Brown / Bussin\' with OHB Farms, Xzibit / Napalm, Ice Cube / Caviar Gold, Mike Tyson / Tyson Ranch, Nipsey Hussle / Marathon OG, Royal Blunts, Beast Mode, Dodi Oakland): confirm each with the client before launch.')}
      <ul class="collab-tape__track" role="list" data-marquee>
        ${COLLABS.map((c) => `<li><strong>${esc(c.product || c.partner)}</strong>${c.product ? `<span>with ${esc(c.partner)}${c.with ? ' and ' + esc(c.with) : ''}</span>` : '<span>collab</span>'}</li>`)}
      </ul>
    </div>
    <p class="btn-row">${btn('Events', '/events', { kind: 'red' })}${btn('Collabs', '/collabs', { kind: 'ghost' })}</p>
  </div>
</section>

<!-- 12. BRANDS + CANNABLOG -->
<section class="band brands-band" id="brands" aria-labelledby="brands-h">
  <div class="wrap">
    <div class="section-head">
      ${kicker('The Brand Behind The Brands')}
      <h2 id="brands-h" data-reveal>Shop by <span class="chrome-word">brand</span></h2>
      <p class="lede" data-reveal style="--i:1">Originals carries some of the top-rated brands throughout California. We strive to offer the widest selection possible. So stop in or browse online.</p>
    </div>
    <ul class="brand-wall" role="list">
      ${BRANDS.slice(0, 10).map((b, i) => `<li data-reveal style="--i:${i % 5}"><a class="brand-tile${b.logo ? ' brand-tile--logo' : ''}" href="${esc(b.la)}" target="_blank" rel="noopener">${b.logo ? img('logo-' + b.logo, { sizes: '160px', alt: b.name + ' logo' }) : `<span>${esc(b.name)}</span>`}</a></li>`)}
    </ul>
    <p class="center">${btn('Shop All Brands', '/brands', { kind: 'chrome' })}</p>
  </div>
</section>

<section class="band blogband" aria-labelledby="blog-h">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div>${kicker('Cannablog')}<h2 id="blog-h" data-reveal>Recent <span class="chrome-word">blogs</span></h2></div>
      <p class="lede">Check out our cannablog to read and learn all about the newest updates within the industry and new expert insights on some of your favorite brands and products. Our experts strive to keep you informed and up to date.</p>
    </div>
    <div class="post-grid">${recent.map((p) => postCard(p))}</div>
    <p class="center">${btn('Read All', '/blog', { kind: 'ghost' })}</p>
  </div>
</section>

<!-- 13. DROP LIST + FAQ -->
<section class="band droplist" aria-labelledby="drop-h">
  <div class="band__clip"><div class="bandana droplist__bandana"></div><div class="droplist__scrim"></div></div>
  <div class="wrap grid-2">
    <div>
      ${kicker('The drop list')}
      <h2 id="drop-h" data-reveal>Subscribe to our newsletter and get the latest update on deals, events &amp; more</h2>
      ${form({ id: 'home-drop', fields: [{ name: 'name', label: 'Name', autocomplete: 'name' }, { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider' })}
    </div>
    <div>
      ${kicker('FAQs')}
      ${faqList([pick('Do you take credit'), pick('Do you deliver'), pick('Do I need to show'), pick('Do you offer any discounts')].filter(Boolean))}
      <p class="mt">${btn('All FAQs', '/faqs', { kind: 'ghost', size: 'sm' })}</p>
    </div>
  </div>
</section>`;

  return {
    path: '/',
    file: 'index.html',
    title: 'Best Dispensary in Los Angeles | Originals LA',
    description: 'Originals: family owned and operated since 2006, award-winning flower grown in-house. Shop Originals Los Angeles and Originals San Diego by category, brand and deal.',
    jsonld: [orgLd(), websiteLd(), ...storesLd()],
    preload: [{ href: imgFile('film-poster', 1280), as: 'image', fetchpriority: 'high' }],
    bodyClass: 'is-home',
    main,
  };
}
