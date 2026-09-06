# Peblo TV Mini — Deployment & Connection Guide

This guide explains how the **Backend API**, **CMS Studio**, and **Viewer App** connect together and how to deploy them to production.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL |
|---|---|---|
| **Viewer UI** | Vercel | [https://peblo-tv-mini-37pu.vercel.app/](https://peblo-tv-mini-37pu.vercel.app/) |
| **CMS Studio** | Vercel | [https://peblo-tv-mini-one.vercel.app/](https://peblo-tv-mini-one.vercel.app/) |
| **Backend API** | Render | [https://peblo-tv-mini-8sq7.onrender.com/](https://peblo-tv-mini-8sq7.onrender.com/) |

---

## 1. Architecture & Connection Overview

The system consists of three distinct tiers that connect via REST APIs and published storage:

```
                                  ┌───────────────────────────────┐
                                  │   CMS Studio (Port 5173)      │
                                  │   Internal Editorial Desk     │
                                  └───────────────┬───────────────┘
                                                  │
                                                  │ REST API + JWT Auth
                                                  ▼
┌───────────────────────────┐      ┌──────────────────────────────┐      ┌─────────────────────────────┐
│ PostgreSQL / SQLite       │◄────►│ FastAPI Backend (Port 8000)  │─────►│ Storage: catalogue.json     │
│ Shows, Seasons, Episodes  │      │ - Auth & Validation          │      │ Local disk or Cloudflare R2 │
└───────────────────────────┘      │ - Atomic Publish Engine      │      └──────────────┬──────────────┘
                                   └──────────────────────────────┘                     │
                                                  ▲                                     │
                                                  │ Public Catalog API                  │
                                                  │ (Reads cached JSON)                 │
                                  ┌───────────────┴───────────────┐                     │
                                  │   Viewer App (Port 5174)      │◄────────────────────┘
                                  │   Peblo Kids Bedtime App      │
                                  └───────────────────────────────┘
```

### How They Connect:
1. **CMS to Backend**:
   - The CMS makes authenticated requests (`Authorization: Bearer <JWT>`) to `VITE_API_URL` (e.g., `https://api.yourdomain.com`).
   - Handles shows, seasons, episodes, image validation (200 KB max), and pre-publish gates.
2. **Backend to Storage**:
   - When an admin triggers Publish, the backend validates integrity and atomically writes `catalogue.json` to storage (`/app/storage` or Cloudflare R2 bucket).
3. **Viewer to Backend**:
   - The Viewer fetches `GET /catalog` and `GET /catalog/search` from `VITE_API_URL`.
   - Reads the atomic published catalogue with collapsed multilingual groups and streaming artwork.
   - Requires **no login** (public consumer client).

---

## 2. Option A: One-Command Docker Compose (Single VPS or Server)

Ideal for hosting on any Linux VPS (DigitalOcean Droplet, AWS EC2, Linode, Hetzner):

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/your-username/peblo_tv_mini.git
cd peblo_tv_mini
cp .env.example .env
```

### Step 2: Launch All Services
```bash
docker compose up -d --build
```
This automatically starts:
- **`db`**: PostgreSQL 16 on port `5432` with health checks.
- **`api`**: FastAPI on port `8000`, applies Alembic migrations, runs database seeder, and mounts persistent storage.
- **`cms`**: Nginx container serving compiled CMS UI on port `5173`.
- **`viewer`**: Nginx container serving compiled Viewer UI on port `5174`.

### Step 3: Verify Running Services
```bash
docker compose ps
curl http://localhost:8000/catalog
```

---

## 3. Option B: Cloud Managed Deployment (Recommended for Scale)

| Component | Recommended Platform | Build / Run Command |
|---|---|---|
| **PostgreSQL Database** | Supabase, Neon, or Railway | Managed Postgres instance |
| **Backend API (FastAPI)** | Render, Railway, or Fly.io | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **CMS Studio (React)** | Vercel, Netlify, or Cloudflare Pages | `npm run build` (output directory: `dist`) |
| **Viewer App (React)** | Vercel, Netlify, or Cloudflare Pages | `npm run build` (output directory: `dist`) |
| **Media / Artwork** | Cloudflare R2 or AWS S3 | S3-compatible object storage |

### Step-by-Step Managed Setup:

#### 1. Deploy Database:
- Create a PostgreSQL database on Neon, Supabase, or Railway.
- Copy the connection string: `postgresql+psycopg://user:password@host:5432/dbname`.

#### 2. Deploy Backend API:
- Create a new Web Service pointing to `/backend`.
- Set Environment Variables:
  ```env
  DATABASE_URL=postgresql+psycopg://user:password@host:5432/dbname
  JWT_SECRET=your-random-32-char-secret-key
  STORAGE_BACKEND=local (or r2)
  CORS_ORIGINS=["https://peblo-cms.vercel.app","https://peblo-kids.vercel.app"]
  ```
- Build command: `pip install -r requirements.txt && alembic upgrade head && python seed/seed.py`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Your API URL will be: `https://peblo-api.onrender.com`

#### 3. Deploy CMS Studio:
- In Vercel / Netlify / Cloudflare Pages, import the repo with root directory set to **`cms`**.
- Set Build Environment Variable:
  ```env
  VITE_API_URL=https://peblo-api.onrender.com
  ```
- Deploy. The CMS is now live and talking to your backend!

#### 4. Deploy Viewer App:
- In Vercel / Netlify / Cloudflare Pages, import the repo with root directory set to **`viewer`**.
- Set Build Environment Variable:
  ```env
  VITE_API_URL=https://peblo-api.onrender.com
  ```
- Deploy. The consumer bedtime app is now live!

---

## 4. Production Environment Variables Reference

### Backend (`.env`):
| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL or SQLite connection URI | `sqlite:///./peblo_tv.db` |
| `JWT_SECRET` | Secret key for signing admin/editor tokens | `generate-random-secret` |
| `STORAGE_BACKEND` | `local` for disk storage or `r2` for Cloudflare S3 | `local` |
| `STORAGE_LOCAL_PATH` | Absolute path for local artwork & published catalog | `/app/storage` |
| `STORAGE_BASE_URL` | Base public URL serving media | `https://api.yourdomain.com/storage` |
| `CORS_ORIGINS` | Array of permitted frontend URLs | `["https://cms.domain.com", "https://peblo.tv"]` |

### CMS & Viewer (`.env` or Cloud Dashboard):
| Variable | Description | Production Example |
|---|---|---|
| `VITE_API_URL` | URL of the backend FastAPI service | `https://api.yourdomain.com` |

---

## 5. Reverse Proxy / Custom Domains Example (Nginx)

If hosting all three on one domain with subdomains:

```nginx
# 1. Consumer Viewer: https://peblo.tv
server {
    server_name peblo.tv;
    location / {
        proxy_pass http://localhost:5174;
    }
}

# 2. Editorial CMS: https://cms.peblo.tv
server {
    server_name cms.peblo.tv;
    location / {
        proxy_pass http://localhost:5173;
    }
}

# 3. API Backend: https://api.peblo.tv
server {
    server_name api.peblo.tv;
    client_max_body_size 10M;
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
