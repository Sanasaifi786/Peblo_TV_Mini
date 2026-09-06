from typing import List, Dict
from sqlalchemy.orm import Session
from app.models import Show, Season, Episode, Artwork
from app.schemas.validation import ValidationIssue, ValidationReportResponse


class ValidationService:
    @staticmethod
    def validate_for_publish(db: Session) -> ValidationReportResponse:
        """
        Inspects all shows, seasons, and episodes to detect anything blocking publication.
        Enforces:
        - A published show must have a section.
        - A published episode must have duration_seconds > 0.
        - A published episode must have artwork attached.
        - Shows intended for publish should have at least one valid episode.
        """
        issues: List[ValidationIssue] = []

        shows = db.query(Show).all()
        for show in shows:
            # Check show section
            if not show.section or not show.section.strip():
                severity = "error" if show.status == "published" else "warning"
                issues.append(
                    ValidationIssue(
                        issue_type="missing_section",
                        severity=severity,
                        entity_type="show",
                        entity_id=show.id,
                        entity_title=show.title,
                        show_id=show.id,
                        show_title=show.title,
                        message=f"Show '{show.title}' has no section assigned (e.g. 'Trending Now', 'Peblo Originals')."
                    )
                )

            # Check if published show has any published episodes
            total_published_episodes = 0
            for season in show.seasons:
                for ep in season.episodes:
                    if ep.status == "published":
                        total_published_episodes += 1

            if show.status == "published" and total_published_episodes == 0:
                issues.append(
                    ValidationIssue(
                        issue_type="no_published_episodes",
                        severity="error",
                        entity_type="show",
                        entity_id=show.id,
                        entity_title=show.title,
                        show_id=show.id,
                        show_title=show.title,
                        message=f"Show '{show.title}' is marked published but contains 0 published episodes."
                    )
                )

            # Check episodes
            for season in show.seasons:
                for ep in season.episodes:
                    # Check duration
                    if ep.duration_seconds <= 0:
                        severity = "error" if ep.status == "published" else "warning"
                        issues.append(
                            ValidationIssue(
                                issue_type="missing_duration",
                                severity=severity,
                                entity_type="episode",
                                entity_id=ep.id,
                                entity_title=ep.title,
                                show_id=show.id,
                                show_title=show.title,
                                message=f"Episode '{ep.title}' has duration of 0 seconds. Duration is required to publish."
                            )
                        )

                    # Check artwork
                    if len(ep.artwork) == 0:
                        severity = "error" if ep.status == "published" else "warning"
                        issues.append(
                            ValidationIssue(
                                issue_type="missing_artwork",
                                severity=severity,
                                entity_type="episode",
                                entity_id=ep.id,
                                entity_title=ep.title,
                                show_id=show.id,
                                show_title=show.title,
                                message=f"Episode '{ep.title}' has no artwork uploaded. Artwork is required to publish."
                            )
                        )

        blocking_errors = [i for i in issues if i.severity == "error"]
        warnings = [i for i in issues if i.severity == "warning"]

        # Group by issue_type
        grouped: Dict[str, List[ValidationIssue]] = {}
        for issue in issues:
            grouped.setdefault(issue.issue_type, []).append(issue)

        return ValidationReportResponse(
            can_publish=len(blocking_errors) == 0,
            total_issues=len(issues),
            blocking_errors=len(blocking_errors),
            warnings=len(warnings),
            grouped_issues=grouped,
            items=issues
        )

    @staticmethod
    def validate_episode_can_publish(episode: Episode) -> List[str]:
        """Validate if a single episode can transition to 'published'."""
        errors = []
        if episode.duration_seconds <= 0:
            errors.append("Duration must be greater than 0 seconds.")
        if not episode.artwork or len(episode.artwork) == 0:
            errors.append("At least one artwork (thumbnail, poster, or banner) is required.")
        return errors

    @staticmethod
    def validate_show_can_publish(show: Show) -> List[str]:
        """Validate if a single show can transition to 'published'."""
        errors = []
        if not show.section or not show.section.strip():
            errors.append("Show section is required to publish.")
        return errors
