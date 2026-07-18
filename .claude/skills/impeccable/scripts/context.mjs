#!/usr/bin/env node
// Shim local (ver NOTICE.md): imprime PRODUCT.md/DESIGN.md del proyecto o NO_PRODUCT_MD.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const productPath = resolve(root, 'PRODUCT.md');
const designPath = resolve(root, 'DESIGN.md');

if (!existsSync(productPath)) {
  console.log('NO_PRODUCT_MD');
  process.exit(0);
}

console.log('```markdown');
console.log(readFileSync(productPath, 'utf8').trim());
console.log('```');
if (existsSync(designPath)) {
  console.log('\nDESIGN.md:\n');
  console.log('```markdown');
  console.log(readFileSync(designPath, 'utf8').trim());
  console.log('```');
}
