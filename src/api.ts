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
    request<{ imported: number; total: number; skipped: number; catalog: { factoryApps: number; kimi3Companions: number; totalTools: number }; inventory: import('./types').NotionInventory }>(
      '/notion-tools/seed-catalog', { method: 'POST', body: JSON.stringify({ force }) }
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
    request<import('./types').Sale>('/sales', { method: 'POST', body: JSON.stringify(data) }),

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
};
