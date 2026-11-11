// plan-decisions.mjs: Phase B. Record a change-control decision for every ledger row (through sr-plan --set),
// answer every preset match (through sr-match --answer), and append one ADD row per new page.
//   node tools/plan-decisions.mjs
// Decisions are data below, so the ledger can be rebuilt and diffed. REMOVE rows get the matcher's own top
// candidate only to close its queue: no section is built for them (docs/CHANGE-LOG.md says so).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SR = path.join(process.env.HOME, '.claude/skills/site-reforge/scripts');
const ORIGIN = 'https://originalsca.com';
const run = (script, args) => execFileSync('node', [path.join(SR, script), '--project', ROOT, ...args], { encoding: 'utf8' });

const P = {
  hero: '01-transitions-hero-motion-8-the-dominant-hero',
  cards: '10-sections-4-features-services',
  stats: '10-sections-3-trust-stats',
  gallery: '10-sections-8-team-gallery',
  blog: '10-sections-9-content-blog',
  faq: 'accordion-faq',
  form: '10-sections-11-forms-lead-gen',
  contact: 'contact-form-1',
  cta: 'cta-banner',
  footer: '10-sections-10-footers',
  pricing: '10-sections-6-pricing',
  bar: '08-scroll-sticky-d-mobile-6-mobile-bottom-bar-safe-area-aware-call-cart-bar-f2-f3',
};

const MENU_WHY = 'Live Tymber store menu page (product, brand or category listing with the cart). It stays on the live store platform and every Shop, category and brand button on the redesign links straight to it, so the shopper lands on products with a working cart. It is not rebuilt as a static page.';
const DEMO_WHY = 'Duda template demo page (bed linen, lamps, cutlery) left over from the site template; it has nothing to do with Originals and publishing it under the brand would mislead. Not rebuilt.';

// row id -> [decision, slot, preset, why]
const keep = {
  'originalsca.com/#s1': ['REPLACE', 'value-proposition', P.hero, 'Operator direction: drop the generic SEO filler ("top-level cannabis experience every time"). H1 "Best Cultivators in California" kept; the hero is rebuilt as the Showroom (the brand film behind giant chrome ORIGINALS letters on a reflective floor) with "The Brand Behind The Brands" from declared facts.'],
  'originalsca.com/#s2': ['IMPROVE', 'benefits-solution', P.cards, 'FLOWER tile kept; the "Lorem ipsim." placeholder removed; links straight to the selected store\'s Flower category with products and the cart.'],
  'originalsca.com/#s3': ['IMPROVE', 'benefits-solution', P.cards, 'EXTRACTS tile kept, placeholder removed, deep link to the store\'s extracts / concentrates category.'],
  'originalsca.com/#s4': ['IMPROVE', 'benefits-solution', P.cards, 'CARTRIDGES tile kept, placeholder removed, deep link to the store\'s cartridges / vape pens category.'],
  'originalsca.com/#s5': ['IMPROVE', 'benefits-solution', P.cards, 'DRINKS tile kept, placeholder removed, deep link to the store\'s beverages category.'],
  'originalsca.com/#s6': ['IMPROVE', 'benefits-solution', P.cards, 'PREROLLS tile kept, placeholder removed, deep link to the store\'s pre-roll category. EDIBLES (on the live menu but missing from the live home grid) added beside it.'],
  'originalsca.com/#s7': ['IMPROVE', 'benefits-solution', P.cards, 'TINCTURES tile kept, placeholder removed, deep link to the store\'s tinctures category.'],
  'originalsca.com/#s8': ['IMPROVE', 'benefits-solution', P.cards, 'TOPICALS tile kept, placeholder removed, deep link to the store\'s topicals category.'],
  'originalsca.com/#s9': ['REMOVE', 'benefits-solution', P.cards, 'PILLS tile removed: no pills or capsules category or product exists on the live LA menu (0 of 581 products), and the live tile only opened the menu home. Showing it would send a shopper to a page without the products it names.'],
  'originalsca.com/#s10': ['IMPROVE', 'strategic-cta', P.pricing, 'DEALS tile kept, "Lorem Ipsum" placeholder removed; becomes the Happy Hour deals band linking to /deals.'],
  'originalsca.com/#s11': ['IMPROVE', 'strategic-cta', P.cards, 'REWARDS tile kept, placeholder removed; links to the Rewards Program page and its VIP enrolment.'],
  'originalsca.com/#s12': ['IMPROVE', 'strategic-cta', P.cards, 'EVENTS tile kept, placeholder removed; now links to the new /events page (the live Events link 404s or opens a placeholder).'],
  'originalsca.com/#s13': ['IMPROVE', 'trust-positioning', P.cards, 'SHOP BY BRAND kept with its words; brand buttons deep link to each brand on the live menu; Originals house brand leads.'],
  'originalsca.com/#s14': ['PRESERVE', 'benefits-solution', P.blog, 'RECENT BLOGS (Cannablog) kept with its intro.'],
  'originalsca.com/#s15': ['PRESERVE', 'benefits-solution', P.blog, 'Blog teaser kept.'],
  'originalsca.com/#s16': ['PRESERVE', 'benefits-solution', P.blog, 'Blog teaser kept.'],
  'originalsca.com/#s17': ['PRESERVE', 'benefits-solution', P.blog, 'Blog teaser kept.'],
  'originalsca.com/#s18': ['IMPROVE', 'strategic-cta', P.form, 'Newsletter heading kept word for word as the drop list sign-up; preview form does not submit (no backend) [CONFIRM WITH CLIENT list provider].'],
  'originalsca.com/brands#s1': ['IMPROVE', 'trust-positioning', P.cards, 'OUR BRANDS kept with its words; the six live brand tiles become a brand wall with deep links per store (LA live menu brand pages; San Diego live menu).'],
  'originalsca.com/bussin-merch#s1': ['REPLACE', 'benefits-solution', P.cards, 'The live page is a Duda placeholder ("This is paragraph text. Click it or hit the Manage Text button...") titled EVENTS. Replaced on the same URL by a real Bussin\' page (the collab strain and the release party, from declared facts) linking to Originals Clothing; the nav Events link now opens /events.'],
  'originalsca.com/california-opt-in#s1': ['PRESERVE', 'strategic-cta', P.form, 'California Opt-in copy kept word for word.'],
  'originalsca.com/contact#s1': ['IMPROVE', 'strategic-cta', P.contact, 'Contact form kept (Name, Email, Phone, How can we help?); its mislabelled "Wholesale Form" heading corrected; preview form does not submit [CONFIRM WITH CLIENT form provider].'],
  'originalsca.com/contact#s2': ['PRESERVE', 'strategic-cta', P.contact, 'CONTACT INFO kept.'],
  'originalsca.com/contact#s3': ['PRESERVE', 'strategic-cta', P.contact, 'LA phone kept.'],
  'originalsca.com/contact#s4': ['PRESERVE', 'strategic-cta', P.contact, 'info@ email kept.'],
  'originalsca.com/contact#s5': ['PRESERVE', 'strategic-cta', P.contact, '"2 STORES / VIEW STORES" kept, linking to /retail.'],
  'originalsca.com/cookie-policy#s1': ['PRESERVE', 'footer', P.footer, 'Cookie Policy kept word for word.'],
  'originalsca.com/deals#s1': ['PRESERVE', 'strategic-cta', P.pricing, 'LA 30% OFF FTP kept.'],
  'originalsca.com/deals#s2': ['PRESERVE', 'strategic-cta', P.pricing, 'Exclusion line kept.'],
  'originalsca.com/deals#s3': ['PRESERVE', 'strategic-cta', P.pricing, 'San Diego 50% OFF FTP kept.'],
  'originalsca.com/deals#s4': ['PRESERVE', 'strategic-cta', P.pricing, 'Exclusion line kept.'],
  'originalsca.com/deals#s5': ['IMPROVE', 'strategic-cta', P.pricing, 'SAVE NOW kept; all-day Sunday happy hour and the San Diego daily deals added from declared facts, each linking to the live deals [CONFIRM WITH CLIENT days and discounts].'],
  'originalsca.com/deals#s6': ['PRESERVE', 'strategic-cta', P.pricing, 'First Time Patient Deals kept.'],
  'originalsca.com/deals#s7': ['PRESERVE', 'strategic-cta', P.pricing, 'WEEDMAPS DEALS kept, linking to each store\'s live Weedmaps deals.'],
  'originalsca.com/deals#s8': ['PRESERVE', 'strategic-cta', P.pricing, '"Changing weekly!" kept.'],
  'originalsca.com/deals#s9': ['IMPROVE', 'strategic-cta', P.form, 'Newsletter heading kept as the drop list sign-up.'],
  'originalsca.com/disclaimer#s1': ['PRESERVE', 'footer', P.footer, 'Disclaimer kept word for word.'],
  'originalsca.com/faqs#s1': ['PRESERVE', 'objection-handling', P.faq, 'GENERAL FAQS intro kept.'],
  'originalsca.com/faqs#s2': ['IMPROVE', 'objection-handling', P.faq, 'Hours answer: the live FAQ lists 9 AM to 10 PM, which matches neither store; the answer now gives each store\'s hours from the store records [CONFIRM WITH CLIENT].'],
  'originalsca.com/faqs#s3': ['PRESERVE', 'objection-handling', P.faq, 'Kept word for word.'],
  'originalsca.com/faqs#s4': ['PRESERVE', 'objection-handling', P.faq, 'Kept word for word.'],
  'originalsca.com/faqs#s5': ['PRESERVE', 'objection-handling', P.faq, 'Kept word for word; Weedmaps and rewards links added.'],
  'originalsca.com/faqs#s6': ['PRESERVE', 'objection-handling', P.faq, 'Kept word for word.'],
  'originalsca.com/faqs#s7': ['PRESERVE', 'objection-handling', P.faq, 'Kept word for word; links to /jobs.'],
  'originalsca.com/faqs#s8': ['PRESERVE', 'trust-positioning', P.faq, 'What is Originals? kept word for word (established 2006, indoor cultivation scale) and reused on Our Story.'],
  'originalsca.com/faqs#s9': ['IMPROVE', 'strategic-cta', P.form, 'Newsletter heading kept as the drop list sign-up.'],
  'originalsca.com/jobs#s1': ['IMPROVE', 'strategic-cta', P.form, 'Job application form kept field for field; its mislabelled "Wholesale Form" heading corrected; preview form does not submit [CONFIRM WITH CLIENT form provider].'],
  'originalsca.com/jobs#s2': ['PRESERVE', 'strategic-cta', P.contact, 'CONTACT INFO kept.'],
  'originalsca.com/jobs#s3': ['REPLACE', 'strategic-cta', P.contact, 'The live page shows the placeholder phone 555.555.5555; replaced by the store phones from the store records [CONFIRM WITH CLIENT hiring contact].'],
  'originalsca.com/jobs#s4': ['PRESERVE', 'strategic-cta', P.contact, 'support@ email kept.'],
  'originalsca.com/jobs#s5': ['REPLACE', 'strategic-cta', P.contact, 'The live page says "3 STORES"; Originals has two stores (Los Angeles, San Diego), so it reads "2 STORES" as on /contact.'],
  'originalsca.com/los-angeles#s1': ['IMPROVE', 'strategic-cta', P.contact, 'Dispensary Downtown LA contact page kept with its form and store details; hours from the store records (the live page shows a third set of LA hours) [CONFIRM WITH CLIENT].'],
  'originalsca.com/los-angeles-store#s1': ['IMPROVE', 'trust-positioning', P.cards, 'Los Angeles store page kept and expanded: address, phone, hours, directions, the LA menu by category, the warehouse and the family wall from declared facts.'],
  'originalsca.com/membership_agreement#s1': ['PRESERVE', 'strategic-cta', P.form, 'Opt-in form and consent terms kept word for word; preview form does not submit.'],
  'originalsca.com/privacy-policy#s1': ['PRESERVE', 'footer', P.footer, 'Privacy Policy kept word for word.'],
  'originalsca.com/prop-65-warning#s1': ['IMPROVE', 'footer', P.footer, 'The live page says only "Need info"; the California Prop 65 cannabis warning is shown here and in every footer [CONFIRM WITH CLIENT compliance wording].'],
  'originalsca.com/retail#s1': ['IMPROVE', 'trust-positioning', P.cards, 'OUR STORES / OUR LOCATIONS kept: both stores with address, phone, hours, directions and their own menus; SHOP MERCH (OPEN 24/7) kept for Originals Clothing.'],
  'originalsca.com/rewards-program-and-opt-in#s1': ['IMPROVE', 'strategic-cta', P.cta, '"Join our Rewards Program Today!" and the VIP Program Login/Join link kept.'],
  'originalsca.com/san-diego-store#s1': ['IMPROVE', 'trust-positioning', P.cards, 'San Diego store page kept and expanded: address, phone, hours, directions, the San Diego menu by category (its live online menu), pets welcome.'],
  'originalsca.com/terms-of-service#s1': ['PRESERVE', 'footer', P.footer, 'Terms of Service kept word for word.'],
};

const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/content-inventory.json'), 'utf8'));
const postTitles = new Set();
const postSlugs = new Set();
for (const p of content.pages) {
  const slug = new URL(p.url).pathname.replace(/^\/|\/$/g, '');
  if (!slug || slug.includes('/')) continue;
  if ((p.bodyChars || (p.bodyText || '').length) > 7000 && !/policy|terms|disclaimer/.test(slug)) { postSlugs.add(slug); postTitles.add((p.title || '').trim().slice(0, 70)); }
}

const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/change-control.json'), 'utf8'));
const match = fs.existsSync(path.join(ROOT, 'audit/preset-match.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/preset-match.json'), 'utf8')) : { rows: [] };
const top = new Map((match.rows || []).map((r) => [r.rowId, r.candidates && r.candidates[0] && r.candidates[0].presetId]));
const answers = [];
const counts = {};
let n = 0;
for (const row of ledger.rows) {
  if (row.decision === 'ADD') continue;
  const pathname = new URL(row.url).pathname.replace(/\/$/, '') || '/';
  let decision, slot = '', preset, why;
  if (keep[row.id]) [decision, slot, preset, why] = keep[row.id];
  else if (pathname.startsWith('/menu/')) { decision = 'REMOVE'; preset = top.get(row.id); why = MENU_WHY; }
  else if (/^\/(category|product)\//.test(pathname)) { decision = 'REMOVE'; preset = top.get(row.id); why = DEMO_WHY; }
  else if (postSlugs.has(pathname.slice(1)) || pathname === '/blog') {
    slot = 'benefits-solution'; preset = P.blog;
    const isRelated = postTitles.has(String(row.label || '').trim().slice(0, 70)) && row.index > 1;
    if (pathname === '/blog') { decision = 'PRESERVE'; why = 'Cannablog index entry kept (title, byline, date, excerpt) on /blog.'; }
    else if (isRelated) { decision = 'IMPROVE'; why = 'Related-posts list kept as a "Keep reading" rail under the article.'; }
    else { decision = 'PRESERVE'; why = row.index === 1 ? 'Article kept word for word at its own URL, with the H1 the live page lacked.' : 'Article section kept word for word.'; }
  } else { console.log('UNMAPPED', row.id, row.label); continue; }
  const args = ['--set', row.id, '--decision', decision, '--why', why];
  if (slot) args.push('--slot', slot);
  if (preset && decision !== 'REMOVE') args.push('--preset', preset);
  run('sr-plan.mjs', args);
  if (preset) answers.push(row.id + '=' + preset);
  counts[decision] = (counts[decision] || 0) + 1;
  n++;
}
console.log('rows set:', n, JSON.stringify(counts));
let answered = 0;
for (let i = 0; i < answers.length; i += 40) {
  const chunk = answers.slice(i, i + 40).flatMap((a) => ['--answer', a]);
  try { run('sr-match.mjs', chunk); answered += chunk.length / 2; } catch (e) { process.stdout.write(String(e.stdout || '').slice(-400)); }
}
console.log('matcher answers sent:', answered);

// ADD rows: one per new page (C16 counts build pages that are in neither the source nor an ADD decision)
const ADD = [
  ['/our-story', 'trust-positioning', P.stats, 'Our Story (the live site has no About page): the block, the family, since 2006, awards, in-house cultivation, from declared facts and the live FAQ.'],
  ['/strains', 'benefits-solution', P.cards, 'Strain Library of the house genetics (Originals OG, King Louie, Skywalker, Oaksterdam OG, Gelato, SFV OG, Paris OG, Bussin\'), linking to the live menu and the existing strain articles.'],
  ['/collabs', 'trust-positioning', P.cards, 'Collabs, text only, no artist photos [CONFIRM WITH CLIENT every partner].'],
  ['/media', 'benefits-solution', P.gallery, 'Media: the brand film and the brand\'s own event flyers and imagery; press contact.'],
  ['/drops', 'strategic-cta', P.form, 'Drop list: new strain and merch drops sign-up (preview form does not submit) [CONFIRM WITH CLIENT next drop].'],
  ['/find-originals', 'strategic-cta', P.cards, 'Find Originals: the house brand at other dispensaries in California and Massachusetts (retailer list [CONFIRM WITH CLIENT]) plus the two Originals stores.'],
  ['/events', 'trust-positioning', P.gallery, 'Events (the live Events link 404s or opens a placeholder): past highlights from declared facts and an upcoming section held as [CONFIRM WITH CLIENT] placeholders.'],
  ['/wholesale', 'strategic-cta', P.contact, 'Wholesale (the live footer link 404s): The Brand Behind The Brands, retailer inquiry form (preview does not submit) [CONFIRM WITH CLIENT].'],
  ['/shop', 'benefits-solution', P.cards, 'Shop hub: pick Los Angeles or San Diego, then every category and brand links straight to that store\'s live menu with the cart.'],
  ['/clothing', 'benefits-solution', P.cards, 'Originals Clothing: the online clothing shop (open 24/7) and merch, linking to originalsclothingshop.com.'],
  ['/404.html', 'footer', P.footer, 'Not-found page.'],
  ['/form-sent', 'strategic-cta', P.form, 'Preview form target: every preview form submits here (GET, nothing stored) and the page says plainly that nothing was sent; replaced by the client\'s form provider at launch [CONFIRM WITH CLIENT].'],
];
const fresh = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/change-control.json'), 'utf8'));
fresh.rows = fresh.rows.filter((r) => r.decision !== 'ADD');
for (const [p, slot, preset, why] of ADD) {
  fresh.rows.push({ id: 'add:' + p, url: ORIGIN + p, pageType: 'added', index: 0, label: p, sourceTag: '', sourceClass: '', decision: 'ADD', why, narrativeSlot: slot, presetId: preset, rebuiltAs: p.endsWith('.html') ? p.slice(1) : p.slice(1) + '.html' });
}
fresh.rowCount = fresh.rows.length;
fresh.updated = new Date().toISOString();
fs.writeFileSync(path.join(ROOT, 'audit/change-control.json'), JSON.stringify(fresh, null, 2));
console.log('ADD rows:', ADD.length, 'total rows:', fresh.rows.length);
try { console.log(run('sr-plan.mjs', ['--check']).split('\n').slice(-8).join('\n')); } catch (e) { console.log(String(e.stdout || '').split('\n').slice(-12).join('\n')); }
