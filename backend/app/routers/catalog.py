import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Response, status
from app.services.storage import get_storage_service
from app.schemas.catalog import CatalogSearchResultDTO

router = APIRouter(prefix="/catalog", tags=["Public Catalogue"])


def _load_published_catalogue() -> dict:
    storage = get_storage_service()
    raw_data = storage.get_file("catalogue.json")
    if not raw_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catalogue has not been published yet. Please run publish from the CMS dashboard."
        )
    try:
        return json.loads(raw_data.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse published catalogue file."
        )


@router.get("", response_class=Response)
def get_catalogue():
    """Serves the raw published catalogue.json file directly from storage."""
    storage = get_storage_service()
    raw_data = storage.get_file("catalogue.json")
    if not raw_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catalogue has not been published yet. Please run publish from the CMS dashboard."
        )
    return Response(content=raw_data, media_type="application/json")


@router.get("/search", response_model=CatalogSearchResultDTO)
def search_catalogue(
    q: Optional[str] = Query(None, description="Search term in title, description, or episode titles"),
    category: Optional[str] = Query(None, description="Filter by category (e.g. Sci-Fi, Action, Drama)"),
    language: Optional[str] = Query(None, description="Filter by supported language code (e.g. en, es, hi, fr)"),
    section: Optional[str] = Query(None, description="Filter by section (e.g. Trending Now, Peblo Originals)"),
):
    """
    Search and filter the published catalogue.
    Query params compose together: q, category, language, section.
    """
    catalogue = _load_published_catalogue()
    shows = catalogue.get("shows", [])

    filtered_shows = []
    clean_q = q.lower().strip() if q else None
    clean_cat = category.lower().strip() if category else None
    clean_lang = language.lower().strip() if language else None
    clean_sec = section.lower().strip() if section else None

    for show in shows:
        # 1. Section match
        if clean_sec and (not show.get("section") or show["section"].lower() != clean_sec):
            continue

        # 2. Category match
        if clean_cat and (not show.get("category") or show["category"].lower() != clean_cat):
            continue

        # 3. Language match
        if clean_lang:
            avail_langs = [l.lower() for l in show.get("available_languages", [])]
            if clean_lang not in avail_langs:
                continue

        # 4. Text search query match (title, description, episode titles)
        if clean_q:
            show_title = (show.get("title") or "").lower()
            show_desc = (show.get("description") or "").lower()

            match_text = clean_q in show_title or clean_q in show_desc

            # Also check episode titles
            if not match_text:
                for season in show.get("seasons", []):
                    for ep in season.get("episodes", []):
                        if clean_q in (ep.get("title") or "").lower():
                            match_text = True
                            break
                    if match_text:
                        break

            # Also check trailers
            if not match_text:
                for trailer in show.get("trailers", []):
                    if clean_q in (trailer.get("title") or "").lower():
                        match_text = True
                        break

            if not match_text:
                continue

        filtered_shows.append(show)

    return CatalogSearchResultDTO(
        total=len(filtered_shows),
        query=q,
        category=category,
        language=language,
        section=section,
        shows=filtered_shows
    )
