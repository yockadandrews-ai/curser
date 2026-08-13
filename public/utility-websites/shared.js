/** Money Magnet Tools — analytics, share, ads, related tools */
const SITE_TOOLS = [
  { href: '1-word-unscrambler.html', name: 'Word Unscrambler', emoji: '🔤', desc: 'Unscramble letters' },
  { href: '2-age-calculator.html', name: 'Age Calculator', emoji: '🎂', desc: 'Exact age' },
  { href: '3-bmi-calculator.html', name: 'BMI Calculator', emoji: '⚖️', desc: 'Body mass index' },
  { href: '4-sleep-cycle-calculator.html', name: 'Sleep Cycle', emoji: '😴', desc: 'Wake times' },
  { href: '5-percentage-calculator.html', name: 'Percentage', emoji: '📊', desc: 'X% of Y' },
  { href: '6-tip-calculator.html', name: 'Tip Calculator', emoji: '💵', desc: 'Bill + tip split' },
  { href: '7-password-generator.html', name: 'Password Gen', emoji: '🔐', desc: 'Secure passwords' },
  { href: '8-text-case.html', name: 'Text Case', emoji: '🔠', desc: 'UPPER, lower, Title' },
  { href: '9-word-counter.html', name: 'Word Counter', emoji: '📝', desc: 'Words & characters' },
  { href: '10-unit-converter.html', name: 'Unit Converter', emoji: '📏', desc: 'Length, weight, temp' },
];

function cfg() {
  return window.SITE_CONFIG || { ga4Id: 'G-XXXXXXXX', enableAnalytics: false, siteName: 'Money Magnet Tools' };
}

function initAnalytics() {
  const { ga4Id, enableAnalytics } = cfg();
  if (!enableAnalytics || !ga4Id || ga4Id === 'G-XXXXXXXX') return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ga4Id, { anonymize_ip: true });
}

function initAdSlots() {
  document.querySelectorAll('.ad-slot[data-adsense]').forEach(slot => {
    const client = slot.dataset.adsenseClient;
    if (client && client !== 'ca-pub-XXXXXXXX') {
      // Replace placeholder with AdSense when approved — see README.md
    }
  });
}

function getShareData() {
  const title = document.title || cfg().siteName;
  const text = document.querySelector('meta[name="description"]')?.content || cfg().siteName;
  const url = location.href;
  return { title, text, url };
}

async function sharePage(btn) {
  const data = getShareData();
  if (navigator.share) {
    try {
      await navigator.share({ title: data.title, text: data.text, url: data.url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    const prev = btn.textContent;
    btn.textContent = 'Link copied!';
    setTimeout(() => { btn.textContent = prev; }, 2000);
  } catch {
    prompt('Copy this link:', data.url);
  }
}

function injectShareButton() {
  const header = document.querySelector('header');
  if (!header || header.querySelector('.share-btn')) return;

  const wrap = document.createElement('div');
  wrap.className = 'header-actions';
  wrap.innerHTML = `<button type="button" class="share-btn" aria-label="Share this tool">Share ↗</button>`;
  header.appendChild(wrap);

  wrap.querySelector('.share-btn').addEventListener('click', e => {
    sharePage(e.currentTarget);
  });
}

function injectRelatedTools() {
  const container = document.getElementById('related-tools');
  if (!container) return;

  const path = location.pathname.split('/').pop() || 'index.html';
  const others = SITE_TOOLS.filter(t => t.href !== path);
  const pick = others.sort(() => Math.random() - 0.5).slice(0, 4);

  container.innerHTML = `
    <h2>Related tools</h2>
    <nav class="tool-grid" aria-label="Related tools">
      ${pick.map(t => `
        <a class="tool-card" href="${t.href}">
          <h2>${t.emoji} ${t.name}</h2>
          <p>${t.desc}</p>
        </a>
      `).join('')}
    </nav>
  `;
}

function boot() {
  initAnalytics();
  initAdSlots();
  injectShareButton();
  injectRelatedTools();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
