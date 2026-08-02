import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import es from '../locales/es.json';
import ptBR from '../locales/pt-BR.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import zhCN from '../locales/zh-CN.json';
import ar from '../locales/ar.json';
import hi from '../locales/hi.json';

export const PHASE_1_LOCALES = [
  'en', 'es', 'pt-BR', 'fr', 'de', 'ja', 'ko', 'zh-CN', 'ar', 'hi',
] as const;

export type AppLocale = typeof PHASE_1_LOCALES[number];

export const RTL_LOCALES = new Set<AppLocale>(['ar']);

const LOCALE_STORAGE_KEY = 'conversion-os-locale';

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale as AppLocale);
}

export function applyDocumentDirection(locale: string): void {
  const rtl = isRtlLocale(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      'pt-BR': { translation: ptBR },
      fr: { translation: fr },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      'zh-CN': { translation: zhCN },
      ar: { translation: ar },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    supportedLngs: [...PHASE_1_LOCALES],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
});

applyDocumentDirection(i18n.language || 'en');

export default i18n;
