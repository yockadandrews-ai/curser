# Outreach Automation — n8n & Zapier Wiring

Wire welcome emails and sale notifications from the Money Autopilot landing page and Stripe checkout.

**Governance:** Automations send **notifications only**. Never auto-post, auto-DM, or increment Sent without founder proof URL.

---

## Architecture

```
Landing page (tools.moneymagnettools.com)
    │
    ├─ POST /api/outreach/subscribe ──► OUTREACH_WEBHOOK_URL ──► n8n/Zapier
    │                                      └─ Gmail Day 0 welcome
    │
    └─ POST /api/checkout/engine ──► Stripe Checkout ($197)
                                          │
                                          └─ webhook ──► POST /api/webhooks/stripe
                                                              ├─ Profit Tracker revenue
                                                              ├─ Hermes ingest (stripe_sale)
                                                              └─ OUTREACH_WEBHOOK_URL
                                                                   ├─ Founder sale alert
                                                                   └─ Buyer onboarding email
```

Success redirect: `checkout-success.html` → **Approval Inbox** (`/approve`)

---

## Quick start (10 minutes)

### 1. Stripe

1. Create a Stripe account → **Products** → add **Money Autopilot Engine** at $197 (or use inline price — no product required).
2. Copy **Secret key** and **Publishable key**.
3. **Developers → Webhooks** → add endpoint:
   ```
   https://autopilot.moneymagnettools.com/api/webhooks/stripe
   ```
   Events: `checkout.session.completed`
4. Copy **Webhook signing secret**.

### 2. Server env (`.env`)

```bash
APP_BASE_URL=https://autopilot.moneymagnettools.com
TOOLS_BASE_URL=https://tools.moneymagnettools.com

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Optional — use Stripe Dashboard product price instead of inline:
# STRIPE_PRICE_ID_ENGINE=price_...

OUTREACH_WEBHOOK_URL=https://your-n8n.app/webhook/outreach-events
OUTREACH_WEBHOOK_SECRET=your-long-random-secret
```

### 3. n8n workflow

1. Import: **`docs/n8n/outreach-welcome-sale.workflow.json`**
2. Connect **Gmail OAuth** on all Gmail nodes.
3. Set n8n env vars:

| Variable | Value |
|----------|--------|
| `APP_BASE_URL` | Autopilot server URL |
| `TOOLS_BASE_URL` | Tools hub URL |
| `FOUNDER_EMAIL` | Your inbox for sale alerts |

4. Activate workflow — copy the **Production Webhook URL**.
5. Paste that URL into server `OUTREACH_WEBHOOK_URL`.

### 4. Landing page config

In `public/utility-websites/config.js`:

```javascript
profitTrackerApiUrl: 'https://autopilot.moneymagnettools.com',
```

This powers checkout buttons and the welcome-sequence signup form on `autopilot-landing.html`.

### 5. Smoke test

```bash
# Subscribe (triggers welcome webhook)
curl -X POST https://autopilot.moneymagnettools.com/api/outreach/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","source":"smoke-test"}'

# Checkout config
curl https://autopilot.moneymagnettools.com/api/checkout/config

# Welcome sequence copy (for email template nodes)
curl https://autopilot.moneymagnettools.com/api/outreach/welcome-sequence
```

Stripe test: use [test card 4242…](https://stripe.com/docs/testing) → confirm redirect to `/approve`.

---

## API reference

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/outreach/subscribe` | Landing page email capture |
| GET | `/api/outreach/welcome-sequence` | 5-email copy for automation nodes |
| GET | `/api/outreach/events` | Recent events (debug) |
| GET | `/api/checkout/config` | Stripe configured + product info |
| POST | `/api/checkout/engine` | Create Stripe Checkout session |
| GET | `/api/checkout/session/:id` | Poll payment status (success page) |
| POST | `/api/webhooks/stripe` | Stripe webhook (raw body) |

### Webhook payload (`OUTREACH_WEBHOOK_URL`)

**Subscribe:**
```json
{
  "type": "subscribe",
  "email": "founder@example.com",
  "subscriberId": "uuid",
  "approveUrl": "https://autopilot.moneymagnettools.com/approve",
  "dashboardUrl": "https://autopilot.moneymagnettools.com",
  "timestamp": "2026-08-14T10:00:00.000Z"
}
```

**Checkout completed:**
```json
{
  "type": "checkout_completed",
  "email": "buyer@example.com",
  "productName": "Money Autopilot Engine",
  "amount": 197,
  "currency": "usd",
  "sessionId": "cs_...",
  "approveUrl": "https://autopilot.moneymagnettools.com/approve",
  "dashboardUrl": "https://autopilot.moneymagnettools.com",
  "timestamp": "2026-08-14T10:05:00.000Z"
}
```

Optional header: `X-Outreach-Secret: {OUTREACH_WEBHOOK_SECRET}`

---

## 5-day welcome sequence (scheduled follow-ups)

Day 0 fires immediately from n8n on `subscribe`. For Days 1, 3, 5, 7:

**Option A — n8n Wait + Gmail nodes**
- After Day 0, add **Wait** nodes (1 day, 2 days, …) chained to Gmail nodes.
- Copy subjects/bodies from `GET /api/outreach/welcome-sequence`.

**Option B — ConvertKit / Loops / Mailchimp**
- Zapier: Webhook catch → Create subscriber → Add to automation sequence.
- Paste welcome copy from `server/outreach.ts` `WELCOME_SEQUENCE`.

**Option C — Cron + subscriber table**
- Daily n8n cron → `GET /api/outreach/events` or query subscribers (future endpoint).
- Send email when `welcome_sequence_day` matches.

---

## Zapier alternative

If you use Zapier instead of n8n:

| Trigger | Action |
|---------|--------|
| **Webhooks by Zapier** (catch hook) | Set `OUTREACH_WEBHOOK_URL` to Zapier hook URL |
| Filter: `type` = `subscribe` | **Gmail: Send Email** (Day 0 template) |
| Filter: `type` = `checkout_completed` | **Gmail: Send Email** (founder alert) + **Gmail: Send Email** (buyer onboarding) |

Or combine with native **Stripe → New Payment** trigger for redundancy (server webhook already records revenue).

---

## Hermes integration

Stripe sales automatically call:

```
POST /api/hermes/ingest (internal)
source: stripe_sale
```

View in **Hermes Hub** (`/hermes`) — task status `received`, **Sent=0**.

Optional n8n node logs outreach events to Hermes for audit trail.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [N8N_HERMES_WIRING.md](./N8N_HERMES_WIRING.md) | Calendar → Content Factory |
| [outreach-welcome-sale.workflow.json](./n8n/outreach-welcome-sale.workflow.json) | Importable n8n workflow |
| [MONEY_AUTOPILOT_OUTREACH_SYSTEM.md](./outreach/MONEY_AUTOPILOT_OUTREACH_SYSTEM.md) | Full GTM blueprint |

---

*Subscribe → welcome. Pay → Approval Inbox. Draft free, send gated.*
