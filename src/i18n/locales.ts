/** Supported SGOS locales — add a messages/{code}.json to extend */
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'pt',
  'pt-BR',
  'ar',
  'hi',
  'ru',
] as const;

export type SgosLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SgosLocale = 'en';

export const RTL_LOCALES: SgosLocale[] = ['ar'];

export const LOCALE_NAMES: Record<SgosLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  'pt-BR': 'Português (BR)',
  ar: 'العربية',
  hi: 'हिन्दी',
  ru: 'Русский',
};

/** Web Speech API BCP-47 tags */
export const SPEECH_LOCALES: Record<SgosLocale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja-JP',
  ko: 'ko-KR',
  pt: 'pt-PT',
  'pt-BR': 'pt-BR',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ru: 'ru-RU',
};

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale as SgosLocale);
}

export function normalizeLocale(raw?: string | null): SgosLocale {
  if (!raw) return DEFAULT_LOCALE;
  const lower = raw.toLowerCase();
  if (lower.startsWith('pt-br') || lower === 'pt_br') return 'pt-BR';
  if (lower.startsWith('zh-tw') || lower === 'zh_hant') return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh';
  const base = raw.split('-')[0].toLowerCase();
  const match = SUPPORTED_LOCALES.find(
    (l) => l.toLowerCase() === lower || l.toLowerCase() === base,
  );
  return match ?? DEFAULT_LOCALE;
}

export const LOCALE_STORAGE_KEY = 'sgos_locale';
