# Social API setup — 33333 + Sovereign lanes

**Status:** Stub in `curser` repo — replace with your SOV `SOCIAL_API_SETUP_GUIDE.md` when uploaded.

## Required for live native publish (not simulated)

| Platform | Server env var | n8n credential |
|----------|----------------|----------------|
| YouTube | `YOUTUBE_ACCESS_TOKEN` | YouTube OAuth2 |
| Instagram | `INSTAGRAM_ACCESS_TOKEN` | Meta / IG Graph |
| TikTok | `TIKTOK_ACCESS_TOKEN` | TikTok Content Posting API |
| X / Twitter | `TWITTER_BEARER_TOKEN` | OAuth 2.0 |
| LinkedIn | Manual queue or API | LinkedIn OAuth (Water block) |
| Slack alerts | `SLACK_WEBHOOK_URL` | Incoming webhook |

## Brand → account map (fill in)

| Brand | YouTube | Instagram | TikTok | LinkedIn |
|-------|---------|-----------|--------|----------|
| VaultVerse | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| AuraScript | — | _TBD_ | _TBD_ | _TBD_ |
| MirrorMe | — | _TBD_ | _TBD_ | _TBD_ |
| 33333 hub | — | `@33333practice` (copy only — verify) | _TBD_ | _TBD_ |

## Workflows that call publish APIs

- `docs/n8n/33333-viral-shorts-engine-v3.workflow.json` → `POST /api/33333/viral/publish`
- `docs/n8n/bridge-33333.workflow.json` → Earth/Fire → `/api/content/publish`
- Legacy: `docs/n8n/33333-autopilot-revenue-engine.workflow.json`

## Next step

Paste or commit **`SOCIAL_API_SETUP_GUIDE.md`** from the SOV chat into this folder (or overwrite this file). Cloud Agent can then wire handles + env vars to the v3 workflow.

See also: **`docs/UPDATES.md`** (repo changelog).
