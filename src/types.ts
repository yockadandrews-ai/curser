export interface Product {
  id: string;
  name: string;
  description?: string;
  cost: number;
  sellPrice: number;
  category: string;
  productType: 'tool' | 'product';
  brand: 'sgos' | 'other';
  source: 'manual' | 'discovered' | 'inventory';
  viralScore: number;
  stock?: number;
  unitsSold?: number;
  affiliateLink?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  revenue: number;
  profit: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  productId: string;
  platform: string;
  hook: string;
  caption: string;
  hashtags: string;
  viralScore: number;
  status: 'draft' | 'queued' | 'posted' | 'failed';
  locale?: string;
  createdAt: string;
  postedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  company?: string;
  preferredLocale: string | null;
  sourceApp: 'bridge-builder' | 'echo-scale';
  acceptLanguage?: string;
  resolvedLocale?: string;
  localeSource?: 'lead' | 'browser' | 'account' | 'default';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Stats {
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  monthlyProfit: number;
  totalSales: number;
  productsTracked: number;
  contentGenerated: number;
  postsPublished: number;
  postsQueued: number;
  topProducts: Product[];
}

export interface NotionTool {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sellPrice?: number | null;
  cost?: number | null;
  stock?: number;
  unitsSold?: number;
  notionUrl?: string;
  createdAt: string;
}

export interface NotionInventory {
  totalTools: number;
  pricedTools: number;
  unpricedTools: number;
  totalStock: number;
  totalSold: number;
  hasPriceList: boolean;
  tools: NotionTool[];
}

export interface AutopilotSettings {
  enabled: boolean;
  intervalMinutes: number;
  autoDiscover: boolean;
  autoGenerate: boolean;
  autoPost: boolean;
  platforms: string[];
  niche: string;
  lastRunAt?: string;
}

export interface AutopilotStatus {
  enabled: boolean;
  isRunning: boolean;
  intervalMinutes: number;
  lastRunAt?: string;
  lastRunResult?: {
    startedAt: string;
    completedAt: string;
    discovered: number;
    contentGenerated: number;
    postsPublished: number;
    errors: string[];
  };
  settings: AutopilotSettings;
}
