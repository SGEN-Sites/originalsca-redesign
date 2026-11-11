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
<section class="band faqs">
  <div class="wrap split split--wide-left faqs__grid">
    <div class="faqs__intro">
      ${kicker('General FAQs')}
      <h2>GENERAL <span class="chrome-word">FAQS</span></h2>
      <p class="lede">Click on the questions to the right to learn more about our dispensaries in-store service like our shop hours, location, and more. If you don't see the answers you're looking for, feel free to stop in or reach out to us directly. Our Originals dispensary team strives to assist you with all your needs.</p>
      <p class="btn-row">${btn('Contact us', '/contact', { kind: 'ghost' })}${shopBtn('Shop Now')}</p>
    </div>
    ${faqList(faqs, { cls: 'faqs__list' })}
  </div>
</section>
<section class="band droplist" aria-labelledby="faq-drop-h">
  <div class="band__clip"><div class="bandana droplist__bandana"></div><div class="droplist__scrim"></div></div>
  <div class="wrap wrap--narrow">
    <h2 id="faq-drop-h">SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS &amp; MORE</h2>
    ${form({ id: 'faq-drop', fields: [{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }], submit: 'Subscribe', confirmNote: 'newsletter / SMS list provider' })}
  </div>
</section>`,
  };
  const notFound = {
    path: '/404', file: '404.html', title: 'Page not found | Originals', description: 'This page took a wrong turn. Head back to Originals.', bodyClass: 'is-404',
    main: h`<section class="nf">
  <div class="nf__clip" aria-hidden="true">${img('boulevard', { sizes: '100vw', cls: 'cover', alt: '', decorative: true })}<div class="phero__scrim"></div></div>
  <div class="wrap nf__inner">
    ${crownMark('nf__crown')}
    <p class="kicker">Error 404</p>
    <h1 class="nf__title">Wrong <span class="chrome-word">turn</span></h1>
    <p class="lede">That page isn't on this block. The shops, the strains and the family are this way.</p>
    <p class="btn-row">${btn('Back home', '/')}${shopBtn('Shop Now', { kind: 'chrome' })}${btn('Find a store', '/retail', { kind: 'ghost' })}</p>
  </div>
</section>`,
  };
  const sent = {
    path: '/form-sent', title: 'Preview: form not sent | Originals', description: 'This redesign preview does not send forms yet.', bodyClass: 'is-404',
    main: h`<section class="nf">
  <div class="nf__clip" aria-hidden="true">${img('stage', { sizes: '100vw', cls: 'cover', alt: '', decorative: true })}<div class="phero__scrim"></div></div>
  <div class="wrap nf__inner">
    ${crownMark('nf__crown')}
    <p class="kicker">Preview build</p>
    <h1 class="nf__title">Nothing was <span class="chrome-word">sent</span></h1>
    <p class="lede">This is a redesign preview, so forms do not send yet. On the live site this form goes straight to the Originals team.</p>
    <p class="btn-row">${btn('Back home', '/')}${btn('Contact details', '/contact', { kind: 'ghost' })}</p>
  </div>
</section>`,
  };
  return [faqPage, notFound, sent];
}
