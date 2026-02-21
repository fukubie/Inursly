# Inursly

A full-stack **doctor appointment booking platform** for the US: patients can find doctors, book appointments, and chat with an AI assistant. Doctors and clinics can register. Built with **React**, **Node.js**, **Express**, and **MySQL** (optional; runs in demo mode without a database).

---

## What it does

- **Patients**: Sign up, log in, search doctors by name or specialty, view doctor profiles (fees, clinics, reviews), book in-person or video appointments, view and cancel their appointments. Each doctor profile has a **QR code** that links to their booking page.
- **Doctors**: Register via “For Doctors” with name, email, password, bio, experience, and fees.
- **Clinics**: Register via “For Clinics” with name, address, phone, and email.
- **AI chatbot**: Answers questions about the platform (powered by Gemini; optional, needs an API key).

---

## Tech stack

| Part      | Stack |
|-----------|--------|
| Frontend  | React, React Router, Axios, Framer Motion, QR code (qrcode.react) |
| Backend   | Node.js, Express, bcrypt (passwords), CORS |
| Database  | MySQL (optional). If not configured, backend uses **demo mode**: JSON data + in-memory storage (data resets on restart). |
| Chatbot   | LangChain + Google Gemini (optional) |

---

## Project structure

```
doctor-appointment/
├── backend/           # Express API
│   ├── server.js      # Routes, auth, demo/MySQL switch
│   ├── json-fallback.js   # Demo mode (no DB)
│   ├── chatbot-service.js # RAG + vector store for chatbot
│   ├── data/          # appointment_data.json (doctors, clinics, etc.)
│   └── .env.example   # Template for env vars
├── frontend/          # React app
│   ├── src/
│   │   ├── App.js     # Routes
│   │   ├── components/  # Header, Home, Login, Signup, DoctorDetails, BookAppointment, etc.
│   │   └── index.js
│   └── public/
└── README.md
```

---

## Run locally

**Backend**

```bash
cd backend
cp .env.example .env   # optional: add DB_* and GEMINI_API_KEY for MySQL and chatbot
npm install
npm start
```

Runs at **http://localhost:3000**. Without `DB_*` in `.env`, it uses **demo mode** (no MySQL).

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm start
```

Runs at **http://localhost:4000** and proxies API requests to the backend.

---

## Deploy 

- **Backend**: Deploy as a **Web Service** on [Render](https://render.com). Connect your GitHub repo. Root: `doctor-appointment`. Build: `cd backend && npm install`. Start: `cd backend && npm start`. Do **not** set any `DB_*` env vars so it runs in demo mode. Add `FRONTEND_URL` after deploying the frontend.
- **Frontend**: Deploy as a **Static Site** on Render (or Vercel). Root: `doctor-appointment/frontend`. Build: `npm install && npm run build`. Publish: `build`. Set `REACT_APP_API_URL` to your backend URL.
- **Database**: Not required for the free demo. For a real database, use a cloud MySQL (e.g. PlanetScale, Railway) and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` on the backend. See **MYSQL_SETUP.md** for the schema.

---

## Environment variables

**Backend** (in `.env` or Render Environment)

| Variable        | Purpose |
|----------------|--------|
| `PORT`         | Server port (default 3000). |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | MySQL (optional). Omit for demo mode. |
| `GEMINI_API_KEY` | Optional; for chatbot. |
| `FRONTEND_URL` | Allowed CORS origin (e.g. your frontend URL). |

**Frontend** (for production build)

| Variable             | Purpose |
|----------------------|--------|
| `REACT_APP_API_URL`  | Backend URL (e.g. `https://your-api.onrender.com`). |

Never commit `.env` or secrets to Git.

---

## License

ISC.
