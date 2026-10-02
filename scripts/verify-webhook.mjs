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

const leadUrl = `${appBase}${efund.leadCapturePath}`;
const configUrl = `${appBase}/api/33333/n8n/config`;
const stripeUrl = `${appBase}${efund.stripeWebhookPath}`;

if (live) {
  try {
    const configRes = await fetch(configUrl);
    if (configRes.ok) ok.push(`✓ Live ${configRes.status}: ${configUrl}`);
    else issues.push(`✗ Live ${configRes.status}: ${configUrl}`);
  } catch (e) {
    issues.push(`✗ Live fetch failed: ${configUrl} — ${e.message}`);
  }

  try {
    const leadRes = await fetch(leadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.N33333_WEBHOOK_SECRET ? { 'X-33333-Secret': process.env.N33333_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify({
        email: `sgos-probe-${Date.now()}@example.invalid`,
        brand: '33333',
        lead_magnet: 'sgos-verify-probe',
        utm_source: 'sgos-verify-live',
      }),
    });
    if (leadRes.status === 201 || leadRes.ok) {
      ok.push(`✓ Live ${leadRes.status}: POST ${leadUrl} (probe lead)`);
    } else {
      issues.push(`✗ Live ${leadRes.status}: POST ${leadUrl}`);
    }
  } catch (e) {
    issues.push(`✗ Live POST failed: ${leadUrl} — ${e.message}`);
  }

  try {
    const stripeRes = await fetch(stripeUrl, { method: 'GET' });
    if (stripeRes.status === 404 || stripeRes.status === 405) {
      ok.push(`○ ${stripeUrl} — POST-only route (${stripeRes.status} on GET is OK)`);
    } else if (stripeRes.ok) {
      ok.push(`✓ Live ${stripeRes.status}: ${stripeUrl}`);
    } else {
      warnings.push(`○ Stripe path returned ${stripeRes.status}`);
    }
  } catch (e) {
    issues.push(`✗ Live fetch failed: ${stripeUrl} — ${e.message}`);
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
  ok.push('○ Offline mode — pass --live to probe APP_BASE_URL (POST leads, GET config)');
  ok.push(`  · POST ${leadUrl}`);
  ok.push(`  · GET  ${configUrl}`);
  ok.push(`  · POST ${stripeUrl} (Stripe)`);
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
