import type { PlateRecord } from './plateRegistry.js';

export type ScenarioType =
  | 'DRV-PICKUP'
  | 'PKG-DROP'
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

export function classifyPlate(plate: PlateRecord): ClassifiedScenario {
  const theme = (plate.theme ?? '').toLowerCase();
  const instructions = plate.instructions.toLowerCase();

  if (plate.tier === 5 || FREEZE_KEYWORDS.some((k) => theme.includes(k) || instructions.includes(k))) {
    return { scenario: 'FREEZE', tier: plate.tier, callSign: plate.callSign, templateKey: 'freeze' };
  }

  if (plate.tier === 1 && plate.callSign) {
    return { scenario: 'DRV-PICKUP', tier: plate.tier, callSign: plate.callSign, templateKey: 'drv_pickup' };
  }

  if (PACKAGE_KEYWORDS.some((k) => theme.includes(k) || instructions.includes(k))) {
    const scenario = instructions.includes('intake') ? 'PKG-INTAKE' : 'PKG-DROP';
    return { scenario, tier: plate.tier, callSign: plate.callSign, templateKey: scenario === 'PKG-INTAKE' ? 'pkg_intake' : 'pkg_drop' };
  }

  if (HOLD_KEYWORDS.some((k) => theme.includes(k) || instructions.includes(k))) {
    return { scenario: 'HOLD', tier: plate.tier, callSign: plate.callSign, templateKey: 'hold' };
  }

  if (plate.tier === 4) {
    return { scenario: 'FIELD', tier: plate.tier, callSign: plate.callSign, templateKey: 'field' };
  }

  return { scenario: 'STANDARD', tier: plate.tier, callSign: plate.callSign, templateKey: 'standard' };
}

export interface SmsBuildInput {
  plate: PlateRecord;
  classified: ClassifiedScenario;
  operatorPhone?: string;
  timestamp?: Date;
}

export function buildFieldTagSms(input: SmsBuildInput): string {
  const { plate, classified } = input;
  const ts = (input.timestamp ?? new Date()).toISOString().slice(11, 16);
  const lines = [
    `[SGOS ALERT] TYPE: ${classified.scenario}`,
    `PLATE: ${plate.plateCode} | TIER-${plate.tier}`,
  ];

  if (plate.callSign) lines.push(`CALLSIGN: ${plate.callSign}`);
  lines.push(`LOC: ${plate.location}`);
  if (plate.contact) lines.push(`CONTACT: ${plate.contact}`);
  lines.push(`ACTION: ${plate.instructions}`);
  if (plate.zone) lines.push(`ZONE: ${plate.zone}`);
  lines.push(`TIME: ${ts} UTC`);
  lines.push('Reply: PKG-OK | DRV-IN | HOLD | ABORT');

  return lines.join('\n');
}

export function buildBatchSummarySms(plates: Array<{ plate: PlateRecord; classified: ClassifiedScenario }>): string {
  const lines = [`[SGOS BATCH] ${plates.length} plates logged`, '---'];
  for (const { plate, classified } of plates) {
    lines.push(`${plate.plateCode} → ${classified.scenario} @ ${plate.location}`);
  }
  lines.push('---', 'Full detail sent per plate. Reply ACK when complete.');
  return lines.join('\n');
}

export type DispatchChannel = 'HERMES' | 'PORTAL' | 'COURIER';

export function buildDispatchSms(channel: DispatchChannel, etaMinutes: number, notes?: string): string {
  const lines = [
    `[SGOS DISPATCH] CHANNEL: ${channel}`,
    `Driver notified. ETA: ${etaMinutes} min`,
  ];
  if (notes) lines.push(`NOTES: ${notes}`);
  lines.push('Stand by for DRV-IN confirmation.');
  return lines.join('\n');
}

export type AckCode = 'PKG-OK' | 'DRV-IN' | 'HOLD' | 'ABORT';

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

export function parseAckFromText(text: string): AckCode | null {
  const upper = text.toUpperCase();
  const codes: AckCode[] = ['PKG-OK', 'DRV-IN', 'HOLD', 'ABORT'];
  return codes.find((c) => upper.includes(c)) ?? null;
}
