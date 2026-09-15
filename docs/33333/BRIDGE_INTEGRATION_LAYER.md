# THE BRIDGE: Integration Layer v1.0
## Connecting the 10-Workflow Blueprint (Doc 1) to the 33333 Control Tower (Doc 2)

---

## 1. Unified Architecture: How the Two Systems Breathe Together

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE ELEMENTAL CLOCK (Doc 2)                         │
│  07:00 Air  →  10:10 Fire  →  14:22 Water  →  18:00 Earth  →  21:33 Spirit │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MASTER INTEGRATION WORKFLOW: BRIDGE_33333                │
│  Trigger: Cron (runs every 15 min ET, checks clock against power windows)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
   ┌─────────┐               ┌─────────────┐              ┌────────────┐
   │ 07:00   │               │   10:10     │              │   14:22    │
   │  AIR    │               │    FIRE     │              │   WATER    │
   │         │               │             │              │            │
   │W1: Gen  │               │W6: Resume   │              │W4: LinkedIn│
   │Content  │               │W7: Upsell   │              │W8: Chatbot │
   │Ideas    │               │W9: Ghost    │              │DM Outreach │
   │W3: Short│               │W10: Course  │              │Connection  │
   │Scripts  │               │Side Hustle  │              │Move        │
   └─────────┘               └─────────────┘              └────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
   ┌─────────┐               ┌─────────────┐              ┌────────────┐
   │ 18:00   │               │   21:33     │              │  ALWAYS ON │
   │  EARTH  │               │   SPIRIT    │              │  BACKUP    │
   │         │               │             │              │            │
   │W2: YT   │               │Queue Check  │              │W5: News-   │
   │Publish  │               │Archive      │              │letter     │
   │Metrics  │               │MirrorMe     │              │Lead Scoring│
   │Review   │               │Shutdown     │              │CRM Sync   │
   └─────────┘               └─────────────┘              └────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARED DATA HUBS (Doc 1)                            │
│  Content_Ideas  │  Leads_&_Clients  │  Products  │  _CONTINUITY_REPORT.txt  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Import file:** `docs/n8n/bridge-33333.workflow.json`  
**Wiring guide:** `docs/N8N_BRIDGE_33333.md`

---

## 2. The Master Integration n8n Workflow: `BRIDGE_33333`

This ONE workflow replaces the separate cron triggers in W1-W10. It reads the clock, routes to the correct sub-workflow, and logs everything to `_CONTINUITY_REPORT`.

### Node 1: Trigger — Clock Watcher

```
Type: Cron
Mode: Every 15 minutes (America/New_York)
Note: 15-min interval required to hit 10:10, 14:22, 21:33 windows
```

### Node 2: Function — Determine Element Block

See `server/33333/bridge.ts` → `determineElementBlock()` for canonical logic, or the Code node in the imported workflow.

### Node 3: Switch — Route by Element

```
Case 1: element == "Air"   → Execute Air Block
Case 2: element == "Fire"  → Execute Fire Block
Case 3: element == "Water" → Execute Water Block
Case 4: element == "Earth" → Execute Earth Block
Case 5: element == "Spirit"→ Execute Spirit Block
Default: Background Ops (lead scoring, CRM sync)
```

---

## 3–7. Element Blocks

See **`docs/N8N_BRIDGE_33333.md`** for API endpoints and node-level wiring. Block behavior matches the original spec:

| Block | Purpose |
|-------|---------|
| **Air** | W1 content ideas → Content_Ideas sheet + Drive payloads + queue check |
| **Fire** | W6–W10 side hustle webhooks, W7 upsell lead scoring |
| **Water** | W4 LinkedIn post + daily connection move → Slack |
| **Earth** | W2 publish, W5 newsletter adjacency, syndicate, backup |
| **Spirit** | Final queue check, reflection, lockdown Slack |

---

## 8. Background Ops (Non-Power-Time)

| Schedule | Action |
|----------|--------|
| Monday 09:00 ET | W1 weekly batch |
| Daily 09:00 + 13:00 ET | W3 shortform script prep |
| Every 15 min (Flow) | Lead scoring via `POST /api/33333/n8n/lead-scoring` |

---

## 9. Data Hub Bridge: Doc 1 ↔ Doc 2 Schema Mapping

| Doc 1 Field (Content_Ideas) | Doc 2 Field (Payload JSON) | Bridge Logic |
|---|---|---|
| `platform` | `brand` + context | YouTube → VaultVerse; IG/TikTok → AuraFlow |
| `topic` | `title` + `short_text` | Topic becomes title hook |
| `status` | `status` | idea → script_ready → recorded → published |
| `link` | `file_suggested_name` | Maps to Drive file path |
| `brand` | `brand` + `element` | VaultVerse=Fire, AuraFlow=Air/Water/Earth |

| Doc 1 Field (Leads_&_Clients) | Doc 2 Field (Side Hustle) | Bridge Logic |
|---|---|---|
| `source` | `textmoney_focus` | YouTube → resume; TikTok → coaching; LinkedIn → ghostwriting |
| `stage` | `status` | lead → trial → paying (triggers W7 upsell) |
| `interest` | `product` | Maps to W6-W10 workflow trigger |

---

## 10. Implementation Checklist

- [ ] Import `BRIDGE_33333` workflow into n8n (`docs/n8n/bridge-33333.workflow.json`)
- [ ] Set environment variables: `N8N_WEBHOOK_URL`, `RESUME_API_WEBHOOK`, `CHATBOT_WEBHOOK`, `GHOSTWRITING_WEBHOOK`
- [ ] Create Google Sheets: `Content_Ideas`, `Leads_&_Clients`, `Products`, `_CONTINUITY_REPORT`
- [ ] Create Drive folders: `/33333/daily_drafts/`, `/VaultVerse/daily_drafts/`, `/AuraFlow/daily_drafts/`, `/Shorts_Scripts/`, `/Final_YT_Videos/`
- [ ] Test Air Block manually: trigger at 07:00 ET, verify JSON payloads saved
- [ ] Test Fire Block: verify W6-W10 webhooks fire conditionally
- [ ] Test Water Block: verify LinkedIn post generated and Connection Move pushed to Slack
- [ ] Test Earth Block: verify newsletter pulls from last 7 days published content
- [ ] Test Spirit Block: verify Queue Check runs and report finalizes
- [ ] Day 7: Review `_CONTINUITY_REPORT` for gaps, tune cron timing

---

This is the connector. One master workflow. Five elemental blocks. Ten sub-workflows fed by one clock.

Deploy `BRIDGE_33333` and the two documents become one machine.
