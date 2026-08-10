import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield, FolderOpen, CheckCircle2, Loader2, FileText, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { api } from '../api';
import { ShortcutNotification, confirmProtectedShortcut } from '../components/ProtectedShortcut';

interface StatusReport {
  rule: string;
  lastGenerateDate: string | null;
  lastFolder: string | null;
  packages: Array<{
    folderPath: string;
    batchDate: string;
    type: string;
    proposalCount: number;
    appCount: number;
    proposalsFullCount: number;
    status: string;
    sent: number;
  }>;
  approvalQueue: Array<{
    id: string;
    folderPath: string;
    batchDate: string;
    proposalCount: number;
    appCount: number;
    status: string;
    sent: number;
    proofUrl?: string;
  }>;
  sentTotal: number;
  draftedTotal: number;
  approvedTotal: number;
  todayTheme: string;
  outputRoot: string;
  approvalQueueUrl: string;
  scannedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFTED: 'badge-yellow',
    APPROVED: 'badge-blue',
    REJECTED: 'badge',
    SENT: 'badge-green',
  };
  return <span className={colors[status] ?? 'badge'}>{status}</span>;
}

export default function ShortcutsHub() {
  const { t } = useTranslation();
  const location = useLocation();
  const [report, setReport] = useState<StatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastGenerate, setLastGenerate] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(
    (location.state as { notification?: string } | null)?.notification ?? null,
  );

  const refresh = useCallback(async () => {
    try {
      setReport(await api.getProposalStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleGenerateToday = async () => {
    if (!confirmProtectedShortcut(t('shortcuts.generateToday'))) return;
    setGenerating(true);
    try {
      const result = await api.generateTodayProposals();
      setLastGenerate(result.confirmation);
      setNotification(`${result.confirmation} Folder: output/${result.folderPath}/`);
      await refresh();
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    await api.approveDraft(id);
    setNotification(t('shortcuts.notifyApproved'));
    await refresh();
  };

  const handleReject = async (id: string) => {
    await api.rejectDraft(id);
    setNotification(t('approveInbox.declined'));
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-money-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-purple-400" />
          {t('shortcuts.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('shortcuts.subtitle')}</p>
      </div>

      <div className="card border-purple-600/30 bg-purple-950/20">
        <p className="text-sm text-purple-300 font-medium">{report?.rule}</p>
        <p className="text-xs text-gray-500 mt-2">{t('shortcuts.neverAutoSend')}</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="py-2 pr-4 font-medium">{t('shortcuts.tableShortcut')}</th>
              <th className="py-2 pr-4 font-medium">{t('shortcuts.tableTrigger')}</th>
              <th className="py-2 pr-4 font-medium">{t('shortcuts.tableDoes')}</th>
              <th className="py-2 font-medium">{t('shortcuts.tableDoesNot')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-gray-300">
              <td className="py-3 pr-4 text-white font-medium">{t('shortcuts.title')}</td>
              <td className="py-3 pr-4">{t('shortcuts.tableTriggerValue')}</td>
              <td className="py-3 pr-4">{t('shortcuts.tableDoesValue')}</td>
              <td className="py-3">{t('shortcuts.tableDoesNotValue')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 1. Report */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={18} className="text-money-400" />
          {t('shortcuts.report')}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('shortcuts.lastGenerate')}</p>
            <p className="text-white font-semibold">{report?.lastGenerateDate ?? t('shortcuts.none')}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('shortcuts.sentCount')}</p>
            <p className="text-2xl font-bold text-money-400">{report?.sentTotal ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('shortcuts.todayTheme')}</p>
            <p className="text-white">{report?.todayTheme}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('shortcuts.outputRoot')}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{report?.outputRoot}</p>
          </div>
        </div>

        {report?.lastFolder && (
          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
            <FolderOpen size={14} />
            {report.lastFolder}/
          </p>
        )}

        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{t('shortcuts.packagesOnDisk')}</p>
          {(report?.packages ?? []).slice(0, 6).map(p => (
            <div key={p.folderPath} className="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b border-gray-800/50">
              <span className="text-gray-300 font-mono text-xs">{p.folderPath}/</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{p.appCount} apps · {p.proposalCount} proposals</span>
                {p.proposalsFullCount > 0 && <span className="text-xs text-purple-400">+{p.proposalsFullCount} full</span>}
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-600">sent={p.sent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Gated actions */}
      <div className="card border-money-600/20">
        <h2 className="font-semibold text-white mb-4">{t('shortcuts.gatedActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateToday}
            disabled={generating}
            className="btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-500"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {t('shortcuts.generateToday')}
          </button>
          <a
            href={report?.approvalQueueUrl ?? 'https://notion.so'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
            title={t('shortcuts.approvalQueueHint')}
          >
            <ExternalLink size={16} />
            {t('shortcuts.openApprovalQueue')}
          </a>
        </div>
        {lastGenerate && (
          <p className="text-sm text-money-400 mt-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> {lastGenerate}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">{t('shortcuts.generateNote')}</p>
      </div>

      {/* Approval Queue (local mirror) */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" />
            {t('shortcuts.localApprovalQueue')}
          </h2>
          <a href="/approve" className="btn-primary text-sm py-2 px-4 bg-green-600 hover:bg-green-500">
            {t('approveInbox.openQuickApprove')}
          </a>
        </div>
        {(report?.approvalQueue ?? []).length === 0 ? (
          <p className="text-gray-500 text-sm">{t('shortcuts.noDrafts')}</p>
        ) : (
          <div className="space-y-3">
            {report!.approvalQueue.map(d => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-dark-800/50 rounded-lg text-sm">
                <div>
                  <p className="font-mono text-xs text-white">{d.folderPath}/</p>
                  <p className="text-gray-500 text-xs mt-1">{d.batchDate} · {d.proposalCount} proposals · {d.appCount} apps</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={d.status} />
                  <span className="text-xs text-gray-600">sent={d.sent}</span>
                  {d.status === 'DRAFTED' && (
                    <>
                      <button
                        onClick={() => handleApprove(d.id)}
                        className="text-xs py-1.5 px-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium"
                      >
                        {t('approveInbox.approve')}
                      </button>
                      <button
                        onClick={() => handleReject(d.id)}
                        className="text-xs py-1.5 px-3 rounded-lg bg-dark-700 border border-gray-600 hover:border-red-500/50 text-gray-300"
                      >
                        {t('approveInbox.decline')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShortcutNotification message={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
