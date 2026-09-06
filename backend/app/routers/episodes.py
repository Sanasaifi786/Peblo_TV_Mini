from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models import Episode, Season, Artwork, User
from app.schemas.episode import EpisodeCreate, EpisodeUpdate, EpisodeResponse
from app.auth.roles import require_editor
from app.services.validation_service import ValidationService

router = APIRouter(prefix="/admin/episodes", tags=["Episodes (Admin/Editor)"])


@router.post("", response_model=EpisodeResponse, status_code=status.HTTP_201_CREATED)
def create_episode(
    payload: EpisodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Create a new episode under a season with unique (content_group, language)."""
    # Verify season exists
    season = db.query(Season).filter(Season.id == payload.season_id).first()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found")

    # Check unique constraint on (content_group, language)
    conflict = db.query(Episode).filter(
        Episode.content_group == payload.content_group,
        Episode.language == payload.language
    ).first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An episode with content_group '{payload.content_group}' and language '{payload.language}' already exists (Episode ID {conflict.id})."
        )

    # If attempting to create directly as published
    if payload.status == "published":
        if payload.duration_seconds <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An episode cannot be created with 'published' status without a duration > 0."
            )

    episode = Episode(
        season_id=payload.season_id,
        title=payload.title,
        description=payload.description,
        episode_number=payload.episode_number,
        content_group=payload.content_group,
        language=payload.language,
        duration_seconds=payload.duration_seconds,
        status=payload.status,
        video_url=payload.video_url,
    )

    try:
        db.add(episode)
        db.commit()
        db.refresh(episode)
        return episode
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unique constraint violated: (content_group='{payload.content_group}', language='{payload.language}') already exists."
        )


@router.get("/{episode_id}", response_model=EpisodeResponse)
def get_episode(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Get episode details with attached artwork."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
    return episode


@router.patch("/{episode_id}", response_model=EpisodeResponse)
def update_episode(
    episode_id: int,
    payload: EpisodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Update an episode's metadata, duration, or publishing status."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Check unique constraint if content_group or language is changing
    new_cg = update_data.get("content_group", episode.content_group)
    new_lang = update_data.get("language", episode.language)
    if new_cg != episode.content_group or new_lang != episode.language:
        conflict = db.query(Episode).filter(
            Episode.content_group == new_cg,
            Episode.language == new_lang,
            Episode.id != episode.id
        ).first()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An episode with content_group '{new_cg}' and language '{new_lang}' already exists (ID {conflict.id})."
            )

    # Check publishing rule: duration > 0 and artwork present
    target_status = update_data.get("status", episode.status)
    target_duration = update_data.get("duration_seconds", episode.duration_seconds)

    if target_status == "published":
        if target_duration <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An episode cannot be moved to 'published' without a duration greater than 0."
            )
        if len(episode.artwork) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An episode cannot be moved to 'published' without at least one uploaded artwork (thumbnail/poster/banner)."
            )

    for field, val in update_data.items():
        setattr(episode, field, val)

    try:
        db.commit()
        db.refresh(episode)
        return episode
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Constraint violation updating episode."
        )


@router.delete("/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Delete an episode and its artwork."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
    db.delete(episode)
    db.commit()
    return None
