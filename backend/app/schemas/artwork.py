from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ArtworkBase(BaseModel):
    type: str = Field(..., description="'poster', 'banner', or 'thumbnail'")
    url: str
    width: int
    height: int
    file_size_bytes: int = 0


class ArtworkCreate(ArtworkBase):
    episode_id: int


class ArtworkResponse(ArtworkBase):
    id: int
    episode_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
