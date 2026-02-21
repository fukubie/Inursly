# 100% free deployment (for recruiters / portfolio)

No credit card, no paid database. The app runs in **demo mode**: backend uses the built-in JSON data + in-memory storage (signups and bookings work during the session but reset when the server restarts). Perfect for showing recruiters.

---

## What you get (all free)

| Service | What | Free tier |
|--------|------|-----------|
| **Render** | Backend (Node API) | Free; sleeps after ~15 min inactivity, wakes in ~30–60 sec |
| **Render** or **Vercel** | Frontend (React) | Free static hosting |
| **Database** | None | Backend uses demo mode (no MySQL needed) |

**Note:** On Render’s free tier, the backend “spins down” when idle. The first visit after a while may take 30–60 seconds to load; after that it’s fast. You can tell recruiters: “It’s on the free tier—first load may take a minute.”

---

## Step 1: Push code to GitHub

1. Create a repo on GitHub (e.g. `inursly` or `doctor-appointment`).
2. In your project folder (the one that contains `doctor-appointment` or is the app root):

```bash
git init
git add .
git commit -m "Inursly - doctor appointment app"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

- Make sure **`.env`** and **`backend/.env`** are in **`.gitignore`** (no secrets in the repo).

---

## Step 2: Deploy backend on Render (no database)

1. Go to [render.com](https://render.com) → Sign up (free, GitHub login is fine).
2. **New +** → **Web Service**.
3. Connect your **GitHub** account and select the repo you pushed.
4. Settings:
   - **Name:** `inursly-api` (or any name).
   - **Root Directory:**  
     - If your repo root is the whole project (e.g. `my-project` with a `doctor-appointment` folder inside): set **`doctor-appointment`**.  
     - If the repo root is already the `doctor-appointment` folder: leave blank.
   - **Runtime:** Node.
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free.

5. **Environment variables** (only these; do **not** set any `DB_*` so the backend uses demo mode):
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *(optional; leave blank if you don’t need the chatbot)*
   - `FRONTEND_URL` = *(you’ll add this after Step 3 – your frontend URL)*

6. Click **Create Web Service**. Wait for the first deploy to finish.
7. Copy your backend URL (e.g. `https://inursly-api.onrender.com`). You’ll need it for the frontend and for `FRONTEND_URL`.

---

## Step 3: Deploy frontend on Render (or Vercel)

### Option A: Render Static Site

1. **New +** → **Static Site**.
2. Connect the **same** GitHub repo.
3. Settings:
   - **Name:** e.g. `inursly`
   - **Root Directory:** `doctor-appointment/frontend` (or `frontend` if repo root is the app folder).
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. **Environment:**
   - `REACT_APP_API_URL` = your backend URL from Step 2 (e.g. `https://inursly-api.onrender.com`)
5. **Create Static Site**. Copy the frontend URL (e.g. `https://inursly.onrender.com`).

### Option B: Vercel (alternative)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub.
2. **Add New** → **Project** → Import your repo.
3. **Root Directory:** set to `doctor-appointment/frontend` (or `frontend` if that’s your app root).
4. **Environment Variable:** `REACT_APP_API_URL` = your backend URL (e.g. `https://inursly-api.onrender.com`).
5. Deploy. Use the generated URL (e.g. `https://inursly.vercel.app`).

---

## Step 4: Set CORS on the backend

1. Open your **backend** Web Service on Render → **Environment**.
2. Add or edit:
   - `FRONTEND_URL` = your frontend URL (e.g. `https://inursly.onrender.com` or `https://inursly.vercel.app`).
3. Save. Render will redeploy the backend so it allows requests from that frontend.

---

## Done

- **Frontend URL** = what you share with recruiters (e.g. `https://inursly.onrender.com`).
- **Backend** runs in demo mode: doctors from JSON, signup/login and bookings in memory (reset on restart). No MySQL, 100% free.
- If the first load is slow, say: “Backend is on a free tier and may take 30–60 seconds to wake up.”

---

## Quick checklist

- [ ] Repo on GitHub (no `.env` committed).
- [ ] Render Web Service: build `cd backend && npm install`, start `cd backend && npm start`, no `DB_*` vars.
- [ ] Render Static Site (or Vercel): `REACT_APP_API_URL` = backend URL.
- [ ] Backend `FRONTEND_URL` = frontend URL.
