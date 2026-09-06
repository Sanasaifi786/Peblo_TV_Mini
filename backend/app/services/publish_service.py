import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Show, Season, Episode, Artwork, PublishRun, User
from app.services.storage import get_storage_service
from app.services.validation_service import ValidationService


class PublishService:
    @staticmethod
    def publish_catalogue(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Builds catalogue.json atomically and saves it to storage.
        - Only published shows and published episodes are included.
        - Episodes with the same content_group are collapsed into a single entry with languages list.
        - Season 0 episodes are surfaced separately as trailers.
        - Records a PublishRun entry.
        """
        started_at = datetime.now(timezone.utc)
        storage = get_storage_service()

        # Step 1: Pre-publish validation check
        report = ValidationService.validate_for_publish(db)
        if not report.can_publish:
            # Record failed run
            failed_run = PublishRun(
                triggered_by=user_id,
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
                outcome="failed",
                show_count=0,
                episode_count=0,
                error_message=f"Validation failed: {report.blocking_errors} blocking issues present."
            )
            db.add(failed_run)
            db.commit()
            return {
                "success": False,
                "publish_run_id": failed_run.id,
                "error": "Cannot publish: blocking validation issues exist.",
                "blocking_errors": report.blocking_errors,
                "report": report.model_dump() if hasattr(report, "model_dump") else report.dict()
            }

        try:
            # Step 2: Query only published shows
            published_shows = (
                db.query(Show)
                .filter(Show.status == "published")
                .order_by(Show.id)
                .all()
            )

            catalogue_shows = []
            total_episodes_included = 0
            unique_sections = set()
            unique_categories = set()
            unique_languages = set()

            for show in published_shows:
                if show.section:
                    unique_sections.add(show.section)
                if show.category:
                    unique_categories.add(show.category)

                show_languages = set()
                show_poster_url = None
                show_banner_url = None
                seasons_dto = []
                trailers_dto = []

                # Look for seasons ordered by season_number
                for season in show.seasons:
                    published_episodes = [
                        ep for ep in season.episodes
                        if ep.status == "published"
                    ]
                    if not published_episodes:
                        continue

                    # Group episodes by content_group
                    grouped_episodes: Dict[str, List[Episode]] = {}
                    for ep in published_episodes:
                        grouped_episodes.setdefault(ep.content_group, []).append(ep)

                    collapsed_episodes_list = []
                    for content_group, ep_list in grouped_episodes.items():
                        total_episodes_included += len(ep_list)

                        # Sort variants so 'en' or first is default
                        ep_list.sort(key=lambda x: (x.language != "en", x.language))
                        canonical_ep = ep_list[0]

                        ep_languages = [e.language for e in ep_list]
                        for lang in ep_languages:
                            show_languages.add(lang)
                            unique_languages.add(lang)

                        # Gather artwork mapping
                        art_map = {}
                        for ep in ep_list:
                            for art in ep.artwork:
                                if art.type not in art_map:
                                    art_map[art.type] = art.url
                                # Capture show-level artwork if missing
                                if art.type == "poster" and not show_poster_url:
                                    show_poster_url = art.url
                                if art.type == "banner" and not show_banner_url:
                                    show_banner_url = art.url

                        # Variants list
                        variants = []
                        for ep in ep_list:
                            variants.append({
                                "language": ep.language,
                                "title": ep.title,
                                "description": ep.description,
                                "video_url": ep.video_url,
                                "artwork": [
                                    {
                                        "type": a.type,
                                        "url": a.url,
                                        "width": a.width,
                                        "height": a.height
                                    } for a in ep.artwork
                                ]
                            })

                        collapsed = {
                            "content_group": content_group,
                            "episode_number": canonical_ep.episode_number,
                            "title": canonical_ep.title,
                            "description": canonical_ep.description,
                            "duration_seconds": canonical_ep.duration_seconds,
                            "languages": ep_languages,
                            "default_language": canonical_ep.language,
                            "artwork": art_map,
                            "variants": variants
                        }
                        collapsed_episodes_list.append(collapsed)

                    # Sort episodes by episode_number
                    collapsed_episodes_list.sort(key=lambda x: x["episode_number"])

                    if season.season_number == 0:
                        # Season 0 surfaces as trailers
                        trailers_dto.extend(collapsed_episodes_list)
                    else:
                        seasons_dto.append({
                            "season_number": season.season_number,
                            "title": season.title or f"Season {season.season_number}",
                            "episodes": collapsed_episodes_list
                        })

                # Sort seasons by season_number
                seasons_dto.sort(key=lambda x: x["season_number"])

                show_data = {
                    "id": show.id,
                    "title": show.title,
                    "description": show.description,
                    "section": show.section,
                    "category": show.category,
                    "poster_url": show_poster_url,
                    "banner_url": show_banner_url,
                    "available_languages": sorted(list(show_languages)),
                    "seasons": seasons_dto,
                    "trailers": trailers_dto
                }
                catalogue_shows.append(show_data)

            # Step 3: Build catalogue.json payload
            catalogue_payload = {
                "version": "1.0",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "sections": sorted(list(unique_sections)),
                "categories": sorted(list(unique_categories)),
                "languages": sorted(list(unique_languages)),
                "shows": catalogue_shows
            }

            catalogue_json_str = json.dumps(catalogue_payload, indent=2, ensure_ascii=False)

            # Step 4: Write atomically via storage engine
            published_url = storage.atomic_write(catalogue_json_str, "catalogue.json")

            # Step 5: Record successful publish run
            finished_at = datetime.now(timezone.utc)
            publish_run = PublishRun(
                triggered_by=user_id,
                started_at=started_at,
                finished_at=finished_at,
                outcome="success",
                show_count=len(catalogue_shows),
                episode_count=total_episodes_included,
                error_message=None
            )
            db.add(publish_run)
            db.commit()

            return {
                "success": True,
                "publish_run_id": publish_run.id,
                "url": published_url,
                "show_count": len(catalogue_shows),
                "episode_count": total_episodes_included,
                "started_at": started_at.isoformat(),
                "finished_at": finished_at.isoformat()
            }

        except Exception as e:
            db.rollback()
            # Record failure
            failed_run = PublishRun(
                triggered_by=user_id,
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
                outcome="failed",
                show_count=0,
                episode_count=0,
                error_message=str(e)
            )
            db.add(failed_run)
            db.commit()
            return {
                "success": False,
                "publish_run_id": failed_run.id,
                "error": str(e)
            }
