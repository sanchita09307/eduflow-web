import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.permissions import get_current_user, require_teacher
from ...models.models import Subject, SubjectEnrollment, StudentGroup, GroupMembership, User
from ...schemas.schemas import SubjectCreate, SubjectResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("", response_model=List[SubjectResponse])
async def list_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "teacher":
        stmt = (
            select(Subject)
            .filter(Subject.teacher_id == current_user.id)
            .options(selectinload(Subject.teacher))
            .order_by(Subject.created_at.desc())
        )
    elif current_user.role == "admin":
        stmt = select(Subject).options(selectinload(Subject.teacher)).order_by(Subject.created_at.desc())
    else:
        # Student: find enrolled subjects or subjects of groups the student is part of
        enrolled_stmt = select(SubjectEnrollment.subject_id).filter(SubjectEnrollment.user_id == current_user.id)
        enrolled_ids = (await db.execute(enrolled_stmt)).scalars().all()

        grp_subjs_stmt = (
            select(StudentGroup.subject_id)
            .join(GroupMembership, GroupMembership.group_id == StudentGroup.id)
            .filter(GroupMembership.user_id == current_user.id)
        )
        grp_subj_ids = (await db.execute(grp_subjs_stmt)).scalars().all()

        all_ids = set(enrolled_ids).union(set(grp_subj_ids))
        if not all_ids:
            # Fallback for demo student without enrollments: return active semester subjects
            stmt = select(Subject).options(selectinload(Subject.teacher)).order_by(Subject.created_at.desc())
        else:
            stmt = (
                select(Subject)
                .filter(Subject.id.in_(all_ids))
                .options(selectinload(Subject.teacher))
                .order_by(Subject.created_at.desc())
            )

    subjects = (await db.execute(stmt)).scalars().all()
    return subjects


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    req: SubjectCreate,
    current_teacher: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    # Check if subject code already exists in department/semester
    chk_stmt = select(Subject).filter(
        Subject.code == req.code.strip().upper(),
        Subject.department == req.department.strip()
    )
    existing = (await db.execute(chk_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subject code '{req.code}' already exists for department {req.department}."
        )

    subject = Subject(
        id=f"sbj_{uuid.uuid4().hex[:12]}",
        code=req.code.strip().upper(),
        name=req.name.strip(),
        semester=req.semester.strip(),
        department=req.department.strip(),
        academic_year=req.academic_year.strip(),
        description=req.description,
        teacher_id=current_teacher.id
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject
