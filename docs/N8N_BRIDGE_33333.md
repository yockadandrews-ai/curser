# BRIDGE_33333 — Integration Layer Wiring

Connects the **10-Workflow Blueprint** (Doc 1) to the **33333 Control Tower** (Doc 2) via one master n8n workflow.

**Lane:** Consumer products only. SGOS/Hermes governance stays separate.

---

## Quick start (15 minutes)

1. **Import workflow:** `docs/n8n/bridge-33333.workflow.json`
2. **Deactivate** (optional) the legacy five-cron workflow `33333-autopilot-revenue-engine.workflow.json` — BRIDGE replaces those triggers
3. **Set n8n env vars** (see below + `.env.example`)
4. **Create Google Sheets tabs:** `Content_Ideas`, `Leads_&_Clients`, `Products`, `_CONTINUITY_REPORT`
5. **Create Drive folders:** `/33333/daily_drafts/`, `/Shorts_Scripts/`, `/Final_YT_Videos/`
6. **Set workflow timezone** to `America/New_York` (included in import)
7. **Activate** — runs every 15 minutes, routes to elemental blocks

Config endpoint: `GET /api/33333/n8n/config` (includes bridge paths)  
Clock test: `GET /api/33333/bridge/clock`

---

## Architecture

```
Elemental Clock (ET)
  07:00 Air  →  10:10 Fire  →  14:22 Water  →  18:00 Earth  →  21:33 Spirit
                              ↓
                    BRIDGE_33333 (every 15 min)
                              ↓
         Air / Fire / Water / Earth / Spirit / Flow (background)
                              ↓
              Shared Hubs: Content_Ideas · Leads · _CONTINUITY_REPORT
```

| Block | ET Window | Workflows | Action |
|-------|-----------|-----------|--------|
| **Air** | 07:00–07:30 | W1, W3 | Content ideas → Sheet + Drive payloads |
| **Fire** | 10:10–10:40 | W6–W10 | Side hustle webhooks + upsells |
| **Water** | 14:22–14:52 | W4 | LinkedIn post + connection move |
| **Earth** | 18:00–18:30 | W2, W5 | Publish + syndicate + backup |
| **Spirit** | 21:33–22:03 | Doc 2 | Queue check + lockdown |
| **Flow** | Always | W3, W5 | Lead scoring, shortform prep |

> **Why every 15 minutes?** Hourly cron at `:00` misses 10:10, 14:22, and 21:33 power windows.

---

## API Endpoints (n8n → server)

All protected endpoints use header `X-33333-Secret` (same as legacy 33333 wiring).

### Clock

```
GET /api/33333/bridge/clock
```

Returns current element block, action, and background-op flags.

### Queue Check (Air + Spirit)

```
POST /api/33333/n8n/queue-check
X-33333-Secret: your-secret
```

```json
{
  "checkDay": 15,
  "triggered_by": "Air_Block",
  "auraflow_exists": true,
  "vaultverse_exists": true
}
```

Alias: `POST /api/33333/webhook/queue-check-33333`

### Lead Scoring (Fire + Flow)

```
POST /api/33333/n8n/lead-scoring
X-33333-Secret: your-secret
```

Returns BANT-lite scores for all active leads.

### Connection Move (Water)

```
GET /api/33333/bridge/connection-move
```

### Continuity Report

```
POST /api/33333/n8n/continuity
GET /api/33333/bridge/continuity
```

### Spirit Reflection

```
GET /api/33333/bridge/spirit-reflection?errors=0
```

### Legacy endpoints (still used by Earth/Fire blocks)

| Endpoint | Block |
|----------|-------|
| `POST /api/content/publish` | Earth, Fire |
| `GET /api/engagement/pending` | Earth |
| `POST /api/content/syndicate` | Earth |
| `POST /api/33333/leads` | Landing page |

See **`docs/N8N_33333_WIRING.md`** for full publish/engagement/syndicate payloads.

---

## n8n Environment Variables

| Variable | Purpose |
|----------|---------|
| `APP_BASE_URL` | Money Autopilot server |
| `GEMINI_API_KEY` | Content generation (W1, W3, W4) |
| `GOOGLE_SHEET_ID` | Content_Ideas + _CONTINUITY_REPORT |
| `GOOGLE_DRIVE_VAULT_FOLDER` | Asset backup |
| `GOOGLE_DRIVE_33333_DRAFTS` | `/33333/daily_drafts/` folder ID |
| `N33333_WEBHOOK_SECRET` | API auth header |
| `N8N_WEBHOOK_URL` | Self-reference for sub-webhooks |
| `RESUME_API_WEBHOOK` | W6 Resume SaaS |
| `CHATBOT_WEBHOOK` | W8 Coaching Chatbot |
| `GHOSTWRITING_WEBHOOK` | W9 Ghostwriting intake |
| `SLACK_WEBHOOK_URL` | Connection moves + Spirit shutdown |
| `LEAD_MAGNET_BASE_URL` | CTA links |
| `FOUNDER_EMAIL` | Optional alerts |

---

## Data Hub Schema Mapping

| Doc 1 (Content_Ideas) | Doc 2 (Payload JSON) | Bridge Logic |
|-------------------------|------------------------|--------------|
| `platform` | `brand` + context | YouTube → VaultVerse; IG/TikTok → AuraFlow |
| `topic` | `title` + `short_text` | Topic becomes title hook |
| `status` | `status` | idea → script_ready → recorded → published |
| `brand` | `brand` + `element` | VaultVerse=Fire, AuraFlow=Air |

| Doc 1 (Leads_&_Clients) | Side Hustle | Bridge Logic |
|-------------------------|-------------|--------------|
| `source` | `textmoney_focus` | YouTube → resume; LinkedIn → ghostwriting |
| `stage` | `status` | trial → triggers W7 upsell |
| `interest` | `product` | Maps to W6–W10 webhook |

---

## Implementation Checklist

- [ ] Import `docs/n8n/bridge-33333.workflow.json`
- [ ] Set environment variables above
- [ ] Create Google Sheets: `Content_Ideas`, `Leads_&_Clients`, `Products`, `_CONTINUITY_REPORT`
- [ ] Create Drive folders under `/33333/daily_drafts/`
- [ ] Test Air Block: `GET /api/33333/bridge/clock` at ~07:00 ET → element=`Air`
- [ ] Test Fire Block: verify W6–W10 webhooks fire when env vars set
- [ ] Test Water Block: Slack receives connection move
- [ ] Test Earth Block: publish + syndicate + backup log continuity
- [ ] Test Spirit Block: queue check + shutdown Slack message
- [ ] Day 7: Review `_CONTINUITY_REPORT` + `GET /api/33333/bridge/continuity`

Full spec: **`docs/33333/BRIDGE_INTEGRATION_LAYER.md`**

**Lead. Flow. Rise.**
