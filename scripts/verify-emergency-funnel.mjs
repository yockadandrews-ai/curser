#!/usr/bin/env node
/**
 * E-Fund / Funnel 20 — validates documented handoffs (no secrets required offline).
 *
 * Usage: npm run emergency-funnel:verify
 *        npm run emergency-funnel:verify -- --live
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const live = process.argv.includes('--live');

const issues = [];
const ok = [];

const taxonomy = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'config', 'sgos-taxonomy.json'), 'utf8'),
);
const efund = taxonomy.efundFunnel20;
const concernsDoc = 'docs/EFUND_CONCERNS_AND_ACTIONS.md';

console.log('\nE-Fund / Funnel 20 — emergency funnel verify\n');

if (!fs.existsSync(path.join(REPO_ROOT, concernsDoc))) {
  issues.push(`✗ Missing ${concernsDoc}`);
} else {
  ok.push(`✓ ${concernsDoc} present`);
}

const requiredDocs = [
  'docs/TAXONOMY_AND_EFUND_APP_IDEAS.md',
  'docs/PLATFORM_ALIGNMENT.md',
  'docs/N8N_OUTREACH_AUTOMATION.md',
];
for (const doc of requiredDocs) {
  if (fs.existsSync(path.join(REPO_ROOT, doc))) ok.push(`✓ ${doc}`);
  else issues.push(`✗ Missing ${doc}`);
}

const routesFile = path.join(REPO_ROOT, 'server/33333/routes.ts');
const routesSrc = fs.readFileSync(routesFile, 'utf8');
if (routesSrc.includes("app.post('/api/33333/leads'") || routesSrc.includes('/api/33333/leads')) {
  ok.push('✓ Lead capture route exists in server/33333/routes.ts');
} else {
  issues.push('✗ /api/33333/leads not found in server/33333/routes.ts');
}

if (fs.existsSync(path.join(REPO_ROOT, 'server/stripeWebhookUnified.ts'))) {
  ok.push('✓ Unified Stripe webhook handler present');
} else if (fs.existsSync(path.join(REPO_ROOT, 'server/33333/stripeWebhook.ts'))) {
  ok.push('✓ Stripe webhook handler present (33333)');
} else {
  issues.push('✗ No Stripe webhook handler found');
}

ok.push(`✓ Funnel label: ${efund.label}`);
ok.push(`✓ Tracking tab name: ${efund.trackingSheetTab}`);

if (live) {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'verify-webhook.mjs'), '--lane', 'efund', '--live'],
    { stdio: 'inherit', env: process.env },
  );
  if (result.status !== 0) issues.push('✗ Live webhook verify failed (see output above)');
  else ok.push('✓ Live webhook sub-check passed');
}

ok.forEach(line => console.log(line));
if (issues.length) {
  console.log('\nIssues:');
  issues.forEach(line => console.log(line));
  process.exit(1);
}
console.log('\nEmergency funnel verification passed.\n');
