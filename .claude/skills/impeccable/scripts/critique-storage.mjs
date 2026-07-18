#!/usr/bin/env node
// Shim local (ver NOTICE.md): almacenamiento de críticas en .impeccable/critique/.
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DIR = resolve(process.cwd(), '.impeccable/critique');
const [cmd, ...args] = process.argv.slice(2);

function slugify(target) {
  return String(target).toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || null;
}

if (cmd === 'slug') {
  const s = slugify(args[0]);
  if (!s) process.exit(1);
  console.log(s);
} else if (cmd === 'write') {
  const [slug, bodyFile] = args;
  const meta = JSON.parse(process.env.IMPECCABLE_CRITIQUE_META || '{}');
  mkdirSync(DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(DIR, `${slug}-${ts}.md`);
  const fm = `---\n${Object.entries({ ...meta, date: new Date().toISOString(), slug }).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;
  writeFileSync(file, fm + readFileSync(bodyFile, 'utf8'));
  console.log(file);
} else if (cmd === 'latest') {
  const slug = args[0];
  if (!existsSync(DIR)) process.exit(2);
  const files = readdirSync(DIR).filter(f => f.startsWith(slug + '-')).sort();
  if (!files.length) process.exit(2);
  console.log(readFileSync(join(DIR, files.at(-1)), 'utf8'));
} else if (cmd === 'trend') {
  const [slug, nRaw] = args;
  const n = parseInt(nRaw || '5', 10);
  if (!existsSync(DIR)) { console.log('[]'); process.exit(0); }
  const files = readdirSync(DIR).filter(f => f.startsWith(slug + '-')).sort().slice(-n);
  const entries = files.map(f => {
    const m = readFileSync(join(DIR, f), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    const out = {};
    if (m) m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) { try { out[l.slice(0, i)] = JSON.parse(l.slice(i + 1)); } catch { out[l.slice(0, i)] = l.slice(i + 1).trim(); } } });
    return out;
  });
  console.log(JSON.stringify(entries, null, 2));
} else {
  console.error('Uso: critique-storage.mjs <slug|write|latest|trend> ...');
  process.exit(1);
}
