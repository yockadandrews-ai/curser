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

const BASE = '/api/sgos';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
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
      body: JSON.stringify({ plate, phone }),
    }),

  batchLog: (plates: string[], phone?: string) =>
    request<BatchLogResult>('/batch-log', {
      method: 'POST',
      body: JSON.stringify({ plates, phone }),
    }),

  dispatch: (channel: DispatchChannel, etaMinutes?: number, notes?: string, phone?: string) =>
    request<{ ok: boolean; channel: string; etaMinutes: number; sms: { body: string; status: string } }>('/dispatch', {
      method: 'POST',
      body: JSON.stringify({ channel, etaMinutes, notes, phone }),
    }),

  ack: (code: AckCode, plate?: string, phone?: string) =>
    request<{ ok: boolean; code: string; sms: { body: string; status: string } }>('/ack', {
      method: 'POST',
      body: JSON.stringify({ code, plate, phone }),
    }),

  getPlates: (q?: string) =>
    request<PlateRecord[]>(`/plates${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  lookupPlate: (code: string) => request<PlateLookupResult>(`/plates/${encodeURIComponent(code)}`),

  getLogs: (limit = 50) => request<SmsLog[]>(`/logs?limit=${limit}`),

  getSettings: () => request<SgosSettings>('/settings'),

  updateSettings: (operatorPhone: string) =>
    request<SgosSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ operatorPhone }),
    }),

  importPlates: (plates: unknown[], mode: 'upsert' | 'replace' = 'upsert') =>
    request<ImportResult>('/import', {
      method: 'POST',
      body: JSON.stringify({ plates, mode }),
    }),

  importCsv: (csv: string, mode: 'upsert' | 'replace' = 'upsert') =>
    request<ImportResult>('/import', {
      method: 'POST',
      body: JSON.stringify({ csv, mode }),
    }),

  health: () => request<{ ok: boolean; plates: number }>('/health'),
};
