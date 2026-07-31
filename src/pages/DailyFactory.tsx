import { useState, useEffect, useCallback } from 'react';
import {
  Factory, Play, CheckCircle2, XCircle, Loader2, FolderOpen,
  FileText, ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';
import { api } from '../api';
import type { DailyRun, MultiThemeRun } from '../types/factory';

const THEMES = [
  'Conversion & Revenue',
  'Margin & Operations',
  'Acquisition & Lead Systems',
  'Governance & Trust',
  'Growth Infrastructure',
];

function QualityBadge({ passed }: { passed: boolean }) {
  return passed
    ? <span className="badge-green flex items-center gap-1"><CheckCircle2 size={12} /> Passed</span>
    : <span className="badge-yellow flex items-center gap-1"><XCircle size={12} /> Review</span>;
}

function ProposalCard({ proposal }: { proposal: DailyRun['proposals'][0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-dark-800/50 hover:bg-dark-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <FileText size={16} className={proposal.type === 'suite' ? 'text-purple-400' : 'text-blue-400'} />
          <span className="text-sm font-medium text-white">{proposal.title}</span>
          {proposal.type === 'suite' && <span className="badge-blue text-xs">Suite</span>}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {open && (
        <div className="p-4 bg-dark-900/50 max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{proposal.markdown}</pre>
        </div>
      )}
    </div>
  );
}

export default function DailyFactory() {
  const [runs, setRuns] = useState<DailyRun[]>([]);
  const [activeRun, setActiveRun] = useState<DailyRun | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [suggestedTheme, setSuggestedTheme] = useState('');
  const [multiRun, setMultiRun] = useState<MultiThemeRun | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [themes, runList] = await Promise.all([
        api.getFactoryThemes(),
        api.getFactoryRuns(),
      ]);
      setSuggestedTheme(themes.suggestedToday);
      if (!selectedTheme) setSelectedTheme(themes.suggestedToday);
      setRuns(runList);
      if (runList.length > 0 && !activeRun) setActiveRun(runList[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedTheme, activeRun]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleGenerateThree = async () => {
    setGenerating(true);
    try {
      const run = await api.runFactoryThree();
      setMultiRun(run);
      setViewMode('multi');
      await refresh();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const run = await api.runFactory(selectedTheme);
      setActiveRun(run);
      setViewMode('single');
      await refresh();
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-money-400" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Factory className="text-orange-400" />
          Daily Factory
        </h1>
        <p className="text-gray-400 mt-1">
          5 apps + 5 proposals every day — ready for Cursor / sales / outreach
        </p>
      </div>

      {/* Workflow overview */}
      <div className="card border-orange-600/20">
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          {[
            { step: '1', label: 'Cluster Selection', time: '20 min', desc: 'Pick theme, refine 5 apps' },
            { step: '2', label: 'App Definitions', time: '40 min', desc: 'Full template per app' },
            { step: '3', label: '5 Proposals', time: '45 min', desc: 'Singles + suite proposal' },
            { step: '4', label: 'Packaging', time: '15 min', desc: 'Folder for Cursor handoff' },
          ].map(s => (
            <div key={s.step} className="text-center p-3 bg-dark-800/50 rounded-lg">
              <p className="text-orange-400 font-bold text-lg">{s.step}</p>
              <p className="font-medium text-white">{s.label}</p>
              <p className="text-xs text-gray-500">{s.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate controls */}
      <div className="card flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-48">
          <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1">
            <Calendar size={14} /> Today's Theme
          </label>
          <select className="input" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}>
            {THEMES.map(t => (
              <option key={t} value={t}>{t}{t === suggestedTheme ? ' (suggested today)' : ''}</option>
            ))}
          </select>
        </div>
        <button onClick={handleGenerateThree} disabled={generating} className="btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-500">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Factory size={16} />}
          Run 3 Themes (15 Apps)
        </button>
        <button onClick={handleGenerate} disabled={generating} className="btn-secondary flex items-center gap-2">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Single Theme
        </button>
      </div>

      {viewMode === 'multi' && multiRun && (
        <>
          <div className="card border-orange-600/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Multi-theme package · {multiRun.date}</p>
                <p className="font-semibold text-white flex items-center gap-2 mt-1">
                  <FolderOpen size={18} className="text-orange-400" />
                  {multiRun.folderPath}/
                </p>
              </div>
              <QualityBadge passed={multiRun.qualityPassed} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div><span className="text-gray-500">Apps</span><p className="text-white font-semibold">{multiRun.totalApps}</p></div>
              <div><span className="text-gray-500">Proposals</span><p className="text-white font-semibold">{multiRun.totalProposals}</p></div>
              <div><span className="text-gray-500">Themes</span><p className="text-white font-semibold">{multiRun.themes.length}</p></div>
            </div>
          </div>

          {multiRun.themes.map(themeRun => (
            <div key={themeRun.id}>
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-orange-400">{themeRun.theme}</span>
                <span className="text-xs text-gray-500 font-normal">{themeRun.apps.length} apps</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
                {themeRun.apps.map((app, i) => (
                  <div key={app.appName} className="card text-sm py-3">
                    <span className="text-orange-400 text-xs font-bold">#{i + 1}</span>
                    <h3 className="font-medium text-white mt-1">{app.appName}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{app.oneLinePromise}</p>
                    <p className="text-xs text-money-400 mt-2">{app.suggestedPricing}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Output Folder Structure</h3>
            <pre className="text-xs text-gray-400 font-mono bg-dark-800/50 p-4 rounded-lg">{`${multiRun.folderPath}/
├── 01_Conversion_Revenue/
│   ├── Apps.md
│   ├── Proposals/ (5 singles)
│   └── Suite_Proposal.md
├── 02_Margin_Operations/
│   ├── Apps.md
│   ├── Proposals/
│   └── Suite_Proposal.md
├── 03_Acquisition_Lead_Systems/
│   ├── Apps.md
│   ├── Proposals/
│   └── Suite_Proposal.md
└── Master_Notes_for_Cursor.md`}</pre>
            <p className="text-xs text-gray-500 mt-2">Written to <code className="text-orange-400">output/{multiRun.folderPath}/</code></p>
          </div>
        </>
      )}

      {viewMode === 'multi' && !multiRun && (
        <div className="card text-center py-12 text-gray-500">
          <Factory size={40} className="mx-auto mb-3 opacity-50" />
          <p>Click <strong className="text-orange-400">Run 3 Themes</strong> for the full 15-app package</p>
        </div>
      )}

      {viewMode === 'single' && activeRun && (
        <>
          {/* Run summary */}
          <div className="card border-money-600/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">{activeRun.date} · {activeRun.theme}</p>
                <p className="font-semibold text-white flex items-center gap-2 mt-1">
                  <FolderOpen size={18} className="text-money-400" />
                  {activeRun.folderPath}/
                </p>
              </div>
              <QualityBadge passed={activeRun.qualityPassed} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div><span className="text-gray-500">Apps</span><p className="text-white font-semibold">{activeRun.apps.length}</p></div>
              <div><span className="text-gray-500">Proposals</span><p className="text-white font-semibold">{activeRun.proposals.length}</p></div>
              <div><span className="text-gray-500">Quality checks</span><p className="text-white font-semibold">{activeRun.qualityChecks.filter(q => q.passed).length}/{activeRun.qualityChecks.length} passed</p></div>
            </div>
          </div>

          {/* 5 Apps */}
          <div>
            <h2 className="font-semibold text-white mb-4">5 App Definitions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRun.apps.map((app, i) => (
                <div key={app.appName} className="card hover:border-orange-600/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-orange-400 font-bold">#{i + 1}</span>
                    <QualityBadge passed={activeRun.qualityChecks[i]?.passed ?? false} />
                  </div>
                  <h3 className="font-semibold text-white">{app.appName}</h3>
                  <p className="text-sm text-gray-400 mt-1">{app.oneLinePromise}</p>
                  <p className="text-xs text-money-400 mt-2">{app.suggestedPricing}</p>
                  <p className="text-xs text-gray-500 mt-1">→ {app.successMetric}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proposals */}
          <div>
            <h2 className="font-semibold text-white mb-4">
              Proposals ({activeRun.proposals.filter(p => p.type === 'single').length} singles + 1 suite)
            </h2>
            <div className="space-y-2">
              {activeRun.proposals.map(p => (
                <ProposalCard key={p.title} proposal={p} />
              ))}
            </div>
          </div>

          {/* Folder structure */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Output Folder Structure</h3>
            <pre className="text-xs text-gray-400 font-mono bg-dark-800/50 p-4 rounded-lg">{`${activeRun.folderPath}/
├── 01_AppDefinitions.md
├── 02_Proposals/
│   ├── Proposal_${activeRun.apps[0]?.appName.replace(/\s+/g, '')}.md
│   ├── ... (${activeRun.apps.length} singles)
│   └── Proposal_Suite.md
├── 03_SalesAssets/
└── 04_Notes_for_Cursor.md`}</pre>
            <p className="text-xs text-gray-500 mt-2">Written to <code className="text-orange-400">output/{activeRun.folderPath}/</code> — send to Cursor to scaffold.</p>
          </div>
        </>
      )}

      {/* Past runs */}
      {runs.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Past Runs</h3>
          <div className="flex flex-wrap gap-2">
            {runs.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveRun(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  activeRun?.id === r.id
                    ? 'border-orange-600/40 bg-orange-600/10 text-orange-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {r.date} — {r.theme}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
