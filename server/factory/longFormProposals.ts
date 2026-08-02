import type { AppDefinition, ThemeCluster, FactoryTheme } from './themes.js';
import { THEME_CLUSTERS, FACTORY_THEMES } from './themes.js';

function parseMidPrice(pricing: string): number | null {
  const nums = pricing.match(/\$(\d+)/g);
  if (!nums) return null;
  const values = nums.map(n => parseInt(n.replace('$', ''), 10));
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function roiExample(app: AppDefinition): string {
  const mid = parseMidPrice(app.suggestedPricing) ?? 149;
  const metric = app.successMetric;
  if (metric.includes('%')) {
    const pct = metric.match(/(\d+)[–-]?(\d+)?%/)?.[1] ?? '20';
    return `If you're doing $20,000/mo today, a ${pct}% improvement driven by ${app.appName} = **$${(20000 * parseInt(pct) / 100).toLocaleString()}/mo** in new value — against a **$${mid}/mo** tool cost. That's a **${Math.round(20000 * parseInt(pct) / 100 / mid)}x+ ROI** in month one alone.`;
  }
  return `At **$${mid}/mo**, most ${app.targetCustomer.split('(')[0].trim().toLowerCase()} recover the subscription cost within the first 2–3 weeks of use. ${app.successMetric}.`;
}

export function generateLongFormSingleProposal(
  app: AppDefinition,
  theme: FactoryTheme,
  cluster: ThemeCluster,
): string {
  const mid = parseMidPrice(app.suggestedPricing) ?? 149;
  const slug = app.appName.replace(/\s+/g, '');

  return `# FULL SALES PROPOSAL — ${app.appName}

> **Theme:** ${theme} · **Cluster:** ${cluster.clusterName} · **Format:** Long-form (email + LinkedIn ready)

---

## Email Subject Lines (A/B/C test these)

**A:** ${app.oneLinePromise}  
**B:** [First Name], you're probably leaving money on the table with pricing  
**C:** How ${app.targetCustomer.split(',')[0].trim().toLowerCase()} are using AI to ${app.successMetric.toLowerCase()}

---

## The Letter

Hi [First Name],

I'll keep this direct because your time is worth more than a fluffy pitch.

You're running a real business — ${app.targetCustomer.toLowerCase()}. You've built something people want. But there's a gap between the value you deliver and the systems you use to capture that value. That gap has a dollar amount attached to it, and it's compounding every month you wait.

**${app.coreProblem}**

I've watched this pattern dozens of times. Smart founders. Good offers. Solid delivery. And still — revenue that should be theirs leaks out through broken processes, wrong tools, or no system at all. The frustrating part? It's fixable. Not in six months. Not after hiring a consultant. In weeks.

That's why we built **${app.appName}**.

${app.oneLinePromise}

${app.differentiator}

---

## What ${app.appName} Actually Does (Plain English)

${app.aiDoes.map((b, i) => `**${i + 1}. ${b.split('—')[0].split('—')[0].trim()}** — ${b}`).join('\n\n')}

Every feature above connects to one outcome: **${app.successMetric}**.

---

## A Real Scenario (What Week 1 Looks Like)

**Monday:** You connect ${app.technicalNotes.split(',')[0].trim()} — setup takes under 30 minutes.  
**Tuesday:** ${app.appName} runs its first analysis cycle. You see your baseline score and 3 immediate opportunities.  
**Wednesday:** You act on the #1 recommendation.  
**By Friday:** You have measurable movement — not a dashboard full of vanity metrics, but a number that ties to revenue or retention.

This isn't a "set it and forget it" black box. It's a system that shows its work.

---

## Why 2026 Alternatives Fall Short

Most tools in this space were built for a different buyer:

- Enterprise SaaS companies with data teams  
- E-commerce brands optimizing SKUs  
- Generic "AI assistants" with no domain context  

**${app.appName}** is built for **${app.targetCustomer.toLowerCase()}** — with ${app.differentiator.toLowerCase()}.

---

## Expected Outcomes & Proof Points

| Metric | Target |
|--------|--------|
| Primary success metric | ${app.successMetric} |
| Time to first result | 14–30 days |
| Setup time | Under 1 hour |
| Integrations | ${app.technicalNotes} |

${roiExample(app)}

---

## Pricing & Offer

**${app.suggestedPricing}**

**What's included:**
- Full platform access (no feature gating on core workflows)
- Onboarding setup + configuration call
- 30-day success guarantee
- Email support with 24hr response SLA
- Liquid Glass UI — premium interface included

**Launch offer (optional for early buyers):**
> First 10 clients this month: lock in founding-member pricing + priority feature requests.

---

## FAQ

**Q: How is this different from ChatGPT + prompts?**  
A: ${app.appName} is wired to your ${app.technicalNotes}. It runs automatically, learns from your data, and produces repeatable outputs — not one-off chat responses.

**Q: How fast will I see results?**  
A: Most users see directional improvement within 14 days. Full metric impact typically within 60 days: ${app.successMetric}.

**Q: Do I need a developer to set this up?**  
A: No. Standard integrations connect in minutes. Technical notes: ${app.technicalNotes}.

**Q: Can I cancel anytime?**  
A: Yes. Month-to-month. No annual lock-in required (annual discount available).

**Q: What if it doesn't work for my niche?**  
A: 30-day guarantee. If you don't see progress toward ${app.successMetric.split(' within')[0] || app.successMetric}, full refund on month one.

---

## Objection Handlers (for calls/DMs)

**"I already have a tool for this."**  
→ "Most people do — but it's usually built for SaaS or ecom. ${app.differentiator} When did yours last update based on *your* live pipeline?"

**"I don't have time to learn another tool."**  
→ "Setup is under an hour. ${app.appName} is designed to *save* time, not add admin. Week 1 should return 3+ hours."

**"It's too expensive."**  
→ ${roiExample(app)}

---

## Call to Action

**Primary CTA (email reply):**  
Reply **"${slug.toUpperCase()} DEMO"** and I'll send a 15-minute walkthrough recorded specifically for your situation.

**LinkedIn DM version:**  
> Hey [Name] — saw you're in [niche]. We built ${app.appName} for exactly this: ${app.oneLinePromise.toLowerCase()} Worth a 15-min look? No pitch deck — just the product.

**Calendar CTA:**  
[Book 15-min demo → calendly.com/your-link]

---

## Risk Reversal (use verbatim)

*"If ${app.appName} doesn't move you measurably toward ${app.successMetric.split(' within')[0] || app.successMetric} within 60 days, we'll refund your first month. You keep any assets, reports, or configurations generated. Zero risk on your side."*

---

## P.S.

The cost of waiting isn't $${mid}/mo — it's every week of ${app.coreProblem.toLowerCase().replace(/\.$/, '')}. That math gets ugly fast.

— [Your Name]  
[Company] · ${theme} Suite available (save vs buying standalone)

---
*Long-form proposal · Daily Factory · ${new Date().toISOString().split('T')[0]}*
`;
}

export function generateLongFormSuiteProposal(
  apps: AppDefinition[],
  theme: FactoryTheme,
  cluster: ThemeCluster,
): string {
  const suiteMid = parseMidPrice(cluster.suitePricing) ?? 797;
  const standaloneTotal = apps.reduce((s, a) => s + (parseMidPrice(a.suggestedPricing) ?? 149), 0);
  const savings = standaloneTotal - suiteMid;

  return `# FULL SUITE PROPOSAL — ${cluster.suiteTitle}

> **Theme:** ${theme} · **Format:** Long-form cluster/suite proposal

---

## Email Subject Lines

**A:** The complete ${theme.toLowerCase()} operating system — 5 portals, one dashboard  
**B:** [First Name], stop buying point solutions (there's a better way)  
**C:** How top ${apps[0].targetCustomer.split(',')[0].trim().toLowerCase()} run ${theme.toLowerCase()} on autopilot

---

## The Letter

Hi [First Name],

You don't have one problem. You have five — and they're connected.

${cluster.suitePromise}

Most founders try to solve these one tool at a time. A pricing spreadsheet here. A demo tool there. A churn alert in another tab. Six months later: five subscriptions, zero shared data, and a team that's tired of switching contexts.

**${cluster.suiteTitle}** replaces that fragmentation with one integrated system.

---

## What's Included

${cluster.suiteIncludes}

### The Five Portals

${apps.map((a, i) => `#### ${i + 1}. ${a.appName}
**Promise:** ${a.oneLinePromise}  
**Metric:** ${a.successMetric}  
**Standalone:** ${a.suggestedPricing}`).join('\n\n')}

---

## Why the Suite Beats Five Separate Tools

| Point solution approach | ${cluster.suiteTitle} |
|------------------------|----------------------|
| 5 logins, 5 invoices | 1 dashboard, 1 subscription |
| Data stuck in silos | Shared event bus — insights cross-pollinate |
| 5 onboarding cycles | Single setup, 2-week go-live |
| ~$${standaloneTotal.toLocaleString()}/mo if bought separately | **${cluster.suitePricing}** |

**Estimated savings:** ~$${Math.max(savings, 0).toLocaleString()}/mo vs standalone

---

## Combined Outcomes

${apps.map(a => `- **${a.appName}:** ${a.successMetric}`).join('\n')}

---

## Pricing

**${cluster.suitePricing}**

- All 5 portals + Master Dashboard  
- Shared Liquid Glass design system  
- Cross-portal analytics  
- Priority support  
- Single onboarding program  

**Start smaller:** Any single portal available at standalone pricing. Upgrade anytime — we credit previous payments.

---

## FAQ

**Q: Can I start with just one portal?**  
A: Yes. Most clients start with **${apps[0].appName}** or **${apps[1].appName}**, then expand once they see ROI.

**Q: How long to deploy the full suite?**  
A: 2–3 weeks for full suite vs 8–12 weeks integrating five separate vendors.

**Q: Is there a contract?**  
A: Month-to-month available. Annual plans include 2 months free.

---

## Call to Action

${cluster.suiteCta}

Reply **"SUITE DEMO"** or book here: [calendly.com/your-link]

---

## Risk Reversal

Start with one portal. If it delivers, expand to the suite with full credit applied. If the suite doesn't outperform your current stack within 90 days, we'll work with you on a fair exit — no hostage contracts.

---
*Long-form suite proposal · ${theme} · ${new Date().toISOString().split('T')[0]}*
`;
}

export function getAllAppsForCatalog(): Array<AppDefinition & { theme: FactoryTheme; category: string }> {
  const all: Array<AppDefinition & { theme: FactoryTheme; category: string }> = [];
  for (const theme of FACTORY_THEMES) {
    const cluster = THEME_CLUSTERS[theme];
    for (const app of cluster.apps) {
      all.push({
        ...app,
        theme,
        category: theme.split(' & ')[0].toLowerCase(),
      });
    }
  }
  return all;
}
