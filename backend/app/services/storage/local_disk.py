import os
import tempfile
from pathlib import Path
from typing import Optional
from app.services.storage.base import StorageService
from app.config import settings


class LocalDiskStorage(StorageService):
    def __init__(self, base_dir: str = None, base_url: str = None):
        self.base_dir = Path(base_dir or settings.STORAGE_LOCAL_PATH).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.base_url = (base_url or settings.STORAGE_BASE_URL).rstrip("/")

    def _get_abs_path(self, rel_path: str) -> Path:
        clean_rel = rel_path.lstrip("/\\")
        return self.base_dir / clean_rel

    def save_file(self, file_data: bytes, destination_rel_path: str) -> str:
        target_path = self._get_abs_path(destination_rel_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)

        with open(target_path, "wb") as f:
            f.write(file_data)

        return self.get_url(destination_rel_path)

    def atomic_write(self, content: str, filename: str) -> str:
        target_path = self._get_abs_path(filename)
        target_path.parent.mkdir(parents=True, exist_ok=True)

        # Write to temporary file in the same directory to guarantee atomic rename
        temp_dir = target_path.parent
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=temp_dir,
            delete=False,
            prefix="tmp_publish_",
            suffix=".json"
        ) as tmp:
            tmp.write(content)
            tmp.flush()
            os.fsync(tmp.fileno())
            temp_name = tmp.name

        # Atomically swap temp file to target path
        os.replace(temp_name, target_path)
        return self.get_url(filename)

    def get_file(self, filename: str) -> Optional[bytes]:
        target_path = self._get_abs_path(filename)
        if not target_path.exists() or not target_path.is_file():
            return None
        with open(target_path, "rb") as f:
            return f.read()

    def delete_file(self, destination_rel_path: str) -> bool:
        target_path = self._get_abs_path(destination_rel_path)
        if target_path.exists() and target_path.is_file():
            target_path.unlink()
            return True
        return False

    def get_url(self, destination_rel_path: str) -> str:
        clean_rel = destination_rel_path.lstrip("/\\").replace("\\", "/")
        # If running via frontend / backend relative URL, /storage/... is mounted
        return f"/storage/{clean_rel}"
