/** AdSense placeholder — replace innerHTML with your ad unit script when approved */
function initAdSlots() {
  document.querySelectorAll('.ad-slot[data-adsense]').forEach(slot => {
    const client = slot.dataset.adsenseClient;
    if (client && client !== 'ca-pub-XXXXXXXX') {
      // Drop your AdSense ins tag here when ready:
      // slot.innerHTML = '<ins class="adsbygoogle" ...></ins>';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdSlots);
} else {
  initAdSlots();
}
