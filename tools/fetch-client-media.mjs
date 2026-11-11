// fetch-client-media.mjs: download the client's own media that the redesign uses (logos, store photos, flyers,
// post images, the hero film), original upload first, with provenance. Polite: one request at a time, 400 ms
// apart, stops on the first 401/403/429/451 (no retry, honest UA). Stock and template-demo images are skipped.
//   node tools/fetch-client-media.mjs
// Writes private/client-media/<file> and private/client-media/provenance.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'private/client-media');
fs.mkdirSync(OUT, { recursive: true });
const UA = 'site-reforge/1.12 (redesign of originalsca.com for its owner; client media copy)';
const STOP = new Set([401, 403, 429, 451]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/image-inventory.json'), 'utf8'));
const SKIP = /unsplash|pexels|shutterstock|elsa-olofsson|grav-v_|ascend_cannabis|galleryLoader|dm-font|bed|lamp|mug|vase|cutlery|plate|stool|slipper|bowl|blanket|pillow|dining-room|lighting-lamp|subcategory|zoom-bedroom|HALLOWEEN|hallowseve|favicon|\.ico/i;
const norm = (u) => u.replace(/\/opt\//, '/').replace(/-\d+w(?=\.[a-z]+)/i, '').replace(/\?.*$/, '');
const seen = new Map();
for (const im of inv.images) {
  if (!/cdn-website\.com|multiscreensite\.com/.test(im.src)) continue;
  const k = norm(im.src);
  if (SKIP.test(k)) continue;
  const prev = seen.get(k);
  // keep the widest variant URL we saw as the fallback
  const w = Number((/-(\d+)w(?=\.[a-z]+)/i.exec(im.src) || [])[1] || 0);
  if (!prev || w > prev.w) seen.set(k, { original: k, variant: im.src, w, usedOn: im.usedOn || [] });
}
const extra = [
  { original: 'https://vid.cdn-website.com/ce6ced8b/videos/N62qIsrLQZSRHSbiwQof_video-new-v.mp4', variant: null, usedOn: ['https://originalsca.com/'] },
  { original: 'https://irp.cdn-website.com/ce6ced8b/dms3rep/multi/opt/N62qIsrLQZSRHSbiwQof_video-new.v2.0000000-1920w.jpg', variant: null, usedOn: ['https://originalsca.com/'] },
];
const list = [...seen.values(), ...extra];
const prov = [];
let stopped = null;
for (const item of list) {
  if (stopped) break;
  for (const url of [item.original, item.variant].filter(Boolean)) {
    let r;
    try { r = await fetch(url, { headers: { 'user-agent': UA } }); } catch (e) { prov.push({ url, error: String(e.cause && e.cause.code || e.message) }); await sleep(400); continue; }
    if (STOP.has(r.status)) { stopped = url + ' answered ' + r.status; break; }
    if (!r.ok) { prov.push({ url, status: r.status }); await sleep(400); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const base = decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/[^A-Za-z0-9._-]+/g, '-');
    fs.writeFileSync(path.join(OUT, base), buf);
    prov.push({ file: base, url, status: r.status, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16), contentType: r.headers.get('content-type'), usedOn: item.usedOn.slice(0, 6) });
    console.log('saved', base, Math.round(buf.length / 1024) + 'KB');
    await sleep(400);
    break;
  }
}
fs.writeFileSync(path.join(OUT, 'provenance.json'), JSON.stringify({ at: new Date().toISOString(), ua: UA, stopped, files: prov }, null, 2));
console.log('done', prov.filter((p) => p.file).length, 'files', stopped ? 'STOPPED: ' + stopped : '');
