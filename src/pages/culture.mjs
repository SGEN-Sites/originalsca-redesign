// culture.mjs: /events, /media, /drops, /find-originals.
import { h, esc, u, a, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, shopBtn, img, imgFile, bgVideo, form, icon, storeCard } from '../lib/parts.mjs';
import { SITE, STORES, EVENTS, SOCIAL, LINKS, BRANDS } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

const igLinks = () => SOCIAL.filter((s) => s.icon === 'ig').map((s) => `<a class="chip chip--link" href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.short)}</a>`).join('');

export function pages() {
  const trailPics = ['flyer-carshow', 'hof-graphic', 'hof-mixer', 'sd-banner', 'gelato-box', 'preroll-3'].map((id) => imgFile(id, 600));
  const ev = (e, i) => h`<article class="event${e.img ? ' event--img' : ''}" id="${e.id}" data-reveal data-tilt style="--i:${i % 3}">
  ${e.img ? `<div class="event__media">${img(e.img, { sizes: '(min-width: 900px) 30vw, 90vw' })}</div>` : `<div class="event__poster" aria-hidden="true"><span class="event__crown">${icon('crown')}</span></div>`}
  <div class="event__body">
    <p class="event__k">${esc(e.kind)}</p>
    <h3 class="event__t">${esc(e.name)}</h3>
    ${e.line ? `<p class="event__line">${esc(e.line)}</p>` : ''}
    ${e.post ? btn('Read the recap', e.post, { kind: 'ghost', size: 'sm' }) : e.id === 'bussin-release' ? btn('Bussin\'', '/bussin-merch', { kind: 'ghost', size: 'sm' }) : ''}
  </div>
</article>`;

  const events = {
    path: '/events', title: 'Events | Originals', description: 'Originals events: car shows, block parties, release nights, takeovers and the family behind them.',
    jsonld: [crumbsLd([{ name: 'Events', path: '/events' }])], active: '/events', bodyClass: 'is-events',
    main: h`<section class="phero phero--stage phero--events" data-phero>
  <div class="phero__clip" aria-hidden="true">${bgVideo({ src: a('video/stage-1280.mp4'), poster: imgFile('loop-stage', 1280) })}<div class="neon-tube"></div><div class="phero__scrim"></div><div class="grain"></div></div>
  <div class="trail" data-trail='${JSON.stringify(trailPics)}' aria-hidden="true"></div>
  <div class="phero__inner wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li>${link('/', 'Home')}</li><li><span aria-current="page">Events</span></li></ol></nav>
    ${kicker('Culture')}
    <h1 class="phero__title">Lit like our <span class="chrome-word">events</span></h1>
    <div class="phero__lede"><p>Car shows, block parties, release nights and takeovers. Move your cursor across the stage to flip through the flyers.</p></div>
    <div class="phero__actions">${btn('Get on the drop list', '/drops')}${btn('Collabs', '/collabs', { kind: 'ghost' })}</div>
  </div>
</section>
<section class="band upcoming" aria-labelledby="up-h">
  <div class="wrap">
    <div class="section-head">${kicker('Upcoming')}<h2 id="up-h">Next <span class="chrome-word">up</span></h2><p class="lede">New dates drop to the list and on Instagram first.</p></div>
    <div class="upcoming__grid">
      ${confirm('Upcoming event 1: name, date, venue and ticket/RSVP link to be supplied by the client.')}
      <article class="up-card"><p class="up-card__date"><span class="up-card__m">TBA</span><span class="up-card__d">Date</span></p><div><p class="event__k">Takeover</p><h3>Originals Takeover</h3><p>Coming to a city near you.</p></div><p>${btn('Get the date', '/drops', { size: 'sm' })}</p></article>
      ${confirm('Upcoming event 2: name, date, venue and RSVP link to be supplied by the client.')}
      <article class="up-card"><p class="up-card__date"><span class="up-card__m">TBA</span><span class="up-card__d">Date</span></p><div><p class="event__k">Release night</p><h3>The next drop</h3><p>The next strain release party, announced to the drop list first.</p></div><p>${btn('Join the list', '/drops', { size: 'sm', kind: 'chrome' })}</p></article>
      ${confirm('Upcoming event 3: name, date, venue and RSVP link to be supplied by the client.')}
      <article class="up-card"><p class="up-card__date"><span class="up-card__m">TBA</span><span class="up-card__d">Date</span></p><div><p class="event__k">In store</p><h3>At the stores</h3><p>In-store events at Originals Los Angeles and Originals San Diego.</p></div><p>${btn('Our stores', '/retail', { size: 'sm', kind: 'ghost' })}</p></article>
    </div>
    <p class="chips mt">${igLinks()}</p>
  </div>
</section>
<section class="band band--concrete" aria-labelledby="past-h">
  <div class="wrap">
    <div class="section-head">${kicker('Highlights')}<h2 id="past-h">Past <span class="chrome-word">highlights</span></h2></div>
    <div class="event-grid">${EVENTS.map(ev)}</div>
  </div>
</section>`,
  };

  const gallery = ['flyer-carshow', 'hof-graphic', 'sd-banner', 'gelato-box', 'hof-mixer', 'sd-script', 'preroll-3', 'farmers-cup', 'bud-box', 'preroll-1', 'gelato-jar', 'la-lockup'];
  const media = {
    path: '/media', title: 'Media | Originals', description: 'The Originals brand film, flyers and graphics from the family album.',
    jsonld: [crumbsLd([{ name: 'Media', path: '/media' }])], active: '/events', bodyClass: 'is-media',
    main: h`${pageHero({ kicker: 'Media', title: 'The <span class="chrome-word">film</span>', crumbs: [{ label: 'Media', href: '/media' }], variant: 'ink', lede: '<p>The Originals brand film, and the flyers and graphics from the family album.</p>' })}
<section class="band band--tight film-band" aria-label="Brand film">
  <div class="wrap">
    <div class="film-player" role="group" aria-label="Originals brand film">
      <video controls playsinline preload="none" poster="${imgFile('film-poster', 1280)}" width="1280" height="720"><source src="${a('video/film-1280.mp4')}" type="video/mp4"></video>
      <p class="film-player__cap">Originals brand film.</p>
    </div>
  </div>
</section>
<section class="band" aria-labelledby="fl-h">
  <div class="wrap">
    <div class="section-head">${kicker('From the album')}<h2 id="fl-h">Flyers and <span class="chrome-word">graphics</span></h2></div>
    <div class="masonry">${gallery.map((id, i) => `<figure class="masonry__item" data-reveal style="--i:${i % 4}">${img(id, { sizes: '(min-width: 900px) 30vw, 46vw' })}</figure>`).join('')}</div>
  </div>
</section>
<section class="band band--tight">
  <div class="wrap"><div class="find-strip">
    ${confirm('Press and media contact: confirm the address the client wants for press requests (the live site lists info@originalsca.com).')}
    <div><p class="kicker">Press and media</p><h2 class="h3">Working on a story about <span class="chrome-word">Originals</span>?</h2><p>Write to <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>.</p></div>
    <p class="chips">${igLinks()}</p>
  </div></div>
</section>`,
  };

  const drops = {
    path: '/drops', title: 'The Drop List | Originals', description: 'Get on the Originals drop list: new strain and merch drops, special events, rewards and deals.',
    jsonld: [crumbsLd([{ name: 'Drops', path: '/drops' }])], active: '/events', bodyClass: 'is-drops',
    main: h`${pageHero({ kicker: 'The drop list', title: 'Don\'t miss the <span class="chrome-word">next drop</span>', crumbs: [{ label: 'Drops', href: '/drops' }], lede: '<p>Opt-in to learn about special events, rewards, deals, and new drops!</p>', media: `<div class="phero__pattern bandana"></div>`, variant: 'pattern' })}
<section class="band" aria-labelledby="dr-h">
  <div class="wrap split">
    <div>
      ${kicker('Sign up')}
      <h2 id="dr-h">SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS &amp; <span class="chrome-word">more</span></h2>
      ${form({ id: 'drops', fields: [{ name: 'name', label: 'Name', autocomplete: 'name' }, { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }, { name: 'store', label: 'Your store', type: 'radio', options: ['Originals Los Angeles', 'Originals San Diego'] }, { name: 'optin', type: 'checkbox', label: 'I am 21 or older (or 18+ with a medical recommendation) and agree to the ' + link('/membership_agreement', 'opt-in terms') + '.', required: true }], submit: 'Get on the list', confirmNote: 'drop list (SMS / email) provider' })}
    </div>
    <div class="stack">
      ${confirm('Next drop: strain or merch name and date to be supplied by the client.')}
      <article class="up-card up-card--tall"><p class="up-card__date"><span class="up-card__m">Next</span><span class="up-card__d">Drop</span></p><div><p class="event__k">Announced to the list first</p><h3>The next drop</h3><p>The list hears it first.</p></div></article>
      <article class="up-card up-card--tall"><p class="up-card__date"><span class="up-card__m">Last</span><span class="up-card__d">Drop</span></p><div><p class="event__k">Collab strain</p><h3>Bussin'</h3><p>Launched with a strain release party.</p></div><p>${btn('Bussin\'', '/bussin-merch', { size: 'sm', kind: 'ghost' })}</p></article>
    </div>
  </div>
</section>`,
  };

  const originals = BRANDS.find((b) => b.name === 'Originals');
  const find = {
    path: '/find-originals', title: 'Find Originals | Originals', description: 'Find Originals flower: the Originals house brand is stocked at many other dispensaries in California and Massachusetts.',
    jsonld: [crumbsLd([{ name: 'Find Originals', path: '/find-originals' }])], active: '/shop', bodyClass: 'is-find',
    main: h`${pageHero({ kicker: 'Find Originals', title: 'Find <span class="chrome-word">Originals</span>', crumbs: [{ label: 'Find Originals', href: '/find-originals' }], lede: '<p>The Originals house brand is stocked at many other dispensaries in California and Massachusetts.</p>', media: img('boulevard', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo', actions: btn('Shop Originals in LA', originals.la) + btn('Wholesale', '/wholesale', { kind: 'ghost' }) })}
${confirm('Retailer list: the client\'s list of dispensaries in California and Massachusetts that carry Originals (name, city, link) is needed to fill this page\'s locator.')}
<section class="band" aria-labelledby="fo-h">
  <div class="wrap">
    <div class="section-head">${kicker('At the source')}<h2 id="fo-h">Shop Originals at <span class="chrome-word">Originals</span></h2><p class="lede">Shop the house brand at our own stores in Los Angeles and San Diego.</p></div>
    <div class="stores__grid stores__grid--two">${storeCard('la', { photo: img('store-la-interior', { sizes: '(min-width: 900px) 44vw, 92vw' }) })}${storeCard('sd', { photo: img('store-sd-building', { sizes: '(min-width: 900px) 44vw, 92vw' }) })}</div>
  </div>
</section>
<section class="band band--concrete" aria-labelledby="fo2-h">
  <div class="wrap split">
    <div class="stack">${kicker('Everywhere else')}<h2 id="fo2-h">Ask for Originals <span class="chrome-word">by name</span></h2><p class="lede">Our flower is on menus across California and Massachusetts. Ask your budtender for Originals, the brand behind the brands.</p></div>
    <div class="locator" aria-label="Retailer locator">
      <p class="locator__state">California</p><p class="locator__state">Massachusetts</p>
      <p class="btn-row">${btn('Carry Originals in your shop', '/wholesale', { kind: 'chrome', size: 'sm' })}</p>
    </div>
  </div>
</section>`,
  };
  return [events, media, drops, find];
}
