from typing import List, Dict, Optional, Any
from pydantic import BaseModel


class ArtworkDTO(BaseModel):
    type: str  # "poster", "banner", "thumbnail"
    url: str
    width: int
    height: int


class EpisodeLanguageVariantDTO(BaseModel):
    language: str
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    artwork: List[ArtworkDTO] = []


class CollapsedEpisodeDTO(BaseModel):
    content_group: str
    episode_number: int
    title: str
    description: Optional[str] = None
    duration_seconds: int
    languages: List[str]
    default_language: str
    artwork: Dict[str, str] = {}  # type -> url mapping for easy UI consumption
    variants: List[EpisodeLanguageVariantDTO] = []


class CatalogueSeasonDTO(BaseModel):
    season_number: int
    title: Optional[str] = None
    episodes: List[CollapsedEpisodeDTO] = []


class CatalogueShowDTO(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    section: str
    category: str
    poster_url: Optional[str] = None
    banner_url: Optional[str] = None
    available_languages: List[str] = []
    seasons: List[CatalogueSeasonDTO] = []
    trailers: List[CollapsedEpisodeDTO] = []  # Season 0 episodes surfaced separately


class CatalogueFileDTO(BaseModel):
    version: str = "1.0"
    generated_at: str
    sections: List[str] = []
    categories: List[str] = []
    languages: List[str] = []
    shows: List[CatalogueShowDTO] = []


class CatalogSearchResultDTO(BaseModel):
    total: int
    query: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    section: Optional[str] = None
    shows: List[CatalogueShowDTO] = []
