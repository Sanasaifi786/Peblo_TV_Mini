from abc import ABC, abstractmethod
from typing import Optional, BinaryIO


class StorageService(ABC):
    """Abstract interface for object storage (Local disk, MinIO, or Cloudflare R2)."""

    @abstractmethod
    def save_file(self, file_data: bytes, destination_rel_path: str) -> str:
        """Save raw bytes to a relative path and return its public/accessible URL."""
        pass

    @abstractmethod
    def atomic_write(self, content: str, filename: str) -> str:
        """Atomically write text/json content to storage (via tempfile + swap)."""
        pass

    @abstractmethod
    def get_file(self, filename: str) -> Optional[bytes]:
        """Retrieve file bytes by filename/relative path."""
        pass

    @abstractmethod
    def delete_file(self, destination_rel_path: str) -> bool:
        """Delete a file from storage."""
        pass

    @abstractmethod
    def get_url(self, destination_rel_path: str) -> str:
        """Get the accessible URL for a given relative path."""
        pass
