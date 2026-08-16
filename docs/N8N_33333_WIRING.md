# 33333 n8n Wiring

Wire the **33333 Autopilot Revenue Engine** to Money Autopilot API endpoints.

**Lane:** Consumer products only. SGOS/Hermes governance stays separate.

---

## Quick start (10 minutes)

1. **Import workflow:** `docs/n8n/33333-autopilot-revenue-engine.workflow.json`
2. **Set n8n env vars** (see `.env.example` 33333 section)
3. **Configure credentials:** Google Sheets, Gemini, Stripe, SMTP
4. **Set server env:** `N33333_WEBHOOK_SECRET` (same value in n8n HTTP headers)
5. **Activate workflow** — five daily crons: Air/Fire/Water/Earth/Lockdown
6. **Open dashboard:** `/33333` — approve drafts, publish, track revenue

Config endpoint: `GET /api/33333/n8n/config`  
Smoke test: `POST /api/33333/n8n/test` with header `X-33333-Secret`

---

## API Endpoints (n8n → server)

### Fire — Publish

```
POST /api/33333/n8n/publish
X-33333-Secret: your-secret
Content-Type: application/json
```

```json
{
  "brand": "vaultverse",
  "content": {
    "social_captions": ["New beat pack drops 🎵"],
    "lead_magnet_cta": "Get 3 free loops →"
  },
  "platforms": ["youtube", "instagram", "blog"],
  "leadMagnetUrl": "https://yourdomain.com/33333/#free"
}
```

Or publish by queue ID:

```json
{ "content_id": "uuid-from-dashboard" }
```

### Water — Engagement

```
GET /api/33333/n8n/engagement/pending?draft=true
X-33333-Secret: your-secret
```

Returns pending comments/DMs. `?draft=true` runs Gemini reply drafts first.

### Earth — Syndicate

```
POST /api/content/syndicate
X-33333-Secret: your-secret
```

```json
{
  "content_id": "uuid",
  "platforms": ["tiktok", "twitter"],
  "format": "vertical_short"
}
```

### Stripe webhook

```
POST /api/webhooks/stripe
Stripe-Signature: ...
```

Set `STRIPE_WEBHOOK_SECRET` on server. Events handled:
- `checkout.session.completed` → revenue + lead conversion
- `checkout.session.expired` → abandoned cart engagement

### Lead capture (landing page)

```
POST /api/33333/leads
```

```json
{
  "email": "user@example.com",
  "firstName": "Alex",
  "brand": "vaultverse",
  "leadMagnet": "3-loop-pack",
  "utmSource": "instagram"
}
```

Subscribes to ConvertKit welcome sequence when configured. Public landing: `/33333/index.html`

### Store / Stripe checkout links

```
GET /api/33333/store
```

Returns products with `stripeUrl` when `STRIPE_LINK_*` env vars are set. Landing page loads this dynamically.

### Abandoned cart email

```
POST /api/33333/email/abandoned-cart
{ "email": "...", "productName": "7-Loop Beat Pack" }
```

Also triggered automatically from Stripe `checkout.session.expired` webhook.

---

## Dashboard

| URL | Purpose |
|-----|---------|
| `/33333` | Approve content, publish, view leads/revenue |
| `/33333/index.html` | Public landing + lead capture |
| `/api/33333/dashboard` | Full JSON dashboard |

---

## Stripe Payment Link metadata

Set on each Payment Link for revenue attribution:

```json
{
  "brand": "vaultverse",
  "product": "7-loop-beat-pack",
  "utm_campaign": "vaultverse_beatpack"
}
```

---

## Daily rhythm

| Time | Phase | You | n8n |
|------|-------|-----|-----|
| 7AM | Air | Review 3–5 drafts (5 min) | Gemini → Sheet |
| 10AM | Fire | — | Publish approved |
| 2PM | Water | Approve reply drafts | Engage + cart emails |
| 6PM | Earth | — | Syndicate winner |
| 9PM | Lockdown | Read summary email | Revenue + health |

See `docs/33333/33333_QUICK_START_GUIDE.md` for 7-day launch plan.

**Lead. Flow. Rise.**
