// docs-changelog.mjs: write docs/CHANGE-LOG.md from audit/change-control.json and src/content/images.json.
//   node tools/docs-changelog.mjs
// Content-page rows are listed one by one; the 668 live-menu rows and the template demo rows are summarised as the
// groups they are (same decision, same reason), with their counts, so nothing is hidden and nothing is retyped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/change-control.json'), 'utf8'));
const IMG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/images.json'), 'utf8'));
const esc = (s) => String(s || '').replace(/\|/g, '/').replace(/\n/g, ' ');
const pathOf = (u) => { try { return new URL(u).pathname || '/'; } catch { return u; } };
const groups = { menu: [], demo: [], rest: [] };
for (const r of L.rows) {
  const p = pathOf(r.url);
  if (p.startsWith('/menu/')) groups.menu.push(r);
  else if (/^\/(category|product)\//.test(p)) groups.demo.push(r);
  else groups.rest.push(r);
}
const tally = L.rows.reduce((a, r) => { a[r.decision] = (a[r.decision] || 0) + 1; return a; }, {});
const lines = [];
lines.push('# Change log', '', 'One row per section of the source site, generated from `audit/change-control.json` by `tools/docs-changelog.mjs`.', '');
lines.push('## Legend', '', '- **PRESERVE**: kept as-is; content and function unchanged', '- **IMPROVE**: same content and meaning, better structure, hierarchy or design', '- **REPLACE**: superseded by a better structure (reason required)', '- **REMOVE**: deliberately dropped (reason required)', '- **ADD**: new section that did not exist on the source', '');
lines.push('## Totals', '', `${L.rows.length} rows: ` + Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ') + '.', '');
lines.push('## Grouped decisions', '', '| group | rows | decision | why |', '|---|---|---|---|');
if (groups.menu.length) lines.push(`| Live Tymber store menu (/menu/los-angeles/..., products, brands, categories) | ${groups.menu.length} | REMOVE (not rebuilt) | ${esc(groups.menu[0].why)} |`);
if (groups.demo.length) lines.push(`| Duda template demo pages (/category/*, /product/*) | ${groups.demo.length} | REMOVE | ${esc(groups.demo[0].why)} |`);
lines.push('');
lines.push('## Decisions on the content pages', '', '| page | section | decision | narrative slot | why |', '|---|---|---|---|---|');
for (const r of groups.rest) lines.push(`| ${esc(pathOf(r.url))} | ${esc((r.label || '').slice(0, 70))} | ${r.decision} | ${esc(r.narrativeSlot)} | ${esc(r.why)} |`);
lines.push('');
lines.push('## Copy that changed', '', 'AI may tighten wording. It may not change meaning, and it may not add a fact. Every rewrite keeps its original here.', '');
lines.push('| where | original | rewritten | reason |', '|---|---|---|---|');
const copy = [
  ['/ hero intro', 'Shop at the best dispensary in Los Angeles and have a top-level cannabis experience every time. We source our products from popular California brands offering the ultimate in customer satisfaction.', 'Removed; the hero carries the live H1 "Best Cultivators in California." and "The Brand Behind The Brands" (declared fact).', 'Operator direction: drop generic SEO filler.'],
  ['footer tagline (every page)', 'Shop the best dispensary in Los Angeles and have a top-level cannabis experience every time.', 'Removed. The footer first carried the creed "Mastering Our Craft – Always Room For Improvement – Good, Better, Best – California\'s Best." (declared fact) as its sign-off; on 2026-11-12 the owner dropped the creed everywhere, so the editorial footer opens with the store and link columns.', 'Operator direction: drop generic SEO filler; owner, 2026-11-12: "I don\'t think we need the creed at all".'],
  ['/ category tiles', '"Lorem ipsim." under each category; "Lorem Ipsum" under DEALS / REWARDS / EVENTS', 'Placeholder text removed; tiles carry their label and the store they open.', 'Template placeholder text.'],
  ['/retail intro', 'Shop the best dispensary in Los Angeles and have a top-level cannabis experience every time.', 'Two stores in Southern California, one family. Pick yours, check today\'s hours and shop its menu.', 'Operator direction: drop generic SEO filler (neutral glue, no claims).'],
  ['/faqs "What are your hours?"', 'Monday to Saturday 9:00 AM - 10:00 PM, Sunday 10:00 AM - 8:00 PM', 'Each store\'s hours from the store records (LA Mon–Sat 7AM–9:45PM, Sun 8AM–7:45PM; SD Mon–Sat 8AM–9PM, Sun 9AM–9PM).', 'The live answer matches neither store [CONFIRM WITH CLIENT].'],
  ['/jobs contact', '555.555.5555 · 3 STORES', 'The two store phones · 2 STORES', 'Placeholder phone and wrong store count on the live page [CONFIRM WITH CLIENT].'],
  ['/contact, /jobs, /los-angeles form heading', 'Wholesale Form', 'Contact form / job application (no heading text)', 'The live heading mislabels the form.'],
  ['/prop-65-warning', 'Need info', 'The California Prop 65 cannabis warning', 'Placeholder text on a compliance page [CONFIRM WITH CLIENT wording].'],
  ['/bussin-merch', 'This is paragraph text. Click it or hit the Manage Text button to change the font, color, size, format, and more. To set up site-wide paragraph and title styles, go to Site Theme.', 'A Bussin\' page from declared facts', 'Template placeholder text [CONFIRM WITH CLIENT].'],
  ['blog posts', 'unlinked "Button" placeholders, share widgets', 'Removed; the posts\' own "< Older Post" / "Newer Post >" links kept as the post navigation', 'Template and platform residue.'],
];
for (const c of copy) lines.push('| ' + c.map(esc).join(' | ') + ' |');
lines.push('');
lines.push('## Imagery', '', 'Per-asset decisions for the live site are in `audit/image-inventory.json`. The redesign\'s own media registry is `src/content/images.json`. Generated images (fal: FLUX1.1 [pro] ultra stills, BiRefNet cut-outs, Kling 2.5 Turbo Pro loops) depict no real person, place or result: they are mood and illustration only, carry IPTC `trainedAlgorithmicMedia` in their XMP and `data-ai="generated"` on the page. Prompts, seeds and request ids: `docs/MEDIA.md` and `private/gen/*.result.json`.', '');
lines.push('| id | depicts | files |', '|---|---|---|');
for (const [id, r] of Object.entries(IMG).filter(([, r]) => r.ai)) lines.push(`| ${id} | ${esc(r.alt.replace(/^(Black-and-white )?[Ii]llustration: /, ''))} | ${r.files.map((f) => f.file).join(', ')} |`);
lines.push('', 'Client media (resized only, never AI-altered): ' + Object.entries(IMG).filter(([, r]) => !r.ai).map(([id]) => id).join(', ') + '.', '');
lines.push('## Tool note', '', '`sr-match --answer` splits `<rowId>=<presetId>` on the first "=", so the four live-menu rows whose ids carry a query string (`/menu/los-angeles?brand=...`) could not be answered through it. `tools/answer-match.mjs` applied the same answer with the same checks (preset exists in the index, row exists in the ledger), splitting on the last "=".', '');
fs.writeFileSync(path.join(ROOT, 'docs/CHANGE-LOG.md'), lines.join('\n'));
console.log('docs/CHANGE-LOG.md:', groups.rest.length, 'content rows,', groups.menu.length, 'menu rows,', groups.demo.length, 'demo rows');
