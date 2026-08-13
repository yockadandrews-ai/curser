import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Calendar, FileText, Shield, Loader2, Download, Play, Check, X, RefreshCw,
} from 'lucide-react';
import { api } from '../api';
import type {
  ChaosLedgerRow,
  ContentCalendarPlan,
  HermesStateSnapshot,
  HermesTaskRecord,
  NotionBriefTemplate,
} from '../types/hermes';

export default function HermesHub() {
  const [state, setState] = useState<HermesStateSnapshot | null>(null);
  const [tasks, setTasks] = useState<HermesTaskRecord[]>([]);
  const [ledger, setLedger] = useState<ChaosLedgerRow[]>([]);
  const [briefs, setBriefs] = useState<NotionBriefTemplate[]>([]);
  const [calendar, setCalendar] = useState<ContentCalendarPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await api.getHermesDashboard();
    setState(data.state);
    setTasks(data.tasks);
    setLedger(data.ledger);
    setBriefs(data.briefs);
    setCalendar(data.calendar);
    setLoading(false);
  }, []);

  useEffect(() => { refresh().catch(() => setLoading(false)); }, [refresh]);

  const runDecision = async (taskId: string, decision: 'approve' | 'reject' | 'modify') => {
    setBusy(taskId);
    try {
      const notes = decision === 'modify' ? prompt('Modify notes for Content Factory:') || undefined : undefined;
      const result = await api.hermesDecision(taskId, { decision, notes });
      setMsg(
        result.handoff
          ? `Approved · n8n handoff prepared · Sent still 0`
          : `${decision} recorded`,
      );
      await refresh();
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(null);
    }
  };

  const simulate = async (productSlug: string) => {
    setBusy('simulate');
    try {
      await api.hermesSimulateCalendar('build_weekend', productSlug);
      setMsg(`Calendar trigger simulated for ${productSlug}`);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 p-8">
        <Loader2 className="animate-spin" size={20} /> Loading Hermes…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Layers className="text-emerald-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hermes Supervisor</h1>
            <p className="text-sm text-gray-400">
              Goldie Content Factory + SGOS governance · draft free · human gate on publish
            </p>
          </div>
        </div>
        {state && (
          <p className="text-xs text-yellow-500/90 border border-yellow-500/20 rounded-lg px-3 py-2 bg-yellow-500/5">
            <Shield size={12} className="inline mr-1" />
            {state.governance.rule}
          </p>
        )}
      </header>

      {msg && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          {msg}
          <button type="button" className="ml-3 text-gray-500 hover:text-gray-300" onClick={() => setMsg(null)}>×</button>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-3">
        {[
          { label: 'Awaiting approval', value: state?.awaitingApproval ?? 0, color: 'text-yellow-400' },
          { label: 'Executed handoffs', value: state?.executedTotal ?? 0, color: 'text-emerald-400' },
          { label: 'Ledger rows', value: state?.ledgerRows ?? 0, color: 'text-blue-400' },
          { label: 'Active sprint', value: state?.activeSprint || '—', color: 'text-gray-300' },
        ].map(stat => (
          <div key={stat.label} className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="card space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" /> Content Calendar (Gas Station →)
          </h2>
          <div className="flex gap-2">
            <a
              href="/api/hermes/calendar/content.ics"
              className="btn-secondary text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700"
            >
              <Download size={14} /> Download .ics
            </a>
            <button
              type="button"
              className="btn-secondary text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700"
              disabled={busy === 'simulate'}
              onClick={() => simulate('gas-station')}
            >
              <Play size={14} /> Simulate Build Day
            </button>
          </div>
        </div>
        {calendar && (
          <p className="text-sm text-gray-400">
            {calendar.events.length} events · {calendar.products.length} product sprints · TZ {calendar.timezone}
          </p>
        )}
        <p className="text-xs text-gray-500">{calendar?.googleCalendarNote}</p>
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Task queue</h2>
          <Link to="/approve" className="text-sm text-emerald-400 hover:underline">Approval Inbox →</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No Hermes tasks yet. Simulate a calendar trigger or ingest a webhook.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {tasks.slice(0, 12).map(task => (
              <li key={task.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-200 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {task.agentId} · {task.status} · {task.riskTags.join(', ')}
                  </p>
                  {task.briefPath && (
                    <p className="text-xs text-gray-600 mt-1 truncate">Brief: {task.briefPath}</p>
                  )}
                </div>
                {task.status === 'awaiting_approval' && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={busy === task.id}
                      onClick={() => runDecision(task.id, 'approve')}
                      className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={busy === task.id}
                      onClick={() => runDecision(task.id, 'reject')}
                      className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={busy === task.id}
                      onClick={() => runDecision(task.id, 'modify')}
                      className="p-2 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600"
                      title="Modify"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card space-y-2">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <FileText size={18} /> Notion brief templates ({briefs.length})
          </h2>
          <ul className="text-sm text-gray-400 max-h-48 overflow-y-auto space-y-1">
            {briefs.slice(0, 10).map(b => (
              <li key={b.id}>· {b.title}</li>
            ))}
          </ul>
        </section>

        <section className="card space-y-2">
          <h2 className="font-semibold text-white">Chaos Ledger (recent)</h2>
          <ul className="text-xs text-gray-500 max-h-48 overflow-y-auto space-y-1">
            {ledger.slice(0, 8).map(row => (
              <li key={row.id}>
                <span className="text-gray-400">{row.kind}</span> — {row.summary}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="font-semibold text-white mb-2">Registered agents</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {(state?.agents ?? []).map(a => (
            <div key={a.id} className="border border-gray-800 rounded-lg p-2">
              <p className="text-gray-200 font-medium">{a.name}</p>
              <p className="text-gray-500">{a.description.slice(0, 80)}…</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
