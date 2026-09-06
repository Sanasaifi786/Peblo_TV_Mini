import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.services.storage import get_storage_service
from app.routers import (
    auth_router,
    shows_router,
    episodes_router,
    artwork_router,
    admin_router,
    catalog_router
)

app = FastAPI(
    title="Peblo TV Mini API",
    description="FastAPI backend for Peblo TV Mini streaming platform and CMS.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins() or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage directory for artwork and files
storage_path = Path(settings.STORAGE_LOCAL_PATH).resolve()
storage_path.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(storage_path)), name="storage")

# Include Routers
app.include_router(auth_router)
app.include_router(shows_router)
app.include_router(episodes_router)
app.include_router(artwork_router)
app.include_router(admin_router)
app.include_router(catalog_router)


from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db

@app.get("/health", tags=["Ops"])
def health(db: Session = Depends(get_db)):
    """Liveness / Readiness health check probe with database & storage verification."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unreachable ({e})"

    storage = get_storage_service()
    storage_ok = storage.base_dir.exists() if hasattr(storage, "base_dir") else True
    is_healthy = db_status == "connected" and storage_ok

    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": "peblo-tv-mini-api",
        "version": "1.0.0",
        "database": db_status,
        "storage": "ready" if storage_ok else "degraded",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
