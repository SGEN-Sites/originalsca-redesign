// home.mjs: the home page, in the order fixed in docs/DESIGN.md section 8.
import { h, esc, u, a, link, confirm } from '../lib/html.mjs';
import { SITE, STORES, STRAINS, COLLABS, EVENTS, BRANDS, LINKS } from '../content/site.mjs';
import { img, imgFile, kicker, chrome, btn, shopBtn, storeSwitch, categoryWall, bgVideo, postCard, faqList, form, icon, crownMark, wordmark, brandSymbols } from '../lib/parts.mjs';
import { extractFaqs } from '../lib/capture.mjs';
import { orgLd, storesLd, websiteLd } from '../lib/seo.mjs';

// ---- section 4, the deals ("Spotlight Reel", owner-approved lab option B; styles deals.css, script site.js "deals reel").
// The four deals in rail order: the words and links of the client's deals, each with its photo (also the stage glow).
const FTP = 'Off <abbr title="First Time Patient">FTP</abbr>';
const EXCLUDES = '(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)';
// a deal photo's sizes (owner performance brief, 2026-11-12: at least 1x of the drawn device pixels, phones at most
// 1600w files). On the wide stage the photo covers its card, so it is drawn at least the card's height (100vh - 184px:
// the header, the store bar and their air) times h, or its width times w (both include the photo's aspect, any
// overscan, and its slow zoom at its end); browsers that do not take max() in sizes use the height term. Anywhere else
// (the phone stack, the still grid) it covers a card about 540px tall, so it is drawn wider than a phone's 1600w cap
// allows at three device pixels a CSS px: phone is that cap, the largest file up to 1600w over 3
const dealSizes = ({ h, w, phone, byWidth = false }) => {   // byWidth: a photo whose box follows the card's width falls back to w
  const reel = '(min-width: 900px) and (min-height: 600px)', tall = `calc((100vh - 184px) * ${h})`;
  return `${reel} max(${tall}, ${w}), ${reel} ${byWidth ? w : tall}, ${phone}px`;
};
const DEALS = [
  { id: 'deal-sun', kind: 'words', side: true, store: 'Sundays', tab: 'Happy Hour', big: 'Happy Hour', small: 'All day', title: 'All-day Sunday happy hour', href: '/deals', cta: 'See the deal',
    // 3:2, the card itself as its box, zoom 1.07: h 1.5 x 1.07; w the card (about 72vw) x 1.07; phone 1600w
    photo: 'happy-hour-lowrider', pic: { sizes: dealSizes({ h: 1.6, w: '77vw', phone: 533 }) },
    notes: ['All-day Sunday happy hour: which store(s), and the discount, to confirm with the client.',
      'The Happy Hour photo is owner-supplied and shows an identifiable person and a readable licence plate; its left side is AI-extended: confirm the client owns it, has her permission, and accepts the extension before publishing.'] },
  { id: 'deal-la', kind: 'num', store: STORES.la.name, tab: '30%', big: '30%', small: FTP, title: 'Los Angeles store deals', body: EXCLUDES, href: STORES.la.menu, cta: 'Shop LA',
    // 1.58:1, a 3% overscan box (1.06), zoom 1.13: h 1.58 x 1.06 x 1.13; w 72vw x 1.06 x 1.13; phone 1280w
    photo: 'store-la-floor', pic: { sizes: dealSizes({ h: 1.89, w: '86vw', phone: 426 }) } },
  { id: 'deal-sd', kind: 'num', store: STORES.sd.name, tab: '50%', big: '50%', small: FTP, title: 'San Diego store deals', body: EXCLUDES, href: STORES.sd.menu, cta: 'Shop San Diego',
    // the storefront at golden hour (deals.css "the San Diego card" sizes its box from the card's width: about 1.24 of
    // it less 29px, or 1.41 of its height on a tall stage), zoom 1.04: h 1.41 x 1.04; w (1.24 x 72vw - 29px) x 1.04;
    // phone 1600w
    photo: 'store-sd-front', pic: { sizes: dealSizes({ h: 1.47, w: 'calc(93vw - 30px)', phone: 533, byWidth: true }) },
    notes: ['The San Diego storefront photo is owner-supplied (2026-11-12); its door lettering looks AI-made, and its building number read 6240 (corrected locally to the store\'s 6220 by copying the photo\'s own "2"): confirm the source. Its banner shows "$25 grams top shelf" and "Mondays: $10 off any 1/2 oz": confirm those deals are current, or the banner should be retouched.'] },
  { id: 'deal-daily', kind: 'word', store: STORES.sd.short, tab: 'Daily', big: 'Daily', small: 'Deals', title: 'San Diego daily deals', body: 'Check out weekly deals on Weedmaps. Changing weekly!', href: STORES.sd.deals, cta: 'See today\'s deals',
    // the owner's ORIGINALS jar (daily-jar, 16:9; owner request 2026-11-12), framed in deals.css "the Daily deals card":
    // on the wide stage it covers the card, a 3% overscan box (1.06), zoom 1.13: h 1.78 x 1.06 x 1.13; w 72vw x 1.06 x
    // 1.13. Anywhere else it is a band across the card's top, about 300px tall on a phone, so drawn about 1.78 x 300 =
    // 530px wide: phone 1600w (its largest file, 2400w, is still short of 1x on a wide 2x stage).
    // tall: the owner's vertical version (daily-jar-tall, 2:3; owner, 2026-11-12: "use this and replace all the vertical
    // versions"), drawn instead wherever the card is taller than wide off the wide stage (deals.css): it covers the card,
    // about the card's width (the phone stack's whole width; half the still grid's row from 720px)
    photo: 'daily-jar', pic: { sizes: dealSizes({ h: 2.13, w: '86vw', phone: 533 }) },
    tall: { photo: 'daily-jar-tall', sizes: '(min-width: 720px) 50vw, 100vw' },
    notes: ['San Diego daily deals: the day-by-day list lives on the store\'s live deals page; confirm the deals to feature.',
      'The Daily deals card photos (an ORIGINALS jar, landscape and vertical) are owner-supplied (2026-11-12): confirm they are the client\'s own photos. The vertical one is 1024x1536, a standard AI image-generator size, so it is marked generated until confirmed.'] },
];
// one title card: its photo opens like a shutter (deals.css); the glare sits under the text column's gradient. On stage
// its texts smoke in (site.js "deals reel"); the button rises.
const dealCard = (x, i) => h`${(x.notes || []).map(confirm)}
        <article class="dl-card${x.side ? ' dl-card--side' : ''}" id="${x.id}" data-kind="${x.kind}" aria-labelledby="${x.id}-h" tabindex="-1"><div class="dl-face">
          <div class="dl-media">
            <div class="dl-photo${x.side ? ' dl-photo--side' : ''}">${img(x.photo, { sizes: '(min-width: 900px) 70vw, 100vw', ...x.pic, ...(x.tall ? { cls: 'dl-wide' } : {}) })}${x.tall ? img(x.tall.photo, { sizes: x.tall.sizes, cls: 'dl-tall' }) : ''}</div>
            <div class="dl-glare"></div><div class="dl-shade"></div><div class="dl-rim"></div>
          </div>
          <span class="dl-idx" aria-hidden="true">0${i + 1}</span>
          <div class="dl-copy">
            <p class="dl-store">${esc(x.store)}</p>
            <p class="dl-fig"><span class="dl-big">${esc(x.big)}</span> <span class="dl-small">${x.small}</span></p>
            <h3 class="dl-title" id="${x.id}-h">${esc(x.title)}</h3>
            ${x.body ? `<p class="dl-body">${x.body}</p>` : ''}
            <p class="dl-go dl-rise">${btn(esc(x.cta), x.href, { kind: 'chrome' })}</p>
          </div>
        </div></article>`;

export function home({ posts }) {
  const faqs = extractFaqs();
  const pick = (q) => faqs.find((f) => f.q.startsWith(q));
  const recent = ['thc-extract-for-fast-relief', 'cannabis-books-for-handy-reference', 'cannabis-legal-states-and-economic-growth'].map((s) => posts.find((p) => p.slug === s)).filter(Boolean);
  // the hero's facts line: under the letters during the dive, under the headline at the end
  const facts = `100% family owned and operated since <span class="hx-nw">2006 ·</span> <span class="hx-nw">Grown in-house ·</span> <span class="hx-nw">${esc(STORES.la.short)} ·</span> <span class="hx-nw">${esc(STORES.sd.short)}</span>`;

  const main = h`
${/* the chrome gradients stay: the footer wordmark fills with #chrome-face in the ?accent=red preview */ brandSymbols()}
<!-- 1. INTO THE FILM: the brand film plays inside the ORIGINALS letters; scrolling dives through the central I until the
     film is full-bleed, then the headline and the store actions arrive (styles hero.css, script site.js "home hero").
     The film is the client's own footage. -->
<section class="hx" id="hx" aria-labelledby="hx-h1" data-hero>
  <div class="hx-stage">
    <div class="hx-media" aria-hidden="true">
      <video class="hx-film" muted playsinline loop preload="metadata" poster="${imgFile('film-poster', 1920)}" disablepictureinpicture tabindex="-1">
        <source src="${a('video/film-640.mp4')}" type="video/mp4" media="(max-width: 699.98px)">
        <source src="${a('video/film-1920.mp4')}" type="video/mp4" media="(min-width: 1280px)">
        <source src="${a('video/film-1280.mp4')}" type="video/mp4">
      </video>
      <div class="hx-scrim"></div>
    </div>
    <div class="hx-veil" aria-hidden="true"></div>
    <div class="hx-slot" aria-hidden="true"></div>
    <div class="hx-rest" aria-hidden="true">
      ${crownMark('hx-crown')}
      <p>${facts}</p>
    </div>
    <button class="hx-toggle" type="button" data-state="paused" hidden>${icon('pause', 'hx-i-pause')}${icon('play', 'hx-i-play')}<span>Play film</span></button>
    <a class="hx-cue" href="#hx-copy"><span>Scroll</span><i aria-hidden="true"></i></a>
    <div class="hx-copy" id="hx-copy">
      <div class="hx-mark" aria-hidden="true"></div>
      <p class="hx-script" style="--i:0">${esc(SITE.brandBehind)}</p>
      <h1 class="hx-h1" id="hx-h1" tabindex="-1" style="--i:1"><span class="hx-l">Best Cultivators</span> <span class="hx-l">in ${chrome('California.')}</span></h1>
      <div class="hx-actions" style="--i:2">
        ${storeSwitch()}
        ${shopBtn('Shop Now<span class="sr-only"> (opens in a new tab)</span>', { kind: 'accent' })}
        ${btn('Our Story', '/our-story', { kind: 'ghost' })}
      </div>
      <p class="hx-award" style="--i:3"><span class="hx-award__gold">${img('award-badge', { sizes: '176px', alt: 'Award Winning' })}</span></p>
      <p class="hx-facts" style="--i:4">${facts}</p>
    </div>
  </div>
</section>

<!-- 3. THE MENU: shop by category in the showroom -->
<section class="band showroom" id="shop" aria-labelledby="shop-h">
  <div class="band__clip">${img('store-wall', { sizes: '100vw', cls: 'cover showroom__bg showroom__bg--wall', alt: '', decorative: true })}<div class="showroom__scrim"></div><div class="showroom__pool"></div><div class="grain"></div></div>
  <div class="wrap">
    <!-- below 1100px the hero has no room for the award emblem, so it glows here, between the hero and the menu (owner request) -->
    <p class="seam-award" data-award-lit><span class="hx-award__gold">${img('award-badge', { sizes: '(max-width: 759.98px) 62vw, 260px', alt: 'Award Winning' })}</span></p>
    <div class="section-head">
      ${kicker('The menu')}
      <h2 id="shop-h" data-reveal>Shop by <span class="chrome-word">category</span></h2>
      <p class="lede" data-reveal style="--i:1">Our online and in-store menu is robust and full of all your favorite products from extracts, edibles, flower, tinctures and more. Click on the pictures and browse our menu based on your favorite cannabis products.</p>
      <div class="section-head__tools" data-reveal style="--i:2"><span class="section-head__label">You're shopping</span>${storeSwitch()}</div>
    </div>
    ${confirm('Category descriptions on the cards are drafts written for the redesign (the live site has placeholder text): confirm the wording.')}
    ${categoryWall()}
    <p class="cats__note">Each card opens that category on the store you're shopping, with its cart. The San Diego menu has no drinks, tinctures, topicals or merch shelf, so in San Diego those open the full menu.</p>
    <p class="center">${shopBtn('Shop All', { kind: 'chrome' })}</p>
  </div>
</section>

<!-- 4. DEALS, "Spotlight Reel" (owner-approved lab option B): wide screens get a short pin (owner requests): the opening
     titles fill the stage, and the next 80vh of scroll docks them into the top of the rail, above the tabs (scrolling
     back undocks them); once docked, deal 01 plays, and each other deal plays only when it is picked on the rail (a
     tablist). Phones and short windows swipe a card stack (the same tabs above it); reduced motion and no JS keep the
     still grid, where the rail is hidden. Each card's texts smoke in when it takes the stage (owner request). Styles
     deals.css, script site.js "deals reel". -->
<section class="dl" id="deals" data-reel aria-labelledby="deals-h">
  <div class="dl-stage">
    <div class="dl-back" aria-hidden="true">
      ${img('night-street', { sizes: '100vw', cls: 'dl-base', decorative: true })}
      ${DEALS.map((x) => img(x.photo, { sizes: '25vw', cls: 'dl-amb', decorative: true }))}
      <div class="dl-spot"></div><div class="dl-beam dl-beam--l"></div><div class="dl-beam dl-beam--r"></div>
      <div class="dl-scrim"></div><div class="grain"></div>
    </div>
    <div class="dl-in">
      <header class="dl-intro">
        <div class="dl-sign" aria-hidden="true"><span class="dl-neon">Happy Hour</span><span class="dl-neon dl-neon--sub">All day Sunday</span></div>
        <h2 id="deals-h">Cannabis <span class="accent">deals</span></h2>
        <p class="lede">We value our cannabis community and we want to show our appreciation for our fam by offering the best and boldest cannabis deals in California.</p>
      </header>
      <div class="dl-rail">
        <ol role="tablist" aria-label="Deals">
          ${DEALS.map((x, i) => `<li role="none"><button class="dl-tab" type="button" role="tab" id="${x.id}-tab" aria-controls="${x.id}"><span class="dl-tab__n" aria-hidden="true">0${i + 1}</span><span class="dl-tab__store">${esc(x.store)}</span> <span class="dl-tab__big">${esc(x.tab)}</span><span class="dl-tab__bar" aria-hidden="true"><i></i></span></button></li>`)}
        </ol>
      </div>
      <div class="dl-reel">
        ${DEALS.map(dealCard)}
      </div>
      <p class="dl-all">${btn('All deals', '/deals', { kind: 'ghost' })}</p>
    </div>
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
      <!-- owner-supplied 2026-11-12 (the owner has not confirmed they are the client's photos): light-matched and graded, no AI. The alts come from images.json; each square crop is positioned to keep the faces in. -->
      ${confirm('The four album photos are owner-supplied and unconfirmed as the client\'s own; they show identifiable people (PITCH-NOTES #29).')}
      <figure class="polaroid" style="--r:-6deg;--x:2%;--y:4%" data-develop>${img('story-family-wall', { sizes: '(min-width: 900px) 30vw, 70vw', style: 'object-position: 50% 8%' })}<figcaption>The family wall</figcaption></figure>
      <figure class="polaroid" style="--r:5deg;--x:44%;--y:0%" data-develop>${img('story-grower-bud', { sizes: '(min-width: 900px) 26vw, 60vw', style: 'object-position: 45% 50%' })}<figcaption>Grown in-house</figcaption></figure>
      <figure class="polaroid" style="--r:-2deg;--x:12%;--y:50%" data-develop>${img('story-family-farms', { sizes: '(min-width: 900px) 22vw, 50vw', style: 'object-position: 50% 40%' })}<figcaption>Family Farms</figcaption></figure>
      <figure class="polaroid" style="--r:7deg;--x:52%;--y:46%" data-develop>${img('story-pouch', { sizes: '(min-width: 900px) 26vw, 60vw', style: 'object-position: 50% 45%' })}<figcaption>By OGs, for OGs</figcaption></figure>
    </div>
  </div>
</section>

<!-- 6. THE FAMILY WALL (owner requests 2026-11-12): the texts on the left, "the wall" on the right: a digital replica of
     the LA store's portrait wall, one seamless unit of its print repeated edge to edge, that scrolls left to right
     (under 900px: the texts, the controls, then the strip full-bleed). The band is plain white, its button ink (owner
     request 2026-11-12). Wide, the band is exactly as tall as the strip (owner request 2026-11-12: "reduce the section's
     height til edges of the photo wall"), and the controls sit in the text column under the button. Styles
     signature.css section 6, script site.js "the family wall". -->
<section class="band band--paper wall" id="family-wall" aria-labelledby="wall-h" data-wall>
  <div class="wall__grid">
    <div class="wall__copy">
      <div class="section-head wall__text">
        ${kicker('The family wall')}
        <h2 id="wall-h" data-reveal>Honoring the <span class="chrome-word chrome-word--accent">originals</span></h2>
        <p class="lede" data-reveal style="--i:1">Inside our Los Angeles store, giant ORIGINALS letters stand in front of a huge black-and-white wall of cultural originals: civil rights leaders, artists, athletes, icons. It's a living family wall. When legends visit, they sign it as another true original.</p>
        <p class="wall__cta">${btn('Visit the wall', STORES.la.page, { kind: 'ink' })}</p>
      </div>
      <div class="wall__ctrl">
        <p class="wall__hint" aria-hidden="true" data-reveal><span>Scroll</span>${icon('arrow')}</p>
        <div class="wall__btns" data-wall-btns hidden>
          <button type="button" class="wall__btn" data-wall-step="-1" aria-label="Previous photos" aria-controls="wall-photos">${icon('arrow')}</button>
          <button type="button" class="wall__btn" data-wall-step="1" aria-label="Next photos" aria-controls="wall-photos">${icon('arrow')}</button>
        </div>
      </div>
    </div>
    <div class="wall__stage">
      <!-- the wall's print as one seamless unit (family-wall-unit), repeated edge to edge as one continuous wall: no gaps, corners or shadows between copies. Its width and height come from images.json via img() (never hard-coded): copies = clamp(3, ceil(3600 / its width at 560px tall), 8), so the strip scrolls about 3 strip widths at 1440; the sizes hint is the strip height, clamp(380px, 44vw, 560px), times its aspect. The first copy carries the alt, the others are decorative. -->
      ${confirm("The digital wall is rebuilt from the business's own Google Maps listing photos (no AI); it reproduces the wall's portraits of famous people: confirm the client is cleared to show them on the website.")}
      <div class="wall__frame">
        <div class="wall__view" id="wall-photos" role="region" aria-label="Photos of the Originals family wall" tabindex="0" data-wall-view>
          <div class="wall__strip">${(() => {
            const [, iw, ih] = img('family-wall-unit').match(/ width="(\d+)" height="(\d+)"/), k = iw / ih;
            const copies = Math.min(8, Math.max(3, Math.ceil(3600 / (560 * k))));
            const sizes = `(min-width: 1273px) ${Math.round(560 * k)}px, (min-width: 864px) ${(44 * k).toFixed(2)}vw, ${Math.round(380 * k)}px`;
            return Array.from({ length: copies }, (_, i) => i
              ? img('family-wall-unit', { sizes, cls: 'wall__unit', decorative: true }).replace('<img', '<img aria-hidden="true"')
              : img('family-wall-unit', { sizes, cls: 'wall__unit' }));
          })()}</div>
        </div>
        <div class="wall__light" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</section>

<!-- 7. SUNDAY CRUISE, FROM THE FARM, "The Roadside Sign" (owner-picked lab option B, 2026-11-12; reference page
     src/lab/cruise-b.html): the house strains are a lit roadside pole sign on the boulevard (the header's own wordmark and
     crowns from parts.mjs, the ten lines from STRAINS), and the lowrider pulls up in front of its pole as you scroll, hops
     and cruises off; the copy sits on the other side of the scene. Styles cruise.css; script site.js "Sunday Cruise".
     The glass-board version is in private/retired/2026-11-12-cruise-glass-board/, the old farm band in
     private/retired/2026-11-12-farm-section/. -->
<section class="cb" id="cruise" aria-labelledby="cruise-h" data-cruise>
  <div class="cb-stage">
    <div class="cb-sky" aria-hidden="true">${img('boulevard', { sizes: '100vw', cls: 'cover', alt: '', decorative: true })}<div class="cb-dusk"></div><div class="cb-shade"></div><div class="cb-haze"></div></div>
    <div class="cb-scene wrap">
      <div class="cb-copy">
        ${kicker('From the farm')}
        <h2 id="cruise-h" class="cb-h">Grown by OGs, <span class="script accent">for OGs</span></h2>
        <p class="lede cb-lede">Originals was established in 2006, and specializes in premium quality indoor cannabis. We grow our own flower, and our OG cuts and Gelato built a cult following in LA.</p>
      </div>
      <div class="cb-sign" data-cb-sign>
        <div class="cb-cab">
          ${['t', 'r', 'b', 'l'].map((s) => `<i class="cb-bulbs cb-bulbs--${s}" aria-hidden="true"></i>`)}
          ${wordmark('cb-word')}
        </div>
        <div class="cb-board">
          <div class="cb-panel">
            <h3 class="cb-title" id="cruise-strains-k">${crownMark()}<span>House strains</span>${crownMark()}</h3>
            <ul class="cb-list" role="list" aria-labelledby="cruise-strains-k">
              ${STRAINS.map((s) => h`<li><a class="cb-line" href="${u('/strains#' + s.id)}"><span>${esc(s.name)}</span>${icon('arrow')}</a></li>`)}
            </ul>
          </div>
        </div>
        <div class="cb-hang">
          <i class="cb-chain cb-chain--l" aria-hidden="true"></i><i class="cb-chain cb-chain--r" aria-hidden="true"></i>
          <a class="cb-lib" href="${u('/strains')}"><span class="cb-lib__face"><span>Strain library</span>${icon('arrow')}</span></a>
        </div>
        <div class="cb-pole" aria-hidden="true"></div>
      </div>
    </div>
    <div class="cb-road" aria-hidden="true">
      <div class="cb-car" style="--cb-car-mask: url('${imgFile('lowrider', 1200)}')"><div class="cb-car__body" data-car>${img('lowrider', { sizes: '(min-width: 900px) 52vw, 96vw', alt: '', decorative: true })}<span class="cb-car__glint"></span></div><span class="cb-car__shadow"></span></div>
    </div>
  </div>
</section>

<!-- 8. STORES, "Editorial" (owner-picked lab option C, 2026-11-12, reference src/lab/parts/stores-c.html, with the
     owner's tweaks the same day: "merch should follow the same large layout and make it scrollable"). The title sits over
     a hairline, its "Scroll" hint and prev/next beside it. Then three numbered columns in a sideways scroller: 01 Los
     Angeles, 02 San Diego, 03 Originals Clothing. Two are in view from 900px; on phones one, with the next peeking. Each
     column has:
     - a strictly cropped photo;
     - a dateline tab: the number and the live status site.js fills in ("Online" for the clothing shop);
     - the name set very large under "Originals";
     - a ruled fact grid;
     - its buttons.
     The store buttons keep their own menus: no data-shop, or site.js would move them to the selected store. Styles
     stores.css; script site.js "the stores". The old three-card grid's storeCard() still serves /retail and /culture. -->
<section class="band stores" id="stores" aria-labelledby="stores-h" data-stores>
  <div class="wrap stores__head">
    <div class="stores__title">
      ${kicker('Our stores')}
      <h2 id="stores-h" data-reveal>Two stores. <span class="chrome-word">One family.</span></h2>
    </div>
    <div class="stores__ctrl">
      <p class="stores__hint" aria-hidden="true" data-reveal><span>Scroll</span>${icon('arrow')}</p>
      <div class="stores__btns" data-stores-btns hidden>
        <button type="button" class="stores__btn" data-stores-step="-1" aria-label="Previous store" aria-controls="stores-view">${icon('arrow')}</button>
        <button type="button" class="stores__btn" data-stores-step="1" aria-label="Next store" aria-controls="stores-view">${icon('arrow')}</button>
      </div>
    </div>
  </div>
  <div class="stores__frame">
    <div class="stores__view" id="stores-view" role="region" aria-label="Our stores" tabindex="0" data-stores-view>
      <div class="stores__row">${(() => {
        // the photo is one column wide: 84vw on phones, half the wrap from 900px
        const sizes = '(min-width: 1440px) 640px, (min-width: 900px) 45vw, 84vw';
        const no = (i) => `<span class="stores__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>`;
        const name = (key, href, pre, big) => `<h3 class="stores__name" id="stores-${key}-n">${link(href, `<span class="stores__pre">${esc(pre)}</span> <span class="stores__city">${esc(big)}</span>`)}</h3>`;
        const photo = { la: 'store-la-interior', sd: 'store-sd-interior' };
        const ids = Object.keys(STORES);
        const stores = ids.map((id, i) => { const s = STORES[id], pre = s.name.endsWith(s.short) ? s.name.slice(0, -s.short.length).trim() : s.name; return h`
        <article class="stores__col" data-store-card="${id}" aria-labelledby="stores-${id}-n">
          ${name(id, s.page, pre, s.short)}
          <div class="stores__tab">${no(i)}<p class="stores__status"><span class="stores__dot" data-status-dot="${id}"></span><span data-status-for="${id}">Hours below</span></p></div>
          <div class="stores__photo stores__photo--${id}">${img(photo[id], { sizes })}</div>
          <div class="stores__facts">
            <div class="stores__cell"><p class="stores__label">Address</p><address class="stores__addr">${esc(s.street)}<br>${esc(s.city)}, ${esc(s.region)} ${esc(s.postal)}</address></div>
            <div class="stores__cell"><p class="stores__label">Hours</p><dl class="stores__hours" data-hours>${s.hoursText.map(([d, t]) => `<div><dt>${esc(d)}</dt><dd>${esc(t)}</dd></div>`)}</dl></div>
            <div class="stores__cell stores__cell--call"><p class="stores__label">Call</p><a class="stores__tel" href="tel:${s.tel}">${esc(s.phone)}</a></div>
          </div>
          <p class="stores__foot">${s.attributes.map((t) => (t.confirm ? confirm(t.note) : '') + `<span class="chip">${esc(t.text)}</span>`)}<span class="stores__acts">${btn('Shop ' + s.short, s.menu, { size: 'sm' })}${btn('Directions', s.maps, { kind: 'ghost', size: 'sm' })}</span></p>
        </article>`; });
        // the clothing shop in the same layout: its status slot says "Online"; its words are the live site's own
        const clothing = h`
        <article class="stores__col stores__col--clothing" aria-labelledby="stores-clothing-n">
          ${name('clothing', LINKS.clothing, 'Originals', 'Clothing')}
          <div class="stores__tab">${no(ids.length)}<p class="stores__status"><span class="stores__dot stores__dot--on"></span><span>Online</span></p></div>
          <div class="stores__photo stores__photo--clothing">${img('clothing-shop', { sizes, alt: 'The Originals Clothing online store' })}</div>
          <div class="stores__facts">
            <div class="stores__cell stores__cell--wide"><p class="stores__label">Online</p><p class="stores__line">SHOP MERCH. OPEN 24/7.</p></div>
          </div>
          <p class="stores__foot"><span class="stores__acts">${btn('Shop merch', LINKS.clothing, { size: 'sm' })}</span></p>
        </article>`;
        return [...stores, clothing].join('');
      })()}
      </div>
    </div>
  </div>
</section>

<!-- 9. CULTURE: events and collabs -->
<section class="band culture" id="culture" aria-labelledby="culture-h">
  <div class="band__clip">${img('stage-wide', { sizes: '100vw', cls: 'cover culture__bg', alt: '', decorative: true })}<div class="culture__scrim"></div></div>
  <div class="wrap">
    <div class="section-head">
      ${kicker('Culture')}
      <h2 id="culture-h" data-reveal>Lit like our <span class="chrome-word">events</span></h2>
      <p class="lede" data-reveal style="--i:1">Car shows, block parties, release nights and the family behind them.</p>
    </div>
    <!-- the event cards as a lenticular carousel (owner request 2026-11-12; an original build of the effect from a
         public description, no third-party code): each card turns over like a lenticular print, from the black-and-white
         artwork to its colour face and label. Styles lenticular.css; script site.js "lenticular". No script: this row. -->
    <div class="ln" data-lenticular role="region" aria-roledescription="carousel" aria-labelledby="culture-h">
      <div class="ln-viewport">
        <ul class="ln-track" role="list">
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="1 of 3"><a class="ln-card" href="${u('/events#lowrider-super-show')}" draggable="false">${img('flyer-carshow', { sizes: '(min-width: 720px) 30vw, 80vw', alt: 'Lowrider car show flyer: Los Angeles 2026 Finale', cls: 'ln-art' })}<span class="ln-reveal"><span class="ln-label">Lowrider Magazine Super Show</span></span></a></li>
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="2 of 3"><a class="ln-card" href="${u('/originals-hall-of-flowers-palm-springs-recap')}" draggable="false">${img('hof-graphic', { sizes: '(min-width: 720px) 30vw, 80vw', alt: 'Hall of Flowers Palm Springs 2021 graphic with Originals and The Cure Company', cls: 'ln-art' })}<span class="ln-reveal"><span class="ln-label">Hall of Flowers recap</span></span></a></li>
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="3 of 3"><a class="ln-card ln-card--type" href="${u('/events')}" draggable="false">${img('stage', { sizes: '(min-width: 720px) 30vw, 80vw', cls: 'ln-art', alt: '', decorative: true })}<span class="ln-type"><span class="ln-type__k">Coming to a city near you</span><span class="ln-type__t">Originals Takeover</span><span class="ln-type__s">Palm Springs</span></span></a></li>
        </ul>
      </div>
      <div class="ln-ctrl" data-ln-ctrl hidden>
        <button type="button" class="ln-btn ln-btn--prev" data-ln-prev aria-label="Previous event">${icon('arrow')}</button>
        <span class="ln-rail" aria-hidden="true"><i></i><i></i><i></i></span>
        <button type="button" class="ln-btn" data-ln-next aria-label="Next event">${icon('arrow')}</button>
      </div>
      <p class="sr-only" data-ln-status aria-live="polite"></p>
    </div>
    <div class="collab-tape" id="collab-tape" aria-label="Collabs">
      ${confirm('Collab partners and product names (Chris Brown / Bussin\' with OHB Farms, Xzibit / Napalm, Ice Cube / Caviar Gold, Mike Tyson / Tyson Ranch, Nipsey Hussle / Marathon OG, Royal Blunts, Beast Mode, Dodi Oakland): confirm each with the client before launch.')}
      <ul class="collab-tape__track" role="list" data-marquee>
        ${[false, true].map((dup) => COLLABS.map((c) => {
          // the item twice (the copy aria-hidden) for a seamless loop; its real logo, logo-<slug> (white first), where one was
          // found (private/client-media/brand-logos/provenance.json), else its name; its small with / collab line kept
          const name = c.product || c.partner, id = 'logo-' + name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          let mark = '';
          for (const k of [id + '-white', id]) {
            try { mark = img(k, { cls: 'collab-tape__logo', sizes: '202px', alt: name + ' logo', decorative: dup, eager: true }); break; }
            catch (e) { if (!/^unknown image/.test(e.message)) throw e; }
          }
          return `<li${dup ? ' aria-hidden="true"' : ''}>${mark || `<strong>${esc(name)}</strong>`}${c.product ? `<span>with ${esc(c.partner)}${c.with ? ' and ' + esc(c.with) : ''}</span>` : '<span>collab</span>'}</li>`;
        }).join('')).join('')}
      </ul>
    </div>
    <div class="collab-tape__ctl"><button class="bmq__toggle" type="button" data-marquee-toggle data-label="collabs" data-state="playing" aria-controls="collab-tape" aria-label="Pause collabs" hidden>${icon('pause', 'bmq__i-pause')}${icon('play', 'bmq__i-play')}</button></div>
    <p class="btn-row">${btn('Events', '/events', { kind: 'red' })}${btn('Collabs', '/collabs', { kind: 'ghost' })}</p>
  </div>
</section>

<!-- 10. BRANDS + CANNABLOG -->
<section class="band brands-band" id="brands" aria-labelledby="brands-h">
  <div class="wrap">
    <div class="section-head">
      ${kicker('The Brand Behind The Brands')}
      <h2 id="brands-h" data-reveal>Shop by <span class="chrome-word">brand</span></h2>
      <p class="lede" data-reveal style="--i:1">Originals carries some of the top-rated brands throughout California. We strive to offer the widest selection possible. So stop in or browse online.</p>
    </div>
  </div>
  <div class="bmq" id="brands-marquee">
    ${[0, 1].map((r) => `<div class="bmq__row bmq__row--${r ? 'right' : 'left'}" data-reveal style="--i:${r + 2}"><div class="bmq__rail">${[false, true].map((dup) => `<ul class="bmq__track" role="list"${dup ? ' aria-hidden="true"' : ''}>${BRANDS.filter((_, i) => i % 2 === r).map((b) => {
      // the brand's logo-<b.logo>, else logo-<its menu slug without the number>, its -white version first when one exists
      // (the marquee shows every mark white on dark); a brand with no logo keeps its name
      let mark = '';
      const id = 'logo-' + (b.logo || b.la.match(/brands\/([a-z0-9-]+?)-\d+\/$/)[1]);
      for (const k of [id + '-white', id]) {
        try { mark = img(k, { sizes: '(max-width: 600px) 116px, 168px', alt: b.name + ' logo', decorative: dup, eager: true }); break; }
        catch (e) { if (!/^unknown image/.test(e.message)) throw e; }
      }
      return `<li><a class="bmq__tile" href="${esc(b.la)}" target="_blank" rel="noopener"${dup ? ' tabindex="-1"' : ''}>${mark || `<span>${esc(b.name)}</span>`}</a></li>`;
    }).join('')}</ul>`).join('')}</div></div>`)}
  </div>
  <div class="wrap">
    <p class="center bmq__cta">${btn('Shop All Brands', '/brands', { kind: 'chrome' })}<button class="bmq__toggle" type="button" data-marquee-toggle data-label="brand logos" data-state="playing" aria-controls="brands-marquee" aria-label="Pause brand logos" hidden>${icon('pause', 'bmq__i-pause')}${icon('play', 'bmq__i-play')}</button></p>
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

<!-- 11. DROP LIST + FAQ (owner 2026-11-12: "make it more compact and balanced"; droplist.css): the sign-up and the FAQs
     as two columns that start and end together -->
<section class="band droplist" aria-labelledby="drop-h">
  <div class="band__clip"><div class="bandana droplist__bandana"></div><div class="droplist__scrim"></div></div>
  <div class="wrap grid-2 droplist__grid">
    <div class="droplist__join">
      ${kicker('The drop list')}
      <h2 id="drop-h" data-reveal>Subscribe to our newsletter and get the latest update on deals, events &amp; more</h2>
      ${form({ id: 'home-drop', fields: [{ name: 'name', label: 'Name', autocomplete: 'name' }, { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider' })}
    </div>
    <div class="droplist__faqs">
      ${kicker('FAQs')}
      ${faqList([pick('Do you take credit'), pick('Do you deliver'), pick('Do I need to show'), pick('Do you offer any discounts')].filter(Boolean))}
      <p class="droplist__all">${btn('All FAQs', '/faqs', { kind: 'ghost', size: 'sm' })}</p>
    </div>
  </div>
</section>`;

  return {
    path: '/',
    file: 'index.html',
    title: 'Best Dispensary in Los Angeles | Originals LA',
    description: 'Originals: family owned and operated since 2006, award-winning flower grown in-house. Shop Originals Los Angeles and Originals San Diego by category, brand and deal.',
    jsonld: [orgLd(), websiteLd(), ...storesLd()],
    preload: [{ href: imgFile('film-poster', 1920), as: 'image', fetchpriority: 'high' }],
    // the hero's dive (hero.css html.hx-live) and the cruise's motion (cruise.css html.cb-live) are set before paint, as in
    // the lab, unless reduced motion; site.js keeps them in step
    extraHead: `<script>(function(h){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('hx-live','cb-live')}catch(e){}})(document.documentElement);</script>`,
    bodyClass: 'is-home',
    main,
  };
}
