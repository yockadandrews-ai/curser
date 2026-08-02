import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import { useSgosLocale } from '../../i18n/useSgosLocale';
import type { SmsLog } from '../../types/sgos';

export default function ActivityLog() {
  const { t } = useTranslation();
  const { path, locale } = useSgosLocale();
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  const statusBadge = (log: SmsLog) => {
    if (log.status === 'delivered') return { label: t('logs.delivered'), cls: 'text-blue-400 bg-blue-900/30' };
    if (log.status === 'failed') return { label: t('logs.failed'), cls: 'text-red-400 bg-red-900/30' };
    return { label: t('logs.sent'), cls: 'text-emerald-400 bg-emerald-900/30' };
  };

  const refresh = async () => {
    setLoading(true);
    try {
      setLogs(await sgosApi.getLogs(50));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to={path('')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> {t('common.backCmd')}
        </Link>
        <button type="button" onClick={refresh} className="p-2 text-gray-400 hover:text-white">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <h2 className="text-lg font-bold">{t('logs.title')}</h2>

      {logs.length === 0 && !loading && (
        <p className="text-gray-500 text-sm">{t('logs.empty')}</p>
      )}

      <ul className="space-y-2">
        {logs.map((log) => {
          const badge = statusBadge(log);
          const plateCode = log.plate?.plate;
          const scenario = log.tagEvent?.scenario;
          const source = log.tagEvent?.source ?? 'direct';
          return (
            <li key={log.id} className="rounded-xl bg-sgos-900 border border-sgos-800 p-3">
              <div className="flex justify-between items-start gap-2 mb-1">
                <div>
                  {plateCode && <span className="font-mono font-bold text-white">{plateCode}</span>}
                  {scenario && <span className="text-xs text-sgos-accent ml-2">{scenario}</span>}
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {source} · {formatDate(log.createdAt)}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 font-mono">{log.body}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
