import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.permissions import get_current_user, require_teacher
from ...models.models import StudentGroup, GroupMembership, Subject, User
from ...schemas.schemas import StudentGroupCreate, StudentGroupResponse

router = APIRouter(prefix="/groups", tags=["Student Groups"])


@router.get("", response_model=List[StudentGroupResponse])
async def list_groups(
    subject_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentGroup)
        .options(
            selectinload(StudentGroup.leader),
            selectinload(StudentGroup.memberships).selectinload(GroupMembership.user)
        )
    )

    if subject_id:
        stmt = stmt.filter(StudentGroup.subject_id == subject_id)
    if project_id:
        stmt = stmt.filter(StudentGroup.project_id == project_id)

    if current_user.role == "teacher":
        stmt = stmt.join(Subject, Subject.id == StudentGroup.subject_id).filter(Subject.teacher_id == current_user.id)
    elif current_user.role == "student":
        # Students only see their own group
        stmt = (
            stmt.join(GroupMembership, GroupMembership.group_id == StudentGroup.id)
            .filter(GroupMembership.user_id == current_user.id)
        )

    groups = (await db.execute(stmt.order_by(StudentGroup.name.asc()))).scalars().all()
    return groups


@router.get("/{group_id}", response_model=StudentGroupResponse)
async def get_group(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentGroup)
        .filter(StudentGroup.id == group_id)
        .options(
            selectinload(StudentGroup.leader),
            selectinload(StudentGroup.memberships).selectinload(GroupMembership.user)
        )
    )
    group = (await db.execute(stmt)).scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    if current_user.role == "teacher":
        subj = (await db.execute(select(Subject).filter(Subject.id == group.subject_id))).scalar_one_or_none()
        if not subj or (subj.teacher_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "student":
        mem = (await db.execute(
            select(GroupMembership).filter(
                GroupMembership.group_id == group_id,
                GroupMembership.user_id == current_user.id
            )
        )).scalar_one_or_none()
        if not mem:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this group")

    return group


@router.post("", response_model=StudentGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    req: StudentGroupCreate,
    current_teacher: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    # Verify subject belongs to teacher
    subj = (await db.execute(select(Subject).filter(Subject.id == req.subject_id))).scalar_one_or_none()
    if not subj or (subj.teacher_id != current_teacher.id and current_teacher.role != "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid subject")

    group_id = f"grp_{uuid.uuid4().hex[:12]}"
    group = StudentGroup(
        id=group_id,
        subject_id=req.subject_id,
        project_id=req.project_id,
        name=req.name.strip(),
        leader_id=req.leader_id,
        progress_percentage=0,
        github_url=req.github_url,
        live_demo_url=req.live_demo_url
    )
    db.add(group)

    # Add leader membership
    leader_mem = GroupMembership(
        id=f"mem_{uuid.uuid4().hex[:12]}",
        group_id=group_id,
        user_id=req.leader_id,
        role_in_group="leader"
    )
    db.add(leader_mem)

    # Add other members
    for uid in (req.member_ids or []):
        if uid != req.leader_id:
            db.add(GroupMembership(
                id=f"mem_{uuid.uuid4().hex[:12]}",
                group_id=group_id,
                user_id=uid,
                role_in_group="member"
            ))

    await db.commit()

    # Reload group
    stmt = (
        select(StudentGroup)
        .filter(StudentGroup.id == group_id)
        .options(
            selectinload(StudentGroup.leader),
            selectinload(StudentGroup.memberships).selectinload(GroupMembership.user)
        )
    )
    res = (await db.execute(stmt)).scalar_one()
    return res
