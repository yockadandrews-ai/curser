import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

function deepMerge(fallback, existing) {
  const out = { ...fallback };
  for (const key of Object.keys(existing)) {
    if (
      existing[key] &&
      typeof existing[key] === 'object' &&
      !Array.isArray(existing[key]) &&
      fallback[key] &&
      typeof fallback[key] === 'object'
    ) {
      out[key] = deepMerge(fallback[key], existing[key]);
    } else {
      out[key] = existing[key];
    }
  }
  return out;
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');
for (const file of files) {
  const existing = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  const merged = deepMerge(en, existing);
  fs.writeFileSync(path.join(localesDir, file), JSON.stringify(merged, null, 2) + '\n');
  console.log('merged', file);
}
