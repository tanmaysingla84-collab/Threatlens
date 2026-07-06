# Environment Variables Reference

## Backend (`backend/.env`)

### Server

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `5000` | HTTP port the Express server listens on |

### Database

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/threatlens` | MongoDB connection string |

### JWT Authentication

| Variable | Default | Description |
|---|---|---|
| `JWT_ACCESS_SECRET` | *(none — required)* | Min 32-char random string for signing access tokens |
| `JWT_REFRESH_SECRET` | *(none — required)* | Min 32-char random string for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime (ms/shorthand string) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |

### CORS

| Variable | Default | Description |
|---|---|---|
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed frontend origins |

### Email (password reset)

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | *(optional)* | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(optional)* | SMTP username |
| `SMTP_PASS` | *(optional)* | SMTP password |
| `EMAIL_FROM` | `no-reply@threatlens.local` | From address for system emails |

### Threat Intel API Keys *(all optional — graceful degradation if absent)*

| Variable | Description |
|---|---|
| `VIRUSTOTAL_API_KEY` | VirusTotal v3 API key |
| `MALWAREBAZAAR_API_KEY` | MalwareBazaar API key (abuse.ch) |
| `HYBRID_ANALYSIS_API_KEY` | Hybrid Analysis API key |
| `URLSCAN_API_KEY` | URLScan.io API key |
| `ABUSEIPDB_API_KEY` | AbuseIPDB v2 API key |

> ThreatMiner requires no API key.

### AI Provider *(optional)*

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `template` | `template` (no key needed) \| `openai` \| `anthropic` |
| `OPENAI_API_KEY` | *(optional)* | OpenAI API key (used when `AI_PROVIDER=openai`) |
| `ANTHROPIC_API_KEY` | *(optional)* | Anthropic API key (used when `AI_PROVIDER=anthropic`) |

### File Upload

| Variable | Default | Description |
|---|---|---|
| `MAX_FILE_SIZE_MB` | `32` | Maximum upload size in megabytes |
| `UPLOAD_DIR` | `./uploads` | Temp directory for uploaded files (deleted after hashing) |

---

## Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL (must use `VITE_` prefix to be exposed to Vite bundle) |

> ⚠️ **Never put API keys or secrets in the frontend `.env`**. Anything prefixed `VITE_` is bundled into client-side JavaScript and visible to anyone.
