# 33333 Quick Start Guide — 7-Day Launch Plan

**Goal:** From zero to first dollar in 7 days.  
**Daily active time:** ~30 minutes. Everything else is n8n.

---

## Before Day 1 (30 min setup)

- [ ] Create Stripe account → enable Checkout + Payment Links
- [ ] Create Google Cloud project → enable Gemini API → copy API key
- [ ] Create Google Sheet from [Analytics Dashboard Spec](./33333_ANALYTICS_DASHBOARD_SPEC.md)
- [ ] Install n8n (cloud.n8n.io or self-hosted)
- [ ] Import workflow: `docs/n8n/33333-autopilot-revenue-engine.workflow.json`

### n8n Environment Variables

```env
GEMINI_API_KEY=your-gemini-key
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_DRIVE_VAULT_FOLDER=your-drive-folder-id
APP_BASE_URL=https://yourdomain.com
LEAD_MAGNET_BASE_URL=https://yourdomain.com/free
FOUNDER_EMAIL=you@example.com
EMAIL_API_URL=https://api.convertkit.com/v3/...
STRIPE_SECRET_KEY=sk_live_...
```

---

## Day 1 — Foundation

**Time:** 45 min | **Phase:** Air

| Task | Done |
|------|------|
| Import n8n workflow JSON | ☐ |
| Connect Google Sheets OAuth credential | ☐ |
| Connect Gemini API (query auth on key param) | ☐ |
| Create 3 lead magnets (see below) | ☐ |
| Upload lead magnets to Google Drive `/33333/lead-magnets/` | ☐ |
| Test Air trigger manually → verify draft appears in Content Queue sheet | ☐ |

### Lead Magnets (create today)

1. **VaultVerse:** 3-loop beat pack (ZIP) + mixing checklist PDF
2. **AuraScript:** Moon phase calendar PDF (current month)
3. **MirrorMe:** 7-day reflection prompt PDF

---

## Day 2 — Landing Page

**Time:** 30 min | **Phase:** Earth

| Task | Done |
|------|------|
| Create Carrd site (or Webflow/Framer) | ☐ |
| Paste copy from [Landing Page Copy](./33333_LANDING_PAGE_COPY.md) | ☐ |
| Embed Stripe Payment Link for first product ($27 beat pack) | ☐ |
| Add email capture form → connect to ConvertKit/MailerLite | ☐ |
| Set `LEAD_MAGNET_BASE_URL` to your Carrd `/free` page | ☐ |
| Test: submit email → receive lead magnet delivery email | ☐ |

---

## Day 3 — Email Sequences

**Time:** 30 min | **Phase:** Water

| Task | Done |
|------|------|
| Import 5 sequences from [Email Sequences](./33333_EMAIL_SEQUENCES.md) | ☐ |
| Connect welcome sequence to lead magnet form | ☐ |
| Set up abandoned cart trigger (Stripe webhook → n8n) | ☐ |
| Send test emails to yourself — verify links and formatting | ☐ |
| Mark first 3 content drafts as `approved` in Content Queue sheet | ☐ |

---

## Day 4 — First Publish (Fire)

**Time:** 20 min | **Phase:** Fire

| Task | Done |
|------|
| Activate Fire 10AM trigger (or run manually) | ☐ |
| Verify 3 posts queued/published with lead magnet CTAs | ☐ |
| Check UTM links in published content | ☐ |
| Respond to any test comments using Gemini draft replies | ☐ |
| Log first metrics row in Metrics sheet | ☐ |

**If no social API keys yet:** Post manually using generated captions; update sheet status to `published`.

---

## Day 5 — Syndicate + Analytics

**Time:** 25 min | **Phase:** Earth + Lockdown

| Task | Done |
|------|------|
| Run Earth 6PM trigger manually | ☐ |
| Cross-post top content to TikTok + Twitter | ☐ |
| Verify Google Drive backup folder has today's assets | ☐ |
| Run Lockdown 9PM → check revenue sheet + daily summary email | ☐ |
| Review Analytics Dashboard — confirm formulas calculate | ☐ |

---

## Day 6 — Second Product + Upsell

**Time:** 30 min | **Phase:** Water

| Task | Done |
|------|------|
| Launch AuraScript guidebook ($37) Stripe Payment Link | ☐ |
| Add upsell block to welcome email (VaultVerse → AuraScript) | ☐ |
| Create `/aurascript` landing section on Carrd | ☐ |
| Approve 2 more content drafts for tomorrow's Fire cycle | ☐ |
| Set up Stripe webhook for completed checkouts → Leads sheet | ☐ |

---

## Day 7 — First Sale

**Time:** 20 min | **Phase:** Lockdown

| Task | Done |
|------|------|
| Share beat pack landing page in 3 places (IG story, Twitter, Reddit) | ☐ |
| Run full Air → Fire → Water → Earth → Lockdown cycle | ☐ |
| Monitor Stripe dashboard for first transaction | ☐ |
| Send personal thank-you to first buyer (manual, high-touch) | ☐ |
| Document what worked in Notes tab of analytics sheet | ☐ |

### First Sale Checklist

When Stripe fires `checkout.session.completed`:

1. n8n logs sale to Revenue sheet
2. Delivery email sends automatically (product link)
3. Onboarding sequence starts (Email Sequences #1)
4. Upsell to 33333 Practice ($29/mo) on day 3 of onboarding

---

## Week 2+ Rhythm

| Day | You do | n8n does |
|-----|--------|----------|
| Daily 7AM | Review 5 drafts, approve 1–3 | Air generates content |
| Daily 10AM | — | Fire publishes approved |
| Daily 2PM | Approve/send 2–3 reply drafts | Water engages + cart emails |
| Daily 6PM | — | Earth syndicates winner |
| Daily 9PM | Read summary email, adjust keywords | Lockdown logs revenue |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No drafts in sheet | Check Gemini API key; run Air node manually |
| Posts not publishing | Verify `status=approved` in sheet; check APP_BASE_URL |
| Abandoned cart not firing | Stripe webhook URL must point to n8n; test with Stripe CLI |
| Revenue sheet empty | Stripe credential in Lockdown node; check API key scope |
| SGOS/Hermes conflict | 33333 is consumer lane only — see Blueprint SGOS section |

---

## File Reference

| File | Path |
|------|------|
| Revenue Blueprint | `docs/33333/33333_AUTOPILOT_REVENUE_BLUEPRINT.md` |
| n8n Workflow | `docs/n8n/33333-autopilot-revenue-engine.workflow.json` |
| Email Sequences | `docs/33333/33333_EMAIL_SEQUENCES.md` |
| Landing Page Copy | `docs/33333/33333_LANDING_PAGE_COPY.md` |
| Analytics Spec | `docs/33333/33333_ANALYTICS_DASHBOARD_SPEC.md` |

**Lead. Flow. Rise.**
