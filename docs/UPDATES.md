# Updates log — `yockadandrews-ai/curser`

Canonical changelog for cross-chat / Cloud Agent work. **Merge target:** `main`.

Last updated: **2026-09-27**

---

## 2026-09 — BRIDGE_33333 + Viral Shorts v3.0

### Branches (ready to merge)

| Branch | Contents |
|--------|----------|
| `cursor/33333-updates-sync-b1b2` | **Combined** — BRIDGE + Viral v3 + this UPDATES doc |
| `cursor/bridge-33333-integration-b1b2` | BRIDGE only |
| `cursor/viral-shorts-engine-v3-b1b2` | BRIDGE + Viral v3 |

### Added — Integration layer (Doc 1 ↔ Doc 2)

| Path | Purpose |
|------|---------|
| `docs/n8n/bridge-33333.workflow.json` | Master n8n workflow — elemental clock, W1–W10 routing |
| `docs/N8N_BRIDGE_33333.md` | Wiring quick start |
| `docs/33333/BRIDGE_INTEGRATION_LAYER.md` | Full BRIDGE spec |
| `server/33333/bridge.ts` | ET clock, queue check, connection move, continuity |
| `server/33333/bridgeRoutes.ts` | Bridge API routes |

### Added — Viral Shorts Engine v3.0

| Path | Purpose |
|------|---------|
| `docs/n8n/33333-viral-shorts-engine-v3.workflow.json` | 32-node Fire block — A/B/C hooks, 2h K-factor |
| `docs/33333/VIRAL_SHORTS_ENGINE_v3.md` | 2026 elite tactics deploy guide |
| `docs/33333/VIRAL_SHORTS_ENGINE_v2.md` | v2 gap closure notes |
| `docs/33333/VIRAL_SHORTS_ENGINE.md` | v1 baseline |
| `server/33333/viralShorts.ts` | Scoring, hooks, platform lengths, avatar block |
| `server/33333/viralRoutes.ts` | `/api/33333/viral/*` |
| `scripts/metadata_hygiene.py` | EXIF + AI avatar leak scan |
| `scripts/transform_layer.py` | Visual cues + platform optimize |
| `scripts/stripe_ledger.py` | Double-entry Stripe reconciliation |
| `public/33333/brand-pages/*.html` | VaultVerse, AuraScript, MirrorMe |
| `public/33333/css/main.css`, `js/main.js` | Shared landing design system |

### Config / docs touched

- `.env.example` — bridge + viral env vars
- `server/33333/n8nConfig.ts` — bridge + viral workflow paths
- `docs/N8N_33333_WIRING.md` — points to BRIDGE as recommended
- `docs/33333/README.md` — manifest updated

---

## Pending (not in repo yet)

Import from **SOV chat** when available:

| File | Purpose |
|------|---------|
| `SOCIAL_API_SETUP_GUIDE.md` | Real social handles + OAuth steps |
| `ALL_WORKFLOWS_COMPLETE.json` | Sovereign workflow bundle |
| `SOVEREIGN_N8N_COMPLETE_STRUCTURE.md` | SOV n8n map |
| `publishing_payment_access_workflow.json` | Payment-gated publish |

Until `SOCIAL_API_SETUP_GUIDE.md` lands, social publish stays **simulated** (no tokens in `.env`).

---

## Merge checklist

- [ ] PR: `cursor/33333-updates-sync-b1b2` → `main`
- [ ] Import n8n: `bridge-33333.workflow.json` + `33333-viral-shorts-engine-v3.workflow.json`
- [ ] Set `N33333_WEBHOOK_SECRET`, `GEMINI_API_KEY`, `SLACK_WEBHOOK_URL`
- [ ] Add Google Sheet tabs: `Content_Ideas`, `Viral_Shorts`, `_CONTINUITY_REPORT`
- [ ] Upload SOV social guide → wire tokens per `docs/33333/SOCIAL_API_SETUP.md` (stub)

**Lead. Flow. Rise.**
