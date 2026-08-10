# SGOS Command — Root Menu Rebuild Guide

Protected root menu for SGOS. **Every item begins with Ask for Confirmation.**

## Protected build pattern (all core shortcuts)

1. **Ask for Confirmation** — `Run [Shortcut Name]? Nothing will be sent automatically.`
2. **Perform the action(s)**
3. **Show Notification** — confirm what happened + explicitly state nothing was sent / Sent=0

## Root menu order

| # | Shortcut | Trigger | Does | Does not |
|---|----------|---------|------|----------|
| 1 | Capture Signal | Manual | Local note/draft → Press Queue | Send |
| 2 | Approval Queue | Manual | Open Notion Autopilot queue | Send |
| 3 | Governance Status | Manual | Master Map + Hermes/readiness | Send |
| 4 | **SGOS Autopilot — Proposal Status** | Manual / daily | Status + optional generate → DRAFTED | Send, SMTP, outreach |
| 5 | Tesla Drive Prep | Manual | Precondition (+ optional Sentry log) | Send |
| 6 | Open Field Board | Manual (if configured) | Open field board URL | Send |
| 7 | Book SGOS Audit | Manual | Open calendar link | Send |
| 8 | Open Press Queue | Manual | Open press queue | Send |
| 9 | Metrics Pulse | Manual | Aggregate metrics snapshot | Send |

## In-app location

- **Route:** `/command` (nav: **SGOS Command**)
- **Proposal detail:** `/shortcuts` (item #4 deep-link)

## Step-by-step: rebuild in Apple Shortcuts / Notion

### 1. Capture Signal
1. Ask for Confirmation: `Run Capture Signal? Nothing will be sent automatically.`
2. Ask for Input: signal text
3. Ask for Input: parties (optional)
4. Choose from Menu: priority (low / normal / high)
5. POST `http://localhost:3001/api/command/capture-signal` with JSON body
6. Open URL: `PRESS_QUEUE_URL`
7. Show Notification: `Signal captured locally. Nothing sent.`

### 2. Approval Queue
1. Ask for Confirmation
2. Open URL: `NOTION_APPROVAL_QUEUE_URL`
3. Show Notification: `Review only. No send actions available here.`

### 3. Governance Status
1. Ask for Confirmation
2. GET `/api/command/governance-status`
3. Open URL: Master Map + Hermes status (from response)
4. Show Notification: `Status check complete.`

### 4. SGOS Autopilot — Proposal Status
1. Ask for Confirmation
2. GET `/api/shortcuts/proposal-status` → show Sent=0
3. Choose from Menu:
   - **Generate today's batch** → POST `/api/shortcuts/generate-today`
   - **Open Approval Queue** → open Notion URL
   - **Mark one Approved** → POST `/api/shortcuts/approve/:id` (human confirm)
4. Show Notification: include folder path, proposal count, `Sent=0`

### 5. Tesla Drive Prep
1. Ask for Confirmation
2. Ask: enable Sentry? (optional)
3. POST `/api/command/tesla-drive-prep`
4. Show Notification: `Tesla prepared. Ready for drive.`

### 6. Open Field Board (optional)
1. Ask for Confirmation
2. Open URL: `FIELD_BOARD_URL` (skip if unset)

### 7. Book SGOS Audit
1. Ask for Confirmation
2. Open URL: `SGOS_AUDIT_CALENDAR_URL`
3. Show Notification: `Booking link opened.`

### 8. Open Press Queue
1. Ask for Confirmation
2. Open URL: `PRESS_QUEUE_URL`
3. Show Notification: `Press Queue opened. Review only.`

### 9. Metrics Pulse
1. Ask for Confirmation
2. GET `/api/command/metrics-pulse`
3. Show Notification: `Metrics pulse complete.`

## Ready-to-paste Cursor prompt (generate batch)

```
Generate today's proposal batch only.
Write markdown under output/2026-08-10_… (use exact date 2026-08-10).
Status = DRAFTED. Do not send. No SMTP. No LinkedIn. No outreach cron.
Use existing proposal language blocks + Grok default under Hermes policy.
Return: folder path + count of proposals + confirmation Sent=0.
Include provenance block on every file.
```

Or use the in-app button: **SGOS Command → #4 → Generate today's batch** (via `/shortcuts`).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NOTION_APPROVAL_QUEUE_URL` | Autopilot Approval Queue |
| `PRESS_QUEUE_URL` | Press / signal review queue |
| `NOTION_MASTER_MAP_URL` | Governance Master Map |
| `NOTION_HERMES_STATUS_URL` | Hermes / readiness page |
| `FIELD_BOARD_URL` | Optional — hides menu item #6 if unset |
| `SGOS_AUDIT_CALENDAR_URL` | Audit booking calendar |

## Governance rule

> **Generates markdown proposals only. Does not send. Send only after Approval Queue + L5 proof.**

*Aligned with Hermes + Autopilot + Approval Queue*
