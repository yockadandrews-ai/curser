/**
 * Hermes — supervisor task & agent schemas
 * Sovereignty: draft free, external action gated, full Chaos Ledger attribution.
 */

export const HERMES_GOVERNANCE = {
  rule:
    'Hermes orchestrates drafts and routing only. No irreversible external action without founder approval recorded on brief + proof.',
  humanGateActions: [
    'publish_social',
    'send_email',
    'send_dm',
    'spend_funds',
    'impact_allocate',
    'n8n_publish_fanout',
  ] as const,
  neverHoldsLiveCredentials: true,
  sentZeroUntilProof: true,
  attributionRequired: true,
} as const;

export type HermesTaskKind = 'content' | 'field' | 'revenue' | 'governance' | 'impact';

export type HermesTaskStatus =
  | 'received'
  | 'classified'
  | 'routed'
  | 'drafting'
  | 'draft_ready'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'modified'
  | 'executed'
  | 'failed'
  | 'cancelled';

export type HermesAgentId =
  | 'hermes_supervisor'
  | 'content_factory'
  | 'pdf_sprint'
  | 'reel_pipeline'
  | 'field_decoder'
  | 'impact_allocator'
  | 'pulse_engine'
  | 'governance_layer'
  | 'publish_router'
  | 'equinox_router';

export type HermesSignalSource =
  | 'calendar'
  | 'webhook'
  | 'notion_button'
  | 'gumroad_sale'
  | 'field_batch'
  | 'founder_stack'
  | 'manual'
  | 'n8n';

export type RiskTag =
  | 'AURELIUS-P0'
  | 'AURELIUS-P1'
  | 'AURELIUS-P2'
  | 'SPECTRA-REVIEW'
  | 'EQUINOX-ROUTE';

export type FounderDecision = 'approve' | 'reject' | 'modify';

export interface HermesTaskRecord {
  id: string;
  kind: HermesTaskKind;
  status: HermesTaskStatus;
  agentId: HermesAgentId;
  source: HermesSignalSource;
  title: string;
  summary: string;
  productSlug?: string;
  platform?: string;
  riskTags: RiskTag[];
  owner: string;
  proofRequired: boolean;
  sent: number;
  briefPath?: string;
  vaultPath?: string;
  calendarEventUid?: string;
  approvalEventUid?: string;
  notionBriefId?: string;
  founderNotes?: string;
  proofUrl?: string;
  payloadJson?: string;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
}

export interface HermesAgentDefinition {
  id: HermesAgentId;
  name: string;
  layer: 'content' | 'governance' | 'impact' | 'supervisor';
  description: string;
  acceptsKinds: HermesTaskKind[];
  canExecuteExternally: false;
  outputs: ('markdown_draft' | 'notion_brief' | 'calendar_event' | 'ledger_row' | 'n8n_handoff')[];
}

export const HERMES_AGENTS: HermesAgentDefinition[] = [
  {
    id: 'hermes_supervisor',
    name: 'Hermes Supervisor',
    layer: 'supervisor',
    description: 'Classifies signals, routes tasks, enforces gates, owns schedule hand-offs.',
    acceptsKinds: ['content', 'field', 'revenue', 'governance', 'impact'],
    canExecuteExternally: false,
    outputs: ['calendar_event', 'ledger_row', 'n8n_handoff'],
  },
  {
    id: 'content_factory',
    name: 'Content Factory',
    layer: 'content',
    description: 'Goldie-mapped prompt + schema → captions, scripts, Gumroad copy (Julian Goldie router equivalent).',
    acceptsKinds: ['content'],
    canExecuteExternally: false,
    outputs: ['markdown_draft', 'notion_brief'],
  },
  {
    id: 'pdf_sprint',
    name: 'PDF Sprint Builder',
    layer: 'content',
    description: 'Build Weekend → product PDF assets, receipt templates, vault folder structure.',
    acceptsKinds: ['content'],
    canExecuteExternally: false,
    outputs: ['markdown_draft', 'notion_brief'],
  },
  {
    id: 'reel_pipeline',
    name: 'Reel Pipeline',
    layer: 'content',
    description: 'Launch Tuesday → three Reel scripts + platform-specific captions.',
    acceptsKinds: ['content'],
    canExecuteExternally: false,
    outputs: ['markdown_draft', 'notion_brief'],
  },
  {
    id: 'equinox_router',
    name: 'EQUINOX Router',
    layer: 'governance',
    description: 'Platform + content-type routing (X/IG/FB/LI/etc.) — publish only after approval.',
    acceptsKinds: ['content', 'governance'],
    canExecuteExternally: false,
    outputs: ['n8n_handoff', 'notion_brief'],
  },
  {
    id: 'field_decoder',
    name: 'Field Signals Decoder',
    layer: 'governance',
    description: 'PULSAR-style batch decode → Founder Stack escalation on high-confidence patterns.',
    acceptsKinds: ['field', 'governance'],
    canExecuteExternally: false,
    outputs: ['markdown_draft', 'notion_brief', 'ledger_row'],
  },
  {
    id: 'pulse_engine',
    name: 'Pulse Engine',
    layer: 'impact',
    description: 'Revenue events → vertical impact split + public receipt draft.',
    acceptsKinds: ['revenue', 'impact'],
    canExecuteExternally: false,
    outputs: ['markdown_draft', 'ledger_row'],
  },
  {
    id: 'impact_allocator',
    name: 'Impact Allocator',
    layer: 'impact',
    description: '5-Gem portfolio routing — food / water / energy / ops attribution.',
    acceptsKinds: ['impact', 'revenue'],
    canExecuteExternally: false,
    outputs: ['ledger_row', 'notion_brief'],
  },
  {
    id: 'governance_layer',
    name: 'Governance Layer',
    layer: 'governance',
    description: 'AURELIUS risk tags, Daily Founder Stack lanes, approval brief creation.',
    acceptsKinds: ['governance', 'content', 'field'],
    canExecuteExternally: false,
    outputs: ['notion_brief', 'calendar_event'],
  },
  {
    id: 'publish_router',
    name: 'Publishing Router',
    layer: 'content',
    description: 'Post-approval n8n fan-out handoff — never holds unattended live credentials.',
    acceptsKinds: ['content'],
    canExecuteExternally: false,
    outputs: ['n8n_handoff'],
  },
];

export interface HermesStateSnapshot {
  governance: typeof HERMES_GOVERNANCE;
  agents: HermesAgentDefinition[];
  tasksByStatus: Record<HermesTaskStatus, number>;
  awaitingApproval: number;
  executedTotal: number;
  ledgerRows: number;
  activeSprint?: string;
  scannedAt: string;
}

export interface N8nHandoffPayload {
  workflow: 'sgos_publish_fanout' | 'sgos_content_draft' | 'sgos_impact_receipt';
  taskId: string;
  productSlug?: string;
  platforms?: string[];
  vaultPath?: string;
  briefPath?: string;
  approvedAt: string;
  proofRequired: true;
  note: 'Do not execute until founder approval recorded on brief';
}
