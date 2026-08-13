/** Money Magnet Tools — shared: AdSense slots + related tools */
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

function initAdSlots() {
  document.querySelectorAll('.ad-slot[data-adsense]').forEach(slot => {
    const client = slot.dataset.adsenseClient;
    if (client && client !== 'ca-pub-XXXXXXXX') {
      // Replace placeholder with AdSense when approved — see README.md
    }
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
  initAdSlots();
  injectRelatedTools();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
