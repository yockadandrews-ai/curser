#!/usr/bin/env node
/**
 * Single entry: SGOS repo verification aligned with system updates.
 * Usage: npm run sgos:verify
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const node = process.execPath;

const steps = [
  ['validate-taxonomy-paths', path.join(__dirname, 'validate-taxonomy-paths.mjs')],
  ['verify-efund-webhook', path.join(__dirname, 'verify-webhook.mjs'), '--lane', 'efund'],
  ['emergency-funnel:verify', path.join(__dirname, 'verify-emergency-funnel.mjs')],
  ['autopilot_engine pointer', path.join(ROOT, 'automations', 'autopilot_engine.js')],
];

console.log('\nSGOS — full repo verify (Sent=0 safe · no webhooks executed)\n');

for (const [label, script, ...args] of steps) {
  const result = spawnSync(node, [script, ...args], { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    console.error(`\nFailed at: ${label}\n`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nAll SGOS verify steps passed.\n');
console.log('Enterprise membrane: docs/SGOS_SYSTEM_ALIGNMENT.md');
console.log('Notion WATCHTOWER wins over local scratch if they conflict.\n');
