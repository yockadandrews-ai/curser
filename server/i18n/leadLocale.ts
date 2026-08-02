import type { SupportedLocale } from './languages.js';
import { aiLanguageInstruction } from './multilingual.js';
import { resolveLeadLocale, type LeadSourceApp } from '../leads.js';

export interface LeadContentContext {
  leadId: string;
  sourceApp: LeadSourceApp;
  acceptLanguage?: string;
  accountLocale?: SupportedLocale;
}

/** Build AI system prompt with lead-specific locale for Bridge-Builder / Echo-Scale */
export function buildLeadLocalizedPrompt(ctx: LeadContentContext, basePrompt: string): string {
  const { locale, source } = resolveLeadLocale(ctx.leadId, {
    acceptLanguage: ctx.acceptLanguage,
    accountLocale: ctx.accountLocale,
  });
  const langInstruction = aiLanguageInstruction(locale);
  const appNote = ctx.sourceApp === 'bridge-builder'
    ? 'Generate demo preview text and CTA copy for this prospect.'
    : 'Generate gift-box assets, testimonial prompts, and social share text for this client.';

  return `${langInstruction}

${appNote}
Locale resolved from: ${source} (${locale})

${basePrompt}`;
}

export { resolveLeadLocale };
