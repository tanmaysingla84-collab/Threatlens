# ThreatLens — Cyber Threat Intelligence & Malware Analysis Platform

> A production-grade SOC dashboard for triaging files, URLs, IPs, domains, and hashes against VirusTotal, MalwareBazaar, Hybrid Analysis, URLScan.io, ThreatMiner, and AbuseIPDB.

---

## Architecture Overview

```
cti-platform/
├── backend/     Node.js + Express + MongoDB (Mongoose) API
├── frontend/    React (Vite) + Tailwind CSS dashboard
└── docs/        API, Environment, and Deployment documentation
```

**Frontend stack:** React, Vite, Tailwind CSS v3, React Router v6, Axios, TanStack React Query, Framer Motion, Recharts  
**Backend stack:** Node.js, Express.js, MongoDB, Mongoose, bcryptjs, jsonwebtoken  
**Auth:** JWT (15-min access tokens + 7-day refresh tokens), bcrypt (cost 12), RBAC (`user`|`admin`)

---

## Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string
- npm ≥ 9

### 1. Clone and install

```bash
git clone <repo-url>
cd threatlens

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — fill in MONGODB_URI and JWT secrets at minimum

# Frontend  
cd ../frontend
cp .env.example .env
# VITE_API_BASE_URL is pre-filled for localhost
```

### 3. Start both servers (two terminals)

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Verify everything works

```bash
# Should return { success: true, data: { server: "ok", db: "connected" } }
curl http://localhost:5000/api/health
```

---

## API Keys (Optional for Phase 1)

Add these to `backend/.env` as you obtain them. The app degrades gracefully with a clear "API key not configured" message for any missing key:

| Variable | Source | Required for |
|---|---|---|
| `VIRUSTOTAL_API_KEY` | [virustotal.com](https://www.virustotal.com/gui/join-us) | File/URL/IP/Hash/Domain analysis |
| `MALWAREBAZAAR_API_KEY` | [bazaar.abuse.ch](https://bazaar.abuse.ch/) | Hash/malware family lookup |
| `HYBRID_ANALYSIS_API_KEY` | [hybrid-analysis.com](https://www.hybrid-analysis.com/) | Behavioral reports |
| `URLSCAN_API_KEY` | [urlscan.io](https://urlscan.io/) | URL scanning |
| `ABUSEIPDB_API_KEY` | [abuseipdb.com](https://www.abuseipdb.com/) | IP reputation |

ThreatMiner requires no API key.

---

## Build Phases

| Phase | Status | Description |
|---|---|---|
| **1** | ✅ Complete | Project scaffold, Express app, Vite frontend, routing skeleton |
| **2** | 🔜 Next | Auth endpoints, JWT, User model, login/register UI |
| **3** | — | Threat intel integrations + scoring engine |
| **4** | — | File/URL/IP/Domain/Hash analysis endpoints + UI |
| **5** | — | AI summary module |
| **6** | — | Dashboard stats + Scan History (with Recharts) |
| **7** | — | PDF report generation |
| **8** | — | Admin panel |
| **9** | — | Polish, hardening, documentation |

---

## NPM Scripts

| Directory | Command | Description |
|---|---|---|
| `backend/` | `npm run dev` | Start backend with nodemon hot-reload |
| `backend/` | `npm start` | Start backend in production mode |
| `frontend/` | `npm run dev` | Start Vite dev server with HMR |
| `frontend/` | `npm run build` | Build production bundle |
| `frontend/` | `npm run preview` | Preview production build locally |

---

## Security Notes

- All API keys live in `backend/.env` only — never bundled into the frontend.
- All external threat-intel calls are server-side only.
- Uploaded files are stored in `backend/uploads/` (outside web root), hashed, then deleted.
- Passwords hashed with bcrypt (cost factor 12).
- Rate limiting: 100 req/15 min globally; 10 req/15 min on auth; 20 req/5 min on analysis.
- Helmet sets all recommended security headers.
- CORS allows only origins listed in `ALLOWED_ORIGINS`.

---

## Docs

- [docs/API.md](docs/API.md) — Complete REST API reference
- [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) — All environment variables documented
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Render/Railway/Vercel deployment guide
