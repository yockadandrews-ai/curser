/**
 * Calendar helpers — .ics download + Google Calendar links
 * Cannot auto-add to calendar without OAuth; one-click subscribe/download instead.
 */

import type { ProposalDraftRecord } from './proposalStatus.js';

const APP_BASE = (process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');
const REVIEW_HOUR = parseInt(process.env.APPROVAL_REMINDER_HOUR || '9', 10);
const REVIEW_MINUTE = parseInt(process.env.APPROVAL_REMINDER_MINUTE || '0', 10);
const TZ = process.env.APPROVAL_REMINDER_TZ || 'America/New_York';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatGoogleDates(start: Date, end: Date): string {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  return `${f(start)}/${f(end)}`;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function nextReviewStart(from = new Date()): Date {
  const d = new Date(from);
  d.setHours(REVIEW_HOUR, REVIEW_MINUTE, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}

export interface CalendarLinks {
  approveUrl: string;
  icsDailyUrl: string;
  icsSubscribeUrl: string;
  googleCalendarDailyUrl: string;
  reminderTime: string;
  timezone: string;
}

export function getApprovalCalendarLinks(): CalendarLinks {
  const start = nextReviewStart();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const title = 'SGOS — Review Approval Queue';
  const details = [
    'Review proposal drafts. Approve or decline in one tap.',
    `${APP_BASE}/approve`,
    'Nothing sends automatically. Sent=0 until you manually send with proof.',
  ].join('\\n');

  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', title);
  googleUrl.searchParams.set('details', details.replace(/\\n/g, '\n'));
  googleUrl.searchParams.set('dates', formatGoogleDates(start, end));
  googleUrl.searchParams.set('recur', 'RRULE:FREQ=DAILY');

  return {
    approveUrl: `${APP_BASE}/approve`,
    icsDailyUrl: `${APP_BASE}/api/shortcuts/calendar/daily.ics`,
    icsSubscribeUrl: `${APP_BASE}/api/shortcuts/calendar/daily.ics`,
    googleCalendarDailyUrl: googleUrl.toString(),
    reminderTime: `${pad(REVIEW_HOUR)}:${pad(REVIEW_MINUTE)}`,
    timezone: TZ,
  };
}

export function buildDailyReminderIcs(): string {
  const start = nextReviewStart();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const uid = `sgos-approval-daily@${APP_BASE.replace(/^https?:\/\//, '')}`;
  const stamp = formatIcsUtc(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SGOS Autopilot//Approval Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${TZ}`,
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZ}:${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`,
    `DTEND;TZID=${TZ}:${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${escapeIcs('SGOS — Review Approval Queue')}`,
    `DESCRIPTION:${escapeIcs(`Review drafts at ${APP_BASE}/approve — Approve or Decline. Nothing sends automatically.`)}`,
    `URL:${APP_BASE}/approve`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:SGOS approval review in 15 min',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildBatchReviewIcs(draft: ProposalDraftRecord): string {
  const batchDate = draft.batchDate;
  const [y, m, d] = batchDate.split('-').map(Number);
  const start = new Date(y, m - 1, d, REVIEW_HOUR, REVIEW_MINUTE, 0);
  if (start < new Date()) {
    const tomorrow = nextReviewStart();
    start.setTime(tomorrow.getTime());
  }
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const stamp = formatIcsUtc(new Date());
  const uid = `sgos-batch-${draft.id}@autopilot`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SGOS Autopilot//Batch Review//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(`Review proposals: ${draft.folderPath}`)}`,
    `DESCRIPTION:${escapeIcs(`${draft.proposalCount} proposals · ${draft.appCount} apps\\nApprove: ${APP_BASE}/approve\\nSent stays 0 until manual send.`)}`,
    `URL:${APP_BASE}/approve`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function getBatchGoogleCalendarUrl(draft: ProposalDraftRecord): string {
  const start = nextReviewStart();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `Review proposals: ${draft.folderPath}`);
  url.searchParams.set(
    'details',
    `${draft.proposalCount} proposals · ${draft.appCount} apps\nApprove at ${APP_BASE}/approve`,
  );
  url.searchParams.set('dates', formatGoogleDates(start, end));
  return url.toString();
}
