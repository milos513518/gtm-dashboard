# GTM Dashboard — Deploy in 10 Minutes

## What you're deploying
A Next.js app that:
- Pulls live data from Apollo + ActiveCampaign + Google Sheets
- Refreshes automatically every day at 7am SF time
- Lives at a URL you can bookmark (e.g. gtm-dashboard.vercel.app)
- API keys stay private on the server — never exposed in the browser

---

## STEP 1 — Push to GitHub (3 min)

1. Go to github.com → click **New repository**
2. Name it `gtm-dashboard` → click **Create repository**
3. Open Terminal on your Mac and run:

```bash
cd ~/Downloads/gtm-dashboard
git init
git add .
git commit -m "GTM dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gtm-dashboard.git
git push -u origin main
```

Replace YOUR_USERNAME with your GitHub username.

---

## STEP 2 — Deploy to Vercel (3 min)

1. Go to **vercel.com** → Sign in with GitHub
2. Click **Add New Project**
3. Import your `gtm-dashboard` repository
4. Click **Deploy** (leave all settings as default)

Your dashboard will be live at `gtm-dashboard.vercel.app` in ~2 minutes.

---

## STEP 3 — Add your API keys to Vercel (2 min)

In your Vercel project → **Settings** → **Environment Variables** → add these:

| Key | Value |
|-----|-------|
| `AC_API_URL` | `https://plusplus85149.api-us1.com` |
| `AC_API_KEY` | `a04c3c0200c3ded10a7222a21135c3c90236418824b38687a526e8b2819a7d77052f932e` |
| `APOLLO_API_KEY` | `a04c3c0200c3ded10a7222a21135c3c90236418824b38687a526e8b2819a7d77052f932e` |
| `SHEET_ID` | `1z8ZNhU0havYl_rE1g6rsHoi8YGRW5RxkF_DlP66LC7U` |
| `CRON_SECRET` | `gtm-plusplus-2026` |

After adding all variables → **Redeploy** (Settings → Deployments → Redeploy latest).

---

## STEP 4 — Verify the cron job (1 min)

In Vercel → your project → **Cron Jobs** tab.
You should see one job: `0 15 * * *` pointing to `/api/cron/refresh`
This runs every day at 15:00 UTC = 7:00am SF time.

---

## That's it. You're done.

Bookmark your URL. Every morning when you open it, the data is already fresh.
You can also hit **↻ REFRESH NOW** in the dashboard at any time to pull live data instantly.

---

## Optional: Custom domain

In Vercel → Settings → Domains → add `gtm.plusplus.co` (or any domain you own).

---

## Troubleshooting

**Dashboard shows no data:**
- Check Vercel → Functions logs for errors
- Make sure all 5 env variables are set and you redeployed

**Apollo shows error:**
- Your Apollo API key might need regenerating: Apollo → Settings → Integrations → API

**AC shows no campaigns:**
- Make sure you have sent campaigns (status=5 means "sent")

**Google Sheet not loading:**
- Make sure sharing is set to "Anyone with the link can view"
