/**
 * Calendar trigger resolver — maps live Google Calendar events → Hermes ingest
 * Idempotent: same live event ID will not create duplicate tasks.
 */

import { resolveCalendarEvent, type LiveCalendarEvent } from '../data/liveCalendarEvents.js';
import { getRegistryProduct } from '../data/productRegistry.js';
import { ingestHermesSignal, findTaskByCalendarEventUid } from './orchestrator.js';
import { writeLedgerEntry } from './chaosLedger.js';
import { getN8nHermesConfig } from './n8nConfig.js';
import type { HermesTaskRecord } from '../schemas/hermes.js';
import type { HermesAgentId } from '../schemas/hermes.js';

export interface CalendarTriggerResult {
  matched: boolean;
  liveEvent?: LiveCalendarEvent;
  task?: HermesTaskRecord;
  factoryFiles?: string[];
  deduplicated?: boolean;
  message: string;
  /** Ready for n8n Gmail/Slack node — no credentials in Hermes */
  notify?: {
    subject: string;
    body: string;
    hermesUrl: string;
    approveUrl: string;
    sent: 0;
  };
}

function agentForEvent(event: LiveCalendarEvent): HermesAgentId {
  return event.hermesAgent;
}

function buildNotify(liveEvent: LiveCalendarEvent, task: HermesTaskRecord, deduplicated: boolean) {
  const cfg = getN8nHermesConfig();
  const action = deduplicated ? 'Existing task (no duplicate)' : 'New task created';
  return {
    subject: `[SGOS Hermes] ${liveEvent.summary}`,
    body: [
      action,
      `Event: ${liveEvent.eventType}`,
      `Task: ${task.id}`,
      `Status: ${task.status}`,
      `Sent: 0`,
      '',
      `Review: ${cfg.hermesReviewUrl}`,
      `Approve: ${cfg.approveUrl}`,
      '',
      cfg.governance,
    ].join('\n'),
    hermesUrl: cfg.hermesReviewUrl,
    approveUrl: cfg.approveUrl,
    sent: 0 as const,
  };
}

export function triggerFromCalendarEvent(input: {
  title: string;
  startDate?: string;
  productId?: string;
  eventType?: string;
  source?: 'calendar' | 'n8n' | 'webhook';
  force?: boolean;
}): CalendarTriggerResult {
  const liveEvent = resolveCalendarEvent({
    title: input.title,
    startDate: input.startDate,
    productId: input.productId,
    eventType: input.eventType as LiveCalendarEvent['eventType'] | undefined,
  });

  if (!liveEvent) {
    return {
      matched: false,
      message: `No live calendar mapping for title: "${input.title}"`,
    };
  }

  const product = getRegistryProduct(liveEvent.productId);
  if (!product) {
    return { matched: false, message: `Registry missing product: ${liveEvent.productId}` };
  }

  if (!input.force) {
    const existing = findTaskByCalendarEventUid(liveEvent.id);
    if (existing) {
      return {
        matched: true,
        liveEvent,
        task: existing,
        deduplicated: true,
        message: `Existing task ${existing.id} · ${liveEvent.eventType} · Sent=0`,
        notify: buildNotify(liveEvent, existing, true),
      };
    }
  }

  writeLedgerEntry({
    kind: 'calendar_event',
    agentId: 'hermes_supervisor',
    actor: input.source || 'calendar',
    summary: `Calendar trigger: ${liveEvent.summary}`,
    attribution: `${liveEvent.productId} · ${liveEvent.eventType}`,
    payload: liveEvent,
    sent: 0,
  });

  const task = ingestHermesSignal({
    source: input.source || 'calendar',
    title: liveEvent.summary,
    summary: `Live calendar · ${liveEvent.eventType} · ${product.name}`,
    productSlug: product.slug,
    calendarEventUid: liveEvent.id,
    payload: {
      liveEventId: liveEvent.id,
      eventType: liveEvent.eventType,
      agent: agentForEvent(liveEvent),
    },
  });

  let factoryFiles: string[] | undefined;
  if (liveEvent.eventType === 'build_weekend' && task.vaultPath) {
    factoryFiles = [
      `${task.vaultPath}/reel-scripts.md`,
      `${task.vaultPath}/captions.md`,
      `${task.vaultPath}/gumroad-description.md`,
      `${task.vaultPath}/receipt-template.md`,
    ];
  }

  return {
    matched: true,
    liveEvent,
    task,
    factoryFiles,
    deduplicated: false,
    message: `Hermes task ${task.id} · ${liveEvent.eventType} · Sent=0`,
    notify: buildNotify(liveEvent, task, false),
  };
}
