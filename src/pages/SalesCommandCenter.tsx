import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, RefreshCw, CheckCircle2, Circle, Sun, Crown, Megaphone,
  DollarSign, Clock, Rocket,
} from 'lucide-react';
import { api } from '../api';
import { Link } from 'react-router-dom';

type CommandCenter = Awaited<ReturnType<typeof api.getSalesCommandCenter>>;

function fmtUsd(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function SalesCommandCenter() {
  const [data, setData] = useState<CommandCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fakeLeadBusy, setFakeLeadBusy] = useState(false);

  const refresh = useCallback(async () => {
    setErr(null);
    try {
      setData(await api.getSalesCommandCenter());
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 60000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const runFakeLead = async () => {
    setFakeLeadBusy(true);
    try {
      await fetch('/api/sovereign/test/fake-lead', { method: 'POST' });
      await refresh();
    } finally {
      setFakeLeadBusy(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading sales command center…
      </div>
    );
  }

  if (err && !data) {
    return <p className="text-red-400">{err}</p>;
  }

  if (!data) return null;

  const s = data.summary;
  const checklistPct = Math.round((data.deployChecklistComplete / data.deployChecklistTotal) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-money-400" /> Sales Command Center
          </h1>
          <p className="text-gray-400 mt-1">
            All lanes · scanned {new Date(data.scannedAt).toLocaleString()}
          </p>
        </div>
        <button type="button" onClick={() => refresh()} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Profit tracker (MTD)" value={fmtUsd(s.profitTrackerMonthlyUsd)} />
        <StatCard label="33333 revenue (MTD)" value={fmtUsd(s.consumerMtdRevenueUsd)} />
        <StatCard label="Sovereign pipeline" value={fmtUsd(s.sovereignPipelineValueUsd)} sub={`${s.sovereignTotalTickets} tickets`} />
        <StatCard label="Go-live readiness" value={`${checklistPct}%`} sub={`${data.deployChecklistComplete}/${data.deployChecklistTotal} checks`} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <LaneCard
          icon={Sun}
          title="Sovereign Solar"
          accent="text-yellow-400"
          lines={[
            `Vertical: ${data.lanes.sovereign.verticalLabel} @ ${fmtUsd(data.lanes.sovereign.pricing.entryUsd)}`,
            `Live deployments: ${s.sovereignLiveDeployments}`,
            `Pending SG3 emissions: ${data.lanes.sovereign.pendingSg3Emissions.length}`,
          ]}
          action={
            <button type="button" disabled={fakeLeadBusy} onClick={runFakeLead} className="text-sm text-money-400 hover:underline">
              {fakeLeadBusy ? 'Running test…' : 'Run fake lead loop test'}
            </button>
          }
          link={{ to: '/hermes', label: 'Hermes hub' }}
        />
        <LaneCard
          icon={Megaphone}
          title="Outreach Engine"
          accent="text-blue-400"
          lines={[
            `Price: ${fmtUsd(s.engineProduct.priceCents / 100)}`,
            `Subscribers: ${s.outreachSubscribers}`,
            `Recent events: ${data.lanes.outreach.recentEvents.length}`,
          ]}
          link={{ to: '/approve', label: 'Approval inbox' }}
        />
        <LaneCard
          icon={Crown}
          title="33333 Consumer"
          accent="text-violet-400"
          lines={[
            `Leads MTD: ${s.consumerMtdLeads}`,
            `Conversion: ${(s.consumerConversionRate * 100).toFixed(1)}%`,
            `Stripe links: ${data.env.stripeLinksConfigured}/${data.env.stripeLinksTotal}`,
          ]}
          link={{ to: '/33333', label: '33333 dashboard' }}
        />
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Clock size={18} className="text-orange-400" /> BRIDGE clock (ET)
        </h2>
        <p className="text-gray-300">
          <span className="text-money-400 font-medium">{data.bridge.clock.element}</span>
          {' · '}{data.bridge.clock.action}
          {' · '}{data.bridge.clock.windowLabel}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Import <code className="text-orange-300">docs/n8n/bridge-33333.workflow.json</code> if n8n is not firing blocks.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Rocket size={18} /> Deploy checklist
        </h2>
        <ul className="space-y-2">
          {data.deployChecklist.map(item => (
            <li key={item.id} className="flex items-start gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
              ) : (
                <Circle size={18} className="text-gray-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className={item.done ? 'text-gray-300' : 'text-white'}>{item.label}</span>
                {item.hint && <p className="text-gray-500 text-xs">{item.hint}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {(data.lanes.sovereign.recentTickets.length > 0 || data.lanes.consumer33333.recentRevenue.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.lanes.sovereign.recentTickets.length > 0 && (
            <section className="card">
              <h3 className="font-medium text-white mb-2">Recent Sovereign tickets</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {data.lanes.sovereign.recentTickets.map(t => (
                  <li key={t.id}>{t.company || t.name} — <span className="text-gray-500">{t.status}</span></li>
                ))}
              </ul>
            </section>
          )}
          {data.lanes.consumer33333.recentRevenue.length > 0 && (
            <section className="card">
              <h3 className="font-medium text-white mb-2">Recent 33333 revenue</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {data.lanes.consumer33333.recentRevenue.map(r => (
                  <li key={r.id}>{r.brand} · {r.product} — {fmtUsd(r.grossCents / 100)}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-money-400 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function LaneCard({
  icon: Icon,
  title,
  accent,
  lines,
  link,
  action,
}: {
  icon: typeof Sun;
  title: string;
  accent: string;
  lines: string[];
  link?: { to: string; label: string };
  action?: React.ReactNode;
}) {
  return (
    <div className="card">
      <h3 className={`font-semibold flex items-center gap-2 ${accent}`}>
        <Icon size={18} /> {title}
      </h3>
      <ul className="mt-3 space-y-1 text-sm text-gray-400">
        {lines.map(l => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {link && <Link to={link.to} className="text-money-400 hover:underline">{link.label} →</Link>}
        {action}
      </div>
    </div>
  );
}
