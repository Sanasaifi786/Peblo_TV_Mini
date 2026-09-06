import os
import sys
import json
import bcrypt
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Add backend directory to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.database import SessionLocal, engine, Base
from app.models import User, Show, Season, Episode, Artwork
from app.config import settings


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def generate_placeholder_image(filepath: Path, width: int, height: int, title: str, color_start: tuple, color_end: tuple):
    """Generate sleek gradient placeholder images for demo seeding."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    if filepath.exists():
        return

    # Create base image
    base = Image.new("RGB", (width, height), color_start)
    draw = ImageDraw.Draw(base)

    # Vertical gradient
    for y in range(height):
        r = int(color_start[0] + (color_end[0] - color_start[0]) * (y / height))
        g = int(color_start[1] + (color_end[1] - color_start[1]) * (y / height))
        b = int(color_start[2] + (color_end[2] - color_start[2]) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add overlay text
    text = f"{title}\n{width}x{height}"
    # Draw simple centered rectangle backdrop
    cx, cy = width // 2, height // 2
    box_w, box_h = min(width - 40, 300), 80
    draw.rectangle(
        [(cx - box_w // 2, cy - box_h // 2), (cx + box_w // 2, cy + box_h // 2)],
        fill=(10, 15, 25, 200),
        outline=(230, 45, 60),
        width=2
    )
    draw.text((cx, cy), text, fill=(240, 240, 250), anchor="mm")

    # Save as WebP to stay well under the 200KB limit
    base.save(filepath, "WEBP", quality=85)


def generate_seed_artworks(storage_path: Path):
    """Generate all referenced demo artworks."""
    artworks_dir = storage_path / "artwork"
    artworks_dir.mkdir(parents=True, exist_ok=True)

    items = [
        # Aethelgard
        ("aethelgard_poster.webp", 400, 600, "Aethelgard Poster", (30, 20, 60), (10, 5, 20)),
        ("aethelgard_banner.webp", 1280, 720, "Aethelgard Banner", (50, 20, 80), (15, 10, 30)),
        ("aethelgard_teaser_thumb.webp", 640, 360, "Aethelgard Teaser", (40, 25, 70), (10, 5, 25)),
        ("aethelgard_s01e01_thumb.webp", 640, 360, "Aethelgard Ep 1", (35, 30, 75), (12, 8, 28)),
        ("aethelgard_s01e02_thumb.webp", 640, 360, "Aethelgard Ep 2", (25, 35, 65), (8, 12, 30)),
        # Cyberpulse
        ("cyberpulse_poster.webp", 400, 600, "Cyber Pulse Poster", (10, 50, 70), (5, 15, 30)),
        ("cyberpulse_banner.webp", 1280, 720, "Cyber Pulse Banner", (15, 70, 90), (5, 20, 35)),
        ("cyberpulse_thumb.webp", 640, 360, "Cyber Pulse Teaser", (20, 60, 80), (8, 20, 40)),
        ("cyberpulse_s01e01_thumb.webp", 640, 360, "Cyber Pulse Ep 1", (15, 65, 85), (5, 25, 45)),
        # Culinary
        ("culinary_poster.webp", 400, 600, "Culinary Code Poster", (70, 40, 20), (30, 15, 5)),
        ("culinary_banner.webp", 1280, 720, "Culinary Code Banner", (90, 50, 25), (35, 20, 10)),
        ("culinary_thumb.webp", 640, 360, "Culinary Code Ep 1", (80, 45, 20), (30, 18, 8)),
        # Midnight
        ("midnight_poster.webp", 400, 600, "Midnight Cafe Poster", (20, 40, 50), (5, 15, 25)),
        ("midnight_banner.webp", 1280, 720, "Midnight Cafe Banner", (25, 55, 65), (8, 20, 30)),
        ("midnight_thumb.webp", 640, 360, "Midnight Cafe Ep 1", (20, 45, 55), (6, 18, 28)),
    ]

    for filename, w, h, title, c1, c2 in items:
        generate_placeholder_image(artworks_dir / filename, w, h, title, c1, c2)


def seed():
    print("🌱 Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    storage_path = Path(settings.STORAGE_LOCAL_PATH).resolve()
    print(f"🖼️ Generating demo artwork assets in {storage_path}...")
    generate_seed_artworks(storage_path)

    db = SessionLocal()
    try:
        # 1. Seed Users from reference.json
        ref_file = CURRENT_DIR / "reference.json"
        if ref_file.exists():
            with open(ref_file, "r", encoding="utf-8") as f:
                ref_data = json.load(f)
            for user_info in ref_data.get("users", []):
                existing_user = db.query(User).filter(User.email == user_info["email"]).first()
                if not existing_user:
                    user = User(
                        email=user_info["email"],
                        hashed_password=hash_password(user_info["password"]),
                        role=user_info["role"]
                    )
                    db.add(user)
                    print(f"  + Added user: {user.email} ({user.role})")
                else:
                    print(f"  = User already exists: {existing_user.email}")
            db.commit()

        # 2. Seed Shows from seed_shows.json
        shows_file = CURRENT_DIR / "seed_shows.json"
        if shows_file.exists():
            with open(shows_file, "r", encoding="utf-8") as f:
                shows_data = json.load(f)

            for show_item in shows_data:
                show = db.query(Show).filter(Show.title == show_item["title"]).first()
                if not show:
                    show = Show(
                        title=show_item["title"],
                        description=show_item.get("description"),
                        section=show_item.get("section"),
                        category=show_item.get("category"),
                        status=show_item.get("status", "draft")
                    )
                    db.add(show)
                    db.flush()
                    print(f"  + Added show: {show.title} [{show.status}]")
                else:
                    show.description = show_item.get("description")
                    show.section = show_item.get("section")
                    show.category = show_item.get("category")
                    show.status = show_item.get("status", "draft")
                    print(f"  = Updated show: {show.title}")

                for s_item in show_item.get("seasons", []):
                    season = db.query(Season).filter(
                        Season.show_id == show.id,
                        Season.season_number == s_item["season_number"]
                    ).first()
                    if not season:
                        season = Season(
                            show_id=show.id,
                            season_number=s_item["season_number"],
                            title=s_item.get("title")
                        )
                        db.add(season)
                        db.flush()
                        print(f"    + Added season {season.season_number} to {show.title}")

                    for ep_item in s_item.get("episodes", []):
                        episode = db.query(Episode).filter(
                            Episode.content_group == ep_item["content_group"],
                            Episode.language == ep_item["language"]
                        ).first()

                        if not episode:
                            episode = Episode(
                                season_id=season.id,
                                title=ep_item["title"],
                                description=ep_item.get("description"),
                                episode_number=ep_item.get("episode_number", 1),
                                content_group=ep_item["content_group"],
                                language=ep_item["language"],
                                duration_seconds=ep_item.get("duration_seconds", 0),
                                status=ep_item.get("status", "draft"),
                                video_url=ep_item.get("video_url")
                            )
                            db.add(episode)
                            db.flush()
                            print(f"      + Added episode: {episode.title} ({episode.language})")
                        else:
                            episode.season_id = season.id
                            episode.title = ep_item["title"]
                            episode.description = ep_item.get("description")
                            episode.duration_seconds = ep_item.get("duration_seconds", 0)
                            episode.status = ep_item.get("status", "draft")
                            episode.video_url = ep_item.get("video_url")

                        for art_item in ep_item.get("artwork", []):
                            art = db.query(Artwork).filter(
                                Artwork.episode_id == episode.id,
                                Artwork.type == art_item["type"]
                            ).first()
                            if not art:
                                art = Artwork(
                                    episode_id=episode.id,
                                    type=art_item["type"],
                                    url=art_item["url"],
                                    width=art_item["width"],
                                    height=art_item["height"],
                                    file_size_bytes=art_item.get("file_size_bytes", 0)
                                )
                                db.add(art)

            db.commit()
            print("✅ Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
