import { logActivity } from '../db.js';
import { getBrandContentById, getTopPublishedContent, updateBrandContentStatus } from './db.js';
import { publishBrandContent } from './publisher.js';
import type { SyndicateRequest } from './types.js';

export async function syndicateContent(req: SyndicateRequest): Promise<{
  contentId: string;
  results: Array<{ platform: string; success: boolean; postUrl?: string; error?: string }>;
}> {
  let contentRow = getBrandContentById(req.content_id);

  if (!contentRow) {
    const top = getTopPublishedContent(1)[0];
    if (top) contentRow = top;
  }

  if (!contentRow) {
    return { contentId: req.content_id, results: [{ platform: 'none', success: false, error: 'No published content found' }] };
  }

  const platforms = req.platforms.length ? req.platforms : ['tiktok', 'twitter'];
  const parsed = JSON.parse(contentRow.contentJson) as Record<string, unknown>;

  const { results } = await publishBrandContent({
    brand: contentRow.brand,
    content: parsed,
    platforms,
    leadMagnetUrl: contentRow.leadMagnetUrl ?? undefined,
    contentId: contentRow.id,
  });

  updateBrandContentStatus(contentRow.id, 'syndicated', {
    engagementScore: Math.min(1, contentRow.engagementScore + 0.3),
  });

  logActivity('33333_syndicate', `Syndicated ${contentRow.brand} to ${platforms.join(', ')}`);

  return {
    contentId: contentRow.id,
    results: results.map(r => ({
      platform: r.platform,
      success: r.success,
      postUrl: r.postUrl,
      error: r.error,
    })),
  };
}
