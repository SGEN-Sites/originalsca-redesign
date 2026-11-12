// misc.mjs: FAQs (every live question and answer) and the not-found page.
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { extractFaqs } from '../lib/capture.mjs';
import { pageHero, kicker, btn, shopBtn, faqList, form, img, crownMark } from '../lib/parts.mjs';
import { STORES, STORE_ORDER, CONFIRM } from '../content/site.mjs';
import { crumbsLd, faqLd } from '../lib/seo.mjs';

export function pages() {
  const live = extractFaqs();
  // the live hours answer (9 AM to 10 PM every day) matches neither store; answer from the store records instead
  const hoursAnswer = STORE_ORDER.map((id) => { const s = STORES[id]; return `<p><strong>${esc(s.name)}</strong>: ${s.hoursText.map(([d, t]) => esc(d) + ' ' + esc(t)).join(', ')}.</p>`; }).join('');
  const faqs = live.map((f) => (/^What are your hours/.test(f.q) ? { q: f.q, a: confirm(CONFIRM.laHours) + hoursAnswer } : f))
    .map((f) => (/Do you offer any discounts/.test(f.q) ? { ...f, a: f.a + `<p>${link('/deals', 'See this week\'s deals')} · ${link('/rewards-program-and-opt-in', 'Rewards Program')}</p>` } : f))
    .map((f) => (/Is Originals hiring/.test(f.q) ? { ...f, a: f.a + `<p>${link('/jobs', 'Apply today')}</p>` } : f));
  const faqPage = {
    path: '/faqs', title: 'West Coast Dispensary | Originals LA', description: 'Get answers to the most common West coast dispensary questions and learn about our dispensary policies. Find information about proper ID, payment, and more.',
    jsonld: [faqLd(faqs), crumbsLd([{ name: 'FAQs', path: '/faqs' }])], bodyClass: 'is-faqs', active: '/faqs',
    main: h`${pageHero({ kicker: 'FAQs', title: 'ORIGINALS FACTORY AND WEED SHOP <span class="chrome-word">FAQs</span>', crumbs: [{ label: 'FAQs', href: '/faqs' }], lede: '<p>Get answers to the most common ORIGINALS FACTORY questions and learn about our dispensary policies. Find information about proper ID, payment, and more.</p>', media: img('arches', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<!-- 2026-11-12 redesign to docs/DESIGN-LANGUAGE.md (info-pages.css): the questions as the home drop list's compact
     accordion (numbered rows, 44px+ to tap; real details/summary, so they open without JS), the intro beside them and
     pinned while they scroll from 900px; then the newsletter as one compact band, its form on one line from 1100px. -->
<section class="band info-band info-faqs" aria-labelledby="faqs-h">
  <div class="wrap info-faqs__grid">
    <div class="info-faqs__intro">
      ${kicker('General FAQs')}
      <h2 id="faqs-h">GENERAL <span class="chrome-word">FAQS</span></h2>
      <p class="lede">Click on the questions to the right to learn more about our dispensaries in-store service like our shop hours, location, and more. If you don't see the answers you're looking for, feel free to stop in or reach out to us directly. Our Originals dispensary team strives to assist you with all your needs.</p>
      <p class="btn-row">${btn('Contact us', '/contact', { kind: 'ghost' })}${shopBtn('Shop Now')}</p>
    </div>
    ${faqList(faqs, { cls: 'info-faqs__list' })}
  </div>
</section>
<section class="band info-news" aria-labelledby="faq-drop-h">
  <div class="band__clip"><div class="bandana info-news__bandana"></div><div class="info-news__scrim"></div></div>
  <div class="wrap info-news__grid">
    <h2 id="faq-drop-h">SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS &amp; MORE</h2>
    ${form({ id: 'faq-drop', fields: [{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider', cls: 'info-form info-news__form' })}
  </div>
</section>`,
  };
  const notFound = {
    path: '/404', file: '404.html', title: 'Page not found | Originals', description: 'This page took a wrong turn. Head back to Originals.', bodyClass: 'is-404',
    // 404 and /form-sent (2026-11-12 redesign, info-pages.css): small and flat, no scene photo. The crown, the kicker and
    // the title set very large over a hairline, then the line and the buttons side by side from 900px.
    main: h`<section class="info-nf" aria-labelledby="nf-h">
  <div class="wrap">
    <div class="info-nf__head">
      ${crownMark('info-nf__crown')}
      <p class="kicker">Error 404</p>
      <h1 class="info-nf__title" id="nf-h">Wrong <span class="chrome-word">turn</span></h1>
    </div>
    <div class="info-nf__foot">
      <p class="lede">That page isn't on this block. The shops, the strains and the family are this way.</p>
      <p class="btn-row">${btn('Back home', '/')}${shopBtn('Shop Now', { kind: 'chrome' })}${btn('Find a store', '/retail', { kind: 'ghost' })}</p>
    </div>
  </div>
</section>`,
  };
  const sent = {
    path: '/form-sent', title: 'Preview: form not sent | Originals', description: 'This redesign preview does not send forms yet.', bodyClass: 'is-404',
    main: h`<section class="info-nf" aria-labelledby="nf-h">
  <div class="wrap">
    <div class="info-nf__head">
      ${crownMark('info-nf__crown')}
      <p class="kicker">Preview build</p>
      <h1 class="info-nf__title" id="nf-h">Nothing was <span class="chrome-word">sent</span></h1>
    </div>
    <div class="info-nf__foot">
      <p class="lede">This is a redesign preview, so forms do not send yet. On the live site this form goes straight to the Originals team.</p>
      <p class="btn-row">${btn('Back home', '/')}${btn('Contact details', '/contact', { kind: 'ghost' })}</p>
    </div>
  </div>
</section>`,
  };
  return [faqPage, notFound, sent];
}
