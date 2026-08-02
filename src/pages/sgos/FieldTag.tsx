import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { sgosApi } from '../../sgosApi';
import type { FieldTagResult } from '../../types/sgos';

function speakPrompt(text: string) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    speechSynthesis.speak(u);
  }
}

export default function FieldTag() {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FieldTagResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (value?: string) => {
    const code = (value ?? plate).trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await sgosApi.fieldTag(code);
      setResult(res);
      setPlate(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      setError('Voice input not supported in this browser');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    setListening(true);
    speakPrompt('Plate code?');
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const transcript = ev.results[0][0].transcript.replace(/\s+/g, '');
      setPlate(transcript.toUpperCase());
      setListening(false);
      submit(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  return (
    <div className="space-y-5">
      <Link to="/sgos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Command Center
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 p-5">
        <h2 className="text-xl font-bold text-white mb-1">FIELD TAG</h2>
        <p className="text-sm text-gray-400 mb-4">Enter or dictate a plate code</p>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="sgos-input flex-1 uppercase tracking-widest font-mono text-lg"
            placeholder="JG6613"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button
            type="button"
            onClick={startVoice}
            disabled={listening}
            className={`p-3 rounded-xl border transition-colors ${listening ? 'bg-red-900/50 border-red-600 animate-pulse' : 'bg-sgos-800 border-sgos-700 hover:border-sgos-accent'}`}
            aria-label="Voice input"
          >
            <Mic size={22} className={listening ? 'text-red-400' : 'text-sgos-accent'} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => submit()}
          disabled={loading || !plate.trim()}
          className="sgos-btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? 'Sending SMS…' : 'Tag & Send SMS'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/50 border border-red-800 p-4 flex gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-sgos-900 border border-sgos-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="font-semibold text-emerald-400">
              {result.sms.status === 'mock' ? 'SMS queued (mock mode)' : 'SMS sent'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Plate</span><p className="font-mono font-bold">{result.plate.plateCode}</p></div>
            <div><span className="text-gray-500">Scenario</span><p className="text-sgos-accent font-semibold">{result.classified.scenario}</p></div>
            <div className="col-span-2"><span className="text-gray-500">Location</span><p>{result.plate.location}</p></div>
          </div>
          <pre className="text-xs bg-black/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-gray-300 font-mono leading-relaxed">
            {result.sms.body}
          </pre>
        </div>
      )}
    </div>
  );
}
