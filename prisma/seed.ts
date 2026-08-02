import { PrismaClient } from '@prisma/client';
import { seedDefaultTemplates } from '../server/sgos/templates.js';
import { importPlates, type ImportPlateRow } from '../server/sgos/importPlates.js';

const prisma = new PrismaClient();

const SEED_PLATES: ImportPlateRow[] = [
  { plateCode: 'JG6613', tier: 1, callSign: 'HERMES-7', theme: 'driver pickup', location: 'Gate B — Loading Dock 3', contact: 'Mike T.', instructions: 'DRV-PICKUP: Meet driver at Gate B. Verify seal #4482 before release.', zone: 'North' },
  { plateCode: 'AB4421', tier: 1, callSign: 'PORTAL-2', theme: 'package delivery', location: 'Suite 412 — Front Desk', contact: 'Sarah K.', instructions: 'PKG-DROP: Leave with front desk. Photo required. Recipient: J. Walsh.', zone: 'Central' },
  { plateCode: 'XK9901', tier: 1, callSign: 'COURIER-9', theme: 'driver pickup', location: 'Parking Level P2 — Spot 14', contact: 'Dev R.', instructions: 'DRV-PICKUP: White van, plate FLK-882. Handoff cold chain box only.', zone: 'East' },
  { plateCode: 'LM3388', tier: 2, theme: 'package delivery', location: 'Building C — Mail Room', instructions: 'PKG-DROP: Standard delivery. Scan barcode on receipt.', zone: 'West' },
  { plateCode: 'QR7755', tier: 2, theme: 'scheduled', location: 'Lobby — Security Desk', instructions: 'HOLD: Await supervisor clearance. Do not proceed without badge scan.', zone: 'Central' },
  { plateCode: 'NP1122', tier: 3, location: 'Warehouse 7 — Bay 12', instructions: 'STANDARD: Log arrival. Notify ops channel. No special handling.', zone: 'Industrial' },
  { plateCode: 'HT5544', tier: 3, theme: 'package delivery', location: 'Dock 5 — Receiving', instructions: 'PKG-INTAKE: Count units, match PO #99231.', zone: 'Industrial' },
  { plateCode: 'VC8899', tier: 4, location: 'Remote Site — Gate 1', instructions: 'FIELD: Document condition. GPS pin required in reply.', zone: 'Remote' },
  { plateCode: 'FD0011', tier: 5, theme: 'security freeze', location: 'Vault Wing — Restricted', instructions: 'FREEZE: DO NOT OPEN. Security escort mandatory. Alert command.', zone: 'Secure' },
  { plateCode: 'ZK7722', tier: 5, theme: 'security freeze', location: 'Cold Storage — Zone F', instructions: 'FREEZE: Temperature lock active. Abort if seal broken.', zone: 'Secure' },
  { plateCode: 'PL2200', tier: 1, callSign: 'HERMES-3', theme: 'driver pickup', location: 'Curbside — Zone A', contact: 'Ana L.', instructions: 'DRV-PICKUP: 15-min window. Driver has yellow vest.', zone: 'North' },
  { plateCode: 'WS4411', tier: 2, theme: 'package delivery', location: 'Unit 8B — Side Entrance', instructions: 'PKG-DROP: Ring bell twice. Leave if no answer — HOLD status.', zone: 'Residential' },
  { plateCode: 'MN6677', tier: 3, location: 'Hub Central — Sort Table 4', instructions: 'STANDARD: Batch sort. Tag with orange sticker.', zone: 'Central' },
  { plateCode: 'RT9933', tier: 4, location: 'Highway Rest Stop — Mile 142', instructions: 'FIELD: Verify vehicle ID. Photo of load required.', zone: 'Remote' },
  { plateCode: 'BL0055', tier: 5, theme: 'security freeze', location: 'Customs Hold — Room 2', instructions: 'FREEZE: Customs inspection pending. No movement.', zone: 'Secure' },
  { plateCode: 'CK8812', tier: 1, callSign: 'COURIER-1', theme: 'driver pickup', location: 'Airport Cargo — Door 7', contact: 'Tom H.', instructions: 'DRV-PICKUP: Airside badge required. ETA sync via dispatch.', zone: 'Airport' },
  { plateCode: 'DV3344', tier: 2, theme: 'scheduled', location: 'Conference Center — Loading', instructions: 'HOLD: Event load — wait for green light from dispatch.', zone: 'Central' },
  { plateCode: 'EP5566', tier: 3, theme: 'package delivery', location: 'Retail Backroom — Store 44', instructions: 'PKG-DROP: Manager sign-off required on tablet.', zone: 'Retail' },
  { plateCode: 'FG7788', tier: 4, location: 'Construction Site — Crane Pad', instructions: 'FIELD: Hard hat area. Check in with site foreman.', zone: 'Remote' },
  { plateCode: 'HJ9900', tier: 1, callSign: 'PORTAL-5', theme: 'package delivery', location: 'Tech Campus — Building 9', contact: 'Elena P.', instructions: 'PKG-DROP: Fragile — elevator to floor 3 only.', zone: 'East' },
];

async function main() {
  console.log('Seeding SMS templates…');
  const templateCount = await seedDefaultTemplates();
  console.log(`  ${templateCount} templates ready`);

  console.log('Seeding sample plates…');
  const result = await importPlates(SEED_PLATES, 'upsert');
  console.log(`  created=${result.created} updated=${result.updated} skipped=${result.skipped}`);

  await prisma.appSetting.upsert({
    where: { key: 'operator_phone' },
    create: { key: 'operator_phone', value: process.env.SGOS_OPERATOR_PHONE ?? '+12025550147' },
    update: {},
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
