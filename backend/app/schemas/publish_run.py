from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PublishRunResponse(BaseModel):
    id: int
    triggered_by: Optional[int] = None
    started_at: datetime
    finished_at: Optional[datetime] = None
    outcome: str
    show_count: int
    episode_count: int
    error_message: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
