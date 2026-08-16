/**
 * Money Autopilot landing — checkout + welcome sequence signup
 */
(function () {
  const cfg = window.SITE_CONFIG || {};
  const apiBase = (cfg.profitTrackerApiUrl || cfg.checkoutApiUrl || '').replace(/\/$/, '');

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.className = 'subscribe-status' + (isError ? ' status-err' : ' status-ok');
  }

  async function startCheckout(email) {
    if (!apiBase) {
      throw new Error('Checkout API not configured — set profitTrackerApiUrl in config.js');
    }
    const res = await fetch(apiBase + '/api/checkout/engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Checkout failed');
    }
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error('No checkout URL returned');
  }

  function bindCheckoutButtons() {
    document.querySelectorAll('[data-checkout="engine"]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        btn.classList.add('checkout-loading');
        btn.disabled = true;
        try {
          var emailInput = document.querySelector('#subscribe-form input[name="email"]');
          var email = emailInput && emailInput.value ? emailInput.value.trim() : undefined;
          await startCheckout(email);
        } catch (e) {
          alert(String(e.message || e));
          btn.classList.remove('checkout-loading');
          btn.disabled = false;
        }
      });
    });
  }

  function bindSubscribeForm() {
    var form = document.getElementById('subscribe-form');
    var status = document.getElementById('subscribe-status');
    if (!form) return;

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var email = form.email.value.trim();
      if (!email) {
        setStatus(status, 'Enter a valid email.', true);
        return;
      }
      if (!apiBase) {
        setStatus(status, 'API URL not set in config.js — saved locally only.', true);
        return;
      }
      setStatus(status, 'Subscribing…', false);
      try {
        var res = await fetch(apiBase + '/api/outreach/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: 'landing' }),
        });
        var data = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(data.error || 'Subscribe failed');
        setStatus(status, 'You\'re in! Check your inbox for the Profit Tracker link.', false);
        form.reset();
      } catch (e) {
        setStatus(status, String(e.message || e), true);
      }
    });
  }

  bindCheckoutButtons();
  bindSubscribeForm();
})();
