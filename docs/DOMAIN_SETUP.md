# Domain setup — Money Magnet Tools

Register a domain, create subdomains on Hostinger, and wire the repo in one command.

## Recommended layout

| Host | Purpose |
|------|---------|
| `moneymagnettools.com` | Root / brand (optional landing or redirect) |
| `tools.moneymagnettools.com` | Static utility sites (`public/utility-websites/`) |
| `autopilot.moneymagnettools.com` | Money Autopilot API (Express server) |

Use any root you prefer — swap `moneymagnettools.com` for your name.

---

## Step 1 — Register the domain (Hostinger)

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. **Domains → Register new domain** (or **Get a new domain**).
3. Search for your name, e.g.:
   - `moneymagnettools.com`
   - `moneymagnet.io`
   - `getmoneymagnet.com`
4. Complete checkout (~$10–15/year for `.com`).

**Hostinger Horizons prompt (copy-paste):**

```
Hostinger Horizons – Register domain + subdomain for Money Magnet Tools

1. Register the domain: moneymagnettools.com (or suggest closest available .com if taken).

2. Create subdomain: tools.moneymagnettools.com
   - Document root: public_html/tools/ (or domains/tools.moneymagnettools.com/public_html/)
   - Enable Free SSL / Let's Encrypt
   - Force HTTPS redirect

3. Optional second subdomain for the API: autopilot.moneymagnettools.com

4. Return:
   - Whether the root domain was registered or an alternative was used
   - Exact document-root paths for each subdomain
   - Final HTTPS URLs
   - Any DNS records that were created
```

---

## Step 2 — Wire the codebase

From the repo root (replace with your real domain):

```bash
# Option A — root domain (auto-creates tools. + autopilot. subdomains)
npm run utility:create-domain -- moneymagnettools.com

# Option B — explicit subdomains
npm run utility:create-domain -- --tools tools.moneymagnettools.com --app autopilot.moneymagnettools.com

# Preview only (no file changes)
npm run utility:create-domain -- moneymagnettools.com --dry-run
```

This will:

- Write `domain.config.json` (local — not committed)
- Replace `YOURDOMAIN.com` in all utility-websites files
- Set `config.js` → `siteUrl` and `profitTrackerApiUrl`
- Run strict deploy verify

---

## Step 3 — Upload static site

```bash
npm run zip:utility-sites
```

Upload **`utility-websites.zip`** contents to the **`tools.`** subdomain document root so `index.html` is at `/`.

---

## Step 4 — Search Console + analytics

1. [Google Search Console](https://search.google.com/search-console) → add `https://tools.yourdomain.com`
2. Paste verification token into `public/utility-websites/config.js` → `googleSiteVerification`
3. Submit sitemap: `https://tools.yourdomain.com/sitemap.xml`
4. When ready: set `ga4Id` + `enableAnalytics: true` in `config.js`

---

## Step 5 — Money Autopilot API (optional)

When you deploy the Node server:

```bash
# .env
APP_BASE_URL=https://autopilot.moneymagnettools.com
```

---

## Files touched by domain setup

| File | Change |
|------|--------|
| `domain.config.json` | Your live domain map (gitignored) |
| `public/utility-websites/*.html` | canonical + og:url |
| `public/utility-websites/sitemap.xml` | all `<loc>` URLs |
| `public/utility-websites/robots.txt` | Sitemap line |
| `public/utility-websites/config.js` | `siteUrl`, `profitTrackerApiUrl` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| SSL not active | hPanel → SSL → issue certificate, wait 5–15 min |
| 404 on CSS/JS | Upload folder contents, not the parent `utility-websites/` folder |
| Mixed content | Ensure all URLs use `https://` after replace |
| Verify fails | Re-run `npm run utility:create-domain -- yourdomain.com` |

See also: `public/utility-websites/HOSTINGER.md` (prompts 1–7).
