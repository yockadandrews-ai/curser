/**
 * Calendar trigger resolver — maps live Google Calendar events → Hermes ingest
 */

import { resolveCalendarEvent, type LiveCalendarEvent } from '../data/liveCalendarEvents.js';
import { getRegistryProduct } from '../data/productRegistry.js';
import { ingestHermesSignal } from './orchestrator.js';
import { writeLedgerEntry } from './chaosLedger.js';
import type { HermesTaskRecord } from '../schemas/hermes.js';
import type { HermesAgentId } from '../schemas/hermes.js';

export interface CalendarTriggerResult {
  matched: boolean;
  liveEvent?: LiveCalendarEvent;
  task?: HermesTaskRecord;
  factoryFiles?: string[];
  message: string;
}

function agentForEvent(event: LiveCalendarEvent): HermesAgentId {
  return event.hermesAgent;
}

export function triggerFromCalendarEvent(input: {
  title: string;
  startDate?: string;
  productId?: string;
  eventType?: string;
  source?: 'calendar' | 'n8n' | 'webhook';
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

  writeLedgerEntry({
    kind: 'calendar_event',
    agentId: 'hermes_supervisor',
    actor: input.source || 'calendar',
    summary: `Calendar trigger: ${liveEvent.summary}`,
    attribution: `${liveEvent.productId} · ${liveEvent.eventType}`,
    payload: liveEvent,
    sent: 0,
  });

  let factoryFiles: string[] | undefined;
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
      factoryFiles,
    },
  });

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
    message: `Hermes task ${task.id} · ${liveEvent.eventType} · Sent=0`,
  };
}
