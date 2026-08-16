# Money Autopilot

Real automation system that discovers winning products, generates viral content, and posts to social media.

## Features

- **Money Autopilot** — Background engine runs every 5 minutes: discover → generate → post
- **Real Earnings** — Track products, sales, expenses with SQLite persistence
- **Viral Cash Generator** — Create platform-specific viral content for your products
- **Auto-Discovery** — Finds top 5 winning products in your niche
- **Live Activity Feed** — Real-time log of everything the autopilot does

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Production

```bash
npm run build
npm start
```

## Docs

| Doc | Purpose |
|-----|---------|
| [MONEY_AUTOPILOT_OUTREACH_SYSTEM.md](./docs/outreach/MONEY_AUTOPILOT_OUTREACH_SYSTEM.md) | Complete launch blueprint — niches, scripts, ads, metrics, 24-month roadmap |
| [DM_OUTREACH_CHEAT_SHEET.md](./docs/outreach/DM_OUTREACH_CHEAT_SHEET.md) | Copy-paste Twitter, LinkedIn, Reddit, email, and influencer scripts |
| [LANDING_PAGE_COPY_CHEAT_SHEET.md](./docs/outreach/LANDING_PAGE_COPY_CHEAT_SHEET.md) | Hero, pricing, FAQ, and ad copy blocks |
| [7_DAY_EXECUTION_CHECKLIST.md](./docs/outreach/7_DAY_EXECUTION_CHECKLIST.md) | Hour-by-hour 7-day sprint with 120 touchpoints/day |
| [COMPETITOR_TEARDOWN.md](./docs/outreach/COMPETITOR_TEARDOWN.md) | Buffer/Hootsuite vs Money Autopilot positioning |
| [N8N_OUTREACH_AUTOMATION.md](./docs/N8N_OUTREACH_AUTOMATION.md) | Stripe checkout + welcome/sale email automation |
| [N8N_33333_WIRING.md](./docs/N8N_33333_WIRING.md) | Wire 33333 n8n workflow to API endpoints |
| [33333 Autopilot Revenue](./docs/33333/README.md) | Consumer lane — 5 streams, n8n engine, email sequences |
| [SOVEREIGN_SALES_AUTOPILOT.md](./docs/SOVEREIGN_SALES_AUTOPILOT.md) | Solar vertical — SG3 → Hermes → Ling → K3 loop |
| [DOMAIN_SETUP.md](./docs/DOMAIN_SETUP.md) | Register domain + wire `tools.moneymagnettools.com` |
| [APPLE_STORE_SETUP.md](./docs/APPLE_STORE_SETUP.md) | App Store Connect vs Shortcuts vs Profit Tracker — why analytics emails are empty |
| [UTILITY_WEBSITES.md](./docs/UTILITY_WEBSITES.md) | Deploy calculator tools + AdSense slots |
| [SHORTCUTS_ADSENSE.md](./docs/SHORTCUTS_ADSENSE.md) | Apple Shortcut to log AdSense payouts → Profit Tracker |
| [SGOS_COMMAND.md](./docs/SGOS_COMMAND.md) | Apple Shortcuts root menu rebuild |
| [SHORTCUTS_HUB.md](./docs/SHORTCUTS_HUB.md) | Proposal status shortcut governance |
| [HERMES_ARCHITECTURE.md](./docs/HERMES_ARCHITECTURE.md) | SGOS/Hermes governance lane (separate from 33333 consumer products) |

## Environment Variables (optional — for live posting)

```env
OPENAI_API_KEY=          # AI-enhanced content generation
TIKTOK_ACCESS_TOKEN=     # Live TikTok posting
INSTAGRAM_ACCESS_TOKEN=  # Live Instagram posting
TWITTER_BEARER_TOKEN=    # Live Twitter/X posting
FACEBOOK_ACCESS_TOKEN=   # Live Facebook posting
APP_BASE_URL=         # Public URL for calendar links & Shortcuts (e.g. https://yourdomain.com)
PORT=3001
DB_PATH=./data/autopilot.db
```

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
