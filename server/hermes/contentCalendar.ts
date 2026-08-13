/**
 * Content Factory calendar — Build Weekends, Launch Tuesdays, Receipt Fridays, Bundle day
 * Generates .ics + Google Calendar template metadata (no OAuth).
 */

import type { CalendarEventSchema, ContentCalendarPlan, ContentSprintDefinition } from '../schemas/calendarEvents.js';
import { getProductsFrom, type ContentProductSchema } from '../data/contentProducts.js';

const TZ = process.env.APPROVAL_REMINDER_TZ || process.env.HERMES_CALENDAR_TZ || 'America/New_York';
const APP_BASE = (process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Next Saturday on or after startDate */
function nextSaturday(startDate: string): string {
  const d = new Date(`${startDate}T12:00:00`);
  const day = d.getDay();
  const add = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

function nextTuesday(fromDate: string): string {
  const d = new Date(`${fromDate}T12:00:00`);
  const day = d.getDay();
  const add = day <= 2 ? 2 - day : 9 - day;
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

function nextFriday(fromDate: string): string {
  const d = new Date(`${fromDate}T12:00:00`);
  const day = d.getDay();
  const add = day <= 5 ? 5 - day : 12 - day;
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

function eventTimes(date: string, startHour: number, startMin: number, durationMin: number) {
  const start = new Date(`${date}T${pad(startHour)}:${pad(startMin)}:00`);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function buildSprintForProduct(product: ContentProductSchema, sprintAnchorSaturday: string): ContentSprintDefinition {
  const buildStart = sprintAnchorSaturday;
  const buildEnd = addDays(buildStart, 1);
  const launch = nextTuesday(addDays(buildEnd, 1));
  const receipt = nextFriday(launch);
  const reel1 = eventTimes(launch, 9, 0, 30).startIso;
  const reel2 = eventTimes(launch, 12, 0, 30).startIso;
  const reel3 = eventTimes(launch, 17, 0, 30).startIso;
  const review = eventTimes(launch, 20, 0, 45).startIso;

  return {
    slug: product.slug,
    name: product.name,
    buildWeekendStart: buildStart,
    launchTuesday: launch,
    receiptFriday: receipt,
    bundleDay: product.slug === 'growth-compass' ? addDays(receipt, 2) : undefined,
    reelSlots: [reel1, reel2, reel3],
    dayReview: review,
  };
}

export function generateContentCalendarPlan(options: {
  startFromSlug?: string;
  anchorDate?: string;
  weeksBetweenSprints?: number;
} = {}): ContentCalendarPlan {
  const products = getProductsFrom(options.startFromSlug || 'gas-station');
  const anchor = options.anchorDate || new Date().toISOString().slice(0, 10);
  const gapWeeks = options.weeksBetweenSprints ?? 2;

  let saturday = nextSaturday(anchor);
  const sprints: ContentSprintDefinition[] = [];
  const events: CalendarEventSchema[] = [];

  for (const product of products) {
    const sprint = buildSprintForProduct(product, saturday);
    sprints.push(sprint);

    const buildTimes = eventTimes(sprint.buildWeekendStart, 10, 0, 120);
    events.push({
      uid: `hermes-build-${product.slug}@sgos`,
      eventType: 'build_weekend',
      summary: `BUILD · ${product.name}`,
      description: [
        `Hermes → PDF Sprint agent`,
        `Outputs: ${product.buildOutputs.join(', ')}`,
        `Vault: ${product.vaultFolder}`,
        `Owner: A.D. · Proof: vault link · Sent=0`,
        `${APP_BASE}/hermes`,
      ].join('\\n'),
      ...buildTimes,
      timezone: TZ,
      productSlug: product.slug,
      productName: product.name,
      lane: 'Revenue',
      owner: 'A.D.',
      proof: 'Vault folder URL',
      doneWhen: product.buildOutputs.join(', '),
      url: `${APP_BASE}/hermes`,
      hermesTaskKind: 'content',
      riskTag: 'AURELIUS-P1',
      valarmMinutesBefore: 30,
    });

    events.push({
      uid: `hermes-build-d2-${product.slug}@sgos`,
      eventType: 'build_weekend',
      summary: `BUILD (Day 2) · ${product.name}`,
      description: `Continue PDF sprint · Gumroad copy · Receipt template`,
      ...eventTimes(addDays(sprint.buildWeekendStart, 1), 10, 0, 120),
      timezone: TZ,
      productSlug: product.slug,
      productName: product.name,
      lane: 'Revenue',
      owner: 'A.D.',
      hermesTaskKind: 'content',
      riskTag: 'AURELIUS-P1',
    });

    sprint.reelSlots.forEach((slotIso, i) => {
      const idx = (i + 1) as 1 | 2 | 3;
      const start = new Date(slotIso);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      events.push({
        uid: `hermes-reel-${product.slug}-${idx}@sgos`,
        eventType: 'reel_slot',
        summary: `REEL ${idx} · ${product.name}`,
        description: [
          `Hook: ${product.reelHooks[i] || product.reelHooks[0]}`,
          `Platforms: ${product.platforms.join(', ')}`,
          `APPROVAL required before publish`,
          `${APP_BASE}/approve`,
        ].join('\\n'),
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        timezone: TZ,
        productSlug: product.slug,
        productName: product.name,
        reelIndex: idx,
        lane: 'Revenue',
        owner: 'A.D.',
        proof: 'Post URL after manual publish',
        doneWhen: 'Reel script + caption in vault; APPROVAL brief created',
        url: `${APP_BASE}/approve`,
        hermesTaskKind: 'content',
        riskTag: 'AURELIUS-P0',
        valarmMinutesBefore: 15,
      });
    });

    events.push({
      uid: `hermes-launch-review-${product.slug}@sgos`,
      eventType: 'day_review',
      summary: `DAY REVIEW · Launch ${product.name}`,
      description: `Review 3 reels + captions · Create APPROVAL events · Sent=0`,
      startIso: sprint.dayReview,
      endIso: new Date(new Date(sprint.dayReview).getTime() + 45 * 60 * 1000).toISOString(),
      timezone: TZ,
      productSlug: product.slug,
      lane: 'Integrity',
      owner: 'A.D.',
      hermesTaskKind: 'governance',
      riskTag: 'SPECTRA-REVIEW',
    });

    events.push({
      uid: `hermes-receipt-${product.slug}@sgos`,
      eventType: 'receipt_friday',
      summary: `RECEIPT · ${product.name}`,
      description: `Auto-draft receipt reel from Ledger · ${product.receiptMetric}`,
      ...eventTimes(sprint.receiptFriday, 11, 0, 60),
      timezone: TZ,
      productSlug: product.slug,
      lane: 'Integrity',
      owner: 'A.D.',
      hermesTaskKind: 'impact',
      riskTag: 'AURELIUS-P1',
    });

    if (sprint.bundleDay) {
      events.push({
        uid: `hermes-bundle-growth-compass@sgos`,
        eventType: 'bundle_day',
        summary: 'BUNDLE DAY · Growth Compass',
        description: 'Capstone bundle launch · all verticals · master receipt',
        ...eventTimes(sprint.bundleDay, 10, 0, 180),
        timezone: TZ,
        productSlug: 'growth-compass',
        lane: 'P0',
        owner: 'A.D.',
        hermesTaskKind: 'content',
        riskTag: 'AURELIUS-P0',
      });
    }

    events.push({
      uid: `hermes-approval-${product.slug}-launch@sgos`,
      eventType: 'approval',
      summary: `APPROVAL · ${product.name} Launch Pack`,
      description: `Founder gate · Approve/Reject/Modify on Notion brief · No auto-publish`,
      ...eventTimes(sprint.launchTuesday, 8, 0, 30),
      timezone: TZ,
      productSlug: product.slug,
      lane: 'P0',
      owner: 'A.D.',
      proof: 'Brief URL + founder decision',
      doneWhen: 'Approve recorded before any n8n publish handoff',
      url: `${APP_BASE}/approve`,
      hermesTaskKind: 'governance',
      riskTag: 'AURELIUS-P0',
      valarmMinutesBefore: 15,
    });

    saturday = addDays(saturday, gapWeeks * 7);
  }

  return {
    timezone: TZ,
    generatedAt: new Date().toISOString(),
    sprintStart: anchor,
    products: sprints,
    events,
    googleCalendarNote:
      'Import content-calendar.ics into primary calendar (same TZ as Founder Stack). No OAuth — one-time import or subscribe via .ics URL.',
  };
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildContentCalendarIcs(plan: ContentCalendarPlan): string {
  const stamp = formatIcsUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SGOS Hermes//Content Factory Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SGOS Content Factory',
    `X-WR-TIMEZONE:${plan.timezone}`,
  ];

  for (const ev of plan.events) {
    const start = new Date(ev.startIso);
    const end = new Date(ev.endIso);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${formatIcsUtc(start)}`);
    lines.push(`DTEND:${formatIcsUtc(end)}`);
    lines.push(`SUMMARY:${escapeIcs(ev.summary)}`);
    lines.push(`DESCRIPTION:${escapeIcs(ev.description.replace(/\\n/g, '\n'))}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    if (ev.valarmMinutesBefore) {
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:-PT${ev.valarmMinutesBefore}M`);
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeIcs(ev.summary)}`);
      lines.push('END:VALARM');
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function getContentCalendarGoogleLinks(plan: ContentCalendarPlan): { label: string; url: string }[] {
  return plan.events.slice(0, 20).map(ev => {
    const start = new Date(ev.startIso);
    const end = new Date(ev.endIso);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', ev.summary);
    url.searchParams.set('details', ev.description.replace(/\\n/g, '\n'));
    url.searchParams.set('dates', `${f(start)}/${f(end)}`);
    if (ev.url) url.searchParams.set('location', ev.url);
    return { label: ev.summary, url: url.toString() };
  });
}
