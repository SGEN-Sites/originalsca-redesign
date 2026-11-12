// story.mjs: /our-story, /strains (the strain library), /collabs, /bussin-merch.
import { h, esc, u, a, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, shopBtn, img, imgFile, bgVideo, icon, crownMark, storeSwitch } from '../lib/parts.mjs';
import { SITE, STORES, STRAINS, COLLABS, LINKS, CATEGORIES, catHref } from '../content/site.mjs';
import { extractPost, extractFaqs, textOf } from '../lib/capture.mjs';
import { crumbsLd } from '../lib/seo.mjs';

// the live article's own words: its first two sentences, or the guide paragraph that opens with `from`
function excerpt(s) {
  if (!s.post) return null;
  const p = extractPost(s.post.slice(1));
  const paras = [...p.body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1])).filter((t) => t.length > 60);
  let t = s.from ? (textOf(p.body).match(new RegExp(s.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^]*?\\.[^]*?\\.')) || [])[0] : paras[0];
  if (!t) return null;
  const sentences = t.match(/[^.!?]+[.!?]+/g) || [t];
  return { text: sentences.slice(0, 2).join('').trim(), title: p.title, path: s.post };
}

export function pages() {
  const faqs = extractFaqs();
  const whatIs = (faqs.find((f) => /What is Originals/.test(f.q)) || {}).a || '';
  const imgs = ['bud-a', 'bud-b', 'bud-c'];

  const story = {
    path: '/our-story', title: 'Our Story | Originals', description: 'Originals started with elementary school friends from one Los Angeles block. 100% family owned and operated since 2006, growing award-winning flower in-house.',
    jsonld: [crumbsLd([{ name: 'Our Story', path: '/our-story' }])], active: '/our-story', bodyClass: 'is-story',
    main: h`${pageHero({ kicker: 'Our story', title: 'From the <span class="chrome-word">block</span>', crumbs: [{ label: 'Our Story', href: '/our-story' }], lede: '<p>Originals started with a group of elementary school friends, many from the same Los Angeles block, who pooled what they had to build a proud, world-class company driven by their Mexican American family values.</p>', video: bgVideo({ src: a('video/arches-720.mp4'), poster: imgFile('loop-arches', 720), cls: '', ai: true }), media: img('arches', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<section class="band chapters" aria-label="Chapters">
  <div class="wrap">
    <ol class="chapter-list" role="list">
      <li class="chapter" data-reveal>
        <p class="chapter__n">01</p>
        <div class="chapter__body"><h2>The <span class="chrome-word">block</span></h2><p class="lede">Brothers, parents and neighbors all pitched in.</p><p>What they pooled together became a company built the way a family is built: everybody contributes, and everybody is welcome at the table.</p></div>
        <figure class="polaroid polaroid--inline" style="--r:-4deg">${img('store-la-front', { sizes: '320px' })}<figcaption>Stanford Ave</figcaption></figure>
      </li>
      <li class="chapter" data-reveal>
        <p class="chapter__n">02</p>
        <div class="chapter__body"><h2>Since <span class="chrome-word">2006</span></h2><p class="lede">100% family owned and operated since 2006.</p><div class="prose">${whatIs}</div></div>
        <figure class="polaroid polaroid--inline" style="--r:3deg">${img('bud-box', { sizes: '320px', alt: 'Originals Family Farms flower beside its box' })}<figcaption>Family Farms</figcaption></figure>
      </li>
      <li class="chapter" data-reveal>
        <p class="chapter__n">03</p>
        <div class="chapter__body"><h2>Grown <span class="chrome-word">in-house</span></h2><p class="lede">We grow our own flower in-house, and our OG cuts and Gelato built a cult following in LA.</p><p>The Gelato strain took “Best Appearance” and First Place “People’s Choice Award” at the 2021 Farmer’s Cup.</p><p class="stat-line"><span class="stat__n">47</span><span>Times award winners</span></p></div>
        <figure class="polaroid polaroid--inline" style="--r:-2deg">${img('farmers-cup', { sizes: '320px', alt: 'Farmers Cup 2021: first place, licensed flower, Originals Gelato' })}<figcaption>Farmers Cup 2021</figcaption></figure>
      </li>
      <li class="chapter" data-reveal>
        <p class="chapter__n">04</p>
        <div class="chapter__body"><h2>Not for <span class="chrome-word">sale</span></h2><p class="lede">They've turned down offers to sell.</p><p>${esc(SITE.brandBehind)}: the family keeps the farm, the stores and the name, and keeps building.</p></div>
        <figure class="polaroid polaroid--inline" style="--r:4deg">${img('gelato-box', { sizes: '320px', alt: 'Originals Gelato 3.5g packaging' })}<figcaption>The house cut</figcaption></figure>
      </li>
    </ol>
  </div>
</section>
<section class="band" aria-labelledby="fam-h">
  <div class="wrap split">
    <div class="stack">${kicker('The family wall')}<h2 id="fam-h">Honoring the <span class="chrome-word">originals</span></h2><p class="lede">Honoring the originals and adding to the family. When legends visit the Los Angeles store, they sign the wall as another true original.</p><p class="btn-row">${btn('See the wall', '/#family-wall', { kind: 'chrome' })}${btn('Visit LA', STORES.la.page, { kind: 'ghost' })}</p></div>
    <figure class="media-frame">${img('store-la-interior', { sizes: '(min-width: 900px) 46vw, 92vw' })}</figure>
  </div>
</section>`,
  };

  const strains = {
    path: '/strains', title: 'Strain Library | Originals', description: 'The Originals strain library: house genetics grown in-house, from Originals OG and King Louie to Gelato, Oaksterdam OG and Bussin\'.',
    jsonld: [crumbsLd([{ name: 'Strain Library', path: '/strains' }])], active: '/strains', bodyClass: 'is-strains',
    main: h`${pageHero({ kicker: 'Strain library', title: 'House <span class="chrome-word">genetics</span>', crumbs: [{ label: 'Strain Library', href: '/strains' }], lede: '<p>Grown in-house by Originals. Read the strain stories, then shop the flower on the live menu.</p>', media: img('trichomes', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo', actions: btn('Shop flower', STORES.la.cat('flower'), { shop: 'flower' }) })}
<section class="band" aria-label="Strains">
  <div class="wrap">
    <ul class="strain-cards" role="list">
      ${STRAINS.map((s, i) => { const ex = excerpt(s); const pic = s.img ? img(s.img, { sizes: '(min-width: 900px) 30vw, 90vw' }) : img(imgs[i % 3], { sizes: '(min-width: 900px) 30vw, 90vw' }); return h`<li class="strain-card" id="${s.id}" data-reveal style="--i:${i % 3}">
        ${ex ? '' : confirm('Strain notes for ' + s.name + ' (lineage, type, effects): the live site has no article; confirm the copy with the client.')}
        <div class="strain-card__holo" data-tilt>
          <div class="strain-card__media">${pic}</div>
          <p class="strain-card__k">House strain${s.id === 'bussin' ? ' · collab' : ''}</p>
          <h2 class="strain-card__n">${esc(s.name)}</h2>
          ${ex ? `<p class="strain-card__ex">${esc(ex.text)}</p>` : `<p class="strain-card__ex">Grown in-house by Originals.</p>`}
          <p class="strain-card__acts">${ex ? btn('Read the strain story', ex.path, { kind: 'ghost', size: 'sm' }) : s.page ? btn('The Bussin\' story', s.page, { kind: 'ghost', size: 'sm' }) : ''}${btn('Shop flower', STORES.la.cat('flower'), { size: 'sm', shop: 'flower' })}</p>
        </div>
      </li>`; })}
    </ul>
    <p class="note mt">Flower buttons open the flower category on the selected store's live menu. Product images on cards without a store photo are illustrations.</p>
  </div>
</section>`,
  };

  // /collabs and /bussin-merch redesigned 2026-11-12 to the owner-approved design language (docs/DESIGN-LANGUAGE.md;
  // styles culture-pages.css). The roster is an editorial grid: numbered cells between hairlines, each partner's real
  // logo (logo-<slug>, its -white version first, white on dark with no box, as the home collab tape finds it) or, where
  // the registry has none yet, its name in the display face; the chips still tumble (site.js "collabs"), now loose on a
  // hairline floor. The kicker no longer says "Text only, by design": the roster now shows the partners' logos.
  const collabMark = (c) => {
    const name = c.product || c.partner, id = 'logo-' + name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    for (const k of [id + '-white', id]) {
      try { return img(k, { cls: 'cp-roster__logo', sizes: '260px', alt: name + ' logo' }); }
      catch (e) { if (!/^unknown image/.test(e.message)) throw e; }
    }
    return '';
  };
  const collabs = {
    path: '/collabs', title: 'Collabs | Originals', description: 'The Brand Behind The Brands: Originals collabs with the family it builds with.',
    jsonld: [crumbsLd([{ name: 'Collabs', path: '/collabs' }])], active: '/events', bodyClass: 'is-collabs',
    main: h`${pageHero({ kicker: 'Collabs', title: 'The brand behind <span class="chrome-word">the brands</span>', crumbs: [{ label: 'Collabs', href: '/collabs' }], lede: '<p>Originals grows for the family, and the family keeps growing. These are the names we have built with.</p>', media: img('stage', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'stage', cls: 'cp-hero' })}
${confirm('Every collab below (partner, product, co-grower) is from the operator brief and must be confirmed by the client before launch; no artist photos are used.')}
<section class="band cp-band cp-roster" aria-labelledby="cl-h">
  <div class="wrap">
    <div class="cp-head">${kicker('Collabs')}<h2 id="cl-h">The <span class="chrome-word">roster</span></h2></div>
    <div class="tumble cp-tumble" data-tumble aria-hidden="true">
      ${COLLABS.map((c) => `<span class="chip-fall">${esc(c.product || c.partner)}</span>`).join('')}
      ${SITE.tags.map((t) => `<span class="chip-fall chip-fall--tag">${esc(t)}</span>`).join('')}
    </div>
    <ol class="cp-roster__grid" role="list">
      ${COLLABS.map((c, i) => { const mark = collabMark(c); return h`<li class="cp-roster__item" data-reveal style="--i:${i % 4}">
        <p class="cp-roster__tab"><span class="cp-roster__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${c.recent ? '<span class="cp-roster__flag">most recent</span>' : ''}</p>
        <p class="cp-roster__mark${mark ? ' cp-roster__mark--logo' : ''}">${mark || esc(c.product || c.partner)}</p>
        <p class="cp-roster__w">${c.product ? 'with ' + esc(c.partner) + (c.with ? ' and ' + esc(c.with) : '') : 'Collab'}</p>
      </li>`; })}
    </ol>
    <p class="btn-row cp-roster__acts">${btn('Get on the drop list', '/drops')}${btn('Events', '/events', { kind: 'ghost' })}</p>
  </div>
</section>`,
  };

  const bussin = {
    path: '/bussin-merch', title: 'Bussin\' | Originals', description: 'Bussin\': the Originals collab strain, its release party and the merch.',
    jsonld: [crumbsLd([{ name: 'Bussin\'', path: '/bussin-merch' }])], active: '/events', bodyClass: 'is-bussin',
    main: h`${pageHero({ kicker: 'Collab strain', title: '<span class="chrome-word chrome-word--accent">Bussin\'</span>', crumbs: [{ label: 'Collabs', href: '/collabs' }, { label: 'Bussin\'', href: '/bussin-merch' }], lede: '<p>Bussin\' is the Originals collab with Chris Brown and OHB Farms, launched with a strain release party.</p>', media: `<div class="phero__pattern bandana"></div>`, variant: 'pattern', cls: 'cp-hero', actions: btn('Shop flower', STORES.la.cat('flower'), { shop: 'flower' }) + btn('Bussin\' merch', LINKS.clothing, { kind: 'chrome' }) })}
${confirm('Bussin\' details (collab partners Chris Brown and OHB Farms, the release party): from the operator brief, confirm with the client. The live /bussin-merch page is a template placeholder titled EVENTS.')}
<!-- the release party as a bento (the /deals Save now pattern): the words tile and the stage tile (an illustration, for
     mood only: no photo of the night exists) in one rectangle, 12px apart; the words tile's inner frame turns gold under
     the pointer or keyboard focus -->
<section class="band cp-band cp-bz" aria-labelledby="bz-h">
  <div class="wrap cp-bento">
    <div class="cp-tile cp-tile--head">${kicker('Release night')}<h2 id="bz-h">The <span class="chrome-word">release party</span></h2><p class="lede">The Bussin' strain release party brought the family out for the drop.</p><p class="btn-row">${btn('All events', '/events', { kind: 'ghost' })}${btn('Drop list', '/drops')}</p></div>
    <figure class="cp-tile cp-tile--pic">${img('stage', { sizes: '(min-width: 900px) 56vw, 92vw' })}</figure>
  </div>
</section>`,
  };
  return [story, strains, collabs, bussin];
}
