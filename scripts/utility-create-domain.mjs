#!/usr/bin/env node
/**
 * Create / apply domain config for Money Magnet Tools + Money Autopilot.
 *
 * Usage:
 *   npm run utility:create-domain -- moneymagnettools.com
 *   npm run utility:create-domain -- --tools tools.example.com --app autopilot.example.com
 *   npm run utility:create-domain -- --config domain.config.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const UTILITY_ROOT = path.join(REPO_ROOT, 'public', 'utility-websites');
const CONFIG_PATH = path.join(REPO_ROOT, 'domain.config.json');
const EXAMPLE_PATH = path.join(REPO_ROOT, 'domain.config.example.json');

function parseArgs(argv) {
  const opts = { config: null, root: null, tools: null, app: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--config') opts.config = argv[++i];
    else if (arg === '--tools') opts.tools = argv[++i];
    else if (arg === '--app') opts.app = argv[++i];
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Create domain config and wire utility-websites to your live subdomain.

Examples:
  npm run utility:create-domain -- moneymagnettools.com
  npm run utility:create-domain -- --tools tools.moneymagnettools.com
  npm run utility:create-domain -- --tools tools.example.com --app autopilot.example.com
  npm run utility:create-domain -- --config domain.config.json --dry-run
`);
      process.exit(0);
    } else if (!arg.startsWith('-') && !opts.root) {
      opts.root = arg.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }
  return opts;
}

function hostFrom(input) {
  return input.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function buildConfig(opts) {
  if (opts.config) {
    const p = path.isAbsolute(opts.config) ? opts.config : path.join(REPO_ROOT, opts.config);
    if (!fs.existsSync(p)) {
      console.error(`Config not found: ${p}`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  const root = hostFrom(opts.root || '');
  if (!root) {
    console.error('Provide a root domain or --tools subdomain.');
    console.error('Example: npm run utility:create-domain -- moneymagnettools.com');
    process.exit(1);
  }

  const tools = hostFrom(opts.tools || `tools.${root}`);
  const app = hostFrom(opts.app || `autopilot.${root}`);

  return {
    brand: 'Money Magnet Tools',
    rootDomain: root,
    subdomains: { tools, app },
    registrar: 'hostinger',
    createdAt: new Date().toISOString(),
  };
}

function applyToolsDomain(toolsHost) {
  const replaceScript = path.join(__dirname, 'utility-replace-domain.mjs');
  const result = spawnSync(process.execPath, [replaceScript, toolsHost], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function patchConfigJs(toolsUrl, appUrl) {
  const configPath = path.join(UTILITY_ROOT, 'config.js');
  let content = fs.readFileSync(configPath, 'utf8');

  content = content.replace(
    /siteUrl:\s*'[^']*'/,
    `siteUrl: '${toolsUrl}'`,
  );

  if (appUrl) {
    content = content.replace(
      /profitTrackerApiUrl:\s*'[^']*'/,
      `profitTrackerApiUrl: 'https://${appUrl}'`,
    );
  }

  fs.writeFileSync(configPath, content, 'utf8');
  return configPath;
}

function printDnsChecklist(config) {
  const { rootDomain, subdomains } = config;
  const tools = subdomains.tools;
  const app = subdomains.app;

  console.log('\n── Hostinger checklist ──────────────────────────────\n');
  console.log('1. Register root domain (if not owned yet):');
  console.log(`   → ${rootDomain}`);
  console.log('\n2. Create subdomains in hPanel → Websites → Subdomains:');
  console.log(`   → ${tools}   (document root: public_html/tools/ or equivalent)`);
  if (app) console.log(`   → ${app}   (Money Autopilot API — optional for now)`);
  console.log('\n3. Enable Free SSL for each subdomain (hPanel → SSL).');
  console.log('\n4. Upload utility-websites:');
  console.log('   npm run zip:utility-sites');
  console.log(`   Upload to ${tools} document root (index.html at /)`);
  console.log('\n5. Search Console → add property → submit sitemap:');
  console.log(`   https://${tools}/sitemap.xml`);
  console.log('\n6. Money Autopilot .env (when API is deployed):');
  console.log(`   APP_BASE_URL=https://${app}`);
  console.log('\n── DNS records (if not auto-created) ───────────────\n');
  console.log(`  ${tools}  →  A or CNAME to Hostinger server`);
  if (app) console.log(`  ${app}  →  A or CNAME to Hostinger server (or your API host)`);
  console.log(`  @ (root)  →  optional landing page or redirect to ${tools}`);
  console.log('');
}

function main() {
  const opts = parseArgs(process.argv);
  const config = buildConfig(opts);
  const toolsHost = hostFrom(config.subdomains.tools);
  const appHost = config.subdomains.app ? hostFrom(config.subdomains.app) : null;
  const toolsUrl = `https://${toolsHost}`;

  console.log('\nMoney Magnet Tools — create domain\n');
  console.log(`  Root:  ${config.rootDomain}`);
  console.log(`  Tools: ${toolsHost}`);
  if (appHost) console.log(`  App:   ${appHost}`);

  if (opts.dryRun) {
    console.log('\n(dry-run — no files modified)\n');
    printDnsChecklist(config);
    return;
  }

  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`\n✓ Wrote ${path.relative(REPO_ROOT, CONFIG_PATH)}`);

  applyToolsDomain(toolsHost);
  patchConfigJs(toolsUrl, appHost);
  console.log('✓ Updated config.js (siteUrl + profitTrackerApiUrl)');

  const verify = spawnSync('npm', ['run', 'utility:verify-deploy', '--', '--strict'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: true,
  });

  if (verify.status !== 0) {
    console.warn('\nVerify reported issues — review before upload.\n');
  }

  printDnsChecklist(config);
  console.log('Next: register/buy the domain at Hostinger, create subdomains, upload zip.\n');
}

main();
