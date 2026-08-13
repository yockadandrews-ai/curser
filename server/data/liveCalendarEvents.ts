/**
 * Live Google Calendar events — primary calendar, America/New_York
 * Hermes + n8n match incoming event titles against these patterns.
 */

export type LiveCalendarEventType =
  | 'build_weekend'
  | 'launch_reel_1'
  | 'launch_reel_2'
  | 'launch_reel_3_day_review'
  | 'receipt_sprint_prep'
  | 'approval';

export interface LiveCalendarEvent {
  id: string;
  productId: string;
  eventType: LiveCalendarEventType;
  /** Substring or regex string matched against Google Calendar event title */
  titleMatch: string;
  summary: string;
  startDate: string;
  endDate?: string;
  startTimeEt?: string;
  endTimeEt?: string;
  allDay: boolean;
  hermesAgent: 'content_factory' | 'reel_pipeline' | 'pulse_engine' | 'governance_layer';
  timezone: 'America/New_York';
}

export const LIVE_CALENDAR_EVENTS: LiveCalendarEvent[] = [
  {
    id: 'live-s2-build',
    productId: 'sprint-2-gas-station',
    eventType: 'build_weekend',
    titleMatch: 'SGOS Sprint 2 Build',
    summary: 'SGOS Sprint 2 Build — Gas Station Snack Rankings',
    startDate: '2026-08-16',
    endDate: '2026-08-17',
    allDay: true,
    hermesAgent: 'content_factory',
    timezone: 'America/New_York',
  },
  {
    id: 'live-s2-reel-1',
    productId: 'sprint-2-gas-station',
    eventType: 'launch_reel_1',
    titleMatch: 'LAUNCH · Sprint 2',
    summary: 'LAUNCH · Sprint 2 · Gas Station Snack Rankings — Reel #1',
    startDate: '2026-08-19',
    startTimeEt: '08:00',
    endTimeEt: '08:30',
    allDay: false,
    hermesAgent: 'reel_pipeline',
    timezone: 'America/New_York',
  },
  {
    id: 'live-s2-reel-2',
    productId: 'sprint-2-gas-station',
    eventType: 'launch_reel_2',
    titleMatch: 'Reel #2',
    summary: 'LAUNCH · Sprint 2 · Reel #2',
    startDate: '2026-08-19',
    startTimeEt: '12:00',
    endTimeEt: '12:30',
    allDay: false,
    hermesAgent: 'reel_pipeline',
    timezone: 'America/New_York',
  },
  {
    id: 'live-s2-reel-3',
    productId: 'sprint-2-gas-station',
    eventType: 'launch_reel_3_day_review',
    titleMatch: 'Reel #3',
    summary: 'LAUNCH · Sprint 2 · Reel #3 + Day Review',
    startDate: '2026-08-19',
    startTimeEt: '18:00',
    endTimeEt: '19:00',
    allDay: false,
    hermesAgent: 'reel_pipeline',
    timezone: 'America/New_York',
  },
  {
    id: 'live-s2-receipt',
    productId: 'sprint-2-gas-station',
    eventType: 'receipt_sprint_prep',
    titleMatch: 'Sprint 2 Receipt',
    summary: 'SGOS Sprint 2 Receipt + Sprint 3 Prep',
    startDate: '2026-08-21',
    startTimeEt: '18:00',
    endTimeEt: '19:00',
    allDay: false,
    hermesAgent: 'pulse_engine',
    timezone: 'America/New_York',
  },
  {
    id: 'live-s3-build',
    productId: 'sprint-3-too-late',
    eventType: 'build_weekend',
    titleMatch: 'SGOS Sprint 3 Build',
    summary: 'SGOS Sprint 3 Build — Too Late to Reply? Flowchart',
    startDate: '2026-08-23',
    endDate: '2026-08-24',
    allDay: true,
    hermesAgent: 'content_factory',
    timezone: 'America/New_York',
  },
];

export function resolveCalendarEvent(input: {
  title: string;
  startDate?: string;
  productId?: string;
  eventType?: LiveCalendarEventType;
}): LiveCalendarEvent | undefined {
  const title = input.title.trim();

  if (input.productId && input.eventType) {
    return LIVE_CALENDAR_EVENTS.find(
      e => e.productId === input.productId && e.eventType === input.eventType,
    );
  }

  const matches = LIVE_CALENDAR_EVENTS.filter(e => {
    if (!title.toLowerCase().includes(e.titleMatch.toLowerCase())) return false;
    if (input.startDate && e.startDate !== input.startDate) return false;
    return true;
  });

  if (matches.length === 1) return matches[0];

  // Reel #2 / #3 disambiguation on same day
  if (/reel #2/i.test(title)) return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s2-reel-2');
  if (/reel #3/i.test(title)) return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s2-reel-3');
  if (/sprint 2 build/i.test(title)) return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s2-build');
  if (/sprint 3 build/i.test(title)) return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s3-build');
  if (/sprint 2 receipt/i.test(title)) return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s2-receipt');
  if (/launch · sprint 2/i.test(title) && !/reel #/i.test(title)) {
    return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-s2-reel-1');
  }

  return matches[0];
}

export function listUpcomingLiveEvents(fromDate = new Date().toISOString().slice(0, 10)): LiveCalendarEvent[] {
  return LIVE_CALENDAR_EVENTS.filter(e => e.startDate >= fromDate);
}
