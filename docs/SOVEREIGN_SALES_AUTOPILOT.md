# Sovereign Sales Autopilot v1.0

SG3 → Hermes → Ling → K3 autonomous loop. **Active vertical: Solar @ $15K entry.**

Founder touchpoints only: vertical selection, pricing check, partner approval, system override. Everything else is machine.

## Loop

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   SG3   │───▶│ HERMES  │───▶│  LING   │───▶│   K3    │
│  EMITS  │    │ QUALIFIES│   │  CLOSES │    │ DELIVERS│
└────┬────┘    └─────────┘    └─────────┘    └────┬────┘
     │                                             │
     └─────────────────────────────────────────────┘
                    (K3 metrics → SG3 case studies)
```

## Active config

| Setting | Value |
|---------|-------|
| Vertical | **Solar** |
| Entry price | **$15,000** (50% deposit) |
| Enterprise | $25,000 (Month 5+) |
| Emissions | 3/week (LinkedIn, X, YouTube Shorts) |

## API

| Method | Path | Node | Description |
|--------|------|------|-------------|
| GET | `/api/sovereign/dashboard` | — | Full loop state + tickets + emissions |
| POST | `/api/sovereign/inbound` | Hermes | Ingest DM/email/application |
| POST | `/api/sovereign/tickets/:id/qualify` | Hermes | Submit 3-question answers → score & route |
| POST | `/api/sovereign/tickets/:id/reply` | Ling | Handle lead reply (`YES` → contract) |
| POST | `/api/sovereign/tickets/:id/sign` | K3 | Signature → deploy + SG3 case study trigger |
| POST | `/api/sovereign/deployments/:id/metrics` | K3→SG3 | Feed appointments/hours/revenue |
| GET | `/api/sovereign/k3/template` | K3 | Solar agent template JSON |
| GET | `/api/sovereign/sg3/emissions` | SG3 | Weekly emission drafts (Sent=0) |
| POST | `/api/sovereign/test/fake-lead` | All | Full loop test (hours 24–40) |

## Hermes qualify matrix

| Dimension | Max pts |
|-----------|---------|
| Vertical match | 3 |
| Revenue band | 4 |
| Urgency | 3 |
| Budget / volume | 2 |

**Route:** ≥7 → Ling · 4–6 → 14-day nurture · <4 → archive (90-day re-engage)

### Qualify questions

1. Are you a solar installer or sales org handling residential/commercial installs?
2. Roughly how many inbound leads per month?
3. If we could recover after-hours leads this month — urgent or Q4?

## Template files

| Path | Purpose |
|------|---------|
| `server/data/sovereign/solar/k3-template.json` | K3 agent prompts + CRM mapping |
| `server/data/sovereign/solar/ling-demo-script.md` | 3-min avatar demo script |
| `server/data/sovereign/solar/sg3-content-calendar.json` | Weekly emissions + auto-triggers |

## 48-hour launch checklist

| Hours | Task |
|-------|------|
| 0–8 | K3 Solar template + Ling avatar script (done in repo) |
| 8–16 | Hermes field-gate + SG3 calendar |
| 16–24 | Import `docs/n8n/sovereign-loop.workflow.json` |
| 24–40 | `POST /api/sovereign/test/fake-lead` — fix breakpoints |
| 40–48 | GO LIVE — first SG3 pulse emission |

## n8n

Import: **`docs/n8n/sovereign-loop.workflow.json`**

Set env: `APP_BASE_URL`, `HERMES_WEBHOOK_SECRET`, optional Stripe checkout URLs.

## Stripe (configure in `.env`)

```bash
STRIPE_SOLAR_ENTRY_CHECKOUT_URL=https://checkout.stripe.com/...
STRIPE_SOLAR_ENTERPRISE_CHECKOUT_URL=https://checkout.stripe.com/...
SOVEREIGN_APPLY_URL=https://yourdomain.com/apply
```

## Governance

- Hermes **never chases** — inbound only
- SG3 posts remain **Sent=0** until founder approval (Hermes policy)
- K3 runs 50 simulated conversations before `live`
- Chaos Ledger attribution on every handoff

*Solar confirmed · $15K entry · loop scaffolded*
