// answer-match.mjs: apply a preset answer to a change-control row whose id contains "=".
//   node tools/answer-match.mjs "<rowId>=<presetId>" [...]
// sr-match --answer splits "<rowId>=<presetId>" on the FIRST "=", so a row id that carries a query string
// (originalsca.com/menu/los-angeles?brand=Jeeter#s1) cannot be answered through it. This applies the same
// answer with the same checks sr-match makes (the preset must exist in audit/preset-index.json, the row must
// exist in the ledger), splitting on the LAST "=" instead. Recorded in docs/CHANGE-LOG.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const index = read('audit/preset-index.json');
const known = new Set((index.libraries || []).flatMap((l) => (l.presets || []).map((p) => p.id)));
const ledger = read('audit/change-control.json');
const match = read('audit/preset-match.json');
const now = new Date().toISOString();
for (const ans of process.argv.slice(2)) {
  const i = ans.lastIndexOf('=');
  if (i < 1) throw new Error('needs "<rowId>=<presetId>": ' + ans);
  const rowId = ans.slice(0, i).trim();
  const presetId = ans.slice(i + 1).trim();
  if (!known.has(presetId)) throw new Error('no preset with id ' + JSON.stringify(presetId) + ' in preset-index.json');
  const row = ledger.rows.find((r) => r.id === rowId);
  if (!row) throw new Error('no change-control row with id ' + JSON.stringify(rowId));
  row.presetId = presetId;
  const rec = (match.rows || []).find((r) => r.rowId === rowId);
  if (!rec) throw new Error('no matcher row ' + rowId);
  rec.status = 'ANSWERED'; rec.chosen = presetId; rec.answeredAt = now; rec.answeredBy = 'tools/answer-match.mjs (row id contains "=")';
  console.log('answered', rowId, '->', presetId);
}
match.undecided = (match.rows || []).filter((r) => r.status === 'UNDECIDED').length;
ledger.updated = now;
fs.writeFileSync(path.join(ROOT, 'audit/change-control.json'), JSON.stringify(ledger, null, 2));
fs.writeFileSync(path.join(ROOT, 'audit/preset-match.json'), JSON.stringify(match, null, 2));
console.log('undecided now:', match.undecided);
