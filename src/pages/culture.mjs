// culture.mjs: /events, /media, /drops, /find-originals.
// Redesigned 2026-11-12 to the owner-approved design language (docs/DESIGN-LANGUAGE.md); styles culture-pages.css.
// - /events: the Upcoming dates as an editorial grid (numbered columns, hairlines, the names set large, a ruled Date
//   fact); the highlights as the home's lenticular carousel (lenticular.css, site.js "lenticular") over a numbered,
//   ruled list of every event (each keeps its id: the home links /events#lowrider-super-show).
// - /media: the film as the hero's picture, beside its words; the album as a white "lights-on" sideways strip that reuses the
//   home Family Wall's markup, styles and script (data-wall: signature.css section 6, site.js "the family wall").
// - /drops: the sign-up and the drops as two balanced columns (the home Drop List's layout); the drops as editorial items.
// - /find-originals: the owner's own Originals jar photo in the hero; the stores as the home Stores' "Editorial" columns
//   (stores.css .stores__col, in a two-column spread); the states as a ruled, numbered list.
import { h, esc, u, a, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, shopBtn, img, imgFile, bgVideo, form, icon, storeCard } from '../lib/parts.mjs';
import { SITE, STORES, EVENTS, SOCIAL, LINKS, BRANDS } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

const no = (i) => String(i + 1).padStart(2, '0');
// the Instagram handles as a sign-off row (the editorial footer's): each a 44px link with its icon
const igLinks = () => SOCIAL.filter((s) => s.icon === 'ig').map((s) => `<a class="cp-handle" href="${esc(s.href)}" target="_blank" rel="noopener">${icon('ig')}<span>${esc(s.short)}</span></a>`).join('');
// an editorial item (the home Stores' "Editorial" pattern): its number and dateline, its kind, the name set large, its line, its button
const edItem = ({ i, tab, k, name, text, acts = '', pre = '' }) => h`${pre}<li class="cp-ed__item" data-reveal style="--i:${i}">
  <p class="cp-ed__tab"><span class="cp-ed__no" aria-hidden="true">${no(i)}</span>${tab}</p>
  <p class="cp-ed__k">${k}</p>
  <h3 class="cp-ed__name">${name}</h3>
  <p class="cp-ed__text">${text}</p>
  ${acts ? `<p class="cp-ed__acts">${acts}</p>` : ''}
</li>`;
const dateTab = (v) => `<span class="cp-ed__d"><span class="cp-ed__dl">Date</span> <span class="cp-ed__dv">${v}</span></span>`;

export function pages() {
  const trailPics = ['flyer-carshow', 'hof-graphic', 'hof-mixer', 'sd-banner', 'gelato-box', 'preroll-3'].map((id) => imgFile(id, 600));
  // every event as a numbered, ruled row; its recap or Bussin' button where it has one
  const row = (e, i) => {
    const act = e.post ? btn('Read the recap', e.post, { kind: 'ghost', size: 'sm' }) : e.id === 'bussin-release' ? btn('Bussin\'', '/bussin-merch', { kind: 'ghost', size: 'sm' }) : '';
    return h`<li class="cp-row" id="${e.id}" data-reveal style="--i:${i % 5}">
  <span class="cp-row__no" aria-hidden="true">${no(i)}</span>
  <div class="cp-row__body"><p class="cp-row__k">${esc(e.kind)}</p><h3 class="cp-row__t">${esc(e.name)}</h3>${e.line ? `<p class="cp-row__line">${esc(e.line)}</p>` : ''}</div>
  ${act ? `<p class="cp-row__act">${act}</p>` : ''}
</li>`;
  };
  const lowrider = EVENTS.find((e) => e.id === 'lowrider-super-show'), hof = EVENTS.find((e) => e.id === 'hall-of-flowers'), takeover = EVENTS.find((e) => e.id === 'takeover');
  const lnSizes = '(min-width: 720px) 30vw, 80vw';

  const events = {
    path: '/events', title: 'Events | Originals', description: 'Originals events: car shows, block parties, release nights, takeovers and the family behind them.',
    jsonld: [crumbsLd([{ name: 'Events', path: '/events' }])], active: '/events', bodyClass: 'is-events',
    main: h`<section class="phero phero--stage phero--events cp-hero" data-phero>
  <div class="phero__clip" aria-hidden="true">${bgVideo({ src: a('video/stage-1280.mp4'), poster: imgFile('loop-stage', 1280), ai: true })}<div class="neon-tube"></div><div class="phero__scrim"></div><div class="grain"></div></div>
  <div class="trail" data-trail='${JSON.stringify(trailPics)}' aria-hidden="true"></div>
  <div class="phero__inner wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li>${link('/', 'Home')}</li><li><span aria-current="page">Events</span></li></ol></nav>
    ${kicker('Culture')}
    <h1 class="phero__title">Lit like our <span class="chrome-word">events</span></h1>
    <div class="phero__lede"><p>Car shows, block parties, release nights and takeovers. Move your cursor across the stage to flip through the flyers.</p></div>
    <div class="phero__actions">${btn('Get on the drop list', '/drops')}${btn('Collabs', '/collabs', { kind: 'ghost' })}</div>
  </div>
</section>
<section class="band cp-band upcoming" aria-labelledby="up-h">
  <div class="wrap">
    <div class="cp-head">${kicker('Upcoming')}<h2 id="up-h">Next <span class="chrome-word">up</span></h2><p class="lede">New dates drop to the list and on Instagram first.</p></div>
    <ol class="cp-ed" role="list">
      ${edItem({ i: 0, pre: confirm('Upcoming event 1: name, date, venue and ticket/RSVP link to be supplied by the client.'), tab: dateTab('TBA'), k: 'Takeover', name: 'Originals Takeover', text: 'Coming to a city near you.', acts: btn('Get the date', '/drops', { size: 'sm' }) })}
      ${edItem({ i: 1, pre: confirm('Upcoming event 2: name, date, venue and RSVP link to be supplied by the client.'), tab: dateTab('TBA'), k: 'Release night', name: 'The next drop', text: 'The next strain release party, announced to the drop list first.', acts: btn('Join the list', '/drops', { size: 'sm', kind: 'chrome' }) })}
      ${edItem({ i: 2, pre: confirm('Upcoming event 3: name, date, venue and RSVP link to be supplied by the client.'), tab: dateTab('TBA'), k: 'In store', name: 'At the stores', text: 'In-store events at Originals Los Angeles and Originals San Diego.', acts: btn('Our stores', '/retail', { size: 'sm', kind: 'ghost' }) })}
    </ol>
    <p class="cp-handles">${igLinks()}</p>
  </div>
</section>
<section class="band cp-band cp-past" aria-labelledby="past-h">
  <div class="wrap">
    <div class="cp-head">${kicker('Highlights')}<h2 id="past-h">Past <span class="chrome-word">highlights</span></h2></div>
    <!-- the home events' lenticular carousel (lenticular.css, site.js "lenticular"): the two events with the brand's own
         artwork, and the Takeover's lettering over the stage; each card turns from black and white to colour. No script:
         the plain row of cards. -->
    <div class="ln" data-lenticular role="region" aria-roledescription="carousel" aria-labelledby="past-h">
      <div class="ln-viewport">
        <ul class="ln-track" role="list">
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="1 of 3"><a class="ln-card" href="#${lowrider.id}" draggable="false">${img(lowrider.img, { sizes: lnSizes, cls: 'ln-art' })}<span class="ln-reveal"><span class="ln-label">${esc(lowrider.name)}</span></span></a></li>
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="2 of 3"><a class="ln-card" href="${u(hof.post)}" draggable="false">${img(hof.img, { sizes: lnSizes, cls: 'ln-art' })}<span class="ln-reveal"><span class="ln-label">Hall of Flowers recap</span></span></a></li>
          <li class="ln-slide" role="group" aria-roledescription="slide" aria-label="3 of 3"><a class="ln-card ln-card--type" href="#${takeover.id}" draggable="false">${img('stage', { sizes: lnSizes, cls: 'ln-art', alt: '', decorative: true })}<span class="ln-type"><span class="ln-type__k">${esc(takeover.line)}</span><span class="ln-type__t">Originals Takeover</span><span class="ln-type__s">Palm Springs</span></span></a></li>
        </ul>
      </div>
      <div class="ln-ctrl" data-ln-ctrl hidden>
        <button type="button" class="ln-btn ln-btn--prev" data-ln-prev aria-label="Previous event">${icon('arrow')}</button>
        <span class="ln-rail" aria-hidden="true"><i></i><i></i><i></i></span>
        <button type="button" class="ln-btn" data-ln-next aria-label="Next event">${icon('arrow')}</button>
      </div>
      <p class="sr-only" data-ln-status aria-live="polite"></p>
    </div>
    <ol class="cp-list" role="list">${EVENTS.map(row)}</ol>
  </div>
</section>`,
  };

  // the album: each piece whole at its own shape, never taller than its file (a small graphic is not blown up)
  const gallery = ['flyer-carshow', 'hof-graphic', 'sd-banner', 'gelato-box', 'hof-mixer', 'sd-script', 'preroll-3', 'farmers-cup', 'bud-box', 'preroll-1', 'gelato-jar', 'la-lockup'];
  const albumPic = (id) => {
    const [, iw, ih] = img(id).match(/ width="(\d+)" height="(\d+)"/).map(Number), hh = Math.min(420, ih);
    return img(id, { sizes: `${Math.round(hh * iw / ih)}px`, cls: 'wall__unit cp-album__pic', style: `--nh:${ih}px` });
  };
  const media = {
    path: '/media', title: 'Media | Originals', description: 'The Originals brand film, flyers and graphics from the family album.',
    jsonld: [crumbsLd([{ name: 'Media', path: '/media' }])], active: '/events', bodyClass: 'is-media',
    // the hero is type-led and the film is its picture: the words on the left, the player beside them (phones: under them)
    main: h`<section class="phero phero--ink cp-hero cp-hero--film" data-phero>
  <div class="phero__inner wrap cp-filmhero">
    <div class="cp-filmhero__copy">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li>${link('/', 'Home')}</li><li><span aria-current="page">Media</span></li></ol></nav>
      ${kicker('Media')}
      <h1 class="phero__title">The <span class="chrome-word">film</span></h1>
      <div class="phero__lede"><p>The Originals brand film, and the flyers and graphics from the family album.</p></div>
    </div>
    <div class="cp-film__player" role="group" aria-label="Originals brand film">
      <video controls playsinline preload="none" poster="${imgFile('film-poster', 1280)}" width="1280" height="720"><source src="${a('video/film-1280.mp4')}" type="video/mp4"></video>
      <p class="cp-film__cap">Originals brand film.</p>
    </div>
  </div>
</section>
<!-- the album: a white "lights-on" band with a sideways strip, the home Family Wall's (signature.css section 6, site.js
     "the family wall"; native scroll, a mouse drag, prev/next, the Scroll hint, edge fades). No script: a plain
     scrolling row. -->
<section class="band band--paper wall cp-album" id="album" aria-labelledby="fl-h" data-wall>
  <div class="wall__grid">
    <div class="wall__copy">
      <div class="section-head wall__text">${kicker('From the album')}<h2 id="fl-h">Flyers and <span class="chrome-word">graphics</span></h2></div>
      <div class="wall__ctrl">
        <p class="wall__hint" aria-hidden="true" data-reveal><span>Scroll</span>${icon('arrow')}</p>
        <div class="wall__btns" data-wall-btns hidden>
          <button type="button" class="wall__btn" data-wall-step="-1" aria-label="Previous photos" aria-controls="album-photos">${icon('arrow')}</button>
          <button type="button" class="wall__btn" data-wall-step="1" aria-label="Next photos" aria-controls="album-photos">${icon('arrow')}</button>
        </div>
      </div>
    </div>
    <div class="wall__stage">
      <div class="wall__frame">
        <div class="wall__view" id="album-photos" role="region" aria-label="Flyers and graphics" tabindex="0" data-wall-view>
          <div class="wall__strip">${gallery.map(albumPic)}</div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="band cp-press" aria-labelledby="press-h">
  <div class="wrap cp-press__in">
    ${confirm('Press and media contact: confirm the address the client wants for press requests (the live site lists info@originalsca.com).')}
    <div><p class="kicker">Press and media</p><h2 class="h3" id="press-h">Working on a story about <span class="chrome-word">Originals</span>?</h2><p class="cp-press__mail">Write to <a href="mailto:${SITE.email}">${esc(SITE.email)}</a>.</p></div>
    <p class="cp-handles">${igLinks()}</p>
  </div>
</section>`,
  };

  const drops = {
    path: '/drops', title: 'The Drop List | Originals', description: 'Get on the Originals drop list: new strain and merch drops, special events, rewards and deals.',
    jsonld: [crumbsLd([{ name: 'Drops', path: '/drops' }])], active: '/events', bodyClass: 'is-drops',
    main: h`${pageHero({ kicker: 'The drop list', title: 'Don\'t miss the <span class="chrome-word">next drop</span>', crumbs: [{ label: 'Drops', href: '/drops' }], lede: '<p>Opt-in to learn about special events, rewards, deals, and new drops!</p>', media: `<div class="phero__pattern bandana"></div>`, variant: 'pattern', cls: 'cp-hero' })}
<section class="band cp-drops" aria-labelledby="dr-h">
  <div class="wrap cp-drops__grid">
    <div class="cp-drops__join">
      ${kicker('Sign up')}
      <h2 id="dr-h">SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS &amp; <span class="chrome-word">more</span></h2>
      ${form({ id: 'drops', fields: [{ name: 'name', label: 'Name', autocomplete: 'name' }, { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }, { name: 'store', label: 'Your store', type: 'radio', options: ['Originals Los Angeles', 'Originals San Diego'] }, { name: 'optin', type: 'checkbox', label: 'I am 21 or older (or 18+ with a medical recommendation) and agree to the ' + link('/membership_agreement', 'opt-in terms') + '.', required: true }], submit: 'Get on the list', confirmNote: 'drop list (SMS / email) provider' })}
    </div>
    <ol class="cp-ed cp-ed--stack" role="list">
      ${edItem({ i: 0, pre: confirm('Next drop: strain or merch name and date to be supplied by the client.'), tab: '<span class="cp-ed__d">Next Drop</span>', k: 'Announced to the list first', name: 'The next drop', text: 'The list hears it first.' })}
      ${edItem({ i: 1, tab: '<span class="cp-ed__d">Last Drop</span>', k: 'Collab strain', name: 'Bussin\'', text: 'Launched with a strain release party.', acts: btn('Bussin\'', '/bussin-merch', { size: 'sm', kind: 'ghost' }) })}
    </ol>
  </div>
</section>`,
  };

  const originals = BRANDS.find((b) => b.name === 'Originals');
  // a store as a column of the home Stores' "Editorial" spread (stores.css): the name set large under "Originals", the
  // dateline tab with the live status (site.js), a strict photo crop, the ruled fact grid (site.js marks today's hours),
  // its chip and buttons (their own store's menu: no data-shop)
  const storeCol = (id, i) => {
    const s = STORES[id], pre = s.name.endsWith(s.short) ? s.name.slice(0, -s.short.length).trim() : s.name;
    return h`<article class="stores__col" data-store-card="${id}" aria-labelledby="fo-${id}-n" data-reveal style="--i:${i}">
      <h3 class="stores__name" id="fo-${id}-n">${link(s.page, `<span class="stores__pre">${esc(pre)}</span> <span class="stores__city">${esc(s.short)}</span>`)}</h3>
      <div class="stores__tab"><span class="stores__no" aria-hidden="true">${no(i)}</span><p class="stores__status"><span class="stores__dot" data-status-dot="${id}"></span><span data-status-for="${id}">Hours below</span></p></div>
      <div class="stores__photo stores__photo--${id}">${img({ la: 'store-la-interior', sd: 'store-sd-interior' }[id], { sizes: '(min-width: 1440px) 640px, (min-width: 900px) 45vw, 92vw' })}</div>
      <div class="stores__facts">
        <div class="stores__cell"><p class="stores__label">Address</p><address class="stores__addr">${esc(s.street)}<br>${esc(s.city)}, ${esc(s.region)} ${esc(s.postal)}</address></div>
        <div class="stores__cell"><p class="stores__label">Hours</p><dl class="stores__hours" data-hours>${s.hoursText.map(([d, t]) => `<div><dt>${esc(d)}</dt><dd>${esc(t)}</dd></div>`)}</dl></div>
        <div class="stores__cell stores__cell--call"><p class="stores__label">Call</p><a class="stores__tel" href="tel:${s.tel}">${esc(s.phone)}</a></div>
      </div>
      <p class="stores__foot">${s.attributes.map((t) => (t.confirm ? confirm(t.note) : '') + `<span class="chip">${esc(t.text)}</span>`)}<span class="stores__acts">${btn('Shop ' + s.short, s.menu, { size: 'sm' })}${btn('Directions', s.maps, { kind: 'ghost', size: 'sm' })}</span></p>
    </article>`;
  };
  const find = {
    path: '/find-originals', title: 'Find Originals | Originals', description: 'Find Originals flower: the Originals house brand is stocked at many other dispensaries in California and Massachusetts.',
    jsonld: [crumbsLd([{ name: 'Find Originals', path: '/find-originals' }])], active: '/shop', bodyClass: 'is-find',
    main: h`${pageHero({ kicker: 'Find Originals', title: 'Find <span class="chrome-word">Originals</span>', crumbs: [{ label: 'Find Originals', href: '/find-originals' }], lede: '<p>The Originals house brand is stocked at many other dispensaries in California and Massachusetts.</p>', media: img('daily-jar', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo', cls: 'cp-hero cp-hero--jar', actions: btn('Shop Originals in LA', originals.la) + btn('Wholesale', '/wholesale', { kind: 'ghost' }) })}
${confirm('Retailer list: the client\'s list of dispensaries in California and Massachusetts that carry Originals (name, city, link) is needed to fill this page\'s locator.')}
<section class="band cp-band" aria-labelledby="fo-h">
  <div class="wrap">
    <div class="cp-head cp-head--split">${kicker('At the source')}<h2 id="fo-h">Shop Originals at <span class="chrome-word">Originals</span></h2><p class="lede">Shop the house brand at our own stores in Los Angeles and San Diego.</p></div>
    <div class="cp-spread">${['la', 'sd'].map(storeCol)}</div>
  </div>
</section>
<section class="band cp-band cp-else" aria-labelledby="fo2-h">
  <div class="wrap">
    <div class="cp-head cp-head--split">${kicker('Everywhere else')}<h2 id="fo2-h">Ask for Originals <span class="chrome-word">by name</span></h2><p class="lede">Our flower is on menus across California and Massachusetts. Ask your budtender for Originals, the brand behind the brands.</p></div>
    <div class="cp-states" role="group" aria-label="Retailer locator">
      <p class="cp-states__s" data-reveal><span class="cp-states__no" aria-hidden="true">01</span>California</p><p class="cp-states__s" data-reveal style="--i:1"><span class="cp-states__no" aria-hidden="true">02</span>Massachusetts</p>
      <p class="cp-states__go">${btn('Carry Originals in your shop', '/wholesale', { kind: 'chrome', size: 'sm' })}</p>
    </div>
  </div>
</section>`,
  };
  return [events, media, drops, find];
}
