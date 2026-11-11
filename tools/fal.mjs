// fal.mjs — submit-once fal queue runner for this project's generated imagery.
//
//   FAL_KEY=… node tools/fal.mjs <jobs.json> <outDir> [--only a,b] [--concurrency 3]
//
// The key is read from the FAL_KEY environment variable ONLY. It is never printed, logged or written to
// disk: sidecars record endpoint, input, request id and output URLs, never headers.
//
// jobs.json: [{ "name": "storefront-a", "endpoint": "fal-ai/flux-pro/v1.1-ultra", "input": { … } }, …]
// An input string value "result:<job>#<i>" is replaced with output URL <i> of an earlier job (its result.json),
// and "file:<path>" with a base64 data URI of a local file.
//
// Idempotent: a job with <name>.result.json is skipped; a job with <name>.pending.json resumes polling its
// request id instead of submitting again. One request per job, no automatic retries (fal bills per request).
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY is not set in the environment — refusing to run.'); process.exit(2); }
const [jobsFile, outDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flag = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const only = flag('--only') ? new Set(flag('--only').split(',')) : null;
const CONC = Number(flag('--concurrency') || 3);
if (!jobsFile || !outDir) { console.error('usage: node tools/fal.mjs <jobs.json> <outDir>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8')).filter((j) => !only || only.has(j.name));
const H = { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const side = (name, kind) => path.join(outDir, `${name}.${kind}.json`);
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4' };

function resolveInput(v) {
  if (typeof v === 'string' && v.startsWith('result:')) {
    const [job, idx] = v.slice(7).split('#');
    const r = JSON.parse(fs.readFileSync(side(job, 'result'), 'utf8'));
    const u = r.outputs[Number(idx || 0)];
    if (!u) throw new Error('no output ' + idx + ' on ' + job);
    return u.url;
  }
  if (typeof v === 'string' && v.startsWith('file:')) {
    const p = v.slice(5);
    return 'data:' + (MIME[path.extname(p).toLowerCase()] || 'application/octet-stream') + ';base64,' + fs.readFileSync(p).toString('base64');
  }
  if (Array.isArray(v)) return v.map(resolveInput);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveInput(x)]));
  return v;
}

function collectUrls(o, acc = []) {
  if (!o || typeof o !== 'object') return acc;
  if (typeof o.url === 'string' && /^https?:/.test(o.url)) acc.push({ url: o.url, content_type: o.content_type || null, width: o.width || null, height: o.height || null });
  for (const v of Object.values(o)) if (v && typeof v === 'object') collectUrls(v, acc);
  return acc;
}

async function runJob(job) {
  const resFile = side(job.name, 'result');
  if (fs.existsSync(resFile)) { console.log('skip  ', job.name, '(result exists)'); return; }
  let pending = fs.existsSync(side(job.name, 'pending')) ? JSON.parse(fs.readFileSync(side(job.name, 'pending'), 'utf8')) : null;
  if (!pending) {
    const marker = side(job.name, 'submitting');
    if (fs.existsSync(marker)) { console.log('BLOCK ', job.name, '— an earlier submit did not record a request id; check the fal dashboard before deleting', marker); return; }
    fs.writeFileSync(marker, JSON.stringify({ at: new Date().toISOString(), endpoint: job.endpoint }));
    const r = await fetch('https://queue.fal.run/' + job.endpoint, { method: 'POST', headers: H, body: JSON.stringify(resolveInput(job.input)) });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body.request_id) {
      fs.writeFileSync(side(job.name, 'error'), JSON.stringify({ at: new Date().toISOString(), status: r.status, body }, null, 2));
      fs.rmSync(marker, { force: true });
      console.log('FAIL  ', job.name, 'HTTP', r.status, JSON.stringify(body).slice(0, 300));
      return;
    }
    pending = { name: job.name, endpoint: job.endpoint, request_id: body.request_id, status_url: body.status_url, response_url: body.response_url, submittedAt: new Date().toISOString() };
    fs.writeFileSync(side(job.name, 'pending'), JSON.stringify(pending, null, 2));
    fs.rmSync(marker, { force: true });
    console.log('sent  ', job.name, pending.request_id);
  } else console.log('resume', job.name, pending.request_id);

  const t0 = Date.now();
  for (;;) {
    const s = await fetch(pending.status_url, { headers: H }).then((r) => r.json()).catch((e) => ({ status: 'NETERR', error: String(e) }));
    if (s.status === 'COMPLETED') break;
    if (s.status === 'NETERR' || s.status === 'IN_QUEUE' || s.status === 'IN_PROGRESS') {
      if (Date.now() - t0 > 20 * 60 * 1000) { console.log('WAIT  ', job.name, 'still', s.status, 'after 20 min — rerun to resume'); return; }
      await sleep(4000); continue;
    }
    fs.writeFileSync(side(job.name, 'error'), JSON.stringify({ at: new Date().toISOString(), status: s }, null, 2));
    console.log('FAIL  ', job.name, JSON.stringify(s).slice(0, 300)); return;
  }
  const res = await fetch(pending.response_url, { headers: H });
  const out = await res.json();
  if (!res.ok) {
    fs.writeFileSync(side(job.name, 'error'), JSON.stringify({ at: new Date().toISOString(), status: res.status, body: out }, null, 2));
    console.log('FAIL  ', job.name, 'result HTTP', res.status, JSON.stringify(out).slice(0, 300)); return;
  }
  const urls = collectUrls(out);
  const files = [];
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    const ext = (u.content_type && u.content_type.includes('svg')) ? '.svg' : (path.extname(new URL(u.url).pathname) || '.bin');
    const file = path.join(outDir, `${job.name}-${i}${ext}`);
    const buf = Buffer.from(await (await fetch(u.url)).arrayBuffer());
    fs.writeFileSync(file, buf);
    files.push({ file: path.basename(file), bytes: buf.length });
  }
  const record = { name: job.name, endpoint: job.endpoint, request_id: pending.request_id, submittedAt: pending.submittedAt, completedAt: new Date().toISOString(), input: job.input, seed: out.seed ?? null, outputs: urls, files, has_nsfw_concepts: out.has_nsfw_concepts ?? null };
  fs.writeFileSync(resFile, JSON.stringify(record, null, 2));
  fs.rmSync(side(job.name, 'pending'), { force: true });
  console.log('done  ', job.name, files.map((f) => f.file + ' ' + Math.round(f.bytes / 1024) + 'KB').join(', '));
}

const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(CONC, queue.length) }, async () => { while (queue.length) await runJob(queue.shift()); }));
console.log('all jobs processed:', jobs.length);
