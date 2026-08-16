/**
 * Ling Closer — personalized demo, async objections, contract package
 */

import fs from 'fs';
import type { HermesHandoffTicket, LingDemoPackage, SovereignVerticalId } from './schemas.js';
import { getVertical, SOVEREIGN_PRICING } from './config.js';

function loadDemoTemplate(vertical: SovereignVerticalId): string {
  const config = getVertical(vertical);
  if (fs.existsSync(config.lingDemoScriptPath)) {
    return fs.readFileSync(config.lingDemoScriptPath, 'utf-8');
  }
  return `# Demo — ${config.label}\n\nPersonalized demo for {{company}}.`;
}

function fillTokens(
  template: string,
  ticket: HermesHandoffTicket,
  vertical: SovereignVerticalId,
): string {
  const config = getVertical(vertical);
  const volume = ticket.qualifyAnswers?.monthlyLeadVolume ?? 100;
  const pain = ticket.qualifyAnswers?.painPoint || config.painPointDefault;

  return template
    .replace(/\{\{company\}\}/g, ticket.company || ticket.name)
    .replace(/\{\{city\}\}/g, 'your market')
    .replace(/\{\{monthly_leads\}\}/g, String(volume))
    .replace(/\{\{pain_point\}\}/g, pain);
}

const OBJECTION_VOICE_NOTES = [
  'Price — Entry is $15K one-time build + monthly optimization. Most teams pay one SDR salary for worse coverage.',
  'Integration — We wire HubSpot or Salesforce in the onboarding questionnaire. Standard OAuth, no IT project.',
  'Timeline — 48-hour launch from signed contract. 50 simulated conversations before live.',
];

const ONBOARDING_QUESTIONNAIRE = [
  'Company website URL',
  'CRM platform (HubSpot / Salesforce / GoHighLevel / other)',
  'Calendar booking link',
  'Brand voice samples (2–3 past emails or scripts)',
  'Service area ZIP codes',
  'Primary contact for deployment',
];

export function buildLingDemoPackage(
  ticket: HermesHandoffTicket,
  tier: 'entry' | 'enterprise' = 'entry',
): LingDemoPackage {
  const vertical = ticket.vertical;
  const config = getVertical(vertical);
  const pricing = config.pricing.find(p => p.id === tier) ?? config.pricing[0];
  const depositUsd = Math.round(pricing.priceUsd * (pricing.depositPct / 100));
  const template = loadDemoTemplate(vertical);
  const scriptMarkdown = fillTokens(template, ticket, vertical);

  const stripeLink =
    process.env[`STRIPE_${vertical.toUpperCase()}_${tier.toUpperCase()}_CHECKOUT_URL`] ||
    `https://checkout.stripe.com/pay/${pricing.stripeProductHint}`;

  return {
    ticketId: ticket.id,
    company: ticket.company || ticket.name,
    vertical,
    scriptMarkdown,
    voiceNoteObjections: OBJECTION_VOICE_NOTES,
    contractPackage: {
      tier,
      priceUsd: pricing.priceUsd,
      depositUsd,
      stripeLinkPlaceholder: stripeLink,
      onboardingQuestionnaire: ONBOARDING_QUESTIONNAIRE,
    },
  };
}

export function parseYesReply(message: string): boolean {
  return /^\s*(yes|y|yeah|yep|let's do it|send it|proceed)\s*$/i.test(message.trim());
}

export function buildContractEmailBody(pkg: LingDemoPackage): string {
  return `Hi ${pkg.company},

As discussed — here's your Solar AI Agent package.

**Investment:** $${pkg.contractPackage.priceUsd.toLocaleString()} (${pkg.contractPackage.tier})
**Deposit (50%):** $${pkg.contractPackage.depositUsd.toLocaleString()}
**Pay deposit:** ${pkg.contractPackage.stripeLinkPlaceholder}

Once signed and deposit clears, K3 deployment starts within 48 hours.

Onboarding questionnaire attached — please complete before build begins.

Reply YES if you're ready and I'll send the DocuSign.

— Ling (async · no call required)
`;
}

export function getDefaultPricingSummary(): { entryUsd: number; enterpriseUsd: number; depositPct: number } {
  return { ...SOVEREIGN_PRICING };
}
