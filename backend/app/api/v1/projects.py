from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ...core.database import get_db
from ...core.permissions import get_current_user, require_teacher
from ...models.models import Project, Subject, StudentGroup, GroupMembership, User
from ...schemas.schemas import ProjectCreate, ProjectResponse
from ...services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    subject_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Project).options(selectinload(Project.milestones))

    if subject_id:
        stmt = stmt.filter(Project.subject_id == subject_id)

    if current_user.role == "teacher":
        stmt = stmt.join(Subject, Subject.id == Project.subject_id).filter(Subject.teacher_id == current_user.id)
    elif current_user.role == "student":
        # Get projects assigned to student's groups
        grp_proj_stmt = (
            select(StudentGroup.project_id)
            .join(GroupMembership, GroupMembership.group_id == StudentGroup.id)
            .filter(GroupMembership.user_id == current_user.id)
        )
        proj_ids = [pid for pid in (await db.execute(grp_proj_stmt)).scalars().all() if pid]
        if proj_ids:
            stmt = stmt.filter(Project.id.in_(proj_ids))

    projects = (await db.execute(stmt.order_by(Project.created_at.desc()))).scalars().all()
    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    req: ProjectCreate,
    current_teacher: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    project = await ProjectService.create_project(db, req, current_teacher)
    # Eager reload with milestones
    stmt = (
        select(Project)
        .filter(Project.id == project.id)
        .options(selectinload(Project.milestones))
    )
    result = (await db.execute(stmt)).scalar_one()
    return result
