from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    episode_number = Column(Integer, nullable=False, default=1)
    content_group = Column(String(100), nullable=False, index=True)  # groups language dubs/variants together
    language = Column(String(10), nullable=False, default="en")      # e.g., "en", "es", "hi", "fr"
    duration_seconds = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="draft", index=True)  # "draft", "published", "archived"
    video_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("content_group", "language", name="uq_content_group_language"),
    )

    season = relationship("Season", back_populates="episodes")
    artwork = relationship(
        "Artwork",
        back_populates="episode",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Episode id={self.id} title='{self.title}' group={self.content_group} lang={self.language}>"
