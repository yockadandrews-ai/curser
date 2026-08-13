import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Command, Radio, ListChecks, Shield, Car, Map, Calendar, Newspaper, Activity,
  ChevronRight, Loader2, ExternalLink, Layers,
} from 'lucide-react';
import { api } from '../api';
import { ShortcutNotification, useProtectedShortcut, confirmProtectedShortcut } from '../components/ProtectedShortcut';
import type { CommandConfig, GovernanceStatus, MetricsPulse } from '../types/sgosCommand';

type IconType = typeof Command;

const ICONS: Record<string, IconType> = {
  'capture-signal': Radio,
  'approval-queue': ListChecks,
  'governance-status': Shield,
  'proposal-status': Shield,
  'tesla-drive-prep': Car,
  'field-board': Map,
  'book-sgos-audit': Calendar,
  'press-queue': Newspaper,
  'metrics-pulse': Activity,
  'hermes-supervisor': Layers,
};

const ITEM_LABEL_KEYS: Record<string, string> = {
  'capture-signal': 'captureSignal',
  'approval-queue': 'approvalQueue',
  'governance-status': 'governanceStatus',
  'proposal-status': 'proposalStatus',
  'tesla-drive-prep': 'teslaDrivePrep',
  'field-board': 'fieldBoard',
  'book-sgos-audit': 'bookAudit',
  'press-queue': 'pressQueue',
  'metrics-pulse': 'metricsPulse',
  'hermes-supervisor': 'hermesSupervisor',
};

export default function SGOSCommand() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notification, clearNotification, notify, runProtected } = useProtectedShortcut();

  const [config, setConfig] = useState<CommandConfig | null>(null);
  const [menu, setMenu] = useState<Array<{ id: string; order: number; optional?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [signalOpen, setSignalOpen] = useState(false);
  const [signalText, setSignalText] = useState('');
  const [signalParties, setSignalParties] = useState('');
  const [signalPriority, setSignalPriority] = useState('normal');

  const [panel, setPanel] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const [teslaSentry, setTeslaSentry] = useState(false);

  const refresh = useCallback(async () => {
    const data = await api.getCommandConfig();
    setConfig(data.config);
    setMenu(data.menu);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const shortcutName = (id: string) => t(`command.items.${ITEM_LABEL_KEYS[id]}` as 'command.items.captureSignal');

  const runShortcut = async (id: string) => {
    if (!config) return;
    setBusyId(id);

    try {
      switch (id) {
        case 'capture-signal':
          if (confirmProtectedShortcut(shortcutName(id))) setSignalOpen(true);
          break;
        case 'approval-queue':
          await runProtected(
            shortcutName(id),
            () => { window.location.href = '/approve'; },
            t('command.notify.approvalQueue'),
          );
          break;
        case 'governance-status':
          await runProtected(
            shortcutName(id),
            async () => {
              const status: GovernanceStatus = await api.getGovernanceStatus();
              openUrl(status.masterMapUrl);
              openUrl(status.hermesStatusUrl);
              setPanel({
                title: shortcutName(id),
                body: (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-gray-500">Last generate:</span> {status.lastGenerateDate ?? '—'}</p>
                    <p><span className="text-gray-500">Sent:</span> <strong className="text-money-400">{status.sentTotal}</strong></p>
                    <p><span className="text-gray-500">Drafted:</span> {status.draftedTotal} · Approved: {status.approvedTotal}</p>
                    <p className="text-yellow-400/90 text-xs">{status.hermesProofP0}</p>
                    <p className="text-xs text-gray-500">{status.readinessNote}</p>
                  </div>
                ),
              });
            },
            t('command.notify.governanceStatus'),
          );
          break;
        case 'proposal-status':
          await runProtected(
            shortcutName(id),
            async () => {
              const status = await api.getProposalStatus();
              navigate(config.proposalStatusPath, {
                state: {
                  notification: t('command.notify.proposalStatus', {
                    date: status.lastGenerateDate ?? '—',
                    sent: status.sentTotal,
                  }),
                },
              });
            },
            '',
          );
          break;
        case 'tesla-drive-prep':
          await runProtected(
            shortcutName(id),
            async () => {
              const result = await api.teslaDrivePrep(teslaSentry);
              setPanel({
                title: shortcutName(id),
                body: <p className="text-sm text-gray-300">{result.note}</p>,
              });
            },
            t('command.notify.teslaDrivePrep'),
          );
          break;
        case 'field-board':
          if (!config.fieldBoardUrl) return;
          await runProtected(
            shortcutName(id),
            () => openUrl(config.fieldBoardUrl!),
            t('command.notify.fieldBoard'),
          );
          break;
        case 'book-sgos-audit':
          await runProtected(
            shortcutName(id),
            () => openUrl(config.auditCalendarUrl),
            t('command.notify.bookAudit'),
          );
          break;
        case 'press-queue':
          await runProtected(
            shortcutName(id),
            () => openUrl(config.pressQueueUrl),
            t('command.notify.pressQueue'),
          );
          break;
        case 'metrics-pulse':
          await runProtected(
            shortcutName(id),
            async () => {
              const m: MetricsPulse = await api.getMetricsPulse();
              setPanel({
                title: shortcutName(id),
                body: (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-500">Affiliate products</p><p className="text-white font-semibold">{m.affiliateProducts}</p></div>
                    <div><p className="text-gray-500">Notion tools</p><p className="text-white font-semibold">{m.notionTools}</p></div>
                    <div><p className="text-gray-500">Proposal drafts</p><p className="text-white font-semibold">{m.proposalDrafts}</p></div>
                    <div><p className="text-gray-500">Proposals sent</p><p className="text-money-400 font-semibold">{m.proposalsSent}</p></div>
                    <div><p className="text-gray-500">Signals captured</p><p className="text-white font-semibold">{m.capturedSignals}</p></div>
                    <div><p className="text-gray-500">Last generate</p><p className="text-white font-semibold">{m.lastGenerateDate ?? '—'}</p></div>
                  </div>
                ),
              });
            },
            t('command.notify.metricsPulse'),
          );
          break;
        case 'hermes-supervisor':
          await runProtected(
            shortcutName(id),
            () => { navigate('/hermes'); },
            t('command.notify.hermesSupervisor'),
          );
          break;
        default:
          break;
      }
    } finally {
      setBusyId(null);
    }
  };

  const submitSignal = async () => {
    if (!signalText.trim() || !config) return;
    setBusyId('capture-signal');
    try {
      await api.captureSignal({
        signal: signalText,
        parties: signalParties,
        priority: signalPriority,
      });
      setSignalOpen(false);
      setSignalText('');
      setSignalParties('');
      setSignalPriority('normal');
      openUrl(config.pressQueueUrl);
      notify(t('command.notify.captureSignal'));
    } finally {
      setBusyId(null);
    }
  };

  const visibleMenu = menu.filter(item => item.id !== 'field-board' || config?.fieldBoardUrl);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-money-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Command className="text-purple-400" />
          {t('command.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('command.subtitle')}</p>
      </div>

      <div className="card border-purple-600/30 bg-purple-950/20">
        <p className="text-sm text-purple-300">{t('command.protectedPattern')}</p>
        <p className="text-xs text-gray-500 mt-2">{config?.protectedPattern}</p>
      </div>

      <div className="card p-0 overflow-hidden divide-y divide-gray-800/80">
        {visibleMenu.map(item => {
          const Icon = ICONS[item.id] ?? ChevronRight;
          const label = shortcutName(item.id);
          const isBusy = busyId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => runShortcut(item.id)}
              disabled={!!busyId}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-dark-800/50 transition-colors disabled:opacity-50"
            >
              <span className="text-xs text-gray-600 font-mono w-4">{item.order}</span>
              <Icon size={20} className="text-purple-400 shrink-0" />
              <span className="flex-1 text-white font-medium">{label}</span>
              {item.id === 'tesla-drive-prep' && (
                <label
                  className="flex items-center gap-1 text-xs text-gray-500 mr-2"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={teslaSentry}
                    onChange={e => setTeslaSentry(e.target.checked)}
                    className="rounded"
                  />
                  Sentry
                </label>
              )}
              {isBusy ? <Loader2 size={16} className="animate-spin text-gray-500" /> : <ChevronRight size={16} className="text-gray-600" />}
            </button>
          );
        })}
      </div>

      <div className="card text-xs text-gray-500">
        <p className="font-semibold text-gray-400 mb-2">{t('command.rebuildHint')}</p>
        <p>{t('command.rebuildDoc')}</p>
        <a href="/shortcuts" className="inline-flex items-center gap-1 text-purple-400 mt-2 hover:underline">
          {t('command.openProposalStatus')} <ExternalLink size={12} />
        </a>
      </div>

      {signalOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full space-y-4">
            <h3 className="font-semibold text-white">{t('command.captureForm.title')}</h3>
            <textarea
              className="input w-full min-h-[100px]"
              placeholder={t('command.captureForm.signal')}
              value={signalText}
              onChange={e => setSignalText(e.target.value)}
            />
            <input
              className="input w-full"
              placeholder={t('command.captureForm.parties')}
              value={signalParties}
              onChange={e => setSignalParties(e.target.value)}
            />
            <select className="input w-full" value={signalPriority} onChange={e => setSignalPriority(e.target.value)}>
              <option value="low">{t('command.captureForm.priorityLow')}</option>
              <option value="normal">{t('command.captureForm.priorityNormal')}</option>
              <option value="high">{t('command.captureForm.priorityHigh')}</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setSignalOpen(false)}>{t('common.cancel')}</button>
              <button type="button" className="btn-primary" onClick={submitSignal} disabled={!signalText.trim()}>{t('command.captureForm.save')}</button>
            </div>
          </div>
        </div>
      )}

      {panel && (
        <div className="card border-money-600/20">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-white">{panel.title}</h3>
            <button type="button" onClick={() => setPanel(null)} className="text-gray-500 hover:text-gray-300 text-sm">{t('common.dismiss')}</button>
          </div>
          {panel.body}
        </div>
      )}

      <ShortcutNotification message={notification} onDismiss={clearNotification} />
    </div>
  );
}
