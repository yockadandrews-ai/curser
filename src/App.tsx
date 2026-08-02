import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Zap, DollarSign, Sparkles, Rocket, BookOpen, Factory, Radio } from 'lucide-react';
import AutoPilot from './pages/AutoPilot';
import RealEarnings from './pages/RealEarnings';
import ViralCashGenerator from './pages/ViralCashGenerator';
import NotionTools from './pages/NotionTools';
import DailyFactory from './pages/DailyFactory';
import SGOSLayout from './pages/sgos/SGOSLayout';
import CommandCenter from './pages/sgos/CommandCenter';
import FieldTag from './pages/sgos/FieldTag';
import BatchLog from './pages/sgos/BatchLog';
import Dispatch from './pages/sgos/Dispatch';
import Ack from './pages/sgos/Ack';
import ActivityLog from './pages/sgos/ActivityLog';
import SgosSettingsPage from './pages/sgos/SgosSettings';

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Zap; label: string }) {
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
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function AutopilotShell() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-dark-900 border-r border-gray-800 p-4 flex flex-col gap-2 fixed h-full">
        <div className="flex items-center gap-2 px-2 py-4 mb-4">
          <div className="w-8 h-8 bg-money-600 rounded-lg flex items-center justify-center animate-glow">
            <Rocket size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Money Autopilot</h1>
            <p className="text-xs text-money-400">Real Automation</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem to="/" icon={Zap} label="Money Autopilot" />
          <NavItem to="/sgos" icon={Radio} label="SGOS Field Ops" />
          <NavItem to="/factory" icon={Factory} label="Daily Factory" />
          <NavItem to="/notion-tools" icon={BookOpen} label="Notion Tools" />
          <NavItem to="/earnings" icon={DollarSign} label="Real Earnings" />
          <NavItem to="/viral" icon={Sparkles} label="Viral Cash Generator" />
        </nav>

        <div className="mt-auto card text-xs text-gray-500">
          <p className="text-money-400 font-semibold mb-1">🟢 Engine Running</p>
          <p>Autopilot handles affiliate products. Notion tools are tracked separately.</p>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<AutoPilot />} />
          <Route path="/factory" element={<DailyFactory />} />
          <Route path="/notion-tools" element={<NotionTools />} />
          <Route path="/earnings" element={<RealEarnings />} />
          <Route path="/viral" element={<ViralCashGenerator />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isSgos = location.pathname.startsWith('/sgos');

  if (isSgos) {
    return (
      <Routes>
        <Route path="/sgos" element={<SGOSLayout />}>
          <Route index element={<CommandCenter />} />
          <Route path="field-tag" element={<FieldTag />} />
          <Route path="batch-log" element={<BatchLog />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="ack" element={<Ack />} />
          <Route path="logs" element={<ActivityLog />} />
          <Route path="settings" element={<SgosSettingsPage />} />
        </Route>
      </Routes>
    );
  }

  return <AutopilotShell />;
}
