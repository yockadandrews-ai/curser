import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  normalizeLocale,
  type SgosLocale,
} from './locales';

import en from '../../messages/en.json';
import es from '../../messages/es.json';
import fr from '../../messages/fr.json';
import de from '../../messages/de.json';
import zh from '../../messages/zh.json';
import zhTW from '../../messages/zh-TW.json';
import ja from '../../messages/ja.json';
import ko from '../../messages/ko.json';
import pt from '../../messages/pt.json';
import ptBR from '../../messages/pt-BR.json';
import ar from '../../messages/ar.json';
import hi from '../../messages/hi.json';
import ru from '../../messages/ru.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  'zh-TW': { translation: zhTW },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
  'pt-BR': { translation: ptBR },
  ar: { translation: ar },
  hi: { translation: hi },
  ru: { translation: ru },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export default i18n;

export function setSgosLocale(locale: SgosLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export function getSgosLocale(): SgosLocale {
  return normalizeLocale(i18n.language || localStorage.getItem(LOCALE_STORAGE_KEY));
}
