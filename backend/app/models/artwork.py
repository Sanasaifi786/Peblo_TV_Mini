from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Artwork(Base):
    __tablename__ = "artwork"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # "poster", "banner", "thumbnail"
    url = Column(String(500), nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    episode = relationship("Episode", back_populates="artwork")

    def __repr__(self):
        return f"<Artwork id={self.id} episode_id={self.episode_id} type={self.type} {self.width}x{self.height}>"
