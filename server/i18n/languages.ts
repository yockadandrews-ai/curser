/** Multilingual configuration — Conversion OS & Daily Factory */

export const PHASE_1_LOCALES = [
  'en', 'es', 'pt-BR', 'fr', 'de', 'ja', 'ko', 'zh-CN', 'ar', 'hi',
] as const;

export const PHASE_2_LOCALES = [
  'it', 'nl', 'tr', 'id', 'vi', 'pl', 'ru', 'th', 'zh-TW',
] as const;

export type Phase1Locale = typeof PHASE_1_LOCALES[number];
export type SupportedLocale = Phase1Locale | typeof PHASE_2_LOCALES[number];

export interface LanguageMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  phase: 1 | 2 | 3;
  rtl?: boolean;
  commercialPriority: number;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', phase: 1, commercialPriority: 1 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', phase: 1, commercialPriority: 2 },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', phase: 1, commercialPriority: 3 },
  { code: 'fr', name: 'French', nativeName: 'Français', phase: 1, commercialPriority: 4 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', phase: 1, commercialPriority: 5 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', phase: 1, commercialPriority: 6 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', phase: 1, commercialPriority: 7 },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', phase: 1, commercialPriority: 8 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', phase: 1, rtl: true, commercialPriority: 9 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', phase: 1, commercialPriority: 10 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', phase: 2, commercialPriority: 11 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', phase: 2, commercialPriority: 12 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', phase: 2, commercialPriority: 13 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', phase: 2, commercialPriority: 14 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', phase: 2, commercialPriority: 15 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', phase: 2, commercialPriority: 16 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', phase: 2, commercialPriority: 17 },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', phase: 2, commercialPriority: 18 },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', phase: 2, commercialPriority: 19 },
];

export const DEFAULT_LOCALE: Phase1Locale = 'en';

export function getLanguageMeta(code: string): LanguageMeta | undefined {
  return LANGUAGES.find(l => l.code === code);
}

export function isRtlLocale(code: string): boolean {
  return getLanguageMeta(code)?.rtl === true;
}

export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) return DEFAULT_LOCALE;
  const lower = input.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('zh-tw') || lower === 'zh-hant') return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh-CN';
  const match = LANGUAGES.find(l => l.code.toLowerCase() === lower || l.code.toLowerCase().startsWith(lower));
  return (match?.code ?? DEFAULT_LOCALE) as SupportedLocale;
}

export function detectLocaleFromHeader(acceptLanguage?: string): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const parts = acceptLanguage.split(',').map(p => p.split(';')[0].trim());
  for (const part of parts) {
    const normalized = normalizeLocale(part);
    if (LANGUAGES.some(l => l.code === normalized)) return normalized;
  }
  return DEFAULT_LOCALE;
}

/** Per-app multilingual capability notes for Conversion OS */
export const CONVERSION_APP_I18N: Record<string, string[]> = {
  'Offer-Optics AI': [
    'Price recommendations and competitor insights in user language',
    'Glass Slider labels and tooltips fully localized',
    'Revenue-impact explanations with locale-aware currency formatting',
  ],
  'Bridge-Builder AI': [
    'Demo preview text in prospect or user language',
    'Shareable links detect recipient Accept-Language when possible',
    'CTA and overlay copy localized per lead language tag',
  ],
  'Closer-Command AI': [
    'Live Whisper Text rebuttals in user language',
    'Buying-signal cues and post-call summaries language-specific',
    'Objection libraries improve per language over time',
  ],
  'Echo-Scale AI': [
    'Gift-box assets and testimonial prompts in client language',
    'Social share text optimized per locale for higher sharing',
  ],
  'Value-Verify AI': [
    'Win Cards and ROI notifications in client preferred language',
    'Slack/SMS/email templates localized',
  ],
};

export const MASTER_DASHBOARD_I18N = [
  'All panels, timelines, notifications, and health scores mirror user language',
  'Cross-app automations preserve language context end-to-end',
  'Metric formatting: dates, numbers, currency per locale',
  'RTL layout for Arabic with Liquid Glass typography adaptation',
];

export const FACTORY_I18N_QUALITY_GATE = [
  'App definition includes Language & Accessibility section',
  'Proposals generated in primary + optional parallel language versions',
  'Master Notes for Cursor include i18n scaffolding requirements',
  'Generated content stored with language tag for consistent lead treatment',
  'Fallback to English with user-visible note for unsupported edge cases',
];
