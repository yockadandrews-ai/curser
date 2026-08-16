import {
  getPendingEngagements,
  seedDemoEngagementsIfEmpty,
  updateEngagementReply,
} from './db.js';

export interface PendingEngagementItem {
  id: string;
  brand: string;
  platform: string;
  message: string;
  session_id?: string;
  reply_draft?: string;
}

export function getEngagementPending(includeDrafts = true): PendingEngagementItem[] {
  seedDemoEngagementsIfEmpty();
  const rows = getPendingEngagements(50);
  return rows.map(r => ({
    id: r.id,
    brand: r.brand,
    platform: r.platform,
    message: r.message,
    session_id: r.sessionId ?? undefined,
    ...(includeDrafts && r.replyDraft ? { reply_draft: r.replyDraft } : {}),
  }));
}

export async function draftReplyWithGemini(message: string, brand: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return `Thanks for reaching out! Check our free resources at the link in bio — happy to help with ${brand}. Lead. Flow. Rise.`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Draft a warm, on-brand reply (max 280 chars) for brand "${brand}". No hype. Message: ${message}`,
            }],
          }],
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text ?? `Thanks for your message! We'll get back to you soon. — ${brand}`;
  } catch {
    return `Thanks for reaching out! Explore our free downloads — link in bio. — ${brand}`;
  }
}

export async function draftRepliesForPending(): Promise<number> {
  const pending = getPendingEngagements(20);
  let count = 0;
  for (const row of pending) {
    if (row.replyDraft) continue;
    const draft = await draftReplyWithGemini(row.message, row.brand);
    updateEngagementReply(row.id, draft, 'drafted');
    count++;
  }
  return count;
}
