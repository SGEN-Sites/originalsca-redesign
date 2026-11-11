// seo.mjs: JSON-LD built only from declared facts (src/content/site.mjs) and the live capture.
import { SITE, STORES, STORE_ORDER, SOCIAL, LINKS } from '../content/site.mjs';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function orgLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE.origin + '/#org', name: SITE.name, alternateName: SITE.names,
    url: SITE.origin + '/', logo: SITE.origin + '/assets/brand/favicon.svg', slogan: SITE.brandBehind,
    sameAs: [...SOCIAL.map((s) => s.href), LINKS.clothing],
  };
}
export function websiteLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.origin + '/#site', name: SITE.name, url: SITE.origin + '/', publisher: { '@id': SITE.origin + '/#org' } };
}
export function storeLd(id) {
  const s = STORES[id];
  const groups = {};
  for (const [d, [o, c]] of Object.entries(s.hours)) (groups[o + '-' + c] ||= []).push(DAYS[d]);
  return {
    '@context': 'https://schema.org', '@type': 'Store', '@id': SITE.origin + s.page + '#store', name: s.name, parentOrganization: { '@id': SITE.origin + '/#org' },
    url: SITE.origin + s.page, telephone: s.phone,
    address: { '@type': 'PostalAddress', streetAddress: s.street, addressLocality: s.city, addressRegion: s.region, postalCode: s.postal, addressCountry: 'US' },
    openingHoursSpecification: Object.entries(groups).map(([k, days]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: k.split('-')[0], closes: k.split('-')[1] })),
    hasMap: s.maps,
  };
}
export const storesLd = () => STORE_ORDER.map(storeLd);
export function crumbsLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', path: '/' }, ...items].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name || c.label, item: SITE.origin + (c.path || c.href) })) };
}
export function faqLd(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}
export function postLd(p) {
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.published || undefined, dateModified: p.modified || undefined,
    author: { '@type': 'Organization', name: SITE.name }, publisher: { '@id': SITE.origin + '/#org' }, mainEntityOfPage: SITE.origin + p.path, description: p.description || undefined,
  };
}
