import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '../src/features');

function walk(d) {
  return readdirSync(d).flatMap(f => {
    const fp = join(d, f);
    return statSync(fp).isDirectory() ? walk(fp) : [fp];
  });
}

const files = walk(srcDir).filter(f => f.endsWith('.tsx'));
let issues = 0;

for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  let currentFn = null, fnHasT = false, fnUsesT = false, fnStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnMatch = line.match(/^function\s+(\w+)|^export default function\s+(\w+)/);
    if (fnMatch) {
      if (currentFn && fnUsesT && !fnHasT) {
        console.log(`❌ ${basename(f)} — function ${currentFn}() uses t() but missing useTranslation() (line ${fnStart + 1})`);
        issues++;
      }
      currentFn = fnMatch[1] || fnMatch[2];
      fnHasT = false; fnUsesT = false; fnStart = i;
    }
    if (currentFn) {
      if (line.includes('useTranslation()')) fnHasT = true;
      if (line.match(/\bt\(['"`]/)) fnUsesT = true;
    }
  }
  if (currentFn && fnUsesT && !fnHasT) {
    console.log(`❌ ${basename(f)} — function ${currentFn}() uses t() but missing useTranslation() (line ${fnStart + 1})`);
    issues++;
  }
}

console.log(issues === 0 ? '\n✅ ALL CLEAR — every function with t() has useTranslation()' : `\n⚠️  Found ${issues} issue(s)`);
