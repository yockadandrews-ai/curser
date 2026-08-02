import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { SgosSettings } from '../../types/sgos';

export default function SgosSettingsPage() {
  const [settings, setSettings] = useState<SgosSettings | null>(null);
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sgosApi.getSettings().then((s) => {
      setSettings(s);
      setPhone(s.operatorPhone);
    });
  }, []);

  const save = async () => {
    const updated = await sgosApi.updateSettings(phone);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <p className="text-gray-500 text-sm">Loading…</p>;

  return (
    <div className="space-y-5">
      <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Command Center
      </Link>

      <h2 className="text-lg font-bold">Settings</h2>

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

      <div className="rounded-xl bg-sgos-900/60 border border-sgos-800 p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Plate registry</span>
          <span className="text-white">{settings.plateCount} plates</span>
        </div>
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
            <code className="text-gray-300">SENDBLUE_FROM_NUMBER</code> env vars for live SMS.
          </p>
        )}
      </div>
    </div>
  );
}
