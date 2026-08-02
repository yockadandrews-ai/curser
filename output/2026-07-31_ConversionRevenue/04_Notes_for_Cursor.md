# Handoff Notes for Cursor

**Date:** 2026-07-31
**Theme:** Conversion & Revenue
**Cluster:** ConversionRevenue
**Quality gate:** ✅ PASSED

## Priority Build Order
1. **PriceLift AI** — $297/mo or $2,497/yr — ROI positive if it lifts MRR by even 5%
   - Raise prices without losing customers — AI finds your optimal price point in 48 hours.
   - Integrations: Stripe/RevenueCat integration, CRM webhook, anonymized cohort analysis

2. **DemoClose Copilot** — $147/mo per seat or $997/mo team (up to 10 seats)
   - Turn more demos into paid contracts with real-time AI coaching during sales calls.
   - Integrations: Zoom/Google Meet API, Whisper transcription, CRM sync (HubSpot/Pipedrive)

3. **Referral Revenue Engine** — $97/mo + 2% of referral-attributed revenue
   - Launch a self-running referral program that generates 15–30% of new revenue on autopilot.
   - Integrations: Stripe/payment webhooks, unique referral codes, email automation (SendGrid/Resend)

4. **ChurnShield AI** — $197/mo for up to 1,000 accounts, $497/mo for 5,000
   - Catch at-risk customers before they cancel — AI predicts churn 14 days early and triggers saves.
   - Integrations: Product analytics (Mixpanel/PostHog), billing events, email/in-app messaging

5. **Upsell Moment Detector** — $127/mo or 3% of expansion revenue generated
   - Find the exact moment each customer is ready to upgrade — and send the perfect offer automatically.
   - Integrations: Usage event tracking, in-app messaging SDK, Stripe subscription upgrades

## Shared Infrastructure
- Auth layer (shared across cluster)
- Dashboard shell with Liquid Glass UI
- Stripe billing integration
- Email notification service

## Dependencies
- Apps 1–3 can scaffold in parallel
- App 4 (Churn/Upsell) depends on usage event pipeline from App 1
- Suite dashboard aggregates all app metrics

## Suggested First Sprint
Build **PriceLift AI** first — highest standalone sellability.
