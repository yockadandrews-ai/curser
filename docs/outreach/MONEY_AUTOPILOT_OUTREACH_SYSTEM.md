# Money Autopilot — Complete Outreach System

**Version:** 1.0 · **Brand:** Money Autopilot / Money Magnet Tools · **Domain:** `autopilot.moneymagnettools.com`

This is the master blueprint for launching and scaling the Money Autopilot revenue stack. Every script, checklist, and metric below is aligned to the product in this repo — not a generic SaaS template.

---

## Part 1: Niche Selection Matrix

Pick **one primary lane** for the first 7 days. Run secondary lanes only after Day 4.

| Lane | Target | Pain | Offer | Price | Why it wins |
|------|--------|------|-------|-------|-------------|
| **A — Affiliate Autopilot** | Solo founders monetizing content | No time to discover products + post daily | Money Autopilot Engine | $197 one-time | Product already built; 5-min cycle discover → generate → post |
| **B — Daily Factory** | Agency owners, consultants | Proposal + app ideation bottleneck | Daily Factory Generator + Proposal Writer | $47 + $37 | 5 apps + 5 proposals/day with Cursor handoff |
| **C — Viral Content** | Course creators, Gumroad sellers | Content doesn't convert | Viral Cash Generator | $47 | Profit-weighted viral score per product |
| **D — Conversion OS** | $10k–$500k/mo service businesses | Underpriced, slow closes | Conversion suite (Offer-Optics → Value-Verify) | $697–$1,197/mo | Full theme cluster in `server/factory/themes.ts` |
| **E — Utility + AdSense** | Passive income builders | Need traffic without building apps | Money Magnet Tools hub | Free → AdSense | 10 calculators live at `public/utility-websites/` |

**Recommended Day 1 lane:** **A + E** — Autopilot Engine upsell from free tools traffic.

---

## Part 2: Landing Page Copy (Full)

Use blocks from `LANDING_PAGE_COPY_CHEAT_SHEET.md` for Carrd/Webflow/Framer. Summary:

### Hero
- **Headline:** Stop posting manually. Money Autopilot discovers winners, writes viral content, and queues posts — while you sleep.
- **Subheadline:** Real automation for affiliate founders. Draft-first, human-gated. No spam, no black-box posting.
- **CTA:** Start Free → `tools.moneymagnettools.com` · **Secondary CTA:** Get the Engine — $197

### Problem
You're spending 2–3 hours/day on Reddit scroll, product research, and caption writing — and still miss trending windows. Competitors with systems compound daily; you compound nothing.

### Solution (3 steps)
1. **Discover** — Autopilot scans trending products in your niche every 5 minutes.
2. **Generate** — TikTok, Instagram, and Twitter posts tailored to each product.
3. **Approve & Post** — SGOS governance: drafts queue in Approval Inbox; nothing sends without you.

### Social proof placeholders
- "Generated 47 posts in week 1 — approved 12, published 12, first affiliate click day 9."
- "Daily Factory cut my proposal time from 4 hours to 20 minutes."

### Pricing table
| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | Free | 10 utility tools + Profit Tracker |
| **Engine** | $197 | Money Autopilot — discover, generate, queue |
| **Factory** | $84 bundle | Daily Factory + Viral Cash + Proposal Writer |
| **Command** | $147 | Sovereign Growth OS Dashboard — all portals |
| **Conversion OS** | $697/mo | Full 5-app conversion suite (agencies) |

### FAQ (top 5)
1. **Does it post without my permission?** No. Draft free, send gated. Sent=0 until you approve with proof URL.
2. **Do I need API keys?** Optional. Without keys, system runs in simulated mode — content generated and logged locally.
3. **What niches work?** Any affiliate niche. Default discovery uses Reddit + curated winners.
4. **Is this the same as Money Magnet Tools?** Tools = free acquisition surface. Autopilot = operator dashboard at `autopilot.moneymagnettools.com`.
5. **Refund policy?** 60-day measurable-progress guarantee on paid tiers.

---

## Part 3: Outreach Scripts (7 Channels)

Full copy-paste versions in `DM_OUTREACH_CHEAT_SHEET.md`. Channel summary:

| # | Channel | Daily target | Primary hook |
|---|---------|--------------|--------------|
| 1 | Twitter/X DMs | 50 | "Saw your thread on [topic] — built a 5-min autopilot for that exact workflow" |
| 2 | LinkedIn | 20 | Connection + value comment → DM with Daily Factory sample |
| 3 | Reddit comments | 10 | Value-first answer, no link unless asked |
| 4 | Reddit DMs | 5 | After helpful comment, offer free Profit Tracker setup |
| 5 | Cold email | 30 | Subject: "DEMO — 5 apps + 5 proposals by tomorrow" |
| 6 | Influencer outreach | 3 | 30% commission via Rewardful on Engine + Factory bundle |
| 7 | Product Hunt | Launch day | "Real automation — discovers, generates, posts (with approval gates)" |

**Email template (short):**

```
Subject: [First Name], your content pipeline in 5 minutes/day?

Hi [First Name],

Most founders I talk to spend 2+ hours daily on product research and social captions — and still miss trending windows.

Money Autopilot runs a 5-minute cycle: discover winning products → generate platform-specific posts → queue for your approval. Nothing sends without you.

Reply DEMO and I'll send a 15-minute walkthrough customized to [their niche].

— [Your name]
P.S. Draft free, send gated. Zero risk of spammy auto-posting.
```

---

## Part 4: Welcome Sequence (5 emails + SMS)

### Email 1 — Instant (signup / lead magnet)
**Subject:** Your Profit Tracker is ready (+ what's next)
**Body:** Link to `tools.moneymagnettools.com/tracker.html`. One action: log today's AdSense or affiliate click. Tease Autopilot Engine.

### Email 2 — Day 1
**Subject:** The 5-minute autopilot loop (discover → generate → post)
**Body:** Screenshot of AutoPilot dashboard. Explain simulated vs live mode.

### Email 3 — Day 3
**Subject:** How [Name] got their first affiliate click in 9 days
**Body:** Case study structure — even if hypothetical, use realistic metrics from README feature set.

### Email 4 — Day 5
**Subject:** Daily Factory: 5 apps + 5 proposals before lunch
**Body:** Attach sample output from `output/YYYY-MM-DD_Five_Themes/`. CTA: $84 bundle.

### Email 5 — Day 7
**Subject:** Last call — Engine at $197 (60-day guarantee)
**Body:** Objection handling + scarcity (founder pricing, not fake countdown).

### SMS (optional, post-purchase)
- **Hour 0:** "Welcome to Money Autopilot 🚀 Open Approval Inbox: [link]"
- **Day 2:** "Tip: Run your first discover cycle — POST /api/autopilot/run"
- **Day 7:** "How many drafts approved this week? Reply with your number."

---

## Part 5: 30-Day Content Calendar

| Week | Theme | Mon | Tue | Wed | Thu | Fri |
|------|-------|-----|-----|-----|-----|-----|
| 1 | Problem-aware | "2 hrs/day on captions?" | Autopilot loop demo | Reddit AMA prep | Free tools thread | Launch recap |
| 2 | Solution-aware | Daily Factory sample | Viral score explainer | SGOS governance | Client win story | Behind-the-scenes build |
| 3 | Product-aware | Approval Inbox walkthrough | API keys setup | Conversion OS teaser | Influencer repost | Week 3 metrics |
| 4 | Offer-aware | $197 Engine breakdown | Bundle vs à la carte | FAQ video | Testimonial compile | Month 1 retrospective |

**Content formats:** 60-sec screen recordings, carousel (3 slides max), single-image quote cards, Reddit long-form value posts.

---

## Part 6: Paid Ad Copy

### Meta (3 variations)

**V1 — Problem**
- Headline: Still writing social posts manually?
- Primary: Money Autopilot discovers products, writes captions, queues posts — you approve, it publishes.
- CTA: Learn More

**V2 — Outcome**
- Headline: 5-minute content pipeline for affiliate founders
- Primary: Discover → Generate → Approve. Real automation with human gates.
- CTA: Start Free

**V3 — Social proof**
- Headline: "47 posts generated in week 1"
- Primary: Join founders using Money Autopilot + Money Magnet Tools.
- CTA: Get Demo

### Google Search (3 ad groups)

| Ad group | Keywords | Headline |
|----------|----------|----------|
| Affiliate automation | affiliate content automation, auto post affiliate | Money Autopilot — Real Automation |
| Proposal tools | AI sales proposal generator, daily proposal tool | Daily Factory — 5 Proposals/Day |
| Free calculators | tip calculator, word counter online | Money Magnet Tools — Free |

---

## Part 7: Objection Handling Cheat Sheet

| Objection | Response |
|-----------|----------|
| "I don't trust auto-posting" | "Neither do we. Draft free, send gated — Sent stays 0 until you approve with proof URL." |
| "I already use Buffer/Hootsuite" | "Those schedule what you write. We discover products AND write platform-specific captions." |
| "$197 is a lot" | "One affiliate sale covers it. 60-day guarantee if you don't see measurable progress." |
| "I need [feature X]" | "Daily Factory generates 5 app specs/day — paste into Cursor. What's X? I'll show the closest match." |
| "Is this AI slop?" | "You approve every draft. Autopilot is a factory, not a firehose." |

---

## Part 8: Daily Execution Checklists

### Morning (90 min)
- [ ] Check Approval Inbox — approve/decline pending drafts
- [ ] Run manual autopilot cycle: `POST /api/autopilot/run`
- [ ] 50 Twitter/X DMs (use cheat sheet)
- [ ] Log metrics in tracker

### Afternoon (90 min)
- [ ] 20 LinkedIn messages
- [ ] 10 Reddit value comments + 5 DMs
- [ ] Publish 1 content piece (video or carousel)

### Evening (60 min)
- [ ] 30 cold emails
- [ ] 3 influencer outreaches
- [ ] Update Real Earnings / Profit Tracker
- [ ] Plan tomorrow's 3 targets

**Daily minimum: 120 touchpoints. No exceptions.**

---

## Part 9: Metrics Dashboard

Track in Profit Tracker + spreadsheet:

| Metric | Day 1 target | Week 1 target | Month 1 target |
|--------|--------------|---------------|----------------|
| Touchpoints | 120 | 840 | 3,600 |
| DMs sent | 50 | 350 | 1,500 |
| Replies | 5 | 35 | 150 |
| Demos booked | 1 | 7 | 30 |
| Engine sales | 0 | 2 | 10 |
| MRR (Conversion OS) | $0 | $0 | $697+ |
| AdSense (tools site) | $0 | $5 | $50 |

**North star:** Revenue per hour of founder time. Target $50/hr by Day 30.

---

## Part 10: 24-Month Scaling Roadmap

| Phase | Months | Focus | Revenue target |
|-------|--------|-------|----------------|
| **Launch** | 1–2 | 7-day sprint, 120 touchpoints/day, Engine sales | $2k/mo |
| **Automate** | 3–6 | Zapier welcome sequence, Rewardful affiliates, n8n Hermes calendar | $10k/mo |
| **Productize** | 7–12 | Conversion OS retainers, white-label Factory for agencies | $30k/mo |
| **Scale** | 13–18 | Hire VA for touchpoints, Product Hunt relaunch, paid ads | $75k/mo |
| **Autopilot** | 19–24 | SGOS runs ops; founder = strategy + high-ticket closes only | $150k+/mo |

---

## Stack Reference

| Layer | Tool | Purpose |
|-------|------|---------|
| Build | This repo (Vite + Express) | Dashboard + API |
| Database | SQLite (`autopilot.db`) | Products, sales, expenses |
| AI | OpenAI (optional) | Enhanced content generation |
| Payments | Stripe / Gumroad | Engine + PDF products |
| Automation | Zapier / n8n | Welcome emails, calendar |
| Support | Crisp (optional) | Live chat on landing page |
| Affiliates | Rewardful | 30% on Engine + Factory |
| Host | Vercel / Hostinger | `tools.` + `autopilot.` subdomains |
| Distribution | Twitter/X, LinkedIn, Reddit, Product Hunt | 120 touchpoints/day |

**Monthly burn:** ~$50–200 (hosting + OpenAI + optional Crisp)  
**Break-even:** 1–2 Engine sales ($197) or 1 Conversion OS client ($697/mo)

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [DM_OUTREACH_CHEAT_SHEET.md](./DM_OUTREACH_CHEAT_SHEET.md) | Copy-paste scripts |
| [LANDING_PAGE_COPY_CHEAT_SHEET.md](./LANDING_PAGE_COPY_CHEAT_SHEET.md) | Page sections |
| [7_DAY_EXECUTION_CHECKLIST.md](./7_DAY_EXECUTION_CHECKLIST.md) | Hour-by-hour sprint |

**Governance reminder:** Draft free, send gated. Never auto-email, auto-DM, or increment Sent without proof URL.
