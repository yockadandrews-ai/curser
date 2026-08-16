# Three-Lane Architecture

Money Autopilot runs **three parallel revenue lanes**. Each has its own docs, landing page, Stripe flow, and automation — they do not overlap governance.

| Lane | Brand / focus | Landing | Payments | Email automation | Governance |
|------|---------------|---------|----------|------------------|------------|
| **SGOS / Hermes** | Founder ops, Gumroad sprints, approval gates | Dashboard `/approve` | Gumroad + Hermes ingest | n8n calendar → Content Factory | Draft free, send gated |
| **Money Autopilot Engine** | Affiliate founders, $197 one-time | `tools…/autopilot-landing.html` | Stripe Checkout Sessions | n8n outreach webhook or ConvertKit | Approval Inbox |
| **33333 Consumer** | VaultVerse, AuraScript, MirrorMe | `/33333/index.html` | Stripe Payment Links | ConvertKit sequences | Separate DB, no Hermes |
| **Sovereign Solar** | B2B solar @ $15K | — | Stripe checkout URLs | SG3 emissions + n8n loop | Hermes qualify → Ling → K3 |

## Which doc set to use?

- **120 touchpoints/day, DM scripts, agency outreach** → `docs/outreach/`
- **Music/balance/reflection consumer brands** → `docs/33333/`
- **Calendar content factory, Gumroad sprints** → `docs/HERMES_ARCHITECTURE.md`, `docs/N8N_HERMES_WIRING.md`
- **Solar B2B loop** → `docs/SOVEREIGN_SALES_AUTOPILOT.md`

## Stripe webhook routing

Single endpoint: `POST /api/webhooks/stripe`

- `metadata.productId = money-autopilot-engine` → Engine sale → Profit Tracker + Hermes + outreach webhook
- All other checkout sessions → 33333 consumer lane → ConvertKit + revenue events

## API namespace rules

| Path prefix | Lane |
|-------------|------|
| `/api/hermes/*` | SGOS governance |
| `/api/outreach/*`, `/api/checkout/*` | Money Autopilot Engine |
| `/api/33333/*` | Consumer revenue |
| `/api/sovereign/*` | Sovereign Sales (Solar) |
| `/api/post/publish` | Money Autopilot social queue (unchanged) |

33333 n8n nodes use **`/api/33333/n8n/*`** — not `/api/content/publish` (reserved for affiliate autopilot).
