const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getStats: () => request<import('./types').Stats>('/stats'),
  getActivity: (limit = 50) => request<import('./types').Activity[]>(`/activity?limit=${limit}`),

  getProducts: (filters?: { type?: string; brand?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.brand) params.set('brand', filters.brand);
    const qs = params.toString();
    return request<import('./types').Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getNotionTools: () => request<import('./types').NotionTool[]>('/notion-tools'),
  getNotionInventory: () => request<import('./types').NotionInventory>('/notion-tools/inventory'),
  addNotionTool: (data: { name: string; description?: string; category?: string; sellPrice?: number | null; cost?: number | null; stock?: number; notionUrl?: string }) =>
    request<import('./types').NotionTool>('/notion-tools', { method: 'POST', body: JSON.stringify(data) }),
  importNotionTools: (names: string[]) =>
    request<{ imported: number; tools: import('./types').NotionTool[] }>('/notion-tools/import', {
      method: 'POST', body: JSON.stringify({ names }),
    }),
  seedNotionCatalog: (force = false) =>
    request<{ imported: number; total: number; skipped: number; pricesSynced: number; catalog: { factoryApps: number; kimi3Companions: number; totalTools: number }; inventory: import('./types').NotionInventory }>(
      '/notion-tools/seed-catalog', { method: 'POST', body: JSON.stringify({ force }) }
    ),
  syncNotionPrices: () =>
    request<{ pricesSynced: number; inventory: import('./types').NotionInventory }>(
      '/notion-tools/sync-prices', { method: 'POST' }
    ),
  sellNotionTool: (id: string, quantity = 1) =>
    request<{ sale: { id: string; revenue: number; profit: number }; tool: import('./types').NotionTool }>(
      `/notion-tools/${id}/sell`, { method: 'POST', body: JSON.stringify({ quantity }) }
    ),
  expandAllProposals: () =>
    request<{ results: Array<{ folder: string; expandedSingles: number; expandedSuites: number }>; totalExpanded: number }>(
      '/factory/expand-proposals', { method: 'POST' }
    ),
  getTopProducts: (limit = 5) => request<import('./types').Product[]>(`/products/top?limit=${limit}`),
  addProduct: (data: { name: string; cost: number; sellPrice: number; category?: string }) =>
    request<import('./types').Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  getSales: () => request<import('./types').Sale[]>('/sales'),
  addSale: (data: { productId: string; quantity: number }) =>
    request<{ sale: import('./types').Sale; goalAlert?: import('./types').GoalAlert }>(
      '/sales', { method: 'POST', body: JSON.stringify(data) },
    ),

  getExpenses: () => request<import('./types').Expense[]>('/expenses'),
  addExpense: (data: { description: string; amount: number }) =>
    request<import('./types').Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  getContent: () => request<import('./types').GeneratedContent[]>('/content'),
  generateContent: (productId: string, platforms?: string[], locale?: string) =>
    request<import('./types').GeneratedContent[]>('/content/generate', {
      method: 'POST',
      body: JSON.stringify({ productId, platforms, locale }),
    }),
  previewContent: (productId: string, platforms?: string[], locale?: string) =>
    request<import('./types').GeneratedContent[]>('/content/preview', {
      method: 'POST',
      body: JSON.stringify({ productId, platforms, locale }),
    }),

  discoverProducts: (niche?: string, limit = 5) =>
    request<import('./types').Product[]>('/discover', {
      method: 'POST',
      body: JSON.stringify({ niche, limit }),
    }),

  getAutopilotStatus: () => request<import('./types').AutopilotStatus>('/autopilot/status'),
  getAutopilotSettings: () => request<import('./types').AutopilotSettings>('/autopilot/settings'),
  updateAutopilotSettings: (settings: import('./types').AutopilotSettings) =>
    request<import('./types').AutopilotSettings>('/autopilot/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  runAutopilot: () =>
    request<import('./types').AutopilotStatus['lastRunResult']>('/autopilot/run', { method: 'POST' }),
  startAutopilot: () => request<import('./types').AutopilotStatus>('/autopilot/start', { method: 'POST' }),
  stopAutopilot: () => request<import('./types').AutopilotStatus>('/autopilot/stop', { method: 'POST' }),

  publishPosts: () => request<unknown[]>('/post/publish', { method: 'POST' }),
  getSocialStatus: () => request<{ mode: string; tiktok: boolean; instagram: boolean; twitter: boolean; openai: boolean }>('/post/status'),

  getFactoryThemes: () => request<import('./types/factory').FactoryThemesResponse>('/factory/themes'),
  getFactoryRuns: () => request<import('./types/factory').DailyRun[]>('/factory/runs'),
  getFactoryRun: (id: string) => request<import('./types/factory').DailyRun>(`/factory/runs/${id}`),
  runFactory: (theme?: string) =>
    request<import('./types/factory').DailyRun>('/factory/run', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    }),
  runFactoryThree: () =>
    request<import('./types/factory').MultiThemeRun>('/factory/run-three', { method: 'POST' }),
  getMultiThemeRuns: () => request<import('./types/factory').MultiThemeRun[]>('/factory/multi-runs'),

  getI18nCatalog: () => request<{ defaultLocale: string; phase1: string[]; phase2: string[]; languages: unknown[]; preference: string }>('/i18n/languages'),
  getLocale: () => request<{ locale: string }>('/i18n/locale'),
  setLocale: (locale: string) => request<{ locale: string }>('/i18n/locale', { method: 'PUT', body: JSON.stringify({ locale }) }),
  generateMultilingualPackage: () =>
    request<{ ok: boolean; outputRoot: string; paths: string[]; folder: string }>('/factory/multilingual-package', { method: 'POST' }),

  getLeads: (sourceApp?: string) =>
    request<import('./types').Lead[]>(`/leads${sourceApp ? `?sourceApp=${encodeURIComponent(sourceApp)}` : ''}`),
  addLead: (data: {
    name: string;
    email?: string;
    company?: string;
    preferredLocale?: string | null;
    sourceApp: 'bridge-builder' | 'echo-scale';
    acceptLanguage?: string;
  }) => request<import('./types').Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  setLeadLocale: (id: string, locale: string | null) =>
    request<import('./types').Lead>(`/leads/${id}/locale`, { method: 'PUT', body: JSON.stringify({ locale }) }),

  getProposalStatus: () => request<import('./types/shortcuts').ProposalStatusReport>('/shortcuts/proposal-status'),
  generateTodayProposals: () =>
    request<import('./types/shortcuts').GenerateTodayResult>('/shortcuts/generate-today', { method: 'POST' }),
  getApprovalQueue: () => request<import('./types/shortcuts').ProposalDraftRecord[]>('/shortcuts/approval-queue'),
  approveDraft: (id: string, approvedBy?: string) =>
    request<{ draft: import('./types/shortcuts').ProposalDraftRecord; sent: 0 }>(
      `/shortcuts/approve/${id}`, { method: 'POST', body: JSON.stringify({ approvedBy }) },
    ),
  rejectDraft: (id: string) =>
    request<import('./types/shortcuts').ProposalDraftRecord>(`/shortcuts/reject/${id}`, { method: 'POST' }),

  getPendingDrafts: () =>
    request<{ count: number; drafts: import('./types/shortcuts').ProposalDraftRecord[] }>('/shortcuts/pending'),
  getCalendarLinks: () =>
    request<{
      approveUrl: string;
      icsDailyUrl: string;
      googleCalendarDailyUrl: string;
      reminderTime: string;
      timezone: string;
    }>('/shortcuts/calendar/links'),

  getCommandConfig: () =>
    request<{ config: import('./types/sgosCommand').CommandConfig; menu: import('./types/sgosCommand').CommandMenuItem[] }>(
      '/command/config',
    ),
  captureSignal: (data: { signal: string; parties?: string; priority?: string }) =>
    request<import('./types/sgosCommand').CapturedSignal>('/command/capture-signal', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGovernanceStatus: () =>
    request<import('./types/sgosCommand').GovernanceStatus>('/command/governance-status'),
  getMetricsPulse: () => request<import('./types/sgosCommand').MetricsPulse>('/command/metrics-pulse'),
  teslaDrivePrep: (sentryEnabled = false) =>
    request<import('./types/sgosCommand').TeslaPrepResult>('/command/tesla-drive-prep', {
      method: 'POST',
      body: JSON.stringify({ sentryEnabled }),
    }),

  exportProfitCsv: () =>
    fetch(`${BASE}/profit-tracker/export.csv`).then(res => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    }),
  importProfitCsv: (csv: string, mode: 'merge' | 'replace' = 'merge') =>
    request<import('./types').ImportResult>('/profit-tracker/import', {
      method: 'POST',
      body: JSON.stringify({ csv, mode }),
    }),
  getProductPerformance: () =>
    request<import('./types').ProductPerformanceRow[]>('/profit-tracker/product-performance'),
  getProfitGoal: () =>
    request<import('./types').ProfitGoalState>('/profit-tracker/goal'),
  setProfitGoal: (monthlyGoal: number) =>
    request<import('./types').ProfitGoalState>('/profit-tracker/goal', {
      method: 'PUT',
      body: JSON.stringify({ monthlyGoal }),
    }),
  seedProfitDemoData: () =>
    request<{ products: number; sales: number; expenses: number }>('/profit-tracker/demo-data', { method: 'POST' }),
  recordExternalRevenue: (data: { source: string; amount: number; description?: string; cost?: number }) =>
    request<{ ok: boolean; saleId: string; revenue: number; profit: number; productName: string; goalAlert?: import('./types').GoalAlert; message: string }>(
      '/profit-tracker/record-revenue', { method: 'POST', body: JSON.stringify(data) },
    ),

  getHermesDashboard: () =>
    request<{
      state: import('./types/hermes').HermesStateSnapshot;
      tasks: import('./types/hermes').HermesTaskRecord[];
      ledger: import('./types/hermes').ChaosLedgerRow[];
      briefs: import('./types/hermes').NotionBriefTemplate[];
      calendar: import('./types/hermes').ContentCalendarPlan;
    }>('/hermes/dashboard'),
  getHermesTasks: () => request<import('./types/hermes').HermesTaskRecord[]>('/hermes/tasks'),
  hermesIngest: (data: { source: string; title: string; summary?: string; productSlug?: string; amount?: number }) =>
    request<import('./types/hermes').HermesIngestResult>('/hermes/ingest', { method: 'POST', body: JSON.stringify(data) }),
  hermesDecision: (taskId: string, data: { decision: 'approve' | 'reject' | 'modify'; notes?: string; proofUrl?: string }) =>
    request<import('./types/hermes').HermesDecisionResult>(`/hermes/tasks/${taskId}/decision`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  hermesSimulateCalendar: (eventType: string, productSlug: string) =>
    request<import('./types/hermes').HermesIngestResult>('/hermes/simulate-calendar', {
      method: 'POST', body: JSON.stringify({ eventType, productSlug }),
    }),
};
