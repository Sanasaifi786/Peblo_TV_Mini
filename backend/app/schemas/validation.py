from typing import List, Dict, Optional
from pydantic import BaseModel


class ValidationIssue(BaseModel):
    issue_type: str
    severity: str  # "error" (blocks publish) or "warning"
    entity_type: str  # "show" or "episode"
    entity_id: int
    entity_title: str
    show_id: Optional[int] = None
    show_title: Optional[str] = None
    message: str


class ValidationReportResponse(BaseModel):
    can_publish: bool
    total_issues: int
    blocking_errors: int
    warnings: int
    grouped_issues: Dict[str, List[ValidationIssue]]
    items: List[ValidationIssue]
