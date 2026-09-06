from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.artwork import ArtworkResponse


class EpisodeBase(BaseModel):
    title: str
    description: Optional[str] = None
    episode_number: int = 1
    content_group: str = Field(..., description="Canonical ID grouping language variants together")
    language: str = Field(..., description="Language code e.g. en, es, hi")
    duration_seconds: int = 0
    status: str = "draft"  # "draft", "published", "archived"
    video_url: Optional[str] = None


class EpisodeCreate(EpisodeBase):
    season_id: int


class EpisodeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    episode_number: Optional[int] = None
    content_group: Optional[str] = None
    language: Optional[str] = None
    duration_seconds: Optional[int] = None
    status: Optional[str] = None
    video_url: Optional[str] = None


class EpisodeResponse(EpisodeBase):
    id: int
    season_id: int
    created_at: datetime
    updated_at: datetime
    artwork: List[ArtworkResponse] = []

    model_config = ConfigDict(from_attributes=True)
