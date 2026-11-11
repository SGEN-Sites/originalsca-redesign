// capture.mjs: read the client's live words from the untouched capture (audit/raw/*.html) and the inventories.
// Nothing is retyped: posts, legal pages and FAQs are extracted from the raw HTML and sanitised to plain semantic
// markup (h2-h4, p, ul/ol/li, a, strong, em, blockquote, img). Platform markup, inline styles and scripts are dropped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'audit/raw');
const read = (f) => fs.readFileSync(f, 'utf8');
const json = (f) => JSON.parse(read(path.join(ROOT, f)));

let _content, _seo, _postImages;
export const contentInv = () => (_content ||= json('audit/content-inventory.json'));
export const seoInv = () => (_seo ||= json('audit/seo-inventory.json'));
export const postImages = () => (_postImages ||= (fs.existsSync(path.join(ROOT, 'src/content/post-images.json')) ? json('src/content/post-images.json') : {}));

export const pathOf = (url) => (new URL(url).pathname.replace(/\/$/, '') || '/');
export function rawOf(p) {
  const page = contentInv().pages.find((x) => pathOf(x.url) === p);
  if (!page) throw new Error('no captured page for ' + p);
  return read(path.join(RAW, page.savedAs));
}
export function pageRecord(p) { return contentInv().pages.find((x) => pathOf(x.url) === p); }
export function seoRecord(p) { return (seoInv().pages || []).find((x) => pathOf(x.url) === p) || {}; }

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', bull: '•', hellip: '…', zwnj: '', copy: '©', reg: '®', trade: '™', eacute: 'é' };
export function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n === 8204 ? '' : String.fromCodePoint(n); }
    return ENT[e.toLowerCase()] ?? m;
  });
}
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;');

// Normalise a Duda CDN image URL to its original upload (same rule as tools/fetch-client-media.mjs).
export const normImg = (u) => String(u).replace(/&amp;/g, '&').replace(/\/opt\//, '/').replace(/-\d+w(?=\.[a-z]+)/i, '').replace(/\?.*$/, '');

const KEEP = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 'br', 'blockquote', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'sup', 'sub', 'u']);
const RENAME = { b: 'strong', i: 'em', h1: 'h2', h5: 'h4', h6: 'h4' };
// sanitize(html, {imgMap, hShift}) -> clean semantic HTML, the live words unchanged
export function sanitize(html, opt = {}) {
  let s = String(html)
    .replace(/<(script|style|noscript|svg|iframe|template|form|button|select|textarea)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const anchors = []; // per open <a>: true = rendered, false = unwrapped (no href / share widget)
  const re = /<\/?([a-zA-Z0-9]+)\b([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[3] != null) { out.push(escText(decode(m[3]))); continue; }
    const closing = m[0][1] === '/';
    let tag = m[1].toLowerCase();
    if (!KEEP.has(tag)) continue;
    tag = RENAME[tag] || tag;
    if (opt.hShift && /^h[2-4]$/.test(tag)) tag = 'h' + Math.min(4, Number(tag[1]) + opt.hShift);
    if (closing) { if (tag === 'a') { if (anchors.pop() !== false) out.push('</a>'); continue; } out.push('</' + tag + '>'); continue; }
    const at = m[2] || '';
    if (tag === 'a') {
      const href = (/href\s*=\s*"([^"]*)"/i.exec(at) || [])[1];
      const h = href ? decode(href).trim() : '';
      // a link with no destination (Duda image widgets, placeholder buttons) or a share widget is unwrapped:
      // its children (an image, text) stay, the dead link does not
      // a link into a CMS admin screen (one live post links a WordPress "edit post" URL) is dead and leaks
      // the old platform: the words stay, the link goes
      if (!h || /^mailto:\?|facebook\.com\/sharer|twitter\.com\/(intent|share)|linkedin\.com\/share|pinterest\.com\/pin|^javascript:|\/wp-admin\b|[?&]action=edit\b/i.test(h)) { anchors.push(false); continue; }
      anchors.push(true);
      out.push('<a href="' + escAttr(h) + '"' + (/^https?:/.test(h) && !/originalsca\.com/.test(h) ? ' target="_blank" rel="noopener"' : '') + '>');
      continue;
    }
    if (tag === 'img') {
      const src = decode((/(?:data-dm-image-path|src)\s*=\s*"([^"]*)"/i.exec(at) || [])[1] || '');
      const alt = decode((/alt\s*=\s*"([^"]*)"/i.exec(at) || [])[1] || '');
      const hit = opt.imgMap && opt.imgMap[normImg(src)];
      if (hit) out.push('<img src="' + escAttr(opt.imgBase + hit.file) + '" width="' + hit.w + '" height="' + hit.h + '" alt="' + escAttr(alt) + '" loading="lazy" decoding="async">');
      else if (opt.onMissingImg) opt.onMissingImg(src);
      continue;
    }
    if (tag === 'br') { out.push('<br>'); continue; }
    out.push('<' + tag + '>');
  }
  return tidy(out.join(''));
}
// collapse the empty paragraphs, stray breaks and wrappers Duda leaves behind
function tidy(s) {
  let prev;
  // Duda's unlinked placeholder buttons render the word "Button" on their own
  s = s.replace(/(^|>)\s*Button\s*(?=<|$)/g, '$1');
  do {
    prev = s;
    s = s.replace(/<(p|strong|em|u|h[2-4]|li)>\s*(<br>\s*)*<\/\1>/g, '').replace(/<a href="[^"]*"[^>]*>\s*<\/a>/g, '')
      .replace(/<(strong|em|u)>\s*<\/\1>/g, '')
      .replace(/(<br>\s*){2,}/g, '<br>')
      .replace(/<p>\s*<br>/g, '<p>').replace(/<br>\s*<\/p>/g, '</p>')
      .replace(/<(strong|em)>(\s*)<(h[2-4])>/g, '$2<$3>').replace(/<\/(h[2-4])>(\s*)<\/(strong|em)>/g, '</$1>$2')
      .replace(/\s+/g, ' ');
  } while (s !== prev);
  return s.trim();
}
export const textOf = (html) => decode(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// ---- blog posts -------------------------------------------------------------------------------
function extractPostLive(slug) {
  const p = '/' + slug;
  const html = rawOf(p);
  const title = textOf((/data-blog-template="bind-title"[^>]*>([\s\S]*?)<\/h\d>/.exec(html) || [])[1] || '');
  const byline = textOf((/data-blog-template="bind-author"[^>]*>([\s\S]*?)<\/div>/.exec(html) || [])[1] || '');
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => { try { return JSON.parse(x[1]); } catch { return null; } }).find((x) => x && x['@type'] === 'BlogPosting') || {};
  const start = html.indexOf('data-auto="blog-post-row"');
  let end = html.indexOf('data-paginate-listable-widget', start);
  if (end < 0) end = html.indexOf('dmFooterContainer', start);
  const region = html.slice(start, end > 0 ? end : undefined);
  const cut = region.lastIndexOf('<div', region.lastIndexOf('dmRespRow'));
  const missing = [];
  let body = sanitize(region.slice(region.indexOf('>') + 1, cut > 0 ? cut : undefined), { imgMap: postImages(), imgBase: 'img/posts/', onMissingImg: (s) => missing.push(s), hShift: 0 });
  // the live post's own "< Older Post" / "Newer Post >" links become the post navigation
  const older = /<a href="([^"]+)">\s*&lt; Older Post\s*<\/a>/.exec(body);
  const newer = /<a href="([^"]+)">\s*Newer Post &gt;\s*<\/a>/.exec(body);
  body = body.replace(/<a href="[^"]+">\s*(&lt; Older Post|Newer Post &gt;)\s*<\/a>/g, '').trim();
  const rec = pageRecord(p) || {};
  const seo = seoRecord(p);
  return { slug, path: p, title: title || ld.headline || rec.title, byline, published: ld.datePublished || null, modified: ld.dateModified || null, author: (ld.author && ld.author.name) || null, image: ld.image || null, description: rec.metaDescription || ld.description || '', seoTitle: (rec.title || '').trim(), body, older: older ? older[1] : null, newer: newer ? newer[1] : null, missingImages: missing, canonical: seo.canonical || null };
}

// ---- generic content region (legal pages, opt-ins) ----------------------------------------------
function extractMainLive(p, { fromText = null } = {}) {
  const html = rawOf(p);
  const main = html.indexOf('id="dm_content"');
  let start = main;
  if (fromText) { const i = html.indexOf(fromText, main); if (i > 0) start = html.lastIndexOf('<', i); }
  const end = html.indexOf('dmFooterContainer', start);
  const region = html.slice(start, end > 0 ? end : undefined);
  return sanitize(region.slice(region.indexOf('>') + 1), { imgMap: postImages(), imgBase: 'img/posts/' });
}

// ---- FAQs (from the live FAQPage JSON-LD, which carries every question and answer) ----------------
function extractFaqsLive() {
  const html = rawOf('/faqs');
  for (const x of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let j; try { j = JSON.parse(x[1]); } catch { continue; }
    if (j && j['@type'] === 'FAQPage') return j.mainEntity.map((q) => ({ q: decode(q.name), a: sanitize(q.acceptedAnswer.text) }));
  }
  return [];
}

// ---- the live post lists: the /blog index and the "recent posts" list under every article ---------
// Each item as the live list shows it: the post it links to, its title, the author bar
// ("By Diogo Ribas • April 13, 2022") and the list's own excerpt, words unchanged.
function extractPostListLive(p) {
  return rawOf(p).split('data-auto="blog-post-article"').slice(1).map((blk) => {
    const slug = (/data-blog-post-alias="([^"]+)"/.exec(blk) || [])[1] || null;
    const title = textOf((/class="postTitle"[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/.exec(blk) || [])[1] || '');
    const bar = (/class="authorBar"[^>]*>([\s\S]*?)<\/div>/.exec(blk) || [])[1] || '';
    const authorBar = [...bar.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map((x) => textOf(x[1])).filter(Boolean).join(' ');
    const excerpt = textOf((/class="postDescription"[^>]*>([\s\S]*?)<\/div>/.exec(blk) || [])[1] || '');
    return { slug, title, authorBar, excerpt };
  }).filter((x) => x.slug && x.title);
}

// every blog post slug (articles over 7,000 chars of body text at the root, minus the policies)
function postSlugsLive() {
  return contentInv().pages
    .map((x) => ({ slug: pathOf(x.url).slice(1), chars: (x.bodyText || '').length }))
    .filter((x) => x.slug && !x.slug.includes('/') && x.chars > 7000 && !/policy|terms|disclaimer/.test(x.slug))
    .map((x) => x.slug);
}

// ---- snapshot: the published source rebuilds without audit/raw ----------------------------------------------------
// Where the untouched capture exists, every extraction runs on it and its result is recorded; src/build.mjs then writes
// src/content/capture.json. Where it does not (a clone of the public repo), the same calls answer from that file, so
// the words are identical either way and the raw platform HTML never has to be published.
const SNAP = path.join(ROOT, 'src/content/capture.json');
export const LIVE_CAPTURE = fs.existsSync(RAW) && fs.existsSync(path.join(ROOT, 'audit/content-inventory.json'));
const record = {};
let snap = null;
const memo = (name, fn) => (...args) => {
  const key = name + JSON.stringify(args);
  if (LIVE_CAPTURE) { if (!(key in record)) record[key] = fn(...args); return structuredClone(record[key]); }
  snap ||= JSON.parse(read(SNAP));
  if (!(key in snap)) throw new Error('src/content/capture.json has no ' + key + ': rebuild once where audit/raw exists');
  return structuredClone(snap[key]);
};
export const extractPost = memo('extractPost', extractPostLive);
export const extractMain = memo('extractMain', extractMainLive);
export const extractFaqs = memo('extractFaqs', extractFaqsLive);
export const extractPostList = memo('extractPostList', extractPostListLive);
export const postSlugs = memo('postSlugs', postSlugsLive);
export function writeCaptureSnapshot() {
  if (!LIVE_CAPTURE) return false;
  fs.writeFileSync(SNAP, JSON.stringify(Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))) + '\n');
  return true;
}
