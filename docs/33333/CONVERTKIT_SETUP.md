# ConvertKit Setup — 33333 Email Sequences

Wire ConvertKit welcome automations to lead capture and abandoned cart recovery.

---

## 1. Create forms (one per brand)

In ConvertKit → **Grow** → **Landing Pages & Forms** → create 5 inline forms:

| Form name | Env var | Sequence doc |
|-----------|---------|--------------|
| VaultVerse Welcome | `CONVERTKIT_FORM_VAULTVERSE` | Sequence 1 (7 emails) |
| AuraScript Welcome | `CONVERTKIT_FORM_AURASCRIPT` | Sequence 2 (6 emails) |
| MirrorMe Welcome | `CONVERTKIT_FORM_MIRRORME` | Sequence 3 (6 emails) |
| Resume SaaS Welcome | `CONVERTKIT_FORM_RESUME` | Sequence 5 (8 emails) |
| 33333 Membership | `CONVERTKIT_FORM_33333` | Sequence 4 (5 emails) |

Copy each **Form ID** (numeric) from ConvertKit → Form → Settings.

---

## 2. Create automations

For each form, create a **Visual Automation**:

**Trigger:** Subscribes to form `[Form Name]`

**Emails:** Copy from `docs/33333/33333_EMAIL_SEQUENCES.md`

| Email | Delay |
|-------|-------|
| VV-1 Instant Delivery | Immediate |
| VV-2 Mixing Checklist | 1 day |
| VV-3 Social Proof | 2 days |
| ... | see doc |

Use merge tags:
- `{{ subscriber.first_name }}`
- Link URLs → your Stripe Payment Links or landing page anchors

---

## 3. Optional tags

Create tags for segmentation. Set env vars (comma-separated if multiple):

```env
CONVERTKIT_TAG_VAULTVERSE=1234567
CONVERTKIT_TAG_AURASCRIPT=1234568
CONVERTKIT_TAG_MIRRORME=1234569
CONVERTKIT_TAG_RESUME=1234570
CONVERTKIT_TAG_33333=1234571
CONVERTKIT_TAG_ABANDONED_CART=1234572
```

---

## 4. Server env

```env
CONVERTKIT_API_KEY=your_api_key_from_convertkit_settings
CONVERTKIT_FORM_VAULTVERSE=1234567
CONVERTKIT_FORM_AURASCRIPT=1234568
CONVERTKIT_FORM_MIRRORME=1234569
CONVERTKIT_FORM_RESUME=1234570
CONVERTKIT_FORM_33333=1234571
CONVERTKIT_TAG_ABANDONED_CART=1234572
```

Get API key: ConvertKit → Settings → Advanced → API Key

---

## 5. How it connects

```
Landing page form submit
  → POST /api/33333/leads
  → SQLite lead saved
  → ConvertKit form subscribe (welcome sequence starts)

Stripe checkout.session.expired
  → POST /api/webhooks/stripe
  → Engagement logged
  → ConvertKit abandoned cart tag applied
  → Abandoned cart automation (AC-1, AC-2, AC-3)
```

---

## 6. Test

```bash
curl -X POST http://localhost:3001/api/33333/leads \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","firstName":"Test","brand":"vaultverse","leadMagnet":"3-loop-pack","utmSource":"test"}'
```

Check ConvertKit → Subscribers for new entry and automation progress.

---

## 7. n8n abandoned cart (optional)

Point n8n `EMAIL_API_URL` to your ConvertKit tag endpoint or use server:

```
POST /api/33333/email/abandoned-cart
{ "email": "...", "productName": "7-Loop Beat Pack" }
```

**Lead. Flow. Rise.**
