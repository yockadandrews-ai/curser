import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isRtlLocale,
  normalizeLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type SgosLocale,
} from '../i18n/locales';
import { setSgosLocale } from '../i18n/config';

export function useSgosLocale() {
  const { locale: paramLocale } = useParams<{ locale?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const locale = normalizeLocale(paramLocale ?? i18n.language);

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale, i18n]);

  const changeLocale = (next: SgosLocale) => {
    setSgosLocale(next);
    const path = location.pathname.replace(/^\/sgos(\/[a-z]{2}(?:-[A-Z]{2})?)?/, '');
    const suffix = path === '' ? '' : path;
    navigate(`/sgos/${next}${suffix}`);
  };

  const path = (sub: string) => {
    const clean = sub.startsWith('/') ? sub.slice(1) : sub;
    return `/sgos/${locale}/${clean}`.replace(/\/$/, '');
  };

  return { locale, changeLocale, path, isRtl: isRtlLocale(locale), locales: SUPPORTED_LOCALES };
}

export function sgosLocaleRedirect(): string {
  const stored = localStorage.getItem('sgos_locale');
  const locale = normalizeLocale(stored ?? navigator.language);
  return `/sgos/${locale}`;
}

export { DEFAULT_LOCALE };
