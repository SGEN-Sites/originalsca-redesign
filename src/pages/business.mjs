// business.mjs: /wholesale (new: the live footer link 404s) and /jobs (the live application, field for field).
import { h, esc, u, link, confirm } from '../lib/html.mjs';
import { pageHero, kicker, btn, img, form, icon } from '../lib/parts.mjs';
import { SITE, STORES, STORE_ORDER } from '../content/site.mjs';
import { extractFaqs } from '../lib/capture.mjs';
import { crumbsLd } from '../lib/seo.mjs';

export function pages() {
  const faqs = extractFaqs();
  const whatIs = (faqs.find((f) => /What is Originals/.test(f.q)) || {}).a || '';
  const hiring = (faqs.find((f) => /hiring/.test(f.q)) || {}).a || '';
  // a CONTACT INFO row: a whole-row link, ruled, no box (the /contact rows; info-pages.css .irow)
  const row = (href, ico, k, v) => `<li><a class="irow" href="${href}">${icon(ico)}<span class="irow__k">${k}</span><span class="irow__v">${v}</span>${icon('arrow', 'irow__go')}</a></li>`;

  const wholesale = {
    path: '/wholesale', title: 'Wholesale | Originals', description: 'Originals wholesale: The Brand Behind The Brands. Carry Originals flower, grown in-house, in your dispensary.',
    jsonld: [crumbsLd([{ name: 'Wholesale', path: '/wholesale' }])], bodyClass: 'is-wholesale',
    main: h`${pageHero({ kicker: 'Wholesale', title: 'The brand behind <span class="chrome-word">the brands</span>', crumbs: [{ label: 'Wholesale', href: '/wholesale' }], lede: '<p>Best Cultivators in California. Carry Originals flower, grown in-house, in your dispensary.</p>', video: '', media: img('grow-room', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
${confirm('Wholesale: the live footer links /wholesale but the page returns 404. Confirm the wholesale contact, process and product list with the client; the form is a preview and does not send.')}
<!-- 2026-11-12 redesign to docs/DESIGN-LANGUAGE.md (info-pages.css): two ruled columns, each title over a hairline: the
     copy on the left, the inquiry form (a flat panel) on the right; one screen tall at 1440x900. -->
<section class="band info-band info-ws" aria-labelledby="ws-h">
  <div class="wrap info-split info-split--even">
    <div class="info-split__main info-ws__copy">
      <div class="info-rule">${kicker('Grown in-house')}<h2 id="ws-h">Built to <span class="chrome-word">supply</span></h2></div>
      <div class="prose">${whatIs}</div>
      <p class="info-ws__line">The Originals house brand is stocked at many other dispensaries in California and Massachusetts.</p>
      <p class="btn-row">${btn('Find Originals', '/find-originals', { kind: 'ghost' })}${btn('Strain library', '/strains', { kind: 'ghost' })}</p>
    </div>
    <div class="info-split__side">
      <div class="info-rule">${kicker('Become a retailer')}<h3 class="h3">Wholesale inquiry</h3></div>
      ${form({ id: 'wholesale', fields: [{ name: 'name', label: 'Name', autocomplete: 'name', required: true }, { name: 'company', label: 'Dispensary or company', autocomplete: 'organization', required: true }, { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel' }, { name: 'licence', label: 'State licence number' }, { name: 'state', label: 'State', type: 'radio', options: ['California', 'Massachusetts'] }, { name: 'message', label: 'What would you like to carry?', type: 'textarea' }], submit: 'Send inquiry', confirmNote: 'wholesale inquiry routing', cls: 'info-form' })}
    </div>
  </div>
</section>`,
  };

  const jobFields = [
    { name: 'positions', label: 'Select Job Position(s):', type: 'checkboxes', options: ['Retail', 'Distribution', 'Cultivation', 'Manufacturing'] },
    { name: 'name', label: 'Name:', autocomplete: 'name', required: true },
    { name: 'email', label: 'Email:', type: 'email', autocomplete: 'email', required: true },
    { name: 'phone', label: 'Phone:', type: 'tel', autocomplete: 'tel', required: true },
    { name: 'dob', label: 'Date of Birth:', type: 'date' },
    { name: 'why', label: 'Write a brief paragraph about why you want to work for Originals:', type: 'textarea' },
    { name: 'license', label: 'Do you have a valid Driver\'s License?', type: 'radio', options: ['Yes', 'No'] },
    { name: 'schedule', label: 'Are you seeking full-time or part-time?', type: 'radio', options: ['Full-time', 'Part-time'] },
    { name: 'availability', label: 'What is your current availability?', wide: true },
    { name: 'start', label: 'When can you start?' },
    { name: 'employed', label: 'Are you presently employed?', type: 'radio', options: ['Yes', 'No'] },
    { name: 'current', label: 'If so, please explain current employment:', type: 'textarea', rows: 3 },
    { name: 'education', label: 'Highest Education Completed:', type: 'radio', options: ['High School/GED', 'College (Bachelors)', 'Masters Degree'] },
    { name: 'school', label: 'Name of school:' },
    { name: 'employer', label: 'Most Recent Employer:' },
    { name: 'duties', label: 'Job title and duties:', wide: true },
    { name: 'from', label: 'Employment date start:', type: 'date' },
    { name: 'to', label: 'Employment Date End:', type: 'date' },
    { name: 'supervisor', label: 'Supervisor or Manager Name' },
    { name: 'supervisor-phone', label: 'Supervisor of Manager Phone', type: 'tel' },
    { name: 'resume', label: 'Upload Resume', type: 'file' },
  ];
  const jobs = {
    path: '/jobs', title: 'California Cannabis Industry Jobs | Originals LA', description: 'Reach out to us if you think you\'d be a good fit for one of our California cannabis industry jobs. We seek friendly and dependable people to join our team.',
    jsonld: [crumbsLd([{ name: 'Jobs', path: '/jobs' }])], active: '/jobs', bodyClass: 'is-jobs',
    main: h`${pageHero({ kicker: 'Jobs', title: 'CALIFORNIA ORIGINALS CANNABIS INDUSTRY <span class="chrome-word">jobs</span>', crumbs: [{ label: 'Jobs', href: '/jobs' }], lede: '<p>Reach out to us if you think you\'d be a good fit for one of our California cannabis industry jobs. We seek friendly and dependable people to join our team.</p>', media: img('store-la-interior', { sizes: '(max-width: 900px) 200vw, 100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<!-- 2026-11-12 redesign to docs/DESIGN-LANGUAGE.md (info-pages.css). The hero is the LA store's own photo (store-la-interior,
     the business's Google Maps listing), in place of the AI warehouse illustration. A split head (the title, the line
     beside it), then the application (a flat panel, field for field the live form) beside the hiring note and CONTACT
     INFO as ruled rows, pinned while the form scrolls from 900px. -->
<section class="band info-band info-jobs" aria-labelledby="apply-h">
  <div class="wrap">
    <div class="info-head">
      <div>${kicker('Apply today')}<h2 id="apply-h">APPLY <span class="chrome-word">today</span></h2></div>
      <p class="lede">ONCE APPLICATION HAS BEEN REVIEWED, YOU’LL RECEIVE A CALL WITHIN 1-2 WEEKS TO SCHEDULE AN INTERVIEW</p>
    </div>
    <div class="info-split">
      <div class="info-split__main">
        ${form({ id: 'jobs', fields: jobFields, submit: 'Submit application', confirmNote: 'job application inbox / ATS', cls: 'info-form', ok: 'Thank you for applying. We will get back to you as soon as possible.', err: 'Oops, there was an error sending your message. Please try again later.' })}
      </div>
      <aside class="info-split__side info-split__side--pin">
        <div class="prose">${hiring}</div>
        ${confirm('Hiring contact: the live /jobs page lists the placeholder phone 555.555.5555 and "3 STORES"; the store phones and "2 STORES" are shown instead.')}
        <h2 class="kicker">CONTACT INFO</h2>
        <ul class="irows" role="list">
          ${[...STORE_ORDER.map((id) => row('tel:' + STORES[id].tel, 'phone', esc(STORES[id].short), esc(STORES[id].phone))), row('mailto:' + SITE.jobsEmail, 'mail', 'EMAIL', 'SUPPORT@ORIGINALSCA . COM'), row(u('/retail'), 'pin', '2 STORES', 'VIEW STORES')]}
        </ul>
      </aside>
    </div>
  </div>
</section>`,
  };
  return [wholesale, jobs];
}
