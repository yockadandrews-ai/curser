# Platform alignment — all lanes on `main`

Last synced: **2026-10-02** (AGUS membrane + WATCHTOWER cross-ref — see `docs/SGOS_SYSTEM_ALIGNMENT.md`, `docs/UPDATES.md`)

## Domain map (canonical)

| URL | Lane |
|-----|------|
| `tools.moneymagnettools.com` | Static hub — 10 tools, landing, checkout success, tracker |
| `autopilot.moneymagnettools.com` | Express API — Hermes, SGOS, 33333, outreach, sovereign |
| `moneymagnettools.com` | Root / brand (optional redirect to tools) |

## Governance (all lanes)

- **Sent = 0** until human approve + proof URL (Hermes / Approval Queue). Cloud agents: observe + draft only.
- **Enterprise SGOS audit outreach:** BOOKING_ONLY → [sgos-audit calendar](https://calendar.notion.so/meet/yockad/sgos-audit) · **APOLLO23 VOID** — not driven from this repo.
- **Notion WATCHTOWER** wins over local agent scratch if they conflict: [Action Log](https://app.notion.com/p/3e4def76bd2981709b06fa60f39daa03).

## Revenue lanes (do not cross wires)

| Lane | Path | Governance | Stripe |
|------|------|------------|--------|
| **SGOS / Hermes** | `/hermes`, `/command`, `/approve` | Human Approve + L5 proof · Sent=0 until approved | — |
| **33333 consumer** | `/33333`, `public/33333/` | n8n publish with `X-33333-Secret` | Payment Links (`STRIPE_LINK_*`) |
| **Outreach Engine** | `autopilot-landing.html`, `/api/checkout/engine` | Welcome + sale webhooks | Checkout Session ($197) |
| **Sovereign Solar** | `/api/sovereign/*` | Hermes qualify gate → Ling → K3 | Solar checkout URLs |

## Merged branches (formerly separate chats)

| Branch | Agent chat | Now on `main` |
|--------|------------|---------------|
| `cursor/33333-autopilot-revenue-5526` | Autopilot revenue system | `server/33333/`, `Hub33333`, n8n workflow |
| `cursor/outreach-system-package-4c1d` | Equinox autopilot system | Outreach docs, landing, Stripe checkout |
| `cursor/solar-vertical-0a2c` | Sovereign sales autopilot | `server/sovereign/`, Solar seeds |
| `cursor/33333-updates-sync-b1b2` | **BRIDGE + Viral v3 (combined)** | `bridge-*`, `viral*`, `docs/UPDATES.md` |
| `cursor/bridge-33333-integration-b1b2` | 10-workflow ↔ Control Tower bridge | `docs/n8n/bridge-33333.workflow.json` |
| `cursor/viral-shorts-engine-v3-b1b2` | 2026 shorts engine (32 nodes) | `33333-viral-shorts-engine-v3.workflow.json` |
| `cursor/sgos-biolink-validators-d838` | SGOS blueprint, taxonomy validators, BioLink | `docs/SOVEREIGN_GROWTH_OS_MASTER_BLUEPRINT.md`, `npm run sgos:verify` |

## Shared infrastructure

- **One Stripe webhook:** `POST /api/webhooks/stripe` → `server/stripeWebhookUnified.ts`
  - `productId: money-autopilot-engine` → Outreach ($197)
  - `productId: sovereign-solar-entry` (etc.) → Sovereign → K3 deploy
  - `brand` metadata → 33333 consumer Payment Links
- **33333 n8n routes:** `/api/33333/n8n/*` (legacy `/api/content/*` paths kept)
- **Env template:** `.env.example` (all lanes documented)
- **Sprint calendar:** Hermes Sprints 2–8 + Bundle Day Oct 4

## Sprint 2 (today)

- **Build:** Aug 16–17 — Gas Station Snack Rankings
- **Launch:** Aug 19 — 3 reels (Hermes approval required)
- Vault seeds: `server/data/vaultSeeds/sprint-2-gas-station/`

## Still manual

1. Register `moneymagnettools.com` on Hostinger + upload utility zip
2. Hermes approve at `/hermes` before Aug 19 launch
3. Import n8n workflows (Hermes, 33333, **bridge-33333**, **viral-shorts-v3**, outreach, sovereign)
4. Set Stripe + ConvertKit keys in `.env`
