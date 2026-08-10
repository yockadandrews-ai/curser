/**
 * SGOS Command — protected shortcut backend
 * Every action: draft/local only unless explicitly opening a URL. Never auto-send.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { getProposalStatusReport, GOVERNANCE_RULE } from './proposalStatus.js';

const SIGNALS_DIR = path.join(process.cwd(), 'data', 'signals');
const TESLA_LOG = path.join(process.cwd(), 'data', 'tesla-prep.log');

db.exec(`
  CREATE TABLE IF NOT EXISTS captured_signals (
    id TEXT PRIMARY KEY,
    signal TEXT NOT NULL,
    parties TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'local_draft',
    created_at TEXT NOT NULL
  );
`);

export interface CommandConfig {
  approvalQueueUrl: string;
  pressQueueUrl: string;
  masterMapUrl: string;
  hermesStatusUrl: string;
  fieldBoardUrl: string | null;
  auditCalendarUrl: string;
  proposalStatusPath: string;
  protectedPattern: string;
}

export interface CapturedSignal {
  id: string;
  signal: string;
  parties?: string;
  priority: string;
  status: string;
  createdAt: string;
  filePath?: string;
}

export interface GovernanceStatus {
  rule: string;
  lastGenerateDate: string | null;
  sentTotal: number;
  draftedTotal: number;
  approvedTotal: number;
  hermesProofP0: string;
  readinessNote: string;
  masterMapUrl: string;
  hermesStatusUrl: string;
  scannedAt: string;
}

export interface MetricsPulse {
  affiliateProducts: number;
  notionTools: number;
  proposalDrafts: number;
  proposalsSent: number;
  lastGenerateDate: string | null;
  capturedSignals: number;
  scannedAt: string;
}

export interface TeslaPrepResult {
  ok: boolean;
  sentryEnabled: boolean;
  loggedAt: string;
  note: string;
}

export function getCommandConfig(): CommandConfig {
  return {
    approvalQueueUrl: process.env.NOTION_APPROVAL_QUEUE_URL?.trim() || 'https://notion.so',
    pressQueueUrl: process.env.PRESS_QUEUE_URL?.trim() || process.env.NOTION_PRESS_QUEUE_URL?.trim() || 'https://notion.so',
    masterMapUrl: process.env.NOTION_MASTER_MAP_URL?.trim() || 'https://notion.so',
    hermesStatusUrl: process.env.NOTION_HERMES_STATUS_URL?.trim() || 'https://notion.so',
    fieldBoardUrl: process.env.FIELD_BOARD_URL?.trim() || null,
    auditCalendarUrl: process.env.SGOS_AUDIT_CALENDAR_URL?.trim() || 'https://calendly.com',
    proposalStatusPath: '/shortcuts',
    protectedPattern: 'Ask for Confirmation → Perform action → Show Notification (Sent=0 unless proof)',
  };
}

export function captureSignal(input: {
  signal: string;
  parties?: string;
  priority?: string;
}): CapturedSignal {
  const id = uuidv4();
  const now = new Date().toISOString();
  const priority = input.priority?.trim() || 'normal';

  db.prepare(`
    INSERT INTO captured_signals (id, signal, parties, priority, status, created_at)
    VALUES (?, ?, ?, ?, 'local_draft', ?)
  `).run(id, input.signal.trim(), input.parties?.trim() || null, priority, now);

  fs.mkdirSync(SIGNALS_DIR, { recursive: true });
  const slug = now.replace(/[:.]/g, '-');
  const filePath = path.join(SIGNALS_DIR, `${slug}_${id.slice(0, 8)}.md`);
  const md = `# Captured Signal (local draft)

**ID:** ${id}
**Captured:** ${now}
**Parties:** ${input.parties?.trim() || 'unspecified'}
**Priority:** ${priority}
**Status:** local_draft — nothing sent

---

${input.signal.trim()}

---

*SGOS Command — Capture Signal. Review in Press Queue before any outbound.*
`;
  fs.writeFileSync(filePath, md);

  return {
    id,
    signal: input.signal.trim(),
    parties: input.parties?.trim(),
    priority,
    status: 'local_draft',
    createdAt: now,
    filePath,
  };
}

export function getGovernanceStatus(): GovernanceStatus {
  const report = getProposalStatusReport();
  const config = getCommandConfig();

  return {
    rule: GOVERNANCE_RULE,
    lastGenerateDate: report.lastGenerateDate,
    sentTotal: report.sentTotal,
    draftedTotal: report.draftedTotal,
    approvedTotal: report.approvedTotal,
    hermesProofP0: 'HERMES-PROOF-001 — human action required (Notion canon)',
    readinessNote: report.sentTotal === 0
      ? 'Governance checkpoint active: drafts exist, Sent=0 until Approval Queue + L5 proof.'
      : 'Some proposals marked sent with proof URL only.',
    masterMapUrl: config.masterMapUrl,
    hermesStatusUrl: config.hermesStatusUrl,
    scannedAt: new Date().toISOString(),
  };
}

export function getMetricsPulse(): MetricsPulse {
  const report = getProposalStatusReport();
  const affiliateProducts = (db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
  const notionTools = (db.prepare('SELECT COUNT(*) as c FROM notion_tools').get() as { c: number }).c;
  const capturedSignals = (db.prepare('SELECT COUNT(*) as c FROM captured_signals').get() as { c: number }).c;

  return {
    affiliateProducts,
    notionTools,
    proposalDrafts: report.draftedTotal + report.approvedTotal,
    proposalsSent: report.sentTotal,
    lastGenerateDate: report.lastGenerateDate,
    capturedSignals,
    scannedAt: new Date().toISOString(),
  };
}

export function logTeslaDrivePrep(sentryEnabled = false): TeslaPrepResult {
  const now = new Date().toISOString();
  const line = `[${now}] Tesla Drive Prep requested · sentry=${sentryEnabled ? 'on' : 'off'} · no outbound\n`;
  fs.mkdirSync(path.dirname(TESLA_LOG), { recursive: true });
  fs.appendFileSync(TESLA_LOG, line);

  return {
    ok: true,
    sentryEnabled,
    loggedAt: now,
    note: sentryEnabled
      ? 'Tesla prepared (precondition + Sentry flagged). Ready for drive.'
      : 'Tesla prepared (precondition). Ready for drive.',
  };
}

export function listCapturedSignals(limit = 20): CapturedSignal[] {
  return db.prepare('SELECT * FROM captured_signals ORDER BY created_at DESC LIMIT ?').all(limit)
    .map(row => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        signal: r.signal as string,
        parties: r.parties as string | undefined,
        priority: r.priority as string,
        status: r.status as string,
        createdAt: r.created_at as string,
      };
    });
}

/** Protected menu order for SGOS Command root */
export const COMMAND_MENU = [
  { id: 'capture-signal', order: 1, requiresConfirmation: true },
  { id: 'approval-queue', order: 2, requiresConfirmation: true },
  { id: 'governance-status', order: 3, requiresConfirmation: true },
  { id: 'proposal-status', order: 4, requiresConfirmation: true },
  { id: 'tesla-drive-prep', order: 5, requiresConfirmation: true },
  { id: 'field-board', order: 6, requiresConfirmation: true, optional: true },
  { id: 'book-sgos-audit', order: 7, requiresConfirmation: true },
  { id: 'press-queue', order: 8, requiresConfirmation: true },
  { id: 'metrics-pulse', order: 9, requiresConfirmation: true },
] as const;
