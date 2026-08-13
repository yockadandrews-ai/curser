/**
 * Chaos Ledger — full attribution for Hermes-orchestrated actions
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

export type LedgerEntryKind =
  | 'task_received'
  | 'task_routed'
  | 'draft_written'
  | 'approval_requested'
  | 'founder_decision'
  | 'execution_handoff'
  | 'revenue_recorded'
  | 'impact_split'
  | 'field_signal'
  | 'calendar_event';

export interface ChaosLedgerRow {
  id: string;
  kind: LedgerEntryKind;
  taskId?: string;
  agentId?: string;
  actor: string;
  summary: string;
  attribution: string;
  payloadJson?: string;
  proofUrl?: string;
  sent: number;
  createdAt: string;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS chaos_ledger (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    task_id TEXT,
    agent_id TEXT,
    actor TEXT NOT NULL,
    summary TEXT NOT NULL,
    attribution TEXT NOT NULL,
    payload_json TEXT,
    proof_url TEXT,
    sent INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chaos_ledger_task ON chaos_ledger(task_id);
  CREATE INDEX IF NOT EXISTS idx_chaos_ledger_created ON chaos_ledger(created_at);
`);

function mapRow(row: Record<string, unknown>): ChaosLedgerRow {
  return {
    id: row.id as string,
    kind: row.kind as LedgerEntryKind,
    taskId: row.task_id as string | undefined,
    agentId: row.agent_id as string | undefined,
    actor: row.actor as string,
    summary: row.summary as string,
    attribution: row.attribution as string,
    payloadJson: row.payload_json as string | undefined,
    proofUrl: row.proof_url as string | undefined,
    sent: row.sent as number,
    createdAt: row.created_at as string,
  };
}

export function writeLedgerEntry(input: {
  kind: LedgerEntryKind;
  taskId?: string;
  agentId?: string;
  actor: string;
  summary: string;
  attribution: string;
  payload?: unknown;
  proofUrl?: string;
  sent?: number;
}): ChaosLedgerRow {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO chaos_ledger (id, kind, task_id, agent_id, actor, summary, attribution, payload_json, proof_url, sent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.kind,
    input.taskId ?? null,
    input.agentId ?? null,
    input.actor,
    input.summary,
    input.attribution,
    input.payload ? JSON.stringify(input.payload) : null,
    input.proofUrl ?? null,
    input.sent ?? 0,
    now,
  );
  return mapRow(db.prepare('SELECT * FROM chaos_ledger WHERE id = ?').get(id) as Record<string, unknown>);
}

export function getLedgerRows(limit = 50): ChaosLedgerRow[] {
  return db
    .prepare('SELECT * FROM chaos_ledger ORDER BY created_at DESC LIMIT ?')
    .all(limit)
    .map(r => mapRow(r as Record<string, unknown>));
}

export function countLedgerRows(): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM chaos_ledger').get() as { c: number };
  return row.c;
}

export function getLedgerForTask(taskId: string): ChaosLedgerRow[] {
  return db
    .prepare('SELECT * FROM chaos_ledger WHERE task_id = ? ORDER BY created_at ASC')
    .all(taskId)
    .map(r => mapRow(r as Record<string, unknown>));
}
