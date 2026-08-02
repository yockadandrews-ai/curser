import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.dirname(process.env.SGOS_DB_PATH || path.join(__dirname, '../../data/sgos.db'));
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = process.env.SGOS_DB_PATH || path.join(dataDir, 'sgos.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sgos_sms_logs (
    id TEXT PRIMARY KEY,
    message_id TEXT,
    plate_code TEXT,
    scenario TEXT,
    body TEXT NOT NULL,
    to_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    delivered INTEGER NOT NULL DEFAULT 0,
    ack_code TEXT,
    source TEXT NOT NULL DEFAULT 'field-tag',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sgos_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

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

function rowToLog(row: Record<string, unknown>): SmsLog {
  return {
    id: row.id as string,
    messageId: (row.message_id as string) ?? null,
    plateCode: (row.plate_code as string) ?? null,
    scenario: (row.scenario as string) ?? null,
    body: row.body as string,
    toNumber: row.to_number as string,
    status: row.status as string,
    delivered: Boolean(row.delivered),
    ackCode: (row.ack_code as string) ?? null,
    source: row.source as string,
    createdAt: row.created_at as string,
  };
}

export function logSms(entry: {
  messageId?: string;
  plateCode?: string;
  scenario?: string;
  body: string;
  toNumber: string;
  status: string;
  source?: string;
}): SmsLog {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO sgos_sms_logs (id, message_id, plate_code, scenario, body, to_number, status, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entry.messageId ?? null,
    entry.plateCode ?? null,
    entry.scenario ?? null,
    entry.body,
    entry.toNumber,
    entry.status,
    entry.source ?? 'field-tag',
  );
  return getLogById(id)!;
}

export function getLogById(id: string): SmsLog | undefined {
  const row = db.prepare('SELECT * FROM sgos_sms_logs WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? rowToLog(row) : undefined;
}

export function getLogByMessageId(messageId: string): SmsLog | undefined {
  const row = db.prepare('SELECT * FROM sgos_sms_logs WHERE message_id = ?').get(messageId) as Record<string, unknown> | undefined;
  return row ? rowToLog(row) : undefined;
}

export function getRecentLogs(limit = 50): SmsLog[] {
  const rows = db.prepare('SELECT * FROM sgos_sms_logs ORDER BY created_at DESC LIMIT ?').all(limit) as Record<string, unknown>[];
  return rows.map(rowToLog);
}

export function markDelivered(messageId: string): SmsLog | undefined {
  db.prepare('UPDATE sgos_sms_logs SET delivered = 1 WHERE message_id = ?').run(messageId);
  return getLogByMessageId(messageId);
}

export function updateAck(plateCode: string, ackCode: string): SmsLog | undefined {
  const row = db.prepare(`
    SELECT * FROM sgos_sms_logs
    WHERE plate_code = ? AND ack_code IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(plateCode) as Record<string, unknown> | undefined;

  if (!row) return undefined;

  db.prepare('UPDATE sgos_sms_logs SET ack_code = ? WHERE id = ?').run(ackCode, row.id);
  return getLogById(row.id as string);
}

export function getSetting(key: string): string | undefined {
  const row = db.prepare('SELECT value FROM sgos_settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  db.prepare(`
    INSERT INTO sgos_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

export function getOperatorPhone(): string {
  return getSetting('operator_phone') ?? process.env.SGOS_OPERATOR_PHONE ?? '+12025550147';
}

export { db as sgosDb };
