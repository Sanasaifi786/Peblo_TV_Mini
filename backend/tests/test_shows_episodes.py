from app.models import User, Show, Season, Episode, Artwork


def test_unique_constraint_content_group_language(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    show = Show(title="Test Show", section="Trending")
    db_session.add(show)
    db_session.flush()
    season = Season(show_id=show.id, season_number=1)
    db_session.add(season)
    db_session.flush()

    # Create first episode
    ep1 = Episode(
        season_id=season.id,
        title="Ep 1 English",
        content_group="cg-unique-test",
        language="en",
        duration_seconds=500
    )
    db_session.add(ep1)
    db_session.commit()

    # Try creating second episode with SAME content_group and language via API
    payload = {
        "season_id": season.id,
        "title": "Duplicate Group Ep",
        "content_group": "cg-unique-test",
        "language": "en",
        "duration_seconds": 600,
        "status": "draft"
    }
    response = client.post("/admin/episodes", json=payload, headers=editor_headers)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

    # But creating same content_group with DIFFERENT language (es) MUST succeed!
    payload["language"] = "es"
    payload["title"] = "Ep 1 Spanish"
    response2 = client.post("/admin/episodes", json=payload, headers=editor_headers)
    assert response2.status_code == 201
    assert response2.json()["language"] == "es"


def test_cannot_publish_show_without_section(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    db_session.commit()

    # Attempt to create published show with section=None
    payload = {
        "title": "Unsectional Show",
        "section": None,
        "category": "Drama",
        "status": "published"
    }
    response = client.post("/admin/shows", json=payload, headers=editor_headers)
    assert response.status_code == 400
    assert "section" in response.json()["detail"]


def test_cannot_publish_episode_without_artwork_or_duration(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    show = Show(title="Test Show", section="Trending")
    db_session.add(show)
    db_session.flush()
    season = Season(show_id=show.id, season_number=1)
    db_session.add(season)
    db_session.flush()
    ep = Episode(
        season_id=season.id,
        title="Draft Ep",
        content_group="cg-validation",
        language="en",
        duration_seconds=0,
        status="draft"
    )
    db_session.add(ep)
    db_session.commit()

    # Attempt to patch status to published with duration=0
    patch_resp = client.patch(
        f"/admin/episodes/{ep.id}",
        json={"status": "published"},
        headers=editor_headers
    )
    assert patch_resp.status_code == 400
    assert "duration" in patch_resp.json()["detail"]

    # Now set duration, but still no artwork
    patch_resp2 = client.patch(
        f"/admin/episodes/{ep.id}",
        json={"status": "published", "duration_seconds": 1200},
        headers=editor_headers
    )
    assert patch_resp2.status_code == 400
    assert "artwork" in patch_resp2.json()["detail"]
