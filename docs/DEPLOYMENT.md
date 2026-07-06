# Deployment Guide

## Frontend → Vercel

1. Push the repo to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set **Root Directory** to `frontend`.
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend.render.com/api`
5. Deploy. Vercel auto-detects Vite and builds with `npm run build`.

**vercel.json** (place in `frontend/` if needed for SPA routing):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Backend → Render (default)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. **Build Command:** `npm install`
5. **Start Command:** `node src/server.js`
6. Add all environment variables from `backend/.env.example` in the Render dashboard.
7. Provision a **MongoDB Atlas** cluster (free tier) and paste the URI into `MONGODB_URI`.

---

## Backend → Railway

1. Create a new project on [Railway](https://railway.app/).
2. Deploy from GitHub; set root to `backend/`.
3. Add environment variables in the Railway Variables panel.
4. Railway auto-detects Node and runs `npm start`.

---

## Backend → AWS (EC2 / Elastic Beanstalk)

1. Package backend as a Docker container or deploy to an EC2 instance.
2. Use PM2 for process management: `pm2 start src/server.js --name threatlens-api`
3. Nginx reverse proxy on port 80/443 → localhost:5000.
4. Use AWS Secrets Manager or Parameter Store for environment variables in production.

---

## MongoDB Atlas Setup

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Whitelist your server IP (or 0.0.0.0/0 for Railway/Render with dynamic IPs).
4. Copy the connection string and set as `MONGODB_URI`.

---

## Production Checklist

- [ ] All JWT secrets are long (≥32 chars), random, and unique per environment
- [ ] `NODE_ENV=production` is set on the server
- [ ] `ALLOWED_ORIGINS` contains only your Vercel frontend URL
- [ ] MongoDB user has least-privilege permissions
- [ ] Rate limits are tuned for expected traffic
- [ ] HTTPS is enforced (handled by Render/Railway/Vercel automatically)
