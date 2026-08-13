export type HermesTaskKind = 'content' | 'field' | 'revenue' | 'governance' | 'impact';

export type HermesTaskStatus =
  | 'received' | 'classified' | 'routed' | 'drafting' | 'draft_ready'
  | 'awaiting_approval' | 'approved' | 'rejected' | 'modified' | 'executed' | 'failed' | 'cancelled';

export type HermesAgentId =
  | 'hermes_supervisor' | 'content_factory' | 'pdf_sprint' | 'reel_pipeline'
  | 'field_decoder' | 'impact_allocator' | 'pulse_engine' | 'governance_layer'
  | 'publish_router' | 'equinox_router';

export type RiskTag = 'AURELIUS-P0' | 'AURELIUS-P1' | 'AURELIUS-P2' | 'SPECTRA-REVIEW' | 'EQUINOX-ROUTE';

export interface HermesTaskRecord {
  id: string;
  kind: HermesTaskKind;
  status: HermesTaskStatus;
  agentId: HermesAgentId;
  source: string;
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
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
}

export interface HermesAgentDefinition {
  id: HermesAgentId;
  name: string;
  layer: string;
  description: string;
  acceptsKinds: HermesTaskKind[];
  canExecuteExternally: false;
  outputs: string[];
}

export interface HermesStateSnapshot {
  governance: { rule: string; humanGateActions: string[]; neverHoldsLiveCredentials: boolean };
  agents: HermesAgentDefinition[];
  tasksByStatus: Partial<Record<HermesTaskStatus, number>>;
  awaitingApproval: number;
  executedTotal: number;
  ledgerRows: number;
  activeSprint?: string;
  scannedAt: string;
}

export interface N8nHandoffPayload {
  workflow: string;
  taskId: string;
  productSlug?: string;
  platforms?: string[];
  vaultPath?: string;
  briefPath?: string;
  approvedAt: string;
  proofRequired: true;
  note: string;
}

export interface ContentCalendarPlan {
  timezone: string;
  generatedAt: string;
  sprintStart: string;
  products: unknown[];
  events: unknown[];
  googleCalendarNote: string;
}

export interface NotionBriefTemplate {
  id: string;
  title: string;
  productSlug?: string;
  status: string;
  approvalRequired: boolean;
  owner: string;
}

export interface ChaosLedgerRow {
  id: string;
  kind: string;
  taskId?: string;
  agentId?: string;
  actor: string;
  summary: string;
  attribution: string;
  sent: number;
  createdAt: string;
}

export interface HermesDecisionResult {
  task: HermesTaskRecord;
  handoff?: N8nHandoffPayload;
  blocked?: string;
}

export interface HermesIngestResult {
  task: HermesTaskRecord;
}
