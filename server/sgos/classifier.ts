import type { Plate } from '@prisma/client';

export type ScenarioType =
  | 'DRV-PICKUP'
  | 'PKG-DROP'
  | 'PKG-DELIVERY'
  | 'PKG-INTAKE'
  | 'HOLD'
  | 'FREEZE'
  | 'FIELD'
  | 'STANDARD'
  | 'DISPATCH'
  | 'BATCH'
  | 'ACK';

export interface ClassifiedScenario {
  scenario: ScenarioType;
  tier: number;
  callSign?: string;
  templateKey: string;
}

const PACKAGE_KEYWORDS = ['package', 'delivery', 'drop', 'pkg'];
const FREEZE_KEYWORDS = ['freeze', 'security', 'vault', 'customs'];
const HOLD_KEYWORDS = ['hold', 'await', 'clearance', 'scheduled'];

export function classifyPlate(plate: Plate): ClassifiedScenario {
  if (plate.scenario) {
    return {
      scenario: plate.scenario as ScenarioType,
      tier: plate.tier,
      callSign: plate.callSign ?? undefined,
      templateKey: plate.scenario.toLowerCase().replace(/-/g, '_'),
    };
  }

  const notes = (plate.notes ?? '').toLowerCase();
  const instructions = (plate.instructions ?? '').toLowerCase();
  const combined = `${notes} ${instructions}`;

  if (plate.tier === 5 || FREEZE_KEYWORDS.some((k) => combined.includes(k))) {
    return { scenario: 'FREEZE', tier: plate.tier, callSign: plate.callSign ?? undefined, templateKey: 'FREEZE' };
  }

  if (plate.tier === 1 && plate.callSign) {
    return { scenario: 'DRV-PICKUP', tier: plate.tier, callSign: plate.callSign, templateKey: 'DRV-PICKUP' };
  }

  if (plate.packageTheme || PACKAGE_KEYWORDS.some((k) => combined.includes(k))) {
    const scenario = instructions.includes('intake') ? 'PKG-INTAKE' : 'PKG-DELIVERY';
    return { scenario, tier: plate.tier, callSign: plate.callSign ?? undefined, templateKey: scenario };
  }

  if (HOLD_KEYWORDS.some((k) => combined.includes(k))) {
    return { scenario: 'HOLD', tier: plate.tier, callSign: plate.callSign ?? undefined, templateKey: 'HOLD' };
  }

  if (plate.tier === 4) {
    return { scenario: 'FIELD', tier: plate.tier, callSign: plate.callSign ?? undefined, templateKey: 'FIELD' };
  }

  return { scenario: 'STANDARD', tier: plate.tier, callSign: plate.callSign ?? undefined, templateKey: 'STANDARD' };
}

export type DispatchChannel = 'HERMES' | 'PORTAL' | 'COURIER';
export type AckCode = 'PKG-OK' | 'DRV-IN' | 'HOLD' | 'ABORT';

export function parseAckFromText(text: string): AckCode | null {
  const upper = text.toUpperCase();
  const codes: AckCode[] = ['PKG-OK', 'DRV-IN', 'HOLD', 'ABORT'];
  return codes.find((c) => upper.includes(c)) ?? null;
}

export function buildDispatchSms(channel: DispatchChannel, etaMinutes: number, notes?: string): string {
  const lines = [
    `[SGOS DISPATCH] CHANNEL: ${channel}`,
    `Driver notified. ETA: ${etaMinutes} min`,
  ];
  if (notes) lines.push(`NOTES: ${notes}`);
  lines.push('Stand by for DRV-IN confirmation.');
  return lines.join('\n');
}

export function buildAckConfirmationSms(code: AckCode, plateCode?: string): string {
  const messages: Record<AckCode, string> = {
    'PKG-OK': 'Package delivery confirmed. Loop closed.',
    'DRV-IN': 'Driver check-in recorded. Pickup in progress.',
    HOLD: 'Hold status set. Team notified — awaiting clearance.',
    ABORT: 'Operation aborted. Security and dispatch alerted.',
  };
  const prefix = plateCode ? `[SGOS ACK] ${plateCode} — ` : '[SGOS ACK] ';
  return prefix + messages[code];
}

export function buildBatchSummarySms(
  items: Array<{ plate: string; scenario: string; location?: string | null }>,
): string {
  const lines = [`[SGOS BATCH] ${items.length} plates logged`, '---'];
  for (const item of items) {
    lines.push(`${item.plate} → ${item.scenario} @ ${item.location ?? 'unknown'}`);
  }
  lines.push('---', 'Full detail sent per plate. Reply ACK when complete.');
  return lines.join('\n');
}
