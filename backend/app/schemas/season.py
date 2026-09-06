from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.episode import EpisodeResponse


class SeasonBase(BaseModel):
    season_number: int = 1  # 0 = trailers
    title: Optional[str] = None


class SeasonCreate(SeasonBase):
    pass


class SeasonResponse(SeasonBase):
    id: int
    show_id: int
    created_at: datetime
    episodes: List[EpisodeResponse] = []

    model_config = ConfigDict(from_attributes=True)
