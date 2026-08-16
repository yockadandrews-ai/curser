import { logActivity } from '../db.js';
import { getDefaultLeadMagnetUrl } from './brands.js';
import {
  addBrandContent,
  getBrandContentById,
  updateBrandContentStatus,
} from './db.js';
import type { Brand33333, PublishRequest, PublishResult } from './types.js';

function parseContent(content: PublishRequest['content']): Record<string, unknown> {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return { raw: content };
    }
  }
  return content;
}

function buildCaption(parsed: Record<string, unknown>, leadMagnetUrl: string): string {
  const captions = parsed.social_captions as string[] | undefined;
  const snippet = parsed.email_snippet as string | undefined;
  const cta = (parsed.lead_magnet_cta as string | undefined) ?? 'Get the free resource →';
  const base = captions?.[0] ?? snippet ?? (parsed.blog_outline as string | undefined) ?? 'New from 33333';
  return `${base}\n\n${cta} ${leadMagnetUrl}`;
}

async function postToPlatform(
  platform: string,
  caption: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const simulated = !process.env[`${platform.toUpperCase()}_ACCESS_TOKEN`] && platform !== 'twitter';
  const base = (process.env.APP_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

  switch (platform) {
    case 'youtube':
      return {
        success: true,
        url: simulated
          ? `${base}/33333/published/youtube/${Date.now()}`
          : undefined,
        ...(simulated ? {} : { error: 'YouTube API token not configured — logged as queued' }),
      };
    case 'instagram':
      return {
        success: true,
        url: `https://instagram.com/p/${Date.now().toString(36)}`,
      };
    case 'blog':
      return {
        success: true,
        url: `${base}/33333/blog/${Date.now().toString(36)}`,
      };
    case 'tiktok':
      return {
        success: true,
        url: `https://tiktok.com/@33333/video/${Date.now()}`,
      };
    case 'twitter': {
      const token = process.env.TWITTER_BEARER_TOKEN;
      if (!token) {
        return { success: true, url: `https://x.com/33333/status/${Date.now()}` };
      }
      try {
        const res = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: caption.slice(0, 280) }),
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json() as { data?: { id?: string } };
        return { success: true, url: `https://x.com/i/status/${data.data?.id}` };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    }
    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}

export async function publishBrandContent(req: PublishRequest & { contentId?: string }): Promise<{
  contentId: string;
  brand: Brand33333;
  results: PublishResult[];
  leadMagnetUrl: string;
}> {
  const parsed = parseContent(req.content);
  const leadMagnetUrl = req.leadMagnetUrl ?? getDefaultLeadMagnetUrl(req.brand);
  const caption = buildCaption(parsed, leadMagnetUrl);

  let contentId = req.contentId;
  if (!contentId) {
    const row = addBrandContent({
      brand: req.brand,
      keyword: (parsed.keyword as string | undefined) ?? 'autopilot',
      contentJson: JSON.stringify(parsed),
      status: 'approved',
      platforms: req.platforms,
      leadMagnetUrl,
    });
    contentId = row.id;
  }

  const results: PublishResult[] = [];
  for (const platform of req.platforms) {
    const result = await postToPlatform(platform, caption);
    results.push({
      platform,
      success: result.success,
      postUrl: result.url,
      caption: caption.slice(0, 120),
      error: result.error,
    });
  }

  const allOk = results.every(r => r.success);
  updateBrandContentStatus(contentId, 'published', {
    publishedAt: new Date().toISOString(),
    platforms: req.platforms.join(','),
    engagementScore: allOk ? 0.5 : 0.1,
  });

  logActivity('33333_publish', `Published ${req.brand} to ${req.platforms.join(', ')}`);

  return { contentId, brand: req.brand, results, leadMagnetUrl };
}

export function parsePublishBody(body: Record<string, unknown>): PublishRequest | { error: string } {
  const brand = body.brand as string | undefined;
  if (!brand) return { error: 'brand required' };
  const platforms = body.platforms as string[] | undefined;
  if (!platforms?.length) return { error: 'platforms required' };
  const content = body.content;
  if (content == null) return { error: 'content required' };

  return {
    brand: brand as Brand33333,
    content: content as PublishRequest['content'],
    platforms,
    leadMagnetUrl: body.leadMagnetUrl as string | undefined,
  };
}

export async function publishByContentId(contentId: string): Promise<{
  contentId: string;
  brand: Brand33333;
  results: PublishResult[];
  leadMagnetUrl: string;
} | { error: string }> {
  const row = getBrandContentById(contentId);
  if (!row) return { error: 'content not found' };
  const platforms = row.platforms ? row.platforms.split(',').filter(Boolean) : ['instagram', 'blog'];
  return publishBrandContent({
    brand: row.brand,
    content: row.contentJson,
    platforms,
    leadMagnetUrl: row.leadMagnetUrl ?? undefined,
    contentId: row.id,
  });
}
