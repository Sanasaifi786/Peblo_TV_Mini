from app.routers.auth import router as auth_router
from app.routers.shows import router as shows_router
from app.routers.episodes import router as episodes_router
from app.routers.artwork import router as artwork_router
from app.routers.admin import router as admin_router
from app.routers.catalog import router as catalog_router

__all__ = [
    "auth_router",
    "shows_router",
    "episodes_router",
    "artwork_router",
    "admin_router",
    "catalog_router"
]
