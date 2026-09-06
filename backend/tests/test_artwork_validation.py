import io
from PIL import Image
from app.models import User, Show, Season, Episode


def create_sample_image_bytes(width: int, height: int, format: str = "WEBP") -> bytes:
    img = Image.new("RGB", (width, height), color=(50, 100, 150))
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    return buffer.getvalue()


def test_artwork_rejected_exceeds_200kb(client, db_session, editor_headers):
    # Setup user & episode
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    show = Show(title="Test Show", section="Trending Now")
    db_session.add(show)
    db_session.flush()
    season = Season(show_id=show.id, season_number=1)
    db_session.add(season)
    db_session.flush()
    episode = Episode(
        season_id=season.id,
        title="Ep 1",
        content_group="cg-1",
        language="en",
        duration_seconds=100
    )
    db_session.add(episode)
    db_session.commit()

    # Generate oversized payload (> 200 KB)
    # Create large uncompressed image
    img = Image.new("RGB", (2000, 3000), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="PNG", compress_level=0)
    oversized_bytes = buf.getvalue()
    assert len(oversized_bytes) > 200 * 1024

    response = client.post(
        f"/admin/episodes/{episode.id}/artwork",
        headers=editor_headers,
        data={"type": "poster"},
        files={"file": ("poster.png", oversized_bytes, "image/png")}
    )
    assert response.status_code == 400
    assert "exceeds 200 KB" in response.json()["detail"]


def test_artwork_rejected_wrong_aspect_ratio(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    show = Show(title="Test Show", section="Trending Now")
    db_session.add(show)
    db_session.flush()
    season = Season(show_id=show.id, season_number=1)
    db_session.add(season)
    db_session.flush()
    episode = Episode(
        season_id=season.id,
        title="Ep 1",
        content_group="cg-2",
        language="en",
        duration_seconds=100
    )
    db_session.add(episode)
    db_session.commit()

    # Upload landscape image (16:9) to poster slot (which requires 2:3)
    landscape_bytes = create_sample_image_bytes(1280, 720, "WEBP")
    response = client.post(
        f"/admin/episodes/{episode.id}/artwork",
        headers=editor_headers,
        data={"type": "poster"},
        files={"file": ("wrong_ratio.webp", landscape_bytes, "image/webp")}
    )
    assert response.status_code == 400
    assert "Invalid aspect ratio for poster" in response.json()["detail"]


def test_artwork_accepted_valid_specs(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    show = Show(title="Test Show", section="Trending Now")
    db_session.add(show)
    db_session.flush()
    season = Season(show_id=show.id, season_number=1)
    db_session.add(season)
    db_session.flush()
    episode = Episode(
        season_id=season.id,
        title="Ep 1",
        content_group="cg-3",
        language="en",
        duration_seconds=100
    )
    db_session.add(episode)
    db_session.commit()

    # Valid thumbnail: 640x360 (16:9), under 200KB
    thumb_bytes = create_sample_image_bytes(640, 360, "WEBP")
    assert len(thumb_bytes) < 200 * 1024

    response = client.post(
        f"/admin/episodes/{episode.id}/artwork",
        headers=editor_headers,
        data={"type": "thumbnail"},
        files={"file": ("thumb.webp", thumb_bytes, "image/webp")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "thumbnail"
    assert data["width"] == 640
    assert data["height"] == 360
    assert "storage" in data["url"]
