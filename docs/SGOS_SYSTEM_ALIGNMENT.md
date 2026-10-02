# SGOS system alignment (Notion ↔ `curser` repo)

**Last synced from canon:** 2026-10-02 (Team Mirror + WATCHTOWER Action Log)

This repo (`yockadandrews-ai/curser` / Money Autopilot) is the **consumer + factory** lane. Enterprise SGOS audit outreach, APOLLO, and WF-09 live in **sovereign-stack / team-ai-hub** and **Notion**. When local docs disagree with Notion WATCHTOWER, **Notion wins**.

## Non-negotiable membrane (all seats)

| Rule | Meaning in this repo |
|------|----------------------|
| **AGUS / Sent = 0** | Observe + draft only. No outbound email/DM/social publish from Cloud Agent without founder approve + L5 proof. |
| **No `sovereign-approve-send` POST** | Cursor cloud must not ping or execute WF-09 / approve-send webhooks. |
| **APOLLO23** | **VOID** (founder denied 2026-09-14). Do not fire bulk Apollo sequences from this agent. |
| **Gmail** | Draft OK · send NEVER (enterprise outreach seat). |
| **BOOKING_ONLY (enterprise)** | SGOS Signal-to-Revenue Audit **$2,500** → [sgos-audit calendar](https://calendar.notion.so/meet/yockad/sgos-audit). No payment links in cold outreach until hub Stripe is live on that connector. |
| **Public branding** | Chip Foundry / private canon — **do not paste into outreach** (Team Mirror 2026-09-30). |

## Notion surfaces (read at session start)

| Surface | URL |
|---------|-----|
| WATCHTOWER — Action Log | [Notion](https://app.notion.com/p/3e4def76bd2981709b06fa60f39daa03) |
| SGOS Team Mirror | [Notion](https://app.notion.com/p/3ebdef76bd29814e8ab1e9175cd0bff1) |
| Approval Queue (send gate) | Hub `3b5def76…` (linked from Team Mirror) |
| Outreach redlines | [Compliance brief 2026-05-19](https://app.notion.com/p/365def76bd29814a8b0ee56d26cec7a0) |

## Revenue lanes in **this** repo (do not cross wires)

| Lane | Paths | Outreach / send |
|------|--------|-----------------|
| **SGOS / Hermes** | `/hermes`, `/command`, `/approve` | Proposal batches **DRAFTED** only; Sent=0 |
| **Outreach Engine (consumer)** | `docs/outreach/*`, `/api/outreach/*`, Engine **$197** | Welcome/sale via `OUTREACH_WEBHOOK_URL` after **opt-in** checkout/subscribe — not cold Apollo |
| **33333 consumer** | `/33333`, `POST /api/33333/leads` | n8n publish gated; lead capture ≠ send |
| **Factory / BioLink test** | `docs/launch/BIOLINK_OPTIMIZER_LAUNCH.md` | Capture + metrics; Hermes before automated Shorts |

Full map: [PLATFORM_ALIGNMENT.md](./PLATFORM_ALIGNMENT.md) · Command Center: [SGOS_COMMAND_CENTER.md](./SGOS_COMMAND_CENTER.md)

## Verification commands (this repo)

```bash
npm run sgos:verify          # taxonomy + funnel + build smoke
npm run validate-taxonomy-paths
npm run verify-efund-webhook
npm run emergency-funnel:verify
node automations/autopilot_engine.js
```

Live API checks (server running): `npm run verify-efund-webhook -- --live`

## Language (enterprise vs consumer)

- **Enterprise SGOS:** prefer *governed workflow orchestration*, *policy-constrained agent execution*, *human approval gates* — see redline checklist (avoid “fully autonomous,” “guaranteed compliant,” unchecked “autopilot” for professional replacement).
- **Money Autopilot (product name):** consumer lane may keep the **Money Autopilot** brand; still **draft-first / Sent=0** for anything that actually posts or emails.

## What this repo does **not** implement

- WF-09 / L5 five-field receipt storage (tracked in Notion + sovereign-stack)
- Press Signal Queue writes (observe-only in Watchtower)
- Sheets Posts mirror (`48659/48660`) — proof lives in n8n sovereign ops, documented in WATCHTOWER 2026-09-29

When those systems move, update this file and `config/sgos-taxonomy.json` `notionCanon` block — do not invent Green status locally.
