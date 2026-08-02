import type { Plate } from '@prisma/client';
import { prisma } from './prisma.js';
import { normalizePlateCode } from './normalize.js';

const PACKAGE_KEYWORDS = ['package', 'delivery', 'drop', 'pkg'];

export interface ImportPlateRow {
  plate?: string;
  plateCode?: string;
  normalized?: string;
  callSign?: string;
  tier?: number | string;
  scenario?: string;
  packageTheme?: boolean | string;
  location?: string;
  contact?: string;
  instructions?: string;
  zone?: string;
  ownerName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  notes?: string;
  theme?: string;
  isActive?: boolean | string;
}

function parseBool(val: boolean | string | undefined, fallback = false): boolean {
  if (val === undefined) return fallback;
  if (typeof val === 'boolean') return val;
  return ['true', '1', 'yes', 'y'].includes(val.toLowerCase());
}

function parseTier(val: number | string | undefined): number {
  const n = Number(val);
  if (Number.isFinite(n) && n >= 1 && n <= 5) return Math.round(n);
  return 3;
}

function inferPackageTheme(row: ImportPlateRow): boolean {
  if (row.packageTheme !== undefined) return parseBool(row.packageTheme);
  const theme = (row.theme ?? row.notes ?? row.instructions ?? '').toLowerCase();
  return PACKAGE_KEYWORDS.some((k) => theme.includes(k));
}

export function mapImportRow(row: ImportPlateRow): Omit<Plate, 'id' | 'createdAt' | 'updatedAt'> | null {
  const rawPlate = row.plate ?? row.plateCode;
  if (!rawPlate?.trim()) return null;

  const plate = rawPlate.trim().toUpperCase();
  const normalized = row.normalized ? normalizePlateCode(row.normalized) : normalizePlateCode(plate);

  return {
    plate,
    normalized,
    callSign: row.callSign ?? null,
    tier: parseTier(row.tier),
    scenario: row.scenario ?? null,
    packageTheme: inferPackageTheme(row),
    location: row.location ?? null,
    contact: row.contact ?? null,
    instructions: row.instructions ?? null,
    zone: row.zone ?? null,
    ownerName: row.ownerName ?? null,
    vehicleMake: row.vehicleMake ?? null,
    vehicleModel: row.vehicleModel ?? null,
    vehicleColor: row.vehicleColor ?? null,
    notes: row.notes ?? row.theme ?? null,
    isActive: row.isActive !== undefined ? parseBool(row.isActive, true) : true,
  };
}

export async function importPlates(rows: ImportPlateRow[], mode: 'upsert' | 'replace' = 'upsert') {
  const mapped = rows.map(mapImportRow).filter((r): r is NonNullable<typeof r> => r !== null);

  if (mode === 'replace') {
    await prisma.plate.deleteMany({});
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const data of mapped) {
    try {
      const existing = await prisma.plate.findUnique({ where: { normalized: data.normalized } });
      if (existing) {
        await prisma.plate.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.plate.create({ data });
        created++;
      }
    } catch {
      skipped++;
    }
  }

  return { created, updated, skipped, total: mapped.length };
}

export function parseCsvPlates(csv: string): ImportPlateRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: ImportPlateRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row as ImportPlateRow);
  }

  return rows;
}
