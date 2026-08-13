# Apple Store Setup — How It Fits This Solution

This doc ties together the **App Store Connect analytics email**, your **utility websites**, **Money Autopilot / Profit Tracker**, and **Apple Shortcuts (SGOS Command)**.

---

## Two different “Apple” things (do not mix them up)

| Name | What it is | In this repo? |
|------|------------|---------------|
| **App Store Connect** | Publish **native iOS/macOS apps** on Apple’s store; analytics emails, TestFlight, sales reports | ❌ No integration |
| **Apple Shortcuts** | Automations on iPhone/Mac that call your **web API** and open URLs | ✅ Yes — see `docs/SGOS_COMMAND.md` |

The email **“None of your apps have enough data”** (App Analytics Weekly Summary) comes from **App Store Connect only**. It does **not** mean Profit Tracker is broken.

---

## Your solution stack (what actually earns today)

```
┌─────────────────────────────────────────────────────────────┐
│  TRAFFIC LAYER                                              │
│  utility-websites/ (static HTML tools)                      │
│  → Hostinger / Netlify / Cloudflare Pages                   │
│  → AdSense / affiliate later                                │
└──────────────────────────┬──────────────────────────────────┘
                           │ revenue (manual or CSV import)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  MONEY LAYER — Profit Tracker (/earnings)                   │
│  Record Sale · Import CSV · Export CSV · monthly goal       │
│  SQLite: products, sales, expenses                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ governance (draft-only)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SGOS LAYER — Command · Shortcuts · Factory                 │
│  Proposals DRAFTED · Sent=0 until Approval Queue + proof    │
└─────────────────────────────────────────────────────────────┘
```

**Utility websites do not need the App Store.** They are static web pages. App Store Connect only applies if you ship a **native app binary**.

---

## Why App Store Connect showed “no data”

Apple sends that email when **none of your App Store listings** had enough activity that week (downloads, sessions, etc.) to generate a summary.

Common causes:

1. **Nothing live on the App Store** — only drafts, TestFlight-only, or no app at all
2. **Apps live but near-zero traffic** — below Apple’s privacy/analytics threshold
3. **Wrong expectation** — web tools on Hostinger are **not** App Store apps; they never appear in App Store Connect analytics

**Expected until you:** publish a native app **and** get real downloads.

---

## Where to record revenue (today)

| Source | Track in |
|--------|----------|
| AdSense on utility sites | **Profit Tracker → Add Data → Record Sale** (or Import CSV) |
| Affiliate commissions | Same |
| Notion tool sales | Notion Tools UI → Record Sale (feeds stats) |
| App Store IAP / paid app | **Not automated in this repo** — manual entry or future API |

There is **no App Store Connect API** wired in this codebase.

---

## Path A — Utility websites (recommended now)

**No App Store setup required.**

1. Deploy `utility-websites/` to static host
2. Subdomain e.g. `tools.yourdomain.com`
3. Google Search Console + basic SEO
4. AdSense after traffic
5. Log payouts in **Profit Tracker**

This path matches the zip deliverable (Word Unscrambler, BMI, etc.) and works offline once loaded in the browser.

---

## Path B — Web app as “app-like” (no App Store review)

| Option | Effort | App Store? |
|--------|--------|------------|
| **PWA** (manifest + service worker) | Low | No — Add to Home Screen |
| **Safari bookmark** to Profit Tracker URL | Trivial | No |

Good for **your own** Profit Tracker / Money Autopilot on phone without $99/year developer account.

---

## Path C — Native App Store app (only if you want store listing)

Use this if you want **Money Magnet Tools** (or similar) as a downloadable iOS app.

### Prerequisites

- Apple Developer Program (**$99/year**)
- Mac with Xcode
- Bundle ID (e.g. `com.yourname.moneymagnet`)

### Setup checklist

1. **developer.apple.com** → enroll → App Store Connect access
2. **App Store Connect → Apps → +** → New App (iOS)
3. **Certificates, Identifiers & Profiles** → App ID matching bundle ID
4. Build in Xcode (native SwiftUI **or** Capacitor wrapper around web tools)
5. **TestFlight** → internal test → fix crashes
6. **App Review** → metadata, privacy policy URL, screenshots
7. **Ready for Sale** → wait for downloads

### When analytics emails will have data

- App status = **Ready for Sale** (not draft-only)
- Real users downloading/opening the app
- Usually **not** in the first week with zero marketing

### Connecting App Store revenue to Profit Tracker

| Method | Status in repo |
|--------|----------------|
| Manual: App Store Connect → Sales and Trends → Record Sale | ✅ Works now |
| App Store Connect API / finance reports → auto-import | ❌ Not built |
| Apple Shortcuts pulling sales → POST `/api/sales` | 🔧 Possible custom shortcut |

---

## Apple Shortcuts (already part of this solution)

**Not App Store publishing** — automations on your phone.

- **Docs:** `docs/SGOS_COMMAND.md`, `docs/SHORTCUTS_HUB.md`
- **Web UI:** `/command`, `/approve`, `/shortcuts`
- **Requires:** API running (`APP_BASE_URL` when not on localhost)

Example Shortcuts use cases:

- Daily “Review Approval Queue” reminder (`.ics` on `/approve`)
- POST sale to API after you check AdSense (custom shortcut — not shipped yet)

---

## Decision matrix

| Goal | Do this | Skip App Store? |
|------|---------|-----------------|
| Launch calculator tools fast | Deploy utility-websites static | ✅ Yes |
| Track all income in one place | Profit Tracker + CSV | ✅ Yes |
| iPhone automation for SGOS | Apple Shortcuts + SGOS Command | ✅ Yes (Shortcuts ≠ App Store) |
| “App Store Analytics” emails with charts | Publish native app + get downloads | ❌ Must use Path C |
| Fix “no data” email without native app | **Ignore email** — wrong channel for web tools | ✅ Yes |

---

## Recommended order (aligned with your chats)

1. ✅ **Utility websites live** on static host  
2. ✅ **Profit Tracker** — record AdSense/affiliate when money arrives  
3. ✅ **Apple Shortcuts** — SGOS Command for governance (optional)  
4. ⏳ **SEO + AdSense layout** on utility sites  
5. ⏳ **App Store** — only if you want a native wrapper app for brand/discovery  

---

## Quick answers

**Q: Why no App Store analytics if my tools are online?**  
A: Online HTML tools are websites, not App Store apps.

**Q: Does Money Autopilot connect to App Store Connect?**  
A: No. Profit Tracker is web + SQLite + CSV.

**Q: What should I do when AdSense pays?**  
A: Profit Tracker → Add Data → Record Sale (or Import CSV).

**Q: Where is utility-websites in this repo?**  
A: Not in this repo yet — deploy from artifact zip or add under `public/utility-websites/` when ready.

---

*Aligned with App Store Connect chat + Money Autopilot / SGOS governance · draft free, send gated*
