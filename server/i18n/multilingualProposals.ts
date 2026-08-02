import fs from 'fs';
import path from 'path';
import { generateFactoryWorkflowDoc } from './factoryWorkflow.js';
import { OUTPUT_ROOT } from '../factory/generator.js';
import { THEME_CLUSTERS } from '../factory/themes.js';
import { generateLongFormSuiteProposal } from '../factory/longFormProposals.js';
import { getLocalizedTagline, formatLanguageSection, aiLanguageInstruction } from './multilingual.js';
import type { SupportedLocale } from './languages.js';
import { LANGUAGES, PHASE_1_LOCALES, MASTER_DASHBOARD_I18N, CONVERSION_APP_I18N, FACTORY_I18N_QUALITY_GATE } from './languages.js';

const GLASS = 'Liquid Glass UI — frosted panels, smooth micro-interactions, mobile-first';

export function generateMultilingualSuiteProposal(locale: SupportedLocale): string {
  const cluster = THEME_CLUSTERS['Conversion & Revenue'];
  const apps = cluster.apps.map(a => ({ ...a, liquidGlassNote: GLASS }));
  const base = generateLongFormSuiteProposal(apps, 'Conversion & Revenue', cluster);
  const tagline = getLocalizedTagline(locale);
  const lang = LANGUAGES.find(l => l.code === locale);

  if (locale === 'en') return base;

  return `# FULL SUITE PROPOSAL — ${cluster.suiteTitle}
**Language:** ${lang?.nativeName ?? locale} (${locale})

> ${aiLanguageInstruction(locale)}

**${tagline.headline}**  
${tagline.sub}  
${tagline.global}

---

${translateProposalBody(locale, tagline)}
`;
}

function translateProposalBody(locale: SupportedLocale, tagline: ReturnType<typeof getLocalizedTagline>): string {
  const cluster = THEME_CLUSTERS['Conversion & Revenue'];

  if (locale === 'es') {
    return `## Carta de presentación

Hola [Nombre],

No tienes un solo problema. Tienes cinco — y están conectados.

${cluster.suitePromise}

${tagline.global}

## Qué incluye

${cluster.suiteIncludes}

### Los cinco portales

${cluster.apps.map((a, i) => `#### ${i + 1}. ${a.appName}
**Promesa:** ${translateShort(a.oneLinePromise, 'es')}
**Métrica:** ${a.successMetric}
**Precio:** ${a.suggestedPricing}`).join('\n\n')}

## Precio del paquete

**${cluster.suitePricing}**

## Idiomas soportados

English · Español · Português (BR) · Français · Deutsch · 日本語 · 한국어 · 简体中文 · العربية · हिन्दी

## CTA

Inicia la prueba del Conversion OS completo o reserva una llamada de estrategia. Responde **"SUITE DEMO"**.

---
*Propuesta · Español · ${new Date().toISOString().split('T')[0]}*`;
  }

  if (locale === 'pt-BR') {
    return `## Carta de apresentação

Olá [Nome],

Você não tem um problema. Você tem cinco — e eles estão conectados.

${cluster.suitePromise}

${tagline.global}

## O que está incluído

${cluster.suiteIncludes}

### Os cinco portais

${cluster.apps.map((a, i) => `#### ${i + 1}. ${a.appName}
**Promessa:** ${translateShort(a.oneLinePromise, 'pt-BR')}
**Métrica:** ${a.successMetric}
**Preço:** ${a.suggestedPricing}`).join('\n\n')}

## Preço do pacote

**${cluster.suitePricing}**

## Idiomas suportados

English · Español · Português (BR) · Français · Deutsch · 日本語 · 한국어 · 简体中文 · العربية · हिन्दी

## CTA

Inicie o teste do Conversion OS completo ou agende uma call de estratégia. Responda **"SUITE DEMO"**.

---
*Proposta · Português (Brasil) · ${new Date().toISOString().split('T')[0]}*`;
  }

  return '';
}

function translateShort(text: string, locale: SupportedLocale): string {
  const map: Record<string, Partial<Record<SupportedLocale, string>>> = {
    'Know the market ceiling and price high-ticket services with precision.': {
      es: 'Conoce el techo del mercado y fija precios premium con precisión.',
      'pt-BR': 'Conheça o teto do mercado e precifique serviços premium com precisão.',
    },
    'Instant personalized demo of your service applied to any prospect\'s site.': {
      es: 'Demo personalizada instantánea de tu servicio en el sitio de cualquier prospecto.',
      'pt-BR': 'Demo personalizada instantânea do seu serviço no site de qualquer prospecto.',
    },
    'Live objection handling and buying-signal detection during the call.': {
      es: 'Manejo de objeciones en vivo y detección de señales de compra durante la llamada.',
      'pt-BR': 'Tratamento de objeções ao vivo e detecção de sinais de compra durante a call.',
    },
    'Automatically turn client success milestones into shareable referral assets.': {
      es: 'Convierte hitos de éxito del cliente en activos de referidos compartibles.',
      'pt-BR': 'Transforme marcos de sucesso do cliente em ativos de indicação compartilháveis.',
    },
    'Make client results visible in real time so retention and upsells become automatic.': {
      es: 'Resultados del cliente visibles en tiempo real — retención y upsells automáticos.',
      'pt-BR': 'Resultados do cliente visíveis em tempo real — retenção e upsells automáticos.',
    },
  };
  return map[text]?.[locale] ?? text;
}

export function generateI18nCursorHandoff(): string {
  const conversionApps = THEME_CLUSTERS['Conversion & Revenue'].apps;
  return `# i18n Technical Checklist — Cursor Handoff

## Phase 1 Languages
${PHASE_1_LOCALES.map(c => `- \`${c}\` — ${LANGUAGES.find(l => l.code === c)?.nativeName}`).join('\n')}

## UI: react-i18next + JSON locale files in src/locales/
## AI: aiLanguageInstruction(locale) on every generative call
## Storage: content.locale column + per-lead override
## Leads: leads table + resolveLeadLocale() for Bridge-Builder & Echo-Scale
## RTL: dir="rtl" for Arabic

## Conversion Apps
${conversionApps.map(a => `### ${a.appName}\n${(CONVERSION_APP_I18N[a.appName] ?? []).map(n => `- ${n}`).join('\n')}`).join('\n\n')}

## Master Dashboard
${MASTER_DASHBOARD_I18N.map(n => `- ${n}`).join('\n')}

## Factory Quality Gate
${FACTORY_I18N_QUALITY_GATE.map(n => `- ${n}`).join('\n')}

*Non-negotiable · ${new Date().toISOString().split('T')[0]}*
`;
}

export function generateConversionAppsWithI18n(): string {
  const cluster = THEME_CLUSTERS['Conversion & Revenue'];
  let md = `# Conversion Apps — Multilingual Specs\n\n`;
  for (const app of cluster.apps) {
    md += `## ${app.appName}\n\n${app.oneLinePromise}\n\n`;
    md += formatLanguageSection(app.appName, CONVERSION_APP_I18N[app.appName]);
    md += '\n\n';
  }
  md += `## Master Dashboard\n${MASTER_DASHBOARD_I18N.map(n => `- ${n}`).join('\n')}\n`;
  return md;
}

export function writeMultilingualPackage(): { paths: string[]; folder: string } {
  const base = path.join(OUTPUT_ROOT, '2026-07-31_Multilingual');
  fs.mkdirSync(base, { recursive: true });
  const paths: string[] = [];

  fs.writeFileSync(path.join(base, 'I18N_CURSOR_HANDOFF.md'), generateI18nCursorHandoff());
  paths.push('I18N_CURSOR_HANDOFF.md');

  fs.writeFileSync(path.join(base, 'Conversion_Apps_Multilingual_Specs.md'), generateConversionAppsWithI18n());
  paths.push('Conversion_Apps_Multilingual_Specs.md');

  fs.writeFileSync(path.join(base, 'Factory_Workflow_I18N.md'), generateFactoryWorkflowDoc());
  paths.push('Factory_Workflow_I18N.md');

  const proposalsDir = path.join(base, 'Multilingual_Proposals');
  fs.mkdirSync(proposalsDir, { recursive: true });
  for (const locale of ['en', 'es', 'pt-BR'] as SupportedLocale[]) {
    fs.writeFileSync(
      path.join(proposalsDir, `Suite_Conversion_OS_${locale.replace('-', '_')}.md`),
      generateMultilingualSuiteProposal(locale),
    );
  }

  fs.writeFileSync(path.join(base, 'README.md'), `# Multilingual Package

Phase 1: ${PHASE_1_LOCALES.join(', ')}

## Contents
- \`I18N_CURSOR_HANDOFF.md\` — engineering checklist for Cursor
- \`Conversion_Apps_Multilingual_Specs.md\` — per-app language requirements
- \`Factory_Workflow_I18N.md\` — revised daily factory workflow
- \`Multilingual_Proposals/\` — EN + ES + PT-BR suite proposals

Drop this folder into Cursor alongside Daily Factory output.
`);
  paths.push('README.md');
  return { paths, folder: '2026-07-31_Multilingual' };
}
