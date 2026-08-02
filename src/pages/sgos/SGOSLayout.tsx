import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Radio, History, Settings } from 'lucide-react';
import { useSgosLocale } from '../../i18n/useSgosLocale';

export default function SGOSLayout() {
  const { t } = useTranslation();
  const { path, locale } = useSgosLocale();
  const location = useLocation();
  const homePath = path('');
  const isHome = location.pathname === homePath || location.pathname === `/sgos/${locale}`;

  const navItems = [
    { to: path(''), label: t('nav.cmd'), end: true, icon: 'cmd' as const },
    { to: path('logs'), label: t('nav.logs'), end: false, icon: 'logs' as const },
    { to: path('settings'), label: t('nav.settings'), end: false, icon: 'settings' as const },
  ];

  return (
    <div className="min-h-screen bg-sgos-950 text-gray-100 flex flex-col max-w-lg mx-auto">
      <header className="px-4 pt-safe pt-4 pb-3 border-b border-sgos-800/80 bg-sgos-950/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sgos-accent to-sgos-600 flex items-center justify-center shadow-lg shadow-sgos-accent/20">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">{t('common.appName')}</h1>
            <p className="text-[11px] text-sgos-accent/80 uppercase tracking-widest">{t('common.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-auto ${isHome ? 'p-4' : 'p-4 pb-24'}`}>
        <Outlet />
      </main>

      {!isHome && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-sgos-900/95 backdrop-blur border-t border-sgos-800 px-6 py-3 pb-safe flex justify-around">
          {navItems.map(({ to, label, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-xs font-semibold tracking-wider px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-sgos-accent bg-sgos-accent/10' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {icon === 'logs' ? (
                <History size={18} className="mx-auto mb-0.5" />
              ) : icon === 'settings' ? (
                <Settings size={18} className="mx-auto mb-0.5" />
              ) : (
                <Radio size={18} className="mx-auto mb-0.5" />
              )}
              <span className="block text-center">{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
