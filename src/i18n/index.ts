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
import it from '../locales/it.json';
import nl from '../locales/nl.json';
import tr from '../locales/tr.json';
import id from '../locales/id.json';
import vi from '../locales/vi.json';
import pl from '../locales/pl.json';
import ru from '../locales/ru.json';
import th from '../locales/th.json';
import zhTW from '../locales/zh-TW.json';

import { ALL_CLIENT_LANGUAGES, isRtlLocale } from './languages';

export const PHASE_1_LOCALES = [
  'en', 'es', 'pt-BR', 'fr', 'de', 'ja', 'ko', 'zh-CN', 'ar', 'hi',
] as const;

export const PHASE_2_LOCALES = [
  'it', 'nl', 'tr', 'id', 'vi', 'pl', 'ru', 'th', 'zh-TW',
] as const;

export const ALL_LOCALES = [...PHASE_1_LOCALES, ...PHASE_2_LOCALES] as const;

export type AppLocale = typeof ALL_LOCALES[number];

export { isRtlLocale } from './languages';

const LOCALE_STORAGE_KEY = 'conversion-os-locale';

export function applyDocumentDirection(locale: string): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
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
      it: { translation: it },
      nl: { translation: nl },
      tr: { translation: tr },
      id: { translation: id },
      vi: { translation: vi },
      pl: { translation: pl },
      ru: { translation: ru },
      th: { translation: th },
      'zh-TW': { translation: zhTW },
    },
    fallbackLng: 'en',
    supportedLngs: ALL_CLIENT_LANGUAGES.map(l => l.code),
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
