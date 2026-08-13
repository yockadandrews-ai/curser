# n8n → Hermes Calendar Trigger Wiring

Wire n8n to watch your **live primary Google Calendar** and instantiate Content Factory tasks when Hermes events fire.

**Governance:** n8n triggers **draft creation only**. Publish remains gated at `/hermes` + Founder Stack proof.

---

## Endpoint

```
POST {APP_BASE_URL}/api/hermes/calendar/trigger
Content-Type: application/json
```

Optional header (if `HERMES_WEBHOOK_SECRET` set on server):

```
X-Hermes-Secret: your-secret
```

### Body (from Google Calendar node)

```json
{
  "title": "SGOS Sprint 2 Build — Gas Station Snack Rankings",
  "startDate": "2026-08-16",
  "source": "n8n"
}
```

Or explicit match:

```json
{
  "productId": "sprint-2-gas-station",
  "eventType": "build_weekend",
  "source": "n8n"
}
```

### Response

```json
{
  "matched": true,
  "liveEvent": { "id": "live-s2-build", "eventType": "build_weekend", ... },
  "task": { "id": "...", "status": "awaiting_approval", "sent": 0, ... },
  "factoryFiles": ["data/hermes/vault/sprint-2-gas-station/reel-scripts.md", ...],
  "message": "Hermes task uuid · build_weekend · Sent=0"
}
```

---

## n8n workflow (minimal)

```
1. Google Calendar Trigger
   - Calendar: Primary
   - Event starts: 15 minutes before (or at start)
   - Filter: title contains "SGOS" OR "LAUNCH · Sprint"

2. HTTP Request
   - Method: POST
   - URL: https://your-autopilot-host/api/hermes/calendar/trigger
   - Body: { "title": "{{ $json.summary }}", "startDate": "{{ $json.start.date || $json.start.dateTime.slice(0,10) }}", "source": "n8n" }

3. IF matched === true
   - Slack/Gmail notify: "Hermes task ready · review /hermes · Sent=0"
   - Optional: create Notion page from brief path in task.briefPath

4. STOP — do not post to social from n8n
```

---

## Live events Hermes recognizes (Aug 2026)

| Calendar title (match) | productId | eventType |
|------------------------|-----------|-----------|
| SGOS Sprint 2 Build | sprint-2-gas-station | build_weekend |
| LAUNCH · Sprint 2 (+ Reel #1) | sprint-2-gas-station | launch_reel_1 |
| Reel #2 | sprint-2-gas-station | launch_reel_2 |
| Reel #3 | sprint-2-gas-station | launch_reel_3_day_review |
| Sprint 2 Receipt | sprint-2-gas-station | receipt_sprint_prep |
| SGOS Sprint 3 Build | sprint-3-too-late | build_weekend |

Full list: `GET /api/hermes/calendar/live`

---

## Build weekend → Content Factory outputs

When `build_weekend` fires for `sprint-2-gas-station`:

| File | Path |
|------|------|
| Reel scripts (3) | `data/hermes/vault/sprint-2-gas-station/reel-scripts.md` |
| Captions (3) | `data/hermes/vault/sprint-2-gas-station/captions.md` |
| Gumroad copy | `data/hermes/vault/sprint-2-gas-station/gumroad-description.md` |
| Receipt template | `data/hermes/vault/sprint-2-gas-station/receipt-template.md` |
| PDF outline | `data/hermes/vault/sprint-2-gas-station/pdf-outline.md` |
| Notion brief | `data/hermes/briefs/{taskId}-brief.md` |

**Gates:** APPROVAL brief + exported PDF + scripts in vault before publish handoff.

---

## Gumroad sale → Pulse Engine

```
POST /api/hermes/ingest
{
  "source": "gumroad_sale",
  "title": "Sale: Gas Station Snack Rankings",
  "productSlug": "sprint-2-gas-station",
  "amount": 9
}
```

→ Pulse Engine 5-Gem split → receipt draft → Chaos Ledger rows → Sent=0

---

## Env vars

| Var | Purpose |
|-----|---------|
| `APP_BASE_URL` | Links in calendar descriptions + n8n URL |
| `HERMES_WEBHOOK_SECRET` | Optional auth for `/calendar/trigger` |
| `APPROVAL_REMINDER_TZ` | America/New_York (match primary calendar) |

---

## Test locally

```bash
curl -X POST http://localhost:3001/api/hermes/calendar/trigger \
  -H 'Content-Type: application/json' \
  -d '{"title":"SGOS Sprint 2 Build — Gas Station Snack Rankings","startDate":"2026-08-16","source":"n8n"}'
```

Then open `/hermes` → task queue → Approve/Reject.

---

*Hermes observes. n8n notifies. A.D. authorizes.*
