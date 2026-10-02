# SGOS Command Center

Operational map for Sovereign Growth OS — links factory output, n8n lanes, and launch gates.

**System membrane (2026-10):** [SGOS_SYSTEM_ALIGNMENT.md](./SGOS_SYSTEM_ALIGNMENT.md) — AGUS · Sent=0 · WATCHTOWER canon · enterprise BOOKING_ONLY vs consumer lanes.

Related: [SGOS Command shortcuts](./SGOS_COMMAND.md) · [Platform alignment](./PLATFORM_ALIGNMENT.md) · [E-Fund actions](./EFUND_CONCERNS_AND_ACTIONS.md)

## §1 Governance

- Hermes approval required before outbound publish (Sent=0 until proof URL).
- In-app: `/command`, `/hermes`, `/approve`, `/shortcuts`.

## §2 Revenue lanes

See [PLATFORM_ALIGNMENT.md](./PLATFORM_ALIGNMENT.md) — SGOS/Hermes, 33333 consumer, Outreach Engine, Sovereign Solar.

## §3 Factory batch

- Generate: SGOS Command → proposal status / Cursor handoff under `output/YYYY-MM-DD_Five_Themes/`.
- Validate: `npm run validate-taxonomy-paths`.

## §4 n8n clocks

- BRIDGE_33333: `docs/n8n/bridge-33333.workflow.json`
- 33333 revenue: `docs/n8n/33333-autopilot-revenue-engine.workflow.json`
- Outreach: `docs/n8n/outreach-welcome-sale.workflow.json`

## §5 Launch stagger (Apps 1–12)

Documented in [TAXONOMY_AND_EFUND_APP_IDEAS.md](./TAXONOMY_AND_EFUND_APP_IDEAS.md).

**Current lead test:** BioLink Optimizer AI — see [BioLink launch copy](./launch/BIOLINK_OPTIMIZER_LAUNCH.md).

## §6 Metrics pulse

- Manual: SGOS Command shortcut #9 → `GET /api/command/metrics-pulse`
- 33333 dashboard: `/33333` + Google Sheet tabs per `docs/33333/33333_ANALYTICS_DASHBOARD_SPEC.md`

## §7 Integrations

### §7.1 E-Fund / Funnel 20 webhooks

**Goal:** Every high-intent lead and paid conversion updates **EFundLeads** (sheet tab) and triggers nurture without duplicate silos.

| Event | Producer | Consumer | Notes |
|-------|----------|----------|-------|
| Lead capture | Site / BioLink / 33333 landers | `POST /api/33333/leads` | Persists to SQLite + optional sheet sync via n8n |
| Checkout completed | Stripe | `POST /api/webhooks/stripe` | Unified handler — tags product + brand metadata |
| Welcome / sale email | Server event | `OUTREACH_WEBHOOK_URL` | See `docs/N8N_OUTREACH_AUTOMATION.md` |
| Funnel 20 orchestration | n8n | `EFUND_N8N_WEBHOOK_URL` | Optional dedicated workflow; must idempotently upsert **EFundLeads** |

**Verify (offline):**

```bash
npm run verify-efund-webhook
npm run emergency-funnel:verify
```

**Verify (live):** start API with `APP_BASE_URL`, then:

```bash
npm run emergency-funnel:verify -- --live
```

**Tracking fields (recommended for EFundLeads):**

- `email`, `source`, `utm_campaign`, `portal` (e.g. `biolink-optimizer`)
- `funnel_stage` (captured → nurtured → converted)
- `budget_signal`, `captured_at`, `stripe_session_id`

### §7.2 Taxonomy pointer

Automation nodes should read paths from:

```bash
node automations/autopilot_engine.js
```

Emits `canonicalBlueprintPath`, `outputRoot`, and `launchLeadTest`.
