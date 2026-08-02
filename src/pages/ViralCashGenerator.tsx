import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Copy, Check, Loader2, Send, RefreshCw, Flame } from 'lucide-react';
import { api } from '../api';
import type { Product, GeneratedContent } from '../types';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
  { id: 'facebook', label: 'Facebook', emoji: '👥' },
];

function ViralScore({ score }: { score: number }) {
  const color = score >= 90 ? 'text-red-400' : score >= 80 ? 'text-orange-400' : score >= 70 ? 'text-yellow-400' : 'text-gray-400';
  return (
    <div className="flex items-center gap-1">
      <Flame size={14} className={color} />
      <span className={`font-bold ${color}`}>{score}</span>
    </div>
  );
}

function ContentCard({ content, product }: { content: GeneratedContent; product?: Product }) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const fullText = `${content.hook}\n\n${content.caption}\n\n${content.hashtags}`;

  const copy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platform = PLATFORMS.find(p => p.id === content.platform);
  const statusKey = `viral.status${content.status.charAt(0).toUpperCase()}${content.status.slice(1)}` as 'viral.statusDraft';

  return (
    <div className="card border-gray-700 hover:border-money-600/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{platform?.emoji}</span>
          <span className="font-medium text-white capitalize">{content.platform}</span>
          {product && <span className="text-xs text-gray-500">· {product.name}</span>}
        </div>
        <div className="flex items-center gap-2">
          <ViralScore score={content.viralScore} />
          <span className={`badge ${content.status === 'posted' ? 'badge-green' : content.status === 'queued' ? 'badge-blue' : 'badge-yellow'}`}>
            {t(statusKey, { defaultValue: content.status })}
          </span>
        </div>
      </div>

      {content.locale && content.locale !== i18n.language && (
        <p className="text-xs text-gray-500 mb-2">{t('viral.localeTag', { locale: content.locale })}</p>
      )}

      <div className="bg-dark-800/50 rounded-lg p-3 space-y-2 text-sm">
        <p className="font-semibold text-white">{content.hook}</p>
        <p className="text-gray-300 whitespace-pre-line">{content.caption}</p>
        <p className="text-blue-400 text-xs">{content.hashtags}</p>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={copy} className="btn-secondary flex items-center gap-2 text-sm flex-1">
          {copied ? <Check size={14} className="text-money-400" /> : <Copy size={14} />}
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>
    </div>
  );
}

export default function ViralCashGenerator() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['tiktok', 'instagram', 'twitter']);
  const [generated, setGenerated] = useState<GeneratedContent[]>([]);
  const [allContent, setAllContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(async () => {
    const [p, c] = await Promise.all([api.getProducts(), api.getContent()]);
    setProducts(p);
    setAllContent(c);
    if (p.length > 0 && !selectedProductId) setSelectedProductId(p[0].id);
  }, [selectedProductId]);

  useEffect(() => { refresh(); }, [refresh]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProductId) return;
    setGenerating(true);
    try {
      const preview = await api.previewContent(selectedProductId, selectedPlatforms, i18n.language);
      setGenerated(preview as GeneratedContent[]);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndQueue = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const saved = await api.generateContent(selectedProductId, selectedPlatforms, i18n.language);
      setGenerated(saved);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.publishPosts();
      await refresh();
      setGenerated([]);
    } finally {
      setPublishing(false);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const profit = selectedProduct ? selectedProduct.sellPrice - selectedProduct.cost : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-money-400" />
          {t('viral.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('viral.subtitle')}</p>
      </div>

      <div className="card">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t('viral.selectProduct')}</label>
            {products.length === 0 ? (
              <div className="p-4 bg-dark-800/50 rounded-lg text-gray-500 text-sm text-center">{t('viral.noProducts')}</div>
            ) : (
              <select className="input" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                {products.map(p => {
                  const pProfit = p.sellPrice - p.cost;
                  return (
                    <option key={p.id} value={p.id}>
                      {t('viral.profitOption', { name: p.name, profit: pProfit.toFixed(2), score: p.viralScore })}
                    </option>
                  );
                })}
              </select>
            )}

            {selectedProduct && (
              <div className="mt-3 p-3 bg-dark-800/50 rounded-lg grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-gray-500">{t('viral.cost')}</p><p className="text-white font-semibold">${selectedProduct.cost.toFixed(2)}</p></div>
                <div><p className="text-gray-500">{t('viral.sellPrice')}</p><p className="text-white font-semibold">${selectedProduct.sellPrice.toFixed(2)}</p></div>
                <div><p className="text-gray-500">{t('viral.profit')}</p><p className="text-money-400 font-semibold">${profit.toFixed(2)}</p></div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t('viral.platforms')}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedPlatforms.includes(p.id)
                      ? 'bg-money-600/20 border border-money-600/40 text-money-400'
                      : 'bg-dark-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleGenerate} disabled={!selectedProductId || generating || selectedPlatforms.length === 0} className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {t('viral.generatePreview')}
              </button>
              <button onClick={handleSaveAndQueue} disabled={!selectedProductId || loading} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {t('viral.queuePosting')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {generated.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">{t('viral.previewTitle')}</h2>
            <button onClick={handlePublish} disabled={publishing} className="btn-primary flex items-center gap-2">
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {t('viral.publishQueued')}
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generated.map(c => <ContentCard key={c.id} content={c} product={selectedProduct} />)}
          </div>
        </div>
      )}

      {allContent.length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-4">{t('viral.historyTitle', { count: allContent.length })}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allContent.slice(0, 9).map(c => {
              const product = products.find(p => p.id === c.productId);
              return <ContentCard key={c.id} content={c} product={product} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
