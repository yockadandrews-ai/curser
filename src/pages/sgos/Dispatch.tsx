import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { DispatchChannel } from '../../types/sgos';

const channels: { id: DispatchChannel; label: string; desc: string }[] = [
  { id: 'HERMES', label: 'HERMES', desc: 'Express courier lane' },
  { id: 'PORTAL', label: 'PORTAL', desc: 'Hub transfer route' },
  { id: 'COURIER', label: 'COURIER', desc: 'Standard field driver' },
];

export default function Dispatch() {
  const [channel, setChannel] = useState<DispatchChannel | null>(null);
  const [eta, setEta] = useState(15);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsBody, setSmsBody] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (ch: DispatchChannel) => {
    setChannel(ch);
    setLoading(true);
    setError(null);
    setSmsBody(null);
    try {
      const res = await sgosApi.dispatch(ch, eta, notes || undefined);
      setSmsBody(res.sms.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Command Center
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Truck size={20} className="text-emerald-300" />
          <h2 className="text-xl font-bold text-emerald-100">DISPATCH</h2>
        </div>
        <p className="text-sm text-emerald-200/60 mb-4">Notify driver channel</p>

        <label className="block text-xs text-gray-400 mb-1">ETA (minutes)</label>
        <input
          type="number"
          min={1}
          max={120}
          className="sgos-input mb-3"
          value={eta}
          onChange={(e) => setEta(Number(e.target.value))}
        />

        <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
        <input
          className="sgos-input mb-4"
          placeholder="Gate code, vehicle description…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="grid gap-2">
          {channels.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => submit(ch.id)}
              disabled={loading}
              className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${
                channel === ch.id
                  ? 'bg-emerald-800/50 border-emerald-500'
                  : 'bg-emerald-950/50 border-emerald-800 hover:border-emerald-600'
              }`}
            >
              <p className="font-bold text-emerald-100">{ch.label}</p>
              <p className="text-xs text-emerald-300/60">{ch.desc}</p>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-emerald-300">
            <Loader2 size={18} className="animate-spin" /> Notifying driver…
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {smsBody && (
        <pre className="text-xs bg-sgos-900 border border-sgos-800 rounded-xl p-4 whitespace-pre-wrap text-gray-300 font-mono">
          {smsBody}
        </pre>
      )}
    </div>
  );
}
