import cron from 'node-cron';
import {
  getAutopilotSettings,
  saveAutopilotSettings,
  getProducts,
  logActivity,
  getStats,
} from './db.js';
import { discoverTopProducts, getTopProducts } from './services/productDiscovery.js';
import { generateAndSaveContent } from './services/contentGenerator.js';
import { publishQueuedPosts } from './services/socialPoster.js';

let isRunning = false;
let cronJob: cron.ScheduledTask | null = null;
let lastRunResult: AutopilotRunResult | null = null;

export interface AutopilotRunResult {
  startedAt: string;
  completedAt: string;
  discovered: number;
  contentGenerated: number;
  postsPublished: number;
  errors: string[];
}

export async function runAutopilotCycle(): Promise<AutopilotRunResult> {
  if (isRunning) {
    throw new Error('Autopilot cycle already running');
  }

  isRunning = true;
  const settings = getAutopilotSettings();
  const result: AutopilotRunResult = {
    startedAt: new Date().toISOString(),
    completedAt: '',
    discovered: 0,
    contentGenerated: 0,
    postsPublished: 0,
    errors: [],
  };

  logActivity('autopilot', '🚀 Autopilot cycle started');

  try {
    if (settings.autoDiscover) {
      const products = getProducts();
      if (products.length < 5) {
        try {
          const discovered = await discoverTopProducts(settings.niche, 5 - products.length);
          result.discovered = discovered.length;
        } catch (e) {
          result.errors.push(`Discovery failed: ${e}`);
        }
      }
    }

    if (settings.autoGenerate) {
      const topProducts = getTopProducts(3);
      for (const product of topProducts) {
        try {
          const content = generateAndSaveContent(product, settings.platforms);
          result.contentGenerated += content.length;
        } catch (e) {
          result.errors.push(`Content gen failed for ${product.name}: ${e}`);
        }
      }
    }

    if (settings.autoPost) {
      try {
        const posts = await publishQueuedPosts(3);
        result.postsPublished = posts.filter(p => p.success).length;
      } catch (e) {
        result.errors.push(`Posting failed: ${e}`);
      }
    }

    const stats = getStats();
    logActivity(
      'autopilot',
      `✅ Cycle complete: ${result.discovered} discovered, ${result.contentGenerated} content, ${result.postsPublished} posted | Net profit: $${stats.netProfit.toFixed(2)}`
    );
  } catch (e) {
    result.errors.push(String(e));
    logActivity('error', `❌ Autopilot error: ${e}`);
  }

  result.completedAt = new Date().toISOString();
  isRunning = false;
  lastRunResult = result;

  const updatedSettings = getAutopilotSettings();
  updatedSettings.lastRunAt = result.completedAt;
  saveAutopilotSettings(updatedSettings);

  return result;
}

export function startAutopilotScheduler(): void {
  const settings = getAutopilotSettings();

  if (cronJob) {
    cronJob.stop();
  }

  if (!settings.enabled) {
    console.log('[Autopilot] Scheduler disabled');
    return;
  }

  const interval = Math.max(settings.intervalMinutes, 1);
  const cronExpr = interval >= 60 ? '0 * * * *' : `*/${interval} * * * *`;

  console.log(`[Autopilot] Starting scheduler — every ${interval} minute(s)`);

  cronJob = cron.schedule(cronExpr, async () => {
    console.log('[Autopilot] Scheduled run triggered');
    try {
      await runAutopilotCycle();
    } catch (e) {
      console.error('[Autopilot] Scheduled run failed:', e);
    }
  });

  setTimeout(async () => {
    console.log('[Autopilot] Running initial cycle...');
    try {
      await runAutopilotCycle();
    } catch (e) {
      console.error('[Autopilot] Initial run failed:', e);
    }
  }, 3000);
}

export function stopAutopilotScheduler(): void {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}

export function getAutopilotStatus() {
  const settings = getAutopilotSettings();
  return {
    enabled: settings.enabled,
    isRunning,
    intervalMinutes: settings.intervalMinutes,
    lastRunAt: settings.lastRunAt,
    lastRunResult,
    settings,
  };
}
