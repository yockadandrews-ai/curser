import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { seedDefaultTemplates } from '../server/sgos/templates.js';
import { importPlates, type ImportPlateRow } from '../server/sgos/importPlates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const REGISTRY_PATH = path.join(__dirname, '../data/SGOS_Master_Plate_Registry_v2.json');

function loadRegistry(): ImportPlateRow[] {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.warn(`Registry not found at ${REGISTRY_PATH}, skipping plate seed`);
    return [];
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8')) as ImportPlateRow[];
}

async function main() {
  console.log('Seeding SMS templates…');
  const templateCount = await seedDefaultTemplates();
  console.log(`  ${templateCount} templates ready`);

  const rows = loadRegistry();
  if (rows.length > 0) {
    console.log(`Importing ${rows.length} plates from master registry…`);
    const result = await importPlates(rows, 'upsert');
    console.log(`  created=${result.created} updated=${result.updated} skipped=${result.skipped}`);
  }

  await prisma.appSetting.upsert({
    where: { key: 'operator_phone' },
    create: { key: 'operator_phone', value: process.env.SGOS_OPERATOR_PHONE ?? '+12025550147' },
    update: {},
  });

  const total = await prisma.plate.count({ where: { isActive: true } });
  console.log(`Seed complete. ${total} active plates in registry.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
