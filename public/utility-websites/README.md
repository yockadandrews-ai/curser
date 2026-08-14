# Money Magnet Tools — Cursor Handoff

**10 free tools · static HTML · no build step · Hostinger-ready**

No build system, no dependencies, no framework — pure static files. Open this folder in Cursor and edit any page immediately.

## Cursor handoff (4 steps)

1. Unzip / open `public/utility-websites/` in Cursor (or use this repo as-is).
2. **Create your domain** (register on Hostinger, then wire the repo):
   ```bash
   npm run utility:create-domain -- moneymagnettools.com
   ```
   See **`docs/DOMAIN_SETUP.md`** for Hostinger registration + subdomain steps.
3. Upload the whole folder so `index.html` is at the subdomain root (`tools.yourdomain.com`).
4. Submit `https://tools.yourdomain.com/sitemap.xml` in Google Search Console.

## Suggested Cursor prompts

Copy-paste any of these when you want to extend the site:

- **Dark mode** — “Add a dark mode toggle to all utility pages using shared.css and persist the choice in localStorage.”
- **Analytics** — “Wire GA4 in config.js: set my measurement ID, enable analytics, and log tool-specific events on each calculator page.”
- **Share buttons** — “Improve the share button on every tool page so it copies the page URL and shows a toast confirmation.”
- **Bigger dictionary** — “Expand the word unscrambler dictionary in 1-word-unscrambler.html with more common English words and filter invalid inputs.”
- **AdSense go-live** — “Update ads.txt with my publisher ID, enable AdSense in config.js, and verify ad slots on index.html and two tool pages.”
- **Profit Tracker sync** — “Connect tracker.html to my Money Autopilot API using profitTrackerApiUrl in config.js.”
- **New tool** — “Add an 11th tool (QR code generator) matching the existing page layout, meta tags, related-tools links, and ad placeholders.”

## Package contents

| # | Tool | File |
|---|------|------|
| — | Hub | `index.html` |
| 1 | Word Unscrambler | `1-word-unscrambler.html` |
| 2 | Age Calculator | `2-age-calculator.html` |
| 3 | BMI Calculator | `3-bmi-calculator.html` |
| 4 | Sleep Cycle Calculator | `4-sleep-cycle-calculator.html` |
| 5 | Percentage Calculator | `5-percentage-calculator.html` |
| 6 | Tip Calculator | `6-tip-calculator.html` |
| 7 | Password Generator | `7-password-generator.html` |
| 8 | Text Case Converter | `8-text-case.html` |
| 9 | Word Counter | `9-word-counter.html` |
| 10 | Unit Converter | `10-unit-converter.html` |
| — | Profit Tracker | `tracker.html` + `tracker.webmanifest` |
| — | Legal (AdSense) | `privacy.html` + `terms.html` |
| — | AdSense crawl | `ads.txt` |
| — | SEO / crawl | `robots.txt` + `sitemap.xml` |
| — | Config | `config.js` (GA4, AdSense, GSC, API URL) |
| — | Shared | `shared.css` + `shared.js` |
| — | Deploy prompts | `HOSTINGER.md` (7 Horizons prompts) |

## Deploy in 60 seconds

1. **Replace domain** (from repo root):
   ```bash
   npm run utility:replace-domain -- tools.yourdomain.com
   npm run utility:verify-deploy
   ```
2. **Zip & upload**:
   ```bash
   npm run zip:utility-sites
   ```
   Upload `utility-websites.zip` contents to Hostinger subdomain root.
3. **Search Console** → submit `https://tools.yourdomain.com/sitemap.xml`
4. **GA4** → set `ga4Id` + `enableAnalytics: true` in `config.js`
5. **AdSense** (after ~100 daily sessions) → update `ads.txt`, set `enableAdSense: true`

## Hostinger Horizons (all 7 prompts)

See **`HOSTINGER.md`** — copy-paste prompts for:

1. Static upload + subdomain  
2. DNS + SSL  
3. Domain placeholder replace  
4. Google Search Console  
5. AdSense prep  
6. GA4 verification  
7. Profit Tracker + home-screen shortcut  

## config.js reference

```javascript
window.SITE_CONFIG = {
  ga4Id: 'G-XXXXXXXX',
  enableAnalytics: false,
  adsenseClientId: 'ca-pub-XXXXXXXX',
  enableAdSense: false,
  googleSiteVerification: '',  // Search Console HTML tag token
  siteName: 'Money Magnet Tools',
  siteUrl: 'https://tools.yourdomain.com',
  profitTrackerApiUrl: '',     // optional Money Autopilot API base
  monthlyRevenueGoal: 0,       // optional USD goal for tracker progress bar
};
```

## Google Analytics 4

1. Create GA4 property for your tools subdomain  
2. Edit **`config.js`** → real `ga4Id`, `enableAnalytics: true`  
3. Open site → GA4 **Realtime**  
4. Test custom events on tracker.html (`revenue_logged`) and Share button (`share`)

## AdSense

- **privacy.html** + **terms.html** — required policy pages (linked in footer on every page)  
- **ads.txt** — update `pub-XXXXXXXXXXXXXXXX` after approval  
- **shared.js** — loads AdSense when `enableAdSense: true`

## Profit Tracker

- **`tracker.html`** — monthly revenue summary, manual AdSense log (localStorage)  
- **`tracker.webmanifest`** — Add to Home Screen on mobile  
- Optional API sync → set `profitTrackerApiUrl` in config.js  

## Preview locally

```bash
npm run dev
# → https://tools.moneymagnettools.com/
```

## Every page includes

- Unique title + meta description + Open Graph  
- Share button + Related tools (via `shared.js`)  
- Footer links: Privacy · Terms · Profit Tracker  
- GA4 + AdSense slots (via `config.js` — off until you enable)  
- Client-side only — works offline once loaded  

## Track revenue (Money Autopilot)

When AdSense pays out:

- **Tracker page:** log on `tracker.html`  
- **Manual:** Profit Tracker → Record Sale (`/earnings` in main app)  
- **API:** `POST /api/profit-tracker/record-revenue`  
- **Shortcut:** see main repo `docs/SHORTCUTS_ADSENSE.md`

## Regenerate zip (from main repo)

```bash
npm run zip:utility-sites
npm run utility:verify-deploy
```

---

*Money Magnet Tools · ship-ready · all 7 Hostinger Horizons prompts in HOSTINGER.md*
