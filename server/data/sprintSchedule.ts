/**
 * Sprint schedule — canonical dates aligned with primary Google Calendar (ET)
 * 2-week cadence: Build Sat–Sun → Launch Tue (3 reels) → Receipt Fri
 */

export interface SprintScheduleEntry {
  sprintNumber: number;
  productId: string;
  name: string;
  buildStart: string;
  buildEnd: string;
  launchDate: string;
  receiptDate: string;
  reelTimesEt: [string, string, string];
  receiptPrepLabel?: string;
}

export const SPRINT_SCHEDULE: SprintScheduleEntry[] = [
  {
    sprintNumber: 2,
    productId: 'sprint-2-gas-station',
    name: 'Gas Station Snack Rankings',
    buildStart: '2026-08-16',
    buildEnd: '2026-08-17',
    launchDate: '2026-08-19',
    receiptDate: '2026-08-21',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 3 Prep',
  },
  {
    sprintNumber: 3,
    productId: 'sprint-3-too-late',
    name: 'Is It Too Late to Reply? Flowchart',
    buildStart: '2026-08-23',
    buildEnd: '2026-08-24',
    launchDate: '2026-08-26',
    receiptDate: '2026-08-28',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 4 Prep',
  },
  {
    sprintNumber: 4,
    productId: 'sprint-4-memory-jogger',
    name: 'Memory Jogger PDF',
    buildStart: '2026-08-30',
    buildEnd: '2026-08-31',
    launchDate: '2026-09-02',
    receiptDate: '2026-09-04',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 5 Prep',
  },
  {
    sprintNumber: 5,
    productId: 'sprint-5-receipt-reel',
    name: 'Receipt Reel Template Pack',
    buildStart: '2026-09-06',
    buildEnd: '2026-09-07',
    launchDate: '2026-09-09',
    receiptDate: '2026-09-11',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 6 Prep',
  },
  {
    sprintNumber: 6,
    productId: 'sprint-6-margin-map',
    name: 'Margin Map Workbook',
    buildStart: '2026-09-13',
    buildEnd: '2026-09-14',
    launchDate: '2026-09-16',
    receiptDate: '2026-09-18',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 7 Prep',
  },
  {
    sprintNumber: 7,
    productId: 'sprint-7-trust-vault',
    name: 'Trust Vault Checklist',
    buildStart: '2026-09-20',
    buildEnd: '2026-09-21',
    launchDate: '2026-09-23',
    receiptDate: '2026-09-25',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Sprint 8 Prep',
  },
  {
    sprintNumber: 8,
    productId: 'sprint-8-ops-pulse',
    name: 'Ops Pulse Dashboard',
    buildStart: '2026-09-27',
    buildEnd: '2026-09-28',
    launchDate: '2026-09-30',
    receiptDate: '2026-10-02',
    reelTimesEt: ['08:00', '12:00', '18:00'],
    receiptPrepLabel: 'Bundle Prep',
  },
];

export const BUNDLE_DAY = {
  productId: 'bundle-growth-compass',
  name: 'Growth Compass Bundle',
  date: '2026-10-04',
  startTimeEt: '10:00',
  endTimeEt: '13:00',
  summary: 'SGOS Bundle Day · Growth Compass — all 8 PDFs capstone launch',
};

export function getSprintByNumber(n: number): SprintScheduleEntry | undefined {
  return SPRINT_SCHEDULE.find(s => s.sprintNumber === n);
}

export function getSprintByProductId(productId: string): SprintScheduleEntry | undefined {
  return SPRINT_SCHEDULE.find(s => s.productId === productId);
}
