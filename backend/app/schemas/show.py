from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.season import SeasonResponse


class ShowBase(BaseModel):
    title: str
    description: Optional[str] = None
    section: Optional[str] = None
    category: Optional[str] = None
    status: str = "draft"  # "draft", "published", "archived"


class ShowCreate(ShowBase):
    pass


class ShowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    section: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class ShowResponse(ShowBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShowDetailResponse(ShowResponse):
    seasons: List[SeasonResponse] = []


class ShowListResponse(BaseModel):
    items: List[ShowResponse]
    total: int
    page: int
    page_size: int
