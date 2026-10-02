#!/usr/bin/env node
/**
 * Validates SGOS taxonomy config, blueprint doc, factory source, and latest output folders.
 *
 * Usage: npm run validate-taxonomy-paths
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const TAXONOMY_PATH = path.join(REPO_ROOT, 'config', 'sgos-taxonomy.json');

const issues = [];
const ok = [];

function exists(rel) {
  return fs.existsSync(path.join(REPO_ROOT, rel));
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    issues.push(`✗ Invalid JSON at ${path.relative(REPO_ROOT, filePath)}: ${e.message}`);
    return null;
  }
}

console.log('\nSGOS — validate taxonomy paths\n');

if (!exists('config/sgos-taxonomy.json')) {
  issues.push('✗ Missing config/sgos-taxonomy.json');
} else {
  ok.push('✓ config/sgos-taxonomy.json present');
}

const taxonomy = readJson(TAXONOMY_PATH);
if (!taxonomy) {
  printAndExit();
}

for (const key of ['canonicalBlueprintDoc', 'factoryThemeSource', 'outputRoot']) {
  if (!taxonomy[key]) issues.push(`✗ taxonomy missing field: ${key}`);
}

if (taxonomy.canonicalBlueprintDoc && !exists(taxonomy.canonicalBlueprintDoc)) {
  issues.push(`✗ Blueprint doc not found: ${taxonomy.canonicalBlueprintDoc}`);
} else if (taxonomy.canonicalBlueprintDoc) {
  ok.push(`✓ Blueprint doc readable: ${taxonomy.canonicalBlueprintDoc}`);
}

const alignmentDoc = taxonomy.notionCanon?.alignmentDoc ?? 'docs/SGOS_SYSTEM_ALIGNMENT.md';
if (!exists(alignmentDoc)) {
  issues.push(`✗ Missing system alignment doc: ${alignmentDoc}`);
} else {
  ok.push(`✓ System alignment: ${alignmentDoc}`);
}

if (taxonomy.factoryThemeSource && !exists(taxonomy.factoryThemeSource)) {
  issues.push(`✗ Factory theme source not found: ${taxonomy.factoryThemeSource}`);
} else if (taxonomy.factoryThemeSource) {
  ok.push(`✓ Factory themes: ${taxonomy.factoryThemeSource}`);
}

if (!exists('automations/autopilot_engine.js')) {
  issues.push('✗ Missing automations/autopilot_engine.js');
} else {
  ok.push('✓ automations/autopilot_engine.js present');
}

const outputDir = path.join(REPO_ROOT, taxonomy.outputRoot || 'output');
if (!fs.existsSync(outputDir)) {
  issues.push(`✗ Output root missing: ${taxonomy.outputRoot}`);
} else {
  ok.push(`✓ Output root: ${taxonomy.outputRoot}`);
  const dated = fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.includes('Five_Themes'))
    .map(d => d.name)
    .sort();
  if (dated.length === 0) {
    issues.push('✗ No output/*_Five_Themes folders found (run factory generate first)');
  } else {
    const latest = dated[dated.length - 1];
    ok.push(`✓ Latest factory batch folder: ${taxonomy.outputRoot}/${latest}`);
    for (const themeFolder of taxonomy.themeFolders || []) {
      const themePath = path.join(outputDir, latest, themeFolder);
      if (!fs.existsSync(themePath)) {
        issues.push(`✗ Missing theme folder: ${taxonomy.outputRoot}/${latest}/${themeFolder}`);
        continue;
      }
      for (const artifact of taxonomy.requiredOutputArtifacts || []) {
        const file = path.join(themePath, artifact);
        if (!fs.existsSync(file)) {
          issues.push(`✗ Missing ${themeFolder}/${artifact}`);
        }
      }
    }
    if (!issues.some(i => i.includes('Missing theme'))) {
      ok.push('✓ Theme folders + Apps.md / Suite_Proposal.md present in latest batch');
    }
  }
}

printAndExit();

function printAndExit() {
  ok.forEach(line => console.log(line));
  if (issues.length) {
    console.log('\nIssues:');
    issues.forEach(line => console.log(line));
    process.exit(1);
  }
  console.log('\nTaxonomy validation passed.\n');
}
