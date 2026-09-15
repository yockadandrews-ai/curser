# Viral Shorts Engine v3.0 — 2026 Elite Tactics

**Deploy this.** Systematizes what the top 0.1% do intuitively into 32 n8n nodes, 3 Python scripts, and a 2-hour velocity alert system.

---

## What the 0.1% Do Differently (2026)

| # | Tactic | Why It Works |
|---|--------|--------------|
| 1 | First 0.5s = everything | Swipe-away rate is #1 YouTube signal |
| 2 | Hard cut every 3–4s | Same frame >4s = algorithm boredom |
| 3 | Share-bait > Like-bait | Shares/saves weighted above likes |
| 4 | 5+ word comments only | Single-word comments ignored |
| 5 | No AI avatar faces | HeyGen/Synthesia/D-ID throttled |
| 6 | Loop the end | Organic rewatch credit |
| 7 | Platform-specific lengths | YT 30–45s, TT 45–90s, IG 30–60s |
| 8 | 2-hour velocity dashboard | K > 1.0 + engagement > 5% = boost |
| 9 | Volume = more tests | 1–2 Shorts/day, test 3 hooks, pick 1 |
| 10 | Native uploads only | Watermarks = reach death |

---

## v3.0 Architecture

```
Fire Block (10:10 AM CDT, Mon–Fri)
    ↓
Weekend Lock (Sat/Sun = hard stop)
    ↓
Generate 3 Hook Variants (A/B/C)
    ↓
Gemini composes 3 scripts (2026 rules enforced)
    ↓
[YOU: Pick best hook via email / webhook]
    ↓
Metadata hygiene + AI avatar block
    ↓
Platform optimization (35s / 45s / 60s)
    ↓
Native publish → YouTube, Instagram, TikTok staging
    ↓
Wait 2 hours
    ↓
K-factor + viral tier alert email
```

---

## Viral Scoring

| Tier | Criteria | Action |
|------|----------|--------|
| **VIRAL** | K > 1.0, engagement > 5% | Boost $20–50 immediately |
| **HIGH** | K > 0.5, engagement > 3% | Respond to all comments, $10 boost |
| **MEDIUM** | K > 0.3, engagement > 2% | Monitor, recheck in 2h |
| **LOW** | Below thresholds | Kill hook pattern, archive |

K-factor = `(shares + saves) / views`

---

## File Manifest

### n8n
| File | Nodes |
|------|-------|
| `docs/n8n/33333-viral-shorts-engine-v3.workflow.json` | **32** |

### Python
| File | Purpose |
|------|---------|
| `scripts/metadata_hygiene.py` | EXIF strip + AI avatar leak detection |
| `scripts/transform_layer.py` | Visual cues + platform optimization |
| `scripts/stripe_ledger.py` | Double-entry ledger + reconciliation |

### Website
| File | Purpose |
|------|---------|
| `public/33333/index.html` | Main landing |
| `public/33333/brand-pages/vaultverse.html` | Music brand |
| `public/33333/brand-pages/aurascript.html` | Cosmic brand |
| `public/33333/brand-pages/mirrorme.html` | Reflection brand |
| `public/33333/css/main.css` | Design system |
| `public/33333/js/main.js` | FAQ + scroll |

### Server API
| Endpoint | Purpose |
|----------|---------|
| `GET /api/33333/viral/weekend-lock` | Sat/Sun gate |
| `POST /api/33333/viral/hooks` | Save A/B/C set |
| `POST /api/33333/viral/metadata-hygiene` | Avatar block |
| `POST /api/33333/viral/optimize` | Platform lengths |
| `POST /api/33333/viral/publish` | Native multi-platform |
| `POST /api/33333/viral/velocity-check` | 2h K-factor |
| `GET /api/33333/viral/config` | Full config JSON |

---

## Deploy (10 minutes)

1. Import `docs/n8n/33333-viral-shorts-engine-v3.workflow.json`
2. Set `GEMINI_API_KEY`, `N33333_WEBHOOK_SECRET`, `FOUNDER_EMAIL`, `SLACK_WEBHOOK_URL`
3. Add Google Sheet tab: `Viral_Shorts`
4. Optional: `pip install Pillow` for local `metadata_hygiene.py --strip-exif`
5. Activate workflow — fires **10:10 AM CDT weekdays**
6. Wire into BRIDGE Fire block or run standalone

```bash
# Test metadata hygiene
python3 scripts/metadata_hygiene.py --json-input payload.json

# Test transform layer
python3 scripts/transform_layer.py --input script.json --all-platforms

# Test stripe ledger
python3 scripts/stripe_ledger.py --csv stripe_export.csv --output ledger.json
```

---

## Integration with BRIDGE_33333

Fire block in `docs/n8n/bridge-33333.workflow.json` can trigger v3 via:

```
POST {{APP_BASE_URL}}/api/33333/viral/publish
```

Or run v3 as standalone workflow on the same 10:10 schedule.

**The 0.1% have intuition. You have a machine.**

**Lead. Flow. Rise.**
