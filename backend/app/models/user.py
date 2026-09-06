from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="editor")  # "editor" or "admin"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    publish_runs = relationship("PublishRun", back_populates="user", cascade="all")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
