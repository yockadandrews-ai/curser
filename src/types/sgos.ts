export type PlateTier = 1 | 2 | 3 | 4 | 5;

export interface PlateRecord {
  id: string;
  plate: string;
  normalized: string;
  callSign?: string | null;
  tier: PlateTier;
  scenario?: string | null;
  packageTheme: boolean;
  location?: string | null;
  contact?: string | null;
  instructions?: string | null;
  zone?: string | null;
  ownerName?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleColor?: string | null;
  notes?: string | null;
  isActive: boolean;
}

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

export interface SmsLog {
  id: string;
  messageId: string | null;
  toNumber: string;
  body: string;
  status: string;
  deliveredAt: string | null;
  createdAt: string;
  plate?: { plate: string; tier: number } | null;
  tagEvent?: { source: string; scenario: string | null } | null;
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
  database: string;
}

export interface ImportResult {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  total: number;
  plateCount: number;
}

export interface PlateLookupResult {
  plate: PlateRecord;
  classified: ClassifiedScenario;
  previewSms: string;
}
