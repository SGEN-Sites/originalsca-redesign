// stores.mjs: /retail (our stores), the two store pages, /los-angeles (Dispensary Downtown LA) and /contact.
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, storeCard, categoryGrid, img, form, icon, faqList } from '../lib/parts.mjs';
import { STORES, STORE_ORDER, SITE, LINKS, CONFIRM, SOCIAL } from '../content/site.mjs';
import { extractFaqs } from '../lib/capture.mjs';
import { crumbsLd, storeLd } from '../lib/seo.mjs';

const contactFields = [{ name: 'name', label: 'Name:', autocomplete: 'name', required: true }, { name: 'email', label: 'Email:', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone:', type: 'tel', autocomplete: 'tel' }, { name: 'message', label: 'How can we help?', type: 'textarea' }];

function infoStrip(id) {
  const s = STORES[id];
  return h`<div class="info-strip" data-store-card="${id}">
  <div class="info-strip__cell"><span class="kicker">Today</span><p class="info-strip__big"><span class="dash__dot" data-status-dot="${id}"></span><span data-status-for="${id}">See hours</span></p></div>
  <div class="info-strip__cell"><span class="kicker">Address</span><address>${esc(s.street)}<br>${esc(s.city)}, ${s.region} ${s.postal}</address></div>
  <div class="info-strip__cell"><span class="kicker">Hours</span><dl class="store-card__hours">${s.hoursText.map(([d, t]) => `<div><dt>${d}</dt><dd>${t}</dd></div>`).join('')}</dl></div>
  <div class="info-strip__cell info-strip__acts">${btn('Shop ' + s.short + ' menu', s.menu)}<a class="btn btn--ghost" href="tel:${s.tel}">${icon('phone')}<span>${esc(s.phone)}</span></a>${btn('Directions', s.maps, { kind: 'ghost' })}</div>
</div>`;
}

function storePage(id) {
  const s = STORES[id];
  const other = STORES[id === 'la' ? 'sd' : 'la'];
  const faqs = extractFaqs().filter((f) => /credit|deliver|I\.D\./.test(f.q));
  const ig = SOCIAL.find((x) => x.short === s.instagram);
  const isLA = id === 'la';
  const main = h`${pageHero({
    kicker: isLA ? 'Stanford Ave, Los Angeles' : 'Federal Blvd, San Diego',
    title: isLA ? 'LOS ANGELES <span class="chrome-word">store</span>' : 'SAN DIEGO ORIGINALS <span class="chrome-word">store</span>',
    crumbs: [{ label: 'Our Stores', href: '/retail' }, { label: s.name, href: s.page }],
    lede: `<p class="phero__name">${esc(s.name.toUpperCase())}</p>`,
    media: isLA ? img('store-la-floor', { sizes: '100vw', alt: 'The sales floor at Originals Los Angeles', eager: true, priority: true }) : img('sd-palms', { sizes: '100vw', alt: '', decorative: true, eager: true, priority: true }),
    variant: 'photo',
    actions: btn('Shop ' + s.short, s.menu) + btn('Directions', s.maps, { kind: 'ghost' }),
  })}
${isLA ? confirm(CONFIRM.laHours) : confirm(CONFIRM.sdHours) + confirm(CONFIRM.sdMenu)}
<section class="band band--tight">
  <div class="wrap">${infoStrip(id)}</div>
</section>
<section class="band" aria-labelledby="cat-h-${id}">
  <div class="wrap">
    <div class="section-head">${kicker('Shop ' + s.short)}<h2 id="cat-h-${id}">Shop ${esc(s.short)} by <span class="chrome-word">category</span></h2></div>
    ${categoryGrid({ store: id })}
  </div>
</section>
${isLA ? h`<section class="band storyband" aria-labelledby="la-wall-h">
  <div class="wrap split">
    <div class="stack">
      ${kicker('The store')}
      <h2 id="la-wall-h">A warehouse full of <span class="chrome-word">originals</span></h2>
      <p class="lede">A brick warehouse with tall arched windows, wood trusses and reflective polished concrete. Giant freestanding ORIGINALS letters stand in front of a huge black-and-white wall of cultural originals: civil rights leaders, artists, athletes, icons.</p>
      <p>It's a living family wall: when legends visit, they sign it as another true original.</p>
      <p class="chips">${s.attributes.map((t) => (t.confirm ? confirm(t.note) : '') + `<span class="chip">${esc(t.text)}</span>`).join('')}${ig ? `<a class="chip chip--link" href="${esc(ig.href)}" target="_blank" rel="noopener">${esc(ig.short)}</a>` : ''}</p>
      <p class="btn-row">${btn('See the family wall', '/#family-wall', { kind: 'chrome' })}${btn('Our story', '/our-story', { kind: 'ghost' })}</p>
    </div>
    <div class="photo-stack">
      <figure class="media-frame photo-stack__a">${img('store-la-interior', { sizes: '(min-width: 900px) 40vw, 92vw' })}</figure>
      <figure class="media-frame photo-stack__b">${img('store-la-front', { sizes: '(min-width: 900px) 26vw, 60vw' })}</figure>
    </div>
  </div>
</section>` : h`<section class="band storyband" aria-labelledby="sd-h">
  <div class="wrap split">
    <div class="stack">
      ${kicker('The mission')}
      <h2 id="sd-h">Grown by OGs, <span class="script accent">for the masses</span></h2>
      <p class="lede">${esc(SITE.sdMission)}</p>
      <p class="chips">${s.attributes.map((t) => `<span class="chip">${esc(t.text)}</span>`).join('')}${ig ? `<a class="chip chip--link" href="${esc(ig.href)}" target="_blank" rel="noopener">${esc(ig.short)}</a>` : ''}</p>
      <div class="sd-deal">
        <p class="sd-deal__big">${esc(s.ftp)}</p>
        <p class="sd-deal__small">(EXCLUDES ORIGINALS &amp; DODI BRAND PRODUCTS)</p>
        <p class="btn-row">${btn('San Diego deals', s.deals, { kind: 'chrome', size: 'sm' })}${btn('All deals', '/deals', { kind: 'ghost', size: 'sm' })}</p>
      </div>
    </div>
    <div class="photo-stack">
      <figure class="media-frame photo-stack__a">${img('sd-banner', { sizes: '(min-width: 900px) 40vw, 92vw' })}</figure>
      <figure class="media-frame photo-stack__b">${img('store-sd-building', { sizes: '(min-width: 900px) 24vw, 60vw' })}</figure>
    </div>
  </div>
</section>`}
<section class="band" aria-labelledby="visit-h-${id}">
  <div class="wrap split">
    <div>${kicker('Before you visit')}<h2 id="visit-h-${id}">Good to <span class="chrome-word">know</span></h2></div>
    ${faqList(faqs)}
  </div>
</section>
<section class="band band--tight">
  <div class="wrap">
    <div class="other-store">
      <p class="kicker">The other store</p>
      <h2 class="h3">${link(other.page, esc(other.name))}</h2>
      <p>${esc(other.street)}, ${esc(other.city)}, ${other.region} ${other.postal} · <a href="tel:${other.tel}">${esc(other.phone)}</a></p>
      <p class="btn-row">${btn('Visit ' + other.short, other.page, { kind: 'ghost', size: 'sm' })}${btn('Shop ' + other.short, other.menu, { size: 'sm' })}</p>
    </div>
  </div>
</section>`;
  return {
    path: s.page,
    title: (isLA ? 'Los Angeles Store' : 'San Diego Store') + ' | Originals LA',
    description: 'Shop one of our Southern California cannabis stores for top-quality brands offering popular strains in a variety of lab tested products.',
    jsonld: [storeLd(id), crumbsLd([{ name: 'Our Stores', path: '/retail' }, { name: s.name, path: s.page }])],
    active: '/retail', bodyClass: 'is-store', main,
  };
}

function contactBlock(kickerText, intro, id) {
  return h`<section class="band contact">
  <div class="wrap split split--wide-left">
    <div>
      ${kicker(kickerText)}
      <h2>CONTACT <span class="chrome-word">Originals</span></h2>
      ${intro ? `<p class="lede">${intro}</p>` : ''}
      ${form({ id, fields: contactFields, submit: 'Send', confirmNote: 'contact form provider', ok: 'Thank you for contacting us. We will get back to you as soon as possible.', err: 'Oops, there was an error sending your message. Please try again later.' })}
    </div>
    <div class="contact-cards">
      <h2 class="kicker">CONTACT INFO</h2>
      <a class="contact-card" href="tel:${STORES.la.tel}">${icon('phone')}<span class="contact-card__k">Call</span><span class="contact-card__v">${esc(STORES.la.phone)}</span></a>
      ${confirm('Email: the live /contact page shows INFO@ORIGINALSCA.COM, but its email links and EMAIL button open support@originalsca.com. Kept as live; confirm which address customers should use.')}
      <a class="contact-card" href="mailto:${SITE.contactMailto}">${icon('mail')}<span class="contact-card__k">Email</span><span class="contact-card__v">${esc(SITE.email.toUpperCase().replace('@', ' @').replace('.COM', ' . COM'))}</span></a>
      <a class="contact-card" href="${u('/retail')}">${icon('pin')}<span class="contact-card__k">2 STORES</span><span class="contact-card__v">VIEW STORES</span></a>
    </div>
  </div>
</section>`;
}

export function pages() {
  const retail = {
    path: '/retail', title: 'Cannabis Stores | Originals LA', description: 'Shop one of our Southern California cannabis stores for top-quality brands offering popular strains in a variety of lab tested products.',
    jsonld: [...STORE_ORDER.map(storeLd), crumbsLd([{ name: 'Our Stores', path: '/retail' }])], active: '/retail', bodyClass: 'is-retail',
    main: h`${pageHero({ kicker: 'Locations', title: 'OUR <span class="chrome-word">stores</span>', crumbs: [{ label: 'Our Stores', href: '/retail' }], lede: '<p>Two stores in Southern California, one family. Pick yours, check today\'s hours and shop its menu.</p>', media: img('warehouse', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<section class="band" aria-labelledby="loc-h">
  <div class="wrap">
    <div class="section-head">${kicker('Southern California')}<h2 id="loc-h">OUR <span class="chrome-word">locations</span></h2></div>
    <div class="stores__grid">
      ${storeCard('la', { photo: img('store-la-interior', { sizes: '(min-width: 900px) 40vw, 92vw' }) })}
      ${storeCard('sd', { photo: img('store-sd-building', { sizes: '(min-width: 900px) 40vw, 92vw' }) })}
      <article class="store-card store-card--clothing">
        <div class="store-card__media">${img('clothing-shop', { sizes: '(min-width: 900px) 24vw, 92vw' })}</div>
        <div class="store-card__body"><p class="kicker">Online</p><h3 class="store-card__name">${link(LINKS.clothing, 'SHOP MERCH')}</h3><p>OPEN 24/7</p><p class="store-card__actions">${btn('SHOP MERCH', LINKS.clothing, { size: 'sm', kind: 'chrome' })}</p></div>
      </article>
    </div>
  </div>
</section>
<section class="band band--tight">
  <div class="wrap"><div class="find-strip"><div><p class="kicker">Not near a store?</p><h2 class="h3">Find Originals flower at other <span class="chrome-word">dispensaries</span></h2></div><p>${btn('Find Originals', '/find-originals', { kind: 'chrome' })}</p></div></div>
</section>`,
  };
  const la = storePage('la');
  const sd = storePage('sd');
  const s = STORES.la;
  const downtown = {
    path: '/los-angeles', title: 'Dispensary Downtown LA | Originals LA', description: 'Reach out to our dispensary downtown LA by submitting a contact form. One of our cannabis experts will get back to you within 48 hours.',
    jsonld: [storeLd('la'), crumbsLd([{ name: 'Dispensary Downtown LA', path: '/los-angeles' }])], active: '/retail', bodyClass: 'is-contact',
    main: h`${pageHero({ kicker: 'Originals Los Angeles', title: 'DISPENSARY <span class="chrome-word">downtown LA</span>', crumbs: [{ label: 'Dispensary Downtown LA', href: '/los-angeles' }], lede: `<p>${esc(s.street.toUpperCase())}<br>${esc(s.city.toUpperCase())}, ${s.region} ${s.postal}<br><a href="tel:${s.tel}">${esc(s.phone)}</a></p>`, media: img('night-street', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo', actions: btn('Shop LA', s.menu) + btn('Directions', s.maps, { kind: 'ghost' }) })}
${confirm(CONFIRM.laHours)}
<section class="band band--tight"><div class="wrap">${infoStrip('la')}</div></section>
${contactBlock('Contact', 'Reach out to our dispensary downtown LA by submitting a contact form. One of our cannabis experts will get back to you within 48 hours.', 'la-contact')}`,
  };
  const contact = {
    path: '/contact', title: 'Dispensary Downtown LA | Originals LA', description: 'Reach out to our dispensary downtown LA by submitting a contact form. One of our cannabis experts will get back to you within 48 hours.',
    jsonld: [crumbsLd([{ name: 'Contact', path: '/contact' }])], active: '/contact', bodyClass: 'is-contact',
    main: h`${pageHero({ kicker: 'Contact', title: 'DISPENSARY <span class="chrome-word">downtown LA</span>', crumbs: [{ label: 'Contact', href: '/contact' }], variant: 'ink' })}
${contactBlock('Contact Originals', 'Reach out to our LA Dispensary by submitting a contact form. One of our cannabis experts will get back to you within 48 hours.', 'contact')}`,
  };
  return [retail, la, sd, downtown, contact];
}
