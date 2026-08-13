# Hermes Autopilot Architecture

Full mapping: **Julian Goldie social-media factory** + **SGOS/SGAI stack** under **Hermes supervisor**, with hard sovereignty constraints preserved.

## Decision: what was built first

**Agent/task schemas first** (Hermes cannot orchestrate without them), then **content calendar generation** as importable `.ics` (no Google OAuth in repo).

| Deliverable | Location |
|-------------|----------|
| Hermes task/agent schemas | `server/schemas/hermes.ts` |
| Calendar event schemas | `server/schemas/calendarEvents.ts` |
| 8 PDF product schemas | `server/data/contentProducts.ts` |
| Notion brief templates | `server/data/notionBriefTemplates.ts` |
| Hermes orchestrator | `server/hermes/orchestrator.ts` |
| Content calendar (.ics) | `server/hermes/contentCalendar.ts` |
| Chaos Ledger | `server/hermes/chaosLedger.ts` |
| Pulse Engine / impact split | `server/hermes/pulseEngine.ts` |
| UI dashboard | `/hermes` · `src/pages/HermesHub.tsx` |

---

## High-level architecture

```
                    ┌─────────────────────────────────────┐
                    │           HERMES (Supervisor)       │
                    │  Multi-agent orchestrator + state   │
                    │  Reads calendar · watches Ledger ·  │
                    │  routes tasks · enforces gates      │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────▼─────────┐   ┌──────────▼──────────┐   ┌─────────▼─────────┐
│  CONTENT FACTORY  │   │  GOVERNANCE LAYER   │   │  IMPACT / PULSE   │
│  (Goldie mapped)  │   │  AURELIUS/SPECTRA/  │   │  ENGINE + LEDGER  │
│  + PDF Sprints    │   │  EQUINOX + Daily    │   │  + Field Signals  │
│  + Reel pipeline  │   │  Founder Stack      │   │  + 5-Gem routing  │
└─────────┬─────────┘   └──────────┬──────────┘   └─────────┬─────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   HUMAN GATE (A.D. only)    │
                    │  /approve · Notion brief ·  │
                    │  Calendar APPROVAL blocks   │
                    └─────────────────────────────┘
```

---

## Goldie → SGOS mapping

| Goldie Component | SGOS / Hermes | Sovereignty |
|------------------|---------------|-------------|
| Chat / Trigger | Calendar event, n8n webhook, `POST /api/hermes/ingest` | Calendar + Founder Stack canonical |
| Social Media Router | Hermes + `equinox_router` | Route only; no publish |
| Platform Tools | n8n nodes / Buffer (gated) | Publish after approval only |
| Content Factory | `content_factory` + product schemas | Drafts to vault |
| AI Content Creator | Grok/xAI / Cursor (long assets) | Prefer sovereign/local |
| Asset Generation | Vault folder `data/hermes/vault/` | No opaque third-party SOT |
| Gmail Approval | APPROVAL pattern + Notion brief | Same hard gate |
| Publishing Router | `publish_router` → n8n handoff JSON | **No live credentials on Hermes** |
| Analytics / Save | Chaos Ledger + Pulse Engine | Full attribution |

---

## Autopilot flow (Hermes in command)

1. **Signal arrives** — calendar, Gumroad webhook, field batch, daily stack
2. **Hermes classifies** — `content | field | revenue | governance | impact`
3. **Routes to agent** — Content Factory, Field Decoder, Pulse Engine, etc.
4. **Produces draft** — vault + Notion brief markdown in `data/hermes/briefs/`
5. **Creates APPROVAL state** — `awaiting_approval` + calendar event UID
6. **Waits**
7. **Founder decision** — Approve / Reject / Modify via `/hermes` or API
8. **On Approve** — n8n handoff payload only; **Sent=0** until L5 proof
9. **Chaos Ledger** — every step attributed

---

## API reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/hermes/dashboard` | State + tasks + ledger + briefs + calendar plan |
| GET | `/api/hermes/status` | Supervisor snapshot |
| GET | `/api/hermes/tasks` | Task queue |
| POST | `/api/hermes/ingest` | Ingest webhook/signal |
| POST | `/api/hermes/tasks/:id/decision` | Founder Approve/Reject/Modify |
| POST | `/api/hermes/simulate-calendar` | Test Build Weekend trigger |
| GET | `/api/hermes/calendar/content.ics` | Download full content factory calendar |
| GET | `/api/hermes/briefs` | Notion brief templates |
| GET | `/api/hermes/ledger` | Chaos Ledger rows |

---

## Content calendar (Gas Station →)

Products from `gas-station` through `growth-compass`:

- **Build Weekend** (Sat–Sun)
- **Launch Tuesday** — 3 Reel slots + Day Review
- **Receipt Friday** — impact receipt draft from Ledger
- **Bundle day** — Growth Compass capstone
- **APPROVAL** blocks — P0 human gate

Import: **GET `/api/hermes/calendar/content.ics`** into primary Google Calendar (same TZ as Founder Stack).

Env: `HERMES_CALENDAR_TZ` or `APPROVAL_REMINDER_TZ` (default `America/New_York`).

---

## n8n minimal path (next wire)

```
Calendar trigger / webhook
  → POST /api/hermes/ingest
  → Hermes drafts + brief
  → APPROVAL event (manual or .ics)
  → Founder Approve via /hermes
  → n8n reads handoff JSON (publish fan-out)
  → Human L5 proof → mark sent
```

Hermes **never** holds unattended social credentials.

---

## Governance (non-negotiable)

- Generates drafts only; does not send
- Send only after Approval Queue + L5 proof
- Money Autopilot viral stack (`autopilot.ts`) remains **separate** — not Hermes-governed
- Affiliate social ≠ sales proposals
- `HERMES_GOVERNANCE` in `server/schemas/hermes.ts`

---

## Notion setup (manual this weekend)

1. Create **SGOS Content Factory** page in Notion
2. Paste brief templates from `GET /api/hermes/briefs` or `server/data/notionBriefTemplates.ts`
3. Link `NOTION_APPROVAL_QUEUE_URL` (existing)
4. Import `.ics` into primary calendar alongside Founder Stack + APPROVAL blocks

---

## SGOS Command

Item **#10 Hermes Supervisor** → `/hermes` (protected shortcut pattern).

---

*Hermes orchestrates. A.D. authorizes.*
