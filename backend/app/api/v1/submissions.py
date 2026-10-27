import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.config import settings
from ...core.database import get_db
from ...core.permissions import get_current_user, require_student
from ...models.models import Submission, SubmissionReview, StudentGroup, GroupMembership, Subject, Project, ProjectMilestone, User
from ...schemas.schemas import SubmissionResponse
from ...services.submission_service import SubmissionService

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.get("", response_model=List[SubmissionResponse])
async def list_submissions(
    group_id: Optional[str] = Query(None),
    milestone_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Submission)
        .options(
            selectinload(Submission.review).selectinload(SubmissionReview.reviewer),
            selectinload(Submission.submitter)
        )
    )

    if group_id:
        if current_user.role == "student":
            mem = (await db.execute(
                select(GroupMembership).filter(
                    GroupMembership.group_id == group_id,
                    GroupMembership.user_id == current_user.id
                )
            )).scalar_one_or_none()
            if not mem:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        stmt = stmt.filter(Submission.group_id == group_id)
    else:
        if current_user.role == "student":
            grp_stmt = select(GroupMembership.group_id).filter(GroupMembership.user_id == current_user.id)
            group_ids = (await db.execute(grp_stmt)).scalars().all()
            stmt = stmt.filter(Submission.group_id.in_(group_ids))
        elif current_user.role == "teacher":
            subj_stmt = select(Subject.id).filter(Subject.teacher_id == current_user.id)
            subj_ids = (await db.execute(subj_stmt)).scalars().all()
            grp_stmt = select(StudentGroup.id).filter(StudentGroup.subject_id.in_(subj_ids))
            group_ids = (await db.execute(grp_stmt)).scalars().all()
            stmt = stmt.filter(Submission.group_id.in_(group_ids))

    if milestone_id:
        stmt = stmt.filter(Submission.milestone_id == milestone_id)

    submissions = (await db.execute(stmt.order_by(Submission.submitted_at.desc()))).scalars().all()
    return submissions


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(
    group_id: str = Form(...),
    milestone_id: str = Form(...),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_student: User = Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    submission = await SubmissionService.process_file_upload(
        db=db,
        file=file,
        group_id=group_id,
        milestone_id=milestone_id,
        current_user=current_student,
        notes=notes
    )

    # Reload with submitter and review
    stmt = (
        select(Submission)
        .filter(Submission.id == submission.id)
        .options(
            selectinload(Submission.review).selectinload(SubmissionReview.reviewer),
            selectinload(Submission.submitter)
        )
    )
    return (await db.execute(stmt)).scalar_one()


@router.get("/files/{filename}")
async def download_submission_file(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    upload_dir = Path(settings.UPLOAD_DIR).resolve()
    file_path = (upload_dir / filename).resolve()

    # Safety check: prevent path traversal
    if not str(file_path).startswith(str(upload_dir)) or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=str(file_path))
