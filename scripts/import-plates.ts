#!/usr/bin/env npx tsx
/**
 * Import SGOS Master Plate Registry from JSON or CSV file.
 *
 * Usage:
 *   npx tsx scripts/import-plates.ts path/to/SGOS_Master_Plate_Registry_v2.json
 *   npx tsx scripts/import-plates.ts path/to/registry.csv --replace
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { importPlates, parseCsvPlates, type ImportPlateRow } from '../server/sgos/importPlates.js';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith('--'));
  const replace = args.includes('--replace');

  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-plates.ts <file.json|file.csv> [--replace]');
    process.exit(1);
  }

  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  const ext = path.extname(abs).toLowerCase();

  let rows: ImportPlateRow[] = [];
  if (ext === '.csv') {
    rows = parseCsvPlates(raw);
  } else {
    const parsed = JSON.parse(raw) as ImportPlateRow[] | { plates: ImportPlateRow[] };
    rows = Array.isArray(parsed) ? parsed : parsed.plates;
  }

  if (!rows?.length) {
    console.error('No plates found in file');
    process.exit(1);
  }

  console.log(`Importing ${rows.length} plates (${replace ? 'replace' : 'upsert'} mode)…`);
  const result = await importPlates(rows, replace ? 'replace' : 'upsert');
  const total = await prisma.plate.count({ where: { isActive: true } });

  console.log(JSON.stringify({ ...result, activePlates: total }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
