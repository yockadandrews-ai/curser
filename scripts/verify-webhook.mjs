#!/usr/bin/env node
/**
 * Verifies SGOS / 33333 / E-Fund webhook configuration and optional live health.
 *
 * Usage:
 *   npm run verify-efund-webhook
 *   node scripts/verify-webhook.mjs --live
 *   node scripts/verify-webhook.mjs --lane efund --live
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const live = process.argv.includes('--live');
const strict = process.argv.includes('--strict');
const lane = process.argv.includes('--lane')
  ? process.argv[process.argv.indexOf('--lane') + 1]
  : 'all';

const issues = [];
const ok = [];
const warnings = [];

const taxonomy = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'config', 'sgos-taxonomy.json'), 'utf8'),
);

const appBase = (process.env.APP_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

console.log('\nSGOS — webhook verify\n');

function checkEnv(name, required = false) {
  const val = process.env[name]?.trim();
  if (!val) {
    if (required) issues.push(`✗ Env not set: ${name}`);
    else warnings.push(`○ Env optional / unset: ${name}`);
    return null;
  }
  if (!/^https?:\/\//i.test(val) && !val.startsWith('/')) {
    warnings.push(`○ ${name} is set but may not be a URL: ${val.slice(0, 40)}…`);
  } else {
    ok.push(`✓ ${name} configured`);
  }
  return val;
}

const efund = taxonomy.efundFunnel20;
const requireOutreach = (lane === 'efund' || lane === 'all') && (live || strict);
checkEnv('OUTREACH_WEBHOOK_URL', requireOutreach);
checkEnv(efund.efundWebhookEnv || 'EFUND_N8N_WEBHOOK_URL', false);
checkEnv('N33333_WEBHOOK_SECRET', false);
checkEnv('STRIPE_WEBHOOK_SECRET', false);

ok.push(`✓ Lead capture path documented: ${efund.leadCapturePath}`);
ok.push(`✓ Stripe webhook path documented: ${efund.stripeWebhookPath}`);
ok.push(`✓ E-Fund sheet tab: ${efund.trackingSheetTab}`);

const localRoutes = [
  `${appBase}${efund.leadCapturePath}`,
  `${appBase}/api/33333/n8n/config`,
  `${appBase}${efund.stripeWebhookPath}`,
];

if (live) {
  for (const url of localRoutes) {
    try {
      const res = await fetch(url, {
        method: url.includes('stripe') ? 'GET' : 'GET',
        headers: process.env.N33333_WEBHOOK_SECRET
          ? { 'X-33333-Secret': process.env.N33333_WEBHOOK_SECRET }
          : {},
      });
      if (url.includes('stripe') && res.status === 404) {
        ok.push(`○ ${url} — GET not routed (POST-only is OK for Stripe)`);
      } else if (res.ok) {
        ok.push(`✓ Live ${res.status}: ${url}`);
      } else {
        issues.push(`✗ Live ${res.status}: ${url}`);
      }
    } catch (e) {
      issues.push(`✗ Live fetch failed: ${url} — ${e.message}`);
    }
  }

  const outreach = process.env.OUTREACH_WEBHOOK_URL?.trim();
  if (outreach && lane !== '33333-only') {
    try {
      const res = await fetch(outreach, { method: 'HEAD' });
      if (res.ok || res.status === 405) {
        ok.push(`✓ Outreach webhook reachable (${res.status}): ${outreach.slice(0, 48)}…`);
      } else {
        warnings.push(`○ Outreach webhook returned ${res.status}`);
      }
    } catch (e) {
      warnings.push(`○ Outreach webhook not reachable (n8n may be idle): ${e.message}`);
    }
  }
} else {
  ok.push('○ Offline mode — pass --live to ping APP_BASE_URL routes');
  localRoutes.forEach(u => ok.push(`  · ${u}`));
}

ok.forEach(line => console.log(line));
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach(line => console.log(line));
}
if (issues.length) {
  console.log('\nIssues:');
  issues.forEach(line => console.log(line));
  process.exit(1);
}
console.log('\nWebhook configuration check passed.\n');
