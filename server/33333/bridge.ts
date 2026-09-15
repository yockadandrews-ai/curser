/**
 * BRIDGE_33333 — Integration layer between 10-Workflow Blueprint (Doc 1)
 * and 33333 Control Tower (Doc 2). Element clock routing + shared ops.
 */

export type ElementBlock = 'Air' | 'Fire' | 'Water' | 'Earth' | 'Spirit' | 'Flow';

export type BridgeAction =
  | 'content_generation'
  | 'side_hustle_execution'
  | 'outreach_engagement'
  | 'publish_review'
  | 'archive_shutdown'
  | 'background_ops';

export interface ElementClockResult {
  element: ElementBlock;
  action: BridgeAction;
  isPowerTime: boolean;
  timestamp: string;
  day: number;
  dayOfWeek: number;
  hour: number;
  minute: number;
  campaign: '33333';
  etTimeLabel: string;
}

export interface ContinuityEntry {
  date: string;
  time: string;
  element: ElementBlock;
  action: string;
  detail: string;
  status: string;
}

const CONNECTION_MOVES = [
  'DM 5 warm leads from yesterday\'s post engagers',
  'Comment on 3 target prospect posts with value',
  'Send 1 Loom video to warm lead',
  'Reply to all comments on today\'s Air content',
  'Email 1 past client for referral',
] as const;

/** Parse ET wall-clock from an ISO timestamp or Date (defaults to now). */
export function getEtParts(date: Date = new Date()): { hour: number; minute: number; day: number; dayOfWeek: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';

  return {
    hour: get('hour'),
    minute: get('minute'),
    day: get('day'),
    dayOfWeek: weekdayMap[weekday] ?? 0,
  };
}

/** Elemental clock — matches BRIDGE_33333 spec (ET power windows). */
export function determineElementBlock(date: Date = new Date()): ElementClockResult {
  const { hour, minute, day, dayOfWeek } = getEtParts(date);
  const timeVal = hour * 100 + minute;

  let element: ElementBlock = 'Flow';
  let action: BridgeAction = 'background_ops';
  let isPowerTime = false;

  if (timeVal >= 700 && timeVal < 730) {
    element = 'Air';
    action = 'content_generation';
    isPowerTime = true;
  } else if (timeVal >= 1010 && timeVal < 1040) {
    element = 'Fire';
    action = 'side_hustle_execution';
    isPowerTime = true;
  } else if (timeVal >= 1422 && timeVal < 1452) {
    element = 'Water';
    action = 'outreach_engagement';
    isPowerTime = true;
  } else if (timeVal >= 1800 && timeVal < 1830) {
    element = 'Earth';
    action = 'publish_review';
    isPowerTime = true;
  } else if (timeVal >= 2133 && timeVal < 2203) {
    element = 'Spirit';
    action = 'archive_shutdown';
    isPowerTime = true;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const etTimeLabel = `${pad(hour)}:${pad(minute)}`;

  return {
    element,
    action,
    isPowerTime,
    timestamp: date.toISOString(),
    day,
    dayOfWeek,
    hour,
    minute,
    campaign: '33333',
    etTimeLabel,
  };
}

/** 33333 rule: one connection move per day (rotates by weekday). */
export function getConnectionMove(date: Date = new Date()): {
  connection_move: string;
  target_count: number;
  element: 'Water';
} {
  const { dayOfWeek } = getEtParts(date);
  const move = CONNECTION_MOVES[dayOfWeek % CONNECTION_MOVES.length];
  const target_count = move.includes('5') ? 5 : move.includes('3') ? 3 : 1;
  return { connection_move: move, target_count, element: 'Water' };
}

/** Expected daily draft payload filenames for queue check. */
export function expectedDraftPayloads(day: number): { auraflow: string; vaultverse: string } {
  return {
    auraflow: `AURAFLOW_day${day}_payload.json`,
    vaultverse: `VAULTVERSE_day${day}_payload.json`,
  };
}

export interface QueueCheckInput {
  checkDay?: number;
  triggered_by?: string;
  auraflow_exists?: boolean;
  vaultverse_exists?: boolean;
}

export interface QueueCheckResult {
  ok: boolean;
  checkDay: number;
  triggered_by: string;
  expected: ReturnType<typeof expectedDraftPayloads>;
  missing: string[];
  message: string;
}

export function runQueueCheck(input: QueueCheckInput = {}): QueueCheckResult {
  const now = new Date();
  const { day } = getEtParts(now);
  const checkDay = input.checkDay ?? day;
  const expected = expectedDraftPayloads(checkDay);
  const missing: string[] = [];

  if (input.auraflow_exists === false) missing.push(expected.auraflow);
  if (input.vaultverse_exists === false) missing.push(expected.vaultverse);

  const ok = missing.length === 0;
  return {
    ok,
    checkDay,
    triggered_by: input.triggered_by ?? 'bridge',
    expected,
    missing,
    message: ok
      ? `Queue check passed for day ${checkDay}`
      : `Missing payloads: ${missing.join(', ')}`,
  };
}

export interface LeadScoreInput {
  email: string;
  brand?: string;
  funnelStage?: string;
  utmSource?: string | null;
  revenueCents?: number;
  engagementCount?: number;
}

/** BANT-lite lead scoring for background ops. */
export function scoreLead(input: LeadScoreInput): { score: number; priority: 'hot' | 'warm' | 'cold' } {
  let score = 0;

  if (input.funnelStage === 'converted') score += 40;
  else if (input.funnelStage === 'nurtured') score += 25;
  else score += 10;

  if ((input.revenueCents ?? 0) > 0) score += 30;
  if (input.utmSource?.toLowerCase().includes('linkedin')) score += 15;
  if (input.utmSource?.toLowerCase().includes('youtube')) score += 10;
  if ((input.engagementCount ?? 0) >= 3) score += 15;

  const priority: 'hot' | 'warm' | 'cold' =
    score >= 60 ? 'hot' : score >= 35 ? 'warm' : 'cold';

  return { score, priority };
}

/** End-of-day Spirit block reflection payload. */
export function buildSpiritReflection(errors = 0): Record<string, string | number> {
  const date = new Date().toISOString().split('T')[0];
  return {
    date,
    air: 'Content generated',
    fire: 'Side hustles executed',
    water: 'Outreach completed',
    earth: 'Publishing & metrics done',
    spirit: 'Shutdown',
    errors,
    next_priority: 'Tomorrow: Execute Fire block upsells',
  };
}

/** In-memory continuity log (n8n also writes to Google Sheets). */
const continuityLog: ContinuityEntry[] = [];

export function appendContinuity(entry: Omit<ContinuityEntry, 'date'> & { date?: string }): ContinuityEntry {
  const row: ContinuityEntry = {
    date: entry.date ?? new Date().toISOString().split('T')[0],
    time: entry.time,
    element: entry.element,
    action: entry.action,
    detail: entry.detail,
    status: entry.status,
  };
  continuityLog.unshift(row);
  if (continuityLog.length > 500) continuityLog.pop();
  return row;
}

export function getContinuityReport(limit = 50): ContinuityEntry[] {
  return continuityLog.slice(0, limit);
}

/** Background ops schedule hints for n8n IF nodes. */
export function getBackgroundOpsFlags(clock: ElementClockResult): {
  runW1WeeklyBatch: boolean;
  runShortformPrep: boolean;
  runLeadScoring: boolean;
} {
  const isMonday = clock.dayOfWeek === 1;
  const atNine = clock.hour === 9 && clock.minute < 15;
  const atOnePm = clock.hour === 13 && clock.minute < 15;
  const quarterHour = clock.minute % 15 === 0;

  return {
    runW1WeeklyBatch: isMonday && atNine,
    runShortformPrep: atNine || atOnePm,
    runLeadScoring: !clock.isPowerTime && quarterHour,
  };
}
