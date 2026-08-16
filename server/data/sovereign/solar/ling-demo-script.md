# Ling Avatar Demo — Solar (3 min)

**Status:** DRAFTED · **Sent:** 0 until Hermes handoff + lead reply YES  
**Vertical:** Solar · **Tier:** Entry $15K (50% deposit)

---

## Personalization tokens

| Token | Source |
|-------|--------|
| `{{company}}` | Hermes ticket |
| `{{city}}` | Hermes ticket / enrichment |
| `{{monthly_leads}}` | Qualify Q2 |
| `{{pain_point}}` | Default: leads die after 5pm |

---

## Script (avatar reads aloud)

**[0:00–0:20] Hook**

> {{company}}, I built this specifically for you.
> You told us {{pain_point}} — here's what that actually costs you.

**[0:20–1:30] Demo walkthrough**

> Watch what happens when a lead hits your site at 9:14pm on a Tuesday.
> [SCREEN: inbound form fill → AI responds in 12 seconds]
> The agent qualifies: own the home? Bill over $150? Timeline this quarter?
> [SCREEN: calendar slot booked → CRM updated → SMS confirmation sent]
> By morning, your rep opens HubSpot to a booked inspection — not a cold lead.

**[1:30–2:15] Proof frame**

> Installers like you typically recover 8–12 after-hours leads per month.
> At your volume — roughly {{monthly_leads}} inbound/month — that's 3–4 extra installs per quarter.
> We deploy this in 48 hours. No calls required to get started.

**[2:15–2:45] Close**

> Reply **YES** and I'll send the contract + onboarding form.
> 50% deposit secures your build slot. Signature triggers deployment same day.

**[2:45–3:00] Objection preload**

> "We already have a setter team" → AI handles overflow + nights/weekends; reps keep the closes.
> "What about compliance?" → Every conversation logged to CRM; you approve prompts before go-live.

---

## Async voice notes (objections)

1. **Price** — "Entry is $15K one-time build + monthly optimization. Most teams pay one SDR salary for worse coverage."
2. **Integration** — "We wire HubSpot or Salesforce in the deployment questionnaire — standard OAuth, no IT project."
3. **Timeline** — "48-hour launch from signed contract. 50 simulated conversations before live."

---

## Contract package fields

- Stripe link: `{{STRIPE_CHECKOUT_LINK}}` (configure `STRIPE_SOLAR_ENTRY_PRICE_ID`)
- Deposit: $7,500 (50%)
- Onboarding questionnaire: company URL, CRM type, calendar link, brand voice samples, service area ZIPs
