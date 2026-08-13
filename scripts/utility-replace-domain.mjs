#!/usr/bin/env node
/**
 * Replace YOURDOMAIN.com (and optional localhost refs) across utility-websites.
 *
 * Usage:
 *   node scripts/utility-replace-domain.mjs tools.yourdomain.com
 *   node scripts/utility-replace-domain.mjs https://tools.yourdomain.com
 *   npm run utility:replace-domain -- tools.yourdomain.com
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'utility-websites');

const domainArg = process.argv[2];
if (!domainArg) {
  console.error('Usage: node scripts/utility-replace-domain.mjs <domain-or-url>');
  console.error('Example: npm run utility:replace-domain -- tools.example.com');
  process.exit(1);
}

const host = domainArg.replace(/^https?:\/\//, '').replace(/\/$/, '');
const siteUrl = `https://${host}`;

const TEXT_EXTENSIONS = new Set([
  '.html', '.js', '.css', '.xml', '.txt', '.md', '.webmanifest', '.json',
]);

const replacements = [
  ['https://YOURDOMAIN.com', siteUrl],
  ['http://YOURDOMAIN.com', siteUrl],
  ['YOURDOMAIN.com', host],
  ['http://localhost:5173/utility-websites', siteUrl],
  ['http://localhost:5173', siteUrl],
  ['127.0.0.1', host],
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const modified = [];

for (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) continue;

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    modified.push(path.relative(ROOT, file));
  }
}

console.log(`\n✓ Domain set to ${siteUrl}\n`);
if (modified.length) {
  console.log('Modified files:');
  modified.forEach(f => console.log(`  - ${f}`));
} else {
  console.log('No files contained YOURDOMAIN.com or localhost placeholders.');
}
console.log('\nNext: npm run utility:verify-deploy');
