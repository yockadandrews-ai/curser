/**
 * Hermes Content Factory — minimal viable task schema (Goldie → SGOS)
 */

export type ContentFactoryTrigger = 'calendar_event' | 'manual' | 'hermes_schedule' | 'n8n';

export interface ContentFactoryTaskInput {
  productId: string;
  schema: Record<string, unknown>;
  priorPerformance?: {
    views?: number;
    sales?: number;
    receiptPosts?: number;
    source?: string;
  };
  trigger: ContentFactoryTrigger;
  calendarEventId?: string;
}

export interface ContentFactoryTaskOutput {
  reelScripts: [string, string, string];
  captions: [string, string, string];
  gumroadDescription: string;
  receiptTemplate: string;
  assetsFolder: string;
  pdfOutline?: string;
}

export interface ContentFactoryGates {
  humanApproval: true;
  proofRequired: ['exported_pdf', 'scripts_in_vault'];
}

export interface ContentFactoryOnApprove {
  scheduleOrNotifyPublish: true;
  logToChaosLedger: true;
  updateProductStatus: 'live' | 'awaiting_approval';
}

/** Canonical MV schema — n8n + Cursor autopilot layer */
export const CONTENT_FACTORY_TASK_SCHEMA = {
  task: 'content_factory' as const,
  trigger: ['calendar_event', 'manual', 'hermes_schedule', 'n8n'] as ContentFactoryTrigger[],
  inputs: {
    product_id: 'string',
    schema: 'object',
    prior_performance: 'optional',
  },
  outputs: {
    reel_scripts: 3,
    captions: 3,
    gumroad_description: 'string',
    receipt_template: 'string',
    assets_folder: 'drive_or_vault_path',
  },
  gates: {
    human_approval: true,
    proof: ['exported_pdf', 'scripts_in_vault'],
  },
  on_approve: {
    schedule_or_notify_publish: true,
    log_to_chaos_ledger: true,
    update_product_status: 'live',
  },
} as const;

export const HERMES_HANDOFF_RULES = [
  'Every content task must produce a Notion decision brief before any external post.',
  'Every sale or engagement snapshot must write a row to Chaos Ledger with attribution.',
  'Daily Founder Stack remains the single place A.D. records proof.',
  'Hermes never holds live social credentials for unattended posting.',
] as const;
