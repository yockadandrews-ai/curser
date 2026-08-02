import { Link } from 'react-router-dom';
import { Tag, Layers, Truck, CheckCircle, ChevronRight } from 'lucide-react';

const shortcuts = [
  {
    to: '/sgos/field-tag',
    label: 'FIELD TAG',
    desc: 'Dictate plate → SMS instructions',
    color: 'from-gray-900 to-black',
    border: 'border-gray-700',
    icon: Tag,
    text: 'text-white',
  },
  {
    to: '/sgos/batch-log',
    label: 'BATCH LOG',
    desc: '5–10 plates → summary decode',
    color: 'from-blue-900 to-blue-950',
    border: 'border-blue-700/50',
    icon: Layers,
    text: 'text-blue-100',
  },
  {
    to: '/sgos/dispatch',
    label: 'DISPATCH',
    desc: 'HERMES · PORTAL · COURIER',
    color: 'from-emerald-900 to-emerald-950',
    border: 'border-emerald-700/50',
    icon: Truck,
    text: 'text-emerald-100',
  },
  {
    to: '/sgos/ack',
    label: 'ACK',
    desc: 'PKG-OK · DRV-IN · HOLD · ABORT',
    color: 'from-red-900 to-red-950',
    border: 'border-red-700/50',
    icon: CheckCircle,
    text: 'text-red-100',
  },
];

export default function CommandCenter() {
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
        to="/sgos/field-tag"
        className="block rounded-2xl bg-gradient-to-r from-sgos-800 via-sgos-900 to-sgos-800 border border-sgos-accent/30 p-5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sgos-accent/20 flex items-center justify-center">
              <span className="text-sgos-accent font-black text-lg">S</span>
            </div>
            <div>
              <p className="font-bold text-white text-lg">SGOS CMD</p>
              <p className="text-xs text-gray-400">Quick field tag — tap to start</p>
            </div>
          </div>
          <ChevronRight className="text-sgos-accent" size={24} />
        </div>
      </Link>

      <div className="rounded-xl bg-sgos-900/60 border border-sgos-800 p-4 text-xs text-gray-400 space-y-1">
        <p className="text-sgos-accent font-semibold text-sm mb-2">Voice Control Tip</p>
        <p>Settings → Accessibility → Voice Control</p>
        <p>Phrase: <span className="text-gray-200">"Log plate"</span> → runs Field Tag</p>
      </div>

      <div className="flex gap-2">
        <Link to="/sgos/logs" className="flex-1 text-center py-3 rounded-xl bg-sgos-900 border border-sgos-800 text-sm text-gray-300 hover:text-white transition-colors">
          View SMS Logs
        </Link>
        <Link to="/sgos/settings" className="flex-1 text-center py-3 rounded-xl bg-sgos-900 border border-sgos-800 text-sm text-gray-300 hover:text-white transition-colors">
          Settings
        </Link>
      </div>
    </div>
  );
}
