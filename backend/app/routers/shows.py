from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Show, Season, Episode, User
from app.schemas.show import (
    ShowCreate,
    ShowUpdate,
    ShowResponse,
    ShowDetailResponse,
    ShowListResponse,
)
from app.schemas.season import SeasonCreate, SeasonResponse
from app.auth.roles import require_editor
from app.services.validation_service import ValidationService

router = APIRouter(prefix="/admin/shows", tags=["Shows (Admin/Editor)"])


@router.get("", response_model=ShowListResponse)
def list_shows(
    q: Optional[str] = Query(None, description="Search query across title and description"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (draft, published, archived)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    section: Optional[str] = Query(None, description="Filter by section"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """List shows with search, filters, and pagination."""
    query = db.query(Show)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Show.title.ilike(search_pattern),
                Show.description.ilike(search_pattern)
            )
        )

    if status_filter:
        query = query.filter(Show.status == status_filter)

    if category:
        query = query.filter(Show.category == category)

    if section:
        query = query.filter(Show.section == section)

    total = query.count()
    items = query.order_by(Show.updated_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return ShowListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
def create_show(
    payload: ShowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Create a new show."""
    if payload.status == "published" and (not payload.section or not payload.section.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A show cannot be published without a section assigned."
        )

    show = Show(
        title=payload.title,
        description=payload.description,
        section=payload.section,
        category=payload.category,
        status=payload.status,
    )
    db.add(show)
    db.commit()
    db.refresh(show)
    return show


@router.get("/{show_id}", response_model=ShowDetailResponse)
def get_show(
    show_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Get a show by ID with all seasons and episodes."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Show not found")
    return show


@router.patch("/{show_id}", response_model=ShowResponse)
def update_show(
    show_id: int,
    payload: ShowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Update a show's metadata or status."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Show not found")

    update_data = payload.model_dump(exclude_unset=True)

    target_status = update_data.get("status", show.status)
    target_section = update_data.get("section", show.section)

    if target_status == "published":
        if not target_section or not target_section.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A show cannot be moved to 'published' without a section."
            )

    for field, val in update_data.items():
        setattr(show, field, val)

    db.commit()
    db.refresh(show)
    return show


@router.delete("/{show_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_show(
    show_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Delete a show and its associated seasons and episodes."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Show not found")
    db.delete(show)
    db.commit()
    return None


@router.post("/{show_id}/seasons", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED)
def add_season_to_show(
    show_id: int,
    payload: SeasonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Add a season to a show (season_number 0 = trailers)."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Show not found")

    existing_season = db.query(Season).filter(
        Season.show_id == show_id,
        Season.season_number == payload.season_number
    ).first()
    if existing_season:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Season {payload.season_number} already exists for this show."
        )

    title = payload.title or ("Trailers & Teasers" if payload.season_number == 0 else f"Season {payload.season_number}")
    season = Season(
        show_id=show_id,
        season_number=payload.season_number,
        title=title
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    return season
