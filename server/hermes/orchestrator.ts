/**
 * Hermes Supervisor — orchestrates tasks, enforces human gates, writes Ledger
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import {
  HERMES_AGENTS,
  HERMES_GOVERNANCE,
  type HermesAgentId,
  type HermesSignalSource,
  type HermesStateSnapshot,
  type HermesTaskKind,
  type HermesTaskRecord,
  type HermesTaskStatus,
  type FounderDecision,
  type N8nHandoffPayload,
  type RiskTag,
} from '../schemas/hermes.js';
import { getContentProduct } from '../data/contentProducts.js';
import { getRegistryProduct } from '../data/productRegistry.js';
import { runContentFactory } from './contentFactory.js';
import { buildProductBriefTemplate, getNotionBriefTemplate, renderNotionBriefPage } from '../data/notionBriefTemplates.js';
import { writeLedgerEntry, getLedgerForTask, countLedgerRows } from './chaosLedger.js';
import { processRevenueEvent } from './pulseEngine.js';

const VAULT_ROOT = path.join(process.cwd(), 'data', 'hermes', 'vault');
const BRIEF_ROOT = path.join(process.cwd(), 'data', 'hermes', 'briefs');

db.exec(`
  CREATE TABLE IF NOT EXISTS hermes_tasks (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    status TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    product_slug TEXT,
    platform TEXT,
    risk_tags TEXT,
    owner TEXT DEFAULT 'A.D.',
    proof_required INTEGER DEFAULT 1,
    sent INTEGER DEFAULT 0,
    brief_path TEXT,
    vault_path TEXT,
    calendar_event_uid TEXT,
    approval_event_uid TEXT,
    notion_brief_id TEXT,
    founder_notes TEXT,
    proof_url TEXT,
    payload_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    executed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_hermes_tasks_status ON hermes_tasks(status);
  CREATE INDEX IF NOT EXISTS idx_hermes_tasks_calendar ON hermes_tasks(calendar_event_uid);
`);

function ensureDirs() {
  fs.mkdirSync(VAULT_ROOT, { recursive: true });
  fs.mkdirSync(BRIEF_ROOT, { recursive: true });
}

function mapTask(row: Record<string, unknown>): HermesTaskRecord {
  return {
    id: row.id as string,
    kind: row.kind as HermesTaskKind,
    status: row.status as HermesTaskStatus,
    agentId: row.agent_id as HermesAgentId,
    source: row.source as HermesSignalSource,
    title: row.title as string,
    summary: row.summary as string,
    productSlug: row.product_slug as string | undefined,
    platform: row.platform as string | undefined,
    riskTags: JSON.parse((row.risk_tags as string) || '[]') as RiskTag[],
    owner: row.owner as string,
    proofRequired: Boolean(row.proof_required),
    sent: row.sent as number,
    briefPath: row.brief_path as string | undefined,
    vaultPath: row.vault_path as string | undefined,
    calendarEventUid: row.calendar_event_uid as string | undefined,
    approvalEventUid: row.approval_event_uid as string | undefined,
    notionBriefId: row.notion_brief_id as string | undefined,
    founderNotes: row.founder_notes as string | undefined,
    proofUrl: row.proof_url as string | undefined,
    payloadJson: row.payload_json as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    executedAt: row.executed_at as string | undefined,
  };
}

function saveTask(task: HermesTaskRecord): HermesTaskRecord {
  db.prepare(`
    INSERT OR REPLACE INTO hermes_tasks (
      id, kind, status, agent_id, source, title, summary, product_slug, platform,
      risk_tags, owner, proof_required, sent, brief_path, vault_path,
      calendar_event_uid, approval_event_uid, notion_brief_id, founder_notes,
      proof_url, payload_json, created_at, updated_at, executed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task.id, task.kind, task.status, task.agentId, task.source, task.title, task.summary,
    task.productSlug ?? null, task.platform ?? null, JSON.stringify(task.riskTags),
    task.owner, task.proofRequired ? 1 : 0, task.sent,
    task.briefPath ?? null, task.vaultPath ?? null,
    task.calendarEventUid ?? null, task.approvalEventUid ?? null,
    task.notionBriefId ?? null, task.founderNotes ?? null,
    task.proofUrl ?? null, task.payloadJson ?? null,
    task.createdAt, task.updatedAt, task.executedAt ?? null,
  );
  return task;
}

export function classifySignal(input: {
  source: HermesSignalSource;
  title: string;
  body?: string;
  productSlug?: string;
  amount?: number;
}): HermesTaskKind {
  if (input.amount != null && input.amount > 0) return 'revenue';
  if (input.source === 'field_batch') return 'field';
  if (input.source === 'founder_stack') return 'governance';
  if (input.productSlug || /reel|pdf|content|launch|build/i.test(input.title)) return 'content';
  if (/impact|receipt|ledger|split/i.test(input.title + (input.body || ''))) return 'impact';
  return 'governance';
}

export function routeAgent(kind: HermesTaskKind, title: string): HermesAgentId {
  if (kind === 'revenue' || kind === 'impact') return 'pulse_engine';
  if (kind === 'field') return 'field_decoder';
  if (/reel/i.test(title)) return 'reel_pipeline';
  if (/pdf|build/i.test(title)) return 'pdf_sprint';
  if (kind === 'content') return 'content_factory';
  return 'governance_layer';
}

function defaultRiskTags(kind: HermesTaskKind, agentId: HermesAgentId): RiskTag[] {
  if (agentId === 'publish_router') return ['AURELIUS-P0'];
  if (kind === 'field') return ['SPECTRA-REVIEW'];
  if (kind === 'revenue' || kind === 'impact') return ['AURELIUS-P1'];
  return ['AURELIUS-P1', 'EQUINOX-ROUTE'];
}

export function ingestHermesSignal(input: {
  source: HermesSignalSource;
  title: string;
  summary?: string;
  productSlug?: string;
  platform?: string;
  calendarEventUid?: string;
  payload?: unknown;
}): HermesTaskRecord {
  ensureDirs();
  const now = new Date().toISOString();
  const kind = classifySignal({
    source: input.source,
    title: input.title,
    body: input.summary,
    productSlug: input.productSlug,
  });
  const agentId = routeAgent(kind, input.title);
  const id = uuidv4();

  const task: HermesTaskRecord = {
    id,
    kind,
    status: 'received',
    agentId,
    source: input.source,
    title: input.title,
    summary: input.summary || input.title,
    productSlug: input.productSlug,
    platform: input.platform,
    riskTags: defaultRiskTags(kind, agentId),
    owner: 'A.D.',
    proofRequired: true,
    sent: 0,
    calendarEventUid: input.calendarEventUid,
    payloadJson: input.payload ? JSON.stringify(input.payload) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  saveTask(task);
  writeLedgerEntry({
    kind: 'task_received',
    taskId: id,
    agentId: 'hermes_supervisor',
    actor: 'hermes',
    summary: `Received: ${input.title}`,
    attribution: `source=${input.source} · kind=${kind}`,
    payload: input.payload,
    sent: 0,
  });

  return advanceTask(task.id);
}

function advanceTask(taskId: string): HermesTaskRecord {
  let task = mapTask(db.prepare('SELECT * FROM hermes_tasks WHERE id = ?').get(taskId) as Record<string, unknown>);

  task.status = 'classified';
  task.updatedAt = new Date().toISOString();
  saveTask(task);

  writeLedgerEntry({
    kind: 'task_routed',
    taskId: task.id,
    agentId: task.agentId,
    actor: 'hermes',
    summary: `Routed to ${task.agentId}`,
    attribution: `EQUINOX route · risk=${task.riskTags.join(',')}`,
    sent: 0,
  });

  task = produceDraft(task);
  task = requestApproval(task);
  return task;
}

function produceDraft(task: HermesTaskRecord): HermesTaskRecord {
  task.status = 'drafting';
  task.updatedAt = new Date().toISOString();
  saveTask(task);

  const registryProduct = task.productSlug ? getRegistryProduct(task.productSlug) : undefined;
  const product = task.productSlug ? getContentProduct(task.productSlug) : undefined;
  const vaultRel = registryProduct?.vaultFolder || product?.vaultFolder || `vault/task-${task.id.slice(0, 8)}`;
  const vaultAbs = path.join(VAULT_ROOT, vaultRel.replace(/^vault\//, ''));
  fs.mkdirSync(vaultAbs, { recursive: true });

  let draftMarkdown: string;
  if (task.kind === 'revenue' || task.kind === 'impact') {
    const payload = task.payloadJson ? JSON.parse(task.payloadJson) as { amount?: number; source?: string } : {};
    const result = processRevenueEvent({
      taskId: task.id,
      amount: payload.amount ?? 0,
      source: payload.source ?? 'Gumroad',
      productSlug: task.productSlug,
    });
    draftMarkdown = result.receiptDraftMarkdown;
    fs.writeFileSync(path.join(vaultAbs, 'impact-receipt-draft.md'), draftMarkdown);
  } else if (registryProduct) {
    const factory = runContentFactory({
      productId: registryProduct.id,
      schema: registryProduct.schema,
      trigger: task.source === 'n8n' ? 'n8n' : task.source === 'calendar' ? 'calendar_event' : 'hermes_schedule',
      calendarEventId: task.calendarEventUid,
    });
    draftMarkdown = `# ${registryProduct.name} — Content Factory Complete

**Status:** DRAFTED · **Sent:** 0  
**Files:** ${factory.filesWritten.join(', ')}

See vault for reel scripts, captions, Gumroad copy, receipt template.
`;
    fs.writeFileSync(path.join(vaultAbs, 'content-draft.md'), draftMarkdown);
  } else if (product) {
    draftMarkdown = buildContentDraft(product, task);
    fs.writeFileSync(path.join(vaultAbs, 'content-draft.md'), draftMarkdown);
    if (task.agentId === 'reel_pipeline' || /reel/i.test(task.title)) {
      fs.writeFileSync(path.join(vaultAbs, 'reel-scripts.md'), buildReelScripts(product));
    }
  } else {
    draftMarkdown = `# Hermes Draft\n\n**Task:** ${task.title}\n\n**Status:** DRAFTED · Sent=0\n\n${task.summary}\n`;
    fs.writeFileSync(path.join(vaultAbs, 'draft.md'), draftMarkdown);
  }

  task.vaultPath = vaultRel;
  task.status = 'draft_ready';
  task.updatedAt = new Date().toISOString();
  saveTask(task);

  writeLedgerEntry({
    kind: 'draft_written',
    taskId: task.id,
    agentId: task.agentId,
    actor: 'hermes',
    summary: `Draft written to ${vaultRel}`,
    attribution: task.agentId,
    payload: { vaultPath: vaultRel },
    sent: 0,
  });

  return task;
}

function buildContentDraft(product: ReturnType<typeof getContentProduct>, task: HermesTaskRecord): string {
  const p = product!;
  return `# ${p.name} — Content Draft

**Hermes task:** ${task.id}  
**Status:** DRAFTED · **Sent:** 0  
**Agent:** ${task.agentId}

## Tagline
${p.tagline}

## Gumroad copy (draft)
${p.name} — ${p.tagline}

## Caption tone
${p.captionTone}

## Platforms
${p.platforms.join(', ')}

**Governance:** ${HERMES_GOVERNANCE.rule}
`;
}

function buildReelScripts(product: NonNullable<ReturnType<typeof getContentProduct>>): string {
  return `# Reel Scripts — ${product.name}

## Reel 1
Hook: ${product.reelHooks[0]}
CTA: Link in bio · DRAFTED only

## Reel 2
Hook: ${product.reelHooks[1] || product.reelHooks[0]}
CTA: Save for later

## Reel 3
Hook: ${product.reelHooks[0]} (variant B)
CTA: Comment "RECEIPT" for template

**Sent=0 until APPROVAL brief + founder Approve**
`;
}

function requestApproval(task: HermesTaskRecord): HermesTaskRecord {
  ensureDirs();
  const template = task.productSlug
    ? buildProductBriefTemplate(task.productSlug)
    : getNotionBriefTemplate('brief-approval-gate')!;

  const briefContent = renderNotionBriefPage(template, {
    vault: task.vaultPath || '',
  });
  const briefFile = path.join(BRIEF_ROOT, `${task.id}-brief.md`);
  fs.writeFileSync(briefFile, briefContent);

  task.briefPath = path.relative(process.cwd(), briefFile);
  task.notionBriefId = template.id;
  task.approvalEventUid = `hermes-approval-${task.id}@sgos`;
  task.status = 'awaiting_approval';
  task.updatedAt = new Date().toISOString();
  saveTask(task);

  writeLedgerEntry({
    kind: 'approval_requested',
    taskId: task.id,
    agentId: 'governance_layer',
    actor: 'hermes',
    summary: `APPROVAL event · ${task.title}`,
    attribution: 'Human gate · A.D. only',
    payload: { briefPath: task.briefPath, approvalEventUid: task.approvalEventUid },
    sent: 0,
  });

  return task;
}

export function founderDecision(input: {
  taskId: string;
  decision: FounderDecision;
  notes?: string;
  proofUrl?: string;
  approvedBy?: string;
}): { task: HermesTaskRecord; handoff?: N8nHandoffPayload; blocked?: string } {
  const row = db.prepare('SELECT * FROM hermes_tasks WHERE id = ?').get(input.taskId) as Record<string, unknown> | undefined;
  if (!row) throw new Error('Task not found');

  let task = mapTask(row);
  if (task.status !== 'awaiting_approval' && task.status !== 'draft_ready') {
    return { task, blocked: `Task status ${task.status} is not awaiting approval` };
  }

  task.founderNotes = input.notes;
  task.updatedAt = new Date().toISOString();

  writeLedgerEntry({
    kind: 'founder_decision',
    taskId: task.id,
    agentId: 'governance_layer',
    actor: input.approvedBy || 'A.D.',
    summary: `Founder ${input.decision}`,
    attribution: 'Human gate recorded',
    payload: { decision: input.decision, notes: input.notes },
    proofUrl: input.proofUrl,
    sent: 0,
  });

  if (input.decision === 'reject') {
    task.status = 'rejected';
    saveTask(task);
    return { task };
  }

  if (input.decision === 'modify') {
    task.status = 'modified';
    task.founderNotes = input.notes;
    saveTask(task);
    task = produceDraft(task);
    task = requestApproval(task);
    return { task };
  }

  task.status = 'approved';
  task.proofUrl = input.proofUrl;
  saveTask(task);

  const handoff = executeApprovedHandoff(task);
  return { task: mapTask(db.prepare('SELECT * FROM hermes_tasks WHERE id = ?').get(task.id) as Record<string, unknown>), handoff };
}

function executeApprovedHandoff(task: HermesTaskRecord): N8nHandoffPayload {
  const now = new Date().toISOString();
  const product = task.productSlug ? getContentProduct(task.productSlug) : undefined;

  const handoff: N8nHandoffPayload = {
    workflow: task.kind === 'revenue' || task.kind === 'impact' ? 'sgos_impact_receipt' : 'sgos_publish_fanout',
    taskId: task.id,
    productSlug: task.productSlug,
    platforms: product?.platforms,
    vaultPath: task.vaultPath,
    briefPath: task.briefPath,
    approvedAt: now,
    proofRequired: true,
    note: 'Do not execute until founder approval recorded on brief',
  };

  task.status = 'executed';
  task.executedAt = now;
  task.sent = 0;
  task.updatedAt = now;
  saveTask(task);

  writeLedgerEntry({
    kind: 'execution_handoff',
    taskId: task.id,
    agentId: 'publish_router',
    actor: 'hermes',
    summary: `n8n handoff prepared · Sent still 0`,
    attribution: 'No live credentials · human publish proof still required',
    payload: handoff,
    sent: 0,
  });

  return handoff;
}

export function getHermesTasks(limit = 50): HermesTaskRecord[] {
  return db
    .prepare('SELECT * FROM hermes_tasks ORDER BY created_at DESC LIMIT ?')
    .all(limit)
    .map(r => mapTask(r as Record<string, unknown>));
}

export function getHermesTask(id: string): HermesTaskRecord | null {
  const row = db.prepare('SELECT * FROM hermes_tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapTask(row) : null;
}

export function getHermesState(): HermesStateSnapshot {
  const tasks = getHermesTasks(500);
  const tasksByStatus = {} as Record<HermesTaskStatus, number>;
  for (const t of tasks) {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
  }

  const awaiting = tasks.filter(t => t.status === 'awaiting_approval').length;
  const executed = tasks.filter(t => t.status === 'executed').length;
  const active = tasks.find(t => t.productSlug && t.status !== 'executed' && t.status !== 'rejected');

  return {
    governance: HERMES_GOVERNANCE,
    agents: HERMES_AGENTS,
    tasksByStatus,
    awaitingApproval: awaiting,
    executedTotal: executed,
    ledgerRows: countLedgerRows(),
    activeSprint: active?.productSlug,
    scannedAt: new Date().toISOString(),
  };
}

export function findTaskByCalendarEventUid(calendarEventUid: string): HermesTaskRecord | null {
  const row = db.prepare(`
    SELECT * FROM hermes_tasks
    WHERE calendar_event_uid = ?
      AND status NOT IN ('rejected', 'cancelled')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(calendarEventUid) as Record<string, unknown> | undefined;
  return row ? mapTask(row) : null;
}

export function simulateCalendarTrigger(eventType: string, productSlug: string): HermesTaskRecord {
  const product = getContentProduct(productSlug);
  const title = `${eventType.replace(/_/g, ' ').toUpperCase()} · ${product?.name || productSlug}`;
  return ingestHermesSignal({
    source: 'calendar',
    title,
    summary: `Calendar trigger for ${productSlug}`,
    productSlug,
    calendarEventUid: `hermes-${eventType}-${productSlug}@sgos`,
  });
}

export { getLedgerForTask };
