# Hostinger Horizons — Deploy Prompts

Copy-paste these into **Hostinger Horizons** (or any AI deploy assistant) to launch Money Magnet Tools.

---

## Prompt 1 — Upload static site

```
I have a static website folder called utility-websites with index.html at the root.
Help me upload it to Hostinger so it loads at tools.mydomain.com.

Steps I need:
1. Create subdomain tools.mydomain.com in hPanel
2. Upload all HTML, CSS, JS, robots.txt, sitemap.xml to the subdomain document root
3. Enable free SSL (Let's Encrypt)
4. Confirm index.html loads at https://tools.mydomain.com/
```

---

## Prompt 2 — DNS + subdomain

```
My main domain is on Hostinger. I want tools.mydomain.com to serve a static HTML site.

Walk me through:
- Subdomain creation in hPanel → Domains → Subdomains
- Document root folder path for the upload
- DNS A record if subdomain is on another host
- SSL certificate activation
- Test URL that should return 200 for index.html
```

---

## Prompt 3 — Replace domain placeholders

```
Before go-live, find and replace YOURDOMAIN.com with tools.mydomain.com in these files:
- sitemap.xml
- robots.txt
- config.js (siteUrl)
- All HTML files (canonical and og:url meta tags)

Give me a checklist to verify no YOURDOMAIN.com remains.
```

---

## Prompt 4 — Google Search Console

```
I deployed a static tools site at https://tools.mydomain.com with sitemap.xml at /sitemap.xml.

Guide me through:
1. Adding the property in Google Search Console
2. DNS TXT or HTML file verification on Hostinger
3. Submitting the sitemap
4. Requesting indexing for the homepage
```

---

## Prompt 5 — AdSense prep

```
My static calculator site has Ad Placeholder divs on each page (top and bottom).
Traffic target: 100+ daily sessions before AdSense application.

Explain:
1. When to apply for AdSense
2. Where to paste the ad code (shared.js initAdSlots)
3. ads.txt requirements for my subdomain
4. Policy pages I may need (privacy policy link)
```

---

## Prompt 6 — GA4 analytics

```
I have config.js with:
- ga4Id: 'G-XXXXXXXX'
- enableAnalytics: false

After I create a GA4 property for tools.mydomain.com:
1. What measurement ID format to use
2. Set enableAnalytics: true in config.js
3. Verify Realtime reports in GA4
4. Confirm config.js loads before shared.js on every page
```

---

## Prompt 7 — Profit tracking (Money Autopilot)

```
When AdSense pays me, I log revenue in Profit Tracker via:
POST /api/profit-tracker/record-revenue
Body: { "source": "AdSense", "amount": 42.50 }

Help me create an Apple Shortcut that runs after each payout notification.
My API base URL is: https://autopilot.mydomain.com
```

---

## Quick Hostinger file paths

| Item | Typical path |
|------|----------------|
| Subdomain root | `public_html/tools/` or `domains/tools.mydomain.com/public_html/` |
| Homepage | `.../index.html` |
| Sitemap URL | `https://tools.mydomain.com/sitemap.xml` |
| Robots URL | `https://tools.mydomain.com/robots.txt` |

---

*Pair with README.md in this folder for full Cursor handoff*
