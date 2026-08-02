import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { isRtlLocale } from '../i18n';
import { CLIENT_LANGUAGES } from '../i18n/languages';
import { api } from '../api';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = i18n.language;

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('conversion-os-locale', code);
    document.documentElement.lang = code;
    document.documentElement.dir = isRtlLocale(code) ? 'rtl' : 'ltr';
    api.setLocale(code).catch(() => undefined);
  };

  if (compact) {
    return (
      <select
        aria-label={t('language.switchTo')}
        value={current}
        onChange={e => handleChange(e.target.value)}
        className="input text-xs py-1.5 px-2 min-w-0"
      >
        {CLIENT_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="card text-xs">
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        <Globe size={14} className="text-money-400" />
        <span className="font-medium">{t('language.label')}</span>
      </div>
      <select
        aria-label={t('language.switchTo')}
        value={current}
        onChange={e => handleChange(e.target.value)}
        className="input w-full text-sm"
      >
        {CLIENT_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
      <p className="text-gray-600 mt-2">{t('factory.i18nGate')}</p>
    </div>
  );
}
