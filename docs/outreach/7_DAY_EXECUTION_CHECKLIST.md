# 7-Day Execution Checklist

Money Autopilot launch sprint — hour-by-hour tracker. Start on **Friday**. Target: live landing page → working product → first revenue by Day 4.

**Daily rule:** 120 touchpoints minimum. No exceptions.

---

## The Equinox Execution Rule

| Channel | Daily count |
|---------|-------------|
| Twitter/X DMs | 50 |
| LinkedIn messages | 20 |
| Reddit comments | 10 |
| Reddit DMs | 5 |
| Cold emails | 30 |
| Influencer outreaches | 3 |
| Facebook group posts | 2 |
| **Total** | **120** |

---

## Day 1 — Friday: Lock In

**Focus:** Live landing page + tracking  
**Revenue target:** $0

### Morning (9:00–12:00)
- [ ] Deploy `public/utility-websites/` to `tools.moneymagnettools.com`
- [ ] Paste hero + pricing from `LANDING_PAGE_COPY_CHEAT_SHEET.md` into Carrd/Webflow
- [ ] Set up Profit Tracker link in all CTAs
- [ ] Configure Google Analytics or Plausible on landing page
- [ ] Verify `autopilot.moneymagnettools.com` serves dashboard (`npm run build && npm start`)

### Afternoon (13:00–17:00)
- [ ] Write Twitter bio + pinned tweet (link to free tools)
- [ ] Create LinkedIn company/page or update personal headline
- [ ] Build prospect list: 100 Twitter, 50 LinkedIn, 30 emails (spreadsheet)
- [ ] Record 60-sec Loom: "What Money Autopilot does in 5 minutes"

### Evening (18:00–20:00)
- [ ] Send 30 cold emails (Template A from cheat sheet)
- [ ] Send 25 Twitter DMs (first contact script)
- [ ] Log touchpoints in tracker table

### Day 1 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 55+ | |
| Landing page live | Yes | |
| Loom recorded | Yes | |

---

## Day 2 — Saturday: Build MVP

**Focus:** Working product + payments  
**Revenue target:** $0

### Morning (9:00–12:00)
- [ ] Confirm autopilot cycle runs: `POST /api/autopilot/run`
- [ ] Test Approval Inbox flow (approve/decline, Sent=0)
- [ ] Set up Stripe/Gumroad checkout for Engine ($197)
- [ ] Wire payment link into landing page secondary CTA

### Afternoon (13:00–17:00)
- [ ] Generate first Daily Factory batch: `POST /api/factory/generate` or Shortcuts
- [ ] Review output in `output/YYYY-MM-DD_Five_Themes/`
- [ ] Create 5 short-form videos (screen recordings of dashboard)
- [ ] Schedule 3 posts for Sunday (don't publish yet — queue drafts)

### Evening (18:00–20:00)
- [ ] 50 Twitter DMs
- [ ] 10 Reddit value comments (no links unless asked)
- [ ] Update prospect list with reply statuses

### Day 2 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 60+ | |
| Checkout live | Yes | |
| Factory batch generated | Yes | |
| Videos recorded | 5 | |

---

## Day 3 — Sunday: Distribution

**Focus:** Content + 50 DM targets  
**Revenue target:** $0

### Morning (9:00–12:00)
- [ ] Publish 3 videos to Twitter/X, LinkedIn, TikTok (if ready)
- [ ] Write 1 long Reddit value post (workflow, no hard sell)
- [ ] Send 50 Twitter DMs (mix first contact + follow-ups)

### Afternoon (13:00–17:00)
- [ ] 20 LinkedIn connection requests + 10 messages
- [ ] 5 Reddit DMs (after helpful comments)
- [ ] Set up 5-email welcome sequence (Mailchimp/ConvertKit/Loops)
- [ ] Test opt-in flow from landing page

### Evening (18:00–20:00)
- [ ] 30 cold emails
- [ ] 3 influencer outreaches
- [ ] Prep Product Hunt assets (logo, gallery, maker comment)

### Day 3 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 120 | |
| Content published | 3+ | |
| Welcome sequence live | Yes | |
| Replies | 5+ | |

---

## Day 4 — Monday: First Revenue

**Focus:** 50 DMs + ads + emails  
**Revenue target:** $300

### Morning (9:00–12:00)
- [ ] Run autopilot cycle + approve best 3 drafts
- [ ] Launch Meta ads ($20/day — Variation 1 from landing copy)
- [ ] 50 Twitter DMs (prioritize warm leads from Days 1–3)

### Afternoon (13:00–17:00)
- [ ] 20 LinkedIn messages with Daily Factory sample attached
- [ ] 30 cold emails (Template B — agency angle)
- [ ] Book 2 demo calls (Calendly link in signature)

### Evening (18:00–20:00)
- [ ] Follow up all DEMO replies within 2 hours
- [ ] Close first Engine sale ($197) or Factory bundle ($84)
- [ ] Log sale in Profit Tracker

### Day 4 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 120 | |
| Demos booked | 2 | |
| Revenue | $300 | |

---

## Day 5 — Tuesday: Automate

**Focus:** Systems run without you  
**Revenue target:** $300

### Morning (9:00–12:00)
- [ ] Connect Zapier: new sale → welcome email + Slack notification
- [ ] Set up n8n Hermes calendar workflow (see `docs/N8N_HERMES_WIRING.md`)
- [ ] Configure Rewardful for affiliate links
- [ ] Apple Shortcut: daily Approval Inbox reminder (see `docs/SGOS_COMMAND.md`)

### Afternoon (13:00–17:00)
- [ ] Document SOP: daily 120 touchpoints (delegate-ready)
- [ ] 50 Twitter DMs + 20 LinkedIn (maintain volume)
- [ ] A/B test landing page headline (A vs B from cheat sheet)

### Evening (18:00–20:00)
- [ ] Review ad spend vs clicks
- [ ] 30 emails + 3 influencers
- [ ] Second sale push — follow up all open demos

### Day 5 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 120 | |
| Automations live | 3+ | |
| Revenue (cumulative) | $500+ | |

---

## Day 6 — Wednesday: Scale

**Focus:** Product Hunt + influencers  
**Revenue target:** $500

### Morning (9:00–12:00)
- [ ] Launch Product Hunt (maker comment from cheat sheet ready)
- [ ] Email list: "We're live on PH — would love your support"
- [ ] Engage every PH comment within 15 min

### Afternoon (13:00–17:00)
- [ ] Influencer follow-ups — send custom Looms
- [ ] 50 Twitter DMs referencing PH launch
- [ ] Post in 2 Facebook groups (value-first template)

### Evening (18:00–20:00)
- [ ] PH launch recap thread on Twitter
- [ ] 30 cold emails with PH social proof
- [ ] Log PH ranking + referral traffic

### Day 6 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 120 | |
| PH upvotes | 100+ | |
| Revenue (cumulative) | $700+ | |

---

## Day 7 — Thursday: Optimize

**Focus:** Hire prep + autopilot schedule  
**Revenue target:** $500+

### Morning (9:00–12:00)
- [ ] Weekly metrics review (see table below)
- [ ] Identify top 2 channels by reply rate — double down
- [ ] Write VA job post: "120 outbound touchpoints/day, scripts provided"
- [ ] Create 30-day content calendar (from master system Part 5)

### Afternoon (13:00–17:00)
- [ ] Record training Loom for VA (15 min — scripts + tracker)
- [ ] Fix top 3 landing page drop-off points
- [ ] 50 Twitter DMs + 20 LinkedIn

### Evening (18:00–20:00)
- [ ] Sign The Money Autopilot Pledge (below)
- [ ] Schedule Week 2 daily blocks in calendar
- [ ] 30 emails — Week 1 recap + offer for stragglers

### Day 7 metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Touchpoints | 120 | |
| Week 1 revenue | $1,000+ | |
| VA job posted | Yes | |

---

## Weekly Metrics Tracker

| Day | Touchpoints | Replies | Demos | Sales | Revenue | Notes |
|-----|-------------|---------|-------|-------|---------|-------|
| Fri | | | | | | |
| Sat | | | | | | |
| Sun | | | | | | |
| Mon | | | | | | |
| Tue | | | | | | |
| Wed | | | | | | |
| Thu | | | | | | |
| **Total** | 840 | 35+ | 7+ | 5+ | $1,000+ | |

---

## Monthly Ritual Template

**First Monday of each month:**
1. Review Profit Tracker CSV export
2. Calculate revenue per hour of founder time
3. Retire bottom 20% of outreach scripts (lowest reply rate)
4. Generate fresh Daily Factory batch for new vertical
5. Update landing page with new testimonial

---

## The Money Autopilot Pledge

I, ____________________, commit to executing the 7-day sprint with precision.

- I will hit **120 touchpoints per day** for 7 days.
- I will not auto-send without approval (**draft free, send gated**).
- I will log metrics daily, even when revenue is $0.
- I will ship before perfect — landing page live beats polished deck.
- I will review scripts weekly and kill what doesn't reply.

Signed: ____________________ Date: ____________________

---

## Success Criteria (End of Day 7)

| Criteria | Pass? |
|----------|-------|
| Landing page live with working CTAs | |
| Autopilot cycle + Approval Inbox tested | |
| Checkout accepting payments | |
| 840+ total touchpoints sent | |
| 5+ sales or $1,000+ revenue | |
| Welcome email sequence active | |
| 1+ automation (Zapier/n8n/Shortcut) running | |
| VA or Week 2 plan documented | |

---

## Quick Links

| Resource | Path |
|----------|------|
| Master system | [MONEY_AUTOPILOT_OUTREACH_SYSTEM.md](./MONEY_AUTOPILOT_OUTREACH_SYSTEM.md) |
| DM scripts | [DM_OUTREACH_CHEAT_SHEET.md](./DM_OUTREACH_CHEAT_SHEET.md) |
| Landing copy | [LANDING_PAGE_COPY_CHEAT_SHEET.md](./LANDING_PAGE_COPY_CHEAT_SHEET.md) |
| Domain setup | [../DOMAIN_SETUP.md](../DOMAIN_SETUP.md) |
| Utility deploy | [../UTILITY_WEBSITES.md](../UTILITY_WEBSITES.md) |

**BAKU8.** Execute 7 days. Then reset. Let the field come.
