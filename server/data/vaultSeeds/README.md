# Hermes vault seeds — committed templates copied to `data/hermes/` on Content Factory run

These files are the **first-pass Sprint 2 assets** for Gas Station Snack Rankings.
At runtime, `runContentFactory()` writes the same structure to `data/hermes/sprint-2-gas-station/` (gitignored).

To regenerate all sprint vault assets locally:

```bash
curl -X POST http://localhost:3001/api/hermes/seed/all-sprints
```

Seeds committed under `server/data/vaultSeeds/{sprint-id}/` for Sprints 2–8 + Bundle.

Or trigger the live calendar event:

```bash
curl -X POST http://localhost:3001/api/hermes/calendar/trigger \
  -H 'Content-Type: application/json' \
  -d '{"title":"SGOS Sprint 2 Build — Gas Station Snack Rankings","startDate":"2026-08-16"}'
```
