import { useTranslation } from 'react-i18next';
import { useSgosLocale } from '../../i18n/useSgosLocale';
import { LOCALE_NAMES, type SgosLocale } from '../../i18n/locales';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { locale, changeLocale, locales } = useSgosLocale();

  return (
    <div className={compact ? '' : 'rounded-xl bg-sgos-900 border border-sgos-800 p-4'}>
      {!compact && (
        <label className="block text-xs text-gray-400 mb-2" htmlFor="sgos-locale">
          {t('commandCenter.languageLabel')}
        </label>
      )}
      <select
        id="sgos-locale"
        value={locale}
        onChange={(e) => changeLocale(e.target.value as SgosLocale)}
        className="sgos-input text-sm"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
