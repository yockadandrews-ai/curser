import type { SupportedLocale } from './languages.js';
import { DEFAULT_LOCALE, LANGUAGES, PHASE_1_LOCALES, PHASE_2_LOCALES, detectLocaleFromHeader, normalizeLocale } from './languages.js';
import { getLocalePreference, setLocalePreference } from './preferences.js';

export function getI18nCatalog() {
  return {
    defaultLocale: DEFAULT_LOCALE,
    phase1: PHASE_1_LOCALES,
    phase2: PHASE_2_LOCALES,
    languages: LANGUAGES,
    preference: getLocalePreference(),
  };
}

export function resolveRequestLocale(acceptLanguage?: string, bodyLocale?: string): SupportedLocale {
  if (bodyLocale) return normalizeLocale(bodyLocale);
  const saved = getLocalePreference();
  if (saved) return saved;
  return detectLocaleFromHeader(acceptLanguage);
}

export { getLocalePreference, setLocalePreference };
