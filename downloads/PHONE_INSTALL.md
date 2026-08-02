# SGOS Field Ops — Install on Your Phone

The SGOS app is a **Progressive Web App (PWA)**. It installs like an app from your browser — no App Store required.

---

## Option A — Fastest (if you have a live URL)

1. Open the app URL in **Safari** (iPhone) or **Chrome** (Android)
2. Log in / verify Field Tag works with plate `JG-6613`
3. **iPhone:** Tap **Share** → **Add to Home Screen** → name it **SGOS**
4. **Android:** Menu **⋮** → **Install app** or **Add to Home screen**

The icon appears on your home screen like the old iOS Shortcuts layout.

---

## Option B — Deploy yourself (full app + SMS)

The zip includes everything. You need a host with Node.js + PostgreSQL.

### 1. Unzip on your computer

```bash
unzip SGOS_Mobile_Package.zip
cd SGOS_Mobile_Package
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgresql://...your-supabase-or-postgres-url...
SENDBLUE_API_KEY=your_key
SENDBLUE_API_SECRET=your_secret
SENDBLUE_FROM_NUMBER=+1XXXXXXXXXX
SGOS_OPERATOR_PHONE=+1YOUR_PHONE
SGOS_MOCK_SMS=false
PORT=3001
```

Your **sgos-production** Supabase project already has all **99 plates** loaded.  
Get `DATABASE_URL` from: Supabase → Project Settings → Database → Connection string (URI).

### 3. Push schema & start

```bash
npm run db:push
npm run start
```

Or deploy to **Railway**, **Render**, or **Fly.io** (connect repo, set env vars, deploy).

### 4. Open on phone

Visit `https://your-domain.com/sgos` → Add to Home Screen (step above).

---

## Option C — Local network test (same WiFi)

On your Mac/PC:

```bash
npm run dev
```

Find your computer's IP (e.g. `192.168.1.42`). On phone Safari:

```
http://192.168.1.42:5173/sgos
```

(Vite dev server — for testing only; use production build for daily use.)

---

## What's in the download package

| File / folder | Purpose |
|---------------|---------|
| `dist/` | Built production app (frontend + server) |
| `data/SGOS_Master_Plate_Registry_v2.json` | 99-plate master registry |
| `data/SGOS_Master_Plate_Registry_v2.csv` | Same data, spreadsheet format |
| `prisma/` | Database schema |
| `server/sgos/` | API (Field Tag, Batch, Dispatch, ACK) |
| `public/manifest.json` | PWA home-screen config |
| `.env.example` | Environment template |

---

## Home screen layout (matches your design)

```
┌─────────────┬─────────────┐
│  FIELD TAG  │  BATCH LOG  │
│   (Black)   │   (Blue)    │
├─────────────┼─────────────┤
│  DISPATCH   │    ACK      │
│   (Green)   │   (Red)     │
├─────────────┴─────────────┤
│      SGOS CMD (Large)     │
└───────────────────────────┘
```

Open **SGOS CMD** or go to `/sgos` for the command center.

---

## Voice dictation (hands-free)

1. iPhone **Settings → Accessibility → Voice Control**
2. Create command: phrase **"Log plate"** → action **Run Shortcut** or open SGOS bookmark
3. Or use the **mic button** inside Field Tag (Safari/Chrome)

---

## Test plate

```
JG-6613
```

Expected: DRV-PICKUP SMS with HERMES-7, Gate B instructions.

---

## Need help?

- Import more plates: Settings → Import Master Registry (JSON/CSV)
- CLI import: `npm run sgos:import -- ./plates.json`
- Repo: merge PR #1 on branch `cursor/sgos-field-ops-app-8f82`
