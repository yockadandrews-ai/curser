import { useCallback, useEffect, useState } from 'react';
import {
  Flame, Wind, Droplets, Mountain, Moon, Loader2, Check, Send, RefreshCw,
  DollarSign, Users, FileText, Zap,
} from 'lucide-react';
import { api } from '../api';

interface DashboardData {
  stats: {
    mtdRevenueCents: number;
    mtdLeads: number;
    conversionRate: number;
    publishedCount: number;
    pendingDrafts: number;
    pendingEngagements: number;
    monthlyTargetCents: number;
    percentOfTarget: number;
    revenueByBrand: Array<{ brand: string; revenueCents: number; transactions: number }>;
  };
  brands: Record<string, { label: string; tagline: string; accent: string }>;
  contentQueue: Array<{
    id: string;
    brand: string;
    keyword: string;
    status: string;
    createdAt: string;
  }>;
  leads: Array<{ id: string; email: string; brand: string; funnelStage: string; capturedAt: string }>;
  revenue: Array<{ id: string; brand: string; product: string; grossCents: number; createdAt: string }>;
  engagements: Array<{ id: string; brand: string; platform: string; message: string; replyDraft: string | null; status: string }>;
  n8n: {
    endpoints: Record<string, string>;
    schedule: Record<string, string>;
    governance: string;
  };
}

const PHASES = [
  { key: 'air', icon: Wind, time: '7AM', label: 'Air', color: 'text-sky-400' },
  { key: 'fire', icon: Flame, time: '10AM', label: 'Fire', color: 'text-orange-400' },
  { key: 'water', icon: Droplets, time: '2PM', label: 'Water', color: 'text-emerald-400' },
  { key: 'earth', icon: Mountain, time: '6PM', label: 'Earth', color: 'text-amber-400' },
  { key: 'lockdown', icon: Moon, time: '9PM', label: 'Lockdown', color: 'text-violet-400' },
];

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Hub33333() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const d = await api.get33333Dashboard();
    setData(d as DashboardData);
    setLoading(false);
  }, []);

  useEffect(() => { refresh().catch(() => setLoading(false)); }, [refresh]);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await api.approve33333Content(id);
      setMsg('Approved — Fire cycle will publish at 10AM (or publish now)');
      await refresh();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(null);
    }
  };

  const publish = async (id: string) => {
    setBusy(id);
    try {
      await api.publish33333Content(id);
      setMsg('Published to platforms');
      await refresh();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(null);
    }
  };

  const sendReply = async (id: string) => {
    setBusy(id);
    try {
      await api.send33333Engagement(id);
      setMsg('Reply marked sent');
      await refresh();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 p-8">
        <Loader2 className="animate-spin" size={20} /> Loading 33333…
      </div>
    );
  }

  if (!data) return <p className="text-gray-400 p-8">Failed to load dashboard</p>;

  const { stats } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">33333 Autopilot Revenue</h1>
          <p className="text-sm text-gray-400 mt-1">
            First brain monetized · Music · Balance · Reflection · SGOS in separate lane
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/33333/index.html" target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            Landing page
          </a>
          <button type="button" className="btn-secondary text-sm flex items-center gap-1" onClick={() => refresh()}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      {msg && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          {msg}
          <button type="button" className="ml-3 text-gray-500" onClick={() => setMsg(null)}>×</button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <DollarSign size={14} /> MTD Revenue
          </div>
          <p className="stat-value">{fmt(stats.mtdRevenueCents)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(stats.percentOfTarget * 100)}% of {fmt(stats.monthlyTargetCents)} target
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Users size={14} /> Leads
          </div>
          <p className="stat-value">{stats.mtdLeads}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(stats.conversionRate * 100).toFixed(1)}% converted
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <FileText size={14} /> Published
          </div>
          <p className="stat-value">{stats.publishedCount}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.pendingDrafts} drafts pending</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Zap size={14} /> Engagements
          </div>
          <p className="stat-value">{stats.pendingEngagements}</p>
          <p className="text-xs text-gray-500 mt-1">pending reply</p>
        </div>
      </div>

      {/* Daily cycle */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Daily Power Cycle</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PHASES.map(({ key, icon: Icon, time, label, color }) => (
            <div key={key} className="bg-dark-800/50 rounded-lg p-3 border border-gray-800">
              <div className={`flex items-center gap-2 ${color} text-sm font-medium`}>
                <Icon size={16} /> {label}
              </div>
              <p className="text-xs text-gray-500 mt-1">{time}</p>
              <p className="text-xs text-gray-400 mt-2">{data.n8n.schedule[key]}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 border-t border-gray-800 pt-3">
          {data.n8n.governance}
        </p>
      </div>

      {/* Content queue */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Content Queue — Air → Fire</h2>
        <div className="space-y-2">
          {data.contentQueue.length === 0 && (
            <p className="text-sm text-gray-500">No content yet. n8n Air 7AM will populate drafts.</p>
          )}
          {data.contentQueue.map(row => (
            <div key={row.id} className="flex flex-wrap items-center gap-3 bg-dark-800/40 rounded-lg px-3 py-2 border border-gray-800">
              <span className="badge-blue">{row.brand}</span>
              <span className="text-sm text-gray-300 flex-1">{row.keyword}</span>
              <span className={`badge ${row.status === 'published' ? 'badge-green' : row.status === 'approved' ? 'badge-yellow' : 'badge bg-gray-800 text-gray-400'}`}>
                {row.status}
              </span>
              {row.status === 'draft' && (
                <button type="button" disabled={busy === row.id} className="btn-primary text-xs py-1 px-2 flex items-center gap-1" onClick={() => approve(row.id)}>
                  <Check size={12} /> Approve
                </button>
              )}
              {(row.status === 'approved' || row.status === 'draft') && (
                <button type="button" disabled={busy === row.id} className="btn-secondary text-xs py-1 px-2" onClick={() => publish(row.id)}>
                  Publish now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Engagements */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Engagement Inbox — Water</h2>
        {(!data.engagements || data.engagements.length === 0) ? (
          <p className="text-sm text-gray-500">No pending comments or DMs.</p>
        ) : (
          <div className="space-y-3">
            {data.engagements.map(eng => (
              <div key={eng.id} className="bg-dark-800/40 rounded-lg px-3 py-2 border border-gray-800">
                <div className="flex flex-wrap gap-2 mb-1">
                  <span className="badge-blue">{eng.brand}</span>
                  <span className="text-xs text-gray-500">{eng.platform}</span>
                </div>
                <p className="text-sm text-gray-300">{eng.message}</p>
                {eng.replyDraft && (
                  <p className="text-xs text-emerald-400/80 mt-2 border-l-2 border-emerald-500/30 pl-2">{eng.replyDraft}</p>
                )}
                <button type="button" disabled={busy === eng.id} className="btn-primary text-xs py-1 px-2 mt-2 flex items-center gap-1" onClick={() => sendReply(eng.id)}>
                  <Send size={12} /> Mark sent
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent leads + revenue */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Leads — Water</h2>
          {data.leads.length === 0 ? (
            <p className="text-sm text-gray-500">No leads yet. Landing page captures go here.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.leads.slice(0, 8).map(l => (
                <li key={l.id} className="flex justify-between gap-2 text-gray-300">
                  <span className="truncate">{l.email}</span>
                  <span className="badge-blue shrink-0">{l.brand}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-3">Revenue — Lockdown</h2>
          {data.revenue.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet. Connect Stripe webhook to start tracking.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.revenue.slice(0, 8).map(r => (
                <li key={r.id} className="flex justify-between gap-2 text-gray-300">
                  <span>{r.product}</span>
                  <span className="text-money-400 font-medium">{fmt(r.grossCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* n8n wiring */}
      <div className="card text-xs text-gray-400 space-y-1">
        <h2 className="text-sm font-semibold text-white mb-2">n8n Endpoints</h2>
        {Object.entries(data.n8n.endpoints).map(([k, v]) => (
          <p key={k}><span className="text-gray-500 w-24 inline-block">{k}</span> {v}</p>
        ))}
        <p className="pt-2 text-gray-500">Import: <code className="text-gray-300">docs/n8n/33333-autopilot-revenue-engine.workflow.json</code></p>
      </div>
    </div>
  );
}
