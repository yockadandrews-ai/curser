import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Loader2, Upload, DollarSign, Package } from 'lucide-react';
import { api } from '../api';
import type { NotionTool, NotionInventory } from '../types';

export default function NotionTools() {
  const [inventory, setInventory] = useState<NotionInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [newTool, setNewTool] = useState({ name: '', description: '', sellPrice: '', category: '' });

  const refresh = useCallback(async () => {
    try {
      setInventory(await api.getNotionInventory());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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
          Notion Tools Inventory
        </h1>
        <p className="text-gray-400 mt-1">
          Your Kimi3 / Notion tools — separate from Money Autopilot affiliate products
        </p>
      </div>

      {/* Status banner */}
      <div className="card border-blue-600/20">
        {inventory?.hasPriceList ? (
          <p className="text-sm text-gray-300">
            ✅ <span className="text-blue-400 font-medium">{inventory.pricedTools}</span> tools have prices set ·{' '}
            <span className="text-gray-500">{inventory.unpricedTools} still need pricing</span>
          </p>
        ) : (
          <p className="text-sm text-gray-300">
            📋 <span className="text-yellow-400 font-medium">No price list yet</span> — import your 30+ tools below, add prices when ready
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><p className="text-gray-400 text-sm">Total Tools</p><p className="stat-value">{inventory?.totalTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">With Price</p><p className="stat-value">{inventory?.pricedTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">Need Price</p><p className="stat-value text-yellow-400">{inventory?.unpricedTools ?? 0}</p></div>
        <div className="card"><p className="text-gray-400 text-sm">Sold</p><p className="stat-value">{inventory?.totalSold ?? 0}</p></div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Tool
        </button>
        <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Upload size={16} /> Bulk Import from Notion List
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card grid md:grid-cols-2 gap-3">
          <input className="input" placeholder="Tool name *" value={newTool.name} onChange={e => setNewTool(f => ({ ...f, name: e.target.value }))} required />
          <input className="input" placeholder="Category (optional)" value={newTool.category} onChange={e => setNewTool(f => ({ ...f, category: e.target.value }))} />
          <input className="input" placeholder="Price per tool (optional — add later)" type="number" step="0.01" value={newTool.sellPrice} onChange={e => setNewTool(f => ({ ...f, sellPrice: e.target.value }))} />
          <input className="input md:col-span-2" placeholder="Description (optional)" value={newTool.description} onChange={e => setNewTool(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn-primary">Save Tool</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {showImport && (
        <div className="card space-y-3">
          <p className="text-sm text-gray-400">Paste your Notion tool list — one tool name per line:</p>
          <textarea
            className="input h-40 font-mono text-sm"
            placeholder={"Tool 1\nTool 2\nTool 3\n..."}
            value={importText}
            onChange={e => setImportText(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleImport} className="btn-primary">Import Tools</button>
            <button onClick={() => setShowImport(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium text-gray-400">No tools imported yet</p>
          <p className="text-sm mt-2">Paste your 30+ Notion tools using Bulk Import above</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">Tool</th>
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Stock</th>
                <th className="text-right py-2">Sold</th>
              </tr>
            </thead>
            <tbody>
              {tools.map(tool => (
                <tr key={tool.id} className="border-b border-gray-800/50 hover:bg-dark-800/30">
                  <td className="py-3">
                    <p className="font-medium text-white">{tool.name}</p>
                    {tool.description && <p className="text-xs text-gray-500">{tool.description}</p>}
                  </td>
                  <td className="py-3 text-gray-400 capitalize">{tool.category || '—'}</td>
                  <td className="py-3 text-right">
                    {tool.sellPrice != null ? (
                      <span className="text-money-400 font-semibold flex items-center justify-end gap-1">
                        <DollarSign size={12} />{tool.sellPrice.toFixed(2)}/tool
                      </span>
                    ) : (
                      <span className="text-yellow-400/70 text-xs">No price yet</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-400">
                    <span className="flex items-center justify-end gap-1"><Package size={12} />{tool.stock ?? 0}</span>
                  </td>
                  <td className="py-3 text-right text-gray-300">{tool.unitsSold ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
