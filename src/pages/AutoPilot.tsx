import { useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, RefreshCw, TrendingUp, Package, FileText, Send,
  Zap, Clock, Target, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { api } from '../api';
import type { Stats, Activity, AutopilotStatus, Product } from '../types';

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: string; icon: typeof TrendingUp; sub?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="p-2 bg-money-600/10 rounded-lg">
          <Icon size={20} className="text-money-400" />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const icons: Record<string, string> = {
    autopilot: '🚀', discover: '🔍', content: '📝', post: '📱', error: '❌',
  };
  const time = new Date(activity.createdAt).toLocaleTimeString();
  return (
    <div className="flex gap-3 py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-lg">{icons[activity.type] || '•'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">{activity.message}</p>
        <p className="text-xs text-gray-600 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export default function AutoPilot() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [status, setStatus] = useState<AutopilotStatus | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [s, a, st, tp] = await Promise.all([
        api.getStats(),
        api.getActivity(30),
        api.getAutopilotStatus(),
        api.getTopProducts(5),
      ]);
      setStats(s);
      setActivity(a);
      setStatus(st);
      setTopProducts(tp);
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await api.runAutopilot();
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleToggle = async () => {
    if (status?.enabled) {
      await api.stopAutopilot();
    } else {
      await api.startAutopilot();
    }
    await refresh();
  };

  const handleDiscover = async () => {
    setRunning(true);
    try {
      await api.discoverProducts(status?.settings.niche, 5);
      await refresh();
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-money-400" size={32} />
      </div>
    );
  }

  const isEnabled = status?.enabled ?? false;
  const isCycleRunning = status?.isRunning ?? false;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-money-400" />
            Money Autopilot
          </h1>
          <p className="text-gray-400 mt-1">Real automation — discovers, generates, and posts automatically</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggle} className={isEnabled ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}>
            {isEnabled ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start Autopilot</>}
          </button>
          <button onClick={handleRunNow} disabled={running || isCycleRunning} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {running || isCycleRunning ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Run Now
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className={`card flex items-center gap-4 ${isEnabled ? 'border-money-600/30' : 'border-gray-700'}`}>
        <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-money-400 animate-pulse' : 'bg-gray-600'}`} />
        <div className="flex-1">
          <p className="font-semibold text-white">
            {isEnabled ? (isCycleRunning ? 'Running cycle...' : 'Autopilot Active') : 'Autopilot Paused'}
          </p>
          <p className="text-sm text-gray-400">
            {status?.lastRunAt
              ? `Last run: ${new Date(status.lastRunAt).toLocaleString()}`
              : 'Waiting for first run...'}
            {' · '}Every {status?.intervalMinutes ?? 5} min
          </p>
        </div>
        {status?.lastRunResult && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">Last cycle:</span>
            <span className="text-money-400">+{status.lastRunResult.discovered} products</span>
            <span className="text-blue-400">+{status.lastRunResult.contentGenerated} content</span>
            <span className="text-purple-400">+{status.lastRunResult.postsPublished} posts</span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly Profit" value={`$${(stats?.monthlyProfit ?? 0).toFixed(2)}`} icon={TrendingUp} sub="This month" />
        <StatCard label="SGOS Tools Sold" value={String(stats?.sgosToolsSold ?? 0)} icon={Package} sub={`${stats?.sgosToolsCount ?? 0} tools in catalog`} />
        <StatCard label="Net Profit" value={`$${(stats?.netProfit ?? 0).toFixed(2)}`} icon={DollarSign} sub="All time" />
        <StatCard label="Posts Published" value={String(stats?.postsPublished ?? 0)} icon={Send} sub={`${stats?.postsQueued ?? 0} queued`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 5 Winning Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Target size={18} className="text-money-400" />
              Top Sellers (SGOS Tools First)
            </h2>
            <button onClick={handleDiscover} disabled={running} className="text-xs btn-secondary py-1 px-2">
              Auto-Discover
            </button>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p>No products yet</p>
              <p className="text-sm mt-1">Add products in Real Earnings or click Auto-Discover</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const profit = p.sellPrice - p.cost;
                const isTool = p.productType === 'tool' && p.brand === 'sgos';
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                    <span className="text-money-400 font-bold w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate flex items-center gap-2">
                        {p.name}
                        {isTool && <span className="badge-green text-xs">SGOS</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isTool
                          ? `$${p.sellPrice.toFixed(0)}/tool · ${p.unitsSold ?? 0} sold · ${p.stock ?? 0} stock`
                          : `$${p.cost.toFixed(2)} → $${p.sellPrice.toFixed(2)} · $${profit.toFixed(2)} profit`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge-green">{p.viralScore} viral</span>
                      {p.source === 'discovered' && (
                        <p className="text-xs text-blue-400 mt-1">auto-found</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="card">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Clock size={18} className="text-money-400" />
            Live Activity Feed
            <span className="ml-auto text-xs text-gray-500">updates every 10s</span>
          </h2>
          <div className="max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No activity yet — start the autopilot!</p>
            ) : (
              activity.map(a => <ActivityItem key={a.id} activity={a} />)
            )}
          </div>
        </div>
      </div>

      {/* Automation pipeline */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={18} className="text-money-400" />
          Automation Pipeline
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Auto-Discover Products', enabled: status?.settings.autoDiscover, icon: '🔍', desc: 'Finds top 5 winning products in your niche' },
            { label: 'Auto-Generate Content', enabled: status?.settings.autoGenerate, icon: '📝', desc: 'Creates viral posts for your best products' },
            { label: 'Auto-Post to Social', enabled: status?.settings.autoPost, icon: '📱', desc: 'Posts to TikTok, Instagram, Twitter' },
          ].map(step => (
            <div key={step.label} className={`p-4 rounded-lg border ${step.enabled ? 'border-money-600/30 bg-money-600/5' : 'border-gray-700 bg-dark-800/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{step.icon}</span>
                {step.enabled
                  ? <CheckCircle2 size={16} className="text-money-400" />
                  : <AlertCircle size={16} className="text-gray-600" />}
              </div>
              <p className="font-medium text-white text-sm">{step.label}</p>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DollarSign(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
