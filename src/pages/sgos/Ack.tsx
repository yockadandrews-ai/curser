import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { AckCode } from '../../types/sgos';

const ackButtons: { code: AckCode; label: string; desc: string; color: string }[] = [
  { code: 'PKG-OK', label: 'PKG-OK', desc: 'Package delivered', color: 'bg-emerald-900/60 border-emerald-600 hover:border-emerald-400' },
  { code: 'DRV-IN', label: 'DRV-IN', desc: 'Driver checked in', color: 'bg-blue-900/60 border-blue-600 hover:border-blue-400' },
  { code: 'HOLD', label: 'HOLD', desc: 'Awaiting clearance', color: 'bg-yellow-900/60 border-yellow-600 hover:border-yellow-400' },
  { code: 'ABORT', label: 'ABORT', desc: 'Cancel operation', color: 'bg-red-900/60 border-red-600 hover:border-red-400' },
];

export default function Ack() {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [lastSms, setLastSms] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (code: AckCode) => {
    setLoading(code);
    setError(null);
    setLastSms(null);
    try {
      const res = await sgosApi.ack(code, plate.trim() || undefined);
      setLastSms(res.sms.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ACK failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Command Center
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-red-900 to-red-950 border border-red-700/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={20} className="text-red-300" />
          <h2 className="text-xl font-bold text-red-100">ACK</h2>
        </div>
        <p className="text-sm text-red-200/60 mb-4">Close the loop — team gets notified</p>

        <label className="block text-xs text-gray-400 mb-1">Plate (optional)</label>
        <input
          className="sgos-input mb-4 uppercase font-mono"
          placeholder="Link ACK to plate"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
        />

        <div className="grid grid-cols-2 gap-2">
          {ackButtons.map(({ code, label, desc, color }) => (
            <button
              key={code}
              type="button"
              onClick={() => submit(code)}
              disabled={loading !== null}
              className={`p-4 rounded-xl border text-left transition-all active:scale-[0.97] ${color}`}
            >
              {loading === code ? (
                <Loader2 size={20} className="animate-spin text-white mb-1" />
              ) : (
                <p className="font-bold text-white text-lg">{label}</p>
              )}
              <p className="text-[10px] text-gray-300 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {lastSms && (
        <div className="rounded-xl bg-sgos-900 border border-emerald-800/50 p-4">
          <p className="text-emerald-400 text-sm font-semibold mb-2">Loop closed ✓</p>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{lastSms}</pre>
        </div>
      )}
    </div>
  );
}
