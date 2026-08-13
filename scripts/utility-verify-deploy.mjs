#!/usr/bin/env node
/**
 * Pre-deploy checklist for public/utility-websites/
 *
 * Usage: npm run utility:verify-deploy
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'public', 'utility-websites');

const REQUIRED_FILES = [
  'index.html',
  'config.js',
  'shared.js',
  'shared.css',
  'robots.txt',
  'sitemap.xml',
  'ads.txt',
  'privacy.html',
  'terms.html',
  'tracker.html',
  'tracker.webmanifest',
  'HOSTINGER.md',
];

const TOOL_PAGES = Array.from({ length: 10 }, (_, i) => `${i + 1}-*.html`);

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function globOne(pattern) {
  const prefix = pattern.replace('*', '');
  return fs.readdirSync(ROOT).filter(f => f.startsWith(prefix.split('-')[0] + '-'));
}

const issues = [];
const ok = [];

console.log('\nMoney Magnet Tools — deploy verify\n');

for (const file of REQUIRED_FILES) {
  if (fs.existsSync(path.join(ROOT, file))) ok.push(`✓ ${file}`);
  else issues.push(`✗ Missing required file: ${file}`);
}

for (let i = 1; i <= 10; i++) {
  const matches = fs.readdirSync(ROOT).filter(f => f.startsWith(`${i}-`) && f.endsWith('.html'));
  if (matches.length !== 1) issues.push(`✗ Expected exactly one tool page for #${i}`);
}

const allText = fs.readdirSync(ROOT)
  .filter(f => /\.(html|js|xml|txt|md|webmanifest)$/.test(f))
  .map(f => read(f))
  .join('\n');

if (allText.includes('YOURDOMAIN.com')) {
  issues.push('✗ YOURDOMAIN.com still present — run: npm run utility:replace-domain -- tools.yourdomain.com');
} else {
  ok.push('✓ No YOURDOMAIN.com placeholder');
}

const config = read('config.js');
if (config.includes("enableAnalytics: false") && config.includes('G-XXXXXXXX')) {
  ok.push('○ GA4 still disabled (expected until go-live)');
} else if (config.includes('enableAnalytics: true')) {
  ok.push('✓ GA4 enabled in config.js');
}

if (config.includes("enableAdSense: false")) {
  ok.push('○ AdSense still disabled (expected before approval)');
}

if (read('sitemap.xml').includes('<loc>')) {
  ok.push('✓ sitemap.xml has URLs');
}

if (read('robots.txt').includes('Sitemap:')) {
  ok.push('✓ robots.txt references sitemap');
}

if (read('ads.txt').includes('pub-')) {
  ok.push('✓ ads.txt present (update pub ID after AdSense approval)');
}

ok.forEach(line => console.log(line));
if (issues.length) {
  console.log('\nIssues:');
  issues.forEach(line => console.log(line));
  process.exit(1);
}

console.log('\nReady to upload public/utility-websites/ to Hostinger.\n');
console.log('  npm run zip:utility-sites   → utility-websites.zip\n');
