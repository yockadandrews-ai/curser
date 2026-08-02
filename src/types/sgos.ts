export type PlateTier = 1 | 2 | 3 | 4 | 5;

export interface PlateRecord {
  plateCode: string;
  tier: PlateTier;
  callSign?: string;
  theme?: string;
  location: string;
  contact?: string;
  instructions: string;
  zone?: string;
  notes?: string;
}

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

export interface SmsLog {
  id: string;
  messageId: string | null;
  plateCode: string | null;
  scenario: string | null;
  body: string;
  toNumber: string;
  status: string;
  delivered: boolean;
  ackCode: string | null;
  source: string;
  createdAt: string;
}

export interface FieldTagResult {
  ok: boolean;
  plate: PlateRecord;
  classified: ClassifiedScenario;
  sms: { body: string; messageId: string; status: string; error?: string };
  log: SmsLog;
}

export interface BatchLogResult {
  ok: boolean;
  total: number;
  found: number;
  results: Array<{ plate: string; found: boolean; scenario?: string; sms?: string }>;
  summarySms?: string;
}

export type DispatchChannel = 'HERMES' | 'PORTAL' | 'COURIER';
export type AckCode = 'PKG-OK' | 'DRV-IN' | 'HOLD' | 'ABORT';

export interface SgosSettings {
  operatorPhone: string;
  mockSms: boolean;
  sendblueConfigured: boolean;
  plateCount: number;
}

export interface PlateLookupResult {
  plate: PlateRecord;
  classified: ClassifiedScenario;
  previewSms: string;
}
