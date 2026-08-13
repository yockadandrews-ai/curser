/**
 * SGOS / Hermes calendar event schemas
 * Aligns with Founder Stack, APPROVAL blocks, and Content Factory sprints.
 */

export type ContentCalendarEventType =
  | 'build_weekend'
  | 'launch_tuesday'
  | 'reel_slot'
  | 'day_review'
  | 'receipt_friday'
  | 'bundle_day'
  | 'approval'
  | 'founder_stack'
  | 'field_signal_review';

export type FounderStackLane = 'P0' | 'Governance' | 'Revenue' | 'Integrity';

export interface CalendarEventSchema {
  uid: string;
  eventType: ContentCalendarEventType;
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  timezone: string;
  productSlug?: string;
  productName?: string;
  reelIndex?: 1 | 2 | 3;
  lane?: FounderStackLane;
  url?: string;
  owner?: string;
  proof?: string;
  doneWhen?: string;
  blocker?: string;
  rrule?: string;
  valarmMinutesBefore?: number;
  hermesTaskKind?: 'content' | 'field' | 'revenue' | 'governance' | 'impact';
  riskTag?: string;
}

export interface ContentSprintDefinition {
  slug: string;
  name: string;
  buildWeekendStart: string;
  launchTuesday: string;
  receiptFriday: string;
  bundleDay?: string;
  reelSlots: [string, string, string];
  dayReview: string;
}

export interface ContentCalendarPlan {
  timezone: string;
  generatedAt: string;
  sprintStart: string;
  products: ContentSprintDefinition[];
  events: CalendarEventSchema[];
  googleCalendarNote: string;
}
