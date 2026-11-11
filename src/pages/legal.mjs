// legal.mjs: the live legal and opt-in pages at their live URLs, words verbatim from the capture.
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { extractMain, textOf } from '../lib/capture.mjs';
import { pageHero, kicker, btn, form, icon } from '../lib/parts.mjs';
import { PROP65, LINKS, STORES } from '../content/site.mjs';
import { crumbsLd } from '../lib/seo.mjs';

// long policies: the captured body, minus its own H1 (rendered by the page hero)
function policy(path, h1, title, description) {
  let body = extractMain(path, { fromText: h1 });
  // the capture starts inside the live H1 (at its text), so the title arrives as "TITLE</h2>" or "<h2>TITLE</h2>"
  body = body.replace(new RegExp('^\\s*(<h2>)?\\s*' + h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*</h2>', 'i'), '');
  return {
    path, title, description, bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: h1, path }])],
    main: h`${pageHero({ kicker: 'Legal', title: esc(h1), crumbs: [{ label: h1, href: path }], variant: 'ink' })}
<section class="band legal"><div class="wrap wrap--narrow prose legal__body">${body}</div></section>`,
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
      main: h`${pageHero({ kicker: 'Legal', title: 'PROP 65 WARNING', crumbs: [{ label: 'Prop 65 Warning', href: '/prop-65-warning' }], variant: 'ink' })}
<section class="band legal"><div class="wrap wrap--narrow">
  ${confirm('The live /prop-65-warning page says only "Need info". The California Proposition 65 retail warning for cannabis smoke and delta-9-THC is shown here; confirm the exact wording with compliance counsel.')}
  <div class="p65"><span class="p65__icon" aria-hidden="true">⚠</span><p>${esc(PROP65)}</p></div>
  <p class="note mt">Read more at <a href="https://www.p65warnings.ca.gov/" target="_blank" rel="noopener">www.P65Warnings.ca.gov</a>.</p>
</div></section>`,
    },
    {
      path: '/california-opt-in', title: 'California Opt-in | Originals LA', description: 'Opt-in to learn about special events, rewards, deals, and new drops from Originals.', bodyClass: 'is-legal', jsonld: [crumbsLd([{ name: 'CALIFORNIA OPT-IN', path: '/california-opt-in' }])],
      main: h`${pageHero({ kicker: 'Stay in the loop', title: 'CALIFORNIA <span class="chrome-word">opt-in</span>', crumbs: [{ label: 'California Opt-in', href: '/california-opt-in' }], lede: '<p>Opt-in to learn about special events, rewards, deals, and new drops! Stop by our retail store and make sure we have your information!</p>', variant: 'ink', actions: btn('Opt in online', '/membership_agreement') + btn('Find a store', '/retail', { kind: 'ghost' }) })}`,
    },
    {
      path: '/rewards-program-and-opt-in', title: 'Rewards Program | Originals LA', description: 'Join the Originals Rewards Program today: VIP Program login and join.', bodyClass: 'is-rewards', jsonld: [crumbsLd([{ name: 'REWARDS PROGRAM AND OPT-IN', path: '/rewards-program-and-opt-in' }])],
      main: h`${pageHero({ kicker: 'Rewards', title: 'REWARDS PROGRAM <span class="chrome-word">and opt-in</span>', crumbs: [{ label: 'Rewards Program and Opt-in', href: '/rewards-program-and-opt-in' }], variant: 'ink' })}
<section class="band rewards">
  <div class="wrap split">
    <div class="stack">
      ${kicker('VIP program')}
      <h2>Join our Rewards Program <span class="accent">Today!</span></h2>
      <p class="lede">We have a Loyalty Rewards Program, and special deals running almost daily.</p>
      <p class="btn-row">${btn('VIP Program Login/Join', LINKS.rewardsJoin)}${btn('Opt in for deals', '/membership_agreement', { kind: 'ghost' })}</p>
      <p class="note">Sign up for our Loyalty programs at any of our Retail locations, too.</p>
    </div>
    <div class="vip" data-tilt aria-hidden="true">
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
      main: h`${pageHero({ kicker: 'Opt in', title: 'OPT IN to RECEIVE <span class="chrome-word">exclusive deals</span> &amp; EVENT INFO', crumbs: [{ label: 'Opt In', href: '/membership_agreement' }], variant: 'ink' })}
<section class="band legal"><div class="wrap wrap--narrow">
  ${form({ id: 'optin', fields: [{ name: 'name', label: 'Name:', autocomplete: 'name' }, { name: 'email', label: 'Email:', type: 'email', autocomplete: 'email' }, { name: 'phone', label: 'Phone:', type: 'tel', autocomplete: 'tel' }, { name: 'optin', type: 'checkbox', label: 'Check the Box Below to Opt-In, then Click SUBMIT', required: true }], submit: 'Submit', confirmNote: 'SMS and email opt-in provider', ok: 'Thank you for choosing to be part of the Originals Family.', err: 'Oops, there was an error sending your Form. Please try again later.' })}
  <div class="prose mt"><p>By Opting In I hereby affirm that I read, understand and agree to the following terms: Allow Originals Factory to capture and retain your contact &amp; purchase information in order to provide you with a more personalized marketing and communications experience. Additionally, by providing your mobile number, and/or by providing your email, and opting in, you consent to receive marketing focused text messages and/or emails, including via an automatic telephone dialing system or prerecorded or artificial voice from Originals Factory and its affiliates, Brands, and Product Manufacturers. Consent is not required as a condition of purchasing any goods or services. Standard per minute call and message rates may apply. Opt out at any time by replying ‘END’.</p><p>Thank you for choosing to be part of the Originals Family.</p></div>
</div></section>`,
    },
  ];
}
