from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.permissions import require_teacher
from ...models.models import SubmissionReview, User
from ...schemas.schemas import ReviewCreate, ReviewResponse
from ...services.submission_service import SubmissionService

router = APIRouter(tags=["Reviews"])


@router.post("/submissions/{submission_id}/review", response_model=ReviewResponse)
async def review_submission_endpoint(
    submission_id: str,
    req: ReviewCreate,
    current_teacher: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    if req.submission_id != submission_id:
        req.submission_id = submission_id

    review = await SubmissionService.review_submission(
        db=db,
        submission_id=submission_id,
        review_data=req,
        current_teacher=current_teacher
    )

    # Reload with reviewer details
    stmt = (
        select(SubmissionReview)
        .filter(SubmissionReview.id == review.id)
        .options(selectinload(SubmissionReview.reviewer))
    )
    return (await db.execute(stmt)).scalar_one()
