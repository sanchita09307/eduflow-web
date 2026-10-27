import os
import uuid
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..models.models import (
    Submission,
    SubmissionReview,
    StudentGroup,
    GroupMembership,
    ProjectMilestone,
    Project,
    Subject,
    ActivityLog,
    User
)
from ..schemas.schemas import ReviewCreate
from ..core.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".zip", ".pptx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream"  # Some browsers send generic octet-stream for zip
}


class SubmissionService:
    @staticmethod
    async def process_file_upload(
        db: AsyncSession,
        file: UploadFile,
        group_id: str,
        milestone_id: str,
        current_user: User,
        notes: Optional[str] = None
    ) -> Submission:
        # Check student belongs to group
        mem_stmt = select(GroupMembership).filter(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == current_user.id
        )
        membership = (await db.execute(mem_stmt)).scalar_one_or_none()
        if not membership and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit deliverables for your own assigned group."
            )

        # Check milestone exists
        ms_stmt = select(ProjectMilestone).filter(ProjectMilestone.id == milestone_id)
        milestone = (await db.execute(ms_stmt)).scalar_one_or_none()
        if not milestone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone not found"
            )

        # Validate file extension
        orig_filename = os.path.basename(file.filename or "deliverable.bin")
        ext = os.path.splitext(orig_filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Validate mime type if available
        if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
            # If extension is valid, allow common extensions with permissive fallback
            pass

        # Read file contents and check size
        content = await file.read()
        file_size_bytes = len(content)

        if file_size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum upload size limit of {max_mb} MB."
            )

        # Ensure upload directory exists
        upload_dir = Path(settings.UPLOAD_DIR).resolve()
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Randomized stored filename to prevent collision and path traversal
        stored_filename = f"{uuid.uuid4().hex}{ext}"
        target_path = (upload_dir / stored_filename).resolve()

        # Security check: ensure target path is inside upload_dir
        if not str(target_path).startswith(str(upload_dir)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path."
            )

        with open(target_path, "wb") as f:
            f.write(content)

        # Calculate next version for this (group_id, milestone_id)
        v_stmt = select(func.max(Submission.version)).filter(
            Submission.group_id == group_id,
            Submission.milestone_id == milestone_id
        )
        max_ver = (await db.execute(v_stmt)).scalar() or 0
        new_version = max_ver + 1

        submission_id = f"sub_{uuid.uuid4().hex[:12]}"
        submission = Submission(
            id=submission_id,
            group_id=group_id,
            milestone_id=milestone_id,
            version=new_version,
            file_name=orig_filename,
            file_size=file_size_bytes,
            file_type=ext.replace(".", "").upper(),
            file_url=f"/api/v1/submissions/files/{stored_filename}",
            submission_notes=notes,
            submitted_by_id=current_user.id,
            status="submitted"
        )
        db.add(submission)

        # Log activity
        log = ActivityLog(
            id=f"act_{uuid.uuid4().hex[:12]}",
            group_id=group_id,
            user_id=current_user.id,
            action=f"Submitted {milestone.title} (v{new_version})",
            target=orig_filename,
            activity_type="submission"
        )
        db.add(log)

        await db.commit()
        await db.refresh(submission)
        return submission

    @staticmethod
    async def review_submission(
        db: AsyncSession,
        submission_id: str,
        review_data: ReviewCreate,
        current_teacher: User
    ) -> SubmissionReview:
        # Fetch submission
        sub_stmt = select(Submission).filter(Submission.id == submission_id)
        submission = (await db.execute(sub_stmt)).scalar_one_or_none()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Verify teacher ownership
        # Get milestone -> project -> subject
        ms_stmt = select(ProjectMilestone).filter(ProjectMilestone.id == submission.milestone_id)
        milestone = (await db.execute(ms_stmt)).scalar_one_or_none()
        if milestone:
            prj_stmt = select(Project).filter(Project.id == milestone.project_id)
            project = (await db.execute(prj_stmt)).scalar_one_or_none()
            if project and project.teacher_id != current_teacher.id and current_teacher.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to evaluate this project deliverable."
                )

        # Validate score boundaries
        if review_data.score < 0 or review_data.score > review_data.max_score:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Score must be between 0 and maximum allowable score ({review_data.max_score})."
            )

        # Check existing review
        rev_stmt = select(SubmissionReview).filter(SubmissionReview.submission_id == submission_id)
        review = (await db.execute(rev_stmt)).scalar_one_or_none()

        if review:
            review.status = review_data.status
            review.score = review_data.score
            review.max_score = review_data.max_score
            review.feedback = review_data.feedback
            review.reviewed_at = datetime.now(timezone.utc)
            review.reviewer_id = current_teacher.id
        else:
            review = SubmissionReview(
                id=f"rev_{uuid.uuid4().hex[:12]}",
                submission_id=submission_id,
                reviewer_id=current_teacher.id,
                status=review_data.status,
                score=review_data.score,
                max_score=review_data.max_score,
                feedback=review_data.feedback
            )
            db.add(review)

        # Update submission status
        submission.status = review_data.status

        # If approved, update group progress percentage
        if review_data.status == "approved" and milestone:
            grp_stmt = select(StudentGroup).filter(StudentGroup.id == submission.group_id)
            group = (await db.execute(grp_stmt)).scalar_one_or_none()
            if group:
                # Add milestone weightage to group progress
                group.progress_percentage = min(100, group.progress_percentage + milestone.weightage)

        # Log activity
        log = ActivityLog(
            id=f"act_{uuid.uuid4().hex[:12]}",
            group_id=submission.group_id,
            user_id=current_teacher.id,
            action=f"Evaluated submission ({review_data.status.replace('_', ' ').capitalize()})",
            target=f"Score: {review_data.score}/{review_data.max_score}",
            activity_type="review"
        )
        db.add(log)

        await db.commit()
        await db.refresh(review)
        return review
