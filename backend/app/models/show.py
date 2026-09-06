from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    section = Column(String(100), nullable=True, index=True)  # e.g., "Trending Now", "Peblo Originals"
    category = Column(String(100), nullable=True, index=True)  # e.g., "Sci-Fi", "Drama", "Action"
    status = Column(String(50), nullable=False, default="draft", index=True)  # "draft", "published", "archived"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    seasons = relationship(
        "Season",
        back_populates="show",
        cascade="all, delete-orphan",
        order_by="Season.season_number"
    )

    def __repr__(self):
        return f"<Show id={self.id} title='{self.title}' status='{self.status}'>"
