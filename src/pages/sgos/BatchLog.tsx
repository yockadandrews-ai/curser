import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Loader2, Layers } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import { useSgosLocale } from '../../i18n/useSgosLocale';
import type { BatchLogResult } from '../../types/sgos';

export default function BatchLog() {
  const { t } = useTranslation();
  const { path } = useSgosLocale();
  const [plates, setPlates] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchLogResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, val: string) => {
    const next = [...plates];
    next[i] = val.toUpperCase();
    setPlates(next);
  };

  const addRow = () => setPlates([...plates, '']);
  const removeRow = (i: number) => setPlates(plates.filter((_, idx) => idx !== i));

  const submit = async () => {
    const codes = plates.map((p) => p.trim()).filter(Boolean);
    if (codes.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await sgosApi.batchLog(codes);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('batchLog.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to={path('')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> {t('common.back')}
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={20} className="text-blue-300" />
          <h2 className="text-xl font-bold text-blue-100">{t('batchLog.title')}</h2>
        </div>
        <p className="text-sm text-blue-200/60 mb-4">{t('batchLog.subtitle')}</p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {plates.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="sgos-input flex-1 uppercase font-mono"
                placeholder={t('batchLog.plateN', { n: i + 1 })}
                value={p}
                onChange={(e) => update(i, e.target.value)}
              />
              {plates.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="p-2 text-gray-500 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className="mt-2 text-sm text-blue-300 flex items-center gap-1 hover:text-blue-100">
          <Plus size={16} /> {t('batchLog.addPlate')}
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="sgos-btn-primary w-full mt-4 bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? t('batchLog.processing') : t('batchLog.submit')}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {result && (
        <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-3">
          <p className="text-sm text-gray-300">
            {t('batchLog.found', { found: result.found, total: result.total })}
          </p>
          <ul className="space-y-2">
            {result.results.map((r) => (
              <li key={r.plate} className="text-sm flex justify-between gap-2 border-b border-sgos-800 pb-2 last:border-0">
                <span className="font-mono">{r.plate}</span>
                {r.found ? (
                  <span className="text-sgos-accent">{r.scenario}</span>
                ) : (
                  <span className="text-red-400">{t('errors.plateNotFound')}</span>
                )}
              </li>
            ))}
          </ul>
          {result.summarySms && (
            <pre className="text-xs bg-black/40 rounded-lg p-3 whitespace-pre-wrap text-gray-300 font-mono">
              {result.summarySms}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
