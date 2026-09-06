from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PublishRun(Base):
    __tablename__ = "publish_runs"

    id = Column(Integer, primary_key=True, index=True)
    triggered_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    finished_at = Column(DateTime, nullable=True)
    outcome = Column(String(50), nullable=False)  # "success", "failed"
    show_count = Column(Integer, nullable=False, default=0)
    episode_count = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)

    user = relationship("User", back_populates="publish_runs")

    def __repr__(self):
        return f"<PublishRun id={self.id} outcome={self.outcome} shows={self.show_count} episodes={self.episode_count}>"
