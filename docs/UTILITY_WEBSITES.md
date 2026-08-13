# Utility Websites — Money Magnet Tools

Five client-side calculator tools + hub page, ready for static deploy and AdSense.

## Location in repo

```
public/utility-websites/
├── index.html                  ← Hub / homepage
├── 1-word-unscrambler.html
├── 2-age-calculator.html
├── 3-bmi-calculator.html
├── 4-sleep-cycle-calculator.html
├── 5-percentage-calculator.html
├── shared.css
└── shared.js
```

## Local preview

With the dev server running:

```bash
npm run dev
```

Open: **http://localhost:5173/utility-websites/**

Production (`npm run build && npm start`): same path under your host root.

## Deploy in minutes

1. Upload the **`public/utility-websites/`** folder to any static host:
   - Hostinger (File Manager or FTP)
   - Netlify / Vercel / Cloudflare Pages
   - GitHub Pages
2. Point subdomain e.g. `tools.yourdomain.com` at the folder root (`index.html` at `/`)
3. Update `<link rel="canonical">` and `og:` URLs in each HTML file to your live domain
4. Submit sitemap / homepage in Google Search Console

## AdSense

Each page has **two ad slots** (top + bottom):

```html
<div class="ad-slot" data-adsense data-adsense-client="ca-pub-XXXXXXXX">
```

Replace `ca-pub-XXXXXXXX` with your publisher ID and drop your `<ins class="adsbygoogle">` snippet in `shared.js` when approved.

## SEO included

- Unique `<title>` and `<meta description>` per tool
- Canonical URLs (update domain placeholder)
- ~200–300 words on-page content per tool
- Hub page with internal links to all tools

## Revenue → Profit Tracker

When AdSense or affiliate pays out:

1. **Manual:** Profit Tracker → Add Data → Record Sale  
2. **Apple Shortcuts:** See [SHORTCUTS_ADSENSE.md](./SHORTCUTS_ADSENSE.md)  
3. **API:** `POST /api/profit-tracker/record-revenue`

```json
{ "source": "AdSense", "amount": 42.50, "description": "July payout" }
```

## Not App Store apps

These are **websites**, not iOS App Store binaries. See [APPLE_STORE_SETUP.md](./APPLE_STORE_SETUP.md) for how this fits App Store Connect vs web traffic.

## Create zip for upload

```bash
cd public && zip -r ../utility-websites.zip utility-websites/
```
