# Peblo TV Mini — Platform Engineer Take-Home

A robust, production-ready miniature streaming platform featuring an internal Editorial CMS, pre-publish validation gate, atomic catalogue publishing pipeline, and a Netflix-style child-friendly bedtime Viewer UI.

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│   CMS Studio    │ ────► │      FastAPI API       │ ────► │   Publish Job   │ ────► │     catalogue.json     │
│ (React + TS)    │       │ (PostgreSQL + Alembic) │       │ (Atomic Swap)   │       │ (Local Disk / R2 CDN)  │
└─────────────────┘       └────────────────────────┘       └─────────────────┘       └────────────────────────┘
                                                                                                  │
                                                                   ┌──────────────────────────────┘
                                                                   ▼
                                                       ┌────────────────────────┐
                                                       │   Viewer Browse UI     │
                                                       │ (React + Netflix UX)   │
                                                       └────────────────────────┘
```

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL | Description & Access |
|---|---|---|---|
| **Viewer UI** | Vercel | [https://peblo-tv-mini-37pu.vercel.app/](https://peblo-tv-mini-37pu.vercel.app/) | Netflix-style bedtime streaming browse experience |
| **CMS Studio** | Vercel | [https://peblo-tv-mini-one.vercel.app/](https://peblo-tv-mini-one.vercel.app/) | Content upload, validation reports & atomic publish dashboard |
| **Backend API** | Render | [https://peblo-tv-mini-8sq7.onrender.com/](https://peblo-tv-mini-8sq7.onrender.com/) | FastAPI REST API, Swagger docs at `/docs`, health at `/health` |

---

## 🌟 Local Services & Development Ports

| Service | Stack | Local Port | Production URL | Credentials / Notes |
|---|---|---|---|---|
| **Backend API** | FastAPI, SQLAlchemy 2.0, Alembic | `http://localhost:8000` | [Render Service](https://peblo-tv-mini-8sq7.onrender.com/) | Swagger at `/docs`, Health check at `/health` |
| **CMS Studio** | React 18, TS, TanStack Query | `http://localhost:5173` | [Vercel Deployment](https://peblo-tv-mini-one.vercel.app/) | **Admin**: `admin@peblo.tv` / `admin123`<br>**Editor**: `editor@peblo.tv` / `editor123` |
| **Viewer UI** | React 18, TS, Web Audio API | `http://localhost:5174` | [Vercel Deployment](https://peblo-tv-mini-37pu.vercel.app/) | Reads exclusively from published `catalogue.json` |
| **PostgreSQL** | PostgreSQL 16 (Docker) | `localhost:5432` | Managed Cloud DB | User: `peblo` / Pass: `peblo` / DB: `peblo_tv` |

---

## 🚀 Quick Start (Local & Docker)

### Option 1: Docker Compose (One-Command Full Stack)
Brings up PostgreSQL, Backend API (migrated and seeded), CMS Studio, and Viewer UI:
```bash
docker compose up --build
```
- CMS will be live at `http://localhost:5173`
- Viewer will be live at `http://localhost:5174`
- API docs will be live at `http://localhost:8000/docs`

---

### Option 2: Running Locally (Step-by-Step)

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
python seed/seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. CMS Setup
```bash
cd cms
npm install
npm run dev
# Running at http://localhost:5173
```

#### 3. Viewer UI Setup
```bash
cd viewer
npm install
npm run dev
# Running at http://localhost:5174
```

---

## 🧪 Automated Test Suite

The test suite covers the riskiest business logic: publish atomicity, role authorization enforcement, artwork dimension/size limits, and content group language deduplication:

```bash
# From project root:
pytest backend/tests/ -v
```

**Results (11 passed in 3.2s):**
- `test_artwork_rejected_exceeds_200kb` (Enforces 200KB ceiling with human-readable error)
- `test_artwork_rejected_wrong_aspect_ratio` (Strict 2:3 and 16:9 ratio tolerance checks)
- `test_artwork_accepted_valid_specs` (Permits matching poster/banner/thumbnail uploads)
- `test_login_success` & `test_login_invalid_password` (JWT issuance and verification)
- `test_health_check_endpoint` (Probes database and storage readiness)
- `test_editor_cannot_publish_admin_required` (403 Forbidden for editor, 200 for admin)
- `test_publish_workflow_and_catalog_search` (Atomic swap, content_group collapse, composite search)
- `test_unique_constraint_content_group_language` (Prevents duplicate dub collisions)
- `test_cannot_publish_show_without_section` (Enforces required show section gate)
- `test_cannot_publish_episode_without_artwork_or_duration` (Pre-publish blocker check)

---

## 📁 Sample Assets & Imperfect Seed Data Handling

### 1. Test Assets (`/assets`)
Included in the repository are deliberate test images for validating the CMS upload slots:
- `thumb_tiny.jpg` (100×60) → Triggers minimum dimension violation.
- `thumb_good.jpg` (640×360, 16:9, <200 KB) → Valid thumbnail.
- `poster_wrong_ratio.jpg` (500×500) → Triggers 2:3 aspect ratio mismatch error.
- `poster_good.jpg` (600×900, 2:3, <200 KB) → Valid poster.
- `banner_too_big.png` (~2 MB) → Triggers 200 KB ceiling rejection.
- `banner_good.jpg` (1280×720, 16:9, <200 KB) → Valid banner.

### 2. Imperfect Seed Data Discovery
The provided seed data contains deliberate real-world issues surfaced automatically by `GET /admin/validation-report`:
1. **Missing Artwork / Missing Durations**: Episodes in draft status without duration or required artwork slots.
2. **Missing Show Section**: Shows drafted without an assigned UI section.
3. **Multilingual Dubs Sharing Content Group**: English (`en`) and Hindi (`hi`) variants properly validated against the `(content_group, language)` uniqueness rule and collapsed into single viewer cards upon publish.
4. **Season 0 Trailer Convention**: Handled cleanly across the backend and frontend so trailers are routed to a dedicated preview modal instead of polluting standard numerical seasons.

---

## 📝 Part E — Written Analysis & Architecture Decisions

### 1. How Publishing Was Made Atomic (And What Happens on Mid-Publish Crash)
Publishing creates a clean, deterministic `catalogue.json` without reader downtime or partial reads:
1. **In-Memory Validation & Assembly**: `PublishService` validates all candidates in memory and groups them by section and collapsed `content_group`. If any blocker is found, the transaction aborts with zero side effects.
2. **Staged Temporary File**: The JSON payload is written to a unique sibling file (`tmp_catalogue_<uuid>.json`) on the same filesystem/volume.
3. **Flush & Sync**: The stream is explicitly flushed and synced to storage media via `os.fsync(f.fileno())` to ensure byte-level disk permanence.
4. **POSIX Atomic Rename**: The temporary file replaces the live `catalogue.json` using `os.replace()`. On POSIX and modern Windows NTFS, this rename is an atomic filesystem operation.
5. **Database Run Record**: The outcome, publisher ID, duration, and entity counts are committed to the `publish_runs` audit table.

**Crash Behavior**:
- If the worker process or container dies *before* `os.replace()`, the live `catalogue.json` remains completely untouched and valid. An orphaned `tmp_catalogue_*.json` file may linger in temp storage (cleaned up on next boot).
- If it dies *after* `os.replace()`, the new catalogue is already live; the database transaction rolls back, leaving the publish run unrecorded or flagged as orphaned. A startup check marks incomplete runs as failed. Readers never observe a half-written catalogue.

---

### 2. Storage Abstraction: Moving from Local Disk to Cloudflare R2
The backend implements an abstract base class `StorageService` (`app/services/storage/base.py`) with standard async methods: `save_file()`, `read_file()`, `file_exists()`, and `delete_file()`.

To switch from `LocalDiskStorage` to Cloudflare R2:
1. Change **one environment variable**: `STORAGE_BACKEND=r2` in `.env`.
2. Configure standard S3-compatible credentials in `.env`:
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.
3. `R2Storage` (`app/services/storage/r2.py`) initializes a `boto3` S3 client pointed to `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. Uploads stream directly to R2 with `ContentType` headers and public cache-control tags (`public, max-age=31536000, immutable`).
5. Zero business logic or router code changes are required.

---

### 3. Search Implementation, Scaling Limits, and Next Steps
- **Current Implementation**: The backend `/catalog/search` endpoint operates over the cached in-memory representation of the active `catalogue.json`. It executes multi-attribute composite filtering: substring search (`q` matching show titles, episode titles, and categories) alongside strict filters (`category`, `language`, `section`).
- **Where It Stops Working**:
  - **Catalogue Size**: Up to ~10,000 episodes (~15–20 MB JSON), in-memory linear scans take <10ms. At 50,000+ episodes or >500 concurrent requests/sec, Python GIL contention, high memory duplication, and substring regex overhead will introduce latency spikes and CPU saturation.
  - **Relevance & Typo Tolerance**: Substring matching (`icontains`) cannot handle typos, phonetic searching (e.g., "mochi" vs "moci"), or tokenized stemming.
- **Next Steps**:
  1. **Near-Term (10k–100k items)**: Use PostgreSQL Full-Text Search (`tsvector` + `tsquery` with GIN indexes) with trigram matching (`pg_trgm`).
  2. **Enterprise Scale (100k+ items)**: Trigger an event hook on `POST /admin/catalog/publish` to index the generated catalogue into **Typesense** or **Meilisearch**. These provide instant typo tolerance, multi-language tokenization, facet filtering, and sub-5ms search latencies while offloading 100% of search traffic from the transactional database.

---

### 4. Why Serve a Pre-Published Catalogue File Instead of Live DB Queries?
- **Benefits**:
  - **Extreme Read Scalability**: Streaming platforms typically exhibit a 10,000:1 read-to-write ratio. Serving a static `catalogue.json` allows the file to sit at the CDN edge (Cloudflare / Fastly) with a 304 Not Modified cache check. Edge CDNs can serve 100,000 requests/sec with 0% database CPU usage.
  - **Zero Database Degradation**: Spikes in viewer traffic cannot degrade internal CMS editorial work or crash the transactional database.
  - **Deterministic Consistency**: Prevents "pagination drift" where a child browsing shows experiences inconsistent row states while an editor is updating episodes mid-session.
- **Where This Choice Bites**:
  - **Publish Latency**: Changes made in the CMS do not take effect immediately for viewers until an admin explicitly triggers a publish run.
  - **Catalogue Size Growth**: If the catalogue grows to hundreds of megabytes, downloading the entire payload on mobile networks becomes impractical, necessitating split partitioned manifests (e.g., `catalogue-index.json` + `section-<id>.json`).
  - **Personalization Overhead**: A static file cannot serve user-specific rows (e.g., "Continue Watching for Emma"). Personalized features must be overlaid client-side or fetched via separate microservices.

---

### 5. What Was Left Out and Why
1. **Video Transcoding & HLS Packaging**: Enterprise platforms run asynchronous FFmpeg workers to output multi-bitrate HLS/DASH streams with FairPlay/Widevine DRM. Left out to focus on the core CMS publishing, validation, and catalogue ingestion pipeline.
2. **User Watch Progress / Profiles**: Multi-profile sync across household devices was omitted as the specification focused on catalogue discovery and editorial management.
3. **Fine-Grained Role Permissions (RBAC)**: Role validation strictly enforces `editor` (read/write content) and `admin` (publish trigger). Granular permissions (e.g., "Section Approver", "Artwork Reviewer") were omitted to maintain code readability.

---

### 6. AI Tools Used: Where Output Was Accepted vs. Rejected
- **Accepted**:
  - Scaffolding repetitive boilerplate (SQLAlchemy models, Pydantic schemas, and Tailwind layout utilities).
  - Generating initial test fixtures for image aspect ratios and dimensions in `backend/tests/`.
- **Rejected / Corrected**:
  - **In-Place File Overwrite**: Initial AI boilerplate proposed writing directly to `catalogue.json` with `open("catalogue.json", "w")`. Rejected immediately in favor of a true atomic temp-file swap (`os.replace`) with filesystem `fsync`.
  - **Client-Side-Only Role Checks**: AI suggestions initially relied on disabling buttons in the React UI for non-admins. Rejected and supplemented with FastAPI dependency-level role enforcement (`require_role("admin")`) returning HTTP 403 Forbidden.
  - **Search Over DB on Viewer**: Suggested querying the live PostgreSQL database for the viewer search bar. Rejected to adhere to the core design constraint: the viewer UI reads strictly from the published catalogue abstraction.

---

### 7. Health Check & Primary Production Alert
- **Health Check (`GET /health`)**:
  - Validates end-to-end service health by executing a live database ping (`SELECT 1`) and checking storage accessibility.
  - Returns `{"status":"healthy","service":"peblo-tv-mini-api","database":"connected","storage":"ready"}` with HTTP 200 (or HTTP 503 if degraded).
- **Primary Production Alert**:
  - **Alert on**: `PublishJobFailureRate > 0%` OR `PublishBlockerRatioSpike` over a 15-minute window.
  - **Reasoning**: If content editors are unable to publish, new shows and critical corrections cannot reach children. A spike in publish failures points to storage backend outages, network partitions to R2, or unhandled schema anomalies. Alerting on publish failures catches production blockers before they impact the scheduled content calendar.

---

### 8. Breakdown of Time Spent
- **Backend Architecture & Storage Abstraction**: ~3.5 hours (Schema, Alembic, Image PIL validation, Atomic Publish service, R2 interface).
- **Validation Engine & CMS Studio**: ~3.5 hours (TanStack Query integration, image dropzones with dimension checks, Validation Report dashboard).
- **Viewer UI & Netflix/Bedtime UX**: ~3.0 hours (Horizontal row carousels, responsive hero banner, season tabs, trailer modal, audio ambiance).
- **Operability, Testing & CI/CD**: ~2.0 hours (Docker Compose orchestration, GitHub Actions CI workflow, pytest suite).
- **Documentation & Trade-off Analysis**: ~1.0 hour.
- **Total**: ~13.0 hours.

---

## 🔒 Production Secrets Management

In production, secrets (`JWT_SECRET`, database passwords, Cloudflare R2 credentials) are stored in a dedicated secret store (**AWS Secrets Manager**, **Doppler**, or **Cloudflare Secrets**) and injected at runtime via container orchestrators. No secret keys are stored in source control.
