# ThreatXLens — Cyber Threat Intelligence & Malware Analysis Platform

> A production-grade SOC dashboard for triaging files, URLs, IPs, domains, and hashes against VirusTotal, MalwareBazaar, Hybrid Analysis, URLScan.io, ThreatMiner, and AbuseIPDB.

---

## 🏗️ Architecture Overview

```text
cti-platform/
├── backend/     Node.js + Express API (Stateless)
├── frontend/    React (Vite) + Tailwind CSS dashboard
└── docs/        API, Environment, and Deployment documentation
```

**Frontend stack:** React, Vite, Tailwind CSS v3, React Router v6, Axios, TanStack React Query, Framer Motion, Recharts  
**Backend stack:** Node.js, Express.js, Multer  
**Storage:** Stateless backend; frontend utilizes `localStorage` for scan history persistence.  
**Auth:** Disabled / Mocked on frontend (Database-free mode).

---

## ⚙️ How It Works

ThreatXLens acts as a central aggregator and scoring engine for various Threat Intelligence feeds.

1. **Stateless Operation:** The platform runs in a database-free mode. There is no backend user authentication required.
2. **Initiating a Scan:** A user selects an indicator type (File, Hash, IP, Domain, or URL) and submits it via the frontend UI. For file scans, the file is temporarily uploaded to the backend, hashed (SHA-256), and then securely deleted.
3. **Data Aggregation:** The Node.js backend receives the request and utilizes the internal `AggregatorService`. This service concurrently fires requests to all relevant configured third-party threat intelligence APIs based on the IOC type:
   - **Files / Hashes:** VirusTotal, MalwareBazaar, Hybrid Analysis
   - **IP Addresses:** VirusTotal, AbuseIPDB, ThreatMiner
   - **Domains:** VirusTotal, ThreatMiner, URLScan.io
   - **URLs:** VirusTotal, URLScan.io
4. **Risk Scoring:** Once the data is aggregated, the `ScoringService` normalizes the results. It calculates a standardized Risk Score (0-100) by evaluating the number of malicious detections against the total number of engines/checks. It assigns a severity level (Clean, Low, Medium, High, Critical).
5. **Presentation & History:** The final aggregated report and calculated score are returned to the frontend. The frontend displays this rich, unified report using responsive data visualizations and saves the scan record to your browser's `localStorage` for future reference.

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone and install

```bash
git clone <repo-url>
cd threatxlens

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
# Edit .env — fill in API keys (no database URI required)

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
# Should return { success: true, data: { server: "ok", db: "stateless" } }
curl http://localhost:5000/api/health
```

---

## 🔑 API Keys

Add these to `backend/.env` as you obtain them. The app degrades gracefully with a clear "API key not configured" message for any missing key:

| Variable | Source | Required for |
|---|---|---|
| `VIRUSTOTAL_API_KEY` | [virustotal.com](https://www.virustotal.com/gui/join-us) | File/URL/IP/Hash/Domain analysis |
| `MALWAREBAZAAR_API_KEY` | [bazaar.abuse.ch](https://bazaar.abuse.ch/) | Hash/malware family lookup |
| `HYBRID_ANALYSIS_API_KEY` | [hybrid-analysis.com](https://www.hybrid-analysis.com/) | Behavioral reports |
| `URLSCAN_API_KEY` | [urlscan.io](https://urlscan.io/) | URL scanning |
| `ABUSEIPDB_API_KEY` | [abuseipdb.com](https://www.abuseipdb.com/) | IP reputation |

*Note: ThreatMiner requires no API key.*


---

## 💻 NPM Scripts

| Directory | Command | Description |
|---|---|---|
| `backend/` | `npm run dev` | Start backend with nodemon hot-reload |
| `backend/` | `npm start` | Start backend in production mode |
| `frontend/` | `npm run dev` | Start Vite dev server with HMR |
| `frontend/` | `npm run build` | Build production bundle |
| `frontend/` | `npm run preview` | Preview production build locally |

---

## 🛡️ Security Notes

- All API keys live in `backend/.env` only — never bundled into the frontend.
- All external threat-intel calls are server-side only.
- Uploaded files are stored in `backend/uploads/` (outside web root), hashed, then successfully deleted.
- Rate limiting: 100 req/15 min globally; 20 req/5 min on analysis.
- Helmet sets all recommended security headers.
- CORS allows only origins listed in `ALLOWED_ORIGINS`.

---

## 📚 Docs

- [docs/API.md](docs/API.md) — Complete REST API reference
- [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) — All environment variables documented
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Render/Railway/Vercel deployment guide
