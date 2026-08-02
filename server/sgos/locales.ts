export const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'de', 'zh', 'zh-TW', 'ja', 'ko', 'pt', 'pt-BR', 'ar', 'hi', 'ru',
] as const;

export type SgosLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SgosLocale = 'en';

export function normalizeLocale(raw?: string | null): SgosLocale {
  if (!raw) return DEFAULT_LOCALE;
  const lower = raw.toLowerCase();
  if (lower.startsWith('pt-br') || lower === 'pt_br') return 'pt-BR';
  if (lower.startsWith('zh-tw') || lower === 'zh_hant') return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh';
  const base = raw.split('-')[0].toLowerCase();
  const match = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lower || l.toLowerCase() === base);
  return match ?? DEFAULT_LOCALE;
}
