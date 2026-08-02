import type { SupportedLocale } from './languages.js';
import { DEFAULT_LOCALE, getLanguageMeta } from './languages.js';

/** Wrap AI system prompts with explicit language instruction */
export function aiLanguageInstruction(locale: SupportedLocale): string {
  const meta = getLanguageMeta(locale);
  const langName = meta?.nativeName ?? locale;
  if (locale === DEFAULT_LOCALE) {
    return 'Respond in clear, professional English suitable for B2B sales and service businesses.';
  }
  return `IMPORTANT: Generate ALL content in ${langName} (${locale}). Use natural, professional tone for local business culture. Keep product names in English where appropriate. Format numbers and currency for ${locale} locale.`;
}

/** Language & Accessibility block for app definitions */
export function formatLanguageSection(appName: string, supportedNotes?: string[]): string {
  const notes = supportedNotes ?? [
    'Phase 1: English, Spanish, Portuguese (BR), French, German, Japanese, Korean, Chinese, Arabic, Hindi',
    'UI fully keyed — no hard-coded English strings',
    'AI outputs routed with explicit locale in system prompt',
    'Content stored with language tag; per-lead override supported',
    'RTL layout support for Arabic',
  ];

  return `## Language & Accessibility

**Supported languages (Phase 1 launch):** English · Español · Português (BR) · Français · Deutsch · 日本語 · 한국어 · 简体中文 · العربية · हिन्दी

**${appName} localization:**
${notes.map(n => `- ${n}`).join('\n')}

**Sales positioning:** "Built for global service businesses — full experience in 10+ languages from day one."
`;
}

/** Sales messaging snippets per locale (for proposals) */
export const LOCALIZED_TAGLINES: Partial<Record<SupportedLocale, { headline: string; sub: string; global: string }>> = {
  en: {
    headline: 'Built for global service businesses',
    sub: 'Your AI pricing engine, live closer, and referral system speak your clients\' language.',
    global: 'One Conversion OS that works as powerfully in São Paulo, Madrid, Tokyo, or Dubai as it does in New York.',
  },
  es: {
    headline: 'Diseñado para negocios de servicios globales',
    sub: 'Tu motor de precios IA, cerrador en vivo y sistema de referidos hablan el idioma de tus clientes.',
    global: 'Un Conversion OS que funciona con la misma potencia en São Paulo, Madrid, Tokio o Dubái que en Nueva York.',
  },
  'pt-BR': {
    headline: 'Feito para negócios de serviços globais',
    sub: 'Seu motor de precificação IA, closer ao vivo e sistema de indicações falam a língua dos seus clientes.',
    global: 'Um Conversion OS tão poderoso em São Paulo, Madrid, Tóquio ou Dubai quanto em Nova York.',
  },
  fr: {
    headline: 'Conçu pour les entreprises de services mondiales',
    sub: 'Votre moteur de tarification IA, closer en direct et système de parrainage parlent la langue de vos clients.',
    global: 'Un Conversion OS aussi puissant à São Paulo, Madrid, Tokyo ou Dubaï qu\'à New York.',
  },
  de: {
    headline: 'Für globale Dienstleistungsunternehmen entwickelt',
    sub: 'Ihre KI-Preisengine, Live-Closer und Empfehlungssystem sprechen die Sprache Ihrer Kunden.',
    global: 'Ein Conversion OS — so leistungsstark in São Paulo, Madrid, Tokio oder Dubai wie in New York.',
  },
  ja: {
    headline: 'グローバルサービスビジネス向けに設計',
    sub: 'AI価格エンジン、ライブクローザー、紹介システムがクライアントの言語で機能します。',
    global: 'ニューヨークと同じ力を、サンパウロ、マドリード、東京、ドバイでも発揮するConversion OS。',
  },
  ko: {
    headline: '글로벌 서비스 비즈니스를 위해 설계',
    sub: 'AI 가격 엔진, 라이브 클로저, 추천 시스템이 고객의 언어로 작동합니다.',
    global: '뉴욕만큼 상파울루, 마드리드, 도쿄, 두바이에서도 강력한 Conversion OS.',
  },
  'zh-CN': {
    headline: '为全球服务企业打造',
    sub: '您的AI定价引擎、实时成交助手和推荐系统说客户的语言。',
    global: '一套Conversion OS——在圣保罗、马德里、东京或迪拜与纽约同样强大。',
  },
  ar: {
    headline: 'مصمم لأعمال الخدمات العالمية',
    sub: 'محرك التسعير بالذكاء الاصطناعي ونظام الإحالات يتحدثان لغة عملائك.',
    global: 'نظام Conversion OS قوي في ساو باولو ومدريد وطوكيو ودبي كما في نيويork.',
  },
  hi: {
    headline: 'वैश्विक सेवा व्यवसायों के लिए निर्मित',
    sub: 'आपका AI मूल्य निर्धारण, लाइव क्लोज़र और रेफ़रल सिस्टम आपके ग्राहकों की भाषा बोलता है।',
    global: 'एक Conversion OS — न्यूयॉर्क जितना शक्तिशाली साओ पाउलो, माद्रिद, टोक्यो या दुबई में।',
  },
};

export function getLocalizedTagline(locale: SupportedLocale) {
  return LOCALIZED_TAGLINES[locale] ?? LOCALIZED_TAGLINES.en!;
}
