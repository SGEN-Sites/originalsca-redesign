// html.mjs: escaping, attributes and base-aware URLs. No dependencies.
let BASE = '/';
export function setBase(b) { BASE = b.endsWith('/') ? b : b + '/'; }
export function base() { return BASE; }

// Internal path -> URL under the build's base ('/' for dist, '/<repo>/' for the Pages preview).
// External (http, mailto, tel, #) URLs pass through untouched.
export function u(p) {
  if (!p) return BASE;
  if (/^(https?:|mailto:|tel:|sms:|#|data:)/.test(p)) return p;
  return BASE + p.replace(/^\//, '');
}
// asset path relative to the dist root
export const a = (p) => u('assets/' + p.replace(/^\/?(assets\/)?/, ''));

export function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// attribute object -> string; false/null/undefined are dropped, true renders a bare attribute
export function attrs(o = {}) {
  return Object.entries(o)
    .filter(([, v]) => v !== false && v != null)
    .map(([k, v]) => (v === true ? ' ' + k : ' ' + k + '="' + esc(v) + '"'))
    .join('');
}
// tagged template that joins arrays and drops null/false; values are NOT escaped (call esc() for text)
export function h(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) {
      const v = vals[i];
      out += Array.isArray(v) ? v.filter((x) => x != null && x !== false).join('') : (v == null || v === false ? '' : v);
    }
  });
  return out;
}
export const ext = (href) => /^https?:/.test(href) && !href.startsWith('https://originalsca.com/__never');
// a link that opens external destinations (menus, socials) in a new tab with rel noopener
export function link(href, inner, extra = {}) {
  const isExt = /^https?:/.test(href);
  return '<a' + attrs({ href: u(href), ...(isExt ? { target: '_blank', rel: 'noopener' } : {}), ...extra }) + '>' + inner + '</a>';
}
// HTML comment carrying a [CONFIRM WITH CLIENT] note (page source only, never visible copy)
export const confirm = (note) => '<!-- [CONFIRM WITH CLIENT] ' + String(note).replace(/--/g, '-') + ' -->';
export const slugify = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
