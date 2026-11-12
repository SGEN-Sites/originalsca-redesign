// blog.mjs: the Cannablog index and every live article at its live URL, words verbatim (src/lib/capture.mjs).
import { h, esc, u, a } from '../lib/html.mjs';
import { extractPost, extractPostList, postSlugs, postImages, normImg, decode, textOf } from '../lib/capture.mjs';
import { pageHero, btn, shopBtn, kicker, img, icon } from '../lib/parts.mjs';
import { crumbsLd, postLd } from '../lib/seo.mjs';

// one post in an editorial list (the index's lead story and numbered grid, an article's "More from the Cannablog";
// blog.css): postCard()'s words and image in the same order (the author bar, the title, the live excerpt), the whole
// entry one link. Its number is a CSS counter, so it adds no words.
function entry(p, { cls, tag = 'h2', go = false }) {
  const im = p.cardImage ? `<img src="${esc(p.cardImage.src)}" width="${p.cardImage.w}" height="${p.cardImage.h}" alt="" loading="lazy" decoding="async">` : '';
  return h`<article class="ed ${cls}" data-reveal>
  <a class="ed__link" href="${u(p.path)}">
    <span class="ed__top"><span class="ed__no" aria-hidden="true"></span><span class="ed__meta">${esc(p.meta || p.dateText || '')}</span></span>
    <span class="ed__media">${im}</span>
    <${tag} class="ed__title">${esc(p.title)}</${tag}>
    ${p.excerpt ? `<span class="ed__excerpt">${esc(p.excerpt)}</span>` : ''}
    ${go ? `<span class="ed__go" aria-hidden="true">${icon('arrow')}</span>` : ''}
  </a>
</article>`;
}

// an article body, reshaped by markup only: its first image (the post's own card image in 20 of the 21 posts) is lifted
// out into the hero figure, the same tag loaded first, so the page's images keep their order; each run of two or more
// images in a row is wrapped as one gallery row (the same tags in the same order)
function shape(body) {
  const m = /<img\b[^>]*>/.exec(body);
  const lead = m ? m[0].replace(' loading="lazy"', ' loading="eager" fetchpriority="high"') : '';
  const rest = (m ? body.slice(0, m.index) + body.slice(m.index + m[0].length) : body)
    .replace(/<img\b[^>]*>(?:\s*<img\b[^>]*>)+/g, (run) => `<div class="post__figs" data-n="${run.match(/<img\b/g).length}">${run}</div>`);
  return { lead, rest };
}

let POSTS = null;
export function loadPosts() {
  if (POSTS) return POSTS;
  const map = postImages();
  // the live /blog list: its author bar and excerpt for each post it shows (the other posts use their own byline)
  const live = new Map(extractPostList('/blog').map((x) => [x.slug, x]));
  POSTS = postSlugs().map((slug) => {
    const p = extractPost(slug);
    // card image: the post's own lead image (its JSON-LD image, else the first image in the body)
    const lead = p.image && map[normImg(p.image)] ? map[normImg(p.image)] : null;
    const first = /<img src="([^"]+)" width="(\d+)" height="(\d+)"/.exec(p.body);
    const card = lead ? { src: a('img/posts/' + lead.file), w: lead.w, h: lead.h } : first ? { src: a(first[1]), w: +first[2], h: +first[3] } : null;
    const date = p.published ? new Date(p.published) : null;
    const dateText = date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
    const L = live.get(slug);
    return { ...p, cardImage: card, date, dateText, meta: L ? L.authorBar : (p.byline || dateText), excerpt: L ? L.excerpt : p.description };
  }).sort((x, y) => (y.date || 0) - (x.date || 0));
  return POSTS;
}

function article(p, all) {
  // images inside the article body point at assets/img/posts/ (relative markers from capture.mjs)
  const body = p.body.replace(/src="img\/posts\//g, 'src="' + a('img/posts/'));
  // the live "recent posts" list under this article: the same posts, titles, author bars and excerpts
  const bySlug = new Map(all.map((x) => [x.slug, x]));
  const listed = extractPostList(p.path).filter((x) => x.slug !== p.slug);
  const more = listed.filter((x) => bySlug.has(x.slug)).map((x) => ({ ...bySlug.get(x.slug), title: x.title, meta: x.authorBar, excerpt: x.excerpt }));
  if (more.length !== listed.length) throw new Error(p.path + ': the live post list links a post this build does not have');
  const { lead, rest } = shape(body);
  // the crumb trail stops at the Cannablog: the article title is the H1 right below it
  const main = h`${pageHero({ kicker: 'Cannablog', title: esc(p.title), crumbs: [{ label: 'Cannablog', href: '/blog', current: false }], lede: `<p class="byline">${esc(p.byline || '')}</p>`, variant: 'ink', cls: 'phero--post' })}
<article class="band post">
  ${lead ? `<figure class="post__hero">${lead}</figure>` : ''}
  <div class="wrap wrap--narrow prose post__body">${rest}</div>
  ${p.older || p.newer ? `<nav class="wrap wrap--narrow post-nav" aria-label="More posts">${p.older ? `<a class="btn btn--ghost post-nav__a" href="${u(p.older)}">&lt; Older Post</a>` : '<span></span>'}${p.newer ? `<a class="btn btn--ghost post-nav__a" href="${u(p.newer)}">Newer Post &gt;</a>` : ''}</nav>` : ''}
</article>
<section class="band post-more" aria-labelledby="more-h">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div>${kicker('Keep reading')}<h2 id="more-h">More from the <span class="chrome-word">Cannablog</span></h2></div>
      <p class="btn-row">${shopBtn('Shop the menu')}${btn('All posts', '/blog', { kind: 'ghost' })}</p>
    </div>
    <div class="ed-rows">${more.map((x) => entry(x, { cls: 'ed--row', tag: 'h3' }))}</div>
  </div>
</section>`;
  return { path: p.path, title: p.seoTitle || p.title, description: p.description, jsonld: [postLd(p), crumbsLd([{ name: 'Cannablog', path: '/blog' }, { name: p.title, path: p.path }])], bodyClass: 'is-post', main, active: '/blog' };
}

export function pages() {
  const all = loadPosts();
  const index = {
    path: '/blog', title: 'Cannabis Blog | Originals LA', description: 'Read our cannabis blog and get valuable information about general topics related to cannaculture in a short, relatable format that\'s perfect for a morning read.',
    jsonld: [crumbsLd([{ name: 'Cannablog', path: '/blog' }])], active: '/blog', bodyClass: 'is-blog',
    main: h`${pageHero({ kicker: 'Cannablog', title: 'Cannabis <span class="chrome-word">news</span>', crumbs: [{ label: 'Cannablog', href: '/blog' }], lede: '<p>Read our cannabis blog and get valuable information about general topics related to cannaculture in a short, relatable format that\'s perfect for a morning read. We cover countless topics and are always adding to our ever growing bank of informative articles. Check back frequently and keep up to date on the industry with us!</p>', media: img('trichomes', { sizes: '100vw', alt: '', decorative: true, eager: true }), variant: 'photo' })}
<section class="band blog-index" aria-label="All posts">
  <div class="wrap">
    ${entry(all[0], { cls: 'ed--lead', go: true })}
    <div class="ed-grid">${all.slice(1).map((p) => entry(p, { cls: 'ed--card' }))}</div>
  </div>
</section>`,
  };
  return [index, ...all.map((p) => article(p, all))];
}
