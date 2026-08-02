import type {
  PlateRecord,
  FieldTagResult,
  BatchLogResult,
  DispatchChannel,
  AckCode,
  SmsLog,
  SgosSettings,
  PlateLookupResult,
  ImportResult,
} from './types/sgos';
import { getSgosLocale } from './i18n/config';

const BASE = '/api/sgos';

function withLocale(body: Record<string, unknown> = {}): string {
  return JSON.stringify({ ...body, locale: getSgosLocale() });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getSgosLocale(),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const sgosApi = {
  fieldTag: (plate: string, phone?: string) =>
    request<FieldTagResult>('/field-tag', {
      method: 'POST',
      body: withLocale({ plate, phone }),
    }),

  batchLog: (plates: string[], phone?: string) =>
    request<BatchLogResult>('/batch-log', {
      method: 'POST',
      body: withLocale({ plates, phone }),
    }),

  dispatch: (channel: DispatchChannel, etaMinutes?: number, notes?: string, phone?: string) =>
    request<{ ok: boolean; channel: string; etaMinutes: number; sms: { body: string; status: string } }>('/dispatch', {
      method: 'POST',
      body: withLocale({ channel, etaMinutes, notes, phone }),
    }),

  ack: (code: AckCode, plate?: string, phone?: string) =>
    request<{ ok: boolean; code: string; sms: { body: string; status: string } }>('/ack', {
      method: 'POST',
      body: withLocale({ code, plate, phone }),
    }),

  getPlates: (q?: string) =>
    request<PlateRecord[]>(`/plates${q ? `?q=${encodeURIComponent(q)}&locale=${getSgosLocale()}` : `?locale=${getSgosLocale()}`}`),

  lookupPlate: (code: string) =>
    request<PlateLookupResult>(`/plates/${encodeURIComponent(code)}?locale=${getSgosLocale()}`),

  getLogs: (limit = 50) => request<SmsLog[]>(`/logs?limit=${limit}&locale=${getSgosLocale()}`),

  getSettings: () => request<SgosSettings>(`/settings?locale=${getSgosLocale()}`),

  updateSettings: (operatorPhone: string) =>
    request<SgosSettings>('/settings', {
      method: 'PUT',
      body: withLocale({ operatorPhone }),
    }),

  importPlates: (plates: unknown[], mode: 'upsert' | 'replace' = 'upsert') =>
    request<ImportResult>('/import', {
      method: 'POST',
      body: withLocale({ plates, mode }),
    }),

  importCsv: (csv: string, mode: 'upsert' | 'replace' = 'upsert') =>
    request<ImportResult>('/import', {
      method: 'POST',
      body: withLocale({ csv, mode }),
    }),

  health: () => request<{ ok: boolean; plates: number }>('/health'),
};
