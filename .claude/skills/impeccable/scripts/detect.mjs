#!/usr/bin/env node
// Shim local (ver NOTICE.md): delega en el motor oficial del paquete npm.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['-y', 'impeccable@3.2.1', 'detect', ...process.argv.slice(2)], {
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
