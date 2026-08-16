# Revenue Lanes — Alignment Map

All autopilot systems in this repo run in **separate lanes**. Do not mix checkout, email, or governance between them.

---

## Four Lanes

| Lane | Agent / PR | Audience | Price | Landing | API prefix |
|------|------------|----------|-------|---------|------------|
| **33333** | [PR #3](https://github.com/yockadandrews-ai/curser/pull/3) | First brain consumers | $9–$497 | `/33333/index.html` | `/api/33333/*`, `/api/content/publish` |
| **Outreach** | [PR #4](https://github.com/yockadandrews-ai/curser/pull/4) | Money Autopilot buyers | $197 Engine | `tools.moneymagnettools.com/autopilot-landing.html` | `/api/outreach/*`, `/api/checkout/*` |
| **Sovereign** | [PR #5](https://github.com/yockadandrews-ai/curser/pull/5) | B2B Solar installers | $15K–$25K | Apply flow | `/api/sovereign/*` |
| **Hermes/SGOS** | main | Internal governance | — | `/hermes`, `/approve` | `/api/hermes/*` |

---

## Stripe Webhook (unified)

Single endpoint: **`POST /api/webhooks/stripe`**

Routes by session metadata:

| Metadata | Lane | Handler |
|----------|------|---------|
| `productId: money-autopilot-engine` | Outreach | Engine sale → profit tracker + Hermes ingest |
| `brand: vaultverse\|aurascript\|...` | 33333 | Consumer sale → brand revenue + ConvertKit |
| `checkout.session.expired` | 33333 | Abandoned cart → ConvertKit tag |

Implementation: `server/stripeWebhookRouter.ts`

---

## Email Systems

| Lane | Provider | Trigger |
|------|----------|---------|
| 33333 | ConvertKit forms | `POST /api/33333/leads` |
| Outreach | n8n webhook (`OUTREACH_WEBHOOK_URL`) | Subscribe + Stripe Engine sale |
| Sovereign | Ling closer + SG3 emissions | Inbound ticket flow |

---

## n8n Workflows

| File | Lane |
|------|------|
| `docs/n8n/33333-autopilot-revenue-engine.workflow.json` | 33333 daily cycle |
| `docs/n8n/outreach-welcome-sale.workflow.json` | Outreach welcome + sale |
| `docs/n8n/sovereign-loop.workflow.json` | Sovereign B2B loop |
| `docs/n8n/sgos-hermes-calendar.workflow.json` | Hermes governance |

---

## Domains

| URL | Purpose |
|-----|---------|
| `autopilot.moneymagnettools.com` | Money Autopilot app + `/33333` dashboard |
| `tools.moneymagnettools.com` | Utility sites + Engine landing + checkout success |

---

## Quick Reference — Which chat built what?

| Cloud Agent | Branch | Status |
|-------------|--------|--------|
| Autopilot revenue system | `cursor/33333-autopilot-revenue-5526` | PR #3 — **this branch merges all lanes** |
| Equinox autopilot system | `cursor/outreach-system-package-4c1d` | PR #4 — merged into #3 branch |
| Sovereign sales autopilot | `cursor/solar-vertical-0a2c` | PR #5 — merged into #3 branch |

**Lead. Flow. Rise.**
