import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (status?.enabled) await api.stopAutopilot();
    else await api.startAutopilot();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-money-400" />
            {t('autopilot.title')}
          </h1>
          <p className="text-gray-400 mt-1">{t('autopilot.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleToggle} className={isEnabled ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}>
            {isEnabled ? <><Pause size={16} /> {t('autopilot.pause')}</> : <><Play size={16} /> {t('autopilot.start')}</>}
          </button>
          <button onClick={handleRunNow} disabled={running || isCycleRunning} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {running || isCycleRunning ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {t('autopilot.runNow')}
          </button>
        </div>
      </div>

      <div className={`card flex items-center gap-4 ${isEnabled ? 'border-money-600/30' : 'border-gray-700'}`}>
        <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-money-400 animate-pulse' : 'bg-gray-600'}`} />
        <div className="flex-1">
          <p className="font-semibold text-white">
            {isEnabled ? (isCycleRunning ? t('autopilot.runningCycle') : t('autopilot.active')) : t('autopilot.paused')}
          </p>
          <p className="text-sm text-gray-400">
            {status?.lastRunAt
              ? `${t('autopilot.lastRun')}: ${new Date(status.lastRunAt).toLocaleString()}`
              : t('autopilot.waitingFirstRun')}
            {' · '}{t('autopilot.everyMin', { count: status?.intervalMinutes ?? 5 })}
          </p>
        </div>
        {status?.lastRunResult && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">{t('autopilot.lastCycle')}:</span>
            <span className="text-money-400">{t('autopilot.productsDiscovered', { count: status.lastRunResult.discovered })}</span>
            <span className="text-blue-400">{t('autopilot.contentGenerated', { count: status.lastRunResult.contentGenerated })}</span>
            <span className="text-purple-400">{t('autopilot.postsPublished', { count: status.lastRunResult.postsPublished })}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('autopilot.monthlyProfit')} value={`$${(stats?.monthlyProfit ?? 0).toFixed(2)}`} icon={TrendingUp} sub={t('common.thisMonth')} />
        <StatCard label={t('autopilot.netProfit')} value={`$${(stats?.netProfit ?? 0).toFixed(2)}`} icon={DollarSign} sub={t('common.allTime')} />
        <StatCard label={t('autopilot.productsTracked')} value={String(stats?.productsTracked ?? 0)} icon={Package} sub={t('autopilot.affiliateOnly')} />
        <StatCard label={t('autopilot.postsPublishedLabel')} value={String(stats?.postsPublished ?? 0)} icon={Send} sub={t('autopilot.queued', { count: stats?.postsQueued ?? 0 })} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Target size={18} className="text-money-400" />
              {t('autopilot.topProducts')}
            </h2>
            <button onClick={handleDiscover} disabled={running} className="text-xs btn-secondary py-1 px-2">
              {t('autopilot.autoDiscover')}
            </button>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p>{t('autopilot.noProducts')}</p>
              <p className="text-sm mt-1">{t('autopilot.noProductsHint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const profit = p.sellPrice - p.cost;
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                    <span className="text-money-400 font-bold w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {t('autopilot.profitLine', { cost: p.cost.toFixed(2), sell: p.sellPrice.toFixed(2), profit: profit.toFixed(2) })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge-green">{t('autopilot.viral', { score: p.viralScore })}</span>
                      {p.source === 'discovered' && <p className="text-xs text-blue-400 mt-1">{t('autopilot.autoFound')}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Clock size={18} className="text-money-400" />
            {t('autopilot.activityFeed')}
            <span className="ml-auto text-xs text-gray-500">{t('autopilot.updatesEvery')}</span>
          </h2>
          <div className="max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">{t('autopilot.noActivity')}</p>
            ) : (
              activity.map(a => <ActivityItem key={a.id} activity={a} />)
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={18} className="text-money-400" />
          {t('autopilot.pipeline')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('autopilot.discoverTitle'), enabled: status?.settings.autoDiscover, icon: '🔍', desc: t('autopilot.discoverDesc') },
            { label: t('autopilot.generateTitle'), enabled: status?.settings.autoGenerate, icon: '📝', desc: t('autopilot.generateDesc') },
            { label: t('autopilot.postTitle'), enabled: status?.settings.autoPost, icon: '📱', desc: t('autopilot.postDesc') },
          ].map(step => (
            <div key={step.label} className={`p-4 rounded-lg border ${step.enabled ? 'border-money-600/30 bg-money-600/5' : 'border-gray-700 bg-dark-800/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{step.icon}</span>
                {step.enabled ? <CheckCircle2 size={16} className="text-money-400" /> : <AlertCircle size={16} className="text-gray-600" />}
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
