import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { isRtlLocale } from '../i18n';
import { CLIENT_LANGUAGES, CLIENT_LANGUAGES_PHASE2 } from '../i18n/languages';
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

  const select = (
    <select
      aria-label={t('language.switchTo')}
      value={current}
      onChange={e => handleChange(e.target.value)}
      className={compact ? 'input text-xs py-1.5 px-2 min-w-0' : 'input w-full text-sm'}
    >
      <optgroup label={t('language.phase1')}>
        {CLIENT_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
        ))}
      </optgroup>
      <optgroup label={t('language.phase2')}>
        {CLIENT_LANGUAGES_PHASE2.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
        ))}
      </optgroup>
    </select>
  );

  if (compact) return select;

  return (
    <div className="card text-xs">
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        <Globe size={14} className="text-money-400" />
        <span className="font-medium">{t('language.label')}</span>
      </div>
      {select}
      <p className="text-gray-600 mt-2">{t('factory.i18nGate')}</p>
    </div>
  );
}
