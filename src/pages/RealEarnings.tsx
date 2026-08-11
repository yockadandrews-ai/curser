import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Trash2, ShoppingCart, Receipt, TrendingUp, Loader2, Package,
  Download, Upload, ChevronDown, Target, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { api } from '../api';
import { ShortcutNotification } from '../components/ProtectedShortcut';
import type { Product, Sale, Expense, Stats, ProductPerformanceRow, GoalAlert } from '../types';

type SortKey = 'productName' | 'totalRevenue' | 'totalProfit' | 'marginPct' | 'unitsSold';
type SortDir = 'asc' | 'desc';

export default function RealEarnings() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [performance, setPerformance] = useState<ProductPerformanceRow[]>([]);
  const [monthlyGoal, setMonthlyGoalState] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [productForm, setProductForm] = useState({ name: '', cost: '', sellPrice: '', category: 'general' });
  const [saleForm, setSaleForm] = useState({ productId: '', quantity: '1' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });
  const [notification, setNotification] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('totalProfit');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, s, e, st, perf, goal] = await Promise.all([
        api.getProducts(), api.getSales(), api.getExpenses(), api.getStats(),
        api.getProductPerformance(), api.getProfitGoal(),
      ]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
      setStats(st);
      setPerformance(perf);
      setMonthlyGoalState(goal.monthlyGoal);
      setGoalInput(String(goal.monthlyGoal));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const sortedPerformance = useMemo(() => {
    const rows = [...performance];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return rows;
  }, [performance, sortKey, sortDir]);

  const goalProgress = monthlyGoal > 0 ? Math.min(100, ((stats?.monthlyProfit ?? 0) / monthlyGoal) * 100) : 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'productName' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-gray-600" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-money-400" /> : <ArrowDown size={12} className="text-money-400" />;
  };

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportProfitCsv();
      const date = new Date().toISOString().split('T')[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-magnet-export-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setNotification(t('profitTracker.exportSuccess'));
    } catch {
      setNotification(t('profitTracker.exportFailed'));
    }
  };

  const handleImportFile = async (file: File, replace = false) => {
    const csv = await file.text();
    try {
      const result = await api.importProfitCsv(csv, replace ? 'replace' : 'merge');
      setNotification(
        t('profitTracker.importSuccess', {
          sales: result.salesImported,
          expenses: result.expensesImported,
        }),
      );
      if (result.errors.length) {
        setNotification(prev => `${prev} (${result.errors.length} warnings)`);
      }
      refresh();
    } catch {
      setNotification(t('profitTracker.importFailed'));
    }
  };

  const showGoalToast = (alert: GoalAlert) => {
    setNotification(alert.message);
  };

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
    setShowAddMenu(false);
    refresh();
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await api.addSale({ productId: saleForm.productId, quantity: parseInt(saleForm.quantity) });
    if (result.goalAlert) showGoalToast(result.goalAlert);
    setSaleForm({ productId: '', quantity: '1' });
    setShowAddSale(false);
    setShowAddMenu(false);
    refresh();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addExpense({ description: expenseForm.description, amount: parseFloat(expenseForm.amount) });
    setExpenseForm({ description: '', amount: '' });
    setShowAddExpense(false);
    setShowAddMenu(false);
    refresh();
  };

  const handleSaveGoal = async () => {
    const g = parseFloat(goalInput);
    if (Number.isNaN(g) || g < 0) return;
    await api.setProfitGoal(g);
    setMonthlyGoalState(g);
    setShowGoalEdit(false);
    setNotification(t('profitTracker.goalSaved', { goal: g.toFixed(0) }));
    refresh();
  };

  const handleLoadDemo = async () => {
    await api.seedProfitDemoData();
    setShowAddMenu(false);
    setNotification(t('profitTracker.demoLoaded'));
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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-money-400" />
            {t('profitTracker.title')}
          </h1>
          <p className="text-gray-400 mt-1">{t('profitTracker.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCsv} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} />
            {t('profitTracker.exportCsv')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Upload size={16} />
            {t('profitTracker.importCsv')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f, false);
              e.target.value = '';
            }}
          />
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(v => !v)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              {t('profitTracker.addData')}
              <ChevronDown size={14} />
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 card py-1 min-w-[180px] shadow-xl">
                <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-800" onClick={() => { setShowAddSale(true); setShowAddMenu(false); }}>
                  {t('earnings.recordSale')}
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-800" onClick={() => { setShowAddExpense(true); setShowAddMenu(false); }}>
                  {t('earnings.addExpense')}
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-800" onClick={() => { setShowAddProduct(true); setShowAddMenu(false); }}>
                  {t('earnings.addProduct')}
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-dark-800 border-t border-gray-800" onClick={handleLoadDemo}>
                  {t('profitTracker.loadDemo')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly goal bar */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-yellow-400" />
            <span className="text-white font-medium">{t('profitTracker.monthlyGoal')}</span>
            {showGoalEdit ? (
              <div className="flex items-center gap-2">
                <input className="input w-28 py-1 text-sm" type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} />
                <button type="button" className="btn-primary text-xs py-1" onClick={handleSaveGoal}>{t('common.save')}</button>
                <button type="button" className="btn-secondary text-xs py-1" onClick={() => setShowGoalEdit(false)}>{t('common.cancel')}</button>
              </div>
            ) : (
              <button type="button" className="text-money-400 font-semibold hover:underline" onClick={() => setShowGoalEdit(true)}>
                ${monthlyGoal.toLocaleString()}
              </button>
            )}
          </div>
          <span className="text-sm text-gray-400">
            ${(stats?.monthlyProfit ?? 0).toFixed(2)} · {goalProgress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
          <div className="h-full bg-money-500 transition-all duration-500" style={{ width: `${goalProgress}%` }} />
        </div>
        <p className="text-xs text-gray-600 mt-2">{t('profitTracker.goalHint')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('earnings.totalRevenue'), value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}` },
          { label: t('earnings.totalProfit'), value: `$${(stats?.totalProfit ?? 0).toFixed(2)}` },
          { label: t('earnings.netProfit'), value: `$${(stats?.netProfit ?? 0).toFixed(2)}` },
          { label: t('earnings.thisMonth'), value: `$${(stats?.monthlyProfit ?? 0).toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className="stat-value mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Product performance table */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={18} className="text-money-400" />
          {t('profitTracker.productPerformance')}
        </h2>
        {sortedPerformance.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">{t('profitTracker.noPerformance')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2">
                    <button type="button" className="flex items-center gap-1 hover:text-white" onClick={() => toggleSort('productName')}>
                      {t('earnings.colProduct')} <SortIcon col="productName" />
                    </button>
                  </th>
                  <th className="text-right py-2">{t('profitTracker.platform')}</th>
                  <th className="text-right py-2">
                    <button type="button" className="flex items-center gap-1 ml-auto hover:text-white" onClick={() => toggleSort('unitsSold')}>
                      {t('profitTracker.units')} <SortIcon col="unitsSold" />
                    </button>
                  </th>
                  <th className="text-right py-2">
                    <button type="button" className="flex items-center gap-1 ml-auto hover:text-white" onClick={() => toggleSort('totalRevenue')}>
                      {t('profitTracker.revenue')} <SortIcon col="totalRevenue" />
                    </button>
                  </th>
                  <th className="text-right py-2">
                    <button type="button" className="flex items-center gap-1 ml-auto hover:text-white" onClick={() => toggleSort('totalProfit')}>
                      {t('profitTracker.profit')} <SortIcon col="totalProfit" />
                    </button>
                  </th>
                  <th className="text-right py-2">
                    <button type="button" className="flex items-center gap-1 ml-auto hover:text-white" onClick={() => toggleSort('marginPct')}>
                      {t('profitTracker.margin')} <SortIcon col="marginPct" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPerformance.map((row, i) => (
                  <tr key={row.productId} className={`border-b border-gray-800/50 hover:bg-dark-800/30 ${i === 0 ? 'bg-money-950/20' : ''}`}>
                    <td className="py-3 font-medium text-white">
                      {i === 0 && <span className="text-xs text-money-400 mr-2">#1</span>}
                      {row.productName}
                    </td>
                    <td className="py-3 text-right"><span className="badge text-xs">{row.platform}</span></td>
                    <td className="py-3 text-right text-gray-300">{row.unitsSold}</td>
                    <td className="py-3 text-right text-gray-300">${row.totalRevenue.toFixed(2)}</td>
                    <td className="py-3 text-right text-money-400 font-semibold">${row.totalProfit.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-400">{row.marginPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline add forms from Add Data menu */}
      {showAddProduct && (
        <div className="card">
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input className="input" placeholder={t('earnings.productName')} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="input" type="number" step="0.01" placeholder={t('earnings.cost')} value={productForm.cost} onChange={e => setProductForm(f => ({ ...f, cost: e.target.value }))} required />
            <input className="input" type="number" step="0.01" placeholder={t('earnings.sellPrice')} value={productForm.sellPrice} onChange={e => setProductForm(f => ({ ...f, sellPrice: e.target.value }))} required />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">{t('common.save')}</button>
              <button type="button" onClick={() => setShowAddProduct(false)} className="btn-secondary">{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {showAddSale && (
        <div className="card">
          <form onSubmit={handleAddSale} className="flex gap-2">
            <select className="input flex-1" value={saleForm.productId} onChange={e => setSaleForm(f => ({ ...f, productId: e.target.value }))} required>
              <option value="">{t('earnings.selectProduct')}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input w-20" type="number" min="1" value={saleForm.quantity} onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))} />
            <button type="submit" className="btn-primary">{t('common.add')}</button>
            <button type="button" onClick={() => setShowAddSale(false)} className="btn-secondary">{t('common.cancel')}</button>
          </form>
        </div>
      )}

      {showAddExpense && (
        <div className="card">
          <form onSubmit={handleAddExpense} className="flex gap-2">
            <input className="input flex-1" placeholder={t('earnings.expenseDesc')} value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} required />
            <input className="input w-24" type="number" step="0.01" placeholder="$" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} required />
            <button type="submit" className="btn-primary">{t('common.add')}</button>
            <button type="button" onClick={() => setShowAddExpense(false)} className="btn-secondary">{t('common.cancel')}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={18} className="text-money-400" />
            {t('earnings.yourProducts', { count: products.length })}
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('earnings.noProducts')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2">{t('earnings.colProduct')}</th>
                  <th className="text-right py-2">{t('earnings.colCost')}</th>
                  <th className="text-right py-2">{t('earnings.colSell')}</th>
                  <th className="text-right py-2">{t('earnings.colProfit')}</th>
                  <th className="text-right py-2">{t('earnings.colViralScore')}</th>
                  <th className="text-right py-2">{t('earnings.colSource')}</th>
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
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-money-400" />
              {t('earnings.sales', { count: sales.length })}
            </h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sales.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">{t('earnings.noSales')}</p>
            ) : sales.slice(0, 10).map(s => {
              const product = products.find(p => p.id === s.productId);
              const displayName = s.itemName || product?.name || t('common.unknown');
              return (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <div>
                    <p className="text-sm text-white">
                      {displayName}
                      {s.saleType === 'notion_tool' && <span className="ml-2 text-xs text-blue-400">Notion</span>}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()} · {t('earnings.qty', { count: s.quantity })}</p>
                  </div>
                  <p className="text-money-400 font-semibold">+${s.profit.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Receipt size={18} className="text-red-400" />
              {t('earnings.expenses', { count: expenses.length })}
            </h2>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">{t('earnings.noExpenses')}</p>
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

      <ShortcutNotification message={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
