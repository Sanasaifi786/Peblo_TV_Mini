from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PublishRun, User
from app.schemas.publish_run import PublishRunResponse
from app.schemas.validation import ValidationReportResponse
from app.auth.roles import require_editor, require_admin
from app.services.validation_service import ValidationService
from app.services.publish_service import PublishService

router = APIRouter(prefix="/admin", tags=["Admin & Publishing"])


@router.get("/validation-report", response_model=ValidationReportResponse)
def get_validation_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """
    Returns everything currently blocking catalogue publish,
    grouped by issue type (missing_section, missing_artwork, missing_duration, etc.).
    """
    return ValidationService.validate_for_publish(db)


@router.post("/catalog/publish")
def publish_catalog(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Atomically builds and publishes catalogue.json to storage.
    Enforces admin-only permission.
    Only published shows and episodes are included.
    Language variants are collapsed by content_group.
    """
    result = PublishService.publish_catalogue(db, user_id=current_user.id)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result
        )
    return result


@router.get("/publish-runs", response_model=List[PublishRunResponse])
def get_publish_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Returns the history of all publish attempts."""
    runs = db.query(PublishRun).order_by(PublishRun.started_at.desc()).limit(50).all()
    results = []
    for r in runs:
        results.append(
            PublishRunResponse(
                id=r.id,
                triggered_by=r.triggered_by,
                started_at=r.started_at,
                finished_at=r.finished_at,
                outcome=r.outcome,
                show_count=r.show_count,
                episode_count=r.episode_count,
                error_message=r.error_message,
                user_email=r.user.email if r.user else "System"
            )
        )
    return results
