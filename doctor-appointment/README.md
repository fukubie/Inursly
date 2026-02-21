# Inursly – Doctor Appointment Platform

US-based healthcare appointment platform: book with doctors, doctor & clinic registration, and AI assistant. Built for deployment on **Render** and **GitHub** with API keys kept in environment variables (never in code).

---

## Security – API keys & secrets

- **Never commit** `.env` or real credentials to Git. Use `.env.example` as a template.
- **Backend**: All secrets live in environment variables:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL
  - `GEMINI_API_KEY` – Gemini chatbot (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
  - `FRONTEND_URL` – allowed CORS origin (e.g. your frontend URL on Render/Vercel)
- **Frontend**: Set `REACT_APP_API_URL` to your backend URL in production (e.g. `https://inursly-api.onrender.com`). No API keys in frontend code.

---

## Deploy with MySQL

- **Azure** (with $100 credit): **[DEPLOY_AZURE.md](./DEPLOY_AZURE.md)** – Azure MySQL + App Service (backend) + Static Web App (frontend), using MySQL Workbench to create tables.
- **Render + GitHub**: **[DEPLOY_RENDER_GITHUB.md](./DEPLOY_RENDER_GITHUB.md)** – Cloud MySQL (PlanetScale/Railway) + Render Web Service + Static Site.

### 1. Backend (Render Web Service)

1. Push the repo to GitHub.
2. In [Render](https://render.com): **New → Web Service**, connect the repo.
3. **Root Directory**: `doctor-appointment` (or leave blank if repo root is the app).
4. **Build**: `cd backend && npm install`
5. **Start**: `cd backend && npm start`
6. **Environment** (Render Dashboard → Environment):
   - `NODE_ENV` = `production`
   - `PORT` = (Render sets this automatically; leave or leave blank)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – use a MySQL add-on (e.g. [PlanetScale](https://planetscale.com), [Railway](https://railway.app)) or external MySQL.
   - `GEMINI_API_KEY` = your Gemini API key
   - `FRONTEND_URL` = your frontend URL (e.g. `https://your-frontend.onrender.com` or Vercel URL)

### 2. Frontend (Render Static Site or Vercel/Netlify)

1. **Build command**: `npm run build`
2. **Publish directory**: `build`
3. **Environment**: `REACT_APP_API_URL` = your backend URL (e.g. `https://inursly-api.onrender.com`)

If the frontend is in `doctor-appointment/frontend`, set **Root Directory** to `frontend` and add `REACT_APP_API_URL` there.

### 3. Database schema (MySQL)

Ensure your MySQL database has:

- **patients**: `id`, `name`, `email`, `password` (store bcrypt hash), `dob`
- **doctors**: `id`, `name`, `email`, `password` (bcrypt for doctor signups), `bio`, `image_url`, `exp`, `total_patients`, `online_fee`, `visit_fee`
- **appointments**: `id`, `patient_id`, `doctor_id`, `appointment_date`, `time_slot`, `reason`
- **clinics** (for clinic registration): `id`, `name`, `address`, `phone`, `email`, `created_at` (optional)

Run migrations or SQL scripts to create these tables if they don’t exist.

---

## Run locally

1. **Backend**: `cd backend`, copy `.env.example` to `.env`, fill in DB and `GEMINI_API_KEY`. Run `npm install` and `npm run dev`.
2. **Frontend**: `cd frontend`, add `REACT_APP_API_URL=http://localhost:3000` in `.env` (optional; proxy works for dev). Run `npm install` and `npm start`.

---

## Brand

- **Name**: Inursly  
- **Description**: US-based healthcare appointment platform (doctors, clinics, patients, bookings, AI assistant).
