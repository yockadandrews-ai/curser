#!/usr/bin/env node
/**
 * Sovereign Growth OS — taxonomy pointer for automations (n8n, cron, local).
 * Prints the canonical blueprint path and factory output root for downstream nodes.
 *
 * Usage: node automations/autopilot_engine.js
 * Env:   SGOS_TAXONOMY_PATH (optional override)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_TAXONOMY = path.join(REPO_ROOT, 'config', 'sgos-taxonomy.json');

function loadTaxonomy() {
  const taxonomyPath = process.env.SGOS_TAXONOMY_PATH?.trim() || DEFAULT_TAXONOMY;
  const raw = fs.readFileSync(taxonomyPath, 'utf8');
  const taxonomy = JSON.parse(raw);
  return { taxonomyPath, taxonomy };
}

function main() {
  const { taxonomyPath, taxonomy } = loadTaxonomy();
  const blueprintAbs = path.join(REPO_ROOT, taxonomy.canonicalBlueprintDoc);
  const outputRootAbs = path.join(REPO_ROOT, taxonomy.outputRoot);

  const payload = {
    ok: true,
    taxonomyPath: path.relative(REPO_ROOT, taxonomyPath),
    canonicalBlueprintPath: taxonomy.canonicalBlueprintDoc,
    canonicalBlueprintAbsolute: blueprintAbs,
    factoryThemeSource: taxonomy.factoryThemeSource,
    outputRoot: taxonomy.outputRoot,
    outputRootAbsolute: outputRootAbs,
    launchLeadTest: taxonomy.launchStagger?.leadTestPortal ?? null,
    efundFunnel20: taxonomy.efundFunnel20 ?? null,
    generatedAt: new Date().toISOString(),
  };

  console.log(JSON.stringify(payload, null, 2));
}

main();
