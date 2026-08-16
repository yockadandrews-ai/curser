# Money Autopilot

Real automation system that discovers winning products, generates viral content, and posts to social media.

**Three revenue lanes** — see [LANES.md](./docs/LANES.md) for how SGOS/Hermes, Money Autopilot Engine, and 33333 consumer products coexist.

## Features

- **Money Autopilot** — Background engine runs every 5 minutes: discover → generate → post
- **Real Earnings** — Track products, sales, expenses with SQLite persistence
- **Viral Cash Generator** — Create platform-specific viral content for your products
- **Auto-Discovery** — Finds top 5 winning products in your niche
- **Live Activity Feed** — Real-time log of everything the autopilot does
- **33333 Dashboard** — Consumer lane at `/33333` (VaultVerse, AuraScript, MirrorMe)

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- 33333 hub: http://localhost:5173/33333
- Engine landing (static): `public/utility-websites/autopilot-landing.html`

## Production

```bash
npm run build
npm start
```

## Docs

### Outreach lane (Money Autopilot Engine — affiliate founders)

| Doc | Purpose |
|-----|---------|
| [LANES.md](./docs/LANES.md) | Three-lane architecture — what goes where |
| [MONEY_AUTOPILOT_OUTREACH_SYSTEM.md](./docs/outreach/MONEY_AUTOPILOT_OUTREACH_SYSTEM.md) | Complete launch blueprint |
| [DM_OUTREACH_CHEAT_SHEET.md](./docs/outreach/DM_OUTREACH_CHEAT_SHEET.md) | 120 touchpoints/day scripts |
| [LANDING_PAGE_COPY_CHEAT_SHEET.md](./docs/outreach/LANDING_PAGE_COPY_CHEAT_SHEET.md) | Hero, pricing, FAQ blocks |
| [7_DAY_EXECUTION_CHECKLIST.md](./docs/outreach/7_DAY_EXECUTION_CHECKLIST.md) | Hour-by-hour 7-day sprint |
| [COMPETITOR_TEARDOWN.md](./docs/outreach/COMPETITOR_TEARDOWN.md) | Buffer/Hootsuite positioning |
| [N8N_OUTREACH_AUTOMATION.md](./docs/N8N_OUTREACH_AUTOMATION.md) | Stripe Checkout + welcome emails |

### 33333 consumer lane (VaultVerse · AuraScript · MirrorMe)

| Doc | Purpose |
|-----|---------|
| [33333 README](./docs/33333/README.md) | First-brain monetization — 5 streams, 7-day launch |
| [N8N_33333_WIRING.md](./docs/N8N_33333_WIRING.md) | Wire 33333 n8n workflow to API |
| [CONVERTKIT_SETUP.md](./docs/33333/CONVERTKIT_SETUP.md) | Welcome sequences + abandoned cart |

### SGOS / Hermes governance lane

| Doc | Purpose |
|-----|---------|
| [HERMES_ARCHITECTURE.md](./docs/HERMES_ARCHITECTURE.md) | Content factory + Chaos Ledger |
| [N8N_HERMES_WIRING.md](./docs/N8N_HERMES_WIRING.md) | Calendar → Content Factory |
| [SGOS_COMMAND.md](./docs/SGOS_COMMAND.md) | Apple Shortcuts root menu |
| [SHORTCUTS_HUB.md](./docs/SHORTCUTS_HUB.md) | Proposal status governance |

### Utility / deploy

| Doc | Purpose |
|-----|---------|
| [APPLE_STORE_SETUP.md](./docs/APPLE_STORE_SETUP.md) | App Store Connect vs Shortcuts |
| [UTILITY_WEBSITES.md](./docs/UTILITY_WEBSITES.md) | Deploy calculator tools + AdSense |
| [SHORTCUTS_ADSENSE.md](./docs/SHORTCUTS_ADSENSE.md) | AdSense → Profit Tracker shortcut |
| [DOMAIN_SETUP.md](./docs/DOMAIN_SETUP.md) | Hostinger domain setup |

## Environment Variables (optional — for live posting)

```env
OPENAI_API_KEY=          # AI-enhanced content generation
TIKTOK_ACCESS_TOKEN=     # Live TikTok posting
INSTAGRAM_ACCESS_TOKEN=  # Live Instagram posting
TWITTER_BEARER_TOKEN=    # Live Twitter/X posting
FACEBOOK_ACCESS_TOKEN=   # Live Facebook posting
APP_BASE_URL=            # Public URL (e.g. https://autopilot.moneymagnettools.com)
PORT=3001
DB_PATH=./data/autopilot.db
```

See **`.env.example`** for Stripe, ConvertKit, outreach webhook, and 33333 keys.

Without API keys, the system runs in **simulated mode** — content is generated and queued, posts are logged with simulated URLs.

## How Autopilot Works

1. **Discover** — Scans trending products in your niche (Reddit + curated winners)
2. **Generate** — Creates TikTok, Instagram, Twitter posts for top products
3. **Post** — Publishes queued content to social platforms
4. **Repeat** — Runs automatically every 5 minutes

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/stats | Dashboard stats |
| GET | /api/autopilot/status | Autopilot engine status |
| POST | /api/autopilot/run | Trigger cycle manually |
| POST | /api/discover | Discover winning products |
| POST | /api/content/generate | Generate content for product |
| POST | /api/post/publish | Publish queued posts |
| POST | /api/checkout/engine | Stripe Checkout — Engine $197 |
| POST | /api/outreach/subscribe | Welcome sequence signup |
| GET | /api/33333/dashboard | 33333 consumer lane KPIs |
| POST | /api/33333/leads | 33333 lead → ConvertKit |
