# E-Fund concerns and actions

Last updated: **2026-03-18** (Cycle 4:00 PM pre-pulse)

Tracks Funnel 20 / E-Fund webhook silos, deployment overlap, and launch stagger.

## Resolved (2026-03-18)

| Item | Status | Implementation |
|------|--------|----------------|
| Taxonomy pointer sync | **Resolved** | `automations/autopilot_engine.js` emits canonical paths from `config/sgos-taxonomy.json` |
| Taxonomy validation | **Resolved** | `npm run validate-taxonomy-paths` |
| Funnel 20 data silos | **Resolved** | Documented in [SGOS Command Center §7.1](./SGOS_COMMAND_CENTER.md#71-e-fund--funnel-20-webhooks) |
| Webhook verification | **Resolved** | `npm run verify-efund-webhook`, `npm run emergency-funnel:verify` |
| Deployment overlap | **Resolved** | Stagger sequence in [TAXONOMY_AND_EFUND_APP_IDEAS.md](./TAXONOMY_AND_EFUND_APP_IDEAS.md) |

## Active launch sequence

1. **BioLink Optimizer AI** — lead test portal (48h Command Center metrics watch).
2. **Incentive Scout AI** — spin up only after BioLink stability confirmed.
3. Remaining Apps 1–12 — follow factory batch + Hermes approval (Sent=0 until proof).

## Verification commands (local, no secrets)

```bash
npm run validate-taxonomy-paths
npm run verify-efund-webhook
npm run emergency-funnel:verify
node automations/autopilot_engine.js
```

Optional live checks (server running + `.env`):

```bash
npm run verify-efund-webhook -- --live
npm run emergency-funnel:verify -- --live
```

## Open items

- [ ] Import / confirm n8n nodes write to Google Sheet tab **EFundLeads**
- [ ] Set `EFUND_N8N_WEBHOOK_URL` when Funnel 20 workflow is live in n8n
- [ ] Paste Gemini / external checklist messages into this doc if they define extra gates
