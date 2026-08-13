# Money Magnet Tools — Cursor Handoff

**10 free tools · 15 files · pure static HTML · no build system · no dependencies**

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
| — | SEO / crawl | `robots.txt` + `sitemap.xml` |
| — | Shared assets | `shared.css` + `shared.js` |

## Cursor setup (60 seconds)

1. **Unzip** and open the folder in Cursor
2. **Replace `YOURDOMAIN.com`** in `sitemap.xml`, `robots.txt`, and all HTML `canonical` / `og:url` tags
3. **Upload** the whole folder so `index.html` is at the site root (e.g. `tools.yourdomain.com`)
4. **Search Console** → submit `https://YOURDOMAIN.com/sitemap.xml`

## Launch checklist

1. Unzip → upload whole folder (`index.html` at root)
2. Subdomain: `tools.yourdomain.com`
3. Google Search Console → sitemap + homepage URL
4. After ~100+ daily sessions → apply for AdSense
5. Replace **Ad Placeholder** boxes with real AdSense code in `shared.js`

## Hostinger

- hPanel → **Files** → upload to subdomain folder
- Enable SSL (AutoSSL)
- DNS: A record for subdomain → Hostinger IP

## Netlify / Vercel / Cloudflare Pages

- **Build command:** none  
- **Publish directory:** this folder as-is  
- `netlify deploy --dir=. --prod`

## Every page includes

- Unique title + meta description + Open Graph
- `robots: index, follow` + `theme-color`
- Mobile-friendly dark layout
- Ad placeholders (top + bottom)
- **Related tools** internal links (via `shared.js`)
- Client-side only — works offline once loaded

## Suggested Cursor prompts (next polish)

Copy into Cursor chat when ready:

```
Add Google Analytics 4 snippet slot to shared.js — load only after cookie consent.
```

```
Add Web Share API button on each tool page — share title + current URL.
```

```
Expand Word Unscrambler dictionary — load a larger word list from words.json without blocking first paint.
```

```
Add optional light/dark theme toggle — persist preference in localStorage, default dark.
```

```
Generate og:image PNG placeholders (1200×630) for each tool and wire og:image meta tags.
```

```
Add Tip Calculator preset buttons: 15%, 18%, 20%, 25% — one tap.
```

## Track revenue (Money Autopilot)

When AdSense pays out:

- **Manual:** Profit Tracker → Record Sale  
- **API:** `POST /api/profit-tracker/record-revenue`  
- **Shortcut:** see main repo `docs/SHORTCUTS_ADSENSE.md`

## Regenerate zip (from main repo)

```bash
npm run zip:utility-sites
```

---

*Money Magnet Tools · ship-ready · Cursor can edit any file immediately*
