# Taxonomy and E-Fund app ideas

Canonical pointers for Sovereign Growth OS factory output, blueprint alignment, and phased portal launches.

## Canonical paths

| Resource | Path |
|----------|------|
| Master blueprint (Apps 1–113) | `docs/SOVEREIGN_GROWTH_OS_MASTER_BLUEPRINT.md` |
| Taxonomy config (machine-readable) | `config/sgos-taxonomy.json` |
| Factory theme source | `server/factory/themes.ts` |
| Daily factory output | `output/YYYY-MM-DD_Five_Themes/` |
| Autopilot pointer JSON | `node automations/autopilot_engine.js` |

## Factory theme folders (Five Themes batch)

1. `01_Conversion_Revenue`
2. `02_Margin_Operations`
3. `03_Acquisition_Lead_Systems`
4. `04_Governance_Trust`
5. `05_Growth_Infrastructure`

Each theme folder should contain at minimum `Apps.md` and `Suite_Proposal.md` after a factory run.

## Blueprint vs repo (today)

| Layer | In repo now | Blueprint target |
|-------|-------------|------------------|
| Factory clusters | 25 apps across 5 themes | Apps 1–113 phased rollout |
| Consumer lane | 33333 + BRIDGE + Viral v3 | Shadow Scale, BioLink, etc. |
| Governance | Hermes + SGOS Command | Aura / Sovereign gates (51–87) |
| Command | `/command`, `/hermes`, `/approve` | Command-Center AI (#50) visualization |

Use the master blueprint for naming and UX intent; use `themes.ts` and `output/` for what is generated and shippable today.

## Official stagger sequence (deployment overlap)

**Do not** launch multiple acquisition portals on the same n8n clock until metrics are green.

| Phase | Portal | Gate |
|-------|--------|------|
| **Now** | BioLink Optimizer AI (#8) | 48h Command Center metrics post-launch |
| **Next** | Incentive Scout AI (#6) | BioLink stable + webhook 200 OK |
| **Then** | GrantWriter AI (#1), Lead-Magnet Logic (#28) | Hermes approve + Sent=0 proof |
| **Later** | Apps 13–50 infrastructure | BRIDGE queue depth < threshold |

## E-Fund / Funnel 20 (lead emergency path)

Purpose: single write path for high-intent leads that must not sit in siloed spreadsheets.

| Step | System | Endpoint / env |
|------|--------|----------------|
| Capture | 33333 API | `POST /api/33333/leads` |
| Revenue | Stripe unified webhook | `POST /api/webhooks/stripe` |
| Nurture | Outreach automation | `OUTREACH_WEBHOOK_URL` |
| Optional dedicated workflow | n8n Funnel 20 | `EFUND_N8N_WEBHOOK_URL` |
| Analytics tab | Google Sheet | **EFundLeads** |

See [SGOS Command Center §7.1](./SGOS_COMMAND_CENTER.md#71-e-fund--funnel-20-webhooks).

## App ideas tied to E-Fund lane

- **BioLink Optimizer AI** — mobile link hub; top CTA routes to E-Fund intake when campaign=efund.
- **Lead-Magnet Logic** — interactive portal instead of flat PDF (matches “AI app → digital product” positioning).
- **Intake-Intelligence AI** — routes whale behavior to calendar; secondary route to E-Fund sheet when budget signal &lt; threshold.
