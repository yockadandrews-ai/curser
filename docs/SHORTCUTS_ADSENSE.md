# Apple Shortcut — Record AdSense / Affiliate Payout

Log utility-site or AdSense revenue into **Profit Tracker** from your iPhone in one tap.

## Prerequisites

- Money Autopilot API running and reachable (not `localhost` unless on same Wi‑Fi with IP)
- Set **`APP_BASE_URL`** in production (e.g. `https://autopilot.yourdomain.com`)

## Shortcut: Record Payout

### 1. Ask for Confirmation

> Run Record Payout? Adds revenue to Profit Tracker. Nothing is sent to Apple or AdSense.

### 2. Ask for Input — Amount

- Type: Number  
- Prompt: `Payout amount ($)`

### 3. Ask for Input — Source (optional)

- Type: Text  
- Default: `AdSense`  
- Prompt: `Source (AdSense, affiliate, etc.)`

### 4. Get Contents of URL (POST)

- **URL:** `{APP_BASE_URL}/api/profit-tracker/record-revenue`
- **Method:** POST  
- **Headers:** `Content-Type: application/json`  
- **Request Body (JSON):**

```json
{
  "source": "Provided Input (source)",
  "amount": Provided Input (amount),
  "description": "Recorded via Apple Shortcut"
}
```

### 5. Get Dictionary Value

- Key: `message` from JSON response

### 6. Show Notification

- Title: `Profit Tracker`  
- Body: Dictionary Value (message)  
- If response includes `goalAlert.message`, show that too for 25/50/75/100% monthly goal milestones

---

## Example curl (test on Mac)

```bash
curl -X POST https://YOUR_HOST/api/profit-tracker/record-revenue \
  -H "Content-Type: application/json" \
  -d '{"source":"AdSense","amount":42.50,"description":"August payout"}'
```

Response:

```json
{
  "ok": true,
  "saleId": "...",
  "revenue": 42.5,
  "profit": 42.5,
  "productName": "AdSense",
  "message": "Recorded $42.50 profit from AdSense",
  "goalAlert": { "milestone": 25, "message": "🎯 25% of monthly goal..." }
}
```

---

## Security note

This endpoint has **no auth** in v1 — use only on a private network or add an API key before exposing publicly. For personal use behind VPN or local server, this is fine.

---

*Pairs with [UTILITY_WEBSITES.md](./UTILITY_WEBSITES.md) and Profit Tracker `/earnings`*
