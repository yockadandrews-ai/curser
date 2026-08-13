# Money Magnet Tools — Launch Checklist

Five free calculator tools + hub. Static HTML only — no build step required.

## Package contents

```
utility-websites/
├── index.html                  ← Hub (ads + SEO)
├── 1-word-unscrambler.html
├── 2-age-calculator.html
├── 3-bmi-calculator.html
├── 4-sleep-cycle-calculator.html
├── 5-percentage-calculator.html
├── shared.css / shared.js
├── sitemap.xml
└── README.md                   ← This file
```

## Launch in minutes

1. **Unzip** → upload **whole folder** (`index.html` at site root)
2. **Subdomain** e.g. `tools.yourdomain.com`
3. **Search Console** → submit `sitemap.xml` + homepage URL
4. **Update domain** — find/replace `tools.example.com` in HTML + sitemap
5. **After ~100+ daily sessions** → apply for Google AdSense
6. **Replace ad placeholders** — dashed “Ad Placeholder” boxes with real AdSense code in `shared.js`

## Hostinger

1. hPanel → **Files** → `public_html/tools/` (or subdomain folder)
2. Upload all files
3. SSL: AutoSSL / Let’s Encrypt (usually automatic)
4. Point subdomain DNS A record to Hostinger IP if needed

## Netlify

```bash
# Drag-and-drop folder in Netlify UI, or:
netlify deploy --dir=utility-websites --prod
```

## Vercel / Cloudflare Pages

- **Root directory:** `utility-websites`
- **Build command:** none
- **Output:** static files as-is

## SEO included (Option A)

- Unique `<title>` + meta description per page
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`)
- `robots: index, follow`
- `theme-color` for mobile browsers
- Canonical URLs (update placeholder domain)
- Internal linking via **Related tools** on every page

## Monetization (Option B)

- **Top + bottom** ad placeholder on every page
- **Related tools** grid for session depth + RPM
- Wire AdSense in `shared.js` when approved

## Track revenue

When AdSense pays out, log in **Money Autopilot Profit Tracker**:

- Manual: Record Sale
- API: `POST /api/profit-tracker/record-revenue`
- Apple Shortcut: see repo `docs/SHORTCUTS_ADSENSE.md`

## Not App Store apps

These are websites — App Store Connect analytics won't reflect this traffic. See `docs/APPLE_STORE_SETUP.md` in the main repo.

## Regenerate zip (from main repo)

```bash
npm run zip:utility-sites
```

---

*Money Magnet Tools · client-side only · works offline once loaded*
