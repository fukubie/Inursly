# Deploy Inursly on Render + GitHub with MySQL

Render runs your app in the cloud. It **cannot** connect to MySQL on your laptop (different network). You use a **cloud MySQL** database that both your local machine and Render can reach.

You can keep using **MySQL Workbench** to manage that database: connect to the cloud MySQL host and run SQL there.

---

## Overview

| What | Where |
|------|--------|
| Code | **GitHub** (your repo) |
| Backend API | **Render** Web Service (Node.js) |
| Frontend | **Render** Static Site (or Vercel/Netlify) |
| MySQL | **Cloud MySQL** (PlanetScale, Railway, or similar) |

---

## Step 1: Create a cloud MySQL database

Render does not include MySQL. Use one of these (all have free tiers):

### Option A: PlanetScale (recommended, free tier)

1. Sign up: https://planetscale.com
2. **Create a database** (e.g. `inursly-db`), choose a region.
3. Open the database → **Connect** → **Connect with: General**.
4. Copy the connection details. You’ll see something like:
   - **Host**: `xxx.aws.connect.psdb.cloud`
   - **Username**: `xxx`
   - **Password**: (click “Create password” and save it)
   - **Database**: your DB name
5. PlanetScale uses **branching**; your main branch is the DB you use. Default port is **3306** (often in the host string).

**Note:** PlanetScale is MySQL-compatible but has a few differences. If you hit compatibility issues, use Railway or Aiven instead.

### Option B: Railway

1. Sign up: https://railway.app
2. **New Project** → **Provision MySQL**.
3. Open the MySQL service → **Variables** or **Connect** tab.
4. Copy: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT` (often 3306).
5. Map to your app’s env: `DB_HOST` = `MYSQLHOST`, `DB_USER` = `MYSQLUSER`, `DB_PASSWORD` = `MYSQLPASSWORD`, `DB_NAME` = `MYSQLDATABASE`. If the host doesn’t include the port, add `DB_PORT` = `MYSQLPORT` if your app supports it.

### Option C: Aiven (free trial)

1. Sign up: https://aiven.io
2. Create a **MySQL** service.
3. In the service dashboard, get **Host**, **Port**, **User**, **Password**, and **Database**.
4. Use these for `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` on Render.

---

## Step 2: Create tables in the cloud MySQL (using MySQL Workbench)

1. Open **MySQL Workbench**.
2. **Create a new connection** to your **cloud** database:
   - **Host**: the host from Step 1 (e.g. `xxx.aws.connect.psdb.cloud` for PlanetScale).
   - **Port**: 3306 (or the one given by the provider).
   - **Username** and **Password**: from Step 1.
   - Test the connection and connect.
3. In the project folder, open **MYSQL_SETUP.md** and copy the full **“3. Create tables”** SQL block (all the `CREATE TABLE` and `INSERT INTO specialties` statements).
4. In MySQL Workbench, paste that SQL into a query tab and **Execute** (run the script).
5. Confirm the tables exist in the left sidebar (e.g. `patients`, `doctors`, `appointments`, etc.).

Your cloud MySQL is now ready for both local dev and Render.

---

## Step 3: Push your code to GitHub

1. Create a new repo on GitHub (e.g. `inursly`). Do **not** initialize with a README if your code is already in a folder.
2. In your project folder (e.g. `my-project` or `doctor-appointment`), make sure **`.env` is not tracked**:

   ```bash
   # If you haven’t already
   echo ".env" >> .gitignore
   echo "backend/.env" >> .gitignore
   ```

3. Push your app (adjust paths if your repo root is different):

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Inursly"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

   If the repo is only the `doctor-appointment` folder, run these commands **inside** `doctor-appointment` so the repo root is `doctor-appointment`.

---

## Step 4: Create the backend on Render

1. Go to https://dashboard.render.com and sign in (GitHub is fine).
2. **New +** → **Web Service**.
3. **Connect** your GitHub account and select the repo that contains Inursly.
4. Settings:
   - **Name**: e.g. `inursly-api`
   - **Region**: pick one close to you or your users
   - **Root Directory**:  
     - If the repo root is the whole project (e.g. `my-project`): set **`doctor-appointment`**.  
     - If the repo root is already `doctor-appointment`, leave blank.
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: Free (or paid if you prefer)

5. **Environment** (same page or **Environment** tab):
   - `NODE_ENV` = `production`
   - `DB_HOST` = *(from Step 1, e.g. `xxx.aws.connect.psdb.cloud`)*
   - `DB_USER` = *(from Step 1)*
   - `DB_PASSWORD` = *(from Step 1; use Render’s “Secret” so it’s hidden)*
   - `DB_NAME` = *(from Step 1)*
   - `GEMINI_API_KEY` = *(optional; only if you use the chatbot)*
   - `FRONTEND_URL` = *(your frontend URL; see Step 5 – e.g. `https://inursly.onrender.com`)*

   Do **not** set `PORT`; Render sets it automatically.

6. Click **Create Web Service**. Render will build and deploy. When it’s live, note the URL (e.g. `https://inursly-api.onrender.com`). That is your **backend URL**.

---

## Step 5: Deploy the frontend on Render

1. **New +** → **Static Site**.
2. Connect the **same** GitHub repo.
3. Settings:
   - **Name**: e.g. `inursly`
   - **Root Directory**: `doctor-appointment/frontend` (or `frontend` if repo root is `doctor-appointment`)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment**:
   - `REACT_APP_API_URL` = **your backend URL** from Step 4 (e.g. `https://inursly-api.onrender.com`)

5. **Create Static Site**. When it’s deployed, note the frontend URL (e.g. `https://inursly.onrender.com`).

6. **Update backend CORS**:
   - Go back to the **backend** Web Service on Render.
   - **Environment** → set `FRONTEND_URL` to the **frontend** URL (e.g. `https://inursly.onrender.com`).
   - Save so the backend redeploys with the new CORS origin.

---

## Step 6: Use the same MySQL locally (optional)

To run the app on your machine against the **same** cloud MySQL:

1. In `doctor-appointment/backend`, copy `.env.example` to `.env`.
2. In `.env`, set the **same** values you used on Render (cloud DB host, user, password, database):

   ```env
   DB_HOST=xxx.aws.connect.psdb.cloud
   DB_USER=your_cloud_user
   DB_PASSWORD=your_cloud_password
   DB_NAME=your_db_name
   PORT=3000
   FRONTEND_URL=http://localhost:4000
   GEMINI_API_KEY=optional
   ```

3. Run backend: `cd backend && npm start`. You should see **Connected to MySQL**.
4. Run frontend: `cd frontend && npm start`. Use `http://localhost:4000`; it can proxy to `http://localhost:3000` in dev, or set `REACT_APP_API_URL=http://localhost:3000` in `frontend/.env` if needed.

You can keep using **MySQL Workbench** with the same cloud connection to inspect and edit data.

---

## Checklist

- [ ] Cloud MySQL created (PlanetScale / Railway / Aiven).
- [ ] Tables created in cloud MySQL (SQL from **MYSQL_SETUP.md**), e.g. via MySQL Workbench.
- [ ] Repo on GitHub; no `.env` or secrets in the repo.
- [ ] Render Web Service (backend) with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `FRONTEND_URL`, and optionally `GEMINI_API_KEY`.
- [ ] Render Static Site (frontend) with `REACT_APP_API_URL` = backend URL.
- [ ] Backend `FRONTEND_URL` set to frontend URL for CORS.

After that, your app on Render uses the same MySQL you manage in MySQL Workbench (connected to the cloud host).
