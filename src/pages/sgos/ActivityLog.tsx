import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { SmsLog } from '../../types/sgos';

function statusBadge(log: SmsLog) {
  if (log.status === 'delivered') return { label: 'Delivered', cls: 'text-blue-400 bg-blue-900/30' };
  if (log.status === 'failed') return { label: 'Failed', cls: 'text-red-400 bg-red-900/30' };
  return { label: 'Sent', cls: 'text-emerald-400 bg-emerald-900/30' };
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setLogs(await sgosApi.getLogs(50));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> CMD
        </Link>
        <button type="button" onClick={refresh} className="p-2 text-gray-400 hover:text-white">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <h2 className="text-lg font-bold">SMS Activity</h2>

      {logs.length === 0 && !loading && (
        <p className="text-gray-500 text-sm">No messages yet. Tag a plate to get started.</p>
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
                  <p className="text-[10px] text-gray-500 mt-0.5">{source} · {new Date(log.createdAt).toLocaleString()}</p>
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
