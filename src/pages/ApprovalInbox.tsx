import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, XCircle, Loader2, Calendar, CalendarPlus, Inbox, ExternalLink,
} from 'lucide-react';
import { api } from '../api';
import { ShortcutNotification } from '../components/ProtectedShortcut';
import type { ProposalDraftRecord } from '../types/shortcuts';

interface CalendarLinks {
  approveUrl: string;
  icsDailyUrl: string;
  googleCalendarDailyUrl: string;
  reminderTime: string;
  timezone: string;
}

export default function ApprovalInbox() {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<ProposalDraftRecord[]>([]);
  const [count, setCount] = useState(0);
  const [calendar, setCalendar] = useState<CalendarLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [pending, links] = await Promise.all([
      api.getPendingDrafts(),
      api.getCalendarLinks(),
    ]);
    setDrafts(pending.drafts);
    setCount(pending.count);
    setCalendar(links);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await api.approveDraft(id);
      setNotification(t('approveInbox.approved'));
      await refresh();
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActingId(id);
    try {
      await api.rejectDraft(id);
      setNotification(t('approveInbox.declined'));
      await refresh();
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-money-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Inbox className="text-money-400" />
          {t('approveInbox.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('approveInbox.subtitle')}</p>
        {count > 0 && (
          <p className="text-yellow-400 text-sm mt-2 font-medium">
            {t('approveInbox.pending', { count })}
          </p>
        )}
      </div>

      {/* Calendar — one tap add */}
      <div className="card border-blue-600/20 bg-blue-950/10">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-blue-400" />
          {t('approveInbox.calendarTitle')}
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          {t('approveInbox.calendarNote', {
            time: calendar?.reminderTime ?? '09:00',
            tz: calendar?.timezone ?? 'local',
          })}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={calendar?.googleCalendarDailyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-500"
          >
            <CalendarPlus size={16} />
            {t('approveInbox.addGoogleCalendar')}
          </a>
          <a
            href={calendar?.icsDailyUrl}
            download="sgos-daily-approval-reminder.ics"
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <Calendar size={16} />
            {t('approveInbox.downloadIcs')}
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-2">{t('approveInbox.calendarHint')}</p>
      </div>

      {/* Pending drafts — big approve / decline */}
      {drafts.length === 0 ? (
        <div className="card text-center py-10">
          <CheckCircle2 className="mx-auto text-money-400 mb-3" size={40} />
          <p className="text-white font-medium">{t('approveInbox.allClear')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('approveInbox.allClearNote')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((d, i) => (
            <div
              key={d.id}
              className={`card ${i === 0 ? 'border-yellow-500/40 ring-1 ring-yellow-500/20' : ''}`}
            >
              {i === 0 && (
                <p className="text-xs text-yellow-400 font-medium uppercase tracking-wide mb-2">
                  {t('approveInbox.upNext')}
                </p>
              )}
              <p className="font-mono text-white text-sm">{d.folderPath}/</p>
              <p className="text-gray-400 text-sm mt-1">
                {d.batchDate} · {d.proposalCount} {t('approveInbox.proposals')} · {d.appCount} apps
              </p>
              <p className="text-xs text-gray-600 mt-1">Sent = 0 · {t('approveInbox.noAutoSend')}</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleApprove(d.id)}
                  disabled={actingId === d.id}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-lg disabled:opacity-50 transition-colors"
                >
                  {actingId === d.id ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={22} />
                      {t('approveInbox.approve')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(d.id)}
                  disabled={actingId === d.id}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl bg-dark-700 hover:bg-red-900/60 border border-gray-700 hover:border-red-600/50 text-gray-200 font-semibold text-lg disabled:opacity-50 transition-colors"
                >
                  <XCircle size={22} />
                  {t('approveInbox.decline')}
                </button>
              </div>

              <a
                href={`/api/shortcuts/calendar/batch/${d.id}.ics`}
                download
                className="inline-flex items-center gap-1 text-xs text-blue-400 mt-3 hover:underline"
              >
                <Calendar size={12} />
                {t('approveInbox.remindThisBatch')}
              </a>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-600">
        <a href="/shortcuts" className="text-purple-400 hover:underline inline-flex items-center gap-1">
          {t('approveInbox.fullStatus')} <ExternalLink size={10} />
        </a>
      </p>

      <ShortcutNotification message={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
