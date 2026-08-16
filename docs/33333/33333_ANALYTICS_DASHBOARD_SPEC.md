# 33333 Analytics Dashboard Spec

Google Sheets dashboard + n8n tracking for revenue, leads, content ROI, and automation health.

---

## Sheet Structure

Create one Google Sheet with **6 tabs**:

| Tab | Purpose | Updated By |
|-----|---------|------------|
| `Dashboard` | KPI summary + charts | Formulas (auto) |
| `Revenue` | Daily Stripe/Gumroad transactions | n8n Lockdown 9PM |
| `Leads` | Email captures + funnel stage | n8n Water 2PM + webhooks |
| `Content Queue` | Draft → approved → published pipeline | n8n Air + Fire |
| `Metrics` | Engagement + cart emails daily | n8n Water 2PM |
| `Automation Health` | Workflow status checks | n8n Lockdown 9PM |

---

## Tab 1: Dashboard

### Row 1 — Header

```
33333 Autopilot Revenue Dashboard | Last updated: =MAX(Revenue!A:A)
```

### KPI Block (Rows 3–8)

| Cell | Label | Formula |
|------|-------|---------|
| B3 | MTD Revenue | `=SUMIF(Revenue!A:A,">="&EOMONTH(TODAY(),-1)+1,Revenue!C:C)/100` |
| B4 | MTD Leads | `=COUNTIF(Leads!A:A,">="&EOMONTH(TODAY(),-1)+1)` |
| B5 | Conversion Rate | `=IF(B4=0,"—",COUNTIF(Leads!F:F,"converted")/B4)` |
| B6 | Revenue per Lead | `=IF(B4=0,"—",B3/B4)` |
| B7 | Posts Published (MTD) | `=COUNTIF(Content Queue!E:E,"published")` |
| B8 | Revenue per Post | `=IF(B7=0,"—",B3/B7)` |

### Brand Breakdown (Rows 10–16)

| Brand | MTD Revenue | MTD Leads | Conv Rate |
|-------|-------------|-----------|-----------|
| VaultVerse | `=SUMIF(Revenue!D:D,"vaultverse",Revenue!C:C)/100` | `=COUNTIF(Leads!C:C,"vaultverse")` | formula |
| AuraScript | `=SUMIF(Revenue!D:D,"aurascript",Revenue!C:C)/100` | `=COUNTIF(Leads!C:C,"aurascript")` | formula |
| MirrorMe | `=SUMIF(Revenue!D:D,"mirrorme",Revenue!C:C)/100` | `=COUNTIF(Leads!C:C,"mirrorme")` | formula |
| Resume SaaS | `=SUMIF(Revenue!D:D,"resume",Revenue!C:C)/100` | `=COUNTIF(Leads!C:C,"resume")` | formula |
| 33333 Membership | `=SUMIF(Revenue!D:D,"33333",Revenue!C:C)/100` | `=COUNTIF(Leads!C:C,"33333")` | formula |

### Target Tracking (Rows 18–22)

| Metric | Target | Actual | % of Target |
|--------|--------|--------|-------------|
| Monthly Revenue | $10,000 | `=B3` | `=B3/10000` |
| Year 1 Pace | $180,000 | `=B3*12` | formula |

### Charts

1. **Line chart:** Daily revenue (Revenue tab, col A + C) — last 30 days
2. **Bar chart:** Revenue by brand (Dashboard rows 11–15)
3. **Funnel chart:** Leads → nurtured → converted (Leads tab, col F stages)

---

## Tab 2: Revenue

### Columns

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | date | DATE | 2026-08-14 |
| B | transaction_id | TEXT | txn_1abc123 |
| C | gross_cents | NUMBER | 2700 |
| D | brand | TEXT | vaultverse |
| E | product | TEXT | 7-loop-beat-pack |
| F | source | TEXT | stripe |
| G | utm_campaign | TEXT | vaultverse_beatpack |

### n8n Write Pattern (Lockdown 9PM)

```json
{
  "date": "{{ $now.toFormat('yyyy-MM-dd') }}",
  "transaction_id": "{{ $json.id }}",
  "gross_cents": "{{ $json.amount }}",
  "brand": "{{ $json.metadata.brand }}",
  "product": "{{ $json.metadata.product }}",
  "source": "stripe",
  "utm_campaign": "{{ $json.metadata.utm_campaign }}"
}
```

### Stripe Metadata (set on Payment Links)

```json
{
  "brand": "vaultverse",
  "product": "7-loop-beat-pack",
  "utm_campaign": "vaultverse_beatpack"
}
```

---

## Tab 3: Leads

### Columns

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | captured_at | DATETIME | 2026-08-14T10:30:00Z |
| B | email | TEXT | user@example.com |
| C | brand | TEXT | vaultverse |
| D | lead_magnet | TEXT | 3-loop-pack |
| E | utm_source | TEXT | instagram |
| F | funnel_stage | TEXT | captured / nurtured / converted |
| G | converted_at | DATETIME | (blank until purchase) |
| H | revenue_cents | NUMBER | 2700 |

### Funnel Stages

```
captured    → email submitted, lead magnet delivered
nurtured    → opened 2+ emails in sequence
converted   → completed Stripe checkout
churned     → unsubscribed without converting
```

### n8n Update Triggers

| Event | Action |
|-------|--------|
| Form submit webhook | Append row, stage = `captured` |
| Email open (ConvertKit webhook) | Update stage → `nurtured` if 2+ opens |
| Stripe checkout complete | Update stage → `converted`, set revenue |

---

## Tab 4: Content Queue

### Columns

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | date | DATE | 2026-08-14 |
| B | brand | TEXT | vaultverse |
| C | keyword | TEXT | music production |
| D | status | TEXT | draft / approved / published |
| E | published_at | DATETIME | 2026-08-14T10:05:00Z |
| F | content | TEXT | JSON blob from Gemini |
| G | platforms | TEXT | youtube,instagram,blog |
| H | engagement_score | NUMBER | 0.0–1.0 (Earth 6PM update) |
| I | leads_generated | NUMBER | from UTM tracking |

### Status Flow

```
draft → (human review) → approved → (Fire 10AM) → published → (Earth 6PM) → scored
```

---

## Tab 5: Metrics

### Columns

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | date | DATE | 2026-08-14 |
| B | phase | TEXT | water |
| C | engagements | NUMBER | 12 |
| D | cart_emails_sent | NUMBER | 3 |
| E | replies_drafted | NUMBER | 8 |
| F | replies_sent | NUMBER | 5 |

---

## Tab 6: Automation Health

### Columns

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | checked_at | DATETIME | 2026-08-14T21:00:00Z |
| B | workflow_name | TEXT | 33333 Autopilot Revenue Engine |
| C | active | BOOLEAN | TRUE |
| D | last_execution | DATETIME | 2026-08-14T21:00:00Z |
| E | last_status | TEXT | success / error |
| F | error_message | TEXT | (blank if success) |

### Health Check Rules (Lockdown 9PM)

| Check | Pass | Fail Action |
|-------|------|-------------|
| All 5 cron triggers active | Green | Email alert to FOUNDER_EMAIL |
| Gemini API responds | 200 status | Log error, skip Air next day |
| Stripe API responds | 200 status | Log error, manual revenue entry |
| Google Sheets writable | Append succeeds | Retry 3x, then alert |
| Last Fire execution < 25hrs | Timestamp check | Alert "publish missed" |

---

## n8n Tracking Webhooks

### Stripe Checkout Complete

```
POST {n8n_webhook_url}/stripe-checkout
```

Body from Stripe webhook → append Revenue row + update Leads funnel stage.

### Email Capture

```
POST {n8n_webhook_url}/lead-capture
```

Body: `{ email, brand, lead_magnet, utm_source }` → append Leads row.

### Content Engagement (optional)

```
POST {n8n_webhook_url}/engagement
```

Body: `{ content_id, platform, likes, comments, shares }` → update Content Queue col H.

---

## Content ROI Formula

```
Content ROI = (leads_generated × conversion_rate × avg_order_value) / time_invested_minutes
```

Implement in Dashboard cell:

```
=IFERROR(AVERAGEIF('Content Queue'!I:I,">0",'Content Queue'!I:I) * B5 * (B3/MAX(COUNTIF(Leads!F:F,"converted"),1)) / 30, "—")
```

Where 30 = daily active minutes.

---

## Weekly Review Template (Notes section on Dashboard)

```
Week of: ___________

Top performer: ___________ (brand / platform / engagement score)
Worst performer: ___________
Revenue vs target: ___% 
Leads vs last week: ___% 
Action items:
1. 
2. 
3. 
```

---

## Setup Checklist

- [ ] Duplicate this sheet structure in Google Sheets
- [ ] Copy Sheet ID to n8n env `GOOGLE_SHEET_ID`
- [ ] Connect Google Sheets OAuth in all n8n sheet nodes
- [ ] Add Stripe metadata to all Payment Links
- [ ] Wire ConvertKit/MailerLite webhook to lead-capture endpoint
- [ ] Wire Stripe webhook to checkout endpoint
- [ ] Verify Dashboard formulas reference correct tab names
- [ ] Run one full Air → Lockdown cycle and confirm all tabs populate

**Lead. Flow. Rise.**
