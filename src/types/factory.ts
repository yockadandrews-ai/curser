export interface AppDefinition {
  appName: string;
  oneLinePromise: string;
  targetCustomer: string;
  coreProblem: string;
  aiDoes: string[];
  differentiator: string;
  successMetric: string;
  suggestedPricing: string;
  liquidGlassNote?: string;
  technicalNotes: string;
}

export interface SalesProposal {
  title: string;
  type: 'single' | 'suite';
  appName?: string;
  markdown: string;
}

export interface QualityCheck {
  explainUnder20Sec: boolean;
  measurableOutcome: boolean;
  pricingJustified: boolean;
  wouldBuy: boolean;
  languageCurrent: boolean;
  passed: boolean;
  notes?: string;
}

export interface DailyRun {
  id: string;
  date: string;
  theme: string;
  clusterName: string;
  folderPath: string;
  apps: AppDefinition[];
  proposals: SalesProposal[];
  qualityChecks: QualityCheck[];
  qualityPassed: boolean;
  createdAt: string;
}

export interface FactoryThemesResponse {
  themes: string[];
  suggestedToday: string;
}
