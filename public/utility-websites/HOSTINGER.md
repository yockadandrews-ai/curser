# Hostinger Horizons — Deploy Prompts (1–7)

Copy-paste each block into **Hostinger Horizons** in order, or run as a batch if Horizons supports multi-step.

**Project:** `utility-websites` (Vite static build in main repo at `public/utility-websites/`)

---

## Before you ship (quick checklist)

1. Replace every `tools.moneymagnettools.com` — or run `npm run utility:replace-domain -- tools.yourdomain.com`
2. Upload `public/utility-websites/` (or `npm run zip:utility-sites` then upload zip)
3. Enable the real GA4 ID in `config.js` only when ready for traffic
4. Search Console → submit sitemap
5. Preview locally: `npm run dev` → https://tools.moneymagnettools.com/

Verify: `npm run utility:verify-deploy`

---

## 1. Static upload + subdomain

```
Hostinger Horizons – Static Upload + Subdomain

Project: utility-websites (Vite static build)

1. Build the production assets if not already done:
   npm run build
   (or use the existing public/utility-websites/ folder)

2. Create a new subdomain in Hostinger (example: tools.tools.moneymagnettools.com or utility.tools.moneymagnettools.com).

3. Point the subdomain document root to the uploaded folder.

4. Upload the entire contents of public/utility-websites/ (or the dist/output folder) via File Manager or the Horizons static deploy action.

5. Confirm the site loads at https://SUBDOMAIN.tools.moneymagnettools.com with no 404s on CSS/JS assets.

6. Return the live URL and the exact document-root path used.
```

---

## 2. DNS + SSL

```
Hostinger Horizons – DNS + SSL for utility subdomain

Domain: tools.moneymagnettools.com
Subdomain: tools (or whatever you chose in step 1)

1. Add an A record (or CNAME if using Hostinger's proxy) for the subdomain pointing to the Hostinger server IP.

2. Wait for DNS propagation (or force check).

3. Enable Free SSL / Let's Encrypt for the subdomain.

4. Force HTTPS redirect.

5. Confirm the certificate is valid and the site serves over HTTPS with no mixed-content warnings.

6. Return the final HTTPS URL and SSL status.
```

---

## 3. Domain placeholder replace

```
Hostinger Horizons – Domain Placeholder Replace

Files that still contain the placeholder "tools.moneymagnettools.com":
- All HTML files inside public/utility-websites/
- sitemap.xml
- robots.txt
- config.js (and any other JS that hard-codes the domain)

1. Perform a global find-and-replace of tools.moneymagnettools.com → the real domain (including any subdomain if used).

   Or from the repo root run:
   npm run utility:replace-domain -- tools.yourdomain.com

2. Also replace any leftover "localhost" or "tools.moneymagnettools.com" references that should point to the live domain.

3. Verify sitemap.xml and robots.txt now contain the correct absolute URLs.

4. Confirm config.js has the correct base URL / GA4 measurement ID placeholders ready.

5. List every file that was modified.
```

---

## 4. Search Console

```
Hostinger Horizons – Google Search Console setup

1. Go to Google Search Console and add the property for the live domain/subdomain (URL-prefix or Domain property).

2. Verify ownership using the HTML tag or DNS TXT method (whichever is fastest on Hostinger).

   HTML tag method: paste the verification token into config.js → googleSiteVerification
   (shared.js injects the meta tag on every page automatically)

3. Once verified, submit the sitemap:
   https://tools.moneymagnettools.com/sitemap.xml
   (or the subdomain equivalent)

4. Request indexing for the homepage and the main utility pages.

5. Return the verification status and the sitemap submission result.
```

---

## 5. AdSense prep

```
Hostinger Horizons – AdSense preparation

1. Confirm the site is live over HTTPS with real content (no "Coming soon" or placeholder pages).

2. AdSense loads via shared.js when config.js has enableAdSense: true and a real adsenseClientId.
   Privacy Policy: privacy.html · Terms: terms.html · ads.txt at site root.

3. Create a simple Privacy Policy and Terms page if they do not already exist (required for AdSense approval).
   ✓ Already included: privacy.html, terms.html

4. Make sure ads.txt is present at the root if required.
   ✓ Already included: ads.txt (update pub- ID after approval)

5. Check that the site meets AdSense content policies (original content, no prohibited categories).

6. Return a checklist of what is ready vs what still needs to be done before applying.
```

**AdSense readiness in repo:**

| Item | Status |
|------|--------|
| Real tool content (10 pages) | ✓ Ready |
| HTTPS | Deploy step 2 |
| privacy.html + terms.html | ✓ Ready |
| ads.txt template | ✓ Ready — update `pub-` after approval |
| Ad slot placeholders | ✓ Ready — set `enableAdSense: true` in config.js |
| ~100+ daily sessions | Wait before applying |

---

## 6. GA4 verify

```
Hostinger Horizons – GA4 verification

1. Open config.js (or the relevant config file) and enable/set the real GA4 Measurement ID.

2. Confirm the gtag.js snippet is present and fires on page load.
   (loaded by shared.js when enableAnalytics: true)

3. Use Google Tag Assistant or the GA4 DebugView to verify events are arriving.

4. Test at least one page view and one custom event (if any are defined).
   Custom events: share, revenue_logged (tracker.html)

5. Confirm no console errors related to gtag.

6. Return the Measurement ID that is now live and a confirmation that data is flowing.
```

**config.js example after GA4 setup:**

```javascript
ga4Id: 'G-YourMeasurementId',
enableAnalytics: true,
siteUrl: 'https://tools.yourdomain.com',
```

---

## 7. Profit Tracker / AdSense Shortcut

```
Hostinger Horizons – Profit Tracker + AdSense Shortcut

1. Create (or update) a simple internal page or dashboard that shows:
   - AdSense earnings (manual paste or API if available)
   - Basic traffic numbers from GA4
   - A quick "Revenue this month" summary

2. Add a browser bookmark / home-screen shortcut that opens this tracker directly.
   Page: tracker.html + tracker.webmanifest (Add to Home Screen)

3. If a full Profit Tracker page already exists in the utility-websites folder, wire the real domain and make sure it is linked from the main index.
   ✓ tracker.html linked from index.html and site footer

4. Keep it lightweight — no extra frameworks.

5. Return the live URL of the tracker page and confirmation that the shortcut works on mobile.
```

**Optional Money Autopilot API sync** — set in `config.js`:

```javascript
profitTrackerApiUrl: 'https://autopilot.yourdomain.com',
```

Then use **Sync last entry to API** on tracker.html → `POST /api/profit-tracker/record-revenue`

---

## Quick Hostinger file paths

| Item | Typical path |
|------|----------------|
| Subdomain root | `public_html/tools/` or `domains/tools.mydomain.com/public_html/` |
| Homepage | `.../index.html` |
| Sitemap URL | `https://tools.mydomain.com/sitemap.xml` |
| Robots URL | `https://tools.mydomain.com/robots.txt` |
| ads.txt | `https://tools.mydomain.com/ads.txt` |
| Profit Tracker | `https://tools.mydomain.com/tracker.html` |

---

*Pair with README.md in this folder for full Cursor handoff*
