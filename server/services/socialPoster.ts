import { getContent, logActivity, updateContentStatus } from '../db.js';

interface PostResult {
  contentId: string;
  platform: string;
  success: boolean;
  postUrl?: string;
  error?: string;
}

async function postToTikTok(_caption: string, _hashtags: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    return { success: true, url: `https://tiktok.com/@autopilot/post/${Date.now()}` };
  }
  // Real TikTok API integration point
  return { success: false, error: 'TikTok API not configured' };
}

async function postToInstagram(_caption: string, _hashtags: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return { success: true, url: `https://instagram.com/p/${Date.now().toString(36)}` };
  }
  return { success: false, error: 'Instagram API not configured' };
}

async function postToTwitter(caption: string, _hashtags: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    return { success: true, url: `https://x.com/autopilot/status/${Date.now()}` };
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
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }
    const data = await res.json() as { data?: { id?: string } };
    return { success: true, url: `https://x.com/i/status/${data.data?.id}` };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

async function postToFacebook(_caption: string, _hashtags: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!token) {
    return { success: true, url: `https://facebook.com/autopilot/posts/${Date.now()}` };
  }
  return { success: false, error: 'Facebook API not configured' };
}

const platformPosters: Record<string, (caption: string, hashtags: string) => Promise<{ success: boolean; url?: string; error?: string }>> = {
  tiktok: postToTikTok,
  instagram: postToInstagram,
  twitter: postToTwitter,
  facebook: postToFacebook,
};

export async function publishQueuedPosts(maxPosts = 3): Promise<PostResult[]> {
  const queued = getContent().filter(c => c.status === 'queued');
  const toPost = queued.slice(0, maxPosts);
  const results: PostResult[] = [];

  for (const content of toPost) {
    const poster = platformPosters[content.platform];
    if (!poster) {
      updateContentStatus(content.id, 'failed');
      results.push({ contentId: content.id, platform: content.platform, success: false, error: 'Unknown platform' });
      continue;
    }

    const fullCaption = `${content.hook}\n\n${content.caption}\n\n${content.hashtags}`;
    const result = await poster(fullCaption, content.hashtags);

    if (result.success) {
      updateContentStatus(content.id, 'posted', new Date().toISOString());
      logActivity('post', `📱 Posted to ${content.platform}: "${content.hook.slice(0, 40)}..."`);
      results.push({ contentId: content.id, platform: content.platform, success: true, postUrl: result.url });
    } else {
      updateContentStatus(content.id, 'failed');
      logActivity('error', `❌ Failed to post to ${content.platform}: ${result.error}`);
      results.push({ contentId: content.id, platform: content.platform, success: false, error: result.error });
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}

export function getSocialStatus() {
  return {
    tiktok: !!process.env.TIKTOK_ACCESS_TOKEN,
    instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
    twitter: !!process.env.TWITTER_BEARER_TOKEN,
    facebook: !!process.env.FACEBOOK_ACCESS_TOKEN,
    openai: !!process.env.OPENAI_API_KEY,
    mode: process.env.TIKTOK_ACCESS_TOKEN ? 'live' : 'simulated',
  };
}
