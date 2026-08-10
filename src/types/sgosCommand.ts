export interface CommandConfig {
  approvalQueueUrl: string;
  pressQueueUrl: string;
  masterMapUrl: string;
  hermesStatusUrl: string;
  fieldBoardUrl: string | null;
  auditCalendarUrl: string;
  proposalStatusPath: string;
  protectedPattern: string;
}

export interface CapturedSignal {
  id: string;
  signal: string;
  parties?: string;
  priority: string;
  status: string;
  createdAt: string;
  filePath?: string;
}

export interface GovernanceStatus {
  rule: string;
  lastGenerateDate: string | null;
  sentTotal: number;
  draftedTotal: number;
  approvedTotal: number;
  hermesProofP0: string;
  readinessNote: string;
  masterMapUrl: string;
  hermesStatusUrl: string;
  scannedAt: string;
}

export interface MetricsPulse {
  affiliateProducts: number;
  notionTools: number;
  proposalDrafts: number;
  proposalsSent: number;
  lastGenerateDate: string | null;
  capturedSignals: number;
  scannedAt: string;
}

export interface TeslaPrepResult {
  ok: boolean;
  sentryEnabled: boolean;
  loggedAt: string;
  note: string;
}

export interface CommandMenuItem {
  id: string;
  order: number;
  requiresConfirmation: boolean;
  optional?: boolean;
}
