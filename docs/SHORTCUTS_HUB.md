# Shortcuts Hub — SGOS Autopilot Proposal Status

> **Root menu:** See [SGOS_COMMAND.md](./SGOS_COMMAND.md) — item #4 in SGOS Command.

| Shortcut | Trigger | Does | Does not |
|----------|---------|------|----------|
| **SGOS Autopilot — Proposal Status** | Manual / daily | Status report + optional generate → `DRAFTED` | Send, SMTP, outreach |

## Governance rule (shortcut surface)

> **Generates markdown proposals only. Does not send. Send only after Approval Queue + L5 proof.**

## Layer map

| Layer | Role |
|-------|------|
| **Shortcuts Hub** (this app `/shortcuts`) | Status + generate today's batch + Approval Queue |
| **Cursor / `output/`** | Source of draft markdown files |
| **Notion Autopilot** | Human Approve / Reject (mirror manually until wired) |
| **Hermes** | Policy + provenance on any generate run |
| **n8n / Deal Engine** | Same rule: draft free, send gated |

## Workflow

1. **Report** — last generate date, folders, `Sent=0`
2. **Generate today's batch** → `output/YYYY-MM-DD_Five_Themes/` → status `DRAFTED`
3. **Approval Queue** — mark Approved / Rejected (human only)
4. **Send** — only with proof URL after Approved; never automatic

## Environment

- `NOTION_APPROVAL_QUEUE_URL` — Notion Autopilot Approval Queue page (default: `https://notion.so`)

## API

- `GET /api/shortcuts/proposal-status`
- `POST /api/shortcuts/generate-today`
- `GET /api/shortcuts/approval-queue`
- `POST /api/shortcuts/approve/:id`
- `POST /api/shortcuts/reject/:id`
- `POST /api/shortcuts/mark-sent/:id` (requires `proofUrl`, must be Approved)

*Non-negotiable · aligned with Hermes + Autopilot + Approval Queue*
