/** Money Magnet Tools — shared: AdSense slots + related tools */
const SITE_TOOLS = [
  { href: 'index.html', slug: 'index', name: 'All Tools', emoji: '🏠', desc: 'Hub homepage' },
  { href: '1-word-unscrambler.html', slug: '1-word-unscrambler', name: 'Word Unscrambler', emoji: '🔤', desc: 'Unscramble letters' },
  { href: '2-age-calculator.html', slug: '2-age-calculator', name: 'Age Calculator', emoji: '🎂', desc: 'Exact age' },
  { href: '3-bmi-calculator.html', slug: '3-bmi-calculator', name: 'BMI Calculator', emoji: '⚖️', desc: 'Body mass index' },
  { href: '4-sleep-cycle-calculator.html', slug: '4-sleep-cycle-calculator', name: 'Sleep Cycle', emoji: '😴', desc: 'Wake times' },
  { href: '5-percentage-calculator.html', slug: '5-percentage-calculator', name: 'Percentage', emoji: '📊', desc: 'X% of Y' },
];

function initAdSlots() {
  document.querySelectorAll('.ad-slot[data-adsense]').forEach(slot => {
    const client = slot.dataset.adsenseClient;
    if (client && client !== 'ca-pub-XXXXXXXX') {
      // Replace placeholder with your AdSense unit when approved:
      // slot.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="..." data-ad-slot="..." data-ad-format="auto"></ins>';
      // (adsbygoogle = window.adsbygoogle || []).push({});
    }
  });
}

function injectRelatedTools() {
  const container = document.getElementById('related-tools');
  if (!container) return;

  const path = location.pathname.split('/').pop() || 'index.html';
  const others = SITE_TOOLS.filter(t => t.href !== path && t.href !== 'index.html').slice(0, 4);

  container.innerHTML = `
    <h2>Related tools</h2>
    <nav class="tool-grid" aria-label="Related tools">
      ${others.map(t => `
        <a class="tool-card" href="${t.href}">
          <h2>${t.emoji} ${t.name}</h2>
          <p>${t.desc}</p>
        </a>
      `).join('')}
    </nav>
  `;
}

function boot() {
  initAdSlots();
  injectRelatedTools();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
