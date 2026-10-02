# Platform alignment — all lanes on `main`

Last synced: **2026-10-02** · **`main`** · Changelog: [UPDATES.md](./UPDATES.md)

**Verify locally:** `npm run sgos:verify` · **Start here for “what changed”:** [UPDATES.md](./UPDATES.md)

---

## Domain map (canonical)

| URL | Lane |
|-----|------|
| `tools.moneymagnettools.com` | Static hub — 10 tools, `autopilot-landing.html`, checkout success, tracker |
| `autopilot.moneymagnettools.com` | Express API + React app — Hermes, SGOS, 33333, outreach, sovereign |
| `autopilot.moneymagnettools.com/33333` | 33333 consumer dashboard (Hub33333) |
| `public/33333/brand-pages/` | VaultVerse, AuraScript, MirrorMe landings |

---

## Revenue & ops lanes (do not cross wires)

| Lane | UI / static | API prefix | Payments | Automation |
|------|-------------|------------|----------|------------|
| **SGOS / Hermes** | `/hermes`, `/command`, `/approve` | `/api/hermes/*`, `/api/shortcuts/*` | Gumroad → `/api/hermes/ingest` | `docs/n8n/sgos-hermes-calendar.workflow.json` |
| **Outreach Engine** | `autopilot-landing.html` | `/api/outreach/*`, `/api/checkout/*` | Stripe Checkout $197 (`productId: money-autopilot-engine`) | `docs/n8n/outreach-welcome-sale.workflow.json` |
| **33333 consumer** | `/33333`, `public/33333/` | `/api/33333/*` | Stripe Payment Links (`STRIPE_LINK_*`, `brand` metadata) | ConvertKit + `33333-autopilot-revenue-engine.workflow.json` |
| **BRIDGE_33333** | — (orchestration) | `/api/33333/bridge/*` | — | **`docs/n8n/bridge-33333.workflow.json`** (recommended master) |
| **Viral Shorts v3** | brand pages | `/api/33333/viral/*` | — | `docs/n8n/33333-viral-shorts-engine-v3.workflow.json` |
| **Sovereign Solar** | — | `/api/sovereign/*` | Payment Links (`productId: sovereign-*`) | `docs/n8n/sovereign-loop.workflow.json` |
| **SGOS enterprise** | Notion WATCHTOWER | E-Fund webhooks | — | `EFUND_N8N_WEBHOOK_URL` · [SGOS_SYSTEM_ALIGNMENT.md](./SGOS_SYSTEM_ALIGNMENT.md) |

**Governance default:** Draft free, send gated · Sent=0 until human approve + proof URL (Hermes + Shortcuts Hub).

---

## Shared Stripe webhook (one endpoint)

```
POST https://autopilot.moneymagnettools.com/api/webhooks/stripe
→ server/stripeWebhookUnified.ts
```

| Session metadata | Lane | On `checkout.session.completed` |
|------------------|------|----------------------------------|
| `productId: money-autopilot-engine` | Outreach | Profit Tracker + Hermes + `OUTREACH_WEBHOOK_URL` |
| `productId: sovereign-*` | Sovereign | Inbound ticket → K3 signature path |
| `brand: vaultverse` (etc.) | 33333 | Revenue events + ConvertKit |

---

## 33333 n8n API paths

| Purpose | Preferred path | Legacy (still works) |
|---------|----------------|----------------------|
| Publish | `POST /api/33333/n8n/publish` | `POST /api/content/publish` |
| Engagement | `GET /api/33333/n8n/engagement/pending` | `GET /api/engagement/pending` |
| Syndicate | `POST /api/33333/n8n/syndicate` | `POST /api/content/syndicate` |

Header: `X-33333-Secret` = `N33333_WEBHOOK_SECRET`

**Affiliate autopilot social queue (different):** `POST /api/post/publish` — Money Autopilot only.

---

## Newest systems on `main` (2026-09 → 2026-10)

| System | Doc | Code |
|--------|-----|------|
| **BRIDGE_33333** | [N8N_BRIDGE_33333.md](./N8N_BRIDGE_33333.md), [BRIDGE_INTEGRATION_LAYER.md](./33333/BRIDGE_INTEGRATION_LAYER.md) | `server/33333/bridge.ts`, `bridgeRoutes.ts` |
| **Viral Shorts v3** | [VIRAL_SHORTS_ENGINE_v3.md](./33333/VIRAL_SHORTS_ENGINE_v3.md) | `server/33333/viralShorts.ts`, `viralRoutes.ts` |
| **SGOS blueprint** | [SOVEREIGN_GROWTH_OS_MASTER_BLUEPRINT.md](./SOVEREIGN_GROWTH_OS_MASTER_BLUEPRINT.md) | Apps 1–113 index |
| **WATCHTOWER / AGUS** | [SGOS_SYSTEM_ALIGNMENT.md](./SGOS_SYSTEM_ALIGNMENT.md) | `config/sgos-taxonomy.json`, `npm run sgos:verify` |
| **Command Center** | [SGOS_COMMAND_CENTER.md](./SGOS_COMMAND_CENTER.md) | E-Fund webhooks |
| **Outreach package** | [outreach/MONEY_AUTOPILOT_OUTREACH_SYSTEM.md](./outreach/MONEY_AUTOPILOT_OUTREACH_SYSTEM.md) | Landing + Stripe Checkout |

---

## n8n import order (recommended)

1. `sgos-hermes-calendar.workflow.json` — governance / Gumroad sprints  
2. `bridge-33333.workflow.json` — **master** 33333 elemental clock (replaces scattered W1–W10 crons)  
3. `33333-viral-shorts-engine-v3.workflow.json` — Fire block shorts  
4. `33333-autopilot-revenue-engine.workflow.json` — consumer publish/engage/syndicate  
5. `outreach-welcome-sale.workflow.json` — Engine $197 welcome + sale  
6. `sovereign-loop.workflow.json` — Solar B2B  

Env: `.env.example` (all lanes).

---

## Hermes sprint calendar

Live mappings Sprints 2–8 + Bundle Day — import ICS:

```bash
curl -O "$APP_BASE_URL/api/hermes/calendar/live.ics"
```

Vault seeds: `server/data/vaultSeeds/sprint-*` · Approve at `/hermes` before any publish handoff.

---

## Still manual

1. Hostinger — utility zip → `tools.moneymagnettools.com` ([UTILITY_WEBSITES.md](./UTILITY_WEBSITES.md))  
2. Stripe + ConvertKit keys in production `.env`  
3. Import n8n workflows above + set `APP_BASE_URL`, secrets  
4. Google Sheet tabs for BRIDGE: `Content_Ideas`, `Viral_Shorts`, `_CONTINUITY_REPORT`  
5. Social tokens — [SOCIAL_API_SETUP.md](./33333/SOCIAL_API_SETUP.md) (stub until SOV guide imported)  

---

## Merged agent branches (historical)

| Branch | Chat focus | On `main` |
|--------|------------|-----------|
| `cursor/33333-autopilot-revenue-5526` | Consumer revenue | `server/33333/` |
| `cursor/outreach-system-package-4c1d` | Engine outreach | `docs/outreach/`, landing, checkout |
| `cursor/solar-vertical-0a2c` | Sovereign Solar | `server/sovereign/` |
| `cursor/platform-alignment-0a2c` | Unified Stripe + n8n paths | `stripeWebhookUnified.ts` |
| `cursor/33333-updates-sync-b1b2` | BRIDGE + Viral v3 | bridge + viral modules |
