import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Zap, DollarSign, Sparkles, Rocket, BookOpen, Factory, Shield, Command, Inbox } from 'lucide-react';
import AutoPilot from './pages/AutoPilot';
import RealEarnings from './pages/RealEarnings';
import ViralCashGenerator from './pages/ViralCashGenerator';
import NotionTools from './pages/NotionTools';
import DailyFactory from './pages/DailyFactory';
import ShortcutsHub from './pages/ShortcutsHub';
import SGOSCommand from './pages/SGOSCommand';
import ApprovalInbox from './pages/ApprovalInbox';
import LanguageSwitcher from './components/LanguageSwitcher';
import { api } from './api';

function NavItem({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: typeof Zap;
  label: string;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isActive
            ? 'bg-money-600/20 text-money-400 border border-money-600/30'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
        }`
      }
    >
      <Icon size={18} />
      <span className="font-medium flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-yellow-500 text-dark-900 text-xs font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function App() {
  const { t } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = () => api.getPendingDrafts().then(r => setPendingCount(r.count)).catch(() => {});
    load();
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-dark-900 border-r border-gray-800 p-4 flex flex-col gap-2 fixed h-full">
        <div className="flex items-center gap-2 px-2 py-4 mb-4">
          <div className="w-8 h-8 bg-money-600 rounded-lg flex items-center justify-center animate-glow">
            <Rocket size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">{t('app.title')}</h1>
            <p className="text-xs text-money-400">{t('app.subtitle')}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem to="/approve" icon={Inbox} label={t('nav.approve')} badge={pendingCount} />
          <NavItem to="/command" icon={Command} label={t('nav.command')} />
          <NavItem to="/" icon={Zap} label={t('nav.autopilot')} />
          <NavItem to="/shortcuts" icon={Shield} label={t('nav.shortcuts')} />
          <NavItem to="/factory" icon={Factory} label={t('nav.factory')} />
          <NavItem to="/notion-tools" icon={BookOpen} label={t('nav.notionTools')} />
          <NavItem to="/earnings" icon={DollarSign} label={t('nav.earnings')} />
          <NavItem to="/viral" icon={Sparkles} label={t('nav.viral')} />
        </nav>

        <LanguageSwitcher />

        <div className="mt-auto card text-xs text-gray-500">
          <p className="text-money-400 font-semibold mb-1">🟢 {t('app.engineRunning')}</p>
          <p>{t('app.engineNote')}</p>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<AutoPilot />} />
          <Route path="/approve" element={<ApprovalInbox />} />
          <Route path="/command" element={<SGOSCommand />} />
          <Route path="/shortcuts" element={<ShortcutsHub />} />
          <Route path="/factory" element={<DailyFactory />} />
          <Route path="/notion-tools" element={<NotionTools />} />
          <Route path="/earnings" element={<RealEarnings />} />
          <Route path="/viral" element={<ViralCashGenerator />} />
        </Routes>
      </main>
    </div>
  );
}
