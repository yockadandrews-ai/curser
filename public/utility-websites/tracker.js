/** Profit Tracker — local revenue log + optional API sync */
(function () {
  const STORAGE_KEY = 'mmt_profit_entries';

  function cfg() {
    return window.SITE_CONFIG || {};
  }

  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function formatMoney(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }

  function sumForMonth(entries, key) {
    return entries.filter(e => e.month === key).reduce((s, e) => s + e.amount, 0);
  }

  function prevMonthKey(key = monthKey()) {
    const [y, m] = key.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return monthKey(d);
  }

  function setStatus(el, msg, type = '') {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('status-ok', 'status-err');
    if (type) el.classList.add(type);
  }

  function render() {
    const entries = loadEntries();
    const key = monthKey();
    const prevKey = prevMonthKey(key);
    const monthTotal = sumForMonth(entries, key);
    const prevTotal = sumForMonth(entries, prevKey);
    const ytdTotal = entries
      .filter(e => e.month.startsWith(String(new Date().getFullYear())))
      .reduce((s, e) => s + e.amount, 0);
    const monthEntries = entries.filter(e => e.month === key);
    const goal = Number(cfg().monthlyRevenueGoal) || 0;

    document.getElementById('month-total').textContent = formatMoney(monthTotal);
    document.getElementById('month-label').textContent =
      `${monthEntries.length} entr${monthEntries.length === 1 ? 'y' : 'ies'} in ${key}`;

    const ytdEl = document.getElementById('ytd-total');
    if (ytdEl) ytdEl.textContent = formatMoney(ytdTotal);

    const deltaEl = document.getElementById('month-delta');
    if (deltaEl) {
      if (prevTotal === 0 && monthTotal === 0) {
        deltaEl.textContent = 'No revenue logged yet';
      } else if (prevTotal === 0) {
        deltaEl.textContent = `Up from ${formatMoney(0)} last month`;
        deltaEl.className = 'tracker-muted status-up';
      } else {
        const pct = ((monthTotal - prevTotal) / prevTotal) * 100;
        const sign = pct >= 0 ? '+' : '';
        deltaEl.textContent = `${sign}${pct.toFixed(0)}% vs last month (${formatMoney(prevTotal)})`;
        deltaEl.className = `tracker-muted ${pct >= 0 ? 'status-up' : 'status-down'}`;
      }
    }

    const goalBar = document.getElementById('goal-bar');
    const goalLabel = document.getElementById('goal-label');
    if (goal > 0 && goalBar && goalLabel) {
      const pct = Math.min(100, (monthTotal / goal) * 100);
      goalBar.style.width = `${pct}%`;
      goalLabel.textContent = `${formatMoney(monthTotal)} of ${formatMoney(goal)} goal (${pct.toFixed(0)}%)`;
      goalBar.closest('.goal-wrap')?.classList.remove('hidden');
    }

    const list = document.getElementById('entries');
    if (!entries.length) {
      list.innerHTML = '<li class="tracker-empty">No entries yet — log your first AdSense payout above.</li>';
      return;
    }

    list.innerHTML = entries.slice(0, 15).map(e => `
      <li>
        <span class="entry-amount">${formatMoney(e.amount)}</span>
        <span class="tracker-muted entry-meta">${e.date}${e.note ? ' · ' + escapeHtml(e.note) : ''}</span>
      </li>
    `).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function exportCsv() {
    const entries = loadEntries();
    if (!entries.length) {
      setStatus(document.getElementById('export-status'), 'Nothing to export yet.', 'status-err');
      return;
    }
    const rows = [['date', 'amount', 'note', 'month']];
    entries.forEach(e => rows.push([e.date, e.amount, e.note || '', e.month]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `profit-tracker-${monthKey()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(document.getElementById('export-status'), 'CSV downloaded.', 'status-ok');
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('revenue_export', { count: entries.length });
    }
  }

  document.getElementById('log-revenue')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const note = document.getElementById('note').value.trim();
    const status = document.getElementById('log-status');

    if (!Number.isFinite(amount) || amount <= 0) {
      setStatus(status, 'Enter a valid amount greater than zero.', 'status-err');
      return;
    }

    const now = new Date();
    const entry = {
      id: crypto.randomUUID?.() || String(Date.now()),
      amount,
      note,
      date: now.toISOString().slice(0, 10),
      month: monthKey(now),
      createdAt: now.toISOString(),
    };

    const entries = loadEntries();
    entries.unshift(entry);
    saveEntries(entries);

    document.getElementById('amount').value = '';
    document.getElementById('note').value = '';
    setStatus(status, `Logged ${formatMoney(amount)}.`, 'status-ok');
    render();

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('revenue_logged', { value: amount, currency: 'USD' });
    }
  });

  document.getElementById('clear-entries')?.addEventListener('click', () => {
    if (!confirm('Clear all local profit tracker entries on this device?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setStatus(document.getElementById('log-status'), 'Local entries cleared.', 'status-ok');
    render();
  });

  document.getElementById('export-csv')?.addEventListener('click', exportCsv);

  document.getElementById('copy-bookmark')?.addEventListener('click', async () => {
    const url = document.getElementById('bookmark-url')?.textContent || '';
    const btn = document.getElementById('copy-bookmark');
    try {
      await navigator.clipboard.writeText(url);
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = prev; }, 2000);
    } catch {
      prompt('Copy this URL:', url);
    }
  });

  const siteUrl = (cfg().siteUrl || location.origin).replace(/\/$/, '');
  const bookmarkEl = document.getElementById('bookmark-url');
  if (bookmarkEl) bookmarkEl.textContent = `${siteUrl}/tracker.html`;

  const apiUrl = (cfg().profitTrackerApiUrl || '').replace(/\/$/, '');
  if (apiUrl) {
    document.getElementById('api-section')?.classList.remove('hidden');
    const baseEl = document.getElementById('api-base');
    if (baseEl) baseEl.textContent = apiUrl;

    document.getElementById('sync-api')?.addEventListener('click', async () => {
      const entries = loadEntries();
      const latest = entries[0];
      const statusEl = document.getElementById('api-status');
      if (!latest) {
        setStatus(statusEl, 'No entries to sync.', 'status-err');
        return;
      }
      setStatus(statusEl, 'Syncing…');
      try {
        const res = await fetch(`${apiUrl}/api/profit-tracker/record-revenue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'AdSense', amount: latest.amount, note: latest.note }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus(statusEl, `Synced ${formatMoney(latest.amount)} to Money Autopilot.`, 'status-ok');
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('revenue_synced', { value: latest.amount, currency: 'USD' });
        }
      } catch (err) {
        setStatus(statusEl, `API sync failed: ${err.message}`, 'status-err');
      }
    });
  }

  render();
})();
