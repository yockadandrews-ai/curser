import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Factory, Play, CheckCircle2, XCircle, Loader2, FolderOpen,
  FileText, ChevronDown, ChevronUp, Calendar, Globe,
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
  const { t } = useTranslation();
  return passed
    ? <span className="badge-green flex items-center gap-1"><CheckCircle2 size={12} /> {t('common.passed')}</span>
    : <span className="badge-yellow flex items-center gap-1"><XCircle size={12} /> {t('common.review')}</span>;
}

function ProposalCard({ proposal }: { proposal: DailyRun['proposals'][0] }) {
  const { t } = useTranslation();
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
          {proposal.type === 'suite' && <span className="badge-blue text-xs">{t('common.suite')}</span>}
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
  const { t } = useTranslation();
  const [runs, setRuns] = useState<DailyRun[]>([]);
  const [activeRun, setActiveRun] = useState<DailyRun | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [suggestedTheme, setSuggestedTheme] = useState('');
  const [multiRun, setMultiRun] = useState<MultiThemeRun | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi');
  const [generating, setGenerating] = useState(false);
  const [multilingualResult, setMultilingualResult] = useState<string | null>(null);
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

  const handleMultilingual = async () => {
    setGenerating(true);
    try {
      const result = await api.generateMultilingualPackage();
      setMultilingualResult(`${result.folder}/ (${result.paths.join(', ')})`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-money-400" size={32} />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }

  const workflowSteps = [
    { step: '1', label: t('factory.step1'), time: '20 min', desc: t('factory.step1Desc') },
    { step: '2', label: t('factory.step2'), time: '40 min', desc: t('factory.step2Desc') },
    { step: '3', label: t('factory.step3'), time: '45 min', desc: t('factory.step3Desc') },
    { step: '4', label: t('factory.step4'), time: '15 min', desc: t('factory.step4Desc') },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Factory className="text-orange-400" />
          {t('factory.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('factory.subtitle')}</p>
        <p className="text-xs text-money-400/80 mt-2">{t('factory.i18nGate')}</p>
      </div>

      <div className="card border-orange-600/20">
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          {workflowSteps.map(s => (
            <div key={s.step} className="text-center p-3 bg-dark-800/50 rounded-lg">
              <p className="text-orange-400 font-bold text-lg">{s.step}</p>
              <p className="font-medium text-white">{s.label}</p>
              <p className="text-xs text-gray-500">{s.time}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-48">
          <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1">
            <Calendar size={14} /> {t('factory.todayTheme')}
          </label>
          <select className="input" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}>
            {THEMES.map(theme => (
              <option key={theme} value={theme}>
                {theme}{theme === suggestedTheme ? ` ${t('factory.suggestedToday')}` : ''}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleGenerateThree} disabled={generating} className="btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-500">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Factory size={16} />}
          {t('factory.runThree')}
        </button>
        <button onClick={handleGenerate} disabled={generating} className="btn-secondary flex items-center gap-2">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {t('factory.singleTheme')}
        </button>
        <button onClick={handleMultilingual} disabled={generating} className="btn-secondary flex items-center gap-2 border border-money-600/30">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} className="text-money-400" />}
          {t('factory.generateMultilingual')}
        </button>
      </div>

      {multilingualResult && (
        <div className="card border-money-600/30 text-sm">
          <p className="text-money-400 font-medium">{t('factory.generateMultilingual')}</p>
          <p className="text-gray-400 mt-1">{t('factory.multilingualNote')}</p>
          <p className="text-xs text-gray-500 mt-2">{t('factory.writtenTo')} <code className="text-orange-400">output/{multilingualResult}</code></p>
        </div>
      )}

      {viewMode === 'multi' && multiRun && (
        <>
          <div className="card border-orange-600/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">{t('factory.multiPackage')} · {multiRun.date}</p>
                <p className="font-semibold text-white flex items-center gap-2 mt-1">
                  <FolderOpen size={18} className="text-orange-400" />
                  {multiRun.folderPath}/
                </p>
              </div>
              <QualityBadge passed={multiRun.qualityPassed} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div><span className="text-gray-500">{t('common.apps')}</span><p className="text-white font-semibold">{multiRun.totalApps}</p></div>
              <div><span className="text-gray-500">{t('common.proposals')}</span><p className="text-white font-semibold">{multiRun.totalProposals}</p></div>
              <div><span className="text-gray-500">{t('common.themes')}</span><p className="text-white font-semibold">{multiRun.themes.length}</p></div>
            </div>
          </div>

          {multiRun.themes.map(themeRun => (
            <div key={themeRun.id}>
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-orange-400">{themeRun.theme}</span>
                <span className="text-xs text-gray-500 font-normal">{themeRun.apps.length} {t('common.apps').toLowerCase()}</span>
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
            <h3 className="font-semibold text-white mb-3">{t('factory.outputFolder')}</h3>
            <pre className="text-xs text-gray-400 font-mono bg-dark-800/50 p-4 rounded-lg">{`${multiRun.folderPath}/
├── 01_Conversion_Revenue/
│   ├── Apps.md (+ Language & Accessibility)
│   ├── Proposals/ (5 singles)
│   └── Suite_Proposal.md
├── Factory_Workflow_I18N.md
└── Master_Notes_for_Cursor.md`}</pre>
            <p className="text-xs text-gray-500 mt-2">{t('factory.writtenTo')} <code className="text-orange-400">output/{multiRun.folderPath}/</code></p>
          </div>
        </>
      )}

      {viewMode === 'multi' && !multiRun && (
        <div className="card text-center py-12 text-gray-500">
          <Factory size={40} className="mx-auto mb-3 opacity-50" />
          <p>{t('factory.clickRunThree')}</p>
        </div>
      )}

      {viewMode === 'single' && activeRun && (
        <>
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
              <div><span className="text-gray-500">{t('common.apps')}</span><p className="text-white font-semibold">{activeRun.apps.length}</p></div>
              <div><span className="text-gray-500">{t('common.proposals')}</span><p className="text-white font-semibold">{activeRun.proposals.length}</p></div>
              <div><span className="text-gray-500">{t('factory.qualityChecks')}</span><p className="text-white font-semibold">{activeRun.qualityChecks.filter(q => q.passed).length}/{activeRun.qualityChecks.length}</p></div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-4">{t('factory.appDefinitions')}</h2>
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

          <div>
            <h2 className="font-semibold text-white mb-4">
              {t('common.proposals')} ({activeRun.proposals.filter(p => p.type === 'single').length} + 1 {t('common.suite').toLowerCase()})
            </h2>
            <div className="space-y-2">
              {activeRun.proposals.map(p => (
                <ProposalCard key={p.title} proposal={p} />
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">{t('factory.outputFolder')}</h3>
            <pre className="text-xs text-gray-400 font-mono bg-dark-800/50 p-4 rounded-lg">{`${activeRun.folderPath}/
├── 01_AppDefinitions.md (+ Language & Accessibility)
├── 02_Proposals/
├── 03_SalesAssets/
├── 04_Notes_for_Cursor.md (i18n requirements)
└── 05_Factory_Workflow_I18N.md`}</pre>
            <p className="text-xs text-gray-500 mt-2">{t('factory.writtenTo')} <code className="text-orange-400">output/{activeRun.folderPath}/</code> — {t('factory.sendToCursor')}.</p>
          </div>
        </>
      )}

      {runs.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-3">{t('factory.pastRuns')}</h3>
          <div className="flex flex-wrap gap-2">
            {runs.map(r => (
              <button
                key={r.id}
                onClick={() => { setActiveRun(r); setViewMode('single'); }}
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
