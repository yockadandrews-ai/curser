import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';

export type OutreachEventType = 'subscribe' | 'checkout_completed' | 'checkout_started';

export interface OutreachSubscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  welcomeSequenceDay: number;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachEventPayload {
  type: OutreachEventType;
  email?: string;
  name?: string;
  amount?: number;
  currency?: string;
  productName?: string;
  sessionId?: string;
  approveUrl?: string;
  dashboardUrl?: string;
  subscriberId?: string;
  timestamp: string;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS outreach_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT NOT NULL DEFAULT 'landing',
    welcome_sequence_day INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS outreach_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    delivered INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

function mapSubscriber(row: Record<string, unknown>): OutreachSubscriber {
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string) || undefined,
    source: row.source as string,
    welcomeSequenceDay: row.welcome_sequence_day as number,
    stripeCustomerId: (row.stripe_customer_id as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function getSubscriberByEmail(email: string): OutreachSubscriber | undefined {
  const row = db.prepare('SELECT * FROM outreach_subscribers WHERE email = ? COLLATE NOCASE')
    .get(email.trim()) as Record<string, unknown> | undefined;
  return row ? mapSubscriber(row) : undefined;
}

export function subscribeOutreach(input: {
  email: string;
  name?: string;
  source?: string;
}): OutreachSubscriber {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('Valid email required');
  }

  const existing = getSubscriberByEmail(email);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const subscriber: OutreachSubscriber = {
    id: uuidv4(),
    email,
    name: input.name?.trim() || undefined,
    source: input.source || 'landing',
    welcomeSequenceDay: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO outreach_subscribers (id, email, name, source, welcome_sequence_day, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(subscriber.id, subscriber.email, subscriber.name || null, subscriber.source, now, now);

  return subscriber;
}

export function markWelcomeSequenceDay(email: string, day: number): OutreachSubscriber | undefined {
  const existing = getSubscriberByEmail(email);
  if (!existing) return undefined;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE outreach_subscribers SET welcome_sequence_day = ?, updated_at = ? WHERE id = ?
  `).run(day, now, existing.id);
  return { ...existing, welcomeSequenceDay: day, updatedAt: now };
}

export function linkStripeCustomer(email: string, stripeCustomerId: string): void {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE outreach_subscribers SET stripe_customer_id = ?, updated_at = ? WHERE email = ? COLLATE NOCASE
  `).run(stripeCustomerId, now, email.trim().toLowerCase());
}

export function recordOutreachEvent(payload: OutreachEventPayload): string {
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO outreach_events (id, event_type, payload, delivered, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(id, payload.type, JSON.stringify(payload), now);
  return id;
}

export function getRecentOutreachEvents(limit = 50): Array<{ id: string; eventType: string; payload: OutreachEventPayload; createdAt: string }> {
  const rows = db.prepare(`
    SELECT id, event_type, payload, created_at FROM outreach_events ORDER BY created_at DESC LIMIT ?
  `).all(limit) as Array<{ id: string; event_type: string; payload: string; created_at: string }>;

  return rows.map(r => ({
    id: r.id,
    eventType: r.event_type,
    payload: JSON.parse(r.payload) as OutreachEventPayload,
    createdAt: r.created_at,
  }));
}

export function getAppBaseUrl(): string {
  return (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

export function buildApproveUrl(): string {
  return `${getAppBaseUrl()}/approve`;
}

export async function dispatchOutreachWebhook(payload: OutreachEventPayload): Promise<boolean> {
  const url = process.env.OUTREACH_WEBHOOK_URL;
  recordOutreachEvent(payload);
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.OUTREACH_WEBHOOK_SECRET
          ? { 'X-Outreach-Secret': process.env.OUTREACH_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Email copy for n8n/Zapier welcome sequence nodes */
export const WELCOME_SEQUENCE = [
  {
    day: 0,
    subject: 'Your Profit Tracker is ready (+ what\'s next)',
    preview: 'One link. Zero signup.',
    body: `Welcome to Money Magnet Tools.

Start here: {{toolsUrl}}/tracker.html

Log today's AdSense or affiliate click in 30 seconds. Tomorrow I'll show you the 5-minute autopilot loop.

— Money Autopilot`,
  },
  {
    day: 1,
    subject: 'The 5-minute autopilot loop (discover → generate → post)',
    preview: 'Real automation with human gates.',
    body: `Hi {{name}},

Money Autopilot runs every 5 minutes:
1. Discover winning products in your niche
2. Generate TikTok, Instagram, Twitter posts
3. Queue for your approval — nothing sends without you

Open your dashboard: {{dashboardUrl}}

Simulated mode works without API keys. Add keys when you're ready for live posting.

— Money Autopilot`,
  },
  {
    day: 3,
    subject: 'Sample Daily Factory output (5 proposals inside)',
    preview: 'Agencies love this one.',
    body: `Hi {{name}},

Daily Factory generates 5 app specs + 5 sales proposals per day — Cursor-ready folders included.

Want the full engine? It's $197 one-time with a 60-day guarantee.

Get the Engine: {{checkoutUrl}}

— Money Autopilot`,
  },
  {
    day: 5,
    subject: '"Draft free, send gated" — why it matters',
    preview: 'No surprise posts. Ever.',
    body: `Hi {{name}},

Every post stays at Sent=0 until you approve with proof URL.

That's SGOS governance — automation that respects your brand.

Review your Approval Inbox: {{approveUrl}}

— Money Autopilot`,
  },
  {
    day: 7,
    subject: 'Engine at $197 — 60-day guarantee inside',
    preview: 'Last call for founder pricing.',
    body: `Hi {{name}},

Money Autopilot Engine: $197 one-time.

If you don't see measurable progress in 60 days, we'll refund you.

Get the Engine: {{checkoutUrl}}

Questions? Reply to this email.

— Money Autopilot`,
  },
] as const;

export function getWelcomeSequenceForAutomation(): Array<{
  day: number;
  subject: string;
  preview: string;
  body: string;
}> {
  const base = getAppBaseUrl();
  const toolsUrl = process.env.TOOLS_BASE_URL || 'https://tools.moneymagnettools.com';
  return WELCOME_SEQUENCE.map(step => ({
    ...step,
    body: step.body
      .replace(/\{\{toolsUrl\}\}/g, toolsUrl)
      .replace(/\{\{dashboardUrl\}\}/g, base)
      .replace(/\{\{approveUrl\}\}/g, buildApproveUrl())
      .replace(/\{\{checkoutUrl\}\}/g, `${toolsUrl}/autopilot-landing.html#pricing`)
      .replace(/\{\{name\}\}/g, '{{subscriber.name}}'),
  }));
}
