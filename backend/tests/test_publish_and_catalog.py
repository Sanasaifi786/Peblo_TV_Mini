import json
from app.models import User, Show, Season, Episode, Artwork


def test_editor_cannot_publish_admin_required(client, db_session, editor_headers):
    user = User(email="editor@test.com", hashed_password="pw", role="editor")
    db_session.add(user)
    db_session.commit()

    resp = client.post("/admin/catalog/publish", headers=editor_headers)
    assert resp.status_code == 403
    assert "admin" in resp.json()["detail"].lower()


def test_publish_workflow_and_catalog_search(client, db_session, admin_headers):
    # Setup admin user
    admin = User(email="admin@test.com", hashed_password="pw", role="admin")
    db_session.add(admin)

    # Setup valid published show
    show = Show(
        title="Interstellar Voyage",
        description="Epic sci-fi adventure through black holes.",
        section="Trending Now",
        category="Sci-Fi",
        status="published"
    )
    db_session.add(show)
    db_session.flush()

    # Season 0 (Trailers)
    season0 = Season(show_id=show.id, season_number=0, title="Teasers")
    db_session.add(season0)
    db_session.flush()
    trailer_ep = Episode(
        season_id=season0.id,
        title="Official Teaser",
        content_group="cg-voyage-teaser",
        language="en",
        duration_seconds=90,
        status="published"
    )
    db_session.add(trailer_ep)
    db_session.flush()
    art0 = Artwork(
        episode_id=trailer_ep.id,
        type="thumbnail",
        url="/storage/artwork/teaser_thumb.webp",
        width=640,
        height=360
    )
    db_session.add(art0)

    # Season 1
    season1 = Season(show_id=show.id, season_number=1, title="Season 1")
    db_session.add(season1)
    db_session.flush()

    # Ep 1 English
    ep1_en = Episode(
        season_id=season1.id,
        title="Departure Earth",
        description="The crew embarks on the endurance mission.",
        episode_number=1,
        content_group="cg-voyage-s01e01",
        language="en",
        duration_seconds=3600,
        status="published"
    )
    db_session.add(ep1_en)
    db_session.flush()
    art_poster = Artwork(
        episode_id=ep1_en.id,
        type="poster",
        url="/storage/artwork/voyage_poster.webp",
        width=400,
        height=600
    )
    art_banner = Artwork(
        episode_id=ep1_en.id,
        type="banner",
        url="/storage/artwork/voyage_banner.webp",
        width=1280,
        height=720
    )
    art_thumb = Artwork(
        episode_id=ep1_en.id,
        type="thumbnail",
        url="/storage/artwork/voyage_thumb.webp",
        width=640,
        height=360
    )
    db_session.add_all([art_poster, art_banner, art_thumb])

    # Ep 1 Spanish dub under SAME content_group
    ep1_es = Episode(
        season_id=season1.id,
        title="Partida de la Tierra",
        description="La tripulación se embarca.",
        episode_number=1,
        content_group="cg-voyage-s01e01",
        language="es",
        duration_seconds=3600,
        status="published"
    )
    db_session.add(ep1_es)
    db_session.flush()
    art_es_thumb = Artwork(
        episode_id=ep1_es.id,
        type="thumbnail",
        url="/storage/artwork/voyage_es_thumb.webp",
        width=640,
        height=360
    )
    db_session.add(art_es_thumb)
    db_session.commit()

    # Step 1: Check validation report
    val_resp = client.get("/admin/validation-report", headers=admin_headers)
    assert val_resp.status_code == 200
    assert val_resp.json()["can_publish"] is True

    # Step 2: Trigger publish as Admin
    pub_resp = client.post("/admin/catalog/publish", headers=admin_headers)
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()
    assert pub_data["success"] is True
    assert pub_data["show_count"] == 1
    assert pub_data["episode_count"] == 3  # trailer + ep1_en + ep1_es

    # Step 3: Get public catalogue
    cat_resp = client.get("/catalog")
    assert cat_resp.status_code == 200
    cat_json = cat_resp.json()
    assert len(cat_json["shows"]) == 1
    published_show = cat_json["shows"][0]

    # Verify Season 0 is surfaced in trailers
    assert len(published_show["trailers"]) == 1
    assert published_show["trailers"][0]["content_group"] == "cg-voyage-teaser"

    # Verify Season 1 has collapsed episode with languages ["en", "es"]
    assert len(published_show["seasons"]) == 1
    s1 = published_show["seasons"][0]
    assert len(s1["episodes"]) == 1  # Collapsed into 1 entry!
    collapsed_ep = s1["episodes"][0]
    assert collapsed_ep["content_group"] == "cg-voyage-s01e01"
    assert "en" in collapsed_ep["languages"]
    assert "es" in collapsed_ep["languages"]
    assert len(collapsed_ep["variants"]) == 2

    # Step 4: Test public catalogue search composition
    # Match query 'Voyage' and language 'es' and category 'Sci-Fi'
    search_resp = client.get("/catalog/search?q=Voyage&language=es&category=Sci-Fi&section=Trending%20Now")
    assert search_resp.status_code == 200
    assert search_resp.json()["total"] == 1

    # Search with non-matching language 'fr'
    search_resp2 = client.get("/catalog/search?language=fr")
    assert search_resp2.status_code == 200
    assert search_resp2.json()["total"] == 0
