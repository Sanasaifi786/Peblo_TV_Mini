from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id", ondelete="CASCADE"), nullable=False, index=True)
    season_number = Column(Integer, nullable=False, default=1)  # 0 = trailers, 1+ = standard seasons
    title = Column(String(255), nullable=True)  # e.g., "Season 1" or "Trailers & Teasers"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    show = relationship("Show", back_populates="seasons")
    episodes = relationship(
        "Episode",
        back_populates="season",
        cascade="all, delete-orphan",
        order_by="Episode.episode_number"
    )

    def __repr__(self):
        return f"<Season id={self.id} show_id={self.show_id} number={self.season_number}>"
