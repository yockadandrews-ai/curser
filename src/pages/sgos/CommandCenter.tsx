import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tag, Layers, Truck, CheckCircle, ChevronRight } from 'lucide-react';
import { useSgosLocale } from '../../i18n/useSgosLocale';
import LanguageSwitcher from '../../components/sgos/LanguageSwitcher';

export default function CommandCenter() {
  const { t } = useTranslation();
  const { path } = useSgosLocale();

  const shortcuts = [
    {
      to: path('field-tag'),
      label: t('commandCenter.fieldTag'),
      desc: t('commandCenter.fieldTagDesc'),
      color: 'from-gray-900 to-black',
      border: 'border-gray-700',
      icon: Tag,
      text: 'text-white',
    },
    {
      to: path('batch-log'),
      label: t('commandCenter.batchLog'),
      desc: t('commandCenter.batchLogDesc'),
      color: 'from-blue-900 to-blue-950',
      border: 'border-blue-700/50',
      icon: Layers,
      text: 'text-blue-100',
    },
    {
      to: path('dispatch'),
      label: t('commandCenter.dispatch'),
      desc: t('commandCenter.dispatchDesc'),
      color: 'from-emerald-900 to-emerald-950',
      border: 'border-emerald-700/50',
      icon: Truck,
      text: 'text-emerald-100',
    },
    {
      to: path('ack'),
      label: t('commandCenter.ack'),
      desc: t('commandCenter.ackDesc'),
      color: 'from-red-900 to-red-950',
      border: 'border-red-700/50',
      icon: CheckCircle,
      text: 'text-red-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map(({ to, label, desc, color, border, icon: Icon, text }) => (
          <Link
            key={to}
            to={to}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} border ${border} p-4 min-h-[120px] flex flex-col justify-between active:scale-[0.97] transition-transform shadow-lg`}
          >
            <Icon size={22} className={`${text} opacity-80`} />
            <div>
              <p className={`font-bold text-sm tracking-wide ${text}`}>{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to={path('field-tag')}
        className="block rounded-2xl bg-gradient-to-r from-sgos-800 via-sgos-900 to-sgos-800 border border-sgos-accent/30 p-5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sgos-accent/20 flex items-center justify-center">
              <span className="text-sgos-accent font-black text-lg">S</span>
            </div>
            <div>
              <p className="font-bold text-white text-lg">{t('commandCenter.cmdTitle')}</p>
              <p className="text-xs text-gray-400">{t('commandCenter.cmdDesc')}</p>
            </div>
          </div>
          <ChevronRight className="text-sgos-accent" size={24} />
        </div>
      </Link>

      <LanguageSwitcher />

      <div className="rounded-xl bg-sgos-900/60 border border-sgos-800 p-4 text-xs text-gray-400 space-y-1">
        <p className="text-sgos-accent font-semibold text-sm mb-2">{t('commandCenter.voiceTipTitle')}</p>
        <p>{t('commandCenter.voiceTipPath')}</p>
        <p>
          {t('commandCenter.voiceTipPhrase', { phrase: t('commandCenter.voicePhrase') })}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          to={path('logs')}
          className="flex-1 text-center py-3 rounded-xl bg-sgos-900 border border-sgos-800 text-sm text-gray-300 hover:text-white transition-colors"
        >
          {t('commandCenter.viewLogs')}
        </Link>
        <Link
          to={path('settings')}
          className="flex-1 text-center py-3 rounded-xl bg-sgos-900 border border-sgos-800 text-sm text-gray-300 hover:text-white transition-colors"
        >
          {t('commandCenter.openSettings')}
        </Link>
      </div>
    </div>
  );
}
