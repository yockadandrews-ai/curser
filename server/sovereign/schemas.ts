/**
 * Sovereign Sales Autopilot — SG3 → Hermes → Ling → K3 loop schemas
 */

export type SovereignVerticalId = 'solar' | 'dental' | 'legal';

export type SovereignNode = 'sg3' | 'hermes' | 'ling' | 'k3';

export type InboundChannel = 'dm' | 'comment' | 'email' | 'application' | 'form';

export type HermesRoute = 'ling' | 'nurture' | 'archive';

export type TicketStatus =
  | 'received'
  | 'qualifying'
  | 'qualified'
  | 'nurturing'
  | 'archived'
  | 'handed_to_ling'
  | 'demo_sent'
  | 'contract_sent'
  | 'signed'
  | 'k3_deploying'
  | 'live'
  | 'closed_lost';

export interface QualifyAnswers {
  verticalMatch: boolean;
  monthlyLeadVolume?: number;
  revenueBand?: string;
  urgencyDays?: number;
  budgetConfirmed?: boolean;
  painPoint?: string;
}

export interface QualifyScoreBreakdown {
  verticalMatch: number;
  revenue: number;
  urgency: number;
  budget: number;
  total: number;
  route: HermesRoute;
}

export interface SovereignPricingTier {
  id: 'entry' | 'enterprise';
  label: string;
  priceUsd: number;
  depositPct: number;
  stripeProductHint: string;
}

export interface SovereignVerticalConfig {
  id: SovereignVerticalId;
  label: string;
  active: boolean;
  painPointDefault: string;
  crmIntegrations: string[];
  calendarIntegrations: string[];
  qualifyKeywords: string[];
  pricing: SovereignPricingTier[];
  k3TemplatePath: string;
  lingDemoScriptPath: string;
  sg3CalendarPath: string;
}

export interface HermesHandoffTicket {
  id: string;
  vertical: SovereignVerticalId;
  status: TicketStatus;
  channel: InboundChannel;
  name: string;
  email?: string;
  company?: string;
  sourceMessage?: string;
  qualifyAnswers?: QualifyAnswers;
  score?: QualifyScoreBreakdown;
  route?: HermesRoute;
  lingDemoPath?: string;
  contractSentAt?: string;
  signedAt?: string;
  k3DeploymentId?: string;
  payloadJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LingDemoPackage {
  ticketId: string;
  company: string;
  vertical: SovereignVerticalId;
  scriptMarkdown: string;
  voiceNoteObjections: string[];
  contractPackage: {
    tier: 'entry' | 'enterprise';
    priceUsd: number;
    depositUsd: number;
    stripeLinkPlaceholder: string;
    onboardingQuestionnaire: string[];
  };
}

export interface K3DeploymentResult {
  deploymentId: string;
  vertical: SovereignVerticalId;
  clientCompany: string;
  brandVoiceNotes?: string;
  simulatedConversationsPassed: number;
  simulatedConversationsTotal: number;
  liveEnvironmentUrl?: string;
  metricsFeedToSg3: {
    appointmentsBooked: number;
    hoursSaved: number;
    revenueGenerated: number;
  };
  status: 'testing' | 'live' | 'optimizing';
}

export interface Sg3Emission {
  id: string;
  type: 'case_study' | 'contrarian_thread' | 'cohort_invite';
  title: string;
  bodyMarkdown: string;
  platforms: ('linkedin' | 'twitter' | 'youtube_shorts')[];
  trigger?: string;
  scheduledAt?: string;
  sent: number;
}

export interface SovereignLoopState {
  activeVertical: SovereignVerticalId;
  pricing: SovereignPricingTier[];
  ticketsByStatus: Partial<Record<TicketStatus, number>>;
  totalTickets: number;
  liveDeployments: number;
  pendingEmissions: number;
  scannedAt: string;
}

export interface N8nSovereignHandoff {
  from: SovereignNode;
  to: SovereignNode;
  ticketId: string;
  action: string;
  payload: Record<string, unknown>;
  note: string;
}
