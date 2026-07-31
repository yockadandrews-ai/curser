import { useState, useEffect, useCallback } from 'react';
import { Wrench, ShoppingCart, Package, Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '../api';
import type { Product, SgosInventory } from '../types';

export default function SgosTools() {
  const [inventory, setInventory] = useState<SgosInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const inv = await api.getSgosInventory();
      setInventory(inv);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSellTool = async (tool: Product) => {
    setSelling(tool.id);
    try {
      await api.addSale({ productId: tool.id, quantity: 1 });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Sale failed');
    } finally {
      setSelling(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-money-400" size={32} /></div>;
  }

  const tools = inventory?.tools ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="text-money-400" />
          SGOS Tools Inventory
        </h1>
        <p className="text-gray-400 mt-1">Your tools — sold per tool, each with its own price & stock</p>
      </div>

      {/* Inventory summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Tools in Catalog</p>
          <p className="stat-value">{inventory?.totalTools ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Total Stock</p>
          <p className="stat-value">{inventory?.totalStock ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Tools Sold</p>
          <p className="stat-value">{inventory?.totalSold ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm flex items-center gap-1"><TrendingUp size={14} /> Revenue Potential</p>
          <p className="stat-value">${(inventory?.totalRevenuePotential ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {tools.map(tool => (
          <div key={tool.id} className="card hover:border-money-600/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge-green">SGOS</span>
                  <span className="text-xs text-gray-500 capitalize">{tool.category}</span>
                </div>
                <h3 className="font-semibold text-white mt-1">{tool.name}</h3>
                {tool.description && (
                  <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-money-400">${tool.sellPrice.toFixed(0)}</p>
                <p className="text-xs text-gray-500">per tool</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm mb-4 p-3 bg-dark-800/50 rounded-lg">
              <div>
                <p className="text-gray-500 text-xs">In Stock</p>
                <p className="text-white font-semibold flex items-center gap-1">
                  <Package size={12} /> {tool.stock ?? 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Sold</p>
                <p className="text-white font-semibold">{tool.unitsSold ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Viral Score</p>
                <p className="text-money-400 font-semibold">{tool.viralScore}</p>
              </div>
            </div>

            <button
              onClick={() => handleSellTool(tool)}
              disabled={selling === tool.id || (tool.stock ?? 0) <= 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {selling === tool.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
              {(tool.stock ?? 0) <= 0 ? 'Out of Stock' : `Sell Tool — $${tool.sellPrice.toFixed(0)}`}
            </button>
          </div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          <Wrench size={40} className="mx-auto mb-3 opacity-50" />
          <p>No SGOS tools in inventory yet.</p>
        </div>
      )}

      <div className="card border-money-600/20">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-money-400" />
          How per-tool selling works
        </h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Each SGOS tool has its own price — sold individually per tool</li>
          <li>• Stock decrements automatically when you record a sale</li>
          <li>• Autopilot promotes your SGOS tools first (before discovered products)</li>
          <li>• Viral Cash Generator creates tool-specific content for social posts</li>
        </ul>
      </div>
    </div>
  );
}
