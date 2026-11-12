// legal.mjs: the live legal and opt-in pages at their live URLs, words verbatim from the capture, in one editorial legal
// template (owner brief 2026-11-12, docs/DESIGN-LANGUAGE.md; styles legal.css): a compact page head (crumbs, kicker, h1),
// one column at a reading measure under a hairline, numbered section titles in the display face on hairline rules and,
// on wide screens, a sticky "On this page" list built from those titles. The captured policies arrive as flat paragraphs,
// so their own section titles become h2/h3 and their flattened tables become ruled grids: tags and wrappers only, never a
// word (the legal pages block of tools/test-ui.mjs checks every page's words against audit/legal-parity.json).
import { h, esc, u, link, confirm, slugify } from '../lib/html.mjs';
import { extractMain, textOf } from '../lib/capture.mjs';
import { pageHero, kicker, btn, form, icon } from '../lib/parts.mjs';
import { PROP65, LINKS, STORES } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

// the compact head every legal page shares: crumbs, kicker, h1
const head = (k, title, label, path) => pageHero({ kicker: k, title, crumbs: [{ label, href: path }], variant: 'ink', cls: 'phero--legal' });

// ---- the captured policies: their own titles promoted, their flattened tables laid out ----
// the body as top-level blocks, each keeping the exact text before it, so re-joining gives back the same words
function blocks(html) {
  const list = [], re = /<(p|ul|ol)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g; let m, at = 0;
  while ((m = re.exec(html))) {
    list.push({ sep: html.slice(at, m.index), raw: m[0], tag: m[1], inner: m[2], text: /</.test(m[2]) ? null : m[2].replace(/\s+/g, ' ').trim() });
    at = re.lastIndex;
  }
  return { list, tail: html.slice(at) };
}
const NUMBERED = /^\d{1,2}\.\s+[A-Z]{2,}/;
const FACT = new Set(['Name:', 'Purpose:', 'Provider:', 'Service:', 'Country:', 'Type:', 'Expires in:']);   // the cookie tables' rows
const SUBS = {   // the policies' own sub-titles, exactly as captured
  '/privacy-policy': ['Personal information you disclose to us', 'Information automatically collected', 'Information collected from other sources', 'Account Information', 'CCPA Privacy Notice', 'What categories of personal information do we collect?', 'How do we use and share your personal information?', 'Will your information be shared with anyone else?', 'Your rights with respect to your personal data', 'Verification process', 'Other privacy rights'],
  '/terms-of-service': ['Informal Negotiations', 'Mediation; Binding Arbitration', 'Restrictions', 'Exceptions to Informal Negotiations and Arbitration'],
};
// a section title: a short plain paragraph, numbered ("1. AGREEMENT TO TERMS") or in capitals ("WEBSITE DISCLAIMER");
// the cookie policy titles its sections as questions ("What are cookies?")
const isTitle = (path, b, i) => b.tag === 'p' && b.text != null && i > 0 && b.text.length <= 90 && (path === '/cookie-policy'
  ? /\?$/.test(b.text)
  : NUMBERED.test(b.text) || (b.text === b.text.toUpperCase() && (b.text.match(/[A-Z]{2,}/g) || []).length >= 2));
const isSub = (path, b) => b.tag === 'p' && b.text != null && (path === '/cookie-policy' ? /^[A-Z][a-z]+(?: [a-z]+)* cookies:$/.test(b.text) : (SUBS[path] || []).includes(b.text));
const isIndex = (b) => b.tag === 'p' && /^\s*<a [^>]*href="https:\/\/app\.termly\.io\/[^"]*"[^>]*>[^<]*<\/a>\s*$/.test(b.inner);   // the policy's own table of contents

function shape(path, body) {
  if (path === '/cookie-policy') body = body.replace(/<br>([A-Z][a-z]+(?: [a-z]+)* cookies:)<\/p>/g, '</p><p>$1</p>');   // a category title the capture glued to the paragraph before it
  const { list: B, tail } = blocks(body), toc = [], ids = new Set();
  const numbered = B.some((b, i) => isTitle(path, b, i) && NUMBERED.test(b.text));
  const anchor = (t) => { const s = 'sec-' + slugify(t); let k = s, n = 2; while (ids.has(k)) k = s + '-' + n++; ids.add(k); return k; };
  const num = (inner, cls) => inner.replace(/^(\s*)(\d{1,2}\.)(\s+)/, `$1<span class="${cls}">$2</span>$3`);
  const group = (run, cls, cell = (b) => b.raw) => run[0].sep + `<div class="${cls}">` + run.map((b, k) => (k ? b.sep : '') + cell(b, k, run)).join('') + '</div>';
  // a cookie row: its key ("Name:") and value; each cookie opens on its Name row
  const fact = (x, k, run) => { const name = (k % 2 ? run[k - 1] : x).text === 'Name:'; return `<p class="${k % 2 ? 'legal__fv' : 'legal__fk'}${name ? ' is-name' : ''}">${x.inner}</p>`; };
  let out = '';
  for (let i = 0; i < B.length;) {
    const b = B[i]; let j = i;
    if (i === 0 && b.text != null) { out += b.sep + `<p class="legal__doc">${b.inner}</p>`; i++; continue; }
    if (b.text != null && /^Last updated /.test(b.text)) { out += b.sep + `<p class="legal__date">${b.inner}</p>`; i++; continue; }
    if (isTitle(path, b, i)) {
      const id = anchor(b.text); toc.push({ id, label: num(b.inner, 'legal__tn') });
      out += b.sep + `<h2 id="${id}">${num(b.inner, 'legal__n')}</h2>`; i++; continue;
    }
    if (isSub(path, b)) { out += b.sep + `<h3>${b.inner}</h3>`; i++; continue; }
    if (isIndex(b)) { while (j < B.length && isIndex(B[j])) j++; out += group(B.slice(i, j), 'legal__index'); i = j; continue; }
    if (b.text === 'Name:') {
      while (j + 1 < B.length && FACT.has(B[j].text) && B[j + 1].tag === 'p') j += 2;
      if (j > i) { out += group(B.slice(i, j), 'legal__facts', fact); i = j; continue; }
    }
    if (b.text === 'Category' && B[i + 1]?.text === 'Examples' && B[i + 2]?.text === 'Collected') {
      j = i + 3; while (j + 2 < B.length && /^(YES|NO)$/.test(B[j + 2].text || '')) j += 3;
      out += group(B.slice(i, j), 'legal__table', (x, k) => (k < 3 ? `<p class="legal__th">${x.inner}</p>` : x.raw)); i = j; continue;
    }
    if (b.text === 'Kush Valley Collective') {
      while (j < B.length && B[j].tag === 'p' && B[j].text != null && B[j].text.length <= 40 && !isTitle(path, B[j], j)) j++;
      out += group(B.slice(i, j), 'legal__addr'); i = j; continue;
    }
    out += b.sep + b.raw; i++;
  }
  return { html: out + tail, toc, numbered };
}
// "On this page": the section titles as real anchor links (wide screens; legal.css)
const tocNav = (toc, numbered) => (toc.length < 3 ? '' : `<nav class="legal__toc${numbered ? '' : ' legal__toc--count'}" data-toc aria-labelledby="legal-toc-h">
  <p class="legal__toc-h" id="legal-toc-h">On this page</p>
  <ol>${toc.map((t) => `<li><a href="#${t.id}">${t.label}</a></li>`).join('')}</ol>
</nav>`);

// long policies: the captured body, minus its own H1 (rendered by the page head)
function policy(path, h1, title, description) {
  let body = extractMain(path, { fromText: h1 });
  // the capture starts inside the live H1 (at its text), so the title arrives as "TITLE</h2>" or "<h2>TITLE</h2>"
  body = body.replace(new RegExp('^\\s*(<h2>)?\\s*' + h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*</h2>', 'i'), '');
  const doc = shape(path, body), nav = tocNav(doc.toc, doc.numbered);
  return {
    path, title, description, bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: h1, path }])],
    main: h`${head('Legal', esc(h1), h1, path)}
<section class="band legal"><div class="wrap legal__grid${nav ? ' legal__grid--toc' : ''}">${nav}<div class="prose legal__body${doc.numbered ? '' : ' legal__body--count'}">${doc.html}</div></div></section>`,
  };
}

export function pages() {
  return [
    policy('/privacy-policy', 'PRIVACY POLICY', 'Privacy Policy | Originals LA', 'Read the Originals privacy notice: what information is collected, how it is used and your rights.'),
    policy('/terms-of-service', 'TERMS OF SERVICE', 'Terms Of Service | Originals LA', 'The terms of service for the Originals website.'),
    policy('/cookie-policy', 'COOKIE POLICY', 'Cookie Policy | Originals LA', 'How the Originals website uses cookies.'),
    policy('/disclaimer', 'DISCLAIMER', 'Disclaimer | Originals LA', 'The Originals website disclaimer.'),
    {
      path: '/prop-65-warning', title: 'Prop 65 Warning | Originals LA', description: 'Read our Prop 65 warning here.', bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: 'PROP 65 WARNING', path: '/prop-65-warning' }])],
      main: h`${head('Legal', 'PROP 65 WARNING', 'Prop 65 Warning', '/prop-65-warning')}
<section class="band legal"><div class="wrap legal__grid"><div class="prose legal__body">
  ${confirm('The live /prop-65-warning page says only "Need info". The California Proposition 65 retail warning for cannabis smoke and delta-9-THC is shown here; confirm the exact wording with compliance counsel.')}
  <div class="p65"><span class="p65__icon" aria-hidden="true">⚠</span><p>${esc(PROP65)}</p></div>
  <p class="note">Read more at <a href="https://www.p65warnings.ca.gov/" target="_blank" rel="noopener">www.P65Warnings.ca.gov</a>.</p>
</div></div></section>`,
    },
    {
      path: '/california-opt-in', title: 'California Opt-in | Originals LA', description: 'Opt-in to learn about special events, rewards, deals, and new drops from Originals.', bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: 'CALIFORNIA OPT-IN', path: '/california-opt-in' }])],
      main: h`${head('Stay in the loop', 'CALIFORNIA <span class="chrome-word">opt-in</span>', 'California Opt-in', '/california-opt-in')}
<section class="band legal"><div class="wrap legal__grid"><div class="legal__body">
  <div class="lede legal__lede"><p>Opt-in to learn about special events, rewards, deals, and new drops! Stop by our retail store and make sure we have your information!</p></div>
  <div class="legal__actions">${btn('Opt in online', '/membership_agreement')}${btn('Find a store', '/retail', { kind: 'ghost' })}</div>
</div></div></section>`,
    },
    {
      path: '/rewards-program-and-opt-in', title: 'Rewards Program | Originals LA', description: 'Join the Originals Rewards Program today: VIP Program login and join.', bodyClass: 'is-rewards', jsonld: [crumbsLd([{ name: 'REWARDS PROGRAM AND OPT-IN', path: '/rewards-program-and-opt-in' }])],
      main: h`${head('Rewards', 'REWARDS PROGRAM <span class="chrome-word">and opt-in</span>', 'Rewards Program and Opt-in', '/rewards-program-and-opt-in')}
<section class="band legal rewards">
  <div class="wrap legal__grid legal__grid--aside">
    <div class="legal__body stack">
      ${kicker('VIP program')}
      <h2>Join our Rewards Program <span class="accent">Today!</span></h2>
      <p class="lede">We have a Loyalty Rewards Program, and special deals running almost daily.</p>
      <p class="btn-row">${btn('VIP Program Login/Join', LINKS.rewardsJoin)}${btn('Opt in for deals', '/membership_agreement', { kind: 'ghost' })}</p>
      <p class="note">Sign up for our Loyalty programs at any of our Retail locations, too.</p>
    </div>
    <div class="vip legal__aside" data-tilt aria-hidden="true">
      <div class="vip__card">
        <span class="vip__sheen"></span>
        <span class="vip__crown">${icon('crown')}</span>
        <span class="vip__name chrome-word">Originals</span>
        <span class="vip__tier">VIP · Family</span>
        <span class="vip__chip"></span>
        <span class="vip__hash">#yourockthecrown</span>
      </div>
    </div>
  </div>
</section>`,
    },
    {
      path: '/membership_agreement', title: 'OPT IN for MORE INFO', description: 'Opt in to receive exclusive deals and event info from Originals.', bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: 'OPT IN', path: '/membership_agreement' }])],
      main: h`${head('Opt in', 'OPT IN to RECEIVE <span class="chrome-word">exclusive deals</span> &amp; EVENT INFO', 'Opt In', '/membership_agreement')}
<section class="band legal"><div class="wrap legal__grid"><div class="legal__body">
  ${form({ id: 'optin', fields: [{ name: 'name', label: 'Name:', autocomplete: 'name' }, { name: 'email', label: 'Email:', type: 'email', autocomplete: 'email' }, { name: 'phone', label: 'Phone:', type: 'tel', autocomplete: 'tel' }, { name: 'optin', type: 'checkbox', label: 'Check the Box Below to Opt-In, then Click SUBMIT', required: true }], submit: 'Submit', confirmNote: 'SMS and email opt-in provider', ok: 'Thank you for choosing to be part of the Originals Family.', err: 'Oops, there was an error sending your Form. Please try again later.' })}
  <div class="prose legal__terms"><p>By Opting In I hereby affirm that I read, understand and agree to the following terms: Allow Originals Factory to capture and retain your contact &amp; purchase information in order to provide you with a more personalized marketing and communications experience. Additionally, by providing your mobile number, and/or by providing your email, and opting in, you consent to receive marketing focused text messages and/or emails, including via an automatic telephone dialing system or prerecorded or artificial voice from Originals Factory and its affiliates, Brands, and Product Manufacturers. Consent is not required as a condition of purchasing any goods or services. Standard per minute call and message rates may apply. Opt out at any time by replying ‘END’.</p><p>Thank you for choosing to be part of the Originals Family.</p></div>
</div></div></section>`,
    },
  ];
}
