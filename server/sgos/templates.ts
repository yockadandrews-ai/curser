import type { Plate } from '@prisma/client';
import { prisma } from './prisma.js';
import type { ClassifiedScenario } from './classifier.js';

const DEFAULT_TEMPLATES: Record<string, string> = {
  'DRV-PICKUP': `[SGOS ALERT] TYPE: {{scenario}}
PLATE: {{plate}} | TIER-{{tier}}
CALLSIGN: {{callSign}}
LOC: {{location}}
CONTACT: {{contact}}
ACTION: {{instructions}}
ZONE: {{zone}}
TIME: {{time}} UTC
Reply: PKG-OK | DRV-IN | HOLD | ABORT`,

  'PKG-DELIVERY': `[SGOS ALERT] TYPE: {{scenario}}
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
CONTACT: {{contact}}
ACTION: {{instructions}}
ZONE: {{zone}}
TIME: {{time}} UTC
Reply: PKG-OK | DRV-IN | HOLD | ABORT`,

  'PKG-DROP': `[SGOS ALERT] TYPE: {{scenario}}
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
CONTACT: {{contact}}
ACTION: {{instructions}}
ZONE: {{zone}}
TIME: {{time}} UTC
Reply: PKG-OK | DRV-IN | HOLD | ABORT`,

  'PKG-INTAKE': `[SGOS ALERT] TYPE: {{scenario}}
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
ACTION: {{instructions}}
ZONE: {{zone}}
TIME: {{time}} UTC
Reply: PKG-OK | DRV-IN | HOLD | ABORT`,

  FREEZE: `[SGOS ALERT] TYPE: FREEZE — SECURITY HOLD
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
ACTION: {{instructions}}
DO NOT PROCEED. Alert command immediately.
TIME: {{time}} UTC`,

  HOLD: `[SGOS ALERT] TYPE: HOLD
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
ACTION: {{instructions}}
Await clearance before proceeding.
TIME: {{time}} UTC`,

  FIELD: `[SGOS ALERT] TYPE: FIELD
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
ACTION: {{instructions}}
ZONE: {{zone}}
TIME: {{time}} UTC`,

  STANDARD: `[SGOS ALERT] TYPE: STANDARD
PLATE: {{plate}} | TIER-{{tier}}
LOC: {{location}}
ACTION: {{instructions}}
TIME: {{time}} UTC`,
};

function applyTemplate(template: string, vars: Record<string, string | number | undefined | null>): string {
  return template
    .split('\n')
    .map((line) => {
      let out = line;
      for (const [key, value] of Object.entries(vars)) {
        out = out.replaceAll(`{{${key}}}`, value != null && value !== '' ? String(value) : '');
      }
      return out;
    })
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^[A-Z][A-Z\s]*:\s*$/.test(trimmed)) return false;
      return true;
    })
    .join('\n');
}

export async function buildFieldTagSms(
  plate: Plate,
  classified: ClassifiedScenario,
  timestamp?: Date,
): Promise<string> {
  const ts = (timestamp ?? new Date()).toISOString().slice(11, 16);
  const scenario = classified.scenario;

  const dbTemplate = await prisma.smsTemplate.findFirst({
    where: { scenario, isActive: true },
  });

  const template = dbTemplate?.template ?? DEFAULT_TEMPLATES[scenario] ?? DEFAULT_TEMPLATES.STANDARD;

  return applyTemplate(template, {
    scenario,
    plate: plate.plate,
    tier: plate.tier,
    callSign: plate.callSign,
    location: plate.location,
    contact: plate.contact,
    instructions: plate.instructions ?? plate.notes,
    zone: plate.zone,
    time: ts,
    ownerName: plate.ownerName,
    vehicleMake: plate.vehicleMake,
    vehicleModel: plate.vehicleModel,
    vehicleColor: plate.vehicleColor,
  });
}

export async function seedDefaultTemplates(): Promise<number> {
  let count = 0;
  for (const [scenario, template] of Object.entries(DEFAULT_TEMPLATES)) {
    await prisma.smsTemplate.upsert({
      where: { scenario },
      create: { scenario, template, description: `Default ${scenario} template` },
      update: {},
    });
    count++;
  }
  return count;
}
