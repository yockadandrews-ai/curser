import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Loader2, Upload, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { api } from '../api';
import type { NotionTool, NotionInventory } from '../types';

export default function NotionTools() {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<NotionInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [newTool, setNewTool] = useState({ name: '', description: '', sellPrice: '', category: '' });
  const [seeding, setSeeding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sellingId, setSellingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInventory(await api.getNotionInventory());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSyncPrices = async () => {
    setSyncing(true);
    try {
      await api.syncNotionPrices();
      await refresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleSell = async (toolId: string) => {
    setSellingId(toolId);
    try {
      await api.sellNotionTool(toolId, 1);
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSellingId(null);
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      await api.seedNotionCatalog(true);
      await refresh();
    } finally {
      setSeeding(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addNotionTool({
      name: newTool.name,
      description: newTool.description || undefined,
      category: newTool.category || undefined,
      sellPrice: newTool.sellPrice ? parseFloat(newTool.sellPrice) : null,
    });
    setNewTool({ name: '', description: '', sellPrice: '', category: '' });
    setShowAdd(false);
    refresh();
  };

  const handleImport = async () => {
    const names = importText.split('\n').map(l => l.trim()).filter(Boolean);
    await api.importNotionTools(names);
    setImportText('');
    setShowImport(false);
    refresh();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-money-400" size={32} /></div>;
  }

  const tools = inventory?.tools ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-blue-400" />
          {t('notionTools.title')}
        </h1>
        <p className="text-gray-400 mt-1">{t('notionTools.subtitle')}</p>
      </div>

      <div className="card border-blue-600/20">
        {inventory?.hasPriceList ? (
          <p className="text-sm text-gray-300">
            ✅ {t('notionTools.pricedBanner', {
              priced: inventory.pricedTools,
              unpriced: inventory.unpricedTools,
              stock: inventory.totalStock?.toLocaleString() ?? 0,
            })}
          </p>
        ) : (
          <p className="text-sm text-gray-300">{t('notionTools.importBanner')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><p className="text-gray-400 text-sm">{t('notionTools.totalTools')}</p><p className="stat-value">{inventory?.totalTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">{t('notionTools.withPrice')}</p><p className="stat-value">{inventory?.pricedTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">{t('notionTools.needPrice')}</p><p className="stat-value text-yellow-400">{inventory?.unpricedTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">{t('notionTools.sold')}</p><p className="stat-value">{inventory?.totalSold ?? 0}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={handleSeedCatalog} disabled={seeding} className="btn-primary flex items-center gap-2 text-sm">
          {seeding ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {t('notionTools.importCatalog')}
        </button>
        {(inventory?.unpricedTools ?? 0) > 0 && (
          <button onClick={handleSyncPrices} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm border-yellow-600/30">
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} className="text-yellow-400" />}
            {t('notionTools.syncPrices')}
          </button>
        )}
        <button onClick={() => setShowAdd(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus size={16} /> {t('notionTools.addTool')}
        </button>
        <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Upload size={16} /> {t('notionTools.pasteList')}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card grid md:grid-cols-2 gap-3">
          <input className="input" placeholder={`${t('notionTools.toolName')} *`} value={newTool.name} onChange={e => setNewTool(f => ({ ...f, name: e.target.value }))} required />
          <input className="input" placeholder={t('notionTools.category')} value={newTool.category} onChange={e => setNewTool(f => ({ ...f, category: e.target.value }))} />
          <input className="input" placeholder={t('notionTools.pricePerTool')} type="number" step="0.01" value={newTool.sellPrice} onChange={e => setNewTool(f => ({ ...f, sellPrice: e.target.value }))} />
          <input className="input md:col-span-2" placeholder={t('notionTools.description')} value={newTool.description} onChange={e => setNewTool(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn-primary">{t('notionTools.saveTool')}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {showImport && (
        <div className="card space-y-3">
          <p className="text-sm text-gray-400">{t('notionTools.importHint')}</p>
          <textarea className="input h-40 font-mono text-sm" placeholder={'Tool 1\nTool 2\n...'} value={importText} onChange={e => setImportText(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleImport} className="btn-primary">{t('notionTools.importTools')}</button>
            <button onClick={() => setShowImport(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-gray-400">{t('notionTools.noTools')}</p>
          <p className="text-sm mt-2">{t('notionTools.noToolsHint')}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">{t('notionTools.colTool')}</th>
                <th className="text-left py-2">{t('notionTools.colCategory')}</th>
                <th className="text-right py-2">{t('notionTools.colPrice')}</th>
                <th className="text-right py-2">{t('notionTools.colStock')}</th>
                <th className="text-right py-2">{t('notionTools.colSold')}</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool: NotionTool) => (
                <tr key={tool.id} className="border-b border-gray-800/50 hover:bg-dark-800/30">
                  <td className="py-3">
                    <p className="font-medium text-white">{tool.name}</p>
                    {tool.description && <p className="text-xs text-gray-500">{tool.description}</p>}
                  </td>
                  <td className="py-3 text-gray-400 capitalize">{tool.category || '—'}</td>
                  <td className="py-3 text-right">
                    {tool.sellPrice != null ? (
                      <span className="text-money-400 font-semibold flex items-center justify-end gap-1">
                        <DollarSign size={12} />{tool.sellPrice.toFixed(2)}{t('notionTools.perTool')}
                      </span>
                    ) : (
                      <span className="text-yellow-400/70 text-xs">{t('notionTools.noPriceYet')}</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-400">
                    <span className="flex items-center justify-end gap-1"><Package size={12} />{tool.stock ?? 0}</span>
                  </td>
                  <td className="py-3 text-right text-gray-300">{tool.unitsSold ?? 0}</td>
                  <td className="py-3 text-right">
                    {tool.sellPrice != null && (
                      <button
                        onClick={() => handleSell(tool.id)}
                        disabled={sellingId === tool.id}
                        className="btn-secondary text-xs py-1 px-2 flex items-center gap-1 ml-auto"
                      >
                        {sellingId === tool.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
                        {t('notionTools.recordSale')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
