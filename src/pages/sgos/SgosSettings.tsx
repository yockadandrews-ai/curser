import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Database } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { SgosSettings } from '../../types/sgos';

export default function SgosSettingsPage() {
  const [settings, setSettings] = useState<SgosSettings | null>(null);
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [dbHealth, setDbHealth] = useState<'ok' | 'error' | 'loading'>('loading');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    try {
      const s = await sgosApi.getSettings();
      setSettings(s);
      setPhone(s.operatorPhone);
      setDbHealth('ok');
    } catch {
      setDbHealth('error');
    }
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    const updated = await sgosApi.updateSettings(phone);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const ext = file.name.toLowerCase();
      const result = ext.endsWith('.csv')
        ? await sgosApi.importCsv(text, 'upsert')
        : await sgosApi.importPlates(JSON.parse(text), 'upsert');
      setImportResult(`Imported: ${result.created} new, ${result.updated} updated (${result.plateCount} total active)`);
      await refresh();
    } catch (e) {
      setImportResult(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Command Center
      </Link>

      <h2 className="text-lg font-bold">Settings</h2>

      <div className={`rounded-xl border p-4 flex items-center gap-3 ${
        dbHealth === 'ok' ? 'bg-emerald-950/30 border-emerald-800' : 'bg-red-950/30 border-red-800'
      }`}>
        <Database size={20} className={dbHealth === 'ok' ? 'text-emerald-400' : 'text-red-400'} />
        <div>
          <p className="text-sm font-semibold text-white">PostgreSQL Registry</p>
          <p className="text-xs text-gray-400">
            {dbHealth === 'ok'
              ? `${settings?.plateCount ?? 0} active plates · scalable to 1000+`
              : 'Database not connected — run: docker compose up -d && npm run db:push && npm run db:seed'}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Operator Phone (SMS destination)</label>
          <input
            className="sgos-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1-202-555-0147"
          />
        </div>

        <button type="button" onClick={save} className="sgos-btn-primary flex items-center gap-2">
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Phone'}
        </button>
      </div>

      <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Upload size={16} className="text-sgos-accent" />
          Import Master Registry
        </h3>
        <p className="text-xs text-gray-400">
          Drop <code className="text-gray-300">SGOS_Master_Plate_Registry_v2.json</code> or CSV (172+ plates)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileImport(f);
          }}
        />
        <button
          type="button"
          disabled={importing}
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-xl border border-sgos-accent/40 text-sgos-accent hover:bg-sgos-accent/10 transition-colors text-sm font-semibold"
        >
          {importing ? 'Importing…' : 'Choose JSON or CSV File'}
        </button>
        {importResult && <p className="text-xs text-gray-300">{importResult}</p>}
        <p className="text-[10px] text-gray-500">
          CLI: <code>npx tsx scripts/import-plates.ts ./registry.json</code>
        </p>
      </div>

      {settings && (
        <div className="rounded-xl bg-sgos-900/60 border border-sgos-800 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Sendblue</span>
            <span className={settings.sendblueConfigured ? 'text-emerald-400' : 'text-yellow-400'}>
              {settings.sendblueConfigured ? 'Connected' : 'Mock mode'}
            </span>
          </div>
          {!settings.sendblueConfigured && (
            <p className="text-xs text-gray-500 pt-2 border-t border-sgos-800">
              Set <code className="text-gray-300">SENDBLUE_API_KEY</code>,{' '}
              <code className="text-gray-300">SENDBLUE_API_SECRET</code>, and{' '}
              <code className="text-gray-300">SENDBLUE_FROM_NUMBER</code> for live SMS.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
