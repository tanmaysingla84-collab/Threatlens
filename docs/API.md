# API Reference

Base URL: `http://localhost:5000/api` (dev) | `https://your-backend.render.com/api` (prod)

All responses follow the envelope: `{ success: boolean, data?: any, error?: { message: string } }`

Authentication: `Authorization: Bearer <accessToken>` header on all protected routes.

---

## Health

### `GET /health`
Public. Returns server and DB status.

---

## Auth

### `POST /auth/register`
**Body:** `{ name, email, password }`  
**Response:** `{ user, accessToken, refreshToken }`

### `POST /auth/login`
**Body:** `{ email, password }`  
**Response:** `{ user, accessToken, refreshToken }`

### `POST /auth/refresh`
**Body:** `{ refreshToken }`  
**Response:** `{ accessToken }`

### `POST /auth/forgot-password`
**Body:** `{ email }`

### `POST /auth/reset-password`
**Body:** `{ token, password }`

### `GET /auth/me`
🔒 Protected. Returns current user.

---

## Analysis

All analysis endpoints require auth. Rate limited: 20 requests / 5 minutes.

### `POST /analyze/file`
**Content-Type:** `multipart/form-data`  
**Body:** `file` (binary, max 32 MB)  
Computes SHA256, deletes temp file, queries all integrations in parallel.

### `POST /analyze/url`
**Body:** `{ url }`

### `POST /analyze/ip`
**Body:** `{ ip }`

### `POST /analyze/domain`
**Body:** `{ domain }`

### `POST /analyze/hash`
**Body:** `{ hash }` (MD5, SHA1, or SHA256)

**Response shape (all analyze endpoints):**
```json
{
  "success": true,
  "data": {
    "scanId": "...",
    "type": "file|url|ip|domain|hash",
    "input": "...",
    "threatScore": 75,
    "threatBand": "Medium",
    "aiSummary": "...",
    "sources": [...],
    "createdAt": "..."
  }
}
```

---

## Scans

### `GET /scans`
🔒 Own scans only. Query: `?page=1&limit=20&type=file&search=`

### `GET /scans/:id`
🔒 Own scan only.

### `DELETE /scans/:id`
🔒 Own scan only.

### `GET /scans/:id/report`
🔒 Streams PDF report.

---

## Dashboard

### `GET /dashboard/stats`
🔒 Returns totals, today's count, high-risk count, trend data.

---

## Admin *(admin role required)*

### `GET /admin/users`
### `DELETE /admin/users/:id`
### `GET /admin/scans`
### `GET /admin/api-health`
