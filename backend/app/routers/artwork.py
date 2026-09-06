import io
import uuid
from typing import Optional
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Episode, Artwork, User
from app.schemas.artwork import ArtworkResponse
from app.auth.roles import require_editor
from app.services.storage import get_storage_service

router = APIRouter(prefix="/admin", tags=["Artwork (Admin/Editor)"])

MAX_FILE_SIZE_BYTES = 200 * 1024  # 200 KB ceiling


def validate_image_spec(image_bytes: bytes, artwork_type: str):
    """
    Validates:
    - 200KB ceiling
    - Image decoding
    - Dimensions and aspect ratio per type
    Returns (width, height, format_name) or raises HTTPException with editor-readable message.
    """
    file_size = len(image_bytes)
    if file_size > MAX_FILE_SIZE_BYTES:
        kb_size = file_size / 1024.0
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Artwork exceeds 200 KB limit. Your file is {kb_size:.1f} KB. Please compress or resize the image before uploading."
        )

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        # Re-open for size read after verify
        img = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid or readable image. Supported formats: WebP, PNG, JPEG."
        )

    width, height = img.size
    if height == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image has invalid zero height.")

    ratio = width / height
    clean_type = artwork_type.lower().strip()

    if clean_type == "poster":
        # Target ~2:3 (0.667), allowed tolerance [0.60, 0.75]
        if not (0.60 <= ratio <= 0.75):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aspect ratio for poster ({width}x{height}, ratio {ratio:.2f}). Posters must follow a 2:3 vertical aspect ratio (e.g. 400x600 or 600x900)."
            )
        if width < 300 or height < 450:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Poster dimensions ({width}x{height}) are too small. Minimum required is 300x450."
            )

    elif clean_type == "banner":
        # Target ~16:9 (1.778), allowed tolerance [1.60, 1.95]
        if not (1.60 <= ratio <= 1.95):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aspect ratio for banner ({width}x{height}, ratio {ratio:.2f}). Banners must follow a 16:9 widescreen ratio (e.g. 1280x720 or 1920x1080)."
            )
        if width < 640 or height < 360:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Banner dimensions ({width}x{height}) are too small. Minimum required is 640x360."
            )

    elif clean_type == "thumbnail":
        # Target ~16:9 (1.778), allowed tolerance [1.60, 1.95]
        if not (1.60 <= ratio <= 1.95):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aspect ratio for thumbnail ({width}x{height}, ratio {ratio:.2f}). Thumbnails must follow a 16:9 landscape ratio (e.g. 640x360)."
            )
        if width < 320 or height < 180:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Thumbnail dimensions ({width}x{height}) are too small. Minimum required is 320x180."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported artwork type '{artwork_type}'. Valid types are: poster, banner, thumbnail."
        )

    img_format = img.format.lower() if img.format else "webp"
    return width, height, img_format


@router.post("/episodes/{episode_id}/artwork", response_model=ArtworkResponse, status_code=status.HTTP_201_CREATED)
async def upload_artwork(
    episode_id: int,
    type: str = Form(..., description="'poster', 'banner', or 'thumbnail'"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """
    Upload poster/banner/thumbnail for an episode.
    Validates:
    - 200KB max size
    - Image dimension and aspect ratio
    - Returns editor-friendly error on rejection.
    """
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")

    file_bytes = await file.read()
    width, height, ext = validate_image_spec(file_bytes, type)

    # Save to storage
    storage = get_storage_service()
    clean_type = type.lower().strip()
    file_id = uuid.uuid4().hex[:10]
    filename = f"artwork/ep_{episode_id}_{clean_type}_{file_id}.{ext}"

    url = storage.save_file(file_bytes, filename)

    # Check if artwork of this type already exists for this episode
    existing_art = db.query(Artwork).filter(
        Artwork.episode_id == episode_id,
        Artwork.type == clean_type
    ).first()

    if existing_art:
        existing_art.url = url
        existing_art.width = width
        existing_art.height = height
        existing_art.file_size_bytes = len(file_bytes)
        db.commit()
        db.refresh(existing_art)
        return existing_art
    else:
        new_art = Artwork(
            episode_id=episode_id,
            type=clean_type,
            url=url,
            width=width,
            height=height,
            file_size_bytes=len(file_bytes)
        )
        db.add(new_art)
        db.commit()
        db.refresh(new_art)
        return new_art


@router.delete("/artwork/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_artwork(
    artwork_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    """Delete an artwork record and its storage file."""
    art = db.query(Artwork).filter(Artwork.id == artwork_id).first()
    if not art:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    storage = get_storage_service()
    storage.delete_file(art.url)

    db.delete(art)
    db.commit()
    return None
