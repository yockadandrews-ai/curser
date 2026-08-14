/** Money Magnet Tools — analytics, share, ads, related tools, footer */
const SITE_TOOLS = [
  { href: '1-word-unscrambler.html', name: 'Word Unscrambler', emoji: '🔤', desc: 'Unscramble letters' },
  { href: '2-age-calculator.html', name: 'Age Calculator', emoji: '🎂', desc: 'Exact age' },
  { href: '3-bmi-calculator.html', name: 'BMI Calculator', emoji: '⚖️', desc: 'Body mass index' },
  { href: '4-sleep-cycle-calculator.html', name: 'Sleep Cycle', emoji: '😴', desc: 'Wake times' },
  { href: '5-percentage-calculator.html', name: 'Percentage', emoji: '📊', desc: 'X% of Y' },
  { href: '6-tip-calculator.html', name: 'Tip Calculator', emoji: '💵', desc: 'Bill + tip split' },
  { href: '7-password-generator.html', name: 'Password Generator', emoji: '🔐', desc: 'Secure passwords' },
  { href: '8-text-case.html', name: 'Text Case', emoji: '🔠', desc: 'UPPER, lower, Title' },
  { href: '9-word-counter.html', name: 'Word Counter', emoji: '📝', desc: 'Words & characters' },
  { href: '10-unit-converter.html', name: 'Unit Converter', emoji: '📏', desc: 'Length, weight, temp' },
];

function cfg() {
  return window.SITE_CONFIG || {
    ga4Id: 'G-XXXXXXXX',
    enableAnalytics: false,
    adsenseClientId: 'ca-pub-XXXXXXXX',
    enableAdSense: false,
    googleSiteVerification: '',
    siteName: 'Money Magnet Tools',
    siteUrl: 'https://tools.moneymagnettools.com',
    profitTrackerApiUrl: '',
    monthlyRevenueGoal: 0,
  };
}

function initHeadAssets() {
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = 'favicon.svg';
    icon.type = 'image/svg+xml';
    document.head.appendChild(icon);
  }

  const { enableAnalytics, ga4Id } = cfg();
  if (enableAnalytics && ga4Id && ga4Id !== 'G-XXXXXXXX') {
    ['https://www.googletagmanager.com', 'https://www.google-analytics.com'].forEach(origin => {
      if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

function initSearchConsoleMeta() {
  const token = cfg().googleSiteVerification;
  if (!token || document.querySelector('meta[name="google-site-verification"]')) return;

  const meta = document.createElement('meta');
  meta.name = 'google-site-verification';
  meta.content = token;
  document.head.appendChild(meta);
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

/** Fire a GA4 event when analytics is enabled. */
function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
window.trackEvent = trackEvent;

function showToast(message, duration = 2400) {
  const existing = document.querySelector('.toast-share');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-share';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

function initAdSlots() {
  const { adsenseClientId, enableAdSense } = cfg();
  const client = adsenseClientId;
  const slots = document.querySelectorAll('.ad-slot[data-adsense]');

  if (!enableAdSense || !client || client === 'ca-pub-XXXXXXXX') return;

  if (!document.querySelector('script[data-adsense-loader]')) {
    const loader = document.createElement('script');
    loader.async = true;
    loader.crossOrigin = 'anonymous';
    loader.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    loader.dataset.adsenseLoader = '1';
    document.head.appendChild(loader);
  }

  slots.forEach((slot, i) => {
    if (slot.dataset.adsenseFilled === '1') return;
    slot.dataset.adsenseFilled = '1';
    slot.innerHTML = '';
    slot.classList.add('ad-slot-live');
    slot.setAttribute('aria-hidden', 'true');

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = client;
    ins.dataset.adSlot = slot.dataset.adSlot || String(1000000000 + i);
    ins.dataset.adFormat = slot.dataset.adFormat || 'auto';
    ins.dataset.fullWidthResponsive = 'true';
    slot.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense slot failed:', e);
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
      trackEvent('share', { method: 'native', page: location.pathname });
      showToast('Thanks for sharing!');
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    btn.textContent = 'Link copied!';
    trackEvent('share', { method: 'clipboard', page: location.pathname });
    showToast('Link copied to clipboard');
    setTimeout(() => { btn.textContent = 'Share ↗'; }, 2000);
  } catch {
    prompt('Copy this link:', data.url);
  }
}

function injectShareButton() {
  const header = document.querySelector('header');
  if (!header || header.querySelector('.share-btn')) return;

  const wrap = document.createElement('div');
  wrap.className = 'header-actions';
  wrap.innerHTML = '<button type="button" class="share-btn" aria-label="Share this page">Share ↗</button>';
  header.appendChild(wrap);

  wrap.querySelector('.share-btn').addEventListener('click', e => {
    sharePage(e.currentTarget);
  });
}

function injectBrandLink() {
  const h1 = document.querySelector('header h1');
  if (!h1 || h1.querySelector('a')) return;

  const page = location.pathname.split('/').pop() || 'index.html';
  const isHub = !page || page === 'index.html' || page === 'utility-websites';
  if (isHub) return;

  const name = h1.textContent;
  h1.innerHTML = `<a href="index.html" class="brand-link">${name}</a>`;
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

function injectJsonLd() {
  if (document.querySelector('script[data-jsonld]')) return;

  const { siteName, siteUrl } = cfg();
  const page = location.pathname.split('/').pop() || 'index.html';
  const isHub = page === 'index.html' || page === '';

  const payload = isHub
    ? {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: document.querySelector('meta[name="description"]')?.content,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/1-word-unscrambler.html?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }
    : {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: document.title.split('|')[0]?.trim() || siteName,
      url: location.href,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.jsonld = '1';
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
}

function injectSiteFooter() {
  const footers = document.querySelectorAll('footer');
  if (!footers.length) return;

  const year = new Date().getFullYear();
  const html = `
    <p class="site-footer-line">
      © ${year} Money Magnet Tools ·
      <a href="privacy.html">Privacy</a> ·
      <a href="terms.html">Terms</a> ·
      <a href="tracker.html">Profit Tracker</a>
    </p>
    <p class="site-footer-sub">Client-side only · No signup required</p>
  `;

  footers.forEach(footer => {
    if (footer.dataset.footerEnhanced === '1') return;
    footer.dataset.footerEnhanced = '1';
    footer.innerHTML = html;
  });
}

function polishAdSlots() {
  document.querySelectorAll('.ad-slot[data-adsense]').forEach(slot => {
    if (!slot.getAttribute('aria-label')) slot.setAttribute('aria-label', 'Advertisement');
  });
}

function boot() {
  initHeadAssets();
  initSearchConsoleMeta();
  initAnalytics();
  polishAdSlots();
  initAdSlots();
  injectBrandLink();
  injectShareButton();
  injectRelatedTools();
  injectJsonLd();
  injectSiteFooter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
