export type Brand33333 = 'vaultverse' | 'aurascript' | 'mirrorme' | 'resume' | '33333';

export type ContentStatus = 'draft' | 'approved' | 'published' | 'syndicated';

export type FunnelStage = 'captured' | 'nurtured' | 'converted' | 'churned';

export type EngagementStatus = 'pending' | 'drafted' | 'sent' | 'skipped';

export interface BrandContentRow {
  id: string;
  date: string;
  brand: Brand33333;
  keyword: string;
  status: ContentStatus;
  contentJson: string;
  platforms: string;
  leadMagnetUrl: string | null;
  publishedAt: string | null;
  engagementScore: number;
  leadsGenerated: number;
  createdAt: string;
}

export interface BrandLeadRow {
  id: string;
  email: string;
  brand: Brand33333;
  leadMagnet: string;
  utmSource: string | null;
  funnelStage: FunnelStage;
  capturedAt: string;
  convertedAt: string | null;
  revenueCents: number;
}

export interface EngagementRow {
  id: string;
  brand: Brand33333;
  platform: string;
  message: string;
  replyDraft: string | null;
  status: EngagementStatus;
  sessionId: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface RevenueEventRow {
  id: string;
  transactionId: string;
  grossCents: number;
  brand: Brand33333;
  product: string;
  source: string;
  utmCampaign: string | null;
  createdAt: string;
}

export interface PublishRequest {
  brand: Brand33333;
  content: Record<string, unknown> | string;
  platforms: string[];
  leadMagnetUrl?: string;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postUrl?: string;
  caption?: string;
  error?: string;
}

export interface SyndicateRequest {
  content_id: string;
  platforms: string[];
  format?: string;
}
