/**
 * SGOS Autopilot — Proposal Status shortcut
 * Draft free, send gated. Never auto-email / auto-LinkedIn / auto-DM.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { OUTPUT_ROOT, generateFiveThemePackage } from '../factory/generator.js';
import { expandProposalsInFolder } from '../factory/expandProposals.js';
import { getThemeForDay } from '../factory/themes.js';

export type DraftStatus = 'DRAFTED' | 'APPROVED' | 'REJECTED' | 'SENT';

export interface OutputPackageInfo {
  folderPath: string;
  batchDate: string;
  type: 'Five_Themes' | 'Three_Themes' | 'ConversionRevenue' | 'Multilingual' | 'Other';
  proposalCount: number;
  appCount: number;
  proposalsFullCount: number;
  status: DraftStatus;
  sent: number;
  manifestPath?: string;
}

export interface ProposalStatusReport {
  rule: string;
  lastGenerateDate: string | null;
  lastFolder: string | null;
  packages: OutputPackageInfo[];
  approvalQueue: ProposalDraftRecord[];
  sentTotal: number;
  draftedTotal: number;
  approvedTotal: number;
  todayTheme: string;
  outputRoot: string;
  approvalQueueUrl: string;
  scannedAt: string;
}

export interface ProposalDraftRecord {
  id: string;
  folderPath: string;
  batchDate: string;
  proposalCount: number;
  appCount: number;
  status: DraftStatus;
  sent: number;
  approvedAt?: string;
  approvedBy?: string;
  proofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS proposal_drafts (
    id TEXT PRIMARY KEY,
    folder_path TEXT NOT NULL UNIQUE,
    batch_date TEXT NOT NULL,
    proposal_count INTEGER DEFAULT 0,
    app_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'DRAFTED',
    sent INTEGER DEFAULT 0,
    approved_at TEXT,
    approved_by TEXT,
    proof_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const GOVERNANCE_RULE =
  'Generates markdown proposals only. Does not send. Send only after Approval Queue + L5 proof.';

export const APPROVAL_QUEUE_URL =
  process.env.NOTION_APPROVAL_QUEUE_URL?.trim() || 'https://notion.so';

function parseBatchDate(folderName: string): string | null {
  const m = folderName.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function classifyFolder(name: string): OutputPackageInfo['type'] {
  if (name.includes('Five_Themes')) return 'Five_Themes';
  if (name.includes('Three_Themes')) return 'Three_Themes';
  if (name.includes('ConversionRevenue') || name.includes('Conversion_Revenue')) return 'ConversionRevenue';
  if (name.includes('Multilingual')) return 'Multilingual';
  return 'Other';
}

function countFiles(dir: string, pattern: RegExp): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (pattern.test(ent.name)) count++;
    }
  };
  walk(dir);
  return count;
}

function readManifest(folderPath: string): { status?: DraftStatus; sent?: number } | null {
  const manifestPath = path.join(OUTPUT_ROOT, folderPath, 'SGOS_MANIFEST.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { status?: DraftStatus; sent?: number };
  } catch {
    return null;
  }
}

function mapDraft(row: Record<string, unknown>): ProposalDraftRecord {
  return {
    id: row.id as string,
    folderPath: row.folder_path as string,
    batchDate: row.batch_date as string,
    proposalCount: row.proposal_count as number,
    appCount: row.app_count as number,
    status: row.status as DraftStatus,
    sent: row.sent as number,
    approvedAt: row.approved_at as string | undefined,
    approvedBy: row.approved_by as string | undefined,
    proofUrl: row.proof_url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function scanOutputPackages(): OutputPackageInfo[] {
  if (!fs.existsSync(OUTPUT_ROOT)) return [];

  const packages: OutputPackageInfo[] = [];
  for (const name of fs.readdirSync(OUTPUT_ROOT)) {
    const full = path.join(OUTPUT_ROOT, name);
    if (!fs.statSync(full).isDirectory()) continue;
    const batchDate = parseBatchDate(name);
    if (!batchDate) continue;

    const proposalCount = countFiles(full, /^Proposal_.*\.md$|^Proposal_Suite\.md$/i);
    const proposalsFullCount = countFiles(full, /^Full_.*\.md$|^Suite_Proposal_Full\.md$/i);
    const appDefs = countFiles(full, /^Apps\.md$|^01_AppDefinitions\.md$/i);
    const themeDirs = fs.readdirSync(full).filter(e =>
      fs.statSync(path.join(full, e)).isDirectory() && /^\d{2}_/.test(e),
    ).length;
    const appCount = themeDirs > 0 ? themeDirs * 5 : appDefs * 5;

    const manifest = readManifest(name);
    const dbRow = db.prepare('SELECT * FROM proposal_drafts WHERE folder_path = ?').get(name) as Record<string, unknown> | undefined;

    packages.push({
      folderPath: name,
      batchDate,
      type: classifyFolder(name),
      proposalCount: Math.max(proposalCount, proposalsFullCount > 0 ? Math.floor(proposalsFullCount / 6) * 6 : proposalCount),
      appCount: appCount || (classifyFolder(name) === 'Five_Themes' ? 25 : classifyFolder(name) === 'Three_Themes' ? 15 : 5),
      proposalsFullCount,
      status: (dbRow?.status as DraftStatus) ?? manifest?.status ?? 'DRAFTED',
      sent: dbRow ? (dbRow.sent as number) : (manifest?.sent ?? 0),
      manifestPath: fs.existsSync(path.join(full, 'SGOS_MANIFEST.json')) ? `${name}/SGOS_MANIFEST.json` : undefined,
    });
  }

  return packages.sort((a, b) => b.batchDate.localeCompare(a.batchDate));
}

export function getProposalStatusReport(): ProposalStatusReport {
  const packages = scanOutputPackages();
  const last = packages[0];
  const queue = db.prepare('SELECT * FROM proposal_drafts ORDER BY batch_date DESC, updated_at DESC').all()
    .map(r => mapDraft(r as Record<string, unknown>));

  const sentTotal = queue.reduce((s, d) => s + d.sent, 0);

  return {
    rule: GOVERNANCE_RULE,
    lastGenerateDate: last?.batchDate ?? null,
    lastFolder: last?.folderPath ?? null,
    packages,
    approvalQueue: queue,
    sentTotal,
    draftedTotal: queue.filter(d => d.status === 'DRAFTED').length,
    approvedTotal: queue.filter(d => d.status === 'APPROVED').length,
    todayTheme: getThemeForDay(),
    outputRoot: OUTPUT_ROOT,
    approvalQueueUrl: APPROVAL_QUEUE_URL,
    scannedAt: new Date().toISOString(),
  };
}

function upsertDraftRecord(folderPath: string, batchDate: string, proposalCount: number, appCount: number): ProposalDraftRecord {
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM proposal_drafts WHERE folder_path = ?').get(folderPath) as { id: string } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE proposal_drafts SET proposal_count=?, app_count=?, status='DRAFTED', sent=0, updated_at=?
      WHERE folder_path=?
    `).run(proposalCount, appCount, now, folderPath);
    return mapDraft(db.prepare('SELECT * FROM proposal_drafts WHERE folder_path = ?').get(folderPath) as Record<string, unknown>);
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO proposal_drafts (id, folder_path, batch_date, proposal_count, app_count, status, sent, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'DRAFTED', 0, ?, ?)
  `).run(id, folderPath, batchDate, proposalCount, appCount, now, now);
  return mapDraft(db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown>);
}

function writeManifest(folderPath: string, data: Record<string, unknown>): void {
  const full = path.join(OUTPUT_ROOT, folderPath);
  fs.mkdirSync(full, { recursive: true });
  fs.writeFileSync(path.join(full, 'SGOS_MANIFEST.json'), JSON.stringify(data, null, 2));
}

/** Generate today's five-theme batch — DRAFTED only, Sent=0, no outbound */
export function generateTodayProposalBatch(): {
  folderPath: string;
  batchDate: string;
  status: 'DRAFTED';
  sent: 0;
  proposalCount: number;
  appCount: number;
  proposalsFullExpanded: number;
  draft: ProposalDraftRecord;
  confirmation: string;
} {
  const run = generateFiveThemePackage();
  const expand = expandProposalsInFolder(run.folderPath);

  const manifest = {
    status: 'DRAFTED' as const,
    sent: 0,
    generatedAt: new Date().toISOString(),
    batchDate: run.date,
    folderPath: run.folderPath,
    appCount: run.totalApps,
    proposalCount: run.totalProposals,
    proposalsFullSingles: expand.expandedSingles,
    proposalsFullSuites: expand.expandedSuites,
    policy: GOVERNANCE_RULE,
    modelPolicy: 'Grok default under SG3 policy — no auto-send',
    hermes: 'File-Provenance: batch generated via SGOS Autopilot shortcut',
  };

  writeManifest(run.folderPath, manifest);

  const draft = upsertDraftRecord(run.folderPath, run.date, run.totalProposals, run.totalApps);

  return {
    folderPath: run.folderPath,
    batchDate: run.date,
    status: 'DRAFTED',
    sent: 0,
    proposalCount: run.totalProposals,
    appCount: run.totalApps,
    proposalsFullExpanded: expand.expandedSingles + expand.expandedSuites,
    draft,
    confirmation: `Sent=0. Status=DRAFTED. No SMTP. No LinkedIn. No outreach cron.`,
  };
}

export function getApprovalQueue(): ProposalDraftRecord[] {
  return db.prepare('SELECT * FROM proposal_drafts ORDER BY batch_date DESC').all()
    .map(r => mapDraft(r as Record<string, unknown>));
}

export function approveDraft(id: string, approvedBy = 'human'): ProposalDraftRecord | null {
  const row = db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE proposal_drafts SET status='APPROVED', approved_at=?, approved_by=?, updated_at=?, sent=0
    WHERE id=?
  `).run(now, approvedBy, now, id);

  const draft = mapDraft(db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown>);
  const manifest = readManifest(draft.folderPath);
  writeManifest(draft.folderPath, {
    ...manifest,
    status: 'APPROVED',
    sent: 0,
    approvedAt: now,
    approvedBy,
  });
  return draft;
}

export function rejectDraft(id: string): ProposalDraftRecord | null {
  const row = db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const now = new Date().toISOString();
  db.prepare(`UPDATE proposal_drafts SET status='REJECTED', updated_at=? WHERE id=?`).run(now, id);
  return mapDraft(db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown>);
}

/** Sent count ONLY increments with proof URL — never auto */
export function markDraftSent(id: string, proofUrl: string): ProposalDraftRecord | null {
  if (!proofUrl?.trim()) return null;
  const row = db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row || row.status !== 'APPROVED') return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE proposal_drafts SET status='SENT', sent=1, proof_url=?, updated_at=? WHERE id=?
  `).run(proofUrl.trim(), now, id);

  const draft = mapDraft(db.prepare('SELECT * FROM proposal_drafts WHERE id = ?').get(id) as Record<string, unknown>);
  writeManifest(draft.folderPath, {
    status: 'SENT',
    sent: 1,
    proofUrl: proofUrl.trim(),
    sentAt: now,
  });
  return draft;
}

/** Sync disk folders into approval queue on startup */
export function syncDraftsFromDisk(): number {
  let synced = 0;
  for (const pkg of scanOutputPackages()) {
    const exists = db.prepare('SELECT id FROM proposal_drafts WHERE folder_path = ?').get(pkg.folderPath);
    if (!exists) {
      upsertDraftRecord(pkg.folderPath, pkg.batchDate, pkg.proposalCount, pkg.appCount);
      synced++;
    }
  }
  return synced;
}

export { GOVERNANCE_RULE };
