from app.config import settings
from app.services.storage.base import StorageService
from app.services.storage.local_disk import LocalDiskStorage
from app.services.storage.r2 import R2Storage

_storage_instance: StorageService = None


def get_storage_service() -> StorageService:
    global _storage_instance
    if _storage_instance is None:
        if settings.STORAGE_BACKEND == "r2":
            _storage_instance = R2Storage()
        else:
            _storage_instance = LocalDiskStorage()
    return _storage_instance
