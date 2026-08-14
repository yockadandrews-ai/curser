/**
 * Live Google Calendar events — primary calendar, America/New_York
 * Generated from sprintSchedule.ts — Hermes + n8n title matching.
 */

import {
  SPRINT_SCHEDULE,
  BUNDLE_DAY,
  getSprintByNumber,
  type SprintScheduleEntry,
} from './sprintSchedule.js';

export type LiveCalendarEventType =
  | 'build_weekend'
  | 'launch_reel_1'
  | 'launch_reel_2'
  | 'launch_reel_3_day_review'
  | 'receipt_sprint_prep'
  | 'approval'
  | 'bundle_day';

export interface LiveCalendarEvent {
  id: string;
  sprintNumber?: number;
  productId: string;
  eventType: LiveCalendarEventType;
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

function addMinutesToTime(timeEt: string, durationMin: number): string {
  const [h, m] = timeEt.split(':').map(Number);
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildSprintEvents(s: SprintScheduleEntry): LiveCalendarEvent[] {
  const n = s.sprintNumber;
  const [r1, r2, r3] = s.reelTimesEt;
  const prep = s.receiptPrepLabel ? ` + ${s.receiptPrepLabel}` : '';

  return [
    {
      id: `live-s${n}-build`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'build_weekend',
      titleMatch: `SGOS Sprint ${n} Build`,
      summary: `SGOS Sprint ${n} Build — ${s.name}`,
      startDate: s.buildStart,
      endDate: s.buildEnd,
      allDay: true,
      hermesAgent: 'content_factory',
      timezone: 'America/New_York',
    },
    {
      id: `live-s${n}-approval`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'approval',
      titleMatch: `APPROVAL · Sprint ${n}`,
      summary: `APPROVAL · Sprint ${n} · ${s.name} Launch Pack`,
      startDate: s.launchDate,
      startTimeEt: '07:30',
      endTimeEt: '08:00',
      allDay: false,
      hermesAgent: 'governance_layer',
      timezone: 'America/New_York',
    },
    {
      id: `live-s${n}-reel-1`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'launch_reel_1',
      titleMatch: `LAUNCH · Sprint ${n}`,
      summary: `LAUNCH · Sprint ${n} · ${s.name} — Reel #1`,
      startDate: s.launchDate,
      startTimeEt: r1,
      endTimeEt: addMinutesToTime(r1, 30),
      allDay: false,
      hermesAgent: 'reel_pipeline',
      timezone: 'America/New_York',
    },
    {
      id: `live-s${n}-reel-2`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'launch_reel_2',
      titleMatch: `Sprint ${n} · Reel #2`,
      summary: `LAUNCH · Sprint ${n} · Reel #2`,
      startDate: s.launchDate,
      startTimeEt: r2,
      endTimeEt: addMinutesToTime(r2, 30),
      allDay: false,
      hermesAgent: 'reel_pipeline',
      timezone: 'America/New_York',
    },
    {
      id: `live-s${n}-reel-3`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'launch_reel_3_day_review',
      titleMatch: `Sprint ${n} · Reel #3`,
      summary: `LAUNCH · Sprint ${n} · Reel #3 + Day Review`,
      startDate: s.launchDate,
      startTimeEt: r3,
      endTimeEt: addMinutesToTime(r3, 60),
      allDay: false,
      hermesAgent: 'reel_pipeline',
      timezone: 'America/New_York',
    },
    {
      id: `live-s${n}-receipt`,
      sprintNumber: n,
      productId: s.productId,
      eventType: 'receipt_sprint_prep',
      titleMatch: `Sprint ${n} Receipt`,
      summary: `SGOS Sprint ${n} Receipt${prep}`,
      startDate: s.receiptDate,
      startTimeEt: '18:00',
      endTimeEt: '19:00',
      allDay: false,
      hermesAgent: 'pulse_engine',
      timezone: 'America/New_York',
    },
  ];
}

function buildBundleEvent(): LiveCalendarEvent {
  return {
    id: 'live-bundle-growth-compass',
    productId: BUNDLE_DAY.productId,
    eventType: 'bundle_day',
    titleMatch: 'SGOS Bundle Day',
    summary: BUNDLE_DAY.summary,
    startDate: BUNDLE_DAY.date,
    startTimeEt: BUNDLE_DAY.startTimeEt,
    endTimeEt: BUNDLE_DAY.endTimeEt,
    allDay: false,
    hermesAgent: 'content_factory',
    timezone: 'America/New_York',
  };
}

export const LIVE_CALENDAR_EVENTS: LiveCalendarEvent[] = [
  ...SPRINT_SCHEDULE.flatMap(buildSprintEvents),
  buildBundleEvent(),
];

export function resolveCalendarEvent(input: {
  title: string;
  startDate?: string;
  productId?: string;
  eventType?: LiveCalendarEventType;
}): LiveCalendarEvent | undefined {
  const title = input.title.trim();

  if (input.productId && input.eventType) {
    const matches = LIVE_CALENDAR_EVENTS.filter(
      e => e.productId === input.productId && e.eventType === input.eventType,
    );
    if (input.startDate) {
      const dated = matches.find(e => e.startDate === input.startDate);
      if (dated) return dated;
    }
    return matches[0];
  }

  const sprintNum = parseSprintNumber(title);

  if (sprintNum != null) {
    if (/reel #1/i.test(title) || (/launch · sprint/i.test(title) && !/reel #/i.test(title))) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-reel-1`);
    }
    if (/reel #2/i.test(title)) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-reel-2`);
    }
    if (/reel #3/i.test(title)) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-reel-3`);
    }
    if (/build/i.test(title)) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-build`);
    }
    if (/receipt/i.test(title)) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-receipt`);
    }
    if (/approval/i.test(title)) {
      return LIVE_CALENDAR_EVENTS.find(e => e.id === `live-s${sprintNum}-approval`);
    }
  }

  if (/bundle day/i.test(title)) {
    return LIVE_CALENDAR_EVENTS.find(e => e.id === 'live-bundle-growth-compass');
  }

  const matches = LIVE_CALENDAR_EVENTS.filter(e => {
    if (!title.toLowerCase().includes(e.titleMatch.toLowerCase())) return false;
    if (input.startDate && e.startDate !== input.startDate) return false;
    return true;
  });

  if (matches.length === 1) return matches[0];
  if (matches.length > 1 && input.startDate) {
    return matches.find(e => e.startDate === input.startDate) ?? matches[0];
  }

  return matches[0];
}

function parseSprintNumber(title: string): number | null {
  const m = title.match(/sprint\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function listUpcomingLiveEvents(fromDate = new Date().toISOString().slice(0, 10)): LiveCalendarEvent[] {
  return LIVE_CALENDAR_EVENTS.filter(e => e.startDate >= fromDate);
}

export function buildLiveCalendarIcs(): string {
  const TZ = 'America/New_York';
  const APP_BASE = (process.env.APP_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const toLocal = (date: string, time: string) => {
    const [y, m, d] = date.split('-');
    const [hh, mm] = time.split(':');
    return `${y}${m}${d}T${hh}${mm}00`;
  };

  const addDay = (date: string) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SGOS Hermes//Live Sprint Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SGOS Content Sprints 2-8 + Bundle',
    `X-WR-TIMEZONE:${TZ}`,
    'BEGIN:VTIMEZONE',
    `TZID:${TZ}`,
    'END:VTIMEZONE',
  ];

  for (const ev of LIVE_CALENDAR_EVENTS) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@sgos-hermes`);
    lines.push(`DTSTAMP:${stamp}`);
    if (ev.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${ev.startDate.replace(/-/g, '')}`);
      const endExclusive = ev.endDate ? addDay(ev.endDate) : addDay(ev.startDate);
      lines.push(`DTEND;VALUE=DATE:${endExclusive}`);
    } else if (ev.startTimeEt && ev.endTimeEt) {
      lines.push(`DTSTART;TZID=${TZ}:${toLocal(ev.startDate, ev.startTimeEt)}`);
      lines.push(`DTEND;TZID=${TZ}:${toLocal(ev.startDate, ev.endTimeEt)}`);
    }
    lines.push(`SUMMARY:${ev.summary.replace(/,/g, '\\,')}`);
    lines.push(`DESCRIPTION:Hermes · ${ev.eventType} · Sent=0\\n${APP_BASE}/hermes`);
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT15M');
    lines.push('ACTION:DISPLAY');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export { getSprintByNumber, SPRINT_SCHEDULE, BUNDLE_DAY };
