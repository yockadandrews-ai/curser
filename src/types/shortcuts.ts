export type DraftStatus = 'DRAFTED' | 'APPROVED' | 'REJECTED' | 'SENT';

export interface ProposalDraftRecord {
  id: string;
  folderPath: string;
  batchDate: string;
  proposalCount: number;
  appCount: number;
  status: DraftStatus;
  sent: number;
  approvedAt?: string;
  approvedBy?: string;
  proofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalStatusReport {
  rule: string;
  lastGenerateDate: string | null;
  lastFolder: string | null;
  packages: Array<{
    folderPath: string;
    batchDate: string;
    type: string;
    proposalCount: number;
    appCount: number;
    proposalsFullCount: number;
    status: DraftStatus;
    sent: number;
    manifestPath?: string;
  }>;
  approvalQueue: ProposalDraftRecord[];
  sentTotal: number;
  draftedTotal: number;
  approvedTotal: number;
  todayTheme: string;
  outputRoot: string;
  scannedAt: string;
}

export interface GenerateTodayResult {
  folderPath: string;
  batchDate: string;
  status: 'DRAFTED';
  sent: 0;
  proposalCount: number;
  appCount: number;
  proposalsFullExpanded: number;
  draft: ProposalDraftRecord;
  confirmation: string;
}
