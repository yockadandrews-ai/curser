import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ShoppingCart, Receipt, TrendingUp, Loader2, Package } from 'lucide-react';
import { api } from '../api';
import type { Product, Sale, Expense, Stats } from '../types';

export default function RealEarnings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [productForm, setProductForm] = useState({ name: '', cost: '', sellPrice: '', category: 'general' });
  const [saleForm, setSaleForm] = useState({ productId: '', quantity: '1' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });

  const refresh = useCallback(async () => {
    try {
      const [p, s, e, st] = await Promise.all([
        api.getProducts(), api.getSales(), api.getExpenses(), api.getStats(),
      ]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addProduct({
      name: productForm.name,
      cost: parseFloat(productForm.cost),
      sellPrice: parseFloat(productForm.sellPrice),
      category: productForm.category,
    });
    setProductForm({ name: '', cost: '', sellPrice: '', category: 'general' });
    setShowAddProduct(false);
    refresh();
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addSale({ productId: saleForm.productId, quantity: parseInt(saleForm.quantity) });
    setSaleForm({ productId: '', quantity: '1' });
    setShowAddSale(false);
    refresh();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addExpense({ description: expenseForm.description, amount: parseFloat(expenseForm.amount) });
    setExpenseForm({ description: '', amount: '' });
    setShowAddExpense(false);
    refresh();
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    refresh();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-money-400" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-money-400" />
          Real Earnings
        </h1>
        <p className="text-gray-400 mt-1">Track your real products, sales, and profits — autopilot uses this data</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}` },
          { label: 'Total Profit', value: `$${(stats?.totalProfit ?? 0).toFixed(2)}` },
          { label: 'Net Profit', value: `$${(stats?.netProfit ?? 0).toFixed(2)}` },
          { label: 'This Month', value: `$${(stats?.monthlyProfit ?? 0).toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className="stat-value mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Products */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={18} className="text-money-400" />
            Your Products ({products.length})
          </h2>
          <button onClick={() => setShowAddProduct(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {showAddProduct && (
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-dark-800/50 rounded-lg">
            <input className="input" placeholder="Product name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="input" type="number" step="0.01" placeholder="Cost ($)" value={productForm.cost} onChange={e => setProductForm(f => ({ ...f, cost: e.target.value }))} required />
            <input className="input" type="number" step="0.01" placeholder="Sell price ($)" value={productForm.sellPrice} onChange={e => setProductForm(f => ({ ...f, sellPrice: e.target.value }))} required />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => setShowAddProduct(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products yet. Add your first product above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Cost</th>
                  <th className="text-right py-2">Sell</th>
                  <th className="text-right py-2">Profit</th>
                  <th className="text-right py-2">Viral Score</th>
                  <th className="text-right py-2">Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const profit = p.sellPrice - p.cost;
                  const margin = p.cost > 0 ? ((profit / p.cost) * 100).toFixed(0) : '∞';
                  return (
                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-dark-800/30">
                      <td className="py-3 font-medium text-white">{p.name}</td>
                      <td className="py-3 text-right text-gray-400">${p.cost.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-300">${p.sellPrice.toFixed(2)}</td>
                      <td className="py-3 text-right text-money-400">${profit.toFixed(2)} ({margin}%)</td>
                      <td className="py-3 text-right"><span className="badge-green">{p.viralScore}</span></td>
                      <td className="py-3 text-right">
                        <span className={p.source === 'discovered' ? 'badge-blue' : 'badge-yellow'}>{p.source}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-money-400" />
              Sales ({sales.length})
            </h2>
            <button onClick={() => setShowAddSale(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Record Sale
            </button>
          </div>

          {showAddSale && (
            <form onSubmit={handleAddSale} className="flex gap-2 mb-4 p-3 bg-dark-800/50 rounded-lg">
              <select className="input flex-1" value={saleForm.productId} onChange={e => setSaleForm(f => ({ ...f, productId: e.target.value }))} required>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="input w-20" type="number" min="1" value={saleForm.quantity} onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))} />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sales.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No sales recorded yet</p>
            ) : sales.slice(0, 10).map(s => {
              const product = products.find(p => p.id === s.productId);
              return (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <div>
                    <p className="text-sm text-white">{product?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()} · qty {s.quantity}</p>
                  </div>
                  <p className="text-money-400 font-semibold">+${s.profit.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Receipt size={18} className="text-red-400" />
              Expenses ({expenses.length})
            </h2>
            <button onClick={() => setShowAddExpense(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> Add Expense
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="flex gap-2 mb-4 p-3 bg-dark-800/50 rounded-lg">
              <input className="input flex-1" placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} required />
              <input className="input w-24" type="number" step="0.01" placeholder="$" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} required />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No expenses logged</p>
            ) : expenses.slice(0, 10).map(e => (
              <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <div>
                  <p className="text-sm text-white">{e.description}</p>
                  <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-red-400 font-semibold">-${e.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
