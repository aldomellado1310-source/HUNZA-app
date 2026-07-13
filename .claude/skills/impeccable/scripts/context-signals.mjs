#!/usr/bin/env node
// Shim local (ver NOTICE.md): emite las señales de contexto documentadas en SKILL.md.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const root = process.cwd();
const sh = (cmd) => { try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return ''; } };

const changed = sh('git status --porcelain')
  .split('\n').filter(Boolean).map(l => l.slice(3));

const htmlFiles = (() => {
  try { return readdirSync(root).filter(f => f.endsWith('.html')); } catch { return []; }
})();

const scanTargets = changed.filter(f => /\.(html|css|jsx?|tsx?|astro|vue|svelte)$/.test(f));

console.log(JSON.stringify({
  setup: {
    hasProduct: existsSync('PRODUCT.md'),
    hasDesign: existsSync('DESIGN.md'),
    hasCode: htmlFiles.length > 0 || existsSync('src') || existsSync('assets'),
    register: 'product',
    platform: 'web',
  },
  critique: { latest: null },
  git: { changedFiles: changed },
  devServer: { running: false },
  scan: {
    targets: scanTargets.length ? scanTargets : htmlFiles,
    via: scanTargets.length ? 'git-changes' : 'html',
  },
}, null, 2));
