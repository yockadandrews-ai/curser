import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Upload, Database } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import { useSgosLocale } from '../../i18n/useSgosLocale';
import LanguageSwitcher from '../../components/sgos/LanguageSwitcher';
import type { SgosSettings } from '../../types/sgos';

export default function SgosSettingsPage() {
  const { t } = useTranslation();
  const { path } = useSgosLocale();
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

  useEffect(() => {
    refresh();
  }, []);

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
      setImportResult(
        t('settings.importResult', {
          created: result.created,
          updated: result.updated,
          total: result.plateCount,
        }),
      );
      await refresh();
    } catch (e) {
      setImportResult(e instanceof Error ? e.message : t('settings.importFailed'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to={path('')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> {t('common.back')}
      </Link>

      <h2 className="text-lg font-bold">{t('settings.title')}</h2>

      <LanguageSwitcher />

      <div
        className={`rounded-xl border p-4 flex items-center gap-3 ${
          dbHealth === 'ok' ? 'bg-emerald-950/30 border-emerald-800' : 'bg-red-950/30 border-red-800'
        }`}
      >
        <Database size={20} className={dbHealth === 'ok' ? 'text-emerald-400' : 'text-red-400'} />
        <div>
          <p className="text-sm font-semibold text-white">{t('settings.postgresTitle')}</p>
          <p className="text-xs text-gray-400">
            {dbHealth === 'ok'
              ? t('settings.postgresOk', { count: settings?.plateCount ?? 0 })
              : t('settings.postgresError')}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">{t('settings.operatorPhone')}</label>
          <input
            className="sgos-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('settings.phonePlaceholder')}
          />
        </div>

        <button type="button" onClick={save} className="sgos-btn-primary flex items-center gap-2">
          <Save size={16} />
          {saved ? t('common.saved') : t('settings.savePhone')}
        </button>
      </div>

      <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Upload size={16} className="text-sgos-accent" />
          {t('settings.importTitle')}
        </h3>
        <p className="text-xs text-gray-400">{t('settings.importDesc')}</p>
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
          {importing ? t('settings.importing') : t('settings.importBtn')}
        </button>
        {importResult && <p className="text-xs text-gray-300">{importResult}</p>}
        <p className="text-[10px] text-gray-500">{t('settings.importCli')}</p>
      </div>

      {settings && (
        <div className="rounded-xl bg-sgos-900/60 border border-sgos-800 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">{t('settings.sendblue')}</span>
            <span className={settings.sendblueConfigured ? 'text-emerald-400' : 'text-yellow-400'}>
              {settings.sendblueConfigured ? t('settings.sendblueConnected') : t('settings.sendblueMock')}
            </span>
          </div>
          {!settings.sendblueConfigured && (
            <p className="text-xs text-gray-500 pt-2 border-t border-sgos-800">{t('settings.sendblueHint')}</p>
          )}
        </div>
      )}
    </div>
  );
}
